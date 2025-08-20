-- Fix security issues and add missing RLS policies

-- 1. Add missing RLS policies for cards table (CRITICAL SECURITY FIX)
CREATE POLICY "Users can update their own cards" 
ON public.cards 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cards" 
ON public.cards 
FOR DELETE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all cards" 
ON public.cards 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND (users.raw_user_meta_data ->> 'role') = 'admin'
  )
);

-- 2. Fix function search paths (SECURITY FIX)
CREATE OR REPLACE FUNCTION public.has_role(_user_id uuid, _role text)
 RETURNS boolean
 LANGUAGE sql
 STABLE SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_account_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

CREATE OR REPLACE FUNCTION public.generate_card_number()
 RETURNS text
 LANGUAGE plpgsql
 SECURITY DEFINER
 SET search_path TO 'public'
AS $function$
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
$function$;

-- 3. Create banks table for real US banking support
CREATE TABLE public.us_banks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  routing_number TEXT NOT NULL UNIQUE,
  swift_code TEXT,
  bank_code TEXT,
  state TEXT,
  city TEXT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS for banks table
ALTER TABLE public.us_banks ENABLE ROW LEVEL SECURITY;

-- Allow everyone to read bank information (public data)
CREATE POLICY "Banks are viewable by everyone" 
ON public.us_banks 
FOR SELECT 
USING (active = true);

-- Only admins can manage banks
CREATE POLICY "Admins can manage banks" 
ON public.us_banks 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND (users.raw_user_meta_data ->> 'role') = 'admin'
  )
);

-- 4. Create external transfers table for real banking transfers
CREATE TABLE public.external_transfers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  from_account_id UUID REFERENCES public.accounts(id),
  to_bank_id UUID REFERENCES public.us_banks(id),
  to_account_number TEXT NOT NULL,
  to_account_holder_name TEXT NOT NULL,
  amount NUMERIC NOT NULL CHECK (amount > 0),
  transfer_type TEXT NOT NULL CHECK (transfer_type IN ('deposit', 'withdrawal', 'transfer')),
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'processing', 'completed', 'failed', 'cancelled')),
  reference_number TEXT UNIQUE DEFAULT ('EXT' || EXTRACT(EPOCH FROM now())::TEXT || LPAD(floor(random() * 10000)::TEXT, 4, '0')),
  fee_amount NUMERIC DEFAULT 0,
  processing_time_hours INTEGER DEFAULT 24,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  processed_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE
);

-- Enable RLS for external transfers
ALTER TABLE public.external_transfers ENABLE ROW LEVEL SECURITY;

-- Users can only see their own external transfers
CREATE POLICY "Users can view their own external transfers" 
ON public.external_transfers 
FOR SELECT 
USING (auth.uid() = user_id);

-- Users can create their own external transfers
CREATE POLICY "Users can create their own external transfers" 
ON public.external_transfers 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Admins can manage all external transfers
CREATE POLICY "Admins can manage all external transfers" 
ON public.external_transfers 
FOR ALL 
USING (
  EXISTS (
    SELECT 1 FROM auth.users 
    WHERE users.id = auth.uid() 
    AND (users.raw_user_meta_data ->> 'role') = 'admin'
  )
);

