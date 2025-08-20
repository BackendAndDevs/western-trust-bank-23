-- Fix security issues step by step

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