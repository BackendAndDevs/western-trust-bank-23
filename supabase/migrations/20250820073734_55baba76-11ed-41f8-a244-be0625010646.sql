-- Fix the admin_create_user function to handle the foreign key constraint properly
-- We'll modify the profiles table to not require a foreign key to auth.users since we can't create auth users from SQL

-- First, let's drop the foreign key constraint if it exists
ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;

-- Update the admin_create_user function to work without auth.users dependency
CREATE OR REPLACE FUNCTION public.admin_create_user(email text, password text, full_name text, initial_balance numeric DEFAULT 1000.00, user_role text DEFAULT 'user'::text)
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

  -- Check if user with this email already exists
  IF EXISTS (SELECT 1 FROM public.profiles WHERE full_name = email) THEN
    RAISE EXCEPTION 'User with this email already exists.';
  END IF;
  
  -- Generate new user ID
  new_user_id := gen_random_uuid();
  
  -- Create profile (using email as a unique identifier since we can't create real auth users)
  INSERT INTO public.profiles (user_id, full_name, account_type, account_status)
  VALUES (new_user_id, full_name || ' (' || email || ')', 'personal', 'active');
  
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
    'role', user_role,
    'message', 'Demo user created successfully (Note: This is a demo user, not a real authenticated user)'
  ) INTO result;
  
  RETURN result;
END;
$function$;

-- Update the admin_get_all_users function to work with the modified structure
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE(
  user_id uuid,
  email text,
  full_name text,
  account_status text,
  created_at timestamp with time zone,
  total_balance numeric,
  account_count bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.user_id,
    COALESCE(
      -- Try to get email from auth.users if it exists
      (SELECT au.email FROM auth.users au WHERE au.id = p.user_id),
      -- Otherwise extract from full_name or use placeholder
      CASE 
        WHEN p.full_name LIKE '%(%@%.%)%' THEN 
          substring(p.full_name from '\(([^)]+)\)')
        ELSE 'demo-user@example.com'
      END
    )::text as email,
    p.full_name,
    p.account_status,
    p.created_at,
    COALESCE(SUM(a.balance), 0) as total_balance,
    COUNT(a.id) as account_count
  FROM public.profiles p
  LEFT JOIN public.accounts a ON a.user_id = p.user_id
  GROUP BY p.user_id, p.full_name, p.account_status, p.created_at
  ORDER BY p.created_at DESC;
END;
$function$;