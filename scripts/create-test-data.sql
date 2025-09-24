-- Create Test Data for ArchMen User Analysis Dashboard
-- This script creates a complete test user with realistic assessment data

-- First, let's create a test user in auth.users (this would normally be done through Supabase Auth)
-- Note: In production, users are created through the auth system, not directly in the database

-- Create test assessments if they don't exist
INSERT INTO enhanced_assessments (
  id,
  name,
  description,
  assessment_level,
  category,
  quiz_set_questions_prompt,
  quiz_experience_analysis_prompt,
  quiz_passing_score,
  emotional_maturity_requirement
) VALUES 
(
  'test_assessment_1',
  'Relationship Foundations',
  'Foundational assessment exploring communication patterns and relationship dynamics',
  1,
  'relationships',
  'Welcome to your readiness assessment for Relationship Foundations. I''ll ask you a few questions to understand your current relationship patterns and readiness for deeper work.',
  'IMPORTANT: You will receive the user''s assessment history above (if any). Use this information to create appropriate questions.

Analyze the user''s basic readiness for foundational archetypal work in "Relationship Foundations".

Review their USER ASSESSMENT HISTORY section (if they have previous assessments) and assess:
- Openness to self-discovery and personal growth
- Basic emotional awareness and self-reflection
- Readiness to explore relationship patterns
- Willingness to receive feedback
- Any patterns from previous assessment attempts

Generate 1-2 personalized questions based on their history and any gaps or areas needing verification before they can access this foundational assessment. If this is their first assessment, focus on basic readiness indicators.',
  70,
  6
),
(
  'test_assessment_2',
  'Shadow Work Integration',
  'Intermediate assessment exploring shadow aspects and emotional integration',
  2,
  'shadow_work',
  'Welcome back! Let''s explore your readiness for shadow work and deeper emotional integration.',
  'IMPORTANT: You will receive the user''s complete assessment history above. Use this information to create personalized questions.

Analyze the user''s previous assessment history and growth patterns to determine readiness for "Shadow Work Integration" (Level 2).

Review their USER ASSESSMENT HISTORY section and look for evidence of:
- Emotional maturity development since Level 1
- Integration of previous insights and archetype discoveries
- Readiness for shadow work and deeper psychological exploration
- Ability to handle more challenging personal truths
- Specific patterns from their previous assessment feedback

Generate 2-3 personalized questions based on their actual journey, referencing specific insights from their previous assessments when relevant. If they have no previous assessments, focus on foundational readiness questions.',
  75,
  7
)
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  assessment_level = EXCLUDED.assessment_level,
  category = EXCLUDED.category,
  quiz_set_questions_prompt = EXCLUDED.quiz_set_questions_prompt,
  quiz_experience_analysis_prompt = EXCLUDED.quiz_experience_analysis_prompt,
  quiz_passing_score = EXCLUDED.quiz_passing_score,
  emotional_maturity_requirement = EXCLUDED.emotional_maturity_requirement;

-- Create test user assessment attempts
INSERT INTO assessment_quiz_attempts (
  id,
  user_id,
  assessment_id,
  started_at,
  completed_at,
  readiness_score,
  emotional_maturity_score,
  quiz_passed,
  specific_feedback
) VALUES 
(
  'test_attempt_1',
  'demo_user_001',
  'test_assessment_1',
  '2024-01-15 10:30:00+00',
  '2024-01-15 11:15:00+00',
  85,
  8,
  true,
  'Excellent self-awareness and communication skills. Shows strong foundation for deeper work. Areas for growth: boundary setting and conflict resolution. User demonstrates clear insight into relationship patterns and expresses genuine motivation for growth.'
),
(
  'test_attempt_2',
  'demo_user_001',
  'test_assessment_2',
  '2024-02-20 14:15:00+00',
  '2024-02-20 15:00:00+00',
  78,
  9,
  true,
  'Significant growth since Level 1. Shows integration of previous insights and readiness for shadow work. Demonstrates emotional regulation and deeper self-reflection. User has successfully applied boundary-setting skills and shows readiness for more challenging psychological exploration.'
)
ON CONFLICT (id) DO UPDATE SET
  user_id = EXCLUDED.user_id,
  assessment_id = EXCLUDED.assessment_id,
  started_at = EXCLUDED.started_at,
  completed_at = EXCLUDED.completed_at,
  readiness_score = EXCLUDED.readiness_score,
  emotional_maturity_score = EXCLUDED.emotional_maturity_score,
  quiz_passed = EXCLUDED.quiz_passed,
  specific_feedback = EXCLUDED.specific_feedback;

