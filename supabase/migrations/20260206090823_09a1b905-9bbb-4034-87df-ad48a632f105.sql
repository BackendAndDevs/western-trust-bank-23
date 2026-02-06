
-- Assign admin role (without ON CONFLICT since constraint uses enum type)
INSERT INTO public.user_roles (user_id, role)
SELECT id, 'admin'
FROM auth.users WHERE email = 'dereknash@usa.com';
