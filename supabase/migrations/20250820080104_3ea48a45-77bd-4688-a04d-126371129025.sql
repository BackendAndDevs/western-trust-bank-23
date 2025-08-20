-- Remove foreign key constraints referencing auth.users and create Donnie Wahlberg account
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_user_id_fkey;
ALTER TABLE public.accounts DROP CONSTRAINT IF EXISTS accounts_modified_by_fkey;

-- Create Donnie Wahlberg celebrity demo account
DO $$
DECLARE
  donnie_user_id uuid;
  donnie_account_id uuid;
BEGIN
  -- Generate user ID
  donnie_user_id := gen_random_uuid();
  
  -- Create profile for Donnie Wahlberg
  INSERT INTO public.profiles (user_id, full_name, account_type, account_status)
  VALUES (donnie_user_id, 'Donnie Wahlberg (realdonniewahlberg@gmail.com)', 'personal', 'active');
  
  -- Create primary account with $250M balance
  INSERT INTO public.accounts (user_id, account_number, account_type, balance, is_primary, currency)
  VALUES (
    donnie_user_id,
    public.generate_account_number(),
    'checking',
    250000000.00,
    true,
    'USD'
  )
  RETURNING id INTO donnie_account_id;
  
  -- Set user role as user
  INSERT INTO public.user_roles (user_id, role)
  VALUES (donnie_user_id, 'user');
  
  -- Add celebrity-style transaction history
  INSERT INTO public.transactions (user_id, account_id, transaction_type, amount, description, status, created_at) VALUES
    -- Recent luxury purchases
    (donnie_user_id, donnie_account_id, 'withdraw', 2500000.00, 'Real Estate - Boston Penthouse Purchase', 'completed', now() - interval '2 days'),
    (donnie_user_id, donnie_account_id, 'withdraw', 350000.00, 'Lamborghini Aventador SVJ', 'completed', now() - interval '5 days'),
    (donnie_user_id, donnie_account_id, 'withdraw', 125000.00, 'Private Jet Charter - LA to NYC', 'completed', now() - interval '1 week'),
    (donnie_user_id, donnie_account_id, 'withdraw', 75000.00, 'Charity Donation - Boston Children''s Hospital', 'completed', now() - interval '10 days'),
    (donnie_user_id, donnie_account_id, 'withdraw', 45000.00, 'Rolex Submariner Collection', 'completed', now() - interval '2 weeks'),
    (donnie_user_id, donnie_account_id, 'withdraw', 25000.00, 'Morton''s Steakhouse - Private Event', 'completed', now() - interval '3 weeks'),
    
    -- Entertainment industry payments
    (donnie_user_id, donnie_account_id, 'deposit', 5000000.00, 'Blue Bloods Season Payment', 'completed', now() - interval '1 month'),
    (donnie_user_id, donnie_account_id, 'deposit', 2500000.00, 'NKOTB Tour Revenue Share', 'completed', now() - interval '6 weeks'),
    (donnie_user_id, donnie_account_id, 'withdraw', 180000.00, 'Studio Recording Session - Abbey Road', 'completed', now() - interval '2 months'),
    
    -- Lifestyle expenses
    (donnie_user_id, donnie_account_id, 'withdraw', 15000.00, 'Personal Trainer - Monthly Fee', 'completed', now() - interval '1 week'),
    (donnie_user_id, donnie_account_id, 'withdraw', 8500.00, 'Chef Services - Weekly Meal Prep', 'completed', now() - interval '3 days'),
    (donnie_user_id, donnie_account_id, 'withdraw', 12000.00, 'Wahlburgers Investment', 'completed', now() - interval '3 weeks'),
    (donnie_user_id, donnie_account_id, 'withdraw', 95000.00, 'Home Theater System Upgrade', 'completed', now() - interval '1 month'),
    (donnie_user_id, donnie_account_id, 'withdraw', 220000.00, 'Art Collection - Basquiat Piece', 'completed', now() - interval '5 weeks'),
    
    -- Family and personal
    (donnie_user_id, donnie_account_id, 'withdraw', 50000.00, 'Family Vacation - European Tour', 'completed', now() - interval '3 months'),
    (donnie_user_id, donnie_account_id, 'withdraw', 35000.00, 'Kids College Fund Contribution', 'completed', now() - interval '2 months'),
    (donnie_user_id, donnie_account_id, 'withdraw', 18000.00, 'Personal Security Detail', 'completed', now() - interval '1 week'),
    
    -- Investment activities  
    (donnie_user_id, donnie_account_id, 'deposit', 750000.00, 'Stock Portfolio Gains - Apple', 'completed', now() - interval '6 weeks'),
    (donnie_user_id, donnie_account_id, 'withdraw', 1200000.00, 'Real Estate Investment - Miami Condo', 'completed', now() - interval '4 months'),
    (donnie_user_id, donnie_account_id, 'deposit', 425000.00, 'Royalty Payment - Music Catalog', 'completed', now() - interval '3 months');
    
END $$;