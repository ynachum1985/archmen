-- Homework Calendar System Database Setup
-- Run this in your Supabase SQL editor to add homework and calendar functionality

-- User Homework Tasks Table
CREATE TABLE IF NOT EXISTS user_homework_tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  assessment_id UUID REFERENCES enhanced_assessments(id) ON DELETE SET NULL,
  archetype_id UUID REFERENCES enhanced_archetypes(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  task_type TEXT NOT NULL CHECK (task_type IN ('affirmation', 'meditation', 'journaling', 'integration_practice', 'shadow_work', 'reflection', 'behavioral_change', 'custom')),
  frequency TEXT NOT NULL CHECK (frequency IN ('daily', 'weekly', 'bi_weekly', 'monthly', 'one_time')),
  frequency_count INTEGER DEFAULT 1, -- How many times per frequency period
  difficulty_level TEXT DEFAULT 'beginner' CHECK (difficulty_level IN ('beginner', 'intermediate', 'advanced')),
  estimated_duration_minutes INTEGER DEFAULT 15,
  instructions JSONB DEFAULT '{}', -- Detailed instructions, prompts, etc.
  assigned_by TEXT DEFAULT 'ai' CHECK (assigned_by IN ('ai', 'user', 'system')),
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  completion_notes TEXT,
  is_active BOOLEAN DEFAULT true,
  priority INTEGER DEFAULT 3 CHECK (priority BETWEEN 1 AND 5), -- 1 = highest, 5 = lowest
  tags TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User Calendar Events Table
CREATE TABLE IF NOT EXISTS user_calendar_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  homework_task_id UUID REFERENCES user_homework_tasks(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  start_time TIMESTAMP WITH TIME ZONE NOT NULL,
  end_time TIMESTAMP WITH TIME ZONE NOT NULL,
  is_all_day BOOLEAN DEFAULT false,
  event_type TEXT DEFAULT 'homework' CHECK (event_type IN ('homework', 'reminder', 'milestone', 'custom')),
  status TEXT DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'missed', 'rescheduled', 'cancelled')),
  reminder_minutes INTEGER[] DEFAULT '{15, 60}', -- Minutes before event to send reminders
  location TEXT,
  notes TEXT,
  recurrence_rule TEXT, -- RRULE format for recurring events
  external_calendar_id TEXT, -- For future integration with Google Calendar, etc.
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- User Notification Preferences Table
CREATE TABLE IF NOT EXISTS user_notification_preferences (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  sms_notifications BOOLEAN DEFAULT false,
  daily_reminder_time TIME DEFAULT '09:00:00', -- Time of day for daily reminders
  weekly_summary_day INTEGER DEFAULT 1 CHECK (weekly_summary_day BETWEEN 0 AND 6), -- 0 = Sunday, 6 = Saturday
  reminder_frequency TEXT DEFAULT 'normal' CHECK (reminder_frequency IN ('minimal', 'normal', 'frequent')),
  notification_types JSONB DEFAULT '{"homework_due": true, "homework_overdue": true, "weekly_summary": true, "encouragement": true, "milestone": true}',
  quiet_hours_start TIME DEFAULT '22:00:00',
  quiet_hours_end TIME DEFAULT '08:00:00',
  timezone TEXT DEFAULT 'UTC',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  UNIQUE(user_id)
);

-- Homework Task Completions Table (for tracking completion history)
CREATE TABLE IF NOT EXISTS homework_task_completions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  homework_task_id UUID NOT NULL REFERENCES user_homework_tasks(id) ON DELETE CASCADE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  completion_rating INTEGER CHECK (completion_rating BETWEEN 1 AND 5), -- How well did they feel they completed it
  completion_notes TEXT,
  time_spent_minutes INTEGER,
  mood_before TEXT CHECK (mood_before IN ('very_negative', 'negative', 'neutral', 'positive', 'very_positive')),
  mood_after TEXT CHECK (mood_after IN ('very_negative', 'negative', 'neutral', 'positive', 'very_positive')),
  insights TEXT,
  challenges TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- AI Homework Suggestions Table (for storing AI-generated homework ideas)
CREATE TABLE IF NOT EXISTS ai_homework_suggestions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  archetype_id UUID REFERENCES enhanced_archetypes(id) ON DELETE CASCADE,
  task_type TEXT NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  instructions JSONB DEFAULT '{}',
  difficulty_level TEXT DEFAULT 'beginner',
  estimated_duration_minutes INTEGER DEFAULT 15,
  frequency_suggestions TEXT[] DEFAULT '{}',
  tags TEXT[] DEFAULT '{}',
  is_active BOOLEAN DEFAULT true,
  usage_count INTEGER DEFAULT 0,
  effectiveness_rating DECIMAL(3,2) DEFAULT 0.0, -- Average rating from users
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW())
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_user_homework_tasks_user_id ON user_homework_tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_user_homework_tasks_assessment_id ON user_homework_tasks(assessment_id);
CREATE INDEX IF NOT EXISTS idx_user_homework_tasks_archetype_id ON user_homework_tasks(archetype_id);
CREATE INDEX IF NOT EXISTS idx_user_homework_tasks_due_date ON user_homework_tasks(due_date);
CREATE INDEX IF NOT EXISTS idx_user_homework_tasks_active ON user_homework_tasks(is_active);

