
-- =============================================
-- INVESTMENT PORTFOLIO TABLES
-- =============================================

-- Available assets (admin-managed simulated prices)
CREATE TABLE public.assets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  symbol TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  asset_type TEXT NOT NULL DEFAULT 'stock', -- stock, etf, bond, mutual_fund, crypto
  current_price NUMERIC NOT NULL DEFAULT 0,
  previous_price NUMERIC NOT NULL DEFAULT 0,
  currency TEXT NOT NULL DEFAULT 'USD',
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- User portfolio holdings
CREATE TABLE public.portfolio_holdings (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_id UUID NOT NULL REFERENCES public.assets(id),
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_buy_price NUMERIC NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id, asset_id)
);

-- Portfolio transactions (buy/sell)
CREATE TABLE public.portfolio_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  asset_id UUID NOT NULL REFERENCES public.assets(id),
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  transaction_type TEXT NOT NULL, -- buy, sell
  quantity NUMERIC NOT NULL,
  price_per_unit NUMERIC NOT NULL,
  total_amount NUMERIC NOT NULL,
  fee_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- CURRENCY EXCHANGE TABLES
-- =============================================

-- Exchange rates (admin-managed)
CREATE TABLE public.exchange_rates (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  rate NUMERIC NOT NULL,
  spread NUMERIC NOT NULL DEFAULT 0.02,
  is_active BOOLEAN NOT NULL DEFAULT true,
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(from_currency, to_currency)
);

-- Currency exchange transactions
CREATE TABLE public.currency_exchanges (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  account_id UUID NOT NULL REFERENCES public.accounts(id),
  from_currency TEXT NOT NULL,
  to_currency TEXT NOT NULL,
  from_amount NUMERIC NOT NULL,
  to_amount NUMERIC NOT NULL,
  exchange_rate NUMERIC NOT NULL,
  fee_amount NUMERIC NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'completed',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- SUPPORT TICKETING & CHAT TABLES
-- =============================================

-- Support tickets
CREATE TABLE public.support_tickets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  subject TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'general', -- general, account, transaction, card, technical
  priority TEXT NOT NULL DEFAULT 'medium', -- low, medium, high, urgent
  status TEXT NOT NULL DEFAULT 'open', -- open, in_progress, resolved, closed
  assigned_to UUID,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Ticket messages (threaded)
CREATE TABLE public.ticket_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ticket_id UUID NOT NULL REFERENCES public.support_tickets(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'user', -- user, admin
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Live chat sessions
CREATE TABLE public.chat_sessions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  status TEXT NOT NULL DEFAULT 'active', -- active, closed
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  closed_at TIMESTAMP WITH TIME ZONE
);

-- Live chat messages
CREATE TABLE public.chat_messages (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  session_id UUID NOT NULL REFERENCES public.chat_sessions(id) ON DELETE CASCADE,
  sender_id UUID NOT NULL,
  sender_type TEXT NOT NULL DEFAULT 'user', -- user, admin
  message TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- =============================================
-- RLS POLICIES
-- =============================================

-- Assets: public read
ALTER TABLE public.assets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view active assets" ON public.assets FOR SELECT USING (true);

-- Portfolio holdings
ALTER TABLE public.portfolio_holdings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own holdings" ON public.portfolio_holdings FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own holdings" ON public.portfolio_holdings FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own holdings" ON public.portfolio_holdings FOR UPDATE USING (auth.uid() = user_id);

-- Portfolio transactions
ALTER TABLE public.portfolio_transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own portfolio transactions" ON public.portfolio_transactions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own portfolio transactions" ON public.portfolio_transactions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Exchange rates: public read
ALTER TABLE public.exchange_rates ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view exchange rates" ON public.exchange_rates FOR SELECT USING (true);

-- Currency exchanges
ALTER TABLE public.currency_exchanges ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own exchanges" ON public.currency_exchanges FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert their own exchanges" ON public.currency_exchanges FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Support tickets
ALTER TABLE public.support_tickets ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own tickets" ON public.support_tickets FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own tickets" ON public.support_tickets FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own tickets" ON public.support_tickets FOR UPDATE USING (auth.uid() = user_id);

-- Ticket messages
ALTER TABLE public.ticket_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages for their tickets" ON public.ticket_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid())
);
CREATE POLICY "Users can send messages on their tickets" ON public.ticket_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.support_tickets WHERE id = ticket_id AND user_id = auth.uid()) OR
  public.has_role(auth.uid(), 'admin')
);

-- Chat sessions
ALTER TABLE public.chat_sessions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view their own chat sessions" ON public.chat_sessions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own chat sessions" ON public.chat_sessions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own chat sessions" ON public.chat_sessions FOR UPDATE USING (auth.uid() = user_id);

