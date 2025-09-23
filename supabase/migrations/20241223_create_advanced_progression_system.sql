-- Advanced Progression System for ArchMen
-- Implements leveled assessments with content integration and progression gates

-- Assessment Levels Table
CREATE TABLE IF NOT EXISTS assessment_levels (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  level_number INTEGER NOT NULL UNIQUE CHECK (level_number > 0),
  name TEXT NOT NULL,
  description TEXT,
  theme TEXT NOT NULL,
  prerequisites JSONB DEFAULT '[]', -- Array of required completions
  emotional_maturity_required INTEGER DEFAULT 1 CHECK (emotional_maturity_required BETWEEN 1 AND 10),
  integration_requirements JSONB DEFAULT '{}', -- Required integrations before access
  unlock_criteria JSONB DEFAULT '{}', -- Specific criteria to unlock this level
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default assessment levels
INSERT INTO assessment_levels (level_number, name, description, theme, emotional_maturity_required, integration_requirements, unlock_criteria) VALUES
(1, 'Foundation', 'Basic relationship patterns and archetypal discovery', 'relationships_dating', 1, '{}', '{}'),
(2, 'Integration', 'Advanced emotional work and shadow integration', 'shadow_integration', 6, '{"main_assessment_completed": true, "shadow_work_hours": 10}', '{"assessments_completed": ["main"], "integration_verified": true}'),
(3, 'Mastery', 'Advanced concepts: polyamory, masculine/feminine integration, patriarchy deconstruction', 'advanced_concepts', 8, '{"level_2_completed": true, "therapy_hours": 20, "shadow_integration_verified": true}', '{"emotional_maturity_score": 8, "integration_assessments_passed": 3}');

-- Enhanced Assessment Templates with Levels
ALTER TABLE enhanced_assessments ADD COLUMN IF NOT EXISTS level_id UUID REFERENCES assessment_levels(id);
ALTER TABLE enhanced_assessments ADD COLUMN IF NOT EXISTS prerequisite_assessments JSONB DEFAULT '[]';
ALTER TABLE enhanced_assessments ADD COLUMN IF NOT EXISTS content_integration_required BOOLEAN DEFAULT false;
ALTER TABLE enhanced_assessments ADD COLUMN IF NOT EXISTS integration_verification_prompt TEXT;
ALTER TABLE enhanced_assessments ADD COLUMN IF NOT EXISTS minimum_integration_score INTEGER DEFAULT 70;

-- User Progression Tracking
CREATE TABLE IF NOT EXISTS user_progression (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  current_level INTEGER DEFAULT 1,
  emotional_maturity_score INTEGER DEFAULT 1 CHECK (emotional_maturity_score BETWEEN 1 AND 10),
  shadow_work_hours INTEGER DEFAULT 0,
  therapy_hours INTEGER DEFAULT 0,
  integration_scores JSONB DEFAULT '{}', -- Scores for different integration areas
  completed_assessments JSONB DEFAULT '[]', -- Array of completed assessment IDs
  blocked_until TIMESTAMP WITH TIME ZONE, -- Temporary blocks for integration work
  progression_notes TEXT,
  last_integration_check TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id)
);

-- Content Integration Tracking
CREATE TABLE IF NOT EXISTS content_integrations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  archetype_id UUID REFERENCES enhanced_archetypes(id),
  media_id UUID REFERENCES archetype_media(id),
  integration_type TEXT NOT NULL CHECK (integration_type IN ('video_watched', 'exercise_completed', 'reflection_submitted', 'homework_done', 'shadow_work')),
  completion_percentage INTEGER DEFAULT 0 CHECK (completion_percentage BETWEEN 0 AND 100),
  integration_score INTEGER CHECK (integration_score BETWEEN 0 AND 100),
  reflection_text TEXT,
  ai_verification_passed BOOLEAN DEFAULT false,
  verification_attempts INTEGER DEFAULT 0,
  integration_data JSONB DEFAULT '{}', -- Flexible data for different integration types
  completed_at TIMESTAMP WITH TIME ZONE,
  verified_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Assessment Gates (blocks progression until requirements met)
CREATE TABLE IF NOT EXISTS assessment_gates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES enhanced_assessments(id),
  gate_type TEXT NOT NULL CHECK (gate_type IN ('content_integration', 'emotional_readiness', 'prerequisite_completion', 'time_based', 'ai_verification')),
  gate_criteria JSONB NOT NULL, -- Specific criteria that must be met
  current_progress JSONB DEFAULT '{}', -- Current progress toward meeting criteria
  is_passed BOOLEAN DEFAULT false,
  blocked_reason TEXT,
  estimated_unlock_date TIMESTAMP WITH TIME ZONE,
  ai_assessment_required BOOLEAN DEFAULT false,
  ai_verification_prompt TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Content Delivery Tracking (for AI to know what content to show)
