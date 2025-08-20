-- Create accounts for all users who don't have accounts yet
DO $$
DECLARE
  user_record record;
  new_account_id uuid;
BEGIN
  -- Loop through all profiles that don't have accounts
  FOR user_record IN 
    SELECT p.user_id, p.full_name 
    FROM public.profiles p 
    LEFT JOIN public.accounts a ON a.user_id = p.user_id 
    WHERE a.user_id IS NULL
  LOOP
    -- Create primary account for each user
    INSERT INTO public.accounts (user_id, account_number, account_type, balance, is_primary, currency)
    VALUES (
      user_record.user_id,
      public.generate_account_number(),
      'checking',
      250000.00, -- $250k for all new users
      true,
      'USD'
    );
    
    -- Add some sample transactions for better demo experience
    INSERT INTO public.transactions (user_id, account_id, transaction_type, amount, description, status, created_at) 
    SELECT 
      user_record.user_id,
      a.id,
      'deposit',
      250000.00,
      'Welcome Bonus - Account Setup',
      'completed',
      now() - interval '1 day'
    FROM public.accounts a 
    WHERE a.user_id = user_record.user_id AND a.is_primary = true;
    
  END LOOP;
  
  -- Update the most recent user to have extra balance for demo
  UPDATE public.accounts 
  SET balance = 250000.00
  WHERE user_id = (
    SELECT user_id FROM public.profiles 
    WHERE full_name NOT LIKE 'Donnie%' 
    ORDER BY created_at DESC 
    LIMIT 1
  );
  
END $$;