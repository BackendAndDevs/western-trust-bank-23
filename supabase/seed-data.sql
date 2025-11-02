-- Seed data for US banks and admin users
-- Run this after running seed.sql

-- Insert US banks data
INSERT INTO public.us_banks (bank_name, routing_number, swift_code, bank_code, address, city, state, zip_code, country, phone) 
VALUES
  ('Chase Bank', '021000021', 'CHASUS33', 'CHASE', '270 Park Avenue', 'New York', 'NY', '10017', 'USA', '1-800-935-9935'),
  ('Bank of America', '026009593', 'BOFAUS3N', 'BOFA', '100 North Tryon Street', 'Charlotte', 'NC', '28255', 'USA', '1-800-432-1000'),
  ('Wells Fargo', '121000248', 'WFBIUS6S', 'WELLS', '420 Montgomery Street', 'San Francisco', 'CA', '94104', 'USA', '1-800-869-3557'),
  ('Citibank', '021000089', 'CITIUS33', 'CITI', '388 Greenwich Street', 'New York', 'NY', '10013', 'USA', '1-800-374-9700'),
  ('U.S. Bank', '091000022', 'USBKUS44', 'USB', '800 Nicollet Mall', 'Minneapolis', 'MN', '55402', 'USA', '1-800-872-2657'),
  ('PNC Bank', '031000053', 'PNCCUS33', 'PNC', 'The Tower at PNC Plaza', 'Pittsburgh', 'PA', '15222', 'USA', '1-888-762-2265'),
  ('Capital One', '051405515', 'NFBKUS33', 'CAPO', '1680 Capital One Drive', 'McLean', 'VA', '22102', 'USA', '1-877-383-4802'),
  ('TD Bank', '031101266', 'NRTHUS33', 'TD', '2035 Limestone Road', 'Wilmington', 'DE', '19808', 'USA', '1-888-751-9000'),
  ('BB&T (Truist)', '053100300', 'BRBTUS33', 'BBT', '200 West Second Street', 'Winston-Salem', 'NC', '27101', 'USA', '1-800-226-5228'),
  ('SunTrust (Truist)', '061000104', 'SNTRUS3A', 'SUNT', '303 Peachtree Street NE', 'Atlanta', 'GA', '30308', 'USA', '1-800-786-8787'),
  ('Fifth Third Bank', '042000314', 'FTBCUS3C', 'FIFTH', '38 Fountain Square Plaza', 'Cincinnati', 'OH', '45263', 'USA', '1-800-972-3030'),
  ('Regions Bank', '062000019', 'REGNUS44', 'REGIONS', '1900 5th Avenue North', 'Birmingham', 'AL', '35203', 'USA', '1-800-734-4667'),
  ('KeyBank', '041001039', 'KEYBUS33', 'KEY', '127 Public Square', 'Cleveland', 'OH', '44114', 'USA', '1-800-539-2968'),
  ('Charles Schwab Bank', '121202211', 'SWHQUS6S', 'SCHWAB', '211 Main Street', 'San Francisco', 'CA', '94105', 'USA', '1-888-403-9000'),
  ('HSBC Bank USA', '021001088', 'MRMDUS33', 'HSBC', '452 Fifth Avenue', 'New York', 'NY', '10018', 'USA', '1-800-975-4722')
ON CONFLICT (routing_number) DO NOTHING;

-- Create admin role if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'app_role') THEN
    CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user');
  END IF;
END$$;

-- Create user_roles table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Enable RLS on user_roles
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Create policies for user_roles
DROP POLICY IF EXISTS "Users can view their own roles" ON public.user_roles;
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Admins can manage all roles" ON public.user_roles;
CREATE POLICY "Admins can manage all roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create security definer function for role checking if it doesn't exist
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id
      AND role = _role
  )
$$;

-- Insert admin user (you'll need to sign up with this email first)
-- After signing up with admin@westerntrustbank.com, run this to grant admin role:
-- 
-- INSERT INTO public.user_roles (user_id, role)
-- SELECT id, 'admin'::app_role
-- FROM auth.users
-- WHERE email = 'admin@westerntrustbank.com'
-- ON CONFLICT (user_id, role) DO NOTHING;

-- Create function to make first user admin (optional - for development)
CREATE OR REPLACE FUNCTION public.auto_assign_first_admin()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- If this is the first user, make them admin
  IF (SELECT COUNT(*) FROM auth.users) = 1 THEN
    INSERT INTO public.user_roles (user_id, role)
    VALUES (NEW.id, 'admin'::app_role)
    ON CONFLICT (user_id, role) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger for auto admin assignment (optional - for development)
DROP TRIGGER IF EXISTS on_auth_user_created_assign_admin ON auth.users;
CREATE TRIGGER on_auth_user_created_assign_admin
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_assign_first_admin();

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_user_roles_user_id ON public.user_roles(user_id);
CREATE INDEX IF NOT EXISTS idx_user_roles_role ON public.user_roles(role);
CREATE INDEX IF NOT EXISTS idx_us_banks_routing ON public.us_banks(routing_number);
CREATE INDEX IF NOT EXISTS idx_us_banks_name ON public.us_banks(bank_name);

-- Grant necessary permissions
GRANT SELECT ON public.us_banks TO authenticated;
GRANT SELECT ON public.user_roles TO authenticated;
