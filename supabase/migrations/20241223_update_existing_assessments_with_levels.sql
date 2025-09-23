-- Update existing assessments with appropriate levels and gateway configurations
-- This migration assigns levels to existing assessments based on their content and purpose

-- Update assessments that are clearly Level 1 (Foundation)
UPDATE enhanced_assessments 
SET 
  assessment_level = 1,
  gateway_configuration = jsonb_build_object(
    'level_type', 'foundation',
    'focus', 'basic_patterns',
    'requirements', jsonb_build_array('basic_emotional_awareness')
  ),
  general_gateways_enabled = true
WHERE 
  assessment_level IS NULL 
  AND (
    LOWER(name) LIKE '%main%' 
    OR LOWER(name) LIKE '%basic%' 
    OR LOWER(name) LIKE '%foundation%'
    OR LOWER(name) LIKE '%relationship%'
    OR LOWER(name) LIKE '%dating%'
    OR LOWER(category) = 'main'
    OR LOWER(purpose) LIKE '%discover%'
    OR LOWER(purpose) LIKE '%identify%'
    OR LOWER(purpose) LIKE '%understand basic%'
  );

-- Update assessments that are clearly Level 2 (Integration)
UPDATE enhanced_assessments 
SET 
  assessment_level = 2,
  gateway_configuration = jsonb_build_object(
    'level_type', 'integration',
    'focus', 'shadow_work',
    'requirements', jsonb_build_array(
      'main_assessment_completed',
      'emotional_maturity_6_plus',
      'shadow_work_readiness'
    )
  ),
  general_gateways_enabled = true
WHERE 
  assessment_level IS NULL 
  AND (
    LOWER(name) LIKE '%shadow%' 
    OR LOWER(name) LIKE '%integration%' 
    OR LOWER(name) LIKE '%emotional%'
    OR LOWER(name) LIKE '%inner%'
    OR LOWER(name) LIKE '%depth%'
    OR LOWER(name) LIKE '%therapy%'
    OR LOWER(purpose) LIKE '%shadow%'
    OR LOWER(purpose) LIKE '%integrate%'
    OR LOWER(purpose) LIKE '%emotional growth%'
    OR LOWER(purpose) LIKE '%inner work%'
  );

-- Update assessments that are clearly Level 3 (Mastery)
UPDATE enhanced_assessments 
SET 
  assessment_level = 3,
  gateway_configuration = jsonb_build_object(
    'level_type', 'mastery',
    'focus', 'advanced_concepts',
    'requirements', jsonb_build_array(
      'level_2_completed',
      'emotional_maturity_8_plus',
      'shadow_integration_verified',
      'advanced_readiness'
    )
  ),
  general_gateways_enabled = true
WHERE 
  assessment_level IS NULL 
  AND (
    LOWER(name) LIKE '%polyamory%' 
    OR LOWER(name) LIKE '%masculine%' 
    OR LOWER(name) LIKE '%feminine%'
    OR LOWER(name) LIKE '%patriarchy%'
    OR LOWER(name) LIKE '%advanced%'
    OR LOWER(name) LIKE '%mastery%'
    OR LOWER(name) LIKE '%complex%'
    OR LOWER(purpose) LIKE '%polyamory%'
    OR LOWER(purpose) LIKE '%masculine%'
    OR LOWER(purpose) LIKE '%feminine%'
    OR LOWER(purpose) LIKE '%patriarchy%'
    OR LOWER(purpose) LIKE '%deconstruct%'
    OR LOWER(purpose) LIKE '%advanced%'
  );

-- Set remaining assessments to Level 1 by default
UPDATE enhanced_assessments 
SET 
  assessment_level = 1,
  gateway_configuration = jsonb_build_object(
    'level_type', 'foundation',
    'focus', 'general',
    'requirements', jsonb_build_array('basic_emotional_awareness')
  ),
  general_gateways_enabled = true
WHERE assessment_level IS NULL;

-- Create specific gateway assignments for existing assessments based on their levels
-- This will be handled by the trigger we created, but let's ensure it runs for existing assessments

-- Force trigger execution for all existing assessments
-- We'll do this by updating a non-critical field to trigger the gateway assignment
UPDATE enhanced_assessments 
SET updated_at = NOW()
WHERE id IN (
  SELECT ea.id 
  FROM enhanced_assessments ea
  LEFT JOIN assessment_gateway_assignments aga ON ea.id = aga.assessment_id
  WHERE aga.id IS NULL
  AND ea.general_gateways_enabled = true
);

