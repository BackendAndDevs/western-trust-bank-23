-- Fix the ambiguous column reference in admin_create_user function
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
  full_name_with_email text;
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;

  -- Create the full name with email embedded
  full_name_with_email := full_name || ' (' || email || ')';

  -- Check if user with this name/email combination already exists
  IF EXISTS (SELECT 1 FROM public.profiles p WHERE p.full_name = full_name_with_email) THEN
    RAISE EXCEPTION 'User with this email already exists.';
  END IF;
  
  -- Generate new user ID
  new_user_id := gen_random_uuid();
  
  -- Create profile
  INSERT INTO public.profiles (user_id, full_name, account_type, account_status)
  VALUES (new_user_id, full_name_with_email, 'personal', 'active');
  
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
    'message', 'Demo user created successfully'
  ) INTO result;
  
  RETURN result;
END;
$function$;