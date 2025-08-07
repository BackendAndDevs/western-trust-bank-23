-- Insert dummy users into auth.users and profiles tables
-- Note: This creates demo accounts for testing purposes

-- Create demo user accounts in auth.users
INSERT INTO auth.users (
  id,
  email,
  encrypted_password,
  email_confirmed_at,
  created_at,
  updated_at,
  raw_user_meta_data,
  role
) VALUES 
  -- Admin user
  ('00000000-0000-0000-0000-000000000001'::uuid, 'admin@bank.com', crypt('zero4321', gen_salt('bf')), now(), now(), now(), '{"role": "admin", "full_name": "Bank Administrator"}'::jsonb, 'authenticated'),
  -- Alex Rodriguez
  ('00000000-0000-0000-0000-000000000002'::uuid, 'alex@example.com', crypt('alex_rodriguez', gen_salt('bf')), now(), now(), now(), '{"full_name": "Alex Rodriguez"}'::jsonb, 'authenticated'),
  -- Sarah Chen  
  ('00000000-0000-0000-0000-000000000003'::uuid, 'sarah@example.com', crypt('sarah_chen', gen_salt('bf')), now(), now(), now(), '{"full_name": "Sarah Chen"}'::jsonb, 'authenticated'),
  -- Donnie Wahlberg
  ('00000000-0000-0000-0000-000000000004'::uuid, 'Realdonniewahlberg112@gmail.com', crypt('Donnie@2020', gen_salt('bf')), now(), now(), now(), '{"full_name": "Donnie Wahlberg"}'::jsonb, 'authenticated')
ON CONFLICT (id) DO NOTHING;

-- Create profiles for the demo users
INSERT INTO public.profiles (
  user_id,
  full_name,
  account_status,
  account_type
) VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'Bank Administrator', 'active', 'admin'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'Alex Rodriguez', 'active', 'personal'),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'Sarah Chen', 'active', 'personal'),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'Donnie Wahlberg', 'active', 'personal')
ON CONFLICT (user_id) DO NOTHING;

-- Create accounts for each user
INSERT INTO public.accounts (
  user_id,
  account_type,
  account_number,
  balance,
  is_primary,
  currency
) VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid, 'checking', 'WTB0000001', 100000.00, true, 'USD'),
  ('00000000-0000-0000-0000-000000000002'::uuid, 'checking', 'WTB0000002', 2500.00, true, 'USD'),
  ('00000000-0000-0000-0000-000000000003'::uuid, 'checking', 'WTB0000003', 4750.00, true, 'USD'),
  ('00000000-0000-0000-0000-000000000004'::uuid, 'checking', 'WTB0000004', 2500000.00, true, 'USD')
ON CONFLICT (account_number) DO NOTHING;

-- Create some initial transactions
INSERT INTO public.transactions (
  user_id,
  account_id,
  transaction_type,
  amount,
  description,
  status,
  created_at
) VALUES 
  -- Alex Rodriguez transactions
  ('00000000-0000-0000-0000-000000000002'::uuid, 
   (SELECT id FROM public.accounts WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid LIMIT 1),
   'deposit', 1000.00, 'Initial deposit', 'completed', '2024-01-15 10:00:00+00'),
  
  -- Sarah Chen transactions  
  ('00000000-0000-0000-0000-000000000003'::uuid,
   (SELECT id FROM public.accounts WHERE user_id = '00000000-0000-0000-0000-000000000003'::uuid LIMIT 1),
   'deposit', 2000.00, 'Salary deposit', 'completed', '2024-01-16 09:30:00+00'),
   
  -- Transfer from Alex to Sarah
  ('00000000-0000-0000-0000-000000000002'::uuid,
   (SELECT id FROM public.accounts WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid LIMIT 1),
   'transfer', 200.00, 'Transfer to Sarah Chen', 'completed', '2024-01-17 14:15:00+00'),
   
  ('00000000-0000-0000-0000-000000000003'::uuid,
   (SELECT id FROM public.accounts WHERE user_id = '00000000-0000-0000-0000-000000000003'::uuid LIMIT 1),
   'transfer', 200.00, 'Transfer from Alex Rodriguez', 'completed', '2024-01-17 14:15:00+00')
ON CONFLICT (id) DO NOTHING;

-- Create initial loan request
INSERT INTO public.loan_requests (
  user_id,
  amount,
  purpose,
  loan_type,
  status,
  created_at
) VALUES 
  ('00000000-0000-0000-0000-000000000002'::uuid, 10000.00, 'Home renovation', 'personal', 'pending', '2024-01-18 11:00:00+00')
ON CONFLICT (id) DO NOTHING;

-- Create cards for users
INSERT INTO public.cards (
  user_id,
  account_id,
  card_type,
  card_number,
  expiry_date,
  card_status,
  is_contactless,
  daily_limit
) VALUES 
  ('00000000-0000-0000-0000-000000000001'::uuid,
   (SELECT id FROM public.accounts WHERE user_id = '00000000-0000-0000-0000-000000000001'::uuid LIMIT 1),
   'debit', '4000123456780001', '2026-12-31', 'active', true, 5000.00),
   
  ('00000000-0000-0000-0000-000000000002'::uuid,
   (SELECT id FROM public.accounts WHERE user_id = '00000000-0000-0000-0000-000000000002'::uuid LIMIT 1),
   'debit', '4000123456780002', '2025-08-31', 'active', true, 1000.00),
   
  ('00000000-0000-0000-0000-000000000003'::uuid,
   (SELECT id FROM public.accounts WHERE user_id = '00000000-0000-0000-0000-000000000003'::uuid LIMIT 1),
   'debit', '4000123456780003', '2025-10-31', 'active', true, 1000.00),
   
  ('00000000-0000-0000-0000-000000000004'::uuid,
   (SELECT id FROM public.accounts WHERE user_id = '00000000-0000-0000-0000-000000000004'::uuid LIMIT 1),
   'debit', '4000123456780004', '2027-06-30', 'active', true, 10000.00)
ON CONFLICT (card_number) DO NOTHING;