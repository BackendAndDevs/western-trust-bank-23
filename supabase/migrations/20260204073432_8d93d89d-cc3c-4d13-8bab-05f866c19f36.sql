-- Fix the permissive RLS policy on notifications
-- Replace the overly permissive INSERT policy with a proper one

DROP POLICY IF EXISTS "System can create notifications" ON public.notifications;

CREATE POLICY "Users can create their own notifications" ON public.notifications
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Add admin RPC functions for admin dashboard

-- Admin function to get all accounts
CREATE OR REPLACE FUNCTION public.admin_get_all_accounts()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  account_number TEXT,
  account_type TEXT,
  balance DECIMAL,
  currency TEXT,
  is_primary BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  user_email TEXT,
  user_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    a.id, a.user_id, a.account_number, a.account_type, 
    a.balance, a.currency, a.is_primary, a.created_at, a.updated_at,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name
  FROM public.accounts a
  LEFT JOIN auth.users au ON a.user_id = au.id
  LEFT JOIN public.profiles p ON a.user_id = p.user_id
  ORDER BY a.created_at DESC;
END;
$$;

-- Admin function to get all transactions
CREATE OR REPLACE FUNCTION public.admin_get_all_transactions()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  account_id UUID,
  transaction_type TEXT,
  amount DECIMAL,
  description TEXT,
  status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  recipient_account_id UUID,
  recipient_info JSONB,
  user_email TEXT,
  user_name TEXT,
  account_number TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    t.id, t.user_id, t.account_id, t.transaction_type,
    t.amount, t.description, t.status, t.created_at,
    t.recipient_account_id, t.recipient_info,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name,
    COALESCE(a.account_number, '') as account_number
  FROM public.transactions t
  LEFT JOIN auth.users au ON t.user_id = au.id
  LEFT JOIN public.profiles p ON t.user_id = p.user_id
  LEFT JOIN public.accounts a ON t.account_id = a.id
  ORDER BY t.created_at DESC
  LIMIT 100;
END;
$$;

