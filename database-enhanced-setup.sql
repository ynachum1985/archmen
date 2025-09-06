-- Enhanced ArchMen Database Setup Script
-- Run this in your Supabase SQL editor to add new tables for enhanced assessment builder

-- Assessment Categories Table
CREATE TABLE IF NOT EXISTS assessment_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  color TEXT DEFAULT 'blue',
  icon TEXT DEFAULT 'Folder',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Assessment Files Table (for reference documents)
CREATE TABLE IF NOT EXISTS assessment_files (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_size INTEGER NOT NULL,
  file_type TEXT NOT NULL,
  assessment_id UUID,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Enhanced Assessments Table
CREATE TABLE IF NOT EXISTS enhanced_assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  category TEXT,
  purpose TEXT,
  expected_duration INTEGER DEFAULT 15,
  system_prompt TEXT,
  questioning_strategy TEXT DEFAULT 'adaptive',
  questioning_depth TEXT DEFAULT 'moderate',
  question_examples JSONB,
  response_requirements JSONB,
  adaptive_logic JSONB,
  report_generation TEXT,
  is_active BOOLEAN DEFAULT true,
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- RLS Policies for assessment_categories
ALTER TABLE assessment_categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view active categories" ON assessment_categories
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create categories" ON assessment_categories
  FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update categories" ON assessment_categories
  FOR UPDATE USING (auth.role() = 'authenticated');

-- RLS Policies for assessment_files
ALTER TABLE assessment_files ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own files" ON assessment_files
  FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Users can upload files" ON assessment_files
  FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Users can delete their own files" ON assessment_files
  FOR DELETE USING (auth.uid() IS NOT NULL);

-- RLS Policies for enhanced_assessments
ALTER TABLE enhanced_assessments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view active assessments" ON enhanced_assessments
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can create assessments" ON enhanced_assessments
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own assessments" ON enhanced_assessments
  FOR UPDATE USING (auth.uid() = created_by);

-- Create Storage Bucket for Assessment Files
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'assessment-files',
  'assessment-files',
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

-- Storage Policies for assessment-files bucket
CREATE POLICY "Anyone can view assessment files" ON storage.objects
  FOR SELECT USING (bucket_id = 'assessment-files');

CREATE POLICY "Authenticated users can upload assessment files" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'assessment-files' AND auth.role() = 'authenticated');

CREATE POLICY "Users can delete their own assessment files" ON storage.objects
  FOR DELETE USING (bucket_id = 'assessment-files' AND auth.role() = 'authenticated');

-- Insert Default Categories
INSERT INTO assessment_categories (name, description, color, icon) VALUES
  ('Relationships', 'Assessment category for relationships and social dynamics', 'blue', 'Heart'),
  ('Career & Leadership', 'Assessment category for career and leadership development', 'green', 'Briefcase'),
  ('Personal Growth', 'Assessment category for personal growth and self-development', 'purple', 'TrendingUp'),
  ('Shadow Work', 'Assessment category for shadow work and integration', 'orange', 'Moon'),
  ('Creativity & Innovation', 'Assessment category for creativity and innovation', 'red', 'Palette'),
  ('Life Purpose', 'Assessment category for life purpose and meaning', 'indigo', 'Compass'),
  ('Communication', 'Assessment category for communication patterns', 'pink', 'MessageCircle'),
  ('Conflict Resolution', 'Assessment category for conflict resolution', 'teal', 'Shield'),
  ('Emotional Intelligence', 'Assessment category for emotional intelligence', 'yellow', 'Brain'),
  ('Spiritual Development', 'Assessment category for spiritual development', 'gray', 'Star')
ON CONFLICT (name) DO NOTHING;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = TIMEZONE('utc', NOW());
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_assessment_categories_updated_at
  BEFORE UPDATE ON assessment_categories
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_files_updated_at
  BEFORE UPDATE ON assessment_files
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_enhanced_assessments_updated_at
  BEFORE UPDATE ON enhanced_assessments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_categories_active ON assessment_categories(is_active);
CREATE INDEX IF NOT EXISTS idx_assessment_files_assessment_id ON assessment_files(assessment_id);
CREATE INDEX IF NOT EXISTS idx_enhanced_assessments_active ON enhanced_assessments(is_active);
CREATE INDEX IF NOT EXISTS idx_enhanced_assessments_category ON enhanced_assessments(category);
CREATE INDEX IF NOT EXISTS idx_enhanced_assessments_created_by ON enhanced_assessments(created_by);
