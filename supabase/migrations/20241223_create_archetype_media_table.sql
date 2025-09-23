-- Create archetype_media table for storing uploaded media files
CREATE TABLE IF NOT EXISTS archetype_media (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  archetype_id UUID NOT NULL REFERENCES enhanced_archetypes(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size BIGINT,
  media_type TEXT NOT NULL CHECK (media_type IN ('image', 'video', 'audio', 'document')),
  mime_type TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_archetype_media_archetype_id ON archetype_media(archetype_id);
CREATE INDEX IF NOT EXISTS idx_archetype_media_media_type ON archetype_media(media_type);
CREATE INDEX IF NOT EXISTS idx_archetype_media_created_at ON archetype_media(created_at);

-- Enable RLS
ALTER TABLE archetype_media ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Allow authenticated users to view archetype media" ON archetype_media
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to insert archetype media" ON archetype_media
  FOR INSERT TO authenticated WITH CHECK (true);

CREATE POLICY "Allow authenticated users to update archetype media" ON archetype_media
  FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Allow authenticated users to delete archetype media" ON archetype_media
  FOR DELETE TO authenticated USING (true);

-- Create storage bucket for archetype media
INSERT INTO storage.buckets (id, name, public) 
VALUES ('archetype-media', 'archetype-media', true)
ON CONFLICT (id) DO NOTHING;

-- Create storage policies
CREATE POLICY "Allow authenticated users to upload archetype media" ON storage.objects
  FOR INSERT TO authenticated WITH CHECK (bucket_id = 'archetype-media');

CREATE POLICY "Allow authenticated users to view archetype media" ON storage.objects
  FOR SELECT TO authenticated USING (bucket_id = 'archetype-media');

CREATE POLICY "Allow authenticated users to delete archetype media" ON storage.objects
  FOR DELETE TO authenticated USING (bucket_id = 'archetype-media');

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_archetype_media_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updated_at
CREATE TRIGGER update_archetype_media_updated_at
  BEFORE UPDATE ON archetype_media
  FOR EACH ROW
  EXECUTE FUNCTION update_archetype_media_updated_at();
