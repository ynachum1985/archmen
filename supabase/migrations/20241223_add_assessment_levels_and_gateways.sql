-- Add level support and gateways to existing assessment tables
-- This migration adds production-ready level tagging and gateway configuration

-- Add level and gateway columns to enhanced_assessments
ALTER TABLE enhanced_assessments 
ADD COLUMN IF NOT EXISTS assessment_level INTEGER DEFAULT 1 CHECK (assessment_level BETWEEN 1 AND 3),
ADD COLUMN IF NOT EXISTS gateway_configuration JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS has_custom_gateways BOOLEAN DEFAULT false,
ADD COLUMN IF NOT EXISTS general_gateways_enabled BOOLEAN DEFAULT true;

-- Create assessment_gateway_templates table for reusable gateway configurations
CREATE TABLE IF NOT EXISTS assessment_gateway_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  gateway_type TEXT NOT NULL CHECK (gateway_type IN ('content_integration', 'emotional_readiness', 'prerequisite_completion', 'time_based', 'ai_verification', 'custom')),
  is_general BOOLEAN DEFAULT false, -- If true, applies to all assessments by default
  level_restriction INTEGER CHECK (level_restriction BETWEEN 1 AND 3), -- NULL means applies to all levels
  configuration JSONB NOT NULL DEFAULT '{}',
  verification_prompt TEXT,
  success_criteria JSONB DEFAULT '{}',
  failure_actions JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert default general gateways that apply to all assessments
INSERT INTO assessment_gateway_templates (name, description, gateway_type, is_general, configuration, verification_prompt, success_criteria) VALUES
(
  'Basic Emotional Readiness',
  'Ensures user has basic emotional awareness before proceeding',
  'emotional_readiness',
  true,
  '{"minimum_emotional_maturity": 3, "required_self_awareness": 60}',
  'Assess if the user demonstrates basic emotional awareness and self-reflection capabilities.',
  '{"emotional_maturity_score": 3, "self_awareness_percentage": 60}'
),
(
  'Assessment Completion Verification',
  'Verifies user has genuinely completed and integrated previous assessment content',
  'ai_verification',
  true,
  '{"minimum_integration_score": 70, "reflection_required": true}',
  'Evaluate if the user has genuinely integrated insights from their previous assessment. Look for specific examples, personal insights, and behavioral changes.',
  '{"integration_score": 70, "specific_examples_provided": true, "behavioral_insights": true}'
),
(
  'Level 2 Shadow Work Readiness',
  'Ensures user is emotionally prepared for shadow work and deeper psychological exploration',
  'emotional_readiness',
  false,
  '{"minimum_emotional_maturity": 6, "shadow_work_hours": 5, "therapy_experience": false}',
  'Assess if the user demonstrates emotional stability and readiness for shadow work. Look for emotional regulation, self-compassion, and ability to face difficult truths.',
  '{"emotional_maturity_score": 6, "emotional_regulation": true, "self_compassion": true}'
),
(
  'Level 3 Advanced Concepts Readiness',
  'Ensures user has sufficient emotional maturity for advanced topics like polyamory and patriarchy deconstruction',
  'emotional_readiness',
  false,
  '{"minimum_emotional_maturity": 8, "shadow_integration_verified": true, "relationship_experience": true}',
  'Assess if the user has the emotional maturity and life experience for advanced relationship concepts. Look for nuanced thinking, emotional regulation under stress, and integration of shadow aspects.',
  '{"emotional_maturity_score": 8, "nuanced_thinking": true, "stress_regulation": true, "shadow_integration": true}'
);

-- Update level restrictions for the advanced gateways
UPDATE assessment_gateway_templates 
SET level_restriction = 2 
WHERE name = 'Level 2 Shadow Work Readiness';

UPDATE assessment_gateway_templates 
SET level_restriction = 3 
WHERE name = 'Level 3 Advanced Concepts Readiness';

-- Create assessment_gateway_assignments table to link assessments with their specific gateways
CREATE TABLE IF NOT EXISTS assessment_gateway_assignments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  assessment_id UUID NOT NULL REFERENCES enhanced_assessments(id) ON DELETE CASCADE,
  gateway_template_id UUID NOT NULL REFERENCES assessment_gateway_templates(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  custom_configuration JSONB DEFAULT '{}', -- Override template configuration if needed
  order_index INTEGER DEFAULT 0, -- Order in which gateways are checked
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(assessment_id, gateway_template_id)
);

-- Create user_gateway_progress table to track individual user progress through gateways
CREATE TABLE IF NOT EXISTS user_gateway_progress (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES enhanced_assessments(id) ON DELETE CASCADE,
  gateway_template_id UUID NOT NULL REFERENCES assessment_gateway_templates(id) ON DELETE CASCADE,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'passed', 'failed', 'skipped')),
  attempts INTEGER DEFAULT 0,
  current_score INTEGER CHECK (current_score BETWEEN 0 AND 100),
  verification_data JSONB DEFAULT '{}',
  ai_feedback TEXT,
  passed_at TIMESTAMP WITH TIME ZONE,
  failed_at TIMESTAMP WITH TIME ZONE,
  next_attempt_allowed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, assessment_id, gateway_template_id)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_enhanced_assessments_level ON enhanced_assessments(assessment_level);
