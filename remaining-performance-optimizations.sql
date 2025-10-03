-- Remaining Performance Optimizations for ArchMen Database
-- Run these in Supabase SQL Editor to fix remaining performance warnings

-- =============================================================================
-- PART 1: OPTIMIZE REMAINING RLS POLICIES - REPLACE auth.uid() WITH (SELECT auth.uid())
-- =============================================================================

-- Fix assessment_responses table policies
DROP POLICY IF EXISTS "Users can insert their own responses" ON assessment_responses;
CREATE POLICY "Users can insert their own responses" ON assessment_responses
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view their own responses" ON assessment_responses;
CREATE POLICY "Users can view their own responses" ON assessment_responses
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own responses" ON assessment_responses;
CREATE POLICY "Users can update their own responses" ON assessment_responses
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Fix assessment_sessions table policies
DROP POLICY IF EXISTS "Users can insert their own sessions" ON assessment_sessions;
CREATE POLICY "Users can insert their own sessions" ON assessment_sessions
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can view their own sessions" ON assessment_sessions;
CREATE POLICY "Users can view their own sessions" ON assessment_sessions
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can update their own sessions" ON assessment_sessions;
CREATE POLICY "Users can update their own sessions" ON assessment_sessions
  FOR UPDATE USING (user_id = (SELECT auth.uid()));

-- Fix archetype_results table policies
DROP POLICY IF EXISTS "Users can view own results" ON archetype_results;
CREATE POLICY "Users can view own results" ON archetype_results
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessments 
      WHERE assessments.id = archetype_results.assessment_id 
      AND assessments.user_id = (SELECT auth.uid())
    )
  );

-- Fix assessment_results table policies
DROP POLICY IF EXISTS "Users can view own assessment results" ON assessment_results;
CREATE POLICY "Users can view own assessment results" ON assessment_results
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can insert own assessment results" ON assessment_results;
CREATE POLICY "Users can insert own assessment results" ON assessment_results
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

-- Fix assessment_files table policies
DROP POLICY IF EXISTS "Users can view their own files" ON assessment_files;
CREATE POLICY "Users can view their own files" ON assessment_files
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can upload files" ON assessment_files;
CREATE POLICY "Users can upload files" ON assessment_files
  FOR INSERT WITH CHECK (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can delete their own files" ON assessment_files;
CREATE POLICY "Users can delete their own files" ON assessment_files
  FOR DELETE USING (user_id = (SELECT auth.uid()));

-- Fix enhanced_assessments table policies
DROP POLICY IF EXISTS "Authenticated users can create assessments" ON enhanced_assessments;
CREATE POLICY "Authenticated users can create assessments" ON enhanced_assessments
  FOR INSERT WITH CHECK ((SELECT auth.uid()) IS NOT NULL);

DROP POLICY IF EXISTS "Users can update their own assessments" ON enhanced_assessments;
CREATE POLICY "Users can update their own assessments" ON enhanced_assessments
  FOR UPDATE USING (created_by = (SELECT auth.uid()));

-- Fix assessment_chat_history table policies
DROP POLICY IF EXISTS "Users can view their own chat history" ON assessment_chat_history;
CREATE POLICY "Users can view their own chat history" ON assessment_chat_history
  FOR SELECT USING (user_id = (SELECT auth.uid()));

DROP POLICY IF EXISTS "Users can manage their own chat history" ON assessment_chat_history;
CREATE POLICY "Users can manage their own chat history" ON assessment_chat_history
  FOR ALL USING (user_id = (SELECT auth.uid()));

-- =============================================================================
-- PART 2: CONSOLIDATE MULTIPLE PERMISSIVE POLICIES
-- =============================================================================

-- Consolidate enhanced_archetypes policies
DROP POLICY IF EXISTS "Allow admin access to enhanced_archetypes" ON enhanced_archetypes;
DROP POLICY IF EXISTS "Allow read access to enhanced_archetypes" ON enhanced_archetypes;

CREATE POLICY "Enhanced archetypes access" ON enhanced_archetypes
  FOR SELECT USING (
    is_active = true OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = (SELECT auth.uid()) 
      AND auth.users.email = 'yossinac@gmail.com'
    )
  );

-- Consolidate assessment_templates policies
DROP POLICY IF EXISTS "Anyone can view active assessment templates" ON assessment_templates;
DROP POLICY IF EXISTS "Authenticated users can manage assessment templates" ON assessment_templates;

CREATE POLICY "Assessment templates access" ON assessment_templates
  FOR SELECT USING (
    is_active = true OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = (SELECT auth.uid()) 
      AND auth.users.email = 'yossinac@gmail.com'
    )
  );

CREATE POLICY "Assessment templates management" ON assessment_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = (SELECT auth.uid()) 
      AND auth.users.email = 'yossinac@gmail.com'
    )
  );

-- Consolidate assessment_questions policies
DROP POLICY IF EXISTS "Anyone can view questions for active templates" ON assessment_questions;
DROP POLICY IF EXISTS "Authenticated users can manage assessment questions" ON assessment_questions;

CREATE POLICY "Assessment questions access" ON assessment_questions
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM assessment_templates 
      WHERE assessment_templates.id = assessment_questions.template_id 
      AND assessment_templates.is_active = true
    ) OR 
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = (SELECT auth.uid()) 
      AND auth.users.email = 'yossinac@gmail.com'
    )
  );

CREATE POLICY "Assessment questions management" ON assessment_questions
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM auth.users 
      WHERE auth.users.id = (SELECT auth.uid()) 
      AND auth.users.email = 'yossinac@gmail.com'
    )
  );

-- =============================================================================
-- VERIFICATION QUERIES
-- =============================================================================

-- Check remaining RLS performance issues (should be much fewer)
SELECT 
  schemaname, 
  tablename, 
  policyname,
  CASE 
    WHEN definition LIKE '%auth.uid()%' AND definition NOT LIKE '%(select auth.uid())%' 
    THEN 'NEEDS_OPTIMIZATION' 
    ELSE 'OPTIMIZED' 
  END as status
FROM pg_policies 
WHERE schemaname = 'public' 
  AND definition LIKE '%auth.uid()%'
ORDER BY status DESC, tablename;

-- Check for remaining multiple permissive policies
SELECT 
  schemaname,
  tablename,
  COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
  AND permissive = true
GROUP BY schemaname, tablename, cmd
HAVING COUNT(*) > 1
ORDER BY policy_count DESC;
