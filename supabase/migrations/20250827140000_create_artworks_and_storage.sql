-- Create enum for artwork status
CREATE TYPE public.artwork_status AS ENUM ('pending', 'approved', 'rejected');

-- Create artworks table
CREATE TABLE public.artworks (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    artist_id UUID NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    description TEXT,
    image_path TEXT NOT NULL,
    status artwork_status NOT NULL DEFAULT 'pending',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Function to update timestamps
CREATE TRIGGER update_artworks_updated_at
    BEFORE UPDATE ON public.artworks
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Enable RLS
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Create storage bucket for artworks
-- The policy will grant public read access to this bucket.
INSERT INTO storage.buckets (id, name, public)
VALUES ('artworks', 'artworks', true)
ON CONFLICT (id) DO NOTHING;


-- RLS Policies for artworks TABLE
-- 1. Admins can do anything.
CREATE POLICY "Allow admin full access on artworks"
    ON public.artworks
    FOR ALL
    USING (public.get_user_role(auth.uid()) = 'admin')
    WITH CHECK (public.get_user_role(auth.uid()) = 'admin');

-- 2. Artists can insert their own artworks.
CREATE POLICY "Allow artists to insert their own artworks"
    ON public.artworks
    FOR INSERT
    WITH CHECK (public.get_user_role(auth.uid()) = 'artist' AND auth.uid() = artist_id);

-- 3. Artists can view their own artworks.
CREATE POLICY "Allow artists to view their own artworks"
    ON public.artworks
    FOR SELECT
    USING (public.get_user_role(auth.uid()) = 'artist' AND auth.uid() = artist_id);

-- 4. Artists can update their own artworks if status is 'pending'.
CREATE POLICY "Allow artists to update their own pending artworks"
    ON public.artworks
    FOR UPDATE
    USING (public.get_user_role(auth.uid()) = 'artist' AND auth.uid() = artist_id AND status = 'pending')
    WITH CHECK (public.get_user_role(auth.uid()) = 'artist' AND auth.uid() = artist_id AND status = 'pending');

-- 5. Anyone can view approved artworks.
CREATE POLICY "Allow public read access to approved artworks"
    ON public.artworks
    FOR SELECT
    USING (status = 'approved');


-- RLS Policies for artworks STORAGE
-- 1. Artists can upload files to a folder named after their user_id.
CREATE POLICY "Allow artists to upload to their own folder"
    ON storage.objects
    FOR INSERT
    WITH CHECK (bucket_id = 'artworks' AND public.get_user_role(auth.uid()) = 'artist' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 2. Artists can view files in their own folder.
CREATE POLICY "Allow artists to view their own folder"
    ON storage.objects
    FOR SELECT
    USING (bucket_id = 'artworks' AND public.get_user_role(auth.uid()) = 'artist' AND (storage.foldername(name))[1] = auth.uid()::text);

-- 3. Artists can update files in their own folder.
CREATE POLICY "Allow artists to update their own files"
    ON storage.objects
    FOR UPDATE
    USING (bucket_id = 'artworks' AND public.get_user_role(auth.uid()) = 'artist' AND (storage.foldername(name))[1] = auth.uid()::text);

-- Note: Public read access is handled by the bucket's `public` property.
-- The policy on the `artworks` table (policy #5) will determine which rows (and thus which image_paths) are visible to the public.
-- The public bucket allows anyone with the URL to access the file.
