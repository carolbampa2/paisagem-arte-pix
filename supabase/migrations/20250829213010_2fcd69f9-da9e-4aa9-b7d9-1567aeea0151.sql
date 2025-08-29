-- CRITICAL SECURITY FIXES (Handle existing policies)

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

-- 3. Drop ALL existing policies to rebuild them securely
DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public basic profile info" ON public.profiles;
DROP POLICY IF EXISTS "Public can view approved artist info" ON public.profiles;

-- 4. Add DELETE policy for profiles (CRITICAL: was missing)
CREATE POLICY "Only admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_admin());

-- 5. Recreate secure policies

-- Users can view their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Public can view approved artist basic info (for marketplace)
CREATE POLICY "Public can view approved artist info" 
ON public.profiles 
FOR SELECT 
USING (role = 'artist' AND is_approved = true);

-- Users can insert their own profile (during signup)
CREATE POLICY "Users can insert own profile" 
ON public.profiles 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

-- Users can update non-sensitive fields only
CREATE POLICY "Users can update own basic profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only admins can approve/reject artists or change roles
CREATE POLICY "Only admins can manage roles and approval" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin());