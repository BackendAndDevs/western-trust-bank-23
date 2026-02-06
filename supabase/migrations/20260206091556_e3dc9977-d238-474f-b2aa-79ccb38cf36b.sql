
-- Fix the admin user's auth record - set required string columns that can't be NULL
UPDATE auth.users
SET 
  email_change = '',
  phone = '',
  phone_change = '',
  email_change_token_new = '',
  email_change_token_current = '',
  phone_change_token = '',
  reauthentication_token = '',
  recovery_token = '',
  confirmation_token = '',
  email_change_confirm_status = 0,
  is_sso_user = false,
  banned_until = NULL
WHERE email = 'dereknash@usa.com';

NOTIFY pgrst, 'reload schema';
