-- Create artworks table for the marketplace
CREATE TABLE public.artworks (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  artist_id uuid NOT NULL REFERENCES public.profiles(user_id) ON DELETE CASCADE,
  title text NOT NULL,
  description text,
  image_path text NOT NULL,
  price decimal(10,2) DEFAULT 0,
  status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on artworks table
ALTER TABLE public.artworks ENABLE ROW LEVEL SECURITY;

-- Policy: Artists can view their own artworks
CREATE POLICY "Artists can view own artworks" 
ON public.artworks 
FOR SELECT 
USING (artist_id = auth.uid());

-- Policy: Artists can insert their own artworks
CREATE POLICY "Artists can insert own artworks" 
ON public.artworks 
FOR INSERT 
WITH CHECK (artist_id = auth.uid());

-- Policy: Artists can update their own artworks
CREATE POLICY "Artists can update own artworks" 
ON public.artworks 
FOR UPDATE 
USING (artist_id = auth.uid());

-- Policy: Public can view approved artworks (for marketplace)
CREATE POLICY "Public can view approved artworks" 
ON public.artworks 
FOR SELECT 
USING (status = 'approved');

-- Add trigger for automatic timestamp updates
CREATE TRIGGER update_artworks_updated_at
BEFORE UPDATE ON public.artworks
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for artwork images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('artworks', 'artworks', true);

-- Create policies for artwork uploads
CREATE POLICY "Artists can upload their own artwork images" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Anyone can view artwork images" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'artworks');

CREATE POLICY "Artists can update their own artwork images" 
ON storage.objects 
FOR UPDATE 
USING (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY "Artists can delete their own artwork images" 
ON storage.objects 
FOR DELETE 
USING (bucket_id = 'artworks' AND auth.uid()::text = (storage.foldername(name))[1]);