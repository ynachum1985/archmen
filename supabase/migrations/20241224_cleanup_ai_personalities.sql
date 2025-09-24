-- Clean up AI Personalities table and add requested fields
-- Remove unnecessary columns and add the specific fields requested

-- First, let's see what columns exist and remove the ones we don't need
-- Remove unnecessary columns from ai_personalities
ALTER TABLE ai_personalities 
DROP COLUMN IF EXISTS unified_questions,
DROP COLUMN IF EXISTS questioning_style,
DROP COLUMN IF EXISTS tone,
DROP COLUMN IF EXISTS challenge_level,
DROP COLUMN IF EXISTS emotional_attunement,
DROP COLUMN IF EXISTS sample_openers,
DROP COLUMN IF EXISTS sample_followups,
DROP COLUMN IF EXISTS personality_config;

-- Add the specific fields requested
ALTER TABLE ai_personalities 
ADD COLUMN IF NOT EXISTS safety_limits TEXT[],
ADD COLUMN IF NOT EXISTS escalation_triggers TEXT[],
ADD COLUMN IF NOT EXISTS preferred_interventions TEXT[],
ADD COLUMN IF NOT EXISTS pacing_settings JSONB DEFAULT '{}';

-- Update the existing columns to ensure they're properly defined
-- Keep these core fields:
-- id, name, description, open_ended_questions, clarifying_questions, goals, behavior_traits, system_prompt_template, is_active, created_at, updated_at

-- Add specific_questions column for the third question type
ALTER TABLE ai_personalities 
ADD COLUMN IF NOT EXISTS specific_questions TEXT[] DEFAULT '{}';

-- Drop the ai_question_templates table since we're keeping it simple
DROP TABLE IF EXISTS ai_question_templates;

-- Update existing personalities with some default values for the new fields
UPDATE ai_personalities 
SET 
  safety_limits = ARRAY[
    'Avoid giving medical or therapeutic advice',
    'Do not encourage harmful behaviors',
    'Respect user boundaries and consent',
    'Maintain professional boundaries'
  ],
  escalation_triggers = ARRAY[
    'Mentions of self-harm or suicide',
    'Expressions of violence toward others',
    'Severe mental health crisis indicators',
    'Substance abuse concerns'
  ],
  preferred_interventions = ARRAY[
    'Gentle redirection to professional help',
    'Validation of feelings while maintaining boundaries',
    'Suggest grounding techniques when appropriate',
    'Encourage seeking support from trusted individuals'
  ],
  pacing_settings = jsonb_build_object(
    'questions_per_session', 8,
    'pause_between_questions', 30,
    'max_session_duration', 45,
    'break_frequency', 'every_15_minutes'
  ),
  specific_questions = ARRAY[
    'In your closest relationships, do you tend to be the one who initiates plans and takes charge, or do you prefer to follow someone else''s lead?',
    'When facing a major life decision, do you rely more on logical analysis or gut feelings?',
    'In social situations, do you feel energized by being around many people, or do you prefer smaller, intimate gatherings?'
  ]
WHERE safety_limits IS NULL OR array_length(safety_limits, 1) IS NULL;

-- Add comments to document the simplified structure
COMMENT ON COLUMN ai_personalities.safety_limits IS 'Array of safety guidelines and limits for this AI personality';
COMMENT ON COLUMN ai_personalities.escalation_triggers IS 'Array of situations that should trigger escalation or intervention';
COMMENT ON COLUMN ai_personalities.preferred_interventions IS 'Array of preferred intervention strategies for this personality';
COMMENT ON COLUMN ai_personalities.pacing_settings IS 'JSONB object containing pacing configuration like questions_per_session, pause_between_questions, etc.';
COMMENT ON COLUMN ai_personalities.specific_questions IS 'Array of specific questions that require direct answers (vs open-ended)';

-- Ensure RLS policies are still in place
-- (The existing RLS policies should still work since we're keeping the core table structure)
