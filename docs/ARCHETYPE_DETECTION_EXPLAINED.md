# Archetype Detection Logic Explained

## 🎯 **How Confidence Scores Work**

### **Current System (Simplified)**

The AI doesn't count "pieces of evidence" like 4 out of 10. Instead, it uses **holistic pattern matching**:

```
User Message: "I always need to be right in arguments"
    ↓
AI analyzes ENTIRE conversation context (last 5 messages)
    ↓
AI looks for patterns in:
  - Language choices ("always", "need to", "right")
  - Values expressed (control, authority)
  - Relationship dynamics (power, dominance)
  - Emotional patterns (defensiveness, rigidity)
    ↓
AI assigns confidence score: 0-100%
    ↓
Example: The Narcissist = 75%
```

### **What Does 75% Confidence Mean?**

**NOT**: "Found 7.5 out of 10 evidence pieces"

**ACTUALLY**: "Based on the conversation patterns, I'm 75% confident this archetype is present"

It's more like:
- **30-50%**: "I see some hints of this pattern"
- **50-70%**: "This pattern is clearly emerging"
- **70-85%**: "This is definitely a primary archetype"
- **85-100%**: "This is a dominant archetype with strong evidence"

---

## 📊 **Current Thresholds**

### **1. Detection Threshold: 30%**
```javascript
.filter(([_, confidence]) => (confidence as number) >= 30)
```

**Meaning**: Only show archetypes with 30%+ confidence

**Why 30%?** 
- Too low (10-20%): Too many false positives
- Too high (50%+): Miss emerging patterns
- 30% is the "sweet spot" for early detection

### **2. Display Threshold: Variable**
Currently, we show ALL archetypes above 30%, but we could add:
- **Emerging** (30-60%): "Pattern detected, gathering more evidence"
- **Present** (60-80%): "Archetype is clearly present"
- **Dominant** (80-100%): "Primary archetype with strong evidence"

### **3. Auto-Add Threshold: Not Set Yet**
This is what you're asking about! Should we auto-add to Sparkles tab at:
- 50%? (moderate confidence)
- 60%? (clear presence)
- 70%? (high confidence)

---

## 🔍 **What Is "Evidence"?**

### **Current Evidence Collection**

```javascript
function extractEvidenceQuotes(conversationHistory, archetypeName) {
  // Get last 5 user messages
  const userMessages = conversationHistory
    .filter(msg => msg.role === 'user')
    .slice(-5)
  
  // Return top 3 as "evidence"
  return userMessages.slice(0, 3)
}
```

**Example Evidence for "The Narcissist":**
```json
[
  "I always need to be right in arguments",
  "I tell her she's overreacting when she's upset",
  "I need to control the relationship decisions"
]
```

### **What Makes Good Evidence?**

**Strong Evidence** (should increase confidence):
- Direct quotes showing the pattern
- Specific behavioral examples
- Emotional language matching archetype
- Repeated patterns across messages

