
-- Drop functions that need signature changes
DROP FUNCTION IF EXISTS public.admin_get_all_bills();
DROP FUNCTION IF EXISTS public.admin_get_all_recurring_transfers();

-- Recreate with correct types
CREATE OR REPLACE FUNCTION public.admin_get_all_bills()
RETURNS TABLE(id uuid, user_id uuid, biller_name text, amount numeric, due_date date, status text, category text, auto_pay boolean, created_at timestamptz, user_email text, user_name text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT bi.id, bi.user_id, bi.biller_name, bi.amount, bi.due_date, bi.status, bi.category, bi.auto_pay, bi.created_at, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text FROM public.bills bi LEFT JOIN auth.users au ON bi.user_id = au.id LEFT JOIN public.profiles p ON bi.user_id = p.user_id ORDER BY bi.created_at DESC;
END; $$;

CREATE OR REPLACE FUNCTION public.admin_get_all_recurring_transfers()
RETURNS TABLE(id uuid, user_id uuid, from_account_id uuid, to_account_number text, amount numeric, frequency text, next_execution_date date, active boolean, memo text, created_at timestamptz, user_email text, user_name text, account_number text)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY SELECT rt.id, rt.user_id, rt.from_account_id, rt.to_account_number, rt.amount, rt.frequency, rt.next_execution_date, rt.active, COALESCE(rt.memo, '')::text, rt.created_at, COALESCE(au.email, '')::text, COALESCE(p.full_name, '')::text, COALESCE(a.account_number, '')::text FROM public.recurring_transfers rt LEFT JOIN auth.users au ON rt.user_id = au.id LEFT JOIN public.profiles p ON rt.user_id = p.user_id LEFT JOIN public.accounts a ON rt.from_account_id = a.id ORDER BY rt.created_at DESC;
END; $$;

NOTIFY pgrst, 'reload schema';
