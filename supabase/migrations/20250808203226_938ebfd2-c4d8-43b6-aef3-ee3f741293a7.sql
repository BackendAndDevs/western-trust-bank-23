-- 1) Roles system to avoid recursive/admin checks on profiles
DO $$ BEGIN
  -- Enum
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin','moderator','user');
  END IF;
END $$;

CREATE TABLE IF NOT EXISTS public.user_roles (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.app_role NOT NULL,
  UNIQUE (user_id, role)
);

ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Helper function to check roles (SECURITY DEFINER to avoid recursion)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role public.app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
AS $$
  select exists (
    select 1 from public.user_roles
    where user_id = _user_id and role = _role
  );
$$;

-- 2) Fix RLS policies to use has_role and avoid recursive/self-referencing logic
-- Drop existing admin policies (if any)
DO $$ BEGIN
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='profiles' AND policyname='Admins can view all profiles') THEN
    DROP POLICY "Admins can view all profiles" ON public.profiles;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='accounts' AND policyname='Admins can manage all accounts') THEN
    DROP POLICY "Admins can manage all accounts" ON public.accounts;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='loan_requests' AND policyname='Admins can manage all loan requests') THEN
    DROP POLICY "Admins can manage all loan requests" ON public.loan_requests;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='transactions' AND policyname='Admins can manage all transactions') THEN
    DROP POLICY "Admins can manage all transactions" ON public.transactions;
  END IF;
  IF EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='cards' AND policyname='Admins can view all cards') THEN
    DROP POLICY "Admins can view all cards" ON public.cards;
  END IF;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Recreate admin policies with has_role()
CREATE POLICY IF NOT EXISTS "Admins manage all profiles"
ON public.profiles FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins manage all accounts"
ON public.accounts FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins manage all transactions"
ON public.transactions FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins manage all loan requests"
ON public.loan_requests FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY IF NOT EXISTS "Admins manage all cards"
ON public.cards FOR ALL
USING (public.has_role(auth.uid(), 'admin'))
WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- 3) Drop FKs to auth.users to allow seeding without creating auth users
DO $$ BEGIN
  ALTER TABLE public.profiles      DROP CONSTRAINT IF EXISTS profiles_user_id_fkey;
  ALTER TABLE public.accounts      DROP CONSTRAINT IF EXISTS accounts_user_id_fkey;
  ALTER TABLE public.cards         DROP CONSTRAINT IF EXISTS cards_user_id_fkey;
  ALTER TABLE public.transactions  DROP CONSTRAINT IF EXISTS transactions_user_id_fkey;
  ALTER TABLE public.loan_requests DROP CONSTRAINT IF EXISTS loan_requests_user_id_fkey;
EXCEPTION WHEN undefined_object THEN NULL; END $$;

-- Optional: helpful indexes
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON public.profiles (user_id);
CREATE INDEX IF NOT EXISTS idx_accounts_user_id ON public.accounts (user_id);
CREATE INDEX IF NOT EXISTS idx_transactions_user_id ON public.transactions (user_id);
CREATE INDEX IF NOT EXISTS idx_cards_user_id ON public.cards (user_id);
CREATE INDEX IF NOT EXISTS idx_loan_requests_user_id ON public.loan_requests (user_id);

-- 4) Seed dummy data once
DO $$
DECLARE
  u1 uuid; u2 uuid; u3 uuid; u4 uuid;
  acc1 uuid; acc2 uuid; acc3 uuid; acc4 uuid;
