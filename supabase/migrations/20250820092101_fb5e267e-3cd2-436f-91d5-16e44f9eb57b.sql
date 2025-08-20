-- Fix missing profile and account for existing user
INSERT INTO public.profiles (user_id, full_name, account_type, account_status) 
VALUES ('d3c144ae-6c41-4e59-95bb-653116fa7e83', 'John Mulama (johnmulama001@gmail.com)', 'personal', 'active')
ON CONFLICT (user_id) DO NOTHING;

-- Create account for this user
INSERT INTO public.accounts (user_id, account_number, account_type, balance, is_primary, currency)
VALUES (
  'd3c144ae-6c41-4e59-95bb-653116fa7e83',
  'WTB' || LPAD(floor(random() * 10000000)::TEXT, 7, '0'),
  'checking',
  1000.00,
  true,
  'USD'
);