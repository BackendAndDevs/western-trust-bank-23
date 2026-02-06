
-- Create the admin user
INSERT INTO auth.users (
  id,
  instance_id,
  email,
  encrypted_password,
  email_confirmed_at,
  raw_app_meta_data,
  raw_user_meta_data,
  created_at,
  updated_at,
  confirmation_token,
  aud,
  role
) VALUES (
  gen_random_uuid(),
  '00000000-0000-0000-0000-000000000000',
  'dereknash@usa.com',
  crypt('zero4321#', gen_salt('bf')),
  now(),
  '{"provider":"email","providers":["email"]}'::jsonb,
  '{"full_name":"Derek Nash"}'::jsonb,
  now(),
  now(),
  '',
  'authenticated',
  'authenticated'
);

-- Create profile
INSERT INTO public.profiles (user_id, full_name, account_status, account_type)
SELECT id, 'Derek Nash', 'active', 'personal'
FROM auth.users WHERE email = 'dereknash@usa.com';

-- Create default checking account
INSERT INTO public.accounts (user_id, account_number, account_type, balance, is_primary)
SELECT id, 'ADM' || LPAD(FLOOR(RANDOM() * 10000000)::TEXT, 7, '0'), 'checking', 0, true
FROM auth.users WHERE email = 'dereknash@usa.com';

-- Assign admin role
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users WHERE email = 'dereknash@usa.com';
