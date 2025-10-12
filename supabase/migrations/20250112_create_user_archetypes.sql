-- Create user_archetypes table for persistent archetype collection
-- This stores each user's discovered archetypes as permanent profile cards

CREATE TABLE IF NOT EXISTS user_archetypes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archetype_id UUID NOT NULL REFERENCES enhanced_archetypes(id) ON DELETE CASCADE,
  
  -- Discovery Info
  first_discovered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  discovered_in_assessment_id UUID REFERENCES enhanced_assessments(id) ON DELETE SET NULL,
  discovered_in_conversation_id UUID REFERENCES conversations(id) ON DELETE SET NULL,
  
  -- Confidence & Strength
  current_confidence_score DECIMAL(5,2) DEFAULT 0.0 CHECK (current_confidence_score >= 0 AND current_confidence_score <= 100),
  peak_confidence_score DECIMAL(5,2) DEFAULT 0.0 CHECK (peak_confidence_score >= 0 AND peak_confidence_score <= 100),
  impact_score INTEGER CHECK (impact_score >= 1 AND impact_score <= 7),
  
  -- Aliases (personalized to this user)
  primary_alias TEXT,
  ranked_aliases JSONB DEFAULT '[]'::jsonb,
  
  -- User-Specific Context
  discovery_summary TEXT,
  key_evidence JSONB DEFAULT '[]'::jsonb,
  pattern_timeline JSONB DEFAULT '{}'::jsonb,
  
  -- Relationship to User
  user_notes TEXT,
  integration_status TEXT DEFAULT 'discovered' CHECK (integration_status IN ('discovered', 'working_on', 'integrated', 'archived')),
  last_worked_on TIMESTAMP WITH TIME ZONE,
  
  -- Tracking
  times_detected INTEGER DEFAULT 1,
  assessments_detected_in JSONB DEFAULT '[]'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Ensure one archetype per user (can be detected multiple times but only one record)
  UNIQUE(user_id, archetype_id)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_archetypes_user_id ON user_archetypes(user_id);
CREATE INDEX IF NOT EXISTS idx_user_archetypes_archetype_id ON user_archetypes(archetype_id);
CREATE INDEX IF NOT EXISTS idx_user_archetypes_integration_status ON user_archetypes(integration_status);
CREATE INDEX IF NOT EXISTS idx_user_archetypes_active ON user_archetypes(is_active) WHERE is_active = true;
CREATE INDEX IF NOT EXISTS idx_user_archetypes_confidence ON user_archetypes(current_confidence_score DESC);

-- GIN indexes for JSONB columns
CREATE INDEX IF NOT EXISTS idx_user_archetypes_ranked_aliases ON user_archetypes USING GIN (ranked_aliases);
CREATE INDEX IF NOT EXISTS idx_user_archetypes_key_evidence ON user_archetypes USING GIN (key_evidence);
CREATE INDEX IF NOT EXISTS idx_user_archetypes_pattern_timeline ON user_archetypes USING GIN (pattern_timeline);
CREATE INDEX IF NOT EXISTS idx_user_archetypes_assessments ON user_archetypes USING GIN (assessments_detected_in);

-- Enable RLS
ALTER TABLE user_archetypes ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own archetypes" ON user_archetypes
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own archetypes" ON user_archetypes
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own archetypes" ON user_archetypes
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own archetypes" ON user_archetypes
  FOR DELETE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_user_archetypes_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER user_archetypes_updated_at
  BEFORE UPDATE ON user_archetypes
  FOR EACH ROW
  EXECUTE FUNCTION update_user_archetypes_updated_at();

