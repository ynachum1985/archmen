-- Create moderation incidents table for tracking flagged content
CREATE TABLE IF NOT EXISTS moderation_incidents (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content_hash TEXT NOT NULL, -- SHA-256 hash of content for privacy
  flagged_categories TEXT[] NOT NULL, -- Array of flagged categories
  confidence DECIMAL(3,2) NOT NULL, -- Confidence score 0.00-1.00
  action_taken TEXT NOT NULL CHECK (action_taken IN ('allow', 'flag', 'block', 'human_review')),
  reasoning TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  assessment_id UUID REFERENCES enhanced_assessments(id) ON DELETE SET NULL,
  conversation_type TEXT CHECK (conversation_type IN ('assessment', 'chat', 'feedback')),
  reviewed_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  reviewed_at TIMESTAMP WITH TIME ZONE,
  review_decision TEXT CHECK (review_decision IN ('approved', 'rejected', 'escalated')),
  review_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create moderation settings table for configurable thresholds
CREATE TABLE IF NOT EXISTS moderation_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  setting_name TEXT UNIQUE NOT NULL,
  setting_value JSONB NOT NULL,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create moderation patterns table for custom pattern management
CREATE TABLE IF NOT EXISTS moderation_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name TEXT NOT NULL,
  pattern_regex TEXT NOT NULL,
  category TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
  is_active BOOLEAN DEFAULT true,
  description TEXT,
  created_by UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_moderation_incidents_user_id ON moderation_incidents(user_id);
CREATE INDEX IF NOT EXISTS idx_moderation_incidents_assessment_id ON moderation_incidents(assessment_id);
CREATE INDEX IF NOT EXISTS idx_moderation_incidents_action_taken ON moderation_incidents(action_taken);
CREATE INDEX IF NOT EXISTS idx_moderation_incidents_created_at ON moderation_incidents(created_at);
CREATE INDEX IF NOT EXISTS idx_moderation_incidents_flagged_categories ON moderation_incidents USING GIN(flagged_categories);

-- Create RLS policies
ALTER TABLE moderation_incidents ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE moderation_patterns ENABLE ROW LEVEL SECURITY;

-- Admin users can see all moderation data
CREATE POLICY "Admin can view all moderation incidents" ON moderation_incidents
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage moderation incidents" ON moderation_incidents
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Users can only see their own incidents
CREATE POLICY "Users can view own moderation incidents" ON moderation_incidents
  FOR SELECT USING (user_id = auth.uid());

-- Admin policies for settings and patterns
CREATE POLICY "Admin can manage moderation settings" ON moderation_settings
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

CREATE POLICY "Admin can manage moderation patterns" ON moderation_patterns
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM user_profiles 
      WHERE user_profiles.user_id = auth.uid() 
      AND user_profiles.role = 'admin'
    )
  );

-- Insert default moderation settings
INSERT INTO moderation_settings (setting_name, setting_value, description) VALUES
  ('openai_thresholds', '{"block": 0.8, "flag": 0.5, "allow": 0.3}', 'OpenAI moderation API thresholds'),
  ('perspective_thresholds', '{"toxicity": 0.7, "severe_toxicity": 0.5, "identity_attack": 0.6, "insult": 0.6, "profanity": 0.8, "threat": 0.4}', 'Google Perspective API thresholds'),
  ('auto_block_categories', '["relationship_abuse", "manipulation", "harassment_threatening", "violence", "self_harm_intent"]', 'Categories that trigger automatic blocking'),
  ('human_review_categories', '["misogyny", "toxic_masculinity", "harassment"]', 'Categories that require human review'),
  ('notification_settings', '{"admin_email": true, "slack_webhook": false, "dashboard_alerts": true}', 'Notification preferences for moderation incidents')
ON CONFLICT (setting_name) DO NOTHING;

-- Insert default moderation patterns for relationship coaching context
INSERT INTO moderation_patterns (pattern_name, pattern_regex, category, severity, description) VALUES
  ('Misogynistic generalizations', '\\b(women are|females are|girls are).*(inferior|stupid|emotional|irrational|crazy)\\b', 'misogyny', 'high', 'Generalizations that demean women'),
  ('Manipulation tactics', '\\b(gaslight|manipulate|control).*(her|women|girlfriend|wife)\\b', 'manipulation', 'critical', 'Advice promoting manipulation in relationships'),
  ('Toxic masculinity', '\\b(real men|true men).*(don''t|never).*(cry|show emotion|express feelings)\\b', 'toxic_masculinity', 'medium', 'Harmful masculine stereotypes'),
  ('Relationship abuse', '\\b(force|make).*(her|women).*(have sex|be intimate)\\b', 'relationship_abuse', 'critical', 'Content promoting sexual coercion'),
  ('Alpha male toxicity', '\\b(alpha|beta|sigma).*(male|men).*(deserve|own|control).*(women|females)\\b', 'toxic_masculinity', 'high', 'Toxic alpha male ideology'),
  ('Emotional abuse tactics', '\\bmake her (think|believe|feel).*(she''s crazy|she''s wrong)\\b', 'manipulation', 'critical', 'Gaslighting and emotional abuse tactics')
ON CONFLICT DO NOTHING;

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_moderation_incidents_updated_at BEFORE UPDATE ON moderation_incidents FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_moderation_settings_updated_at BEFORE UPDATE ON moderation_settings FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_moderation_patterns_updated_at BEFORE UPDATE ON moderation_patterns FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
