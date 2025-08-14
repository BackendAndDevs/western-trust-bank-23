-- Add admin functionality for loan management
ALTER TABLE public.loan_requests 
ADD COLUMN reviewed_by uuid REFERENCES auth.users(id),
ADD COLUMN reviewed_at timestamp with time zone;

-- Add admin functionality for account management  
ALTER TABLE public.accounts
ADD COLUMN modified_by uuid REFERENCES auth.users(id),
ADD COLUMN modified_at timestamp with time zone;

-- Create function to allow admins to manage user accounts
CREATE OR REPLACE FUNCTION public.admin_update_account_balance(
  target_account_id uuid,
  new_balance numeric,
  admin_notes text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
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

-- Create function to approve/reject loans
CREATE OR REPLACE FUNCTION public.admin_review_loan(
  loan_id uuid,
  new_status text,
  admin_notes text DEFAULT null
)
RETURNS void  
LANGUAGE plpgsql
SECURITY DEFINER
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