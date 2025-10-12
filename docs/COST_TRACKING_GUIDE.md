# Cost Tracking Guide - ArchMen AI Services

## 🎯 **Quick Summary**

You're using multiple AI services. Here's where to check costs for each:

---

## 💰 **1. OpenAI (Embeddings & GPT Models)**

### **What You're Using:**
- **Embeddings**: `text-embedding-3-small` (default for knowledge base)
- **Chat Models**: GPT-3.5-turbo, GPT-4 (for conversations)

### **Where to Check Costs:**
1. Go to: https://platform.openai.com/usage
2. Login with your OpenAI account
3. View:
   - **Daily usage** (tokens, requests, costs)
   - **Monthly breakdown** by model
   - **Cost per model** (embeddings vs chat)

### **Current Pricing (as of 2024):**
```
Embeddings:
- text-embedding-3-small: $0.02 / 1M tokens
- text-embedding-3-large: $0.13 / 1M tokens

Chat Models:
- GPT-3.5-turbo: $0.50 / 1M input tokens, $1.50 / 1M output tokens
- GPT-4-turbo: $10 / 1M input tokens, $30 / 1M output tokens
```

### **Estimated Costs for Your Use:**
```
Embedding 1 linguistic pattern document (~25 chunks):
- Input: ~10,000 tokens
- Cost: $0.0002 (basically free!)

Embedding all 60 archetypes:
- Input: ~600,000 tokens
- Cost: ~$0.012 (1.2 cents total!)

User conversation (100 messages):
- GPT-3.5-turbo: ~$0.10
- GPT-4-turbo: ~$2.00
```

---

## 🚀 **2. OpenRouter (Multi-Model Access)**

### **What You're Using:**
- Access to Google Gemini, Claude, and other models
- Image generation (DALL-E via OpenRouter)

### **Where to Check Costs:**
1. Go to: https://openrouter.ai/activity
2. Login with your OpenRouter account
3. View:
   - **Request history** (all API calls)
   - **Cost per request**
   - **Total spend** (daily/monthly)
   - **Credits remaining**

### **How to Access:**
```
Dashboard → Activity → Usage
```

### **Current Pricing (varies by model):**
```
Google Gemini Pro:
- Input: $0.125 / 1M tokens
- Output: $0.375 / 1M tokens

Claude 3.5 Sonnet:
- Input: $3 / 1M tokens
- Output: $15 / 1M tokens

DALL-E 3 (via OpenRouter):
- Standard: $0.040 per image
- HD: $0.080 per image
```

---

## 📊 **3. Supabase (Database & Storage)**

### **What You're Using:**
- PostgreSQL database (archetype data, user profiles, conversations)
- pgvector extension (for embeddings storage)
- Storage (for uploaded files, images)

### **Where to Check Costs:**
1. Go to: https://supabase.com/dashboard/project/rkqujvonllmxjkkkeqsy/settings/billing
2. View:
   - **Current plan** (Free/Pro/Team)
   - **Database size** (GB used)
   - **Bandwidth** (data transfer)
   - **Storage** (file uploads)

### **Free Tier Limits:**
```
Database: 500 MB
Storage: 1 GB
Bandwidth: 5 GB/month
API Requests: Unlimited
```

### **Pro Plan ($25/month):**
```
Database: 8 GB included
Storage: 100 GB included
Bandwidth: 250 GB/month
Additional: Pay-as-you-go
```

### **Estimated Usage:**
```
Your current database size:
- 60 archetypes with embeddings: ~50 MB
- User conversations (100 users): ~100 MB
- Total: ~150 MB (well within free tier!)
```

---

## 🔍 **4. Vercel (Hosting & Deployments)**

### **What You're Using:**
- Next.js hosting
- Serverless functions (API routes)
- Edge network (CDN)

### **Where to Check Costs:**
1. Go to: https://vercel.com/ynachum1985/archmen/settings/billing
2. View:
   - **Current plan** (Hobby/Pro)
   - **Function executions**
   - **Bandwidth usage**
   - **Build minutes**

