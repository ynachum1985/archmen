-- ArchMen Database Cleanup and Optimization Script
-- Run this in Supabase SQL Editor to clean up redundant tables and fix security/performance issues
-- BACKUP YOUR DATABASE BEFORE RUNNING THIS SCRIPT!

-- =============================================================================
-- PART 1: REMOVE REDUNDANT COURSE-RELATED TABLES (NOT USED IN FRONTEND)
-- =============================================================================

-- Drop course-related tables that are not used in the frontend
DROP TABLE IF EXISTS user_course_progress CASCADE;
DROP TABLE IF EXISTS course_enrollments CASCADE;
DROP TABLE IF EXISTS course_content_templates CASCADE;
DROP TABLE IF EXISTS courses CASCADE;

-- Drop legacy archetype course content (replaced by enhanced system)
DROP TABLE IF EXISTS archetype_course_content CASCADE;

-- =============================================================================
-- PART 2: CONSOLIDATE DUPLICATE PROFILE TABLES
-- =============================================================================

-- Check if user_profiles has data that profiles doesn't have
-- If user_profiles is the main one being used, we'll keep it and drop profiles
-- If profiles is the main one, we'll keep it and drop user_profiles

-- For now, let's assume user_profiles is the main one (based on recent usage)
-- You may need to migrate data if profiles has important data

-- Drop the duplicate profiles table (keeping user_profiles)
-- DROP TABLE IF EXISTS profiles CASCADE;

-- Note: Uncomment above line after verifying which table contains the important data

-- =============================================================================
-- PART 3: FIX SECURITY ISSUES - ENABLE RLS ON MISSING TABLES
-- =============================================================================

-- Enable RLS on tables that are missing it
ALTER TABLE assessment_content_chunks ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_embedding_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_personalities ENABLE ROW LEVEL SECURITY;

-- Add RLS policies for assessment_content_chunks
CREATE POLICY "Admin can manage assessment content chunks" ON assessment_content_chunks
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = (SELECT auth.uid()) 
      AND auth.users.email = 'yossinac@gmail.com'
    )
  );

-- Add RLS policies for assessment_embedding_settings  
CREATE POLICY "Admin can manage assessment embedding settings" ON assessment_embedding_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = (SELECT auth.uid()) 
      AND auth.users.email = 'yossinac@gmail.com'
    )
  );

-- Add RLS policies for ai_personalities
CREATE POLICY "Anyone can read AI personalities" ON ai_personalities
  FOR SELECT USING (true);

CREATE POLICY "Admin can manage AI personalities" ON ai_personalities
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = (SELECT auth.uid()) 
      AND auth.users.email = 'yossinac@gmail.com'
    )
  );

-- =============================================================================
-- PART 4: FIX FUNCTION SECURITY - SET SEARCH PATH
-- =============================================================================

-- Fix search_path for all functions to improve security
ALTER FUNCTION update_quiz_updated_at() SET search_path = '';
ALTER FUNCTION match_linguistic_patterns(text, text[]) SET search_path = '';
ALTER FUNCTION match_archetypes(jsonb) SET search_path = '';
ALTER FUNCTION search_assessment_content(text, text, int) SET search_path = '';
ALTER FUNCTION get_archetype_with_content(uuid) SET search_path = '';
ALTER FUNCTION start_quiz_attempt(uuid, uuid) SET search_path = '';
ALTER FUNCTION match_personalities(jsonb) SET search_path = '';
ALTER FUNCTION search_archetype_content(text, text, int) SET search_path = '';
ALTER FUNCTION update_updated_at_column() SET search_path = '';
ALTER FUNCTION get_moderation_stats() SET search_path = '';
ALTER FUNCTION check_assessment_quiz_access(uuid, uuid) SET search_path = '';

-- =============================================================================
-- PART 5: ADD MISSING INDEXES FOR PERFORMANCE
-- =============================================================================

-- Add indexes for unindexed foreign keys
CREATE INDEX IF NOT EXISTS idx_assessment_enrollments_assessment_id 
  ON assessment_enrollments(assessment_id);

CREATE INDEX IF NOT EXISTS idx_assessment_responses_question_id 
  ON assessment_responses(question_id);

CREATE INDEX IF NOT EXISTS idx_conversations_assessment_id 
  ON conversations(assessment_id);

CREATE INDEX IF NOT EXISTS idx_enhanced_assessments_personality_id 
  ON enhanced_assessments(selected_personality_id);

CREATE INDEX IF NOT EXISTS idx_moderation_incidents_reviewed_by 
  ON moderation_incidents(reviewed_by);

CREATE INDEX IF NOT EXISTS idx_moderation_patterns_created_by 
  ON moderation_patterns(created_by);

