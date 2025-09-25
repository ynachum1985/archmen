-- Add status column to enhanced_assessments table for draft/live/archived workflow
-- This enables the consolidated assessment management approach

-- Add status column with default 'draft'
ALTER TABLE enhanced_assessments 
ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'draft' CHECK (status IN ('draft', 'live', 'archived'));

-- Update existing assessments based on is_active field
UPDATE enhanced_assessments 
SET status = CASE 
  WHEN is_active = true THEN 'live'
  ELSE 'draft'
END
WHERE status IS NULL OR status = 'draft';

-- Create index for efficient status filtering
CREATE INDEX IF NOT EXISTS idx_enhanced_assessments_status ON enhanced_assessments(status);
CREATE INDEX IF NOT EXISTS idx_enhanced_assessments_status_active ON enhanced_assessments(status, is_active);

-- Update the user dashboard query to only show live assessments
-- This ensures only published assessments appear in the user interface
