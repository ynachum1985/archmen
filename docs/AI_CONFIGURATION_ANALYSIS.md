# AI Configuration Analysis for Archetype Detection

## 📊 Current State

### ✅ ALREADY IMPLEMENTED

#### 1. **AI Model Selection** (Per Assessment)
**Location**: `src/components/admin/EnhancedAssessmentBuilder.tsx`

```typescript
// Live Assessment LLM Configuration
liveProvider?: LLMProvider  // openai, anthropic, openrouter, groq, etc.
liveModel?: string          // gpt-4-turbo-preview, claude-3.5-sonnet, etc.
```

**Available Providers**:
- OpenAI (GPT-4, GPT-3.5)
- Anthropic (Claude 3.5 Sonnet, Claude 3 Haiku)
- OpenRouter (access to 20+ models)
- Groq (Llama 3.1, Mixtral)
- Google (Gemini Pro, Gemini Flash)
- Local (Ollama models)

**UI**: Admin can select provider + model in Assessment Builder

---

#### 2. **Confidence Threshold** (Per Assessment)
**Location**: `src/components/admin/AssessmentAIConfig.tsx`

```typescript
confidenceThreshold: 0.7  // 0.0 - 1.0
```

**Description**: "How confident the AI should be before revealing an archetype"

**Current Default**: 0.7 (70%)

**UI**: Input field in "Analysis Configuration" tab

---

#### 3. **Evidence Threshold** (Per Assessment)
**Location**: `src/app/admin/assessment/[id]/page.tsx`

```typescript
evidenceThreshold: 0.7  // How much evidence needed per archetype
```

**Current Default**: 0.7 (70%)

---

#### 4. **Adaptive Questioning Settings**
**Location**: `src/app/admin/assessment/[id]/page.tsx`

```typescript
// AI Settings
minQuestions: 8           // Minimum questions to ask
maxQuestions: 15          // Maximum questions before concluding
adaptationSensitivity: 0.5  // How quickly AI adapts (0.0 - 1.0)

// Cycle Settings
cycleSettings: {
  maxCycles: 3,           // Max analysis cycles
  evidencePerCycle: 3     // Evidence pieces needed per cycle
}
```

**Behavior**:
- AI asks 8-15 questions adaptively
- Stops when sufficient evidence gathered
- Can prompt for more clarity if responses too brief

---

#### 5. **AI Personality System**
**Location**: `src/lib/services/ai-personality.service.ts`

```typescript
interface AIPersonality {
  open_ended_questions: string[]
  clarifying_questions: string[]
  specific_questions: string[]
  goals: string[]
  behavior_traits: string[]
  pacing_settings: {
    questions_per_session: 8
    pause_between_questions: 30  // seconds
    max_session_duration: 45     // minutes
  }
}
```

**Features**:
- Custom questioning styles
- Pacing control
- Safety limits
- Escalation triggers

---

#### 6. **Response Requirements**
**Location**: `src/components/admin/EnhancedAssessmentBuilder.tsx`

```typescript
responseRequirements: {
  minSentences: 2,
  maxSentences: 5,
  followUpPrompts: [
    "Can you elaborate on that?",
    "Tell me more about what you mean..."
  ]
}
```

**Behavior**: AI prompts for more detail if response too brief

---

#### 7. **Archetype Analysis Logic**
**Location**: `src/app/api/conversation-chat/route.ts`

```typescript
// Analyzes patterns and returns confidence scores
const archetypeConfidence = await analyzeArchetypePatterns(
  message,
  conversationHistory,
  archetypes
)

// Filters low confidence scores
.filter(([_, confidence]) => confidence >= 30)  // 30% minimum
.sort(([_, a], [__, b]) => b - a)              // Sort by confidence
.slice(0, 5)                                    // Top 5 archetypes
```

**Current Thresholds**:
- Minimum: 30% to be considered
- Display: Top 5 archetypes only

---

#### 8. **Global Scoring Thresholds**
**Location**: `src/config/app.config.ts`

```typescript
scoringThresholds: {
  dominant: 0.7,   // 70% = Dominant archetype
  secondary: 0.5,  // 50% = Secondary archetype
  present: 0.3     // 30% = Present but not primary
}
```

