-- Consolidate Archetype Linguistics Migration
-- This consolidates all linguistic data into a single linguistic_patterns column for easier AI reference

-- First, let's consolidate all existing linguistic data into the linguistic_patterns column
UPDATE enhanced_archetypes 
SET linguistic_patterns = COALESCE(
  CASE 
    WHEN linguistic_patterns IS NOT NULL AND linguistic_patterns != '' THEN linguistic_patterns
    ELSE NULL
  END,
  CASE 
    WHEN theoretical_understanding IS NOT NULL AND theoretical_understanding != '' THEN 
      'Theoretical Understanding: ' || theoretical_understanding
    ELSE NULL
  END,
  CASE 
    WHEN embodiment_practices IS NOT NULL AND embodiment_practices != '' THEN 
      'Embodiment Practices: ' || embodiment_practices
    ELSE NULL
  END,
  CASE 
    WHEN integration_practices IS NOT NULL AND integration_practices != '' THEN 
      'Integration Practices: ' || integration_practices
    ELSE NULL
  END,
  CASE 
    WHEN shadow_work IS NOT NULL AND shadow_work != '' THEN 
      'Shadow Work: ' || shadow_work
    ELSE NULL
  END,
  ''
)
WHERE linguistic_patterns IS NULL OR linguistic_patterns = '';

-- For archetypes that have multiple fields, concatenate them into a comprehensive linguistic pattern
UPDATE enhanced_archetypes 
SET linguistic_patterns = TRIM(
  COALESCE(linguistic_patterns, '') ||
  CASE WHEN theoretical_understanding IS NOT NULL AND theoretical_understanding != '' 
    THEN E'\n\nTheoretical Understanding:\n' || theoretical_understanding 
    ELSE '' END ||
  CASE WHEN embodiment_practices IS NOT NULL AND embodiment_practices != '' 
    THEN E'\n\nEmbodiment Practices:\n' || embodiment_practices 
    ELSE '' END ||
  CASE WHEN integration_practices IS NOT NULL AND integration_practices != '' 
    THEN E'\n\nIntegration Practices:\n' || integration_practices 
    ELSE '' END ||
  CASE WHEN shadow_work IS NOT NULL AND shadow_work != '' 
    THEN E'\n\nShadow Work:\n' || shadow_work 
    ELSE '' END ||
  CASE WHEN resources IS NOT NULL AND resources != '' 
    THEN E'\n\nResources:\n' || resources 
    ELSE '' END
)
WHERE (
  theoretical_understanding IS NOT NULL AND theoretical_understanding != ''
) OR (
  embodiment_practices IS NOT NULL AND embodiment_practices != ''
) OR (
  integration_practices IS NOT NULL AND integration_practices != ''
) OR (
  shadow_work IS NOT NULL AND shadow_work != ''
) OR (
  resources IS NOT NULL AND resources != ''
);

-- Now drop the redundant columns since everything is consolidated into linguistic_patterns
ALTER TABLE enhanced_archetypes 
DROP COLUMN IF EXISTS theoretical_understanding,
DROP COLUMN IF EXISTS embodiment_practices,
DROP COLUMN IF EXISTS integration_practices,
DROP COLUMN IF EXISTS shadow_work,
DROP COLUMN IF EXISTS resources;

-- Drop the separate linguistic_patterns table since it's redundant
-- (All data should now be in enhanced_archetypes.linguistic_patterns)
DROP TABLE IF EXISTS linguistic_patterns CASCADE;

-- Update the archetype content view to reflect the simplified structure
DROP VIEW IF EXISTS archetype_content_view;
CREATE OR REPLACE VIEW archetype_content_view AS
SELECT 
  id,
  name,
  description,
  metrics,
  linguistic_patterns,
  structured_content,
  impact_score,
  growth_potential_score,
  awareness_difficulty_score,
  trigger_intensity_score,
  integration_complexity_score,
  shadow_depth_score,
  archetype_images,
  traits,
  psychology_profile,
  is_active,
  created_at,
  updated_at
FROM enhanced_archetypes
WHERE is_active = true
ORDER BY name;

-- Grant access to the updated view
GRANT SELECT ON archetype_content_view TO authenticated;

-- Update the get_archetype_with_content function to reflect the simplified structure
CREATE OR REPLACE FUNCTION get_archetype_with_content(archetype_id UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  description TEXT,
  metrics JSONB,
  linguistic_patterns TEXT,
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

-- Create an index on linguistic_patterns for better AI query performance
CREATE INDEX IF NOT EXISTS idx_enhanced_archetypes_linguistic_patterns 
ON enhanced_archetypes USING gin(to_tsvector('english', linguistic_patterns));

-- Add a comment explaining the simplified structure
COMMENT ON COLUMN enhanced_archetypes.linguistic_patterns IS 
'Consolidated linguistic patterns for AI reference. Contains all linguistic data including theoretical understanding, embodiment practices, integration practices, shadow work, and resources in a single searchable text field.';