-- Create detailed conversation history for Level 1 Assessment
INSERT INTO quiz_question_responses (
  id,
  quiz_attempt_id,
  question_number,
  question_type,
  question_text,
  user_response,
  ai_reasoning,
  question_context,
  created_at
) VALUES 
(
  'test_response_1',
  'test_attempt_1',
  1,
  'set_question',
  'Welcome to your readiness assessment for Relationship Foundations. Let''s start by exploring your communication patterns. How do you typically express your needs in close relationships?',
  'I try to be direct but kind. Sometimes I struggle when the other person gets defensive, and I end up backing down to avoid conflict.',
  'User shows awareness of communication style and identifies specific challenge with defensive responses. This indicates good self-reflection but potential boundary issues. The pattern of backing down suggests conflict avoidance that may need addressing.',
  '{"assessment_level": 1, "quiz_phase": "introduction", "user_history": "first_assessment"}',
  '2024-01-15 10:32:00+00'
),
(
  'test_response_2',
  'test_attempt_1',
  2,
  'set_question',
  'That shows good self-awareness about your communication style. When you mention backing down to avoid conflict, can you tell me about a recent situation where this happened and how it felt for you?',
  'Last week with my partner about household responsibilities. They got upset when I brought it up, so I just said "never mind" and did the tasks myself. I felt frustrated and unheard, but also guilty for causing tension.',
  'Clear example of conflict avoidance and people-pleasing patterns. User experiences emotional consequences but prioritizes harmony over needs. This is a common Level 1 pattern. The guilt response indicates internalized responsibility for others'' emotions.',
  '{"previous_response": "backing down to avoid conflict", "quiz_phase": "set_questions", "pattern_identified": "conflict_avoidance"}',
  '2024-01-15 10:35:00+00'
),
(
  'test_response_3',
  'test_attempt_1',
  3,
  'experience_based',
  'I can hear the internal conflict between wanting to be heard and wanting to maintain harmony. This is actually very common and shows emotional intelligence. How do you think this pattern might be affecting your relationships over time?',
  'I think it builds resentment on my side, and my partner probably doesn''t even realize there are issues because I don''t follow through on conversations. It''s not sustainable, but I don''t know how to change it without causing more problems.',
  'Excellent insight into long-term consequences. User understands the systemic impact and expresses desire for change while acknowledging fear. This level of self-awareness and systems thinking indicates readiness for foundational work.',
  '{"quiz_phase": "experience_analysis", "insight_level": "high", "readiness_indicators": ["systems_thinking", "self_awareness", "change_motivation"]}',
  '2024-01-15 10:38:00+00'
),
(
  'test_response_4',
  'test_attempt_1',
  4,
  'conclusion',
  'ASSESSMENT: Based on our conversation, you demonstrate strong self-awareness, emotional intelligence, and insight into relationship patterns. Your ability to identify specific examples and understand long-term consequences shows readiness for foundational relationship work. Score: 85/100. You''re well-prepared to explore communication skills, boundary setting, and conflict resolution in the Relationship Foundations assessment.',
  '',
  'User meets all criteria for Level 1 readiness: self-awareness (high), specific examples (provided), emotional insight (demonstrated), growth motivation (expressed). Score reflects strong foundation with room for skill development in boundary setting and conflict resolution.',
  '{"final_assessment": true, "score_breakdown": {"self_awareness": 9, "emotional_intelligence": 8, "growth_motivation": 9, "specific_examples": 8}, "areas_for_growth": ["boundary_setting", "conflict_resolution"]}',
  '2024-01-15 10:42:00+00'
),