### **Pro Plan ($20/month):**
```
Function Executions: 1M included
Bandwidth: 1 TB included
Build Minutes: 6,000 included
Serverless Function Timeout: 60 seconds
```

---

## 📈 **5. Cost Monitoring Dashboard (Recommended)**

### **Create a Simple Tracking Sheet:**

| Service | Monthly Budget | Current Spend | % Used |
|---------|---------------|---------------|--------|
| OpenAI Embeddings | $1 | $0.05 | 5% |
| OpenAI Chat (GPT-3.5) | $10 | $2.30 | 23% |
| OpenRouter | $5 | $1.20 | 24% |
| Supabase | $0 (Free) | $0 | 0% |
| Vercel | $20 (Pro) | $20 | 100% |
| **TOTAL** | **$36** | **$23.55** | **65%** |

---

## 💡 **Cost Optimization Tips**

### **1. Embeddings (Cheapest Part!)**
```
✅ Use text-embedding-3-small (default)
✅ Chunk size 400 tokens (optimal)
✅ Only embed once per document
❌ Don't use text-embedding-3-large (6.5x more expensive)
```

### **2. Chat Models (Most Expensive)**
```
✅ Use GPT-3.5-turbo for most conversations
✅ Only use GPT-4 for complex reasoning
✅ Limit conversation history (last 10 messages)
❌ Don't send entire conversation every time
```

### **3. OpenRouter**
```
✅ Use Gemini Pro for cost-effective AI
✅ Cache frequently used prompts
✅ Batch image generation requests
❌ Don't use Claude 3.5 for simple tasks
```

### **4. Database**
```
✅ Stay on Supabase free tier (plenty for now)
✅ Clean up old conversations periodically
✅ Compress large text fields
❌ Don't store full conversation history forever
```

---

## 🎯 **Your Current Setup (Estimated Monthly Costs)**

### **Scenario: 100 Active Users**

```
OpenAI Embeddings:
- 60 archetypes embedded: $0.01
- Monthly updates: $0.05
- Total: ~$0.06/month

OpenAI Chat (GPT-3.5):
- 100 users × 50 messages/month: $5.00
- Total: ~$5.00/month

OpenRouter:
- Image generation (10 images/month): $0.40
- Gemini Pro usage: $1.00
- Total: ~$1.40/month

Supabase:
- Free tier (under 500 MB): $0.00
- Total: $0.00/month

Vercel Pro:
- Fixed cost: $20.00/month
- Total: $20.00/month

TOTAL ESTIMATED: ~$26.46/month
```

---

## 🚨 **Cost Alerts (Set These Up!)**

### **OpenAI:**
1. Go to: https://platform.openai.com/account/billing/limits
2. Set **Hard Limit**: $50/month
3. Set **Soft Limit**: $25/month (email alert)

### **OpenRouter:**
1. Go to: https://openrouter.ai/settings/limits
2. Set **Monthly Limit**: $10
3. Enable **Email Alerts**

### **Supabase:**
1. Go to: https://supabase.com/dashboard/project/rkqujvonllmxjkkkeqsy/settings/billing
2. Enable **Usage Alerts**
3. Set threshold: 80% of free tier

---

## 📊 **Real-Time Cost Tracking**

### **Check Daily:**
- OpenAI: https://platform.openai.com/usage
- OpenRouter: https://openrouter.ai/activity

### **Check Weekly:**
- Supabase: Database size
- Vercel: Function executions

### **Check Monthly:**
- Total spend across all services
- Adjust budgets if needed

---

## 🎯 **Bottom Line**

**Your current costs are VERY LOW!**

- Embeddings: **Pennies** (literally $0.01-0.10/month)
- Chat: **$5-10/month** (depends on usage)
- Infrastructure: **$20/month** (Vercel Pro)

**Total: ~$25-30/month for 100 active users**

This is extremely cost-effective for an AI-powered coaching platform! 🚀

