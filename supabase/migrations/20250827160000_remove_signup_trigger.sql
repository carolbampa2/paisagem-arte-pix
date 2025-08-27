-- Step 1: Drop the trigger from the auth.users table
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- Step 2: Drop the function that the trigger used to call
DROP FUNCTION IF EXISTS public.handle_new_user();
