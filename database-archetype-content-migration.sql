-- Archetype Content Enhancement Migration
-- Run this in your Supabase SQL editor to add new content fields to archetypes

-- Add new content fields to enhanced_archetypes table
ALTER TABLE enhanced_archetypes 
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS linguistic_patterns TEXT,
ADD COLUMN IF NOT EXISTS theoretical_understanding TEXT,
ADD COLUMN IF NOT EXISTS embodiment_practices TEXT,
ADD COLUMN IF NOT EXISTS integration_practices TEXT,
ADD COLUMN IF NOT EXISTS shadow_work TEXT,
ADD COLUMN IF NOT EXISTS resources TEXT,
ADD COLUMN IF NOT EXISTS structured_content JSONB DEFAULT '{}';

-- Create index for better performance on structured_content queries
CREATE INDEX IF NOT EXISTS idx_enhanced_archetypes_structured_content 
ON enhanced_archetypes USING GIN (structured_content);

-- Update existing archetypes with sample content structure
UPDATE enhanced_archetypes 
SET structured_content = '{
  "opening": {"blocks": []},
  "theoretical": {"blocks": []},
  "embodiment": {"blocks": []},
  "integration": {"blocks": []},
  "shadow": {"blocks": []},
  "resources": {"blocks": []}
}'::jsonb
WHERE structured_content = '{}'::jsonb OR structured_content IS NULL;

-- Add some sample metrics structure for existing archetypes
UPDATE enhanced_archetypes 
SET metrics = '{
  "impact_level": 0,
  "complexity_score": 0,
  "integration_difficulty": 0,
  "shadow_intensity": 0
}'::jsonb
WHERE metrics = '{}'::jsonb OR metrics IS NULL;

-- Create a function to auto-populate archetype content when selected
CREATE OR REPLACE FUNCTION get_archetype_with_content(archetype_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  metrics JSONB,
  linguistic_patterns TEXT,
  theoretical_understanding TEXT,
  embodiment_practices TEXT,
  integration_practices TEXT,
  shadow_work TEXT,
  resources TEXT,
  structured_content JSONB,
  impact_score INTEGER,
  growth_potential_score INTEGER,
  awareness_difficulty_score INTEGER,
  trigger_intensity_score INTEGER,
  integration_complexity_score INTEGER,
  shadow_depth_score INTEGER,
  archetype_images TEXT[],
  traits JSONB,
  psychology_profile JSONB,
  is_active BOOLEAN,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ea.id,
    ea.name,
    ea.description,
    ea.metrics,
    ea.linguistic_patterns,
    ea.theoretical_understanding,
    ea.embodiment_practices,
    ea.integration_practices,
    ea.shadow_work,
    ea.resources,
    ea.structured_content,
    ea.impact_score,
    ea.growth_potential_score,
    ea.awareness_difficulty_score,
    ea.trigger_intensity_score,
    ea.integration_complexity_score,
    ea.shadow_depth_score,
    ea.archetype_images,
    ea.traits,
    ea.psychology_profile,
    ea.is_active,
    ea.created_at,
    ea.updated_at
  FROM enhanced_archetypes ea
  WHERE ea.id = archetype_id;
END;
$$ LANGUAGE plpgsql;

-- Create a function to update archetype structured content
CREATE OR REPLACE FUNCTION update_archetype_content(
  archetype_id UUID,
  content_data JSONB
)
RETURNS BOOLEAN AS $$
BEGIN
  UPDATE enhanced_archetypes 
  SET 
    structured_content = content_data,
    updated_at = NOW()
  WHERE id = archetype_id;
  
  RETURN FOUND;
END;
$$ LANGUAGE plpgsql;

-- Grant necessary permissions
GRANT EXECUTE ON FUNCTION get_archetype_with_content(UUID) TO authenticated;
GRANT EXECUTE ON FUNCTION update_archetype_content(UUID, JSONB) TO authenticated;

-- Add RLS policies for the new content fields
-- (Assuming RLS is already enabled on enhanced_archetypes table)

-- Create a view for easier archetype content management
CREATE OR REPLACE VIEW archetype_content_view AS
SELECT 
  id,
  name,
  description,
  metrics,
  linguistic_patterns,
  theoretical_understanding,
  embodiment_practices,
  integration_practices,
  shadow_work,
  resources,
  structured_content,
  impact_score,
  is_active,
  created_at,
  updated_at
FROM enhanced_archetypes
WHERE is_active = true
ORDER BY name;

-- Grant access to the view
GRANT SELECT ON archetype_content_view TO authenticated;
