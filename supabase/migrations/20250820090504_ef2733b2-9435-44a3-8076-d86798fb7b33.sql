-- Debug and fix account balance visibility for users
-- First, let's check if there are any RLS policy issues

-- Update the user account viewing policy to be more explicit
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;

CREATE POLICY "Users can view their own accounts" 
ON public.accounts 
FOR SELECT 
TO authenticated
USING (auth.uid() = user_id);

-- Also ensure the fetchAccounts function works properly by adding debug logging
-- Let's also make sure the account creation works with proper balance visibility

-- Create a function to debug account access
CREATE OR REPLACE FUNCTION debug_user_accounts(target_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  debug_info text,
  account_id uuid,
  user_id uuid,
  balance numeric,
  account_number text
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = 'public'
AS $$
BEGIN
  -- Use current user if no target specified
  IF target_user_id IS NULL THEN
    target_user_id := auth.uid();
  END IF;
  
  RETURN QUERY
  SELECT 
    'Account found for user: ' || target_user_id::text as debug_info,
    a.id as account_id,
    a.user_id,
    a.balance,
    a.account_number
  FROM public.accounts a
  WHERE a.user_id = target_user_id;
END;
$$;