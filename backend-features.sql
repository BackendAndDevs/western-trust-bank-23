-- Add comprehensive backend features for banking app

-- 1. Create notifications table
CREATE TABLE IF NOT EXISTS public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('transaction', 'loan', 'card', 'transfer', 'bill', 'system', 'security')),
  read BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own notifications" ON public.notifications
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can create notifications" ON public.notifications
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Users can update their own notifications" ON public.notifications
  FOR UPDATE USING (auth.uid() = user_id);

-- 2. Create bills table
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  biller_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  due_date DATE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  category TEXT NOT NULL CHECK (category IN ('utilities', 'phone', 'internet', 'rent', 'insurance', 'credit_card', 'other')),
  auto_pay BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own bills" ON public.bills
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own bills" ON public.bills
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own bills" ON public.bills
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all bills" ON public.bills
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 3. Create recurring transfers table
CREATE TABLE IF NOT EXISTS public.recurring_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  from_account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  to_account_number TEXT NOT NULL,
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'biweekly', 'monthly')),
  next_execution_date DATE NOT NULL,
  active BOOLEAN NOT NULL DEFAULT true,
  memo TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

ALTER TABLE public.recurring_transfers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own recurring transfers" ON public.recurring_transfers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own recurring transfers" ON public.recurring_transfers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own recurring transfers" ON public.recurring_transfers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all recurring transfers" ON public.recurring_transfers
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- 4. Add card status column if not exists
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'cards' 
                 AND column_name = 'card_status') THEN
    ALTER TABLE public.cards ADD COLUMN card_status TEXT NOT NULL DEFAULT 'active' 
      CHECK (card_status IN ('active', 'frozen', 'deactivated'));
  END IF;
END $$;

-- 5. Add last interest calculation date to accounts
DO $$ 
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'accounts' 
                 AND column_name = 'last_interest_date') THEN
    ALTER TABLE public.accounts ADD COLUMN last_interest_date DATE DEFAULT CURRENT_DATE;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                 WHERE table_schema = 'public' 
                 AND table_name = 'accounts' 
                 AND column_name = 'interest_rate') THEN
    ALTER TABLE public.accounts ADD COLUMN interest_rate DECIMAL(5,4) DEFAULT 0.02;
  END IF;
END $$;

-- 6. Function to pay a bill
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

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_user_id, 'Bill Payment Successful', 
          'Paid $' || v_bill.amount || ' to ' || v_bill.biller_name, 'bill');

  RETURN json_build_object('success', true, 'transaction_id', v_transaction_id);
END;
$$;

-- 7. Function to get notifications
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

-- 8. Function to mark notification as read
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

-- 9. Function to activate/deactivate/freeze card
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

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_user_id, 'Card Status Updated', 
          'Your card ending in ' || RIGHT(v_card.card_number, 4) || ' is now ' || p_status, 'card');

  RETURN json_build_object('success', true, 'status', p_status);
END;
$$;

-- 10. Function to setup recurring transfer
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

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_user_id, 'Recurring Transfer Setup', 
          'Created ' || p_frequency || ' transfer of $' || p_amount, 'transfer');

  RETURN json_build_object('success', true, 'recurring_id', v_recurring_id);
END;
$$;

-- 11. Function to calculate and apply interest
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

  INSERT INTO public.notifications (user_id, title, message, type)
  VALUES (v_user_id, 'Interest Applied', 
          'Earned $' || v_interest_amount || ' in interest', 'transaction');

  RETURN json_build_object('success', true, 'interest_amount', v_interest_amount);
END;
$$;

-- 12. Update timestamp trigger for new tables
CREATE TRIGGER update_bills_updated_at BEFORE UPDATE ON public.bills
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_recurring_transfers_updated_at BEFORE UPDATE ON public.recurring_transfers
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- 13. Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON public.notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON public.notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_bills_user_id ON public.bills(user_id);
CREATE INDEX IF NOT EXISTS idx_bills_due_date ON public.bills(due_date);
CREATE INDEX IF NOT EXISTS idx_recurring_transfers_user_id ON public.recurring_transfers(user_id);
CREATE INDEX IF NOT EXISTS idx_recurring_transfers_next_execution ON public.recurring_transfers(next_execution_date);