CREATE TABLE IF NOT EXISTS content_delivery_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  conversation_id UUID, -- Link to conversation where content was delivered
  archetype_id UUID REFERENCES enhanced_archetypes(id),
  media_id UUID REFERENCES archetype_media(id),
  content_type TEXT NOT NULL CHECK (content_type IN ('video', 'image', 'audio', 'document', 'exercise', 'homework')),
  delivery_context TEXT, -- Why this content was delivered
  user_archetype_confidence JSONB DEFAULT '{}', -- User's archetype scores when content was delivered
  engagement_metrics JSONB DEFAULT '{}', -- How user engaged with content
  follow_up_required BOOLEAN DEFAULT false,
  delivered_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progression_user_id ON user_progression(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progression_current_level ON user_progression(current_level);
CREATE INDEX IF NOT EXISTS idx_content_integrations_user_id ON content_integrations(user_id);
CREATE INDEX IF NOT EXISTS idx_content_integrations_archetype_id ON content_integrations(archetype_id);
CREATE INDEX IF NOT EXISTS idx_assessment_gates_user_id ON assessment_gates(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_gates_assessment_id ON assessment_gates(assessment_id);
CREATE INDEX IF NOT EXISTS idx_content_delivery_user_id ON content_delivery_log(user_id);
CREATE INDEX IF NOT EXISTS idx_content_delivery_archetype_id ON content_delivery_log(archetype_id);

-- Enable RLS
ALTER TABLE assessment_levels ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_progression ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_integrations ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_gates ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_delivery_log ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view assessment levels" ON assessment_levels
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Users can view own progression" ON user_progression
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own progression" ON user_progression
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own progression" ON user_progression
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view own content integrations" ON content_integrations
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own content integrations" ON content_integrations
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own content integrations" ON content_integrations
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can view own assessment gates" ON assessment_gates
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can manage assessment gates" ON assessment_gates
  FOR ALL TO authenticated USING (true);

CREATE POLICY "Users can view own content delivery log" ON content_delivery_log
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can log content delivery" ON content_delivery_log
  FOR INSERT TO authenticated WITH CHECK (true);

-- Functions for progression logic
CREATE OR REPLACE FUNCTION check_assessment_access(
  p_user_id UUID,
  p_assessment_id UUID
) RETURNS JSONB AS $$
DECLARE
  user_prog user_progression%ROWTYPE;
  assessment enhanced_assessments%ROWTYPE;
  level_info assessment_levels%ROWTYPE;
  gates_blocking INTEGER;
  result JSONB;
BEGIN
  -- Get user progression
  SELECT * INTO user_prog FROM user_progression WHERE user_id = p_user_id;
  
  -- Get assessment info
  SELECT * INTO assessment FROM enhanced_assessments WHERE id = p_assessment_id;
  
  -- Get level info
  SELECT * INTO level_info FROM assessment_levels WHERE id = assessment.level_id;
  
  -- Check if user has access to this level
  IF level_info.level_number > user_prog.current_level THEN
    RETURN jsonb_build_object(
      'access_granted', false,
      'reason', 'level_locked',
      'required_level', level_info.level_number,
      'current_level', user_prog.current_level,
      'message', 'Complete previous level requirements to unlock this assessment'
    );
  END IF;
  
  -- Check for blocking gates
  SELECT COUNT(*) INTO gates_blocking 
  FROM assessment_gates 
  WHERE user_id = p_user_id 
    AND assessment_id = p_assessment_id 
    AND is_passed = false;
  
  IF gates_blocking > 0 THEN
    RETURN jsonb_build_object(
      'access_granted', false,
      'reason', 'gates_blocking',
      'blocking_gates', gates_blocking,
      'message', 'Complete required integration work before proceeding'
    );
  END IF;
  
  -- Access granted
  RETURN jsonb_build_object(
    'access_granted', true,
    'level', level_info.level_number,
    'level_name', level_info.name
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to update user progression
CREATE OR REPLACE FUNCTION update_user_progression(
  p_user_id UUID,
  p_assessment_completed UUID DEFAULT NULL,
  p_integration_score INTEGER DEFAULT NULL,
  p_emotional_maturity_score INTEGER DEFAULT NULL
) RETURNS VOID AS $$
DECLARE
  current_prog user_progression%ROWTYPE;
  next_level INTEGER;
BEGIN
  -- Get current progression or create if doesn't exist
  SELECT * INTO current_prog FROM user_progression WHERE user_id = p_user_id;
  
  IF NOT FOUND THEN
    INSERT INTO user_progression (user_id) VALUES (p_user_id);
    SELECT * INTO current_prog FROM user_progression WHERE user_id = p_user_id;
  END IF;
  
  -- Update progression
  UPDATE user_progression SET
    completed_assessments = CASE 
      WHEN p_assessment_completed IS NOT NULL THEN 
        completed_assessments || jsonb_build_array(p_assessment_completed::text)
      ELSE completed_assessments
    END,
    emotional_maturity_score = COALESCE(p_emotional_maturity_score, emotional_maturity_score),
    updated_at = NOW()
  WHERE user_id = p_user_id;
  
  -- Check if user can advance to next level
  -- This would include more complex logic based on requirements
  
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
