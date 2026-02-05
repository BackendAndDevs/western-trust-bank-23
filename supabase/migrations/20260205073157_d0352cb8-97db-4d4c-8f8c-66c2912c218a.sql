-- =============================================
-- COMPREHENSIVE BANKING SYSTEM ENHANCEMENT
-- Admin Full Access + Missing Features + Pending Workflow
-- =============================================

-- 1. Create beneficiaries table for saved recipients
CREATE TABLE IF NOT EXISTS public.beneficiaries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nickname TEXT NOT NULL,
  account_number TEXT NOT NULL,
  bank_name TEXT,
  bank_id UUID REFERENCES public.us_banks(id),
  beneficiary_type TEXT NOT NULL DEFAULT 'internal' CHECK (beneficiary_type IN ('internal', 'external', 'international')),
  is_verified BOOLEAN DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'active', 'suspended')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Create wire_transfers table for international/domestic wires
CREATE TABLE IF NOT EXISTS public.wire_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  from_account_id UUID NOT NULL REFERENCES public.accounts(id),
  wire_type TEXT NOT NULL CHECK (wire_type IN ('domestic', 'international')),
  recipient_name TEXT NOT NULL,
  recipient_account TEXT NOT NULL,
  recipient_bank TEXT NOT NULL,
  routing_number TEXT,
  swift_code TEXT,
  iban TEXT,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  purpose TEXT,
  reference_number TEXT,
  fee_amount NUMERIC DEFAULT 25.00,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'completed', 'rejected', 'cancelled')),
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Create check_deposits table for mobile check deposits
CREATE TABLE IF NOT EXISTS public.check_deposits (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  check_number TEXT NOT NULL,
  check_amount NUMERIC NOT NULL CHECK (check_amount > 0),
  payer_name TEXT NOT NULL,
  payer_bank TEXT,
  front_image_url TEXT,
  back_image_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'approved', 'rejected', 'cleared', 'returned')),
  hold_days INTEGER DEFAULT 3,
  available_date DATE,
  admin_notes TEXT,
  reviewed_by UUID,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Create account_statements table
CREATE TABLE IF NOT EXISTS public.account_statements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  statement_date DATE NOT NULL,
  period_start DATE NOT NULL,
  period_end DATE NOT NULL,
  opening_balance NUMERIC NOT NULL,
  closing_balance NUMERIC NOT NULL,
  total_deposits NUMERIC DEFAULT 0,
  total_withdrawals NUMERIC DEFAULT 0,
  statement_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Create security_settings table for 2FA and security preferences
CREATE TABLE IF NOT EXISTS public.security_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE,
  two_factor_enabled BOOLEAN DEFAULT false,
  two_factor_method TEXT CHECK (two_factor_method IN ('sms', 'email', 'authenticator')),
  login_notifications BOOLEAN DEFAULT true,
  transaction_notifications BOOLEAN DEFAULT true,
  large_transaction_alert NUMERIC DEFAULT 1000,
  trusted_devices JSONB DEFAULT '[]',
  last_password_change TIMESTAMPTZ,
  failed_login_attempts INTEGER DEFAULT 0,
  account_locked BOOLEAN DEFAULT false,
  locked_until TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Create activity_logs table for audit trail
CREATE TABLE IF NOT EXISTS public.activity_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL,
  entity_type TEXT,
  entity_id UUID,
  description TEXT NOT NULL,
  ip_address TEXT,
  user_agent TEXT,
  metadata JSONB,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wire_transfers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.check_deposits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.account_statements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.security_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.activity_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies for beneficiaries
CREATE POLICY "Users can view their own beneficiaries" ON public.beneficiaries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own beneficiaries" ON public.beneficiaries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own beneficiaries" ON public.beneficiaries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete their own beneficiaries" ON public.beneficiaries FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for wire_transfers
CREATE POLICY "Users can view their own wire transfers" ON public.wire_transfers FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own wire transfers" ON public.wire_transfers FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for check_deposits
CREATE POLICY "Users can view their own check deposits" ON public.check_deposits FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own check deposits" ON public.check_deposits FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for account_statements
CREATE POLICY "Users can view their own statements" ON public.account_statements FOR SELECT USING (auth.uid() = user_id);

-- RLS Policies for security_settings
CREATE POLICY "Users can view their own security settings" ON public.security_settings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can update their own security settings" ON public.security_settings FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own security settings" ON public.security_settings FOR INSERT WITH CHECK (auth.uid() = user_id);