-- 5. Insert major US banks data
INSERT INTO public.us_banks (name, routing_number, swift_code, state, city) VALUES
('JPMorgan Chase Bank', '021000021', 'CHASUS33', 'NY', 'New York'),
('Bank of America', '011401533', 'BOFAUS3N', 'NC', 'Charlotte'),
('Wells Fargo Bank', '121000248', 'WFBIUS6S', 'CA', 'San Francisco'),
('Citibank', '021000089', 'CITIUS33', 'NY', 'New York'),
('U.S. Bank', '091000022', 'USBKUS44', 'MN', 'Minneapolis'),
('PNC Bank', '043002900', 'PNCCUS33', 'PA', 'Pittsburgh'),
('Goldman Sachs Bank', '124085066', 'GSCHUS33', 'NY', 'New York'),
('TD Bank', '031101266', 'NRTHUS33', 'DE', 'Wilmington'),
('Capital One Bank', '065000090', 'HIBKUS44', 'VA', 'McLean'),
('HSBC Bank USA', '021001088', 'MRMDUS33', 'NY', 'New York'),
('Morgan Stanley Bank', '011401533', 'MSDOUS33', 'NY', 'New York'),
('American Express Bank', '124085066', 'AEXPUS33', 'UT', 'Salt Lake City'),
('Discover Bank', '011401533', 'DISCUS33', 'DE', 'New Castle'),
('Charles Schwab Bank', '121202211', 'SCHUS33', 'CA', 'Westlake'),
('Ally Bank', '124085066', 'ALLYUS33', 'UT', 'Midvale'),
('SunTrust Bank', '061000104', 'SNTRUS3A', 'GA', 'Atlanta'),
('BB&T Bank', '053000196', 'BRBTUS33', 'NC', 'Winston-Salem'),
('Fifth Third Bank', '042000314', 'FTBCUS3C', 'OH', 'Cincinnati'),
('KeyBank', '041001039', 'KEYBUS33', 'OH', 'Cleveland'),
('Regions Bank', '062000019', 'REGIUS44', 'AL', 'Birmingham'),
('M&T Bank', '022000046', 'MNTBUS33', 'NY', 'Buffalo'),
('Huntington Bank', '044000024', 'HUNTUS33', 'OH', 'Columbus'),
('Comerica Bank', '072000096', 'MNBDUS33', 'TX', 'Dallas'),
('Zions Bank', '124000054', 'ZBNAUTS4', 'UT', 'Salt Lake City'),
('First Citizens Bank', '053207766', 'FCBTUS33', 'NC', 'Raleigh');

-- 6. Create function to process external transfers
CREATE OR REPLACE FUNCTION public.process_external_transfer(
  p_user_id UUID,
  p_from_account_id UUID,
  p_to_bank_id UUID,
  p_to_account_number TEXT,
  p_to_account_holder_name TEXT,
  p_amount NUMERIC,
  p_transfer_type TEXT,
  p_description TEXT DEFAULT NULL
)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
DECLARE
  v_account_balance NUMERIC;
  v_transfer_id UUID;
  v_fee_amount NUMERIC := 0;
  v_result JSON;
BEGIN
  -- Validate transfer type
  IF p_transfer_type NOT IN ('deposit', 'withdrawal', 'transfer') THEN
    RETURN json_build_object('success', false, 'error', 'Invalid transfer type');
  END IF;

  -- For withdrawals and transfers, check account balance
  IF p_transfer_type IN ('withdrawal', 'transfer') THEN
    SELECT balance INTO v_account_balance 
    FROM public.accounts 
    WHERE id = p_from_account_id AND user_id = p_user_id;
    
    IF v_account_balance IS NULL THEN
      RETURN json_build_object('success', false, 'error', 'Account not found');
    END IF;
    
    -- Calculate fee (example: $25 for external transfers over $1000)
    IF p_amount > 1000 THEN
      v_fee_amount := 25.00;
    END IF;
    
    IF v_account_balance < (p_amount + v_fee_amount) THEN
      RETURN json_build_object('success', false, 'error', 'Insufficient funds');
    END IF;
  END IF;

  -- Create external transfer record
  INSERT INTO public.external_transfers (
    user_id,
    from_account_id,
    to_bank_id,
    to_account_number,
    to_account_holder_name,
    amount,
    transfer_type,
    description,
    fee_amount,
    status
  ) VALUES (
    p_user_id,
    p_from_account_id,
    p_to_bank_id,
    p_to_account_number,
    p_to_account_holder_name,
    p_amount,
    p_transfer_type,
    COALESCE(p_description, 'External ' || p_transfer_type),
    v_fee_amount,
    'pending'
  ) RETURNING id INTO v_transfer_id;

  -- Create corresponding transaction record
  INSERT INTO public.transactions (
    user_id,
    account_id,
    transaction_type,
    amount,
    description,
    status,
    reference_number
  ) VALUES (
    p_user_id,
    p_from_account_id,
    'external_' || p_transfer_type,
    p_amount,
    COALESCE(p_description, 'External ' || p_transfer_type || ' - Pending'),
    'pending',
    (SELECT reference_number FROM public.external_transfers WHERE id = v_transfer_id)
  );

  RETURN json_build_object(
    'success', true, 
    'transfer_id', v_transfer_id,
    'fee_amount', v_fee_amount,
    'message', 'External transfer initiated successfully'
  );
END;
$$;