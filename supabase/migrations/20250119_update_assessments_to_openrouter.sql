-- Update all existing assessments to use OpenRouter as default LLM provider
-- This migration changes the default from OpenAI to OpenRouter for cost consolidation

-- Update all assessments with OpenAI defaults to OpenRouter
UPDATE enhanced_assessments
SET 
  live_provider = 'openrouter',
  live_model = 'anthropic/claude-3.5-sonnet'
WHERE 
  live_provider = 'openai' 
  AND live_model = 'gpt-4-turbo-preview';

-- Update any remaining OpenAI assessments to OpenRouter
UPDATE enhanced_assessments
SET 
  live_provider = 'openrouter',
  live_model = 'anthropic/claude-3.5-sonnet'
WHERE 
  live_provider = 'openai';

-- Verify the update
SELECT 
  COUNT(*) as total_assessments,
  COUNT(CASE WHEN live_provider = 'openrouter' THEN 1 END) as openrouter_count,
  COUNT(CASE WHEN live_provider = 'openai' THEN 1 END) as openai_count,
  COUNT(CASE WHEN live_provider NOT IN ('openrouter', 'openai') THEN 1 END) as other_count
FROM enhanced_assessments;

