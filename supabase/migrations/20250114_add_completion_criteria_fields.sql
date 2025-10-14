-- Add completion criteria fields to enhanced_assessments table
-- This migration adds min_archetypes and min_confidence for Option 2: Hybrid Completion system

ALTER TABLE enhanced_assessments 
ADD COLUMN IF NOT EXISTS min_questions INTEGER DEFAULT 8 CHECK (min_questions >= 1 AND min_questions <= 50),
ADD COLUMN IF NOT EXISTS max_questions INTEGER DEFAULT 15 CHECK (max_questions >= 1 AND max_questions <= 50),
ADD COLUMN IF NOT EXISTS min_archetypes INTEGER DEFAULT 2 CHECK (min_archetypes >= 1 AND min_archetypes <= 20),
ADD COLUMN IF NOT EXISTS min_confidence INTEGER DEFAULT 70 CHECK (min_confidence >= 30 AND min_confidence <= 100),
ADD COLUMN IF NOT EXISTS assessment_prompt TEXT,
ADD COLUMN IF NOT EXISTS live_provider TEXT DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS live_model TEXT DEFAULT 'gpt-4-turbo-preview';

-- Add comment to explain the fields
COMMENT ON COLUMN enhanced_assessments.min_questions IS 'Minimum questions user must answer before assessment can complete';
COMMENT ON COLUMN enhanced_assessments.max_questions IS 'Maximum questions before assessment force-completes';
COMMENT ON COLUMN enhanced_assessments.min_archetypes IS 'Minimum archetypes that must be discovered at required confidence';
COMMENT ON COLUMN enhanced_assessments.min_confidence IS 'Minimum confidence percentage (30-100) required for archetype discovery';
COMMENT ON COLUMN enhanced_assessments.assessment_prompt IS 'AI instructions for conducting the assessment (replaces system_prompt)';
COMMENT ON COLUMN enhanced_assessments.live_provider IS 'LLM provider for live assessments (openai, anthropic, openrouter)';
COMMENT ON COLUMN enhanced_assessments.live_model IS 'LLM model for live assessments';

-- Update existing assessments with default values based on their level
UPDATE enhanced_assessments 
SET 
  min_questions = CASE 
    WHEN assessment_level = 1 THEN 8
    WHEN assessment_level = 2 THEN 10
    WHEN assessment_level = 3 THEN 12
    ELSE 8
  END,
  max_questions = CASE 
    WHEN assessment_level = 1 THEN 12
    WHEN assessment_level = 2 THEN 15
    WHEN assessment_level = 3 THEN 18
    ELSE 12
  END,
  min_archetypes = CASE 
    WHEN assessment_level = 1 THEN 2
    WHEN assessment_level = 2 THEN 4
    WHEN assessment_level = 3 THEN 6
    ELSE 2
  END,
  min_confidence = CASE 
    WHEN assessment_level = 1 THEN 70
    WHEN assessment_level = 2 THEN 80
    WHEN assessment_level = 3 THEN 85
    ELSE 70
  END,
  assessment_prompt = COALESCE(system_prompt, 'You are an expert archetypal analyst conducting an assessment.'),
  live_provider = 'openai',
  live_model = 'gpt-4-turbo-preview'
WHERE min_questions IS NULL OR max_questions IS NULL OR min_archetypes IS NULL OR min_confidence IS NULL;

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_enhanced_assessments_completion_criteria 
ON enhanced_assessments(assessment_level, min_questions, max_questions, min_archetypes, min_confidence);