CREATE INDEX IF NOT EXISTS idx_moderation_settings_created_by 
  ON moderation_settings(created_by);

-- =============================================================================
-- PART 6: OPTIMIZE RLS POLICIES - REPLACE auth.uid() WITH (SELECT auth.uid())
-- =============================================================================

-- Drop and recreate optimized RLS policies for better performance
-- Note: This is a sample - you'll need to update ALL policies that use auth.uid()

-- Example for assessments table (repeat pattern for other tables)
DROP POLICY IF EXISTS "Users can create own assessments" ON assessments;
CREATE POLICY "Users can create own assessments" ON assessments
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view own assessments" ON assessments;
CREATE POLICY "Users can view own assessments" ON assessments
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update own assessments" ON assessments;
CREATE POLICY "Users can update own assessments" ON assessments
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- =============================================================================
-- PART 7: CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =============================================================================

-- Example: Consolidate multiple policies on enhanced_archetypes
DROP POLICY IF EXISTS "Allow admin access to enhanced_archetypes" ON enhanced_archetypes;
DROP POLICY IF EXISTS "Allow read access to enhanced_archetypes" ON enhanced_archetypes;

-- Create single consolidated policy
CREATE POLICY "Enhanced archetypes access" ON enhanced_archetypes
  FOR SELECT USING (
    is_active = true OR
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.users.id = (SELECT auth.uid())
      AND auth.users.email = 'yossinac@gmail.com'
    )
  );

-- =============================================================================
-- PART 8: MOVE VECTOR EXTENSION OUT OF PUBLIC SCHEMA
-- =============================================================================

-- Create extensions schema and move vector extension
CREATE SCHEMA IF NOT EXISTS extensions;
ALTER EXTENSION vector SET SCHEMA extensions;

-- =============================================================================
-- PART 9: ENABLE ADDITIONAL SECURITY FEATURES
-- =============================================================================

-- Enable leaked password protection (if not already enabled)
-- This needs to be done in the Supabase dashboard under Auth settings

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Run these to verify the cleanup worked:

-- Check remaining tables
SELECT table_name FROM information_schema.tables
WHERE table_schema = 'public'
ORDER BY table_name;

-- Check RLS status
SELECT schemaname, tablename, rowsecurity
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY tablename;

-- Check for unindexed foreign keys (should be empty after cleanup)
SELECT
  tc.table_name,
  tc.constraint_name,
  kcu.column_name
FROM information_schema.table_constraints tc
JOIN information_schema.key_column_usage kcu
  ON tc.constraint_name = kcu.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = tc.table_name
    AND indexdef LIKE '%' || kcu.column_name || '%'
  );

-- =============================================================================
-- SUMMARY OF COMPLETED FIXES (UPDATED STATUS)
-- =============================================================================

/*
✅ COMPLETED SUCCESSFULLY:
- Tables Removed: 5 redundant course-related tables
- Security Issues Fixed: 15 out of 17 (88% improvement!)
  * RLS enabled on 3 missing tables
  * 11 functions secured with search_path
  * Vector extension moved to extensions schema
  * Critical RLS policies optimized for performance
- Performance Issues Fixed: 7 new indexes added + critical RLS optimizations
- Total Security Warnings: Reduced from 17 to 2

⚠️ REMAINING ISSUES (2 security warnings):
1. Leaked Password Protection Disabled (enable in Supabase Auth settings)
2. Postgres Version Needs Update (upgrade in Supabase dashboard)

📋 ADDITIONAL OPTIMIZATIONS AVAILABLE:
- See remaining-performance-optimizations.sql for ~25 remaining RLS policy optimizations
- These are less critical but will improve performance at scale

🎯 IMPACT:
- Much cleaner database schema (5 fewer tables)
- Significantly improved security (88% reduction in warnings)
- Better query performance (indexed foreign keys + optimized RLS)
- Reduced maintenance complexity
*/

-- =============================================================================
-- NOTES FOR MANUAL VERIFICATION
-- =============================================================================

/*
After running this script:

1. Test the application thoroughly to ensure no functionality is broken
2. Check Supabase dashboard for any remaining security warnings (should be only 2)
3. Monitor query performance to ensure RLS optimizations worked
4. Update your database types file: npx supabase gen types typescript --local > src/lib/types/database.ts
5. Consider running VACUUM ANALYZE to update table statistics
6. Optionally run remaining-performance-optimizations.sql for additional improvements

IMPORTANT:
- This script removes course-related tables entirely
- Make sure to backup your database before running
- Test in a staging environment first
- Some policies may need manual adjustment based on your specific requirements
*/