-- Chat messages
ALTER TABLE public.chat_messages ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users can view messages in their sessions" ON public.chat_messages FOR SELECT USING (
  EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND user_id = auth.uid())
);
CREATE POLICY "Users can send messages in their sessions" ON public.chat_messages FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM public.chat_sessions WHERE id = session_id AND user_id = auth.uid()) OR
  public.has_role(auth.uid(), 'admin')
);

-- Enable realtime for chat
ALTER PUBLICATION supabase_realtime ADD TABLE public.chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE public.ticket_messages;

-- =============================================
-- SEED DATA: Sample assets & exchange rates
-- =============================================

INSERT INTO public.assets (symbol, name, asset_type, current_price, previous_price) VALUES
  ('AAPL', 'Apple Inc.', 'stock', 189.50, 187.20),
  ('GOOGL', 'Alphabet Inc.', 'stock', 141.80, 140.50),
  ('MSFT', 'Microsoft Corp.', 'stock', 378.90, 375.60),
  ('AMZN', 'Amazon.com Inc.', 'stock', 178.25, 176.80),
  ('TSLA', 'Tesla Inc.', 'stock', 248.50, 252.10),
  ('SPY', 'SPDR S&P 500 ETF', 'etf', 502.30, 500.15),
  ('QQQ', 'Invesco QQQ Trust', 'etf', 431.20, 428.90),
  ('VTI', 'Vanguard Total Stock', 'etf', 245.60, 244.30),
  ('BND', 'Vanguard Total Bond', 'bond', 72.50, 72.30),
  ('AGG', 'iShares Core US Aggregate Bond', 'bond', 98.20, 98.00),
  ('VFIAX', 'Vanguard 500 Index', 'mutual_fund', 428.50, 426.80),
  ('FXAIX', 'Fidelity 500 Index', 'mutual_fund', 182.30, 181.50),
  ('BTC', 'Bitcoin', 'crypto', 67250.00, 66800.00),
  ('ETH', 'Ethereum', 'crypto', 3520.00, 3480.00),
  ('SOL', 'Solana', 'crypto', 142.80, 139.50);

INSERT INTO public.exchange_rates (from_currency, to_currency, rate, spread) VALUES
  ('USD', 'EUR', 0.9230, 0.015),
  ('USD', 'GBP', 0.7920, 0.015),
  ('USD', 'JPY', 149.50, 0.02),
  ('USD', 'CAD', 1.3580, 0.015),
  ('USD', 'AUD', 1.5320, 0.015),
  ('USD', 'CHF', 0.8780, 0.015),
  ('EUR', 'USD', 1.0834, 0.015),
  ('GBP', 'USD', 1.2626, 0.015),
  ('EUR', 'GBP', 0.8580, 0.015);

-- =============================================
-- ADMIN FUNCTIONS FOR NEW FEATURES
-- =============================================

