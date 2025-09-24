-- Unified AI Personality Questions System
-- This migration consolidates open-ended, clarifying, and specific questions into a unified system

-- Add new unified questions field to ai_personalities table
ALTER TABLE ai_personalities 
ADD COLUMN IF NOT EXISTS unified_questions JSONB DEFAULT '[]';

-- Create a new table for question templates that can be reused across personalities
CREATE TABLE IF NOT EXISTS ai_question_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  question_text TEXT NOT NULL,
  question_type TEXT NOT NULL CHECK (question_type IN ('open_ended', 'clarifying', 'specific', 'follow_up')),
  category TEXT NOT NULL, -- e.g., 'relationships', 'career', 'values', 'fears', 'dreams'
  difficulty_level TEXT DEFAULT 'moderate' CHECK (difficulty_level IN ('easy', 'moderate', 'challenging', 'deep')),
  emotional_tone TEXT DEFAULT 'neutral' CHECK (emotional_tone IN ('neutral', 'warm', 'curious', 'challenging', 'supportive')),
  archetype_relevance TEXT[] DEFAULT '{}', -- Which archetypes this question is most relevant for
  tags TEXT[] DEFAULT '{}', -- Additional tags for filtering
  usage_count INTEGER DEFAULT 0,
  effectiveness_rating DECIMAL(3,2) DEFAULT 0.0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_ai_question_templates_type ON ai_question_templates(question_type);
CREATE INDEX IF NOT EXISTS idx_ai_question_templates_category ON ai_question_templates(category);
CREATE INDEX IF NOT EXISTS idx_ai_question_templates_difficulty ON ai_question_templates(difficulty_level);

-- Insert standard question templates
INSERT INTO ai_question_templates (question_text, question_type, category, difficulty_level, emotional_tone, tags) VALUES
-- Open-ended questions
('Tell me about a moment when you felt most authentic and true to yourself.', 'open_ended', 'identity', 'moderate', 'warm', '{"authenticity", "self-awareness"}'),
('Describe a relationship that has significantly shaped who you are today.', 'open_ended', 'relationships', 'moderate', 'curious', '{"relationships", "personal-growth"}'),
('What does feeling "at home" mean to you, and when do you experience that feeling?', 'open_ended', 'values', 'moderate', 'warm', '{"belonging", "comfort", "values"}'),
('Share a time when you had to make a difficult decision that went against what others expected of you.', 'open_ended', 'autonomy', 'challenging', 'supportive', '{"independence", "decision-making", "courage"}'),
('Describe a pattern in your life that you keep repeating, even when you don''t want to.', 'open_ended', 'patterns', 'challenging', 'curious', '{"self-awareness", "patterns", "habits"}'),

-- Clarifying questions
('When you say that, what feelings come up for you?', 'clarifying', 'emotions', 'easy', 'warm', '{"emotions", "clarification"}'),
('Can you help me understand what that experience was like for you?', 'clarifying', 'experience', 'easy', 'curious', '{"understanding", "empathy"}'),
('What made that moment particularly meaningful to you?', 'clarifying', 'meaning', 'moderate', 'curious', '{"significance", "values"}'),
('How did that situation change your perspective on things?', 'clarifying', 'growth', 'moderate', 'curious', '{"perspective", "learning"}'),
('What would you say was the most important lesson from that experience?', 'clarifying', 'learning', 'moderate', 'supportive', '{"wisdom", "growth"}'),

-- Specific questions for different personality types
('In your closest relationships, do you tend to be the one who initiates plans and takes charge, or do you prefer to follow someone else''s lead?', 'specific', 'relationships', 'moderate', 'neutral', '{"leadership", "relationships", "dynamics"}'),
('When facing a major life decision, do you rely more on logical analysis or gut feelings?', 'specific', 'decision-making', 'moderate', 'neutral', '{"thinking-style", "intuition", "logic"}'),
('In social situations, do you feel energized by being around many people, or do you prefer smaller, intimate gatherings?', 'specific', 'social', 'easy', 'neutral', '{"social-energy", "introversion", "extraversion"}'),
('When someone criticizes you, is your first instinct to defend yourself, reflect on their feedback, or withdraw?', 'specific', 'conflict', 'challenging', 'neutral', '{"conflict-style", "feedback", "defensiveness"}'),
('Do you find yourself more motivated by achieving personal goals or by helping others achieve theirs?', 'specific', 'motivation', 'moderate', 'neutral', '{"motivation", "service", "achievement"}'),

-- Follow-up questions
('Can you give me a specific example of when that happened?', 'follow_up', 'specificity', 'easy', 'curious', '{"examples", "details"}'),
('How did that make you feel in the moment?', 'follow_up', 'emotions', 'easy', 'warm', '{"emotions", "immediate-response"}'),
('What do you think that says about you as a person?', 'follow_up', 'self-reflection', 'challenging', 'curious', '{"self-awareness", "identity"}'),
('If you could go back, would you handle it differently? How?', 'follow_up', 'reflection', 'moderate', 'supportive', '{"learning", "growth", "hindsight"}'),
('What patterns do you notice in how you typically respond to situations like this?', 'follow_up', 'patterns', 'challenging', 'curious', '{"patterns", "self-awareness", "behavior"}}');

-- Update existing ai_personalities with unified question structure
-- Convert existing separate question arrays into unified format
UPDATE ai_personalities 
SET unified_questions = (
  SELECT jsonb_agg(
    jsonb_build_object(
      'id', gen_random_uuid()::text,
      'question_text', question_text,
      'question_type', question_type,
      'category', 'general',
      'difficulty_level', 'moderate',
      'emotional_tone', 'neutral',
      'is_active', true,
      'order_index', row_number() OVER ()
    )
  )
  FROM (
    SELECT unnest(open_ended_questions) as question_text, 'open_ended' as question_type
    FROM ai_personalities p1 WHERE p1.id = ai_personalities.id
    UNION ALL
    SELECT unnest(clarifying_questions) as question_text, 'clarifying' as question_type
    FROM ai_personalities p2 WHERE p2.id = ai_personalities.id
  ) combined_questions
)
WHERE unified_questions = '[]'::jsonb OR unified_questions IS NULL;

-- Create RLS policies for the new table
ALTER TABLE ai_question_templates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Question templates are viewable by authenticated users" ON ai_question_templates
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Question templates are manageable by admins" ON ai_question_templates
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM profiles 
      WHERE profiles.id = auth.uid() 
      AND profiles.email = 'yossinac@gmail.com'
    )
  );

-- Add trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_ai_question_templates_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_ai_question_templates_updated_at
  BEFORE UPDATE ON ai_question_templates
  FOR EACH ROW
  EXECUTE FUNCTION update_ai_question_templates_updated_at();

-- Add comment explaining the new structure
COMMENT ON COLUMN ai_personalities.unified_questions IS 'JSONB array containing unified question objects with structure: {id, question_text, question_type, category, difficulty_level, emotional_tone, is_active, order_index}';
COMMENT ON TABLE ai_question_templates IS 'Reusable question templates that can be assigned to AI personalities for consistent questioning across the platform';
