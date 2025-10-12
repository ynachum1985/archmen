-- Add emerging_archetypes column to conversations table
-- This stores archetypes as they are discovered during the assessment conversation

ALTER TABLE conversations
ADD COLUMN IF NOT EXISTS emerging_archetypes JSONB DEFAULT '[]'::jsonb;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_conversations_emerging_archetypes 
ON conversations USING GIN (emerging_archetypes);

-- Add comment explaining the structure
COMMENT ON COLUMN conversations.emerging_archetypes IS 
'Array of emerging archetypes detected during conversation. Structure:
[
  {
    "archetype_id": "uuid",
    "archetype_name": "The Narcissist",
    "confidence_score": 85,
    "impact_score": 7,
    "ranked_aliases": [
      {"name": "The Gaslighter", "strength": "strong", "confidence": 92},
      {"name": "The Manipulator", "strength": "strong", "confidence": 88},
      {"name": "The Control Freak", "strength": "moderate", "confidence": 65}
    ],
    "evidence": ["quote1", "quote2"],
    "detected_at": "2025-01-12T..."
  }
]';

