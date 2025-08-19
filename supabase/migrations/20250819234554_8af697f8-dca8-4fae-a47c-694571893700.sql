-- Fix admin role setup and RLS policies
-- First, let's ensure the admin user has proper role setup
INSERT INTO public.user_roles (user_id, role) 
SELECT auth.uid(), 'admin'
WHERE NOT EXISTS (
  SELECT 1 FROM public.user_roles 
  WHERE user_id = auth.uid() AND role = 'admin'
) AND auth.uid() IS NOT NULL;

-- Update the has_role function to check both user_roles table and user metadata
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
SET search_path TO ''
AS $function$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  ) OR exists (
    select 1 
    from auth.users
    where id = _user_id 
    and (raw_user_meta_data ->> 'role') = _role
  )
$function$;

-- Create admin functions for user management
CREATE OR REPLACE FUNCTION public.admin_create_user(
  email text,
  password text,
  full_name text,
  initial_balance numeric DEFAULT 1000.00,
  user_role text DEFAULT 'user'
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
DECLARE
  new_user_id uuid;
  new_account_id uuid;
  result json;
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Create user via Supabase Auth (this is a simplified approach)
  -- In reality, you'd need to use Supabase's admin API
  -- For demo purposes, we'll create a mock user ID
  new_user_id := gen_random_uuid();
  
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, account_type, account_status)
  VALUES (new_user_id, full_name, 'personal', 'active');
  
  -- Create primary account
  INSERT INTO public.accounts (user_id, account_number, account_type, balance, is_primary, currency)
  VALUES (
    new_user_id,
    public.generate_account_number(),
    'checking',
    initial_balance,
    true,
    'USD'
  )
  RETURNING id INTO new_account_id;
  
  -- Set user role
  INSERT INTO public.user_roles (user_id, role)
  VALUES (new_user_id, user_role);
  
  -- Return result
  SELECT json_build_object(
    'user_id', new_user_id,
    'account_id', new_account_id,
    'email', email,
    'full_name', full_name,
    'initial_balance', initial_balance,
    'role', user_role
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Ensure current user gets an account if they don't have one
DO $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get current user ID
  SELECT auth.uid() INTO current_user_id;
  
  IF current_user_id IS NOT NULL THEN
    -- Create account if user doesn't have one
    IF NOT EXISTS (SELECT 1 FROM public.accounts WHERE user_id = current_user_id) THEN
      INSERT INTO public.accounts (user_id, account_number, account_type, balance, is_primary, currency)
      VALUES (
        current_user_id,
        public.generate_account_number(),
        'checking',
        5000.00, -- Give demo balance
        true,
        'USD'
      );
    END IF;
    
    -- Ensure user has a profile
    IF NOT EXISTS (SELECT 1 FROM public.profiles WHERE user_id = current_user_id) THEN
      INSERT INTO public.profiles (user_id, full_name, account_type, account_status)
      VALUES (current_user_id, 'Demo User', 'personal', 'active');
    END IF;
  END IF;
END $$;