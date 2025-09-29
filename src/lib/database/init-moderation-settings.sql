-- Initialize default moderation settings if they don't exist
INSERT INTO moderation_settings (setting_name, setting_value, created_at, updated_at)
VALUES 
  (
    'openai_thresholds',
    '{
      "harassment": 0.7,
      "harassment_threatening": 0.7,
      "hate": 0.7,
      "hate_threatening": 0.7,
      "self_harm": 0.7,
      "self_harm_instructions": 0.7,
      "self_harm_intent": 0.7,
      "sexual": 0.7,
      "sexual_minors": 0.7,
      "violence": 0.7,
      "violence_graphic": 0.7
    }',
    NOW(),
    NOW()
  ),
  (
    'perspective_thresholds',
    '{
      "TOXICITY": 0.7,
      "SEVERE_TOXICITY": 0.7,
      "IDENTITY_ATTACK": 0.7,
      "INSULT": 0.7,
      "PROFANITY": 0.7,
      "THREAT": 0.7
    }',
    NOW(),
    NOW()
  ),
  (
    'auto_block_categories',
    '["harassment_threatening", "hate_threatening", "self_harm_instructions", "sexual_minors", "violence_graphic", "SEVERE_TOXICITY", "THREAT"]',
    NOW(),
    NOW()
  ),
  (
    'human_review_categories',
    '["harassment", "hate", "self_harm", "sexual", "violence", "TOXICITY", "IDENTITY_ATTACK", "INSULT", "PROFANITY"]',
    NOW(),
    NOW()
  ),
  (
    'notification_settings',
    '{
      "email_alerts": true,
      "slack_webhook": "",
      "alert_threshold": "high"
    }',
    NOW(),
    NOW()
  )
ON CONFLICT (setting_name) DO NOTHING;

-- Initialize default moderation patterns
INSERT INTO moderation_patterns (pattern_name, pattern_regex, category, severity, description, is_active, created_by, created_at, updated_at)
VALUES 
  (
    'Misogynistic Language',
    '\\b(women are|females are|girls are).*(inferior|stupid|emotional|irrational|weak)',
    'misogyny',
    'high',
    'Detects generalizations that demean women',
    true,
    'admin',
    NOW(),
    NOW()
  ),
  (
    'Toxic Masculinity',
    '\\b(real men|alpha male|beta male|simp|cuck)\\b',
    'toxic_masculinity',
    'medium',
    'Detects toxic masculinity terminology',
    true,
    'admin',
    NOW(),
    NOW()
  ),
  (
    'Manipulation Tactics',
    '\\b(gaslight|manipulate|control her|make her).*(jealous|dependent|insecure)',
    'manipulation',
    'high',
    'Detects relationship manipulation advice',
    true,
    'admin',
    NOW(),
    NOW()
  ),
  (
    'Relationship Abuse',
    '\\b(isolate her|cut off|prevent her from|stop her from).*(friends|family|work|activities)',
    'abuse',
    'critical',
    'Detects advice promoting isolation and control',
    true,
    'admin',
    NOW(),
    NOW()
  )
ON CONFLICT (pattern_name) DO NOTHING;
