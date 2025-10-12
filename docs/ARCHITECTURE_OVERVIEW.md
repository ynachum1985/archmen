# ArchMen Architecture Overview

## 🏗️ **Current Architecture**

### **High-Level Flow:**

```
User Browser
    ↓
Next.js Frontend (Vercel)
    ↓
Vercel API Routes (Serverless Functions)
    ↓
External APIs (OpenAI, OpenRouter, etc.)
    ↓
Supabase Database (PostgreSQL + pgvector)
```

---

## 📦 **Components Breakdown**

### **1. Frontend (Next.js 15.3.4)**
- **Hosting**: Vercel
- **Framework**: Next.js App Router
- **UI**: React Server Components + Client Components
- **Styling**: Tailwind CSS
- **State**: React hooks (useState, useEffect)

**Key Pages:**
- `/dashboard` - User dashboard with chat
- `/admin` - Admin panel for archetypes
- `/assessments` - Assessment builder

---

### **2. Backend (Vercel Serverless Functions)**

**NOT using Supabase Edge Functions!**
**Using Vercel API Routes instead.**

#### **Why Vercel API Routes?**
✅ 60-second timeout (Vercel Pro)
✅ Full Node.js runtime
✅ Easy integration with Next.js
✅ No separate deployment needed

#### **Key API Routes:**

**`/api/process-archetype-content`**
- **Purpose**: Embed knowledge base content
- **Runtime**: Vercel Serverless (Node.js)
- **Timeout**: 60 seconds (Vercel Pro)
- **Process**:
  1. Receive text content
  2. Chunk into 400-token pieces
  3. Call OpenAI embeddings API
  4. Store in Supabase database
- **Cost**: OpenAI embeddings (~$0.02/1M tokens)

**`/api/conversation-chat`**
- **Purpose**: Handle user conversations
- **Runtime**: Vercel Serverless
- **Process**:
  1. Receive user message
  2. Search archetype knowledge base (RAG)
  3. Call OpenAI/OpenRouter for response
  4. Detect archetypes in real-time
  5. Store conversation in database
- **Cost**: GPT-3.5 (~$0.50/1M input tokens)

**`/api/check-data`**
- **Purpose**: Load archetypes for admin panel
- **Runtime**: Vercel Serverless
- **Process**: Query Supabase for all active archetypes

**`/api/archetype-content/[id]`**
- **Purpose**: Fetch embedded chunks for archetype
- **Runtime**: Vercel Serverless
- **Process**: Query archetype_content_chunks table

---

### **3. Database (Supabase)**

**Using Supabase for:**
✅ PostgreSQL database
✅ pgvector extension (embeddings)
✅ Row Level Security (RLS)
✅ Real-time subscriptions
✅ Storage (file uploads)

**NOT using:**
❌ Supabase Edge Functions
❌ Supabase Auth (using custom auth)

#### **Key Tables:**

**`enhanced_archetypes`** (60 archetypes)
- name, description, impact_score
- alternative_names (array)
- tags (array)

**`archetype_content_chunks`** (embedded knowledge)
- chunk_text (400 tokens each)
- embedding (vector - 1536 dimensions)
- archetype_id (foreign key)

**`conversations`** (user chats)
- messages (JSONB array)
- emerging_archetypes (JSONB)
- user_id, assessment_id

**`user_archetypes`** (permanent collection)
- archetype_id, confidence_score
- evidence, pattern_timeline
- integration_status

**`profiles`** (user accounts)
- email, name, avatar_url
- subscription_tier

---

### **4. AI Services**

#### **OpenAI (Primary)**
**Used for:**
- ✅ Embeddings: `text-embedding-3-small`
- ✅ Chat: `gpt-3.5-turbo`, `gpt-4-turbo`

**Cost:**
- Embeddings: $0.02 / 1M tokens
- GPT-3.5: $0.50 / 1M input, $1.50 / 1M output
- GPT-4: $10 / 1M input, $30 / 1M output

**Where it runs:**
- Called from Vercel API routes
- Direct API calls (not edge functions)

#### **OpenRouter (Secondary)**
**Used for:**
- ✅ Multi-model access (Gemini, Claude)
- ✅ Image generation (DALL-E)

**Cost:**
- Varies by model
- Gemini Pro: $0.125 / 1M input tokens
- DALL-E 3: $0.04 per image

---

## 🔄 **Data Flow Examples**

