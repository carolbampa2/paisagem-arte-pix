-- Step 1: Drop the restrictive insert policy on the profiles table.
-- This policy was preventing the SECURITY DEFINER trigger from inserting new profiles.
DROP POLICY "Users can insert own profile" ON public.profiles;


-- Step 2: Update the handle_new_user function to be more robust and to handle the pix_key.
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    user_role_to_insert user_role;
    full_name_to_insert TEXT;
    pix_key_to_insert TEXT;
BEGIN
    -- Extract role from metadata, default to 'buyer' if not present or invalid
    BEGIN
        user_role_to_insert := (NEW.raw_user_meta_data->>'role')::user_role;
    EXCEPTION
        WHEN others THEN
            user_role_to_insert := 'buyer';
    END;

    -- Extract full_name from metadata, default to 'Usuário'
    full_name_to_insert := COALESCE(NEW.raw_user_meta_data->>'full_name', 'Usuário');

    -- Extract pix_key from metadata, will be null if not present
    pix_key_to_insert := NEW.raw_user_meta_data->>'pix_key';

    INSERT INTO public.profiles (user_id, email, full_name, role, pix_key)
    VALUES (
        NEW.id,
        NEW.email,
        full_name_to_insert,
        user_role_to_insert,
        pix_key_to_insert
    );
    RETURN NEW;
END;
$$;
