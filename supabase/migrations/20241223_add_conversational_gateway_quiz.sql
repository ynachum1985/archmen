-- Add conversational gateway quiz fields to enhanced_assessments table
-- This enables AI-driven readiness quizzes in the chat interface

-- Add quiz prompt fields to enhanced_assessments
ALTER TABLE enhanced_assessments 
ADD COLUMN IF NOT EXISTS quiz_set_questions_prompt TEXT,
ADD COLUMN IF NOT EXISTS quiz_experience_analysis_prompt TEXT,
ADD COLUMN IF NOT EXISTS quiz_enabled BOOLEAN DEFAULT true,
ADD COLUMN IF NOT EXISTS quiz_passing_score INTEGER DEFAULT 70 CHECK (quiz_passing_score BETWEEN 0 AND 100),
ADD COLUMN IF NOT EXISTS quiz_max_attempts INTEGER DEFAULT 3 CHECK (quiz_max_attempts > 0);

-- Create table to track user quiz attempts and results
CREATE TABLE IF NOT EXISTS assessment_quiz_attempts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID NOT NULL REFERENCES enhanced_assessments(id) ON DELETE CASCADE,
  attempt_number INTEGER NOT NULL DEFAULT 1,
  quiz_type TEXT NOT NULL CHECK (quiz_type IN ('set_questions', 'experience_analysis', 'combined')),
  
  -- Quiz session data
  questions_asked JSONB DEFAULT '[]', -- Array of questions asked
  user_responses JSONB DEFAULT '[]', -- Array of user responses
  ai_analysis JSONB DEFAULT '{}', -- AI's analysis of responses
  
  -- Scoring and results
  readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100),
  emotional_maturity_score INTEGER CHECK (emotional_maturity_score BETWEEN 1 AND 10),
  specific_feedback TEXT,
  areas_of_concern JSONB DEFAULT '[]',
  strengths_identified JSONB DEFAULT '[]',
  
  -- Quiz outcome
  quiz_passed BOOLEAN DEFAULT false,
  access_granted BOOLEAN DEFAULT false,
  retry_allowed BOOLEAN DEFAULT true,
  next_attempt_allowed_at TIMESTAMP WITH TIME ZONE,
  
  -- Conversation tracking
  conversation_id UUID, -- Link to the conversation where quiz was taken
  quiz_duration_minutes INTEGER,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(user_id, assessment_id, attempt_number)
);

