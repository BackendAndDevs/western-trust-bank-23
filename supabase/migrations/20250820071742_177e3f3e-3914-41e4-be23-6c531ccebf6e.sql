-- Fix RLS policies and queries to not require users table access
-- Update admin functions to not access users table directly

CREATE OR REPLACE FUNCTION public.admin_get_all_accounts()
RETURNS TABLE(id uuid, user_id uuid, account_number text, account_type text, balance numeric, currency text, is_primary boolean, created_at timestamp with time zone, updated_at timestamp with time zone, user_email text, user_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
    COALESCE(p.full_name, 'Unknown User') as user_email,
    COALESCE(p.full_name, 'Unknown User') as user_name
  FROM public.accounts a
  LEFT JOIN public.profiles p ON p.user_id = a.user_id
  ORDER BY a.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_get_all_transactions()
RETURNS TABLE(id uuid, user_id uuid, account_id uuid, transaction_type text, amount numeric, description text, status text, created_at timestamp with time zone, recipient_account_id uuid, recipient_info jsonb, user_email text, user_name text, account_number text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
    COALESCE(p.full_name, 'Unknown User') as user_email,
    COALESCE(p.full_name, 'Unknown User') as user_name,
    a.account_number
  FROM public.transactions t
  LEFT JOIN public.profiles p ON p.user_id = t.user_id  
  LEFT JOIN public.accounts a ON a.id = t.account_id
  ORDER BY t.created_at DESC;
END;
$function$;

CREATE OR REPLACE FUNCTION public.admin_get_all_loans()
RETURNS TABLE(id uuid, user_id uuid, amount numeric, purpose text, loan_type text, status text, annual_income numeric, credit_score integer, employment_status text, created_at timestamp with time zone, reviewed_by uuid, reviewed_at timestamp with time zone, admin_notes text, user_email text, user_name text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
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
    COALESCE(p.full_name, 'Unknown User') as user_email,
    COALESCE(p.full_name, 'Unknown User') as user_name
  FROM public.loan_requests lr
  LEFT JOIN public.profiles p ON p.user_id = lr.user_id
  ORDER BY lr.created_at DESC;
END;
$function$;