-- Admin function to get all loans
CREATE OR REPLACE FUNCTION public.admin_get_all_loans()
RETURNS TABLE (
  id UUID,
  user_id UUID,
  amount DECIMAL,
  purpose TEXT,
  loan_type TEXT,
  status TEXT,
  annual_income DECIMAL,
  credit_score INTEGER,
  employment_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  admin_notes TEXT,
  user_email TEXT,
  user_name TEXT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    l.id, l.user_id, l.amount, l.purpose, l.loan_type, l.status,
    l.annual_income, l.credit_score, l.employment_status,
    l.created_at, l.reviewed_by, l.reviewed_at, l.admin_notes,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name
  FROM public.loan_requests l
  LEFT JOIN auth.users au ON l.user_id = au.id
  LEFT JOIN public.profiles p ON l.user_id = p.user_id
  ORDER BY l.created_at DESC;
END;
$$;

-- Admin function to get all users
CREATE OR REPLACE FUNCTION public.admin_get_all_users()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  full_name TEXT,
  account_status TEXT,
  created_at TIMESTAMP WITH TIME ZONE,
  total_balance DECIMAL,
  account_count BIGINT
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied: Admin role required';
  END IF;
  
  RETURN QUERY
  SELECT 
    p.user_id,
    COALESCE(au.email, '') as email,
    COALESCE(p.full_name, '') as full_name,
    COALESCE(p.account_status, 'active') as account_status,
    p.created_at,
    COALESCE(SUM(a.balance), 0) as total_balance,
    COUNT(a.id) as account_count
  FROM public.profiles p
  LEFT JOIN auth.users au ON p.user_id = au.id
  LEFT JOIN public.accounts a ON p.user_id = a.user_id
  GROUP BY p.user_id, au.email, p.full_name, p.account_status, p.created_at
  ORDER BY p.created_at DESC;
END;
$$;

-- Admin function to process a transaction
CREATE OR REPLACE FUNCTION public.admin_process_transaction(
  transaction_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transaction RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  SELECT * INTO v_transaction FROM public.transactions WHERE id = transaction_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Transaction not found');
  END IF;
  
  UPDATE public.transactions
  SET status = new_status, admin_notes = admin_process_transaction.admin_notes, updated_at = now()
  WHERE id = transaction_id;
  
  -- If approved, update account balance
  IF new_status = 'approved' THEN
    IF v_transaction.transaction_type = 'deposit' THEN
      UPDATE public.accounts SET balance = balance + v_transaction.amount WHERE id = v_transaction.account_id;
    ELSIF v_transaction.transaction_type IN ('withdraw', 'withdrawal') THEN
      UPDATE public.accounts SET balance = balance - v_transaction.amount WHERE id = v_transaction.account_id;
    END IF;
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Admin function to review loan
CREATE OR REPLACE FUNCTION public.admin_review_loan(
  loan_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  UPDATE public.loan_requests
  SET status = new_status, 
      reviewed_by = auth.uid(), 
      reviewed_at = now(), 
      admin_notes = admin_review_loan.admin_notes,
      updated_at = now()
  WHERE id = loan_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Admin function to update account balance
CREATE OR REPLACE FUNCTION public.admin_update_account_balance(
  target_account_id UUID,
  new_balance DECIMAL,
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  UPDATE public.accounts
  SET balance = new_balance, updated_at = now()
  WHERE id = target_account_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Admin function to create user (placeholder - actual user creation requires auth.admin)
CREATE OR REPLACE FUNCTION public.admin_create_user(
  email TEXT,
  password TEXT,
  full_name TEXT,
  initial_balance DECIMAL DEFAULT 1000.00,
  user_role TEXT DEFAULT 'user'
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  -- Note: Actual user creation through auth.users requires service role key
  -- This is a placeholder that would need edge function implementation
  RETURN json_build_object('success', false, 'error', 'User creation requires edge function');
END;
$$;

-- Admin function to delete user (placeholder)
CREATE OR REPLACE FUNCTION public.admin_delete_user(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  -- Delete user data (cascades will handle related tables)
  DELETE FROM public.profiles WHERE user_id = target_user_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Function to process external transfer
CREATE OR REPLACE FUNCTION public.process_external_transfer(
  p_from_account_id UUID,
  p_bank_id UUID,
  p_recipient_name TEXT,
  p_recipient_account_number TEXT,
  p_amount DECIMAL,
  p_memo TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_account RECORD;
  v_transfer_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;
  
  SELECT * INTO v_account FROM public.accounts WHERE id = p_from_account_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Account not found');
  END IF;
  
  IF v_account.balance < p_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient funds');
  END IF;
  
  INSERT INTO public.external_transfers (
    user_id, from_account_id, bank_id, recipient_name, 
    recipient_account_number, amount, memo, status
  ) VALUES (
    v_user_id, p_from_account_id, p_bank_id, p_recipient_name,
    p_recipient_account_number, p_amount, p_memo, 'pending'
  ) RETURNING id INTO v_transfer_id;
  
  RETURN json_build_object('success', true, 'transfer_id', v_transfer_id);
END;
$$;

-- Billing functions
CREATE OR REPLACE FUNCTION public.pay_bill(
  p_bill_id UUID,
  p_account_id UUID
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_bill RECORD;
  v_account RECORD;
  v_transaction_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_bill FROM public.bills WHERE id = p_bill_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Bill not found');
  END IF;

  IF v_bill.status = 'paid' THEN
    RETURN json_build_object('success', false, 'error', 'Bill already paid');
  END IF;

  SELECT * INTO v_account FROM public.accounts WHERE id = p_account_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Account not found');
  END IF;

  IF v_account.balance < v_bill.amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient funds');
  END IF;

  UPDATE public.accounts 
  SET balance = balance - v_bill.amount, updated_at = now()
  WHERE id = p_account_id;

  UPDATE public.bills 
  SET status = 'paid', updated_at = now()
  WHERE id = p_bill_id;

  INSERT INTO public.transactions (account_id, user_id, transaction_type, amount, description, status)
  VALUES (p_account_id, v_user_id, 'withdrawal', v_bill.amount, 
          'Bill payment to ' || v_bill.biller_name, 'completed')
  RETURNING id INTO v_transaction_id;

  RETURN json_build_object('success', true, 'transaction_id', v_transaction_id);
END;
$$;

-- Card status update function
CREATE OR REPLACE FUNCTION public.update_card_status(
  p_card_id UUID,
  p_status TEXT
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_card RECORD;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_status NOT IN ('active', 'frozen', 'deactivated') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid status');
  END IF;

  SELECT * INTO v_card FROM public.cards WHERE id = p_card_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Card not found');
  END IF;

  UPDATE public.cards
  SET card_status = p_status, updated_at = now()
  WHERE id = p_card_id;

  RETURN json_build_object('success', true, 'status', p_status);
END;
$$;

-- Notification functions
CREATE OR REPLACE FUNCTION public.get_notifications(p_limit INT DEFAULT 50)
RETURNS TABLE (
  id UUID,
  title TEXT,
  message TEXT,
  type TEXT,
  read BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;

  RETURN QUERY
  SELECT n.id, n.title, n.message, n.type, n.read, n.created_at
  FROM public.notifications n
  WHERE n.user_id = v_user_id
  ORDER BY n.created_at DESC
  LIMIT p_limit;
END;
$$;

CREATE OR REPLACE FUNCTION public.mark_notification_read(p_notification_id UUID)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN false;
  END IF;

  UPDATE public.notifications
  SET read = true
  WHERE id = p_notification_id AND user_id = v_user_id;

  RETURN FOUND;
END;
$$;

-- Recurring transfer setup function
CREATE OR REPLACE FUNCTION public.setup_recurring_transfer(
  p_from_account_id UUID,
  p_to_account_number TEXT,
  p_amount DECIMAL,
  p_frequency TEXT,
  p_memo TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_next_date DATE;
  v_recurring_id UUID;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  IF p_frequency NOT IN ('daily', 'weekly', 'biweekly', 'monthly') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid frequency');
  END IF;

  v_next_date := CASE p_frequency
    WHEN 'daily' THEN CURRENT_DATE + INTERVAL '1 day'
    WHEN 'weekly' THEN CURRENT_DATE + INTERVAL '1 week'
    WHEN 'biweekly' THEN CURRENT_DATE + INTERVAL '2 weeks'
    WHEN 'monthly' THEN CURRENT_DATE + INTERVAL '1 month'
  END;

  INSERT INTO public.recurring_transfers 
    (user_id, from_account_id, to_account_number, amount, frequency, next_execution_date, memo)
  VALUES 
    (v_user_id, p_from_account_id, p_to_account_number, p_amount, p_frequency, v_next_date, p_memo)
  RETURNING id INTO v_recurring_id;

  RETURN json_build_object('success', true, 'recurring_id', v_recurring_id);
END;
$$;

-- Interest calculation function
CREATE OR REPLACE FUNCTION public.calculate_interest(p_account_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_user_id UUID;
  v_account RECORD;
  v_interest_amount DECIMAL;
  v_days_since_last INT;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN
    RETURN json_build_object('success', false, 'error', 'Not authenticated');
  END IF;

  SELECT * INTO v_account FROM public.accounts WHERE id = p_account_id AND user_id = v_user_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Account not found');
  END IF;

  IF v_account.account_type != 'savings' THEN
    RETURN json_build_object('success', false, 'error', 'Only savings accounts earn interest');
  END IF;

  v_days_since_last := CURRENT_DATE - COALESCE(v_account.last_interest_date, v_account.created_at::DATE);
  
  IF v_days_since_last < 30 THEN
    RETURN json_build_object('success', false, 'error', 'Interest calculated less than 30 days ago');
  END IF;

  v_interest_amount := v_account.balance * (COALESCE(v_account.interest_rate, 0.02) / 365) * v_days_since_last;
  v_interest_amount := ROUND(v_interest_amount, 2);

  IF v_interest_amount <= 0 THEN
    RETURN json_build_object('success', false, 'error', 'No interest to apply');
  END IF;

  UPDATE public.accounts
  SET balance = balance + v_interest_amount,
      last_interest_date = CURRENT_DATE,
      updated_at = now()
  WHERE id = p_account_id;

  INSERT INTO public.transactions (account_id, user_id, transaction_type, amount, description, status)
  VALUES (p_account_id, v_user_id, 'deposit', v_interest_amount, 'Interest earned', 'completed');

  RETURN json_build_object('success', true, 'interest_amount', v_interest_amount);
END;
$$;