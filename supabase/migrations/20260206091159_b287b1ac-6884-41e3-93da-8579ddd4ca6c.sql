
-- Add the missing identity record for the admin user
INSERT INTO auth.identities (
  id,
  user_id,
  identity_data,
  provider,
  provider_id,
  last_sign_in_at,
  created_at,
  updated_at
) VALUES (
  'aca0269d-165b-4d9b-9a6f-0074a9b9d623',
  'aca0269d-165b-4d9b-9a6f-0074a9b9d623',
  jsonb_build_object('sub', 'aca0269d-165b-4d9b-9a6f-0074a9b9d623', 'email', 'dereknash@usa.com', 'email_verified', true, 'phone_verified', false),
  'email',
  'aca0269d-165b-4d9b-9a6f-0074a9b9d623',
  now(),
  now(),
  now()
);
