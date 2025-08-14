-- Fix security definer functions by setting search_path
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role app_role)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  select exists (
    select 1
    from public.user_roles
    where user_id = _user_id
      and role = _role
  )
$$;

CREATE OR REPLACE FUNCTION public.admin_update_account_balance(
  target_account_id uuid,
  new_balance numeric,
  admin_notes text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Update account balance
  UPDATE public.accounts 
  SET 
    balance = new_balance,
    modified_by = auth.uid(),
    modified_at = now()
  WHERE id = target_account_id;
  
  -- Log the transaction
  INSERT INTO public.transactions (
    user_id,
    account_id, 
    transaction_type,
    amount,
    description,
    status
  )
  SELECT 
    a.user_id,
    target_account_id,
    CASE 
      WHEN new_balance > a.balance THEN 'admin_credit'
      ELSE 'admin_debit'
    END,
    ABS(new_balance - a.balance),
    COALESCE(admin_notes, 'Admin account adjustment'),
    'completed'
  FROM public.accounts a 
  WHERE a.id = target_account_id;
END;
$$;

CREATE OR REPLACE FUNCTION public.admin_review_loan(
  loan_id uuid,
  new_status text,
  admin_notes text DEFAULT null
)
RETURNS void  
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Validate status
  IF new_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved or rejected.';
  END IF;
  
  -- Update loan request
  UPDATE public.loan_requests 
  SET 
    status = new_status,
    admin_notes = COALESCE(admin_review_loan.admin_notes, admin_notes),
    reviewed_by = auth.uid(),
    reviewed_at = now()
  WHERE id = loan_id;
  
  -- If approved, potentially create account credit (optional business logic)
  IF new_status = 'approved' THEN
    -- Add loan amount to user's primary account
    UPDATE public.accounts 
    SET balance = balance + (
      SELECT amount FROM public.loan_requests WHERE id = loan_id
    )
    WHERE user_id = (
      SELECT user_id FROM public.loan_requests WHERE id = loan_id
    ) AND is_primary = true;
    
    -- Create transaction record
    INSERT INTO public.transactions (
      user_id,
      account_id,
      transaction_type, 
      amount,
      description,
      status
    )
    SELECT 
      lr.user_id,
      a.id,
      'loan_disbursement',
      lr.amount,
      'Loan approved and disbursed - ' || lr.purpose,
      'completed'
    FROM public.loan_requests lr
    JOIN public.accounts a ON a.user_id = lr.user_id AND a.is_primary = true
    WHERE lr.id = loan_id;
  END IF;
END;
$$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  account_num TEXT;
BEGIN
  -- Generate a 10-digit account number
  account_num := 'WTB' || LPAD(floor(random() * 10000000)::TEXT, 7, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.accounts WHERE account_number = account_num) LOOP
    account_num := 'WTB' || LPAD(floor(random() * 10000000)::TEXT, 7, '0');
  END LOOP;
  
  RETURN account_num;
END;
$$;

CREATE OR REPLACE FUNCTION public.generate_card_number()
RETURNS text
LANGUAGE plpgsql
SET search_path = ''
AS $$
DECLARE
  card_num TEXT;
BEGIN
  -- Generate a 16-digit card number starting with 4000 (test visa)
  card_num := '4000' || LPAD(floor(random() * 1000000000000)::TEXT, 12, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.cards WHERE card_number = card_num) LOOP
    card_num := '4000' || LPAD(floor(random() * 1000000000000)::TEXT, 12, '0');
  END LOOP;
  
  RETURN card_num;
END;
$$;