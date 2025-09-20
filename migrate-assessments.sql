-- Migration script to copy assessments from enhanced_assessments to assessment_templates
-- Run this in your Supabase SQL editor to fix the assessment display issue

-- First, let's see what's in both tables
SELECT 'enhanced_assessments' as table_name, COUNT(*) as count FROM enhanced_assessments
UNION ALL
SELECT 'assessment_templates' as table_name, COUNT(*) as count FROM assessment_templates;

-- Copy assessments from enhanced_assessments to assessment_templates
-- Only copy if they don't already exist in assessment_templates
INSERT INTO assessment_templates (
  id,
  name,
  description,
  category,
  purpose,
  system_prompt,
  combined_prompt,
  min_questions,
  max_questions,
  evidence_threshold,
  adaptation_sensitivity,
  expected_duration,
  question_examples,
  response_requirements,
  adaptive_logic,
  cycle_settings,
  selected_personality_id,
  report_generation,
  is_active,
  created_at,
  updated_at
)
SELECT 
  ea.id,
  ea.name,
  ea.description,
  ea.category,
  ea.purpose,
  ea.system_prompt,
  ea.combined_prompt,
  ea.min_questions,
  ea.max_questions,
  ea.evidence_threshold,
  ea.adaptation_sensitivity,
  ea.expected_duration,
  ea.question_examples,
  ea.response_requirements,
  ea.adaptive_logic,
  ea.cycle_settings,
  ea.selected_personality_id,
  ea.report_generation,
  ea.is_active,
  ea.created_at,
  ea.updated_at
FROM enhanced_assessments ea
WHERE NOT EXISTS (
  SELECT 1 FROM assessment_templates at 
  WHERE at.name = ea.name
);

-- Verify the migration
SELECT 'After migration - enhanced_assessments' as table_name, COUNT(*) as count FROM enhanced_assessments
UNION ALL
SELECT 'After migration - assessment_templates' as table_name, COUNT(*) as count FROM assessment_templates;

-- Show the migrated assessments
SELECT id, name, category, is_active, created_at 
FROM assessment_templates 
ORDER BY created_at DESC;