---

## ❌ NOT YET IMPLEMENTED

### 1. **Real-Time Archetype Detection During Conversation**

**Current State**: 
- AI analyzes patterns but doesn't update `emerging_archetypes` in real-time
- No progressive reveal as conversation happens

**What's Needed**:
- Update `conversations.emerging_archetypes` after each AI response
- Rank aliases by strength (strong/moderate/mild)
- Calculate confidence scores per archetype
- Extract evidence quotes from conversation

---

### 2. **Alias Ranking Logic**

**Current State**:
- Aliases exist in database (`alternative_names` column)
- No logic to rank which aliases are most relevant

**What's Needed**:
```typescript
// Determine alias strength based on linguistic patterns
ranked_aliases: [
  {name: "The Gaslighter", strength: "strong", confidence: 92},
  {name: "The Manipulator", strength: "strong", confidence: 88},
  {name: "The Control Freak", strength: "moderate", confidence: 65}
]
```

**Ranking Criteria**:
- Pattern matching against archetype's linguistic patterns
- Frequency of specific keywords/phrases
- Contextual relevance to user's responses

---

### 3. **Progressive Reveal Timing**

**Current State**:
- `revealTiming: 'progressive'` exists in config
- Not actually implemented

**What's Needed**:
- Show archetypes as soon as confidence threshold met
- Update confidence scores as more evidence gathered
- Remove archetypes if confidence drops below threshold

---

### 4. **Minimum Data Requirements**

**Current State**:
- `minQuestions: 8` exists
- No explicit "minimum data per archetype" setting

**What's Needed**:
```typescript
archetypeDetectionSettings: {
  minEvidencePieces: 3,        // Need 3+ evidence quotes
  minConfidence: 0.6,           // 60% confidence minimum
  minConversationTurns: 4,      // At least 4 Q&A exchanges
  requireMultiplePatterns: true // Must match 2+ linguistic patterns
}
```

---

## 🎯 RECOMMENDATIONS

### Phase 1: Connect AI to Emerging Archetypes (PRIORITY)

**Goal**: Make the Sparkles tab actually work with real-time detection

**Tasks**:
1. Update `/api/conversation-chat` to detect archetypes after each response
2. Calculate confidence scores using existing thresholds
3. Rank aliases based on linguistic pattern matching
4. Update `conversations.emerging_archetypes` in database
5. Extract evidence quotes from conversation

**Estimated Effort**: 4-6 hours

---

### Phase 2: Add Archetype Detection Settings to Admin

**Goal**: Give admins control over detection sensitivity

**New Settings**:
```typescript
archetypeDetection: {
  minEvidencePieces: 3,
  minConfidence: 0.6,
  minConversationTurns: 4,
  aliasRankingEnabled: true,
  progressiveReveal: true,
  maxArchetypesShown: 5
}
```

**UI Location**: Add new tab in Assessment Builder

**Estimated Effort**: 2-3 hours

---

### Phase 3: Enhance Alias Ranking

**Goal**: Smart alias selection based on user's specific patterns

**Algorithm**:
1. Match user responses against archetype's linguistic patterns
2. Score each alias based on keyword frequency
3. Categorize as strong/moderate/mild based on score
4. Sort by relevance

**Estimated Effort**: 3-4 hours

---

## 📋 SUMMARY

### ✅ You Already Have:
- AI model selection per assessment
- Confidence thresholds (0.7 default)
- Evidence thresholds (0.7 default)
- Adaptive questioning (8-15 questions)
- Response requirements (min 2 sentences)
- AI personality system
- Archetype analysis logic
- Global scoring thresholds

### ❌ You Need to Build:
- Real-time archetype detection during conversation
- Alias ranking logic (strong/moderate/mild)
- Progressive reveal implementation
- Minimum data requirements per archetype
- Admin UI for archetype detection settings

### 🚀 Next Steps:
1. **Phase 1**: Connect AI to update `emerging_archetypes` in real-time
2. **Phase 2**: Add archetype detection settings to admin panel
3. **Phase 3**: Implement smart alias ranking

Would you like me to start with Phase 1?

