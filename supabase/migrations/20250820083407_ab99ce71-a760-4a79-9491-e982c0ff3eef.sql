-- Update realdonniewahlberg112@gmail.com user balance to $250 million
DO $$
DECLARE
  target_user_id uuid := '68fb6c50-9eb0-46bd-9e61-34aebfeda7bb';
  user_account_id uuid;
BEGIN
  -- Check if user has an account, if not create one
  SELECT id INTO user_account_id 
  FROM public.accounts 
  WHERE user_id = target_user_id;
  
  IF user_account_id IS NULL THEN
    -- Create account for the user
    INSERT INTO public.accounts (user_id, account_number, account_type, balance, is_primary, currency)
    VALUES (
      target_user_id,
      public.generate_account_number(),
      'checking',
      250000000.00, -- $250 million
      true,
      'USD'
    )
    RETURNING id INTO user_account_id;
    
    -- Add initial deposit transaction
    INSERT INTO public.transactions (user_id, account_id, transaction_type, amount, description, status, created_at) 
    VALUES (
      target_user_id,
      user_account_id,
      'deposit',
      250000000.00,
      'VIP Account Setup - $250M Initial Balance',
      'completed',
      now()
    );
  ELSE
    -- Update existing account balance
    UPDATE public.accounts 
    SET balance = 250000000.00
    WHERE id = user_account_id;
    
    -- Add balance adjustment transaction
    INSERT INTO public.transactions (user_id, account_id, transaction_type, amount, description, status, created_at) 
    VALUES (
      target_user_id,
      user_account_id,
      'admin_credit',
      250000000.00,
      'Admin Balance Adjustment - Set to $250M',
      'completed',
      now()
    );
  END IF;
END $$;