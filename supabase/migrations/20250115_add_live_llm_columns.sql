-- Add live_provider and live_model columns to enhanced_assessments table
-- These columns store which LLM provider and model to use for live assessments

ALTER TABLE enhanced_assessments
ADD COLUMN IF NOT EXISTS live_provider TEXT DEFAULT 'openai',
ADD COLUMN IF NOT EXISTS live_model TEXT DEFAULT 'gpt-4-turbo-preview';

-- Add comment to explain the columns
COMMENT ON COLUMN enhanced_assessments.live_provider IS 'LLM provider to use for live assessments (e.g., openai, openrouter, anthropic)';
COMMENT ON COLUMN enhanced_assessments.live_model IS 'LLM model to use for live assessments (e.g., gpt-4-turbo-preview, openai/gpt-4-turbo)';