BEGIN
  IF (SELECT COUNT(*) FROM public.accounts) = 0 THEN
    -- Create synthetic user ids (note: not linked to auth.users)
    u1 := gen_random_uuid(); u2 := gen_random_uuid(); u3 := gen_random_uuid(); u4 := gen_random_uuid();

    -- Seed profiles
    INSERT INTO public.profiles (user_id, full_name, account_type, phone_number, address)
    VALUES 
      (u1, 'Alex Rodriguez',  'personal', '555-1001', '123 Green St, Springfield'),
      (u2, 'Sarah Chen',      'personal', '555-1002', '456 Oak Ave, Springfield'),
      (u3, 'Priya Patel',     'personal', '555-1003', '789 Pine Rd, Springfield'),
      (u4, 'Michael Johnson', 'personal', '555-1004', '321 Maple Ln, Springfield');

    -- Accounts
    INSERT INTO public.accounts (user_id, account_type, account_number, balance, currency, is_primary)
    VALUES (u1, 'checking', public.generate_account_number(), 2500.00, 'USD', true)
    RETURNING id INTO acc1;

    INSERT INTO public.accounts (user_id, account_type, account_number, balance, currency, is_primary)
    VALUES (u2, 'checking', public.generate_account_number(), 1800.00, 'USD', true)
    RETURNING id INTO acc2;

    INSERT INTO public.accounts (user_id, account_type, account_number, balance, currency, is_primary)
    VALUES (u3, 'checking', public.generate_account_number(), 5200.00, 'USD', true)
    RETURNING id INTO acc3;

    INSERT INTO public.accounts (user_id, account_type, account_number, balance, currency, is_primary)
    VALUES (u4, 'checking', public.generate_account_number(),  950.00, 'USD', true)
    RETURNING id INTO acc4;

    -- Transactions
    INSERT INTO public.transactions (
      user_id, account_id, transaction_type, amount, currency, description, status, recipient_account_id, recipient_info, reference_number
    ) VALUES
      (u1, acc1, 'deposit',   1200.00, 'USD', 'Initial deposit', 'completed', NULL, NULL, 'REF' || to_char(now(), 'YYYYMMDD') || 'A'),
      (u1, acc1, 'transfer',   500.00, 'USD', 'Transfer to Sarah Chen', 'completed', acc2, jsonb_build_object('recipient_name','Sarah Chen'), 'REF' || to_char(now(), 'YYYYMMDD') || 'B'),
      (u2, acc2, 'deposit',    600.00, 'USD', 'Initial deposit', 'completed', NULL, NULL, 'REF' || to_char(now(), 'YYYYMMDD') || 'C'),
      (u2, acc2, 'transfer',   500.00, 'USD', 'Transfer from Alex Rodriguez', 'completed', acc1, jsonb_build_object('sender_name','Alex Rodriguez'), 'REF' || to_char(now(), 'YYYYMMDD') || 'D'),
      (u3, acc3, 'deposit',   2000.00, 'USD', 'Bonus deposit', 'completed', NULL, NULL, 'REF' || to_char(now(), 'YYYYMMDD') || 'E'),
      (u4, acc4, 'deposit',    950.00, 'USD', 'Cash deposit', 'completed', NULL, NULL, 'REF' || to_char(now(), 'YYYYMMDD') || 'F');

    -- Loan request
    INSERT INTO public.loan_requests (
      user_id, amount, purpose, loan_type, status, annual_income, credit_score, employment_status
    ) VALUES (
      u1, 10000.00, 'Home renovation', 'personal_loan', 'pending', 85000.00, 720, 'employed'
    );

    -- Cards
    INSERT INTO public.cards (
      user_id, account_id, card_type, card_number, expiry_date, is_contactless, daily_limit, card_status
    ) VALUES
      (u1, acc1, 'debit', public.generate_card_number(), (current_date + interval '4 years')::date, true, 1500.00, 'active'),
      (u2, acc2, 'debit', public.generate_card_number(), (current_date + interval '4 years')::date, true, 1500.00, 'active'),
      (u3, acc3, 'debit', public.generate_card_number(), (current_date + interval '4 years')::date, true, 2000.00, 'active'),
      (u4, acc4, 'debit', public.generate_card_number(), (current_date + interval '4 years')::date, true, 1000.00, 'active');
  END IF;
END
$$;