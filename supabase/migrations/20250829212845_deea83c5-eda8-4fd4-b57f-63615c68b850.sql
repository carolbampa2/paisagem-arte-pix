-- CRITICAL SECURITY FIXES

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

-- 4. Prevent users from updating their own role (CRITICAL: privilege escalation fix)
CREATE POLICY "Users cannot update their own role" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id AND 
    (OLD.role = NEW.role OR public.is_admin())
);

-- 5. Drop the overly permissive update policy and replace it
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;

-- 6. Only admins can approve/reject artists (update is_approved field)
CREATE POLICY "Only admins can approve artists" 
ON public.profiles 
FOR UPDATE 
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- 7. Create public view for basic profile info (for marketplace)
CREATE POLICY "Public can view basic artist info" 
ON public.profiles 
FOR SELECT 
USING (
    role = 'artist' AND is_approved = true
);

-- 8. Users can still view and update their own non-role fields
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

CREATE POLICY "Users can update own non-role profile" 
ON public.profiles 
FOR UPDATE 
USING (auth.uid() = user_id)
WITH CHECK (
    auth.uid() = user_id AND 
    OLD.role = NEW.role AND
    OLD.is_approved = NEW.is_approved
);