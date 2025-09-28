-- Add moderation configuration columns to enhanced_assessments table
ALTER TABLE enhanced_assessments 
ADD COLUMN IF NOT EXISTS moderation_level TEXT DEFAULT 'moderate' CHECK (moderation_level IN ('strict', 'moderate', 'lenient', 'disabled')),
ADD COLUMN IF NOT EXISTS custom_moderation_settings JSONB DEFAULT '{
  "enableUserInputModeration": true,
  "enableAIResponseModeration": true,
  "blockThreshold": 0.8,
  "flagThreshold": 0.5,
  "customPatterns": []
}'::jsonb;

-- Update existing assessments to have default moderation settings
UPDATE enhanced_assessments 
SET 
  moderation_level = 'moderate',
  custom_moderation_settings = '{
    "enableUserInputModeration": true,
    "enableAIResponseModeration": true,
    "blockThreshold": 0.8,
    "flagThreshold": 0.5,
    "customPatterns": []
  }'::jsonb
WHERE moderation_level IS NULL OR custom_moderation_settings IS NULL;

-- Add comment for documentation
COMMENT ON COLUMN enhanced_assessments.moderation_level IS 'Content moderation level: strict, moderate, lenient, or disabled';
COMMENT ON COLUMN enhanced_assessments.custom_moderation_settings IS 'Custom moderation configuration including thresholds and patterns';
