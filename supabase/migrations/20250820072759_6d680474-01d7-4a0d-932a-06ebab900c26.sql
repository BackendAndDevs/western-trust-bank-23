-- Set johnmulama001@gmail.com as admin
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users 
WHERE email = 'johnmulama001@gmail.com'
ON CONFLICT (user_id, role) DO NOTHING;

-- Update user metadata to include admin role
UPDATE auth.users 
SET raw_user_meta_data = COALESCE(raw_user_meta_data, '{}') || '{"role": "admin"}'::jsonb
WHERE email = 'johnmulama001@gmail.com';

-- Create admin function to delete users and accounts
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Delete user's transactions first (cascade should handle this, but being explicit)
  DELETE FROM public.transactions WHERE user_id = target_user_id;
  
  -- Delete user's loan requests
  DELETE FROM public.loan_requests WHERE user_id = target_user_id;
  
  -- Delete user's cards
  DELETE FROM public.cards WHERE user_id = target_user_id;
  
  -- Delete user's accounts
  DELETE FROM public.accounts WHERE user_id = target_user_id;
  
  -- Delete user's roles
  DELETE FROM public.user_roles WHERE user_id = target_user_id;
  
  -- Delete user's profile
  DELETE FROM public.profiles WHERE user_id = target_user_id;
END;
$function$;

-- Create function to get all users for admin
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
    au.email::text,
    p.full_name,
    p.account_status,
    p.created_at,
    COALESCE(SUM(a.balance), 0) as total_balance,
    COUNT(a.id) as account_count
  FROM public.profiles p
  LEFT JOIN auth.users au ON au.id = p.user_id
  LEFT JOIN public.accounts a ON a.user_id = p.user_id
  GROUP BY p.user_id, au.email, p.full_name, p.account_status, p.created_at
  ORDER BY p.created_at DESC;
END;
$function$;