CREATE INDEX IF NOT EXISTS idx_gateway_templates_type ON assessment_gateway_templates(gateway_type);
CREATE INDEX IF NOT EXISTS idx_gateway_templates_general ON assessment_gateway_templates(is_general);
CREATE INDEX IF NOT EXISTS idx_gateway_templates_level ON assessment_gateway_templates(level_restriction);
CREATE INDEX IF NOT EXISTS idx_gateway_assignments_assessment ON assessment_gateway_assignments(assessment_id);
CREATE INDEX IF NOT EXISTS idx_gateway_assignments_template ON assessment_gateway_assignments(gateway_template_id);
CREATE INDEX IF NOT EXISTS idx_user_gateway_progress_user ON user_gateway_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_gateway_progress_assessment ON user_gateway_progress(assessment_id);
CREATE INDEX IF NOT EXISTS idx_user_gateway_progress_status ON user_gateway_progress(status);

-- Enable RLS
ALTER TABLE assessment_gateway_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_gateway_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_gateway_progress ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view active gateway templates" ON assessment_gateway_templates
  FOR SELECT TO authenticated USING (is_active = true);

CREATE POLICY "Admins can manage gateway templates" ON assessment_gateway_templates
  FOR ALL TO authenticated USING (true); -- In production, restrict to admin role

CREATE POLICY "Users can view gateway assignments for accessible assessments" ON assessment_gateway_assignments
  FOR SELECT TO authenticated USING (true);

CREATE POLICY "Admins can manage gateway assignments" ON assessment_gateway_assignments
  FOR ALL TO authenticated USING (true); -- In production, restrict to admin role

CREATE POLICY "Users can view own gateway progress" ON user_gateway_progress
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can update own gateway progress" ON user_gateway_progress
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can manage user gateway progress" ON user_gateway_progress
  FOR ALL TO authenticated USING (true);

-- Function to automatically assign general gateways to new assessments
CREATE OR REPLACE FUNCTION assign_general_gateways_to_assessment()
RETURNS TRIGGER AS $$
BEGIN
  -- Only assign general gateways if general_gateways_enabled is true
  IF NEW.general_gateways_enabled = true THEN
    INSERT INTO assessment_gateway_assignments (assessment_id, gateway_template_id, order_index)
    SELECT 
      NEW.id,
      gt.id,
      ROW_NUMBER() OVER (ORDER BY gt.created_at) - 1
    FROM assessment_gateway_templates gt
    WHERE gt.is_general = true 
      AND gt.is_active = true
      AND (gt.level_restriction IS NULL OR gt.level_restriction = NEW.assessment_level)
    ON CONFLICT (assessment_id, gateway_template_id) DO NOTHING;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-assign general gateways
CREATE TRIGGER assign_general_gateways_trigger
  AFTER INSERT ON enhanced_assessments
  FOR EACH ROW
  EXECUTE FUNCTION assign_general_gateways_to_assessment();

-- Function to check if user can access assessment based on gateways
CREATE OR REPLACE FUNCTION check_assessment_gateway_access(
  p_user_id UUID,
  p_assessment_id UUID
) RETURNS JSONB AS $$
DECLARE
  gateway_record RECORD;
  user_progress RECORD;
  blocking_gateways INTEGER := 0;
  total_gateways INTEGER := 0;
  result JSONB;
BEGIN
  -- Get all gateways for this assessment
  FOR gateway_record IN
    SELECT 
      aga.id as assignment_id,
      aga.order_index,
      aga.custom_configuration,
      gt.*
    FROM assessment_gateway_assignments aga
    JOIN assessment_gateway_templates gt ON aga.gateway_template_id = gt.id
    WHERE aga.assessment_id = p_assessment_id 
      AND aga.is_enabled = true
      AND gt.is_active = true
    ORDER BY aga.order_index
  LOOP
    total_gateways := total_gateways + 1;
    
    -- Check user progress for this gateway
    SELECT * INTO user_progress
    FROM user_gateway_progress
    WHERE user_id = p_user_id 
      AND assessment_id = p_assessment_id
      AND gateway_template_id = gateway_record.id;
    
    -- If no progress record or not passed, it's blocking
    IF user_progress IS NULL OR user_progress.status != 'passed' THEN
      blocking_gateways := blocking_gateways + 1;
    END IF;
  END LOOP;
  
  -- Return access result
  IF blocking_gateways = 0 THEN
    RETURN jsonb_build_object(
      'access_granted', true,
      'total_gateways', total_gateways,
      'passed_gateways', total_gateways,
      'blocking_gateways', 0
    );
  ELSE
    RETURN jsonb_build_object(
      'access_granted', false,
      'total_gateways', total_gateways,
      'passed_gateways', total_gateways - blocking_gateways,
      'blocking_gateways', blocking_gateways,
      'message', 'Complete required gateway assessments to unlock this assessment'
    );
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update existing assessments to have default level 1
UPDATE enhanced_assessments 
SET assessment_level = 1 
WHERE assessment_level IS NULL;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_gateway_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_gateway_templates_updated_at
  BEFORE UPDATE ON assessment_gateway_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_gateway_updated_at();

CREATE TRIGGER update_user_gateway_progress_updated_at
  BEFORE UPDATE ON user_gateway_progress
  FOR EACH ROW
  EXECUTE FUNCTION update_gateway_updated_at();
