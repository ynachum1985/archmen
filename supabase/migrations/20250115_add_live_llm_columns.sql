-- Add missing columns to enhanced_assessments table
-- These columns are required for the new assessment builder

-- LLM Configuration columns
ALTER TABLE enhanced_assessments
ADD COLUMN IF NOT EXISTS live_provider TEXT DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS live_model TEXT DEFAULT 'gpt-4-turbo-preview';

-- Question Settings columns (for completion criteria)
ALTER TABLE enhanced_assessments
ADD COLUMN IF NOT EXISTS min_archetypes INTEGER DEFAULT 2,
ADD COLUMN IF NOT EXISTS min_confidence INTEGER DEFAULT 70;

-- Add comments to explain the columns
COMMENT ON COLUMN enhanced_assessments.live_provider IS 'LLM provider to use for live assessments (e.g., openai, openrouter, anthropic)';
COMMENT ON COLUMN enhanced_assessments.live_model IS 'LLM model to use for live assessments (e.g., gpt-4-turbo-preview, openai/gpt-4-turbo)';
COMMENT ON COLUMN enhanced_assessments.min_archetypes IS 'Minimum number of archetypes that must be discovered before assessment can complete';
COMMENT ON COLUMN enhanced_assessments.min_confidence IS 'Minimum confidence threshold (30-100%) required for archetype detection';

