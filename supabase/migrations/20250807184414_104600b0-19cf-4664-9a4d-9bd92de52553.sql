-- Seed dummy banking data if empty
DO $$
DECLARE
  u1 uuid; u2 uuid; u3 uuid; u4 uuid;
  acc1 uuid; acc2 uuid; acc3 uuid; acc4 uuid;
BEGIN
  -- Only seed once
  IF (SELECT COUNT(*) FROM public.accounts) = 0 THEN
    -- Create user ids to link related rows
    u1 := gen_random_uuid();
    u2 := gen_random_uuid();
    u3 := gen_random_uuid();
    u4 := gen_random_uuid();

    -- Profiles
    INSERT INTO public.profiles (user_id, full_name, account_type, phone_number, address)
    VALUES 
      (u1, 'Alex Rodriguez', 'personal', '555-1001', '123 Green St, Springfield'),
      (u2, 'Sarah Chen',     'personal', '555-1002', '456 Oak Ave, Springfield'),
      (u3, 'Priya Patel',    'personal', '555-1003', '789 Pine Rd, Springfield'),
      (u4, 'Michael Johnson','personal', '555-1004', '321 Maple Ln, Springfield');

    -- Accounts (primary checking for each)
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
    VALUES (u4, 'checking', public.generate_account_number(), 950.00,  'USD', true)
    RETURNING id INTO acc4;

    -- Transactions: initial deposits and a transfer between Alex -> Sarah
    INSERT INTO public.transactions (
      user_id, account_id, transaction_type, amount, currency, description, status, recipient_account_id, recipient_info, reference_number
    ) VALUES
      (u1, acc1, 'deposit',   1200.00, 'USD', 'Initial deposit', 'completed', NULL, NULL, 'REF' || to_char(now(), 'YYYYMMDD') || 'A'),
      (u1, acc1, 'transfer',   500.00, 'USD', 'Transfer to Sarah Chen', 'completed', acc2, jsonb_build_object('recipient_name','Sarah Chen'), 'REF' || to_char(now(), 'YYYYMMDD') || 'B'),
      (u2, acc2, 'deposit',    600.00, 'USD', 'Initial deposit', 'completed', NULL, NULL, 'REF' || to_char(now(), 'YYYYMMDD') || 'C'),
      (u2, acc2, 'transfer',   500.00, 'USD', 'Transfer from Alex Rodriguez', 'completed', acc1, jsonb_build_object('sender_name','Alex Rodriguez'), 'REF' || to_char(now(), 'YYYYMMDD') || 'D'),
      (u3, acc3, 'deposit',   2000.00, 'USD', 'Bonus deposit', 'completed', NULL, NULL, 'REF' || to_char(now(), 'YYYYMMDD') || 'E'),
      (u4, acc4, 'deposit',    950.00, 'USD', 'Cash deposit', 'completed', NULL, NULL, 'REF' || to_char(now(), 'YYYYMMDD') || 'F');

    -- Loan request for Alex
    INSERT INTO public.loan_requests (
      user_id, amount, purpose, loan_type, status, annual_income, credit_score, employment_status
    ) VALUES (
      u1, 10000.00, 'Home renovation', 'personal_loan', 'pending', 85000.00, 720, 'employed'
    );

    -- Cards for each user (debit)
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