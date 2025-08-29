-- CRITICAL SECURITY FIXES (Fixed syntax)

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

-- 3. Drop existing problematic policies
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Public basic profile info" ON public.profiles;

-- 4. Add DELETE policy for profiles (CRITICAL: was missing)
CREATE POLICY "Only admins can delete profiles" 
ON public.profiles 
FOR DELETE 
USING (public.is_admin());

-- 5. Create separate policies for different types of updates

-- Users can update their own non-sensitive profile fields (but not role or is_approved)
CREATE POLICY "Users can update own basic profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Only admins can update role and approval status
CREATE POLICY "Only admins can update role and approval" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 6. Create public view for basic profile info (for marketplace)
CREATE POLICY "Public can view approved artist profiles" 
ON public.profiles 
FOR SELECT 
USING (role = 'artist' AND is_approved = true);

-- Add a trigger to prevent role updates by non-admins
CREATE OR REPLACE FUNCTION public.prevent_role_escalation()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
    -- If role or is_approved is being changed, require admin
    IF (OLD.role != NEW.role OR OLD.is_approved != NEW.is_approved) THEN
        IF NOT public.is_admin() THEN
            RAISE EXCEPTION 'Access denied: Only admins can modify role or approval status';
        END IF;
    END IF;
    RETURN NEW;
END;
$$;

CREATE TRIGGER prevent_role_escalation_trigger
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.prevent_role_escalation();