### **Example 1: Embedding Knowledge Base Content**

```
1. User pastes linguistic patterns in admin panel
    ↓
2. Frontend calls /api/process-archetype-content
    ↓
3. Vercel API Route (60s timeout):
   - Chunks text (400 tokens each)
   - Calls OpenAI embeddings API
   - Generates vectors (1536 dimensions)
    ↓
4. Stores in Supabase:
   - archetype_content_chunks table
   - Each chunk with embedding vector
    ↓
5. Frontend refreshes to show chunks
```

**Runtime**: Vercel Serverless (NOT Edge Function)
**Timeout**: 60 seconds (Vercel Pro)
**Cost**: ~$0.0002 per document

---

### **Example 2: User Conversation with Archetype Detection**

```
1. User sends message in chat
    ↓
2. Frontend calls /api/conversation-chat
    ↓
3. Vercel API Route:
   - Converts message to embedding
   - Searches archetype_content_chunks (RAG)
   - Finds matching patterns
    ↓
4. Calls OpenAI GPT-3.5:
   - Sends conversation history
   - Includes matched archetype patterns
   - Gets AI response
    ↓
5. Analyzes for archetype patterns:
   - Linguistic matching
   - RAG similarity scores
   - AI confidence analysis
    ↓
6. Updates database:
   - Saves message to conversations
   - Updates emerging_archetypes
   - Auto-adds to user_archetypes if 60%+ confidence
    ↓
7. Returns response to frontend
```

**Runtime**: Vercel Serverless
**Cost**: ~$0.001 per message (GPT-3.5)

---

## 🚀 **Deployment Architecture**

### **Vercel (Hosting & Functions)**
```
Production: https://archmen.vercel.app
Staging: https://archmen-staging.vercel.app

Deployment:
- Git push to staging → Auto-deploy
- Manual promotion to production
```

**Vercel Pro Features:**
- ✅ 60-second function timeout
- ✅ 1M function executions/month
- ✅ 1TB bandwidth
- ✅ Edge network (CDN)

### **Supabase (Database)**
```
Project: archmen (rkqujvonllmxjkkkeqsy)
Region: us-east-1
Plan: Free tier (500 MB database)
```

**Supabase Features:**
- ✅ PostgreSQL 15
- ✅ pgvector extension
- ✅ Row Level Security
- ✅ Real-time subscriptions

---

## 💰 **Cost Breakdown**

### **Monthly Costs (100 active users):**

```
Vercel Pro:
- Fixed: $20/month
- Includes: 1M function executions, 1TB bandwidth

OpenAI:
- Embeddings: ~$0.06/month (60 archetypes)
- Chat (GPT-3.5): ~$5/month (100 users × 50 messages)
- Total: ~$5.06/month

OpenRouter:
- Image generation: ~$0.40/month
- Gemini Pro: ~$1/month
- Total: ~$1.40/month

Supabase:
- Free tier: $0/month (under 500 MB)

TOTAL: ~$26.46/month
```

---

## 🎯 **Why This Architecture?**

### **Advantages:**
✅ **Simple**: One codebase, one deployment
✅ **Fast**: Vercel edge network + CDN
✅ **Scalable**: Serverless auto-scales
✅ **Cost-effective**: Pay only for what you use
✅ **Developer-friendly**: Next.js + TypeScript

### **Trade-offs:**
⚠️ **60-second timeout**: Can't process huge documents
⚠️ **Cold starts**: First request may be slower
⚠️ **Vendor lock-in**: Tied to Vercel + Supabase

---

## 🔮 **Future Considerations**

### **If you need longer processing:**
- Move to Supabase Edge Functions (no timeout)
- Use background jobs (Inngest, Trigger.dev)
- Implement queue system (BullMQ, Redis)

### **If you need more scale:**
- Upgrade Supabase to Pro ($25/month)
- Add Redis caching (Upstash)
- Implement CDN for static assets

### **If you need more AI models:**
- Add more OpenRouter models
- Implement model switching
- Add fallback models

---

## 📊 **Summary**

**Current Setup:**
- Frontend: Next.js on Vercel
- Backend: Vercel API Routes (NOT Edge Functions)
- Database: Supabase PostgreSQL
- AI: OpenAI + OpenRouter

**Key Point:**
**You are NOT using Supabase Edge Functions!**
**Everything runs on Vercel Serverless Functions.**

This is simpler, faster to develop, and works great for your use case! 🚀

