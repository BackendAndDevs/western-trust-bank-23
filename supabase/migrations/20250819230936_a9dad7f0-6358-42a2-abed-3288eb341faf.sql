-- First, let's create a user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
    id uuid primary key default gen_random_uuid(),
    user_id uuid references auth.users(id) on delete cascade not null,
    role text not null default 'user',
    created_at timestamp with time zone default now(),
    unique (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policy for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "System can manage roles" ON public.user_roles
FOR ALL USING (true);

-- Update the has_role function to work with user_roles table
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
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
  ) OR exists (
    select 1 
    from auth.users
    where id = _user_id 
    and (raw_user_meta_data ->> 'role') = _role
  )
$$;

-- Create admin functions for fetching all data
CREATE OR REPLACE FUNCTION public.admin_get_all_accounts()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  account_number text,
  account_type text,
  balance numeric,
  currency text,
  is_primary boolean,
  created_at timestamp with time zone,
  updated_at timestamp with time zone,
  user_email text,
  user_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    a.id,
    a.user_id,
    a.account_number,
    a.account_type,
    a.balance,
    a.currency,
    a.is_primary,
    a.created_at,
    a.updated_at,
    u.email as user_email,
    p.full_name as user_name
  FROM public.accounts a
  LEFT JOIN auth.users u ON u.id = a.user_id
  LEFT JOIN public.profiles p ON p.user_id = a.user_id
  ORDER BY a.created_at DESC;
END;
$$;

-- Create admin function for all transactions
CREATE OR REPLACE FUNCTION public.admin_get_all_transactions()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  account_id uuid,
  transaction_type text,
  amount numeric,
  description text,
  status text,
  created_at timestamp with time zone,
  recipient_account_id uuid,
  recipient_info jsonb,
  user_email text,
  user_name text,
  account_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    t.id,
    t.user_id,
    t.account_id,
    t.transaction_type,
    t.amount,
    t.description,
    t.status,
    t.created_at,
    t.recipient_account_id,
    t.recipient_info,
    u.email as user_email,
    p.full_name as user_name,
    a.account_number
  FROM public.transactions t
  LEFT JOIN auth.users u ON u.id = t.user_id
  LEFT JOIN public.profiles p ON p.user_id = t.user_id  
  LEFT JOIN public.accounts a ON a.id = t.account_id
  ORDER BY t.created_at DESC;
END;
$$;

-- Create admin function for all loan requests
CREATE OR REPLACE FUNCTION public.admin_get_all_loans()
RETURNS TABLE (
  id uuid,
  user_id uuid,
  amount numeric,
  purpose text,
  loan_type text,
  status text,
  annual_income numeric,
  credit_score integer,
  employment_status text,
  created_at timestamp with time zone,
  reviewed_by uuid,
  reviewed_at timestamp with time zone,
  admin_notes text,
  user_email text,
  user_name text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    lr.id,
    lr.user_id,
    lr.amount,
    lr.purpose,
    lr.loan_type,
    lr.status,
    lr.annual_income,
    lr.credit_score,
    lr.employment_status,
    lr.created_at,
    lr.reviewed_by,
    lr.reviewed_at,
    lr.admin_notes,
    u.email as user_email,
    p.full_name as user_name
  FROM public.loan_requests lr
  LEFT JOIN auth.users u ON u.id = lr.user_id
  LEFT JOIN public.profiles p ON p.user_id = lr.user_id
  ORDER BY lr.created_at DESC;
END;
$$;

-- Function to approve/reject transactions
CREATE OR REPLACE FUNCTION public.admin_process_transaction(
  transaction_id uuid,
  new_status text,
  admin_notes text DEFAULT null
)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
DECLARE
  transaction_record record;
  recipient_account record;
BEGIN
  -- Check if current user is admin
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RAISE EXCEPTION 'Access denied. Admin role required.';
  END IF;
  
  -- Validate status
  IF new_status NOT IN ('approved', 'rejected') THEN
    RAISE EXCEPTION 'Invalid status. Must be approved or rejected.';
  END IF;
  
  -- Get transaction details
  SELECT * INTO transaction_record
  FROM public.transactions
  WHERE id = transaction_id;
  
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Transaction not found.';
  END IF;
  
  -- Update transaction status
  UPDATE public.transactions 
  SET status = new_status
  WHERE id = transaction_id;
  
  -- If approved, update account balances
  IF new_status = 'approved' THEN
    IF transaction_record.transaction_type = 'deposit' THEN
      UPDATE public.accounts 
      SET balance = balance + transaction_record.amount
      WHERE id = transaction_record.account_id;
      
    ELSIF transaction_record.transaction_type = 'withdraw' THEN
      UPDATE public.accounts 
      SET balance = balance - transaction_record.amount
      WHERE id = transaction_record.account_id;
      
    ELSIF transaction_record.transaction_type = 'transfer_sent' THEN
      -- Update sender balance
      UPDATE public.accounts 
      SET balance = balance - transaction_record.amount
      WHERE id = transaction_record.account_id;
      
      -- Update recipient balance and create recipient transaction
      IF transaction_record.recipient_account_id IS NOT NULL THEN
        UPDATE public.accounts 
        SET balance = balance + transaction_record.amount
        WHERE id = transaction_record.recipient_account_id;
        
        -- Create recipient transaction
        INSERT INTO public.transactions (
          user_id, account_id, transaction_type, amount, description, status, recipient_account_id
        )
        SELECT 
          a.user_id,
          transaction_record.recipient_account_id,
          'transfer_received',
          transaction_record.amount,
          'Transfer from ' || sender.account_number,
          'completed',
          transaction_record.account_id
        FROM public.accounts a
        JOIN public.accounts sender ON sender.id = transaction_record.account_id
        WHERE a.id = transaction_record.recipient_account_id;
      END IF;
      
    ELSIF transaction_record.transaction_type = 'bill_payment' THEN
      UPDATE public.accounts 
      SET balance = balance - transaction_record.amount
      WHERE id = transaction_record.account_id;
    END IF;
  END IF;
END;
$$;