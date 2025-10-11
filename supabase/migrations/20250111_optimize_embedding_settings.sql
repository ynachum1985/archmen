-- Optimize Embedding Settings Migration
-- This migration:
-- 1. Adds missing fields to assessment_embedding_settings
-- 2. Updates default chunk sizes to optimal values (400 tokens)
-- 3. Updates default overlap to 20% (80 tokens)
-- 4. Standardizes embedding model to text-embedding-3-small

-- =============================================================================
-- PART 1: ADD MISSING FIELDS TO ASSESSMENT TABLE
-- =============================================================================

-- Add missing fields to match archetype_embedding_settings
ALTER TABLE assessment_embedding_settings
ADD COLUMN IF NOT EXISTS temperature REAL DEFAULT 0.7,
ADD COLUMN IF NOT EXISTS max_tokens INTEGER DEFAULT 2000,
ADD COLUMN IF NOT EXISTS custom_instructions TEXT,
ADD COLUMN IF NOT EXISTS settings JSONB DEFAULT '{}';

-- =============================================================================
-- PART 2: UPDATE DEFAULT VALUES FOR OPTIMAL PERFORMANCE
-- =============================================================================

-- Update archetype_embedding_settings defaults
ALTER TABLE archetype_embedding_settings
ALTER COLUMN chunk_size SET DEFAULT 400,
ALTER COLUMN chunk_overlap SET DEFAULT 80;

-- Update assessment_embedding_settings defaults
ALTER TABLE assessment_embedding_settings
ALTER COLUMN chunk_size SET DEFAULT 400,
ALTER COLUMN chunk_overlap SET DEFAULT 80;

-- =============================================================================
-- PART 3: UPDATE EXISTING RECORDS (OPTIONAL - COMMENTED OUT)
-- =============================================================================

-- Uncomment these if you want to update existing records to use new defaults
-- WARNING: This will re-process all embeddings with new chunk sizes

-- UPDATE archetype_embedding_settings
-- SET 
--   chunk_size = 400,
--   chunk_overlap = 80,
--   embedding_model = 'text-embedding-3-small',
--   updated_at = NOW()
-- WHERE chunk_size = 1000;  -- Only update records using old default

-- UPDATE assessment_embedding_settings
-- SET 
--   chunk_size = 400,
--   chunk_overlap = 80,
--   embedding_model = 'text-embedding-3-small',
--   updated_at = NOW()
-- WHERE chunk_size = 1000;  -- Only update records using old default

-- =============================================================================
-- PART 4: ADD HELPFUL COMMENTS
-- =============================================================================

COMMENT ON COLUMN archetype_embedding_settings.chunk_size IS 'Optimal: 300-500 tokens. Default 400 provides best balance of semantic coherence and retrieval accuracy.';
COMMENT ON COLUMN archetype_embedding_settings.chunk_overlap IS 'Recommended: 20% of chunk_size. Default 80 tokens ensures context continuity.';
COMMENT ON COLUMN archetype_embedding_settings.embedding_model IS 'Recommended: text-embedding-3-small for best performance/cost balance.';

COMMENT ON COLUMN assessment_embedding_settings.chunk_size IS 'Optimal: 300-500 tokens. Default 400 provides best balance of semantic coherence and retrieval accuracy.';
COMMENT ON COLUMN assessment_embedding_settings.chunk_overlap IS 'Recommended: 20% of chunk_size. Default 80 tokens ensures context continuity.';
COMMENT ON COLUMN assessment_embedding_settings.embedding_model IS 'Recommended: text-embedding-3-small for best performance/cost balance.';

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check archetype_embedding_settings schema
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'archetype_embedding_settings' 
-- ORDER BY ordinal_position;

-- Check assessment_embedding_settings schema
-- SELECT column_name, data_type, column_default 
-- FROM information_schema.columns 
-- WHERE table_name = 'assessment_embedding_settings' 
-- ORDER BY ordinal_position;