-- Verify the updates
-- This is just for logging/verification purposes
DO $$
DECLARE
  level1_count INTEGER;
  level2_count INTEGER;
  level3_count INTEGER;
  total_assessments INTEGER;
  total_gateways INTEGER;
BEGIN
  SELECT COUNT(*) INTO level1_count FROM enhanced_assessments WHERE assessment_level = 1;
  SELECT COUNT(*) INTO level2_count FROM enhanced_assessments WHERE assessment_level = 2;
  SELECT COUNT(*) INTO level3_count FROM enhanced_assessments WHERE assessment_level = 3;
  SELECT COUNT(*) INTO total_assessments FROM enhanced_assessments;
  SELECT COUNT(*) INTO total_gateways FROM assessment_gateway_assignments;
  
  RAISE NOTICE 'Assessment Level Distribution:';
  RAISE NOTICE 'Level 1 (Foundation): % assessments', level1_count;
  RAISE NOTICE 'Level 2 (Integration): % assessments', level2_count;
  RAISE NOTICE 'Level 3 (Mastery): % assessments', level3_count;
  RAISE NOTICE 'Total Assessments: %', total_assessments;
  RAISE NOTICE 'Total Gateway Assignments: %', total_gateways;
END $$;

-- Create some sample custom gateway templates for specific use cases
INSERT INTO assessment_gateway_templates (name, description, gateway_type, is_general, level_restriction, configuration, verification_prompt, success_criteria) VALUES
(
  'Relationship Experience Verification',
  'Ensures user has sufficient relationship experience for advanced relationship assessments',
  'ai_verification',
  false,
  2,
  '{"minimum_relationships": 2, "relationship_duration_months": 6}',
  'Assess if the user has sufficient relationship experience to benefit from advanced relationship concepts. Look for evidence of meaningful relationships, learning from relationship challenges, and emotional growth through relationships.',
  '{"relationship_experience": true, "emotional_learning": true, "relationship_reflection": true}'
),
(
  'Polyamory Readiness Assessment',
  'Comprehensive readiness check for polyamory and non-monogamy concepts',
  'ai_verification',
  false,
  3,
  '{"jealousy_management": true, "communication_skills": true, "emotional_regulation": true}',
  'Evaluate if the user demonstrates the emotional maturity and skills necessary for ethical non-monogamy. Look for evidence of jealousy management, excellent communication skills, emotional regulation under stress, and understanding of consent and boundaries.',
  '{"jealousy_management": true, "communication_excellence": true, "stress_regulation": true, "boundary_understanding": true}'
),
(
  'Patriarchy Deconstruction Readiness',
  'Ensures emotional and intellectual readiness for challenging patriarchal concepts',
  'ai_verification',
  false,
  3,
  '{"gender_awareness": true, "privilege_recognition": true, "emotional_stability": true}',
  'Assess if the user has the emotional stability and intellectual framework to engage with challenging concepts about patriarchy and gender dynamics. Look for evidence of self-awareness about privilege, emotional regulation when discussing difficult topics, and openness to examining deeply held beliefs.',
  '{"privilege_awareness": true, "emotional_stability": true, "intellectual_openness": true, "belief_examination": true}'
);

-- Assign these custom gateways to appropriate assessments
-- This would be done manually in the admin panel, but we can set up some examples

-- Example: Assign polyamory readiness to any assessment with "polyamory" in the name
INSERT INTO assessment_gateway_assignments (assessment_id, gateway_template_id, order_index, is_enabled)
SELECT 
  ea.id,
  gt.id,
  10 -- Higher order index so it comes after general gateways
FROM enhanced_assessments ea
CROSS JOIN assessment_gateway_templates gt
WHERE LOWER(ea.name) LIKE '%polyamory%'
  AND gt.name = 'Polyamory Readiness Assessment'
  AND ea.assessment_level = 3
ON CONFLICT (assessment_id, gateway_template_id) DO NOTHING;

-- Example: Assign patriarchy readiness to assessments about patriarchy
INSERT INTO assessment_gateway_assignments (assessment_id, gateway_template_id, order_index, is_enabled)
SELECT 
  ea.id,
  gt.id,
  10
FROM enhanced_assessments ea
CROSS JOIN assessment_gateway_templates gt
WHERE LOWER(ea.name) LIKE '%patriarchy%'
  AND gt.name = 'Patriarchy Deconstruction Readiness'
  AND ea.assessment_level = 3
ON CONFLICT (assessment_id, gateway_template_id) DO NOTHING;