CREATE INDEX IF NOT EXISTS idx_user_calendar_events_user_id ON user_calendar_events(user_id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_events_homework_task_id ON user_calendar_events(homework_task_id);
CREATE INDEX IF NOT EXISTS idx_user_calendar_events_start_time ON user_calendar_events(start_time);
CREATE INDEX IF NOT EXISTS idx_user_calendar_events_status ON user_calendar_events(status);

CREATE INDEX IF NOT EXISTS idx_homework_task_completions_user_id ON homework_task_completions(user_id);
CREATE INDEX IF NOT EXISTS idx_homework_task_completions_task_id ON homework_task_completions(homework_task_id);
CREATE INDEX IF NOT EXISTS idx_homework_task_completions_completed_at ON homework_task_completions(completed_at);

CREATE INDEX IF NOT EXISTS idx_ai_homework_suggestions_archetype_id ON ai_homework_suggestions(archetype_id);
CREATE INDEX IF NOT EXISTS idx_ai_homework_suggestions_task_type ON ai_homework_suggestions(task_type);
CREATE INDEX IF NOT EXISTS idx_ai_homework_suggestions_active ON ai_homework_suggestions(is_active);

-- Enable RLS on all tables
ALTER TABLE user_homework_tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_notification_preferences ENABLE ROW LEVEL SECURITY;
ALTER TABLE homework_task_completions ENABLE ROW LEVEL SECURITY;
ALTER TABLE ai_homework_suggestions ENABLE ROW LEVEL SECURITY;

-- RLS Policies for user_homework_tasks
CREATE POLICY "Users can view own homework tasks" ON user_homework_tasks
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own homework tasks" ON user_homework_tasks
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own homework tasks" ON user_homework_tasks
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own homework tasks" ON user_homework_tasks
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_calendar_events
CREATE POLICY "Users can view own calendar events" ON user_calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own calendar events" ON user_calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calendar events" ON user_calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own calendar events" ON user_calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for user_notification_preferences
CREATE POLICY "Users can view own notification preferences" ON user_notification_preferences
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own notification preferences" ON user_notification_preferences
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own notification preferences" ON user_notification_preferences
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for homework_task_completions
CREATE POLICY "Users can view own task completions" ON homework_task_completions
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create own task completions" ON homework_task_completions
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own task completions" ON homework_task_completions
  FOR UPDATE USING (auth.uid() = user_id);

-- RLS Policies for ai_homework_suggestions (read-only for users, full access for authenticated)
CREATE POLICY "Users can view AI homework suggestions" ON ai_homework_suggestions
  FOR SELECT USING (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can manage AI homework suggestions" ON ai_homework_suggestions
  FOR ALL USING (auth.role() = 'authenticated');

-- Insert some default AI homework suggestions
INSERT INTO ai_homework_suggestions (archetype_id, task_type, title, description, instructions, difficulty_level, estimated_duration_minutes, frequency_suggestions, tags) VALUES
-- Generic suggestions that work for any archetype
(NULL, 'affirmation', 'Daily Archetype Affirmation', 'Speak positive affirmations aligned with your primary archetype', '{"prompts": ["I embody the strength of my archetype", "I am aligned with my authentic self", "I embrace both my light and shadow aspects"], "instructions": "Choose one affirmation that resonates with you today and repeat it 5-10 times while looking in the mirror."}', 'beginner', 5, '{"daily"}', '{"affirmation", "self-talk", "confidence"}'),
(NULL, 'meditation', 'Archetype Awareness Meditation', 'A guided meditation to connect with your archetypal energy', '{"instructions": "Sit comfortably and breathe deeply. Visualize your primary archetype as a wise guide. Ask them what message they have for you today.", "guided_steps": ["Find a quiet space", "Close your eyes and breathe deeply", "Visualize your archetype", "Listen for their guidance", "Thank them and slowly open your eyes"]}', 'beginner', 15, '{"daily", "weekly"}', '{"meditation", "visualization", "inner_wisdom"}'),
(NULL, 'journaling', 'Archetype Integration Journal', 'Reflect on how your archetype shows up in daily life', '{"prompts": ["How did my primary archetype influence my decisions today?", "What would my archetype say about the challenges I faced?", "How can I better embody my archetypal strengths tomorrow?"], "format": "Free writing for 10-15 minutes"}', 'beginner', 15, '{"daily", "weekly"}', '{"journaling", "reflection", "self_awareness"}'),
(NULL, 'integration_practice', 'Archetype Embodiment Exercise', 'Practice embodying your archetypal qualities in real situations', '{"instructions": "Choose one situation today where you will consciously embody your primary archetype. Notice how it feels and what changes.", "examples": ["Speak with the confidence of your archetype in a meeting", "Approach a challenge with your archetypal wisdom", "Express your archetypal gifts in relationships"]}', 'intermediate', 30, '{"daily", "weekly"}', '{"embodiment", "practice", "real_world"}'),
(NULL, 'shadow_work', 'Shadow Aspect Acknowledgment', 'Gently explore the shadow side of your archetype', '{"instructions": "Reflect on how the shadow of your archetype might be showing up. Approach with curiosity, not judgment.", "safety_note": "If this feels overwhelming, please reach out for support.", "prompts": ["When does my archetype become unbalanced?", "What am I avoiding or suppressing?", "How can I integrate this shadow aspect healthily?"]}', 'advanced', 20, '{"weekly", "bi_weekly"}', '{"shadow_work", "integration", "balance"});

-- Create a function to automatically create default notification preferences for new users
CREATE OR REPLACE FUNCTION create_default_notification_preferences()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO user_notification_preferences (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger to automatically create notification preferences for new users
CREATE TRIGGER create_user_notification_preferences
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION create_default_notification_preferences();
