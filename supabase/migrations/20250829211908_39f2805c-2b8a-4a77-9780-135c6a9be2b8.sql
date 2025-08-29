-- Fix critical security issue: Restrict profile access
-- Drop the overly permissive policy
DROP POLICY IF EXISTS "Users can view all profiles" ON public.profiles;

-- Create a restrictive policy for users to view only their own profile
CREATE POLICY "Users can view own profile" 
ON public.profiles 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create a separate policy for public profile information (only non-sensitive data)
-- This allows viewing basic info needed for marketplace (artist names, approval status)
-- but excludes sensitive data like email, phone, pix_key
CREATE POLICY "Public basic profile info" 
ON public.profiles 
FOR SELECT 
USING (
  -- Only allow viewing specific columns through a view or with column-level security
  -- For now, we'll handle this in application code
  false -- Disabled until we implement proper column-level access
);