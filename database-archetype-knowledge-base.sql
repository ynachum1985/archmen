-- Archetype Knowledge Base Database Setup
-- Run this in your Supabase SQL editor to add knowledge base functionality for archetypes

-- Create archetype_content_chunks table (similar to assessment_content_chunks)
CREATE TABLE IF NOT EXISTS archetype_content_chunks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_id UUID NOT NULL REFERENCES enhanced_archetypes(id) ON DELETE CASCADE,
  content_type TEXT NOT NULL DEFAULT 'text',
  chunk_text TEXT NOT NULL,
  chunk_index INTEGER NOT NULL,
  chunk_size INTEGER NOT NULL,
  chunk_overlap INTEGER DEFAULT 0,
  embedding VECTOR(1536), -- OpenAI text-embedding-3-small dimension
  source_url TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create archetype_embedding_settings table
CREATE TABLE IF NOT EXISTS archetype_embedding_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_id UUID NOT NULL REFERENCES enhanced_archetypes(id) ON DELETE CASCADE,
  chunk_size INTEGER DEFAULT 1000,
  chunk_overlap INTEGER DEFAULT 200,
  embedding_model TEXT DEFAULT 'text-embedding-3-small',
  temperature REAL DEFAULT 0.7,
  max_tokens INTEGER DEFAULT 2000,
  semantic_search_enabled BOOLEAN DEFAULT true,
  custom_instructions TEXT,
  context_window INTEGER DEFAULT 4000,
  settings JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(archetype_id)
);

-- Create archetype_files table (for reference documents)
CREATE TABLE IF NOT EXISTS archetype_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  archetype_id UUID REFERENCES enhanced_archetypes(id) ON DELETE CASCADE,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_archetype_content_chunks_archetype_id ON archetype_content_chunks(archetype_id);
CREATE INDEX IF NOT EXISTS idx_archetype_content_chunks_content_type ON archetype_content_chunks(content_type);
CREATE INDEX IF NOT EXISTS idx_archetype_content_chunks_chunk_index ON archetype_content_chunks(chunk_index);
CREATE INDEX IF NOT EXISTS idx_archetype_embedding_settings_archetype_id ON archetype_embedding_settings(archetype_id);
CREATE INDEX IF NOT EXISTS idx_archetype_files_archetype_id ON archetype_files(archetype_id);

-- Create embedding search function for archetypes
CREATE OR REPLACE FUNCTION search_archetype_content(
  query_embedding VECTOR(1536),
  archetype_id_param UUID,
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 5
)
RETURNS TABLE (
  id UUID,
  content TEXT,
  similarity FLOAT,
  chunk_index INTEGER,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    acc.id,
    acc.chunk_text as content,
    (acc.embedding <=> query_embedding) * -1 + 1 as similarity,
    acc.chunk_index,
    acc.metadata
  FROM archetype_content_chunks acc
  WHERE acc.archetype_id = archetype_id_param
    AND (acc.embedding <=> query_embedding) * -1 + 1 > match_threshold
  ORDER BY acc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Create function to search across all archetype content
CREATE OR REPLACE FUNCTION search_all_archetype_content(
  query_embedding VECTOR(1536),
  match_threshold FLOAT DEFAULT 0.7,
  match_count INT DEFAULT 10
)
RETURNS TABLE (
  id UUID,
  archetype_id UUID,
  archetype_name TEXT,
  content TEXT,
  similarity FLOAT,
  chunk_index INTEGER,
  metadata JSONB
)
LANGUAGE plpgsql
AS $$
BEGIN
  RETURN QUERY
  SELECT
    acc.id,
    acc.archetype_id,
    ea.name as archetype_name,
    acc.chunk_text as content,
    (acc.embedding <=> query_embedding) * -1 + 1 as similarity,
    acc.chunk_index,
    acc.metadata
  FROM archetype_content_chunks acc
  JOIN enhanced_archetypes ea ON acc.archetype_id = ea.id
  WHERE (acc.embedding <=> query_embedding) * -1 + 1 > match_threshold
    AND ea.is_active = true
  ORDER BY acc.embedding <=> query_embedding
  LIMIT match_count;
END;
$$;

-- Enable RLS on new tables
ALTER TABLE archetype_content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_embedding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE archetype_files ENABLE ROW LEVEL SECURITY;

-- Create RLS policies
CREATE POLICY "Users can view archetype content chunks" ON archetype_content_chunks
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage archetype content chunks" ON archetype_content_chunks
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view archetype embedding settings" ON archetype_embedding_settings
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage archetype embedding settings" ON archetype_embedding_settings
  FOR ALL USING (auth.role() = 'authenticated');

CREATE POLICY "Users can view archetype files" ON archetype_files
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Users can manage archetype files" ON archetype_files
  FOR ALL USING (auth.role() = 'authenticated');

-- Create Storage Bucket for Archetype Files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'archetype-files',
  'archetype-files',
  true,
  10485760, -- 10MB
  ARRAY[
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'text/plain',
    'text/markdown',
    'application/json',
    'text/csv'
  ]
) ON CONFLICT (id) DO NOTHING;

-- Storage Policies for archetype-files bucket
CREATE POLICY "Anyone can view archetype files" ON storage.objects
  FOR SELECT USING (bucket_id = 'archetype-files');

CREATE POLICY "Authenticated users can upload archetype files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'archetype-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update archetype files" ON storage.objects
  FOR UPDATE USING (bucket_id = 'archetype-files' AND auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can delete archetype files" ON storage.objects
  FOR DELETE USING (bucket_id = 'archetype-files' AND auth.role() = 'authenticated');

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION search_archetype_content(VECTOR(1536), UUID, FLOAT, INT) TO authenticated;
GRANT EXECUTE ON FUNCTION search_all_archetype_content(VECTOR(1536), FLOAT, INT) TO authenticated;

-- Add comment for documentation
COMMENT ON TABLE archetype_content_chunks IS 'Stores chunked content for archetype knowledge base with embeddings for RAG functionality';
COMMENT ON TABLE archetype_embedding_settings IS 'Stores embedding configuration settings for each archetype';
COMMENT ON TABLE archetype_files IS 'Stores uploaded files for archetype knowledge base';