-- RLS Policies for activity_logs
CREATE POLICY "Users can view their own activity" ON public.activity_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create activity logs" ON public.activity_logs FOR INSERT WITH CHECK (auth.uid() = user_id);

-- =============================================
-- ADMIN FUNCTIONS FOR ALL FEATURES
-- =============================================

-- Admin: Get all external transfers
CREATE OR REPLACE FUNCTION public.admin_get_all_external_transfers()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  from_account_id UUID,
  bank_id UUID,
  bank_name TEXT,
  recipient_name TEXT,
  recipient_account_number TEXT,
  amount NUMERIC,
  memo TEXT,
  status TEXT,
  created_at TIMESTAMPTZ,
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
    et.id, et.user_id, et.from_account_id, et.bank_id,
    COALESCE(ub.bank_name, '') as bank_name,
    et.recipient_name, et.recipient_account_number,
    et.amount, et.memo, et.status, et.created_at,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name,
    COALESCE(a.account_number, '') as account_number
  FROM public.external_transfers et
  LEFT JOIN auth.users au ON et.user_id = au.id
  LEFT JOIN public.profiles p ON et.user_id = p.user_id
  LEFT JOIN public.accounts a ON et.from_account_id = a.id
  LEFT JOIN public.us_banks ub ON et.bank_id = ub.id
  ORDER BY et.created_at DESC;
END;
$$;

