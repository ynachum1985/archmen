# Data Flow Architecture: How User Data is Stored

## 🗄️ Database Tables Overview

### **1. `profiles` Table** (User Profile - Basic Info)
```sql
CREATE TABLE profiles (
  id UUID PRIMARY KEY,              -- Links to auth.users
  email TEXT NOT NULL,
  full_name TEXT,
  avatar_url TEXT,
  subscription_status TEXT,         -- 'free', 'monthly', 'yearly', 'lifetime'
  subscription_end_date TIMESTAMP,
  stripe_customer_id TEXT,
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**What it stores**: Basic user account info, subscription status
**AI doesn't write here**: This is just account metadata

---

### **2. `conversations` Table** (Assessment Conversations)
```sql
CREATE TABLE conversations (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES profiles(id),
  assessment_id UUID,
  messages JSONB DEFAULT '[]',           -- All chat messages
  metadata JSONB,                        -- Assessment info, title, etc.
  emerging_archetypes JSONB DEFAULT '[]', -- ✨ NEW! Real-time archetype detection
  created_at TIMESTAMP,
  updated_at TIMESTAMP
)
```

**What it stores**: 
- All conversation messages (Q&A)
- Assessment metadata
- **Emerging archetypes** (as they're discovered!)

**AI writes here**: 
- Adds messages to `messages` array
- Updates `emerging_archetypes` as patterns detected

**Structure of `emerging_archetypes`**:
```json
[
  {
    "archetype_id": "uuid",
    "archetype_name": "The Narcissist",
    "confidence_score": 85,
    "impact_score": 7,
    "ranked_aliases": [
      {"name": "The Gaslighter", "strength": "strong", "confidence": 92},
      {"name": "The Manipulator", "strength": "strong", "confidence": 88}
    ],
    "evidence": ["quote1", "quote2"],
    "detected_at": "2025-01-12T..."
  }
]
```

---

### **3. `user_progression` Table** (Long-term Growth Tracking)
```sql
CREATE TABLE user_progression (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  current_level INTEGER DEFAULT 1,
  emotional_maturity_score INTEGER,      -- 1-10 scale
  shadow_work_hours INTEGER,
  therapy_hours INTEGER,
  integration_scores JSONB,              -- Scores for different areas
  completed_assessments JSONB,           -- Array of completed assessment IDs
  blocked_until TIMESTAMP,               -- Temporary blocks for integration
  progression_notes TEXT,
  last_integration_check TIMESTAMP
)
```

**What it stores**: User's overall growth journey
**AI can write here**: Update emotional maturity, integration scores

---

### **4. `content_delivery_log` Table** (What AI Showed User)
```sql
CREATE TABLE content_delivery_log (
  id UUID PRIMARY KEY,
  user_id UUID,
  conversation_id UUID,
  archetype_id UUID,
  media_id UUID,
  content_type TEXT,                     -- 'video', 'image', 'audio', etc.
  delivery_context TEXT,                 -- Why this content was delivered
  user_archetype_confidence JSONB,       -- User's scores when delivered
  engagement_metrics JSONB,              -- How user engaged
  created_at TIMESTAMP
)
```

**What it stores**: Track what content AI has shown to user
**AI writes here**: Log every piece of content delivered

---

### **5. `user_homework_tasks` Table** (Homework Assignments)
```sql
CREATE TABLE user_homework_tasks (
  id UUID PRIMARY KEY,
  user_id UUID,
  assessment_id UUID,
  archetype_id UUID,
  title TEXT,
  description TEXT,
  task_type TEXT,                        -- 'affirmation', 'meditation', etc.
  frequency TEXT,                        -- 'daily', 'weekly', etc.
  status TEXT,                           -- 'active', 'completed', etc.
  created_at TIMESTAMP
)
```

**What it stores**: Homework tasks assigned to user
**AI writes here**: Create homework based on discovered archetypes

---

### **6. `assessment_results` Table** (Final Assessment Results)
```sql
CREATE TABLE assessment_results (
  id UUID PRIMARY KEY,
  user_id UUID,
  session_id UUID,
  theme_id TEXT,
  archetype_scores JSONB,                -- Final scores for all archetypes
  final_report TEXT,                     -- AI-generated report
  linguistic_patterns JSONB,             -- Detected patterns
  conversation_summary JSONB,
  created_at TIMESTAMP
)
```

**What it stores**: Final results when assessment completes
**AI writes here**: Generate final report and scores

---

## 🔄 Data Flow During Assessment

### **Phase 1: User Starts Assessment**

```
User clicks assessment
    ↓
Create conversation record
    ↓
conversations table:
  - user_id: "user-123"
  - assessment_id: "assessment-456"
  - messages: []
  - emerging_archetypes: []
```

---

### **Phase 2: Conversation Happens** (Real-time)

```
User sends message
    ↓
AI analyzes response
    ↓