-- Admin: get all support tickets
CREATE OR REPLACE FUNCTION public.admin_get_all_tickets()
RETURNS TABLE(
  id UUID, user_id UUID, subject TEXT, category TEXT, priority TEXT, 
  status TEXT, created_at TIMESTAMPTZ, updated_at TIMESTAMPTZ,
  user_email TEXT, user_name TEXT, message_count BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
    SELECT t.id, t.user_id, t.subject, t.category, t.priority, t.status,
           t.created_at, t.updated_at,
           COALESCE(au.email, '')::TEXT, COALESCE(p.full_name, '')::TEXT,
           COUNT(tm.id)::BIGINT
    FROM public.support_tickets t
    LEFT JOIN auth.users au ON t.user_id = au.id
    LEFT JOIN public.profiles p ON t.user_id = p.user_id
    LEFT JOIN public.ticket_messages tm ON tm.ticket_id = t.id
    GROUP BY t.id, au.email, p.full_name
    ORDER BY t.created_at DESC;
END; $$;

-- Admin: get all chat sessions
CREATE OR REPLACE FUNCTION public.admin_get_all_chat_sessions()
RETURNS TABLE(
  id UUID, user_id UUID, status TEXT, created_at TIMESTAMPTZ, closed_at TIMESTAMPTZ,
  user_email TEXT, user_name TEXT, message_count BIGINT
)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
    SELECT cs.id, cs.user_id, cs.status, cs.created_at, cs.closed_at,
           COALESCE(au.email, '')::TEXT, COALESCE(p.full_name, '')::TEXT,
           COUNT(cm.id)::BIGINT
    FROM public.chat_sessions cs
    LEFT JOIN auth.users au ON cs.user_id = au.id
    LEFT JOIN public.profiles p ON cs.user_id = p.user_id
    LEFT JOIN public.chat_messages cm ON cm.session_id = cs.id
    GROUP BY cs.id, au.email, p.full_name
    ORDER BY cs.created_at DESC;
END; $$;

-- Admin: update asset price
CREATE OR REPLACE FUNCTION public.admin_update_asset_price(p_asset_id UUID, p_new_price NUMERIC)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  UPDATE public.assets SET previous_price = current_price, current_price = p_new_price, updated_at = now() WHERE id = p_asset_id;
  RETURN json_build_object('success', true);
END; $$;

-- Admin: update exchange rate
CREATE OR REPLACE FUNCTION public.admin_update_exchange_rate(p_rate_id UUID, p_new_rate NUMERIC)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  UPDATE public.exchange_rates SET rate = p_new_rate, updated_at = now() WHERE id = p_rate_id;
  RETURN json_build_object('success', true);
END; $$;

-- Admin: update ticket status
CREATE OR REPLACE FUNCTION public.admin_update_ticket_status(p_ticket_id UUID, p_status TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  UPDATE public.support_tickets SET status = p_status, updated_at = now() WHERE id = p_ticket_id;
  RETURN json_build_object('success', true);
END; $$;

-- Admin: send ticket message (bypasses user RLS)
CREATE OR REPLACE FUNCTION public.admin_send_ticket_message(p_ticket_id UUID, p_message TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  INSERT INTO public.ticket_messages (ticket_id, sender_id, sender_type, message)
  VALUES (p_ticket_id, auth.uid(), 'admin', p_message);
  UPDATE public.support_tickets SET status = 'in_progress', updated_at = now() WHERE id = p_ticket_id AND status = 'open';
  RETURN json_build_object('success', true);
END; $$;

-- Admin: send chat message (bypasses user RLS)
CREATE OR REPLACE FUNCTION public.admin_send_chat_message(p_session_id UUID, p_message TEXT)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN
    RETURN json_build_object('success', false, 'error', 'Access denied');
  END IF;
  INSERT INTO public.chat_messages (session_id, sender_id, sender_type, message)
  VALUES (p_session_id, auth.uid(), 'admin', p_message);
  RETURN json_build_object('success', true);
END; $$;

-- Admin: get ticket messages
CREATE OR REPLACE FUNCTION public.admin_get_ticket_messages(p_ticket_id UUID)
RETURNS TABLE(id UUID, sender_id UUID, sender_type TEXT, message TEXT, created_at TIMESTAMPTZ, sender_name TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
    SELECT tm.id, tm.sender_id, tm.sender_type, tm.message, tm.created_at,
           COALESCE(p.full_name, au.email, 'Unknown')::TEXT
    FROM public.ticket_messages tm
    LEFT JOIN auth.users au ON tm.sender_id = au.id
    LEFT JOIN public.profiles p ON tm.sender_id = p.user_id
    WHERE tm.ticket_id = p_ticket_id
    ORDER BY tm.created_at ASC;
END; $$;

-- Admin: get chat messages
CREATE OR REPLACE FUNCTION public.admin_get_chat_messages(p_session_id UUID)
RETURNS TABLE(id UUID, sender_id UUID, sender_type TEXT, message TEXT, created_at TIMESTAMPTZ, sender_name TEXT)
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
BEGIN
  IF NOT public.has_role(auth.uid(), 'admin') THEN RAISE EXCEPTION 'Access denied'; END IF;
  RETURN QUERY
    SELECT cm.id, cm.sender_id, cm.sender_type, cm.message, cm.created_at,
           COALESCE(p.full_name, au.email, 'Unknown')::TEXT
    FROM public.chat_messages cm
    LEFT JOIN auth.users au ON cm.sender_id = au.id
    LEFT JOIN public.profiles p ON cm.sender_id = p.user_id
    WHERE cm.session_id = p_session_id
    ORDER BY cm.created_at ASC;
END; $$;

-- Buy asset function
CREATE OR REPLACE FUNCTION public.buy_asset(p_account_id UUID, p_asset_id UUID, p_quantity NUMERIC)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id UUID;
  v_account RECORD;
  v_asset RECORD;
  v_total NUMERIC;
  v_fee NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN json_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT * INTO v_account FROM public.accounts WHERE id = p_account_id AND user_id = v_user_id;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Account not found'); END IF;

  SELECT * INTO v_asset FROM public.assets WHERE id = p_asset_id AND is_active = true;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Asset not found'); END IF;

  v_total := v_asset.current_price * p_quantity;
  v_fee := ROUND(v_total * 0.001, 2); -- 0.1% fee

  IF v_account.balance < (v_total + v_fee) THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient funds');
  END IF;

  UPDATE public.accounts SET balance = balance - (v_total + v_fee), updated_at = now() WHERE id = p_account_id;

  INSERT INTO public.portfolio_transactions (user_id, asset_id, account_id, transaction_type, quantity, price_per_unit, total_amount, fee_amount)
  VALUES (v_user_id, p_asset_id, p_account_id, 'buy', p_quantity, v_asset.current_price, v_total, v_fee);

  INSERT INTO public.portfolio_holdings (user_id, asset_id, quantity, average_buy_price)
  VALUES (v_user_id, p_asset_id, p_quantity, v_asset.current_price)
  ON CONFLICT (user_id, asset_id)
  DO UPDATE SET
    average_buy_price = (portfolio_holdings.average_buy_price * portfolio_holdings.quantity + v_asset.current_price * p_quantity) / (portfolio_holdings.quantity + p_quantity),
    quantity = portfolio_holdings.quantity + p_quantity,
    updated_at = now();

  RETURN json_build_object('success', true, 'total', v_total, 'fee', v_fee);
END; $$;

-- Sell asset function
CREATE OR REPLACE FUNCTION public.sell_asset(p_account_id UUID, p_asset_id UUID, p_quantity NUMERIC)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id UUID;
  v_holding RECORD;
  v_asset RECORD;
  v_total NUMERIC;
  v_fee NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN json_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT * INTO v_holding FROM public.portfolio_holdings WHERE user_id = v_user_id AND asset_id = p_asset_id;
  IF NOT FOUND OR v_holding.quantity < p_quantity THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient holdings');
  END IF;

  SELECT * INTO v_asset FROM public.assets WHERE id = p_asset_id;
  v_total := v_asset.current_price * p_quantity;
  v_fee := ROUND(v_total * 0.001, 2);

  UPDATE public.accounts SET balance = balance + (v_total - v_fee), updated_at = now() WHERE id = p_account_id;

  INSERT INTO public.portfolio_transactions (user_id, asset_id, account_id, transaction_type, quantity, price_per_unit, total_amount, fee_amount)
  VALUES (v_user_id, p_asset_id, p_account_id, 'sell', p_quantity, v_asset.current_price, v_total, v_fee);

  IF v_holding.quantity = p_quantity THEN
    DELETE FROM public.portfolio_holdings WHERE user_id = v_user_id AND asset_id = p_asset_id;
  ELSE
    UPDATE public.portfolio_holdings SET quantity = quantity - p_quantity, updated_at = now() WHERE user_id = v_user_id AND asset_id = p_asset_id;
  END IF;

  RETURN json_build_object('success', true, 'total', v_total, 'fee', v_fee);
END; $$;

-- Exchange currency function
CREATE OR REPLACE FUNCTION public.exchange_currency(p_account_id UUID, p_from_currency TEXT, p_to_currency TEXT, p_from_amount NUMERIC)
RETURNS JSON
LANGUAGE plpgsql SECURITY DEFINER SET search_path TO 'public' AS $$
DECLARE
  v_user_id UUID;
  v_account RECORD;
  v_rate RECORD;
  v_to_amount NUMERIC;
  v_fee NUMERIC;
BEGIN
  v_user_id := auth.uid();
  IF v_user_id IS NULL THEN RETURN json_build_object('success', false, 'error', 'Not authenticated'); END IF;

  SELECT * INTO v_account FROM public.accounts WHERE id = p_account_id AND user_id = v_user_id;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Account not found'); END IF;

  IF v_account.balance < p_from_amount THEN
    RETURN json_build_object('success', false, 'error', 'Insufficient funds');
  END IF;

  SELECT * INTO v_rate FROM public.exchange_rates WHERE from_currency = p_from_currency AND to_currency = p_to_currency AND is_active = true;
  IF NOT FOUND THEN RETURN json_build_object('success', false, 'error', 'Exchange rate not available'); END IF;

  v_fee := ROUND(p_from_amount * v_rate.spread, 2);
  v_to_amount := ROUND((p_from_amount - v_fee) * v_rate.rate, 2);

  UPDATE public.accounts SET balance = balance - p_from_amount, updated_at = now() WHERE id = p_account_id;

  INSERT INTO public.currency_exchanges (user_id, account_id, from_currency, to_currency, from_amount, to_amount, exchange_rate, fee_amount)
  VALUES (v_user_id, p_account_id, p_from_currency, p_to_currency, p_from_amount, v_to_amount, v_rate.rate, v_fee);

  INSERT INTO public.transactions (user_id, account_id, transaction_type, amount, description, status)
  VALUES (v_user_id, p_account_id, 'exchange', p_from_amount, 'Currency exchange ' || p_from_currency || ' to ' || p_to_currency, 'completed');

  RETURN json_build_object('success', true, 'to_amount', v_to_amount, 'rate', v_rate.rate, 'fee', v_fee);
END; $$;
