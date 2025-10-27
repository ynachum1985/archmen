# ArchMen Database Audit Report

## Summary
- **Total Tables**: 35
- **Active Tables** (with data): 20
- **Empty Tables** (0 rows): 15
- **Redundant Tables**: 8 (identified for deprecation)

---

## 🟢 ACTIVE TABLES (Keep - Currently Used)

### Core Assessment System
| Table | Rows | Purpose | Status |
|-------|------|---------|--------|
| `enhanced_assessments` | 12 | Main assessment configurations | ✅ ACTIVE |
| `enhanced_archetypes` | 60 | Archetype definitions (55 archetypes) | ✅ ACTIVE |
| `assessment_templates` | 13 | Assessment templates | ✅ ACTIVE |
| `assessment_questions` | 8 | Assessment questions | ✅ ACTIVE |
| `conversations` | 19 | Chat conversations | ✅ ACTIVE |

### Knowledge Base & RAG
| Table | Rows | Purpose | Status |
|-------|------|---------|--------|
| `archetype_content_chunks` | 319 | Archetype knowledge base chunks (vector embeddings) | ✅ ACTIVE |
| `assessment_content_chunks` | 23 | Assessment knowledge base chunks | ✅ ACTIVE |
| `archetype_embedding_settings` | 19 | Embedding model configurations | ✅ ACTIVE |
| `assessment_embedding_settings` | 12 | Assessment embedding configs | ✅ ACTIVE |

### User Data & Responses
| Table | Rows | Purpose | Status |
|-------|------|---------|--------|
| `assessment_responses` | 1 | User responses during assessments (NEW - for RAG context) | ✅ ACTIVE |
| `user_homework_tasks` | 9 | Homework tasks assigned to users | ✅ ACTIVE |
| `profiles` | 1 | User profiles | ✅ ACTIVE |

### Moderation & Safety
| Table | Rows | Purpose | Status |
|-------|------|---------|--------|
| `moderation_patterns` | 6 | Detected moderation patterns | ✅ ACTIVE |
| `moderation_settings` | 5 | Moderation configuration | ✅ ACTIVE |

### AI & Homework
| Table | Rows | Purpose | Status |
|-------|------|---------|--------|
| `ai_homework_suggestions` | 5 | AI-generated homework suggestions | ✅ ACTIVE |
| `ai_personalities` | 3 | AI personality configurations | ✅ ACTIVE |

### Cache
| Table | Rows | Purpose | Status |
|-------|------|---------|--------|
| `openrouter_models_cache` | 0 | OpenRouter models cache (NEW) | ✅ ACTIVE |

---

## 🟡 LEGACY/REDUNDANT TABLES (Deprecate - Not Used)

### Old Assessment System (Replaced by `enhanced_assessments`)
| Table | Rows | Purpose | Reason to Remove |
|-------|------|---------|------------------|
| `assessments` | 0 | Old assessment table | Replaced by `enhanced_assessments` |
| `assessment_templates` | 13 | Old templates | Overlaps with `enhanced_assessments` |
| `assessment_sessions` | 0 | Old session tracking | Replaced by `conversations` |
| `assessment_chat_history` | 0 | Old chat history | Replaced by `conversations` |

### Old Response Tracking (Replaced by `assessment_responses`)
| Table | Rows | Purpose | Reason to Remove |
|-------|------|---------|------------------|
| `quiz_question_responses` | 3 | Old quiz responses | Replaced by `assessment_responses` |
| `assessment_quiz_attempts` | 1 | Old quiz attempts | Replaced by `assessment_responses` |
| `assessment_results` | 0 | Old results | Replaced by `assessment_responses` |

### Unused Features
| Table | Rows | Purpose | Reason to Remove |
|-------|------|---------|------------------|
| `archetype_results` | 0 | Old archetype results | Not used in current system |

---

## 🔴 EMPTY TABLES (Remove - Never Used)

| Table | Rows | Purpose |
|-------|------|---------|
| `homework_task_completions` | 0 | Task completion tracking |
| `moderation_incidents` | 0 | Moderation incident logs |
| `archetype_files` | 0 | Archetype file uploads |
| `user_profiles` | 0 | Duplicate of `profiles` |
| `user_calendar_events` | 0 | Calendar integration |
| `user_feedback` | 0 | User feedback collection |
| `user_notification_preferences` | 0 | Notification settings |
| `assessment_files` | 0 | Assessment file uploads |
| `assessment_enrollments` | 3 | Assessment enrollment tracking |
| `archetype_media` | 0 | Archetype media storage |

---

## 📋 RECOMMENDATIONS

### ⚠️ IMPORTANT: Code References Found
The following tables ARE referenced in the codebase and should NOT be removed:
- `homework_task_completions` - Used in `/src/app/api/homework-completions/route.ts`
- `moderation_incidents` - Used in `/src/app/api/moderate-content/route.ts` and `ModerationDashboard.tsx`
- `archetype_files` - Used in knowledge base system
- `user_notification_preferences` - Used in RLS policies
- `user_calendar_events` - Used in RLS policies
- `assessment_quiz_attempts` - Used in quiz gateway system
- `quiz_question_responses` - Used in quiz system

### Phase 1: Safe Cleanup (No Code References)
Remove these empty tables that have NO code references:
- `user_profiles` (0 rows) - Duplicate of `profiles` table
- `assessment_files` (0 rows) - Not referenced in code
- `archetype_media` (0 rows) - Not referenced in code
- `assessment_results` (0 rows) - Replaced by `assessment_responses`
- `assessment_sessions` (0 rows) - Replaced by `conversations`
- `assessment_chat_history` (0 rows) - Replaced by `conversations`
- `archetype_results` (0 rows) - Not used in current system
- `assessments` (0 rows) - Replaced by `enhanced_assessments`

### Phase 2: Monitor & Deprecate (After Verification)
These tables have code references but may be unused:
- `assessment_enrollments` (3 rows) - Check if enrollment system is active
- `user_archetypes` (3 rows) - Check if still used for archetype tracking
- `quiz_question_responses` (3 rows) - Old quiz data, verify if still needed

### Phase 3: Future Optimization
Once homework completion tracking is fully implemented:
- Monitor `homework_task_completions` usage
- Consider archiving old data (>6 months) to improve performance

---

## 🔍 Data Integrity Notes

- **`user_archetypes` (3 rows)**: Contains old archetype assignments - verify if still needed
- **`assessment_enrollments` (3 rows)**: Contains enrollment data - verify if still needed
- **`quiz_question_responses` (3 rows)**: Old quiz data - not from recent sessions
- **`assessment_quiz_attempts` (1 row)**: Old quiz attempt - not from recent sessions

These tables have minimal data and appear to be from earlier development phases.

---

## ✅ Current Active Schema

The system currently uses:
1. **Assessment Management**: `enhanced_assessments`, `enhanced_archetypes`, `assessment_templates`, `assessment_questions`
2. **Chat & Conversations**: `conversations`
3. **Knowledge Base**: `archetype_content_chunks`, `assessment_content_chunks`, embedding settings
4. **User Responses**: `assessment_responses` (NEW - for RAG context)
5. **Moderation**: `moderation_patterns`, `moderation_settings`
6. **Homework**: `user_homework_tasks`, `ai_homework_suggestions`
7. **Cache**: `openrouter_models_cache`

