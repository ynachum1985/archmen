-- Database Cleanup: Remove unused/empty tables
-- This migration removes tables that are:
-- 1. Empty (0 rows)
-- 2. Not referenced in the codebase
-- 3. Replaced by newer tables
-- 
-- Date: 2025-10-27
-- Reason: Database consolidation and cleanup

-- Drop unused legacy assessment tables (replaced by enhanced_assessments)
DROP TABLE IF EXISTS assessments CASCADE;
DROP TABLE IF EXISTS assessment_sessions CASCADE;
DROP TABLE IF EXISTS assessment_chat_history CASCADE;
DROP TABLE IF EXISTS assessment_results CASCADE;

-- Drop unused archetype tables
DROP TABLE IF EXISTS archetype_results CASCADE;

-- Drop duplicate/unused user tables
DROP TABLE IF EXISTS user_profiles CASCADE;

-- Drop unused file/media tables
DROP TABLE IF EXISTS assessment_files CASCADE;
DROP TABLE IF EXISTS archetype_media CASCADE;

-- Note: The following tables are kept because they have code references:
-- - homework_task_completions (used in homework API)
-- - moderation_incidents (used in moderation system)
-- - archetype_files (used in knowledge base)
-- - user_notification_preferences (used in RLS policies)
-- - user_calendar_events (used in RLS policies)
-- - assessment_quiz_attempts (used in quiz gateway)
-- - quiz_question_responses (used in quiz system)
-- - assessment_enrollments (used in enrollment tracking)
-- - user_archetypes (used for archetype tracking)

-- Verify cleanup
-- SELECT table_name FROM information_schema.tables 
-- WHERE table_schema = 'public' 
-- ORDER BY table_name;