-- Admin: Process external transfer
CREATE OR REPLACE FUNCTION public.admin_process_external_transfer(
  transfer_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transfer RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  SELECT * INTO v_transfer FROM public.external_transfers WHERE id = transfer_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Transfer not found');
  END IF;
  
  UPDATE public.external_transfers
  SET status = new_status, updated_at = now()
  WHERE id = transfer_id;
  
  -- If approved, deduct from account
  IF new_status = 'approved' THEN
    UPDATE public.accounts 
    SET balance = balance - v_transfer.amount 
    WHERE id = v_transfer.from_account_id;
    
    -- Create transaction record
    INSERT INTO public.transactions (user_id, account_id, transaction_type, amount, description, status)
    VALUES (v_transfer.user_id, v_transfer.from_account_id, 'external_transfer', v_transfer.amount, 
            'External transfer to ' || v_transfer.recipient_name, 'completed');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Admin: Get all wire transfers
CREATE OR REPLACE FUNCTION public.admin_get_all_wire_transfers()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  wire_type TEXT,
  recipient_name TEXT,
  recipient_bank TEXT,
  amount NUMERIC,
  currency TEXT,
  fee_amount NUMERIC,
  status TEXT,
  purpose TEXT,
  created_at TIMESTAMPTZ,
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
    wt.id, wt.user_id, wt.wire_type, wt.recipient_name, wt.recipient_bank,
    wt.amount, wt.currency, wt.fee_amount, wt.status, wt.purpose, wt.created_at,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name,
    COALESCE(a.account_number, '') as account_number
  FROM public.wire_transfers wt
  LEFT JOIN auth.users au ON wt.user_id = au.id
  LEFT JOIN public.profiles p ON wt.user_id = p.user_id
  LEFT JOIN public.accounts a ON wt.from_account_id = a.id
  ORDER BY wt.created_at DESC;
END;
$$;

-- Admin: Process wire transfer
CREATE OR REPLACE FUNCTION public.admin_process_wire_transfer(
  transfer_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_transfer RECORD;
  v_total_amount NUMERIC;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  SELECT * INTO v_transfer FROM public.wire_transfers WHERE id = transfer_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Wire transfer not found');
  END IF;
  
  UPDATE public.wire_transfers
  SET status = new_status, admin_notes = admin_process_wire_transfer.admin_notes,
      reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now()
  WHERE id = transfer_id;
  
  -- If approved, deduct from account including fee
  IF new_status = 'approved' THEN
    v_total_amount := v_transfer.amount + COALESCE(v_transfer.fee_amount, 0);
    
    UPDATE public.accounts 
    SET balance = balance - v_total_amount 
    WHERE id = v_transfer.from_account_id;
    
    INSERT INTO public.transactions (user_id, account_id, transaction_type, amount, description, status)
    VALUES (v_transfer.user_id, v_transfer.from_account_id, 'wire_transfer', v_total_amount, 
            'Wire transfer to ' || v_transfer.recipient_name || ' (' || v_transfer.recipient_bank || ')', 'completed');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Admin: Get all check deposits
CREATE OR REPLACE FUNCTION public.admin_get_all_check_deposits()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  account_id UUID,
  check_number TEXT,
  check_amount NUMERIC,
  payer_name TEXT,
  status TEXT,
  hold_days INTEGER,
  created_at TIMESTAMPTZ,
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
    cd.id, cd.user_id, cd.account_id, cd.check_number, cd.check_amount,
    cd.payer_name, cd.status, cd.hold_days, cd.created_at,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name,
    COALESCE(a.account_number, '') as account_number
  FROM public.check_deposits cd
  LEFT JOIN auth.users au ON cd.user_id = au.id
  LEFT JOIN public.profiles p ON cd.user_id = p.user_id
  LEFT JOIN public.accounts a ON cd.account_id = a.id
  ORDER BY cd.created_at DESC;
END;
$$;

-- Admin: Process check deposit
CREATE OR REPLACE FUNCTION public.admin_process_check_deposit(
  deposit_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_deposit RECORD;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  SELECT * INTO v_deposit FROM public.check_deposits WHERE id = deposit_id;
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'Check deposit not found');
  END IF;
  
  UPDATE public.check_deposits
  SET status = new_status, admin_notes = admin_process_check_deposit.admin_notes,
      reviewed_by = auth.uid(), reviewed_at = now(), updated_at = now(),
      available_date = CASE WHEN new_status = 'approved' THEN CURRENT_DATE + COALESCE(v_deposit.hold_days, 3) ELSE NULL END
  WHERE id = deposit_id;
  
  -- If cleared (after hold period), add to account
  IF new_status = 'cleared' THEN
    UPDATE public.accounts 
    SET balance = balance + v_deposit.check_amount 
    WHERE id = v_deposit.account_id;
    
    INSERT INTO public.transactions (user_id, account_id, transaction_type, amount, description, status)
    VALUES (v_deposit.user_id, v_deposit.account_id, 'check_deposit', v_deposit.check_amount, 
            'Check deposit #' || v_deposit.check_number || ' from ' || v_deposit.payer_name, 'completed');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Admin: Get all bills
CREATE OR REPLACE FUNCTION public.admin_get_all_bills()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  biller_name TEXT,
  amount NUMERIC,
  due_date DATE,
  status TEXT,
  auto_pay BOOLEAN,
  category TEXT,
  created_at TIMESTAMPTZ,
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
    b.id, b.user_id, b.biller_name, b.amount, b.due_date, b.status,
    b.auto_pay, b.category, b.created_at,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name
  FROM public.bills b
  LEFT JOIN auth.users au ON b.user_id = au.id
  LEFT JOIN public.profiles p ON b.user_id = p.user_id
  ORDER BY b.due_date ASC;
END;
$$;

-- Admin: Get all cards
CREATE OR REPLACE FUNCTION public.admin_get_all_cards()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  account_id UUID,
  card_number TEXT,
  card_type TEXT,
  card_status TEXT,
  expiry_date TEXT,
  daily_limit NUMERIC,
  is_contactless BOOLEAN,
  created_at TIMESTAMPTZ,
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
    c.id, c.user_id, c.account_id, c.card_number, c.card_type, c.card_status,
    c.expiry_date, c.daily_limit, c.is_contactless, c.created_at,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name,
    COALESCE(a.account_number, '') as account_number
  FROM public.cards c
  LEFT JOIN auth.users au ON c.user_id = au.id
  LEFT JOIN public.profiles p ON c.user_id = p.user_id
  LEFT JOIN public.accounts a ON c.account_id = a.id
  ORDER BY c.created_at DESC;
END;
$$;

-- Admin: Update card status
CREATE OR REPLACE FUNCTION public.admin_update_card_status(
  card_id UUID,
  new_status TEXT
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
  
  UPDATE public.cards
  SET card_status = new_status, updated_at = now()
  WHERE id = card_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Admin: Get all recurring transfers
CREATE OR REPLACE FUNCTION public.admin_get_all_recurring_transfers()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  from_account_id UUID,
  to_account_number TEXT,
  amount NUMERIC,
  frequency TEXT,
  next_execution_date DATE,
  active BOOLEAN,
  memo TEXT,
  created_at TIMESTAMPTZ,
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
    rt.id, rt.user_id, rt.from_account_id, rt.to_account_number,
    rt.amount, rt.frequency, rt.next_execution_date, rt.active, rt.memo, rt.created_at,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name,
    COALESCE(a.account_number, '') as account_number
  FROM public.recurring_transfers rt
  LEFT JOIN auth.users au ON rt.user_id = au.id
  LEFT JOIN public.profiles p ON rt.user_id = p.user_id
  LEFT JOIN public.accounts a ON rt.from_account_id = a.id
  ORDER BY rt.next_execution_date ASC;
END;
$$;

-- Admin: Get all beneficiaries
CREATE OR REPLACE FUNCTION public.admin_get_all_beneficiaries()
RETURNS TABLE(
  id UUID,
  user_id UUID,
  nickname TEXT,
  account_number TEXT,
  bank_name TEXT,
  beneficiary_type TEXT,
  is_verified BOOLEAN,
  status TEXT,
  created_at TIMESTAMPTZ,
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
    bf.id, bf.user_id, bf.nickname, bf.account_number, bf.bank_name,
    bf.beneficiary_type, bf.is_verified, bf.status, bf.created_at,
    COALESCE(au.email, '') as user_email,
    COALESCE(p.full_name, '') as user_name
  FROM public.beneficiaries bf
  LEFT JOIN auth.users au ON bf.user_id = au.id
  LEFT JOIN public.profiles p ON bf.user_id = p.user_id
  ORDER BY bf.created_at DESC;
END;
$$;

-- Admin: Verify beneficiary
CREATE OR REPLACE FUNCTION public.admin_verify_beneficiary(
  beneficiary_id UUID,
  new_status TEXT
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
  
  UPDATE public.beneficiaries
  SET status = new_status, 
      is_verified = CASE WHEN new_status = 'active' THEN true ELSE false END,
      updated_at = now()
  WHERE id = beneficiary_id;
  
  RETURN json_build_object('success', true);
END;
$$;

-- Admin: Get complete dashboard stats
CREATE OR REPLACE FUNCTION public.admin_get_dashboard_stats()
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_stats JSON;
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('error', 'Access denied');
  END IF;
  
  SELECT json_build_object(
    'total_users', (SELECT COUNT(*) FROM public.profiles),
    'total_accounts', (SELECT COUNT(*) FROM public.accounts),
    'total_balance', (SELECT COALESCE(SUM(balance), 0) FROM public.accounts),
    'pending_transactions', (SELECT COUNT(*) FROM public.transactions WHERE status = 'pending'),
    'pending_loans', (SELECT COUNT(*) FROM public.loan_requests WHERE status = 'pending'),
    'pending_external_transfers', (SELECT COUNT(*) FROM public.external_transfers WHERE status = 'pending'),
    'pending_wire_transfers', (SELECT COUNT(*) FROM public.wire_transfers WHERE status = 'pending'),
    'pending_check_deposits', (SELECT COUNT(*) FROM public.check_deposits WHERE status = 'pending'),
    'pending_beneficiaries', (SELECT COUNT(*) FROM public.beneficiaries WHERE status = 'pending'),
    'total_cards', (SELECT COUNT(*) FROM public.cards),
    'frozen_cards', (SELECT COUNT(*) FROM public.cards WHERE card_status = 'frozen'),
    'active_recurring_transfers', (SELECT COUNT(*) FROM public.recurring_transfers WHERE active = true),
    'pending_bills', (SELECT COUNT(*) FROM public.bills WHERE status = 'pending'),
    'today_transactions', (SELECT COUNT(*) FROM public.transactions WHERE created_at >= CURRENT_DATE)
  ) INTO v_stats;
  
  RETURN v_stats;
END;
$$;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_beneficiaries_user_id ON public.beneficiaries(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_transfers_user_id ON public.wire_transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_wire_transfers_status ON public.wire_transfers(status);
CREATE INDEX IF NOT EXISTS idx_check_deposits_user_id ON public.check_deposits(user_id);
CREATE INDEX IF NOT EXISTS idx_check_deposits_status ON public.check_deposits(status);
CREATE INDEX IF NOT EXISTS idx_account_statements_user_id ON public.account_statements(user_id);
CREATE INDEX IF NOT EXISTS idx_security_settings_user_id ON public.security_settings(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_user_id ON public.activity_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_activity_logs_created_at ON public.activity_logs(created_at DESC);

-- Create triggers for updated_at
CREATE TRIGGER update_beneficiaries_updated_at BEFORE UPDATE ON public.beneficiaries FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_wire_transfers_updated_at BEFORE UPDATE ON public.wire_transfers FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_check_deposits_updated_at BEFORE UPDATE ON public.check_deposits FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_security_settings_updated_at BEFORE UPDATE ON public.security_settings FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();