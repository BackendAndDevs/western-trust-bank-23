-- Fix the has_role function to not cause permission issues
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
  ) OR (
    _user_id = auth.uid() AND 
    auth.jwt() ->> 'role' = _role
  )
$function$;

-- Drop and recreate all RLS policies to fix the permission issues
DROP POLICY IF EXISTS "Users can view their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can create their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Users can update their own accounts" ON public.accounts;
DROP POLICY IF EXISTS "Admins can manage all accounts" ON public.accounts;

-- Recreate accounts policies
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

CREATE POLICY "Admins can manage all accounts" 
ON public.accounts 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix transactions policies
DROP POLICY IF EXISTS "Users can view their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Users can create their own transactions" ON public.transactions;
DROP POLICY IF EXISTS "Admins can manage all transactions" ON public.transactions;

CREATE POLICY "Users can view their own transactions" 
ON public.transactions 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own transactions" 
ON public.transactions 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all transactions" 
ON public.transactions 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix loan_requests policies
DROP POLICY IF EXISTS "Users can view their own loan requests" ON public.loan_requests;
DROP POLICY IF EXISTS "Users can create their own loan requests" ON public.loan_requests;
DROP POLICY IF EXISTS "Admins can manage all loan requests" ON public.loan_requests;

CREATE POLICY "Users can view their own loan requests" 
ON public.loan_requests 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own loan requests" 
ON public.loan_requests 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can manage all loan requests" 
ON public.loan_requests 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));

-- Fix profiles policies
DROP POLICY IF EXISTS "Users can view their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
DROP POLICY IF EXISTS "Admins can manage all profiles" ON public.profiles;

CREATE POLICY "Users can view their own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all profiles" 
ON public.profiles 
FOR ALL 
USING (public.has_role(auth.uid(), 'admin'));