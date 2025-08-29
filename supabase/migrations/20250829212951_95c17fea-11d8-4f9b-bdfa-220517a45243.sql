-- CRITICAL SECURITY FIXES (Drop existing policies first)

-- Drop all existing policies to rebuild properly
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;

-- 1. Create admin role verification function (security definer to avoid RLS recursion)
CREATE OR REPLACE FUNCTION public.is_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS boolean
LANGUAGE sql
STABLE SECURITY DEFINER
AS $$
    SELECT EXISTS (
        SELECT 1 FROM public.profiles 
        WHERE user_id = user_uuid AND role = 'admin'
    );
$$;

-- 2. Create admin verification function that throws error if not admin
CREATE OR REPLACE FUNCTION public.require_admin(user_uuid uuid DEFAULT auth.uid())
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    IF NOT public.is_admin(user_uuid) THEN
        RAISE EXCEPTION 'Access denied: Admin role required';
    END IF;
END;
$$;

-- 3. Add DELETE policy for profiles (CRITICAL: was missing)
CREATE POLICY "Only admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_admin());

-- 4. Recreate INSERT policy (users can create their own profile)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- 5. Only admins can approve/reject artists (update is_approved field)
CREATE POLICY "Only admins can manage artist approval" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin());

-- 6. Create public view for basic artist info (for marketplace)
CREATE POLICY "Public can view approved artist info" 
ON public.profiles 
FOR SELECT 
USING (role = 'artist' AND is_approved = true);

-- 7. Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- 8. Users can update their own profile but NOT role or approval status
CREATE POLICY "Users can update own basic profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);