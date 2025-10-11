-- Add alternative names (aliases) to archetypes
-- This allows one archetype to have multiple names that the AI can choose from

-- Add new columns
ALTER TABLE enhanced_archetypes
ADD COLUMN IF NOT EXISTS alternative_names TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add comments
COMMENT ON COLUMN enhanced_archetypes.alternative_names IS 'Alternative names/aliases for this archetype (e.g., "The Patriarch" for "The Misogynist")';
COMMENT ON COLUMN enhanced_archetypes.tags IS 'Searchable tags for this archetype';

-- Create index for searching alternative names
CREATE INDEX IF NOT EXISTS idx_archetype_alternative_names ON enhanced_archetypes USING GIN (alternative_names);

-- Create function to search archetypes by any name (primary or alternative)
CREATE OR REPLACE FUNCTION search_archetypes_by_name(search_term TEXT)
RETURNS TABLE (
  id UUID,
  name TEXT,
  matched_name TEXT,
  alternative_names TEXT[],
  description TEXT
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    a.id,
    a.name,
    CASE 
      WHEN LOWER(a.name) LIKE LOWER('%' || search_term || '%') THEN a.name
      ELSE (
        SELECT alt_name 
        FROM unnest(a.alternative_names) AS alt_name 
        WHERE LOWER(alt_name) LIKE LOWER('%' || search_term || '%')
        LIMIT 1
      )
    END AS matched_name,
    a.alternative_names,
    a.description
  FROM enhanced_archetypes a
  WHERE 
    LOWER(a.name) LIKE LOWER('%' || search_term || '%')
    OR EXISTS (
      SELECT 1 
      FROM unnest(a.alternative_names) AS alt_name 
      WHERE LOWER(alt_name) LIKE LOWER('%' || search_term || '%')
    );
END;
$$ LANGUAGE plpgsql;

