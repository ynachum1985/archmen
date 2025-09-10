-- Assessment Logic Enhancement Database Setup
-- Run this in your Supabase SQL editor to enhance assessment functionality

-- Create assessment_themes table for storing assessment themes
CREATE TABLE IF NOT EXISTS assessment_themes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  focus_areas TEXT[] DEFAULT '{}',
  initial_prompt TEXT NOT NULL,
  archetype_mapping JSONB DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Insert default assessment themes
INSERT INTO assessment_themes (id, name, description, focus_areas, initial_prompt, archetype_mapping) VALUES
(
  'relationships',
  'Relationship Patterns',
  'Explore your archetypal patterns in romantic relationships',
  ARRAY['attachment', 'communication', 'conflict', 'intimacy', 'boundaries'],
  'I''d love to understand how you show up in relationships. Tell me about a recent relationship experience that felt significant to you - it could be a moment of connection, conflict, or anything that stood out.',
  '{
    "The Lover": ["passion", "intimacy", "connection", "romance", "emotional depth"],
    "The King": ["leadership", "protection", "responsibility", "decision-making", "authority"],
    "The Warrior": ["boundaries", "fighting for", "defending", "challenges", "strength"],
    "The Magician": ["transformation", "understanding", "insight", "healing", "wisdom"],
    "The Innocent": ["trust", "optimism", "simplicity", "faith", "purity"],
    "The Hero": ["rescue", "achievement", "overcoming", "proving", "courage"],
    "The Caregiver": ["nurturing", "supporting", "helping", "caring", "sacrifice"],
    "The Explorer": ["freedom", "adventure", "independence", "discovery", "autonomy"]
  }'::jsonb
),
(
  'career',
  'Professional Identity',
  'Discover your archetypal patterns in work and career',
  ARRAY['leadership', 'collaboration', 'ambition', 'creativity', 'purpose'],
  'Let''s explore how you show up professionally. Describe a work situation where you felt most like yourself - whether it was leading a project, solving a problem, or working with others.',
  '{
    "The King": ["leadership", "vision", "authority", "responsibility", "empire-building"],
    "The Magician": ["innovation", "transformation", "strategy", "problem-solving", "expertise"],
    "The Warrior": ["competition", "goals", "discipline", "achievement", "fighting"],
    "The Hero": ["challenges", "proving", "overcoming", "recognition", "success"],
    "The Sage": ["knowledge", "teaching", "wisdom", "analysis", "understanding"],
    "The Creator": ["innovation", "building", "imagination", "artistic", "vision"],
    "The Caregiver": ["service", "helping", "mentoring", "supporting", "nurturing"],
    "The Explorer": ["freedom", "variety", "adventure", "independence", "discovery"]
  }'::jsonb
)
ON CONFLICT (id) DO NOTHING;

-- Create assessment_results table for storing final assessment results
CREATE TABLE IF NOT EXISTS assessment_results (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES assessment_sessions(id) ON DELETE CASCADE,
  theme_id TEXT NOT NULL,
  archetype_scores JSONB NOT NULL DEFAULT '{}',
  final_report TEXT,
  linguistic_patterns JSONB DEFAULT '{}',
  conversation_summary JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_assessment_results_user_id ON assessment_results(user_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_session_id ON assessment_results(session_id);
CREATE INDEX IF NOT EXISTS idx_assessment_results_theme_id ON assessment_results(theme_id);
CREATE INDEX IF NOT EXISTS idx_assessment_sessions_user_status ON assessment_sessions(user_id, status);
CREATE INDEX IF NOT EXISTS idx_assessment_responses_session_id ON assessment_responses(session_id);

-- Enable RLS on new tables
ALTER TABLE assessment_themes ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessment_results ENABLE ROW LEVEL SECURITY;

-- RLS Policies for assessment_themes
CREATE POLICY "Anyone can view active themes" ON assessment_themes
  FOR SELECT USING (is_active = true);

CREATE POLICY "Authenticated users can manage themes" ON assessment_themes
  FOR ALL USING (auth.role() = 'authenticated');

-- RLS Policies for assessment_results
CREATE POLICY "Users can view their own results" ON assessment_results
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own results" ON assessment_results
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own results" ON assessment_results
  FOR UPDATE USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = TIMEZONE('utc', NOW());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Add triggers for updated_at
CREATE TRIGGER update_assessment_themes_updated_at BEFORE UPDATE ON assessment_themes
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_assessment_results_updated_at BEFORE UPDATE ON assessment_results
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add some sample archetype data if enhanced_archetypes table is empty
INSERT INTO enhanced_archetypes (name, category, description, impact_score, traits, psychology_profile) VALUES
('The Lover', 'Relationship', 'Driven by passion, connection, and emotional intimacy', 85, 
 '["passionate", "romantic", "emotionally expressive", "seeks connection", "values intimacy"]'::jsonb,
 '{"core_motivation": "To find and give love", "core_fear": "Being alone or unloved", "shadow": "Jealousy, possessiveness, emotional manipulation"}'::jsonb),
('The King', 'Leadership', 'Natural leader who takes responsibility and creates order', 90,
 '["authoritative", "responsible", "protective", "decisive", "creates structure"]'::jsonb,
 '{"core_motivation": "To create order and prosperity", "core_fear": "Chaos and powerlessness", "shadow": "Tyranny, abuse of power, controlling behavior"}'::jsonb),
('The Warrior', 'Action', 'Disciplined fighter who overcomes challenges through strength', 80,
 '["disciplined", "courageous", "goal-oriented", "competitive", "protective"]'::jsonb,
 '{"core_motivation": "To prove worth through courageous action", "core_fear": "Weakness and cowardice", "shadow": "Ruthlessness, unnecessary aggression, inability to surrender"}'::jsonb),
('The Magician', 'Transformation', 'Visionary who transforms reality through knowledge and power', 88,
 '["visionary", "knowledgeable", "transformative", "intuitive", "powerful"]'::jsonb,
 '{"core_motivation": "To understand the laws of the universe", "core_fear": "Unintended negative consequences", "shadow": "Manipulation, evil sorcery, detachment from humanity"}'::jsonb)
ON CONFLICT (name) DO NOTHING;
