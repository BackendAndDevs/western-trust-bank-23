
CREATE OR REPLACE FUNCTION public.admin_update_account_status(
  target_user_id UUID,
  new_status TEXT,
  admin_notes TEXT DEFAULT NULL
)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  
  UPDATE public.profiles
  SET account_status = new_status, updated_at = now()
  WHERE user_id = target_user_id;
  
  IF NOT FOUND THEN
    RETURN json_build_object('success', false, 'error', 'User not found');
  END IF;
  
  RETURN json_build_object('success', true);
END;
$$;