-- Create table to track quiz questions and responses in detail
CREATE TABLE IF NOT EXISTS quiz_question_responses (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  quiz_attempt_id UUID NOT NULL REFERENCES assessment_quiz_attempts(id) ON DELETE CASCADE,
  question_number INTEGER NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('set_question', 'experience_based', 'follow_up', 'clarifying')),
  
  -- Question data
  question_text TEXT NOT NULL,
  question_context JSONB DEFAULT '{}', -- Additional context for the question
  
  -- Response data
  user_response TEXT,
  response_analysis JSONB DEFAULT '{}', -- AI analysis of this specific response
  response_score INTEGER CHECK (response_score BETWEEN 0 AND 100),
  
  -- Flags
  requires_follow_up BOOLEAN DEFAULT false,
  follow_up_question TEXT,
  is_concerning BOOLEAN DEFAULT false,
  concern_reason TEXT,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(quiz_attempt_id, question_number)
);

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_id ON assessment_quiz_attempts(user_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_assessment_id ON assessment_quiz_attempts(assessment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_user_assessment ON assessment_quiz_attempts(user_id, assessment_id);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_passed ON assessment_quiz_attempts(quiz_passed);
CREATE INDEX IF NOT EXISTS idx_quiz_attempts_access_granted ON assessment_quiz_attempts(access_granted);
CREATE INDEX IF NOT EXISTS idx_quiz_question_responses_attempt ON quiz_question_responses(quiz_attempt_id);
CREATE INDEX IF NOT EXISTS idx_quiz_question_responses_type ON quiz_question_responses(question_type);

-- Enable RLS
ALTER TABLE assessment_quiz_attempts ENABLE ROW LEVEL SECURITY;
ALTER TABLE quiz_question_responses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view own quiz attempts" ON assessment_quiz_attempts
  FOR SELECT TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own quiz attempts" ON assessment_quiz_attempts
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own quiz attempts" ON assessment_quiz_attempts
  FOR UPDATE TO authenticated USING (auth.uid() = user_id);

CREATE POLICY "System can manage quiz attempts" ON assessment_quiz_attempts
  FOR ALL TO authenticated USING (true); -- For admin and system operations

CREATE POLICY "Users can view own quiz responses" ON quiz_question_responses
  FOR SELECT TO authenticated USING (
    quiz_attempt_id IN (
      SELECT id FROM assessment_quiz_attempts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can insert own quiz responses" ON quiz_question_responses
  FOR INSERT TO authenticated WITH CHECK (
    quiz_attempt_id IN (
      SELECT id FROM assessment_quiz_attempts WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "System can manage quiz responses" ON quiz_question_responses
  FOR ALL TO authenticated USING (true); -- For admin and system operations

-- Function to check if user can access assessment based on quiz results
CREATE OR REPLACE FUNCTION check_assessment_quiz_access(
  p_user_id UUID,
  p_assessment_id UUID
) RETURNS JSONB AS $$
DECLARE
  assessment_record enhanced_assessments%ROWTYPE;
  latest_attempt assessment_quiz_attempts%ROWTYPE;
  total_attempts INTEGER;
  result JSONB;
BEGIN
  -- Get assessment info
  SELECT * INTO assessment_record FROM enhanced_assessments WHERE id = p_assessment_id;
  
  -- Check if quiz is enabled for this assessment
  IF NOT assessment_record.quiz_enabled THEN
    RETURN jsonb_build_object(
      'access_granted', true,
      'reason', 'quiz_disabled',
      'message', 'Quiz is disabled for this assessment'
    );
  END IF;
  
  -- Get latest quiz attempt
  SELECT * INTO latest_attempt 
  FROM assessment_quiz_attempts 
  WHERE user_id = p_user_id 
    AND assessment_id = p_assessment_id 
  ORDER BY attempt_number DESC 
  LIMIT 1;
  
  -- If no attempts, quiz is required
  IF latest_attempt IS NULL THEN
    RETURN jsonb_build_object(
      'access_granted', false,
      'reason', 'quiz_required',
      'message', 'Complete the readiness quiz to access this assessment',
      'quiz_required', true
    );
  END IF;
  
  -- If latest attempt passed, grant access
  IF latest_attempt.quiz_passed AND latest_attempt.access_granted THEN
    RETURN jsonb_build_object(
      'access_granted', true,
      'reason', 'quiz_passed',
      'message', 'Quiz completed successfully',
      'quiz_score', latest_attempt.readiness_score,
      'attempt_number', latest_attempt.attempt_number
    );
  END IF;
  
  -- Check if more attempts are allowed
  SELECT COUNT(*) INTO total_attempts 
  FROM assessment_quiz_attempts 
  WHERE user_id = p_user_id AND assessment_id = p_assessment_id;
  
  IF total_attempts >= assessment_record.quiz_max_attempts THEN
    RETURN jsonb_build_object(
      'access_granted', false,
      'reason', 'max_attempts_reached',
      'message', 'Maximum quiz attempts reached. Contact support for assistance.',
      'max_attempts', assessment_record.quiz_max_attempts,
      'attempts_used', total_attempts
    );
  END IF;
  
  -- Check if retry is allowed (time-based cooldown)
  IF latest_attempt.next_attempt_allowed_at IS NOT NULL 
     AND latest_attempt.next_attempt_allowed_at > NOW() THEN
    RETURN jsonb_build_object(
      'access_granted', false,
      'reason', 'cooldown_period',
      'message', 'Please wait before attempting the quiz again',
      'next_attempt_at', latest_attempt.next_attempt_allowed_at,
      'quiz_required', true
    );
  END IF;
  
  -- Quiz retry is allowed
  RETURN jsonb_build_object(
    'access_granted', false,
    'reason', 'quiz_retry_required',
    'message', 'Previous quiz attempt did not meet requirements. Please try again.',
    'quiz_required', true,
    'previous_score', latest_attempt.readiness_score,
    'passing_score', assessment_record.quiz_passing_score,
    'attempt_number', total_attempts + 1,
    'max_attempts', assessment_record.quiz_max_attempts
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to start a new quiz attempt
CREATE OR REPLACE FUNCTION start_quiz_attempt(
  p_user_id UUID,
  p_assessment_id UUID,
  p_conversation_id UUID DEFAULT NULL
) RETURNS UUID AS $$
DECLARE
  attempt_count INTEGER;
  new_attempt_id UUID;
BEGIN
  -- Get current attempt count
  SELECT COUNT(*) INTO attempt_count 
  FROM assessment_quiz_attempts 
  WHERE user_id = p_user_id AND assessment_id = p_assessment_id;
  
  -- Create new attempt
  INSERT INTO assessment_quiz_attempts (
    user_id,
    assessment_id,
    attempt_number,
    conversation_id,
    quiz_type
  ) VALUES (
    p_user_id,
    p_assessment_id,
    attempt_count + 1,
    p_conversation_id,
    'combined'
  ) RETURNING id INTO new_attempt_id;
  
  RETURN new_attempt_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_quiz_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_quiz_attempts_updated_at
  BEFORE UPDATE ON assessment_quiz_attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_quiz_updated_at();

-- Update existing assessments with default quiz prompts based on their level
UPDATE enhanced_assessments 
SET 
  quiz_set_questions_prompt = CASE 
    WHEN assessment_level = 1 THEN 
      'You are conducting a readiness assessment for a Level 1 (Foundation) assessment. Ask 3-4 questions that test basic emotional awareness, relationship patterns, and readiness for archetypal discovery. Focus on: communication skills, self-reflection ability, openness to feedback, and basic emotional regulation.'
    WHEN assessment_level = 2 THEN
      'You are conducting a readiness assessment for a Level 2 (Integration) assessment. Ask 3-4 questions that test emotional maturity, shadow work readiness, and integration capabilities. Focus on: ability to face difficult truths, emotional regulation under stress, previous growth work, and readiness for deeper psychological exploration.'
    WHEN assessment_level = 3 THEN
      'You are conducting a readiness assessment for a Level 3 (Mastery) assessment. Ask 3-4 questions that test advanced emotional maturity and readiness for complex concepts. Focus on: handling of challenging relationship dynamics, emotional stability with controversial topics, integration of previous learning, and readiness for advanced psychological concepts.'
  END,
  quiz_experience_analysis_prompt = CASE
    WHEN assessment_level = 1 THEN
      'Analyze the user''s basic readiness for foundational archetypal work. Review any previous interactions and assess their openness to self-discovery, basic emotional awareness, and readiness to explore relationship patterns. Generate 1-2 personalized questions based on any gaps or areas needing verification.'
    WHEN assessment_level = 2 THEN
      'Analyze the user''s previous assessment history and growth patterns to determine readiness for shadow work and emotional integration. Look for evidence of emotional maturity development, integration of previous insights, and readiness for deeper psychological work. Generate 2-3 personalized questions based on their journey and any areas needing verification.'
    WHEN assessment_level = 3 THEN
      'Analyze the user''s complete assessment journey and emotional development to determine readiness for advanced psychological concepts. Review their shadow work integration, emotional maturity progression, and ability to handle complex relationship dynamics. Generate 2-3 personalized questions that test their readiness for advanced topics like polyamory, patriarchy deconstruction, or complex relationship dynamics.'
  END,
  quiz_enabled = true,
  quiz_passing_score = CASE 
    WHEN assessment_level = 1 THEN 60
    WHEN assessment_level = 2 THEN 70
    WHEN assessment_level = 3 THEN 80
  END
WHERE quiz_set_questions_prompt IS NULL;