**Weak Evidence** (shouldn't count as much):
- Vague statements
- Single mentions
- Contradictory patterns

---

## 🧠 **How AI Analyzes Patterns**

### **Current Analysis Prompt**

```
Look for:
- Language patterns and vocabulary choices
- Values and motivations expressed
- Relationship and communication styles
- Approach to challenges and growth
- Emotional patterns and responses
```

### **Example Analysis**

**User says**: "I always need to be right in arguments. When she gets emotional, I just use logic to show her she's wrong."

**AI detects**:
1. **The Narcissist** (85%)
   - "always need to be right" → Control pattern
   - "use logic to show her she's wrong" → Invalidation
   - "when she gets emotional" → Dismissing emotions

2. **The Gaslighter** (80%) - Alias of Narcissist
   - "show her she's wrong" → Reality manipulation
   - Dismissing partner's emotional reality

3. **The Avoidant** (45%)
   - "when she gets emotional" → Emotional discomfort
   - But NOT avoiding, so lower confidence

---

## 🎯 **Proposed Improved System**

### **Option 1: Evidence-Based Thresholds**

```typescript
interface EvidenceRequirements {
  minEvidence: 3              // Need 3+ quotes
  minConfidence: 60           // AND 60%+ confidence
  minConversationTurns: 4     // AND 4+ Q&A exchanges
}
```

**Logic**:
```
IF (
  evidence.length >= 3 AND
  confidence >= 60 AND
  conversationTurns >= 4
) THEN auto-add to Sparkles tab
```

### **Option 2: Progressive Reveal**

```typescript
interface ConfidenceLevels {
  emerging: 30-59     // Show as "Emerging Pattern"
  present: 60-79      // Show as "Archetype Present"
  dominant: 80-100    // Show as "Dominant Archetype"
}
```

**UI**:
```
┌─────────────────────────────────────┐
│ Emerging Patterns (2)               │
├─────────────────────────────────────┤
│ The Avoidant (45%)                  │
│ [Gathering evidence...]             │
│                                     │
│ The Alpha Male (38%)                │
│ [Gathering evidence...]             │
└─────────────────────────────────────┘

┌─────────────────────────────────────┐
│ Archetypes Present (1)              │
├─────────────────────────────────────┤
│ The Narcissist (75%)                │
│ [Add to My Archetypes]              │
└─────────────────────────────────────┘
```

### **Option 3: Smart Auto-Add**

```typescript
// Auto-add to Sparkles tab when:
if (
  confidence >= 70 AND           // High confidence
  evidence.length >= 3 AND       // Multiple quotes
  conversationTurns >= 5         // Sufficient conversation
) {
  // Automatically add to emerging_archetypes
  // User sees it immediately in Sparkles tab
  // No manual "Add" button needed
}
```

---

## 💡 **Recommended Approach**

### **Phase 1: Auto-Add with Clear Thresholds**

```typescript
const THRESHOLDS = {
  // Detection (show in analysis, not to user)
  MIN_DETECTION: 30,
  
  // Emerging (show to user as "pattern emerging")
  MIN_EMERGING: 40,
  MIN_EVIDENCE_EMERGING: 2,
  
  // Present (auto-add to Sparkles tab)
  MIN_PRESENT: 60,
  MIN_EVIDENCE_PRESENT: 3,
  MIN_TURNS_PRESENT: 4,
  
  // Dominant (highlight as primary)
  MIN_DOMINANT: 80,
  MIN_EVIDENCE_DOMINANT: 4
}
```

### **User Experience**

```
Turn 1-3: User answers questions
→ No archetypes shown yet

Turn 4: "I always need to be right"
→ The Narcissist (45%) - Emerging Pattern
→ Shows in conversation, NOT in Sparkles tab yet

Turn 6: "I tell her she's overreacting"
→ The Narcissist (65%) - Archetype Present
→ AUTO-ADDED to Sparkles tab!
→ User sees notification: "New archetype discovered!"

Turn 8: "I need to control decisions"
→ The Narcissist (85%) - Dominant Archetype
→ Confidence updated in Sparkles tab
→ More aliases revealed
```

---

## 🎨 **Visual Indicators**

### **In Conversation (During Assessment)**

```
AI: "Tell me about a recent conflict..."

User: "I always need to be right in arguments"

AI: "I see. What happens when your partner disagrees?"

[💡 Pattern Emerging: The Narcissist (45%)]
```

### **In Sparkles Tab**

```
┌─────────────────────────────────────┐
│ 🎭 Discovered Archetypes            │
├─────────────────────────────────────┤
│ The Narcissist                      │
│ 📊 85% confidence                   │
│ ⚡ Impact: 7/7                      │
│ 📝 4 pieces of evidence             │
│                                     │
│ Also shows as:                      │
│ • The Gaslighter [strong]           │
│ • The Manipulator [strong]          │
│                                     │
│ [Add to My Archetypes]              │
└─────────────────────────────────────┘
```

---

## 🚀 **Next Steps**

1. **Add evidence counting** to archetype detection
2. **Implement auto-add threshold** (60% + 3 evidence + 4 turns)
3. **Add progressive reveal UI** (emerging vs present vs dominant)
4. **Show evidence count** in Sparkles tab
5. **Add notification** when archetype auto-added

Would you like me to implement this improved system?