-- Function to get user's archetype collection with full details
CREATE OR REPLACE FUNCTION get_user_archetype_collection(p_user_id UUID)
RETURNS TABLE (
  user_archetype_id UUID,
  archetype_id UUID,
  archetype_name TEXT,
  archetype_description TEXT,
  primary_alias TEXT,
  ranked_aliases JSONB,
  current_confidence_score DECIMAL,
  peak_confidence_score DECIMAL,
  impact_score INTEGER,
  first_discovered_at TIMESTAMP WITH TIME ZONE,
  discovered_in_assessment_name TEXT,
  discovery_summary TEXT,
  key_evidence JSONB,
  pattern_timeline JSONB,
  integration_status TEXT,
  times_detected INTEGER,
  assessments_detected_in JSONB,
  user_notes TEXT,
  archetype_images JSONB,
  traits JSONB,
  psychology_profile JSONB
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ua.id as user_archetype_id,
    ea.id as archetype_id,
    ea.name as archetype_name,
    ea.description as archetype_description,
    ua.primary_alias,
    ua.ranked_aliases,
    ua.current_confidence_score,
    ua.peak_confidence_score,
    ua.impact_score,
    ua.first_discovered_at,
    assess.name as discovered_in_assessment_name,
    ua.discovery_summary,
    ua.key_evidence,
    ua.pattern_timeline,
    ua.integration_status,
    ua.times_detected,
    ua.assessments_detected_in,
    ua.user_notes,
    ea.archetype_images,
    ea.traits,
    ea.psychology_profile
  FROM user_archetypes ua
  JOIN enhanced_archetypes ea ON ua.archetype_id = ea.id
  LEFT JOIN enhanced_assessments assess ON ua.discovered_in_assessment_id = assess.id
  WHERE ua.user_id = p_user_id
    AND ua.is_active = true
  ORDER BY ua.current_confidence_score DESC, ua.first_discovered_at DESC;
END;
$$ LANGUAGE plpgsql;

-- Function to add or update user archetype
CREATE OR REPLACE FUNCTION upsert_user_archetype(
  p_user_id UUID,
  p_archetype_id UUID,
  p_conversation_id UUID,
  p_assessment_id UUID,
  p_confidence_score DECIMAL,
  p_primary_alias TEXT,
  p_ranked_aliases JSONB,
  p_discovery_summary TEXT,
  p_evidence JSONB
)
RETURNS UUID AS $$
DECLARE
  v_user_archetype_id UUID;
  v_impact_score INTEGER;
  v_existing_evidence JSONB;
  v_existing_assessments JSONB;
BEGIN
  -- Get impact score from archetype
  SELECT impact_score INTO v_impact_score
  FROM enhanced_archetypes
  WHERE id = p_archetype_id;

  -- Check if archetype already exists for user
  SELECT id, key_evidence, assessments_detected_in 
  INTO v_user_archetype_id, v_existing_evidence, v_existing_assessments
  FROM user_archetypes
  WHERE user_id = p_user_id AND archetype_id = p_archetype_id;

  IF v_user_archetype_id IS NOT NULL THEN
    -- Update existing archetype
    UPDATE user_archetypes
    SET
      current_confidence_score = p_confidence_score,
      peak_confidence_score = GREATEST(peak_confidence_score, p_confidence_score),
      primary_alias = p_primary_alias,
      ranked_aliases = p_ranked_aliases,
      key_evidence = COALESCE(v_existing_evidence, '[]'::jsonb) || p_evidence,
      times_detected = times_detected + 1,
      assessments_detected_in = CASE 
        WHEN p_assessment_id IS NOT NULL AND NOT (COALESCE(v_existing_assessments, '[]'::jsonb) @> to_jsonb(p_assessment_id::text))
        THEN COALESCE(v_existing_assessments, '[]'::jsonb) || to_jsonb(p_assessment_id::text)
        ELSE COALESCE(v_existing_assessments, '[]'::jsonb)
      END,
      pattern_timeline = pattern_timeline || jsonb_build_object(
        to_char(NOW(), 'YYYY-MM-DD'),
        jsonb_build_object(
          'confidence', p_confidence_score,
          'assessment_id', p_assessment_id,
          'conversation_id', p_conversation_id
        )
      ),
      updated_at = NOW()
    WHERE id = v_user_archetype_id;
  ELSE
    -- Insert new archetype
    INSERT INTO user_archetypes (
      user_id,
      archetype_id,
      discovered_in_assessment_id,
      discovered_in_conversation_id,
      current_confidence_score,
      peak_confidence_score,
      impact_score,
      primary_alias,
      ranked_aliases,
      discovery_summary,
      key_evidence,
      pattern_timeline
    ) VALUES (
      p_user_id,
      p_archetype_id,
      p_assessment_id,
      p_conversation_id,
      p_confidence_score,
      p_confidence_score,
      v_impact_score,
      p_primary_alias,
      p_ranked_aliases,
      p_discovery_summary,
      p_evidence,
      jsonb_build_object(
        to_char(NOW(), 'YYYY-MM-DD'),
        jsonb_build_object(
          'confidence', p_confidence_score,
          'assessment_id', p_assessment_id,
          'conversation_id', p_conversation_id
        )
      )
    )
    RETURNING id INTO v_user_archetype_id;
  END IF;

  RETURN v_user_archetype_id;
END;
$$ LANGUAGE plpgsql;

-- Comments
COMMENT ON TABLE user_archetypes IS 'Stores each user''s discovered archetypes as permanent profile cards that evolve over time';
COMMENT ON COLUMN user_archetypes.primary_alias IS 'The most relevant alias name for this user (e.g., "The Gaslighter" instead of "The Narcissist")';
COMMENT ON COLUMN user_archetypes.ranked_aliases IS 'Array of aliases ranked by strength: [{"name": "The Gaslighter", "strength": "strong", "confidence": 92}]';
COMMENT ON COLUMN user_archetypes.key_evidence IS 'Array of quotes from conversations that demonstrate this archetype';
COMMENT ON COLUMN user_archetypes.pattern_timeline IS 'Timeline of when this archetype appeared: {"2025-01-12": {"confidence": 85, "assessment_id": "..."}}';
COMMENT ON COLUMN user_archetypes.integration_status IS 'User''s progress with this archetype: discovered, working_on, integrated, archived';

