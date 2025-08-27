-- Step 3 (Debug): Temporarily replace the handle_new_user function with a super simple version.
-- This is to test if the trigger fails because of the function logic (reading metadata)
-- or because of a more fundamental issue with permissions or table constraints.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    INSERT INTO public.profiles (user_id, email, full_name, role)
    VALUES (NEW.id, NEW.email, 'DEBUG USER', 'buyer');
    RETURN NEW;
END;
$$;