-- Create detailed conversation history for Level 2 Assessment
(
  'test_response_5',
  'test_attempt_2',
  1,
  'set_question',
  'Welcome back! I can see from your previous assessment that you scored 85/100 and showed excellent self-awareness around communication patterns. How have you been applying those insights since completing Relationship Foundations?',
  'I''ve been practicing speaking up more, even when it feels uncomfortable. I had that conversation with my partner about household tasks again, and this time I stayed present even when they got defensive. It was hard but we actually worked it out.',
  'Clear evidence of integration and application of previous insights. User demonstrates growth in conflict tolerance and boundary maintenance. This shows significant progress from the conflict avoidance pattern identified in Level 1 and indicates readiness for deeper work.',
  '{"assessment_level": 2, "previous_score": 85, "quiz_phase": "experience_analysis", "growth_evidence": "boundary_maintenance", "previous_pattern": "conflict_avoidance"}',
  '2024-02-20 14:17:00+00'
),
(
  'test_response_6',
  'test_attempt_2',
  2,
  'experience_based',
  'That''s remarkable progress! You''ve moved from avoiding conflict to staying present through difficulty. Shadow work involves exploring the parts of ourselves we typically avoid or judge. What aspects of yourself do you find most challenging to accept?',
  'I struggle with my anger. I was taught that anger is bad, so I suppress it, but then it comes out as passive-aggression or I turn it on myself. I''m starting to see that my anger might actually be telling me something important about my boundaries.',
  'Sophisticated understanding of shadow dynamics. User identifies suppressed emotion, recognizes unhealthy expressions, and shows insight into anger as boundary information. This level of emotional intelligence and shadow awareness indicates strong readiness for shadow integration work.',
  '{"quiz_phase": "shadow_exploration", "shadow_aspect": "anger", "awareness_level": "high", "integration_readiness": true}',
  '2024-02-20 14:22:00+00'
),
(
  'test_response_7',
  'test_attempt_2',
  3,
  'experience_based',
  'Your insight about anger as boundary information is profound. Many people struggle to see anger as anything other than "bad." Can you think of a recent time when your anger was trying to tell you something important about a boundary that needed attention?',
  'Yes, actually. Last month at work, I kept getting assigned extra projects without being asked. I felt angry but told myself I should be grateful for the opportunities. But the anger was telling me that my time and energy were being taken for granted. I finally spoke up and set some limits.',
  'Excellent practical application of shadow work principles. User demonstrates ability to reframe anger as information, take action based on that information, and set appropriate boundaries. This shows integration of both Level 1 insights and Level 2 shadow awareness.',
  '{"quiz_phase": "shadow_integration", "practical_application": true, "boundary_success": true, "emotional_reframing": "anger_as_information"}',
  '2024-02-20 14:28:00+00'
),
(
  'test_response_8',
  'test_attempt_2',
  4,
  'conclusion',
  'ASSESSMENT: Your growth since Level 1 is remarkable. You''ve successfully integrated communication insights, developed conflict tolerance, and show sophisticated understanding of shadow dynamics. Your ability to reframe anger as boundary information and take appropriate action demonstrates readiness for Level 2 work. Score: 78/100. You''re prepared for shadow work and deeper emotional integration.',
  '',
  'User demonstrates clear progression from Level 1: conflict avoidance → boundary maintenance, emotional suppression → shadow awareness, people-pleasing → appropriate limit-setting. Score reflects strong readiness for Level 2 with continued growth potential.',
  '{"final_assessment": true, "progression_evidence": ["boundary_maintenance", "shadow_awareness", "emotional_reframing"], "score_breakdown": {"integration": 8, "shadow_awareness": 8, "practical_application": 7, "emotional_maturity": 9}, "level_2_readiness": true}',
  '2024-02-20 14:32:00+00'
)
ON CONFLICT (id) DO UPDATE SET
  quiz_attempt_id = EXCLUDED.quiz_attempt_id,
  question_number = EXCLUDED.question_number,
  question_type = EXCLUDED.question_type,
  question_text = EXCLUDED.question_text,
  user_response = EXCLUDED.user_response,
  ai_reasoning = EXCLUDED.ai_reasoning,
  question_context = EXCLUDED.question_context,
  created_at = EXCLUDED.created_at;

-- Verify the data was inserted correctly
SELECT
  'Assessment Attempts' as table_name,
  COUNT(*) as record_count
FROM assessment_quiz_attempts
WHERE user_id = 'demo_user_001'

UNION ALL

SELECT
  'Question Responses' as table_name,
  COUNT(*) as record_count
FROM quiz_question_responses qr
JOIN assessment_quiz_attempts aqa ON qr.quiz_attempt_id = aqa.id
WHERE aqa.user_id = 'demo_user_001'

UNION ALL

SELECT
  'Enhanced Assessments' as table_name,
  COUNT(*) as record_count
FROM enhanced_assessments
WHERE id IN ('test_assessment_1', 'test_assessment_2');
