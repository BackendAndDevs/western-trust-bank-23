-- Fix security linter issues by adding SET search_path to all functions
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
AS $function$
BEGIN
  INSERT INTO public.profiles (user_id, full_name)
  VALUES (
    NEW.id, 
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email)
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.generate_account_number()
RETURNS text
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO ''
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
SET search_path TO ''
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