AI detects patterns
    ↓
UPDATE conversations:
  - Add message to messages[]
  - Update emerging_archetypes[]
    ↓
User sees archetypes in Sparkles tab!
```

**Example Update**:
```sql
UPDATE conversations
SET 
  messages = messages || '[{"role": "user", "content": "..."}]',
  emerging_archetypes = '[
    {
      "archetype_name": "The Narcissist",
      "confidence_score": 75,
      "ranked_aliases": [...]
    }
  ]',
  updated_at = NOW()
WHERE id = 'conversation-id'
```

---

### **Phase 3: Assessment Completes**

```
AI determines sufficient evidence
    ↓
INSERT INTO assessment_results:
  - user_id
  - archetype_scores (final)
  - final_report
    ↓
UPDATE user_progression:
  - completed_assessments += assessment_id
  - emotional_maturity_score (if changed)
    ↓
INSERT INTO user_homework_tasks:
  - Create homework for each archetype
```

---

## 🤖 Where AI Stores Information

### **During Conversation** (Real-time):
✅ `conversations.messages` - Every Q&A exchange
✅ `conversations.emerging_archetypes` - Archetypes as detected
✅ `conversations.metadata` - Assessment context

### **After Conversation** (Final):
✅ `assessment_results` - Final scores and report
✅ `user_progression` - Update growth metrics
✅ `user_homework_tasks` - Assign homework
✅ `content_delivery_log` - Track what was shown

### **AI Does NOT Write To**:
❌ `profiles` - Only account info
❌ `auth.users` - Managed by Supabase Auth

---

## 📊 Example: Full User Journey

### **Step 1: User Starts "Shadow Work Level 1"**
```sql
-- Create conversation
INSERT INTO conversations (user_id, assessment_id, messages, emerging_archetypes)
VALUES ('user-123', 'shadow-work-1', '[]', '[]')
```

### **Step 2: AI Asks First Question**
```sql
UPDATE conversations
SET messages = '[
  {"role": "assistant", "content": "Tell me about a recent conflict..."}
]'
WHERE id = 'conv-456'
```

### **Step 3: User Responds**
```sql
UPDATE conversations
SET messages = messages || '[
  {"role": "user", "content": "I always need to be right in arguments..."}
]'
WHERE id = 'conv-456'
```

### **Step 4: AI Detects Pattern**
```sql
UPDATE conversations
SET emerging_archetypes = '[
  {
    "archetype_name": "The Narcissist",
    "confidence_score": 65,
    "ranked_aliases": [
      {"name": "The Control Freak", "strength": "strong", "confidence": 70}
    ],
    "evidence": ["I always need to be right in arguments"],
    "detected_at": "2025-01-12T10:30:00Z"
  }
]'
WHERE id = 'conv-456'
```

### **Step 5: More Conversation, Confidence Increases**
```sql
UPDATE conversations
SET emerging_archetypes = '[
  {
    "archetype_name": "The Narcissist",
    "confidence_score": 85,  -- Increased!
    "ranked_aliases": [
      {"name": "The Gaslighter", "strength": "strong", "confidence": 92},
      {"name": "The Control Freak", "strength": "strong", "confidence": 88}
    ],
    "evidence": [
      "I always need to be right in arguments",
      "I tell her she's overreacting when she's upset",
      "I need to control the relationship decisions"
    ],
    "detected_at": "2025-01-12T10:30:00Z"
  }
]'
WHERE id = 'conv-456'
```

### **Step 6: Assessment Completes**
```sql
-- Save final results
INSERT INTO assessment_results (user_id, archetype_scores, final_report)
VALUES (
  'user-123',
  '{"The Narcissist": 0.85, "The Avoidant": 0.62}',
  'Your primary archetype is The Narcissist...'
)

-- Update progression
UPDATE user_progression
SET 
  completed_assessments = completed_assessments || '["shadow-work-1"]',
  emotional_maturity_score = 6
WHERE user_id = 'user-123'

-- Create homework
INSERT INTO user_homework_tasks (user_id, archetype_id, title, task_type)
VALUES (
  'user-123',
  'narcissist-archetype-id',
  'Daily Self-Reflection on Control Patterns',
  'journaling'
)
```

---

## 🎯 Summary

**Where AI Stores User Data**:
1. **`conversations`** - Real-time conversation + emerging archetypes ✨
2. **`assessment_results`** - Final scores when complete
3. **`user_progression`** - Long-term growth tracking
4. **`content_delivery_log`** - What content was shown
5. **`user_homework_tasks`** - Assigned homework

**The `conversations` table is the KEY**:
- It's where the AI writes during the conversation
- It's where `emerging_archetypes` are stored
- It's what the Sparkles tab reads from
- It's the "working memory" of the assessment

**The `profiles` table is just account info**:
- Email, name, subscription
- AI doesn't write here
- Just basic user metadata

