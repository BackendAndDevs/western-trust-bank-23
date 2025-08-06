-- Create user profiles table for additional user information
CREATE TABLE public.profiles (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  phone_number TEXT,
  address TEXT,
  date_of_birth DATE,
  account_type TEXT DEFAULT 'personal' CHECK (account_type IN ('personal', 'business')),
  account_status TEXT DEFAULT 'active' CHECK (account_status IN ('active', 'suspended', 'closed')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create accounts table for banking accounts
CREATE TABLE public.accounts (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_number TEXT NOT NULL UNIQUE,
  account_type TEXT NOT NULL CHECK (account_type IN ('checking', 'savings', 'business')),
  balance DECIMAL(15,2) NOT NULL DEFAULT 0.00 CHECK (balance >= 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  is_primary BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create transactions table
CREATE TABLE public.transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL CHECK (transaction_type IN ('deposit', 'withdrawal', 'transfer_in', 'transfer_out', 'fee')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  currency TEXT NOT NULL DEFAULT 'USD',
  description TEXT NOT NULL,
  recipient_account_id UUID REFERENCES public.accounts(id),
  recipient_info JSONB,
  status TEXT DEFAULT 'completed' CHECK (status IN ('pending', 'completed', 'failed', 'cancelled')),
  reference_number TEXT UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create loan requests table
CREATE TABLE public.loan_requests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  loan_type TEXT NOT NULL CHECK (loan_type IN ('personal', 'auto', 'mortgage', 'business')),
  amount DECIMAL(15,2) NOT NULL CHECK (amount > 0),
  purpose TEXT NOT NULL,
  annual_income DECIMAL(15,2),
  employment_status TEXT,
  credit_score INTEGER,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'cancelled')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create cards table for debit/credit cards
CREATE TABLE public.cards (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  account_id UUID NOT NULL REFERENCES public.accounts(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  card_number TEXT NOT NULL UNIQUE,
  card_type TEXT NOT NULL CHECK (card_type IN ('debit', 'credit')),
  card_status TEXT DEFAULT 'active' CHECK (card_status IN ('active', 'blocked', 'expired', 'cancelled')),
  expiry_date DATE NOT NULL,
  daily_limit DECIMAL(10,2) DEFAULT 1000.00,
  is_contactless BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.accounts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loan_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cards ENABLE ROW LEVEL SECURITY;

-- Create policies for profiles
CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for accounts
CREATE POLICY "Users can view their own accounts" 
ON public.accounts 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own accounts" 
ON public.accounts 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own accounts" 
ON public.accounts 
FOR UPDATE 
USING (auth.uid() = user_id);

-- Create policies for transactions
CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for loan requests
CREATE POLICY "Users can view their own loan requests" 
ON public.loan_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loan requests" 
ON public.loan_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Create policies for cards
CREATE POLICY "Users can view their own cards" 
ON public.cards 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cards" 
ON public.cards 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admin policies (for admin dashboard)
CREATE POLICY "Admins can view all profiles" 
ON public.profiles 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
));

CREATE POLICY "Admins can manage all accounts" 
ON public.accounts 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
));

CREATE POLICY "Admins can manage all transactions" 
ON public.transactions 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
));

CREATE POLICY "Admins can manage all loan requests" 
ON public.loan_requests 
FOR ALL 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE user_id = auth.uid() 
  AND EXISTS (SELECT 1 FROM auth.users WHERE id = auth.uid() AND raw_user_meta_data->>'role' = 'admin')
));

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_accounts_updated_at
  BEFORE UPDATE ON public.accounts
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_loan_requests_updated_at
  BEFORE UPDATE ON public.loan_requests
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_cards_updated_at
  BEFORE UPDATE ON public.cards
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create function to handle new user profile creation
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$$;

-- Create trigger to automatically create profile when user signs up
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to generate account numbers
CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS TEXT AS $$
DECLARE
  account_num TEXT;
BEGIN
  -- Generate a 10-digit account number
  account_num := 'WTB' || LPAD(floor(random() * 10000000)::TEXT, 7, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.accounts WHERE account_number = account_num) LOOP
    account_num := 'WTB' || LPAD(floor(random() * 10000000)::TEXT, 7, '0');
  END LOOP;
  
  RETURN account_num;
END;
$$ LANGUAGE plpgsql;

-- Create function to generate card numbers
CREATE OR REPLACE FUNCTION public.generate_card_number()
RETURNS TEXT AS $$
DECLARE
  card_num TEXT;
BEGIN
  -- Generate a 16-digit card number starting with 4000 (test visa)
  card_num := '4000' || LPAD(floor(random() * 1000000000000)::TEXT, 12, '0');
  
  -- Ensure uniqueness
  WHILE EXISTS (SELECT 1 FROM public.cards WHERE card_number = card_num) LOOP
    card_num := '4000' || LPAD(floor(random() * 1000000000000)::TEXT, 12, '0');
  END LOOP;
  
  RETURN card_num;
END;
$$ LANGUAGE plpgsql;

-- Create indexes for better performance
CREATE INDEX idx_accounts_user_id ON public.accounts(user_id);
CREATE INDEX idx_transactions_account_id ON public.transactions(account_id);
CREATE INDEX idx_transactions_user_id ON public.transactions(user_id);
CREATE INDEX idx_transactions_created_at ON public.transactions(created_at DESC);
CREATE INDEX idx_loan_requests_user_id ON public.loan_requests(user_id);
CREATE INDEX idx_cards_account_id ON public.cards(account_id);
CREATE INDEX idx_profiles_user_id ON public.profiles(user_id);