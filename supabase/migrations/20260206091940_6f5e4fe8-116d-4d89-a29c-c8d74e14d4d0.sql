
-- Drop all admin functions to recreate with proper type casts
DROP FUNCTION IF EXISTS public.admin_get_all_accounts();
DROP FUNCTION IF EXISTS public.admin_get_all_users();
DROP FUNCTION IF EXISTS public.admin_get_all_transactions();
DROP FUNCTION IF EXISTS public.admin_get_all_loans();
DROP FUNCTION IF EXISTS public.admin_get_all_external_transfers();
DROP FUNCTION IF EXISTS public.admin_get_all_wire_transfers();
DROP FUNCTION IF EXISTS public.admin_get_all_check_deposits();
DROP FUNCTION IF EXISTS public.admin_get_all_cards();
DROP FUNCTION IF EXISTS public.admin_get_all_beneficiaries();

-- Recreate all with ::text casts on auth.users.email (varchar)

CREATE FUNCTION public.admin_get_all_accounts()
RETURNS TABLE(id uuid, user_id uuid, account_number text, account_type text, balance numeric, currency text, is_primary boolean, created_at timestamptz, updated_at timestamptz, user_email text, user_name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT a.id, a.user_id, a.account_number, a.account_type, a.balance, a.currency, a.is_primary, a.created_at, a.updated_at, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text FROM public.accounts a LEFT JOIN auth.users au ON a.user_id = au.id LEFT JOIN public.profiles p ON a.user_id = p.user_id ORDER BY a.created_at DESC;
END; $$;

CREATE FUNCTION public.admin_get_all_users()
RETURNS TABLE(user_id uuid, email text, full_name text, account_status text, created_at timestamptz, total_balance numeric, account_count bigint)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT p.user_id, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text, COALESCE(p.account_status, 'active')::text, p.created_at, COALESCE(SUM(a.balance), 0)::numeric, COUNT(a.id)::bigint FROM public.profiles p LEFT JOIN auth.users au ON p.user_id = au.id LEFT JOIN public.accounts a ON p.user_id = a.user_id GROUP BY p.user_id, au.email, p.full_name, p.account_status, p.created_at ORDER BY p.created_at DESC;
END; $$;

CREATE FUNCTION public.admin_get_all_transactions()
RETURNS TABLE(id uuid, user_id uuid, account_id uuid, transaction_type text, amount numeric, description text, status text, created_at timestamptz, recipient_account_id uuid, recipient_info jsonb, user_email text, user_name text, account_number text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT t.id, t.user_id, t.account_id, t.transaction_type, t.amount, t.description, t.status, t.created_at, t.recipient_account_id, t.recipient_info, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text, COALESCE(a.account_number, '')::text FROM public.transactions t LEFT JOIN auth.users au ON t.user_id = au.id LEFT JOIN public.profiles p ON t.user_id = p.user_id LEFT JOIN public.accounts a ON t.account_id = a.id ORDER BY t.created_at DESC;
END; $$;

CREATE FUNCTION public.admin_get_all_loans()
RETURNS TABLE(id uuid, user_id uuid, amount numeric, purpose text, loan_type text, status text, annual_income numeric, credit_score int, employment_status text, created_at timestamptz, reviewed_by uuid, reviewed_at timestamptz, admin_notes text, user_email text, user_name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT l.id, l.user_id, l.amount, l.purpose, l.loan_type, l.status, l.annual_income, l.credit_score, l.employment_status, l.created_at, l.reviewed_by, l.reviewed_at, l.admin_notes, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text FROM public.loan_requests l LEFT JOIN auth.users au ON l.user_id = au.id LEFT JOIN public.profiles p ON l.user_id = p.user_id ORDER BY l.created_at DESC;
END; $$;

CREATE FUNCTION public.admin_get_all_external_transfers()
RETURNS TABLE(id uuid, user_id uuid, from_account_id uuid, bank_id uuid, bank_name text, recipient_name text, recipient_account_number text, amount numeric, memo text, status text, created_at timestamptz, user_email text, user_name text, account_number text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT et.id, et.user_id, et.from_account_id, et.bank_id, COALESCE(b.bank_name, '')::text, et.recipient_name, et.recipient_account_number, et.amount, COALESCE(et.memo, '')::text, et.status, et.created_at, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text, COALESCE(a.account_number, '')::text FROM public.external_transfers et LEFT JOIN public.us_banks b ON et.bank_id = b.id LEFT JOIN auth.users au ON et.user_id = au.id LEFT JOIN public.profiles p ON et.user_id = p.user_id LEFT JOIN public.accounts a ON et.from_account_id = a.id ORDER BY et.created_at DESC;
END; $$;

CREATE FUNCTION public.admin_get_all_wire_transfers()
RETURNS TABLE(id uuid, user_id uuid, wire_type text, recipient_name text, recipient_bank text, amount numeric, currency text, fee_amount numeric, status text, purpose text, created_at timestamptz, user_email text, user_name text, account_number text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT wt.id, wt.user_id, wt.wire_type, wt.recipient_name, wt.recipient_bank, wt.amount, wt.currency, COALESCE(wt.fee_amount, 0)::numeric, wt.status, COALESCE(wt.purpose, '')::text, wt.created_at, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text, COALESCE(a.account_number, '')::text FROM public.wire_transfers wt LEFT JOIN auth.users au ON wt.user_id = au.id LEFT JOIN public.profiles p ON wt.user_id = p.user_id LEFT JOIN public.accounts a ON wt.from_account_id = a.id ORDER BY wt.created_at DESC;
END; $$;

CREATE FUNCTION public.admin_get_all_check_deposits()
RETURNS TABLE(id uuid, user_id uuid, account_id uuid, check_number text, check_amount numeric, payer_name text, status text, hold_days int, created_at timestamptz, user_email text, user_name text, account_number text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT cd.id, cd.user_id, cd.account_id, cd.check_number, cd.check_amount, cd.payer_name, cd.status, COALESCE(cd.hold_days, 3)::int, cd.created_at, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text, COALESCE(a.account_number, '')::text FROM public.check_deposits cd LEFT JOIN auth.users au ON cd.user_id = au.id LEFT JOIN public.profiles p ON cd.user_id = p.user_id LEFT JOIN public.accounts a ON cd.account_id = a.id ORDER BY cd.created_at DESC;
END; $$;

CREATE FUNCTION public.admin_get_all_cards()
RETURNS TABLE(id uuid, user_id uuid, account_id uuid, card_number text, card_type text, card_status text, expiry_date text, daily_limit numeric, is_contactless boolean, created_at timestamptz, user_email text, user_name text, account_number text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT c.id, c.user_id, c.account_id, c.card_number, c.card_type, c.card_status, c.expiry_date, COALESCE(c.daily_limit, 5000)::numeric, COALESCE(c.is_contactless, true)::boolean, c.created_at, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text, COALESCE(a.account_number, '')::text FROM public.cards c LEFT JOIN auth.users au ON c.user_id = au.id LEFT JOIN public.profiles p ON c.user_id = p.user_id LEFT JOIN public.accounts a ON c.account_id = a.id ORDER BY c.created_at DESC;
END; $$;

CREATE FUNCTION public.admin_get_all_beneficiaries()
RETURNS TABLE(id uuid, user_id uuid, nickname text, account_number text, bank_name text, beneficiary_type text, is_verified boolean, status text, created_at timestamptz, user_email text, user_name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT b.id, b.user_id, b.nickname, b.account_number, COALESCE(b.bank_name, '')::text, b.beneficiary_type, COALESCE(b.is_verified, false)::boolean, b.status, b.created_at, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text FROM public.beneficiaries b LEFT JOIN auth.users au ON b.user_id = au.id LEFT JOIN public.profiles p ON b.user_id = p.user_id ORDER BY b.created_at DESC;
END; $$;

NOTIFY pgrst, 'reload schema';
