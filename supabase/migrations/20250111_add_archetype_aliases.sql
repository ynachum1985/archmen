-- Add alternative names and category to archetypes
-- This allows one archetype to have multiple names (aliases)

-- Add new columns
ALTER TABLE enhanced_archetypes
ADD COLUMN IF NOT EXISTS alternative_names TEXT[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS category TEXT,
ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}';

-- Add comments
COMMENT ON COLUMN enhanced_archetypes.alternative_names IS 'Alternative names/aliases for this archetype (e.g., "The Patriarch" for "The Misogynist")';
COMMENT ON COLUMN enhanced_archetypes.category IS 'Broad category this archetype belongs to (e.g., "Toxic Masculinity", "Wounded Masculine")';
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
  category TEXT,
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
    a.category,
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

-- Example: Update existing archetypes with alternative names
-- (You can customize these based on your actual archetypes)

-- Example 1: The Misogynist
UPDATE enhanced_archetypes
SET 
  alternative_names = ARRAY['The Patriarch', 'The Chauvinist', 'The Male Supremacist'],
  category = 'Toxic Masculinity',
  tags = ARRAY['misogyny', 'patriarchy', 'toxic', 'dominance']
WHERE LOWER(name) LIKE '%misogynist%';

-- Example 2: The Alpha Male
UPDATE enhanced_archetypes
SET 
  alternative_names = ARRAY['The Dominant Male', 'The Leader', 'The Top Dog'],
  category = 'Masculine Archetypes',
  tags = ARRAY['dominance', 'leadership', 'alpha', 'competition']
WHERE LOWER(name) LIKE '%alpha%';

-- Example 3: The Nice Guy
UPDATE enhanced_archetypes
SET 
  alternative_names = ARRAY['The People Pleaser', 'The Pushover', 'The Doormat'],
  category = 'Wounded Masculine',
  tags = ARRAY['people-pleasing', 'passive', 'resentment', 'covert-contracts']
WHERE LOWER(name) LIKE '%nice guy%';

-- Add more examples as needed...

