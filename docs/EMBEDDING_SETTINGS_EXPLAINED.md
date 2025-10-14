# Embedding Settings Explained

## 📊 **Current Configuration (Optimized)**

Both **Assessments** and **Archetypes** now use the same optimized settings:

| Setting | Value | Why This Value? |
|---------|-------|-----------------|
| **Chunk Size** | 400 tokens | Optimal balance: enough context, not too much noise |
| **Chunk Overlap** | 80 tokens | 20% overlap prevents context loss at boundaries |
| **Embedding Model** | text-embedding-3-small | Best performance/cost ratio for most use cases |
| **Top K Results** | 10 | Retrieves 10 most relevant chunks (industry standard) |
| **Similarity Threshold** | 0.7 (70%) | Only retrieve chunks with 70%+ relevance |

---

## 🤔 **What Each Setting Does**

### **1. Chunk Size**
**What it is:** How much text to include in each chunk before creating an embedding.

**Example:**
- **Chunk Size = 400 tokens** → Each chunk is ~300 words
- **Chunk Size = 1000 tokens** → Each chunk is ~750 words

**Why 400 is optimal:**
- ✅ Enough context for meaningful retrieval
- ✅ Not too large (avoids mixing unrelated topics)
- ✅ Faster processing and cheaper storage
- ✅ Better precision in search results

**When to adjust:**
- **Increase to 600-800** if your content has long, interconnected concepts
- **Decrease to 200-300** if your content is very granular (e.g., Q&A pairs)

---

### **2. Chunk Overlap**
**What it is:** How many tokens overlap between consecutive chunks.

**Example:**
```
Chunk 1: [tokens 1-400]
Chunk 2: [tokens 321-720]  ← 80 tokens overlap with Chunk 1
Chunk 3: [tokens 641-1040] ← 80 tokens overlap with Chunk 2
```

**Why 80 (20% overlap) is optimal:**
- ✅ Prevents losing context at chunk boundaries
- ✅ Industry standard (10-20% overlap)
- ✅ Ensures important sentences aren't split awkwardly

**When to adjust:**
- **Increase to 100-150** if you're losing important context
- **Decrease to 40-60** if you have very distinct, separate topics

---

### **3. Embedding Model**
**What it is:** The AI model that converts text into vector embeddings.

**Available Models:**

| Model | Dimensions | Cost | Best For |
|-------|-----------|------|----------|
| **text-embedding-3-small** | 1536 | $0.02/1M tokens | ✅ **Default** - Best balance |
| text-embedding-3-large | 3072 | $0.13/1M tokens | Premium quality, higher cost |
| text-embedding-ada-002 | 1536 | $0.10/1M tokens | Legacy, not recommended |
| mistral-embed | 1024 | $0.10/1M tokens | Cost-effective alternative |
| voyage-3-lite | 512 | $0.10/1M tokens | High relevance, smaller size |
| voyage-3-large | 1024 | $0.12/1M tokens | Premium quality |

**Why text-embedding-3-small is optimal:**
- ✅ Best performance/cost ratio
- ✅ High quality results
- ✅ Fast processing
- ✅ Industry standard

**When to adjust:**
- **Use mistral-embed** if you want to save costs
- **Use voyage-3-lite** if you need better relevance
- **Use text-embedding-3-large** if quality is more important than cost

---

### **4. Top K Results**
**What it is:** How many of the most relevant chunks to retrieve when searching.

**Example:**
- **Top K = 10** → AI retrieves the 10 most relevant chunks
- **Top K = 5** → AI retrieves only the 5 most relevant chunks
- **Top K = 20** → AI retrieves 20 chunks (might include less relevant ones)

**Why 10 is optimal:**
- ✅ Industry standard (5-10 for most use cases)
- ✅ Enough context without overwhelming the LLM
- ✅ Good balance of precision and recall

**When to adjust:**
- **Decrease to 5** if you want only the most relevant results
- **Increase to 15-20** if you need more comprehensive context
- **Never go above 30** - diminishing returns and added noise

---

### **5. Similarity Threshold**
**What it is:** Minimum relevance score (0-1) for a chunk to be included in results.

**Example:**
- **Threshold = 0.7** → Only chunks with 70%+ similarity are returned
- **Threshold = 0.5** → Chunks with 50%+ similarity are returned (more results, less relevant)
- **Threshold = 0.9** → Only chunks with 90%+ similarity (very strict, might miss good results)

**Why 0.7 (70%) is optimal:**
- ✅ Industry standard for semantic search
- ✅ Filters out irrelevant results
- ✅ Still captures good matches

**When to adjust:**
- **Increase to 0.8** if you're getting too many irrelevant results
- **Decrease to 0.6** if you're missing important context
- **Never go below 0.5** - results become too noisy

---

## 🎯 **Industry Standards & Best Practices**

### **Current Implementation:**
✅ Chunk Size: 400 tokens (optimal)
✅ Chunk Overlap: 80 tokens (20% - industry standard)
✅ Embedding Model: text-embedding-3-small (best cost/performance)
✅ Top K Results: 10 (industry standard)
✅ Similarity Threshold: 0.7 (70% - industry standard)

### **Missing (Optional Enhancements):**
❌ **Max Context Tokens** - Limit total tokens sent to LLM (recommended: 4000-8000)
❌ **Reranking** - Re-rank results for better relevance (advanced feature)
❌ **Hybrid Search** - Combine semantic + keyword search (advanced feature)
❌ **Metadata Filtering** - Filter by archetype, category, etc. (nice to have)

---

## 📈 **When to Re-Process Content**

You should re-process your knowledge base content when:

1. **Changing Chunk Size or Overlap** - Affects how content is split
2. **Changing Embedding Model** - Different models create different embeddings
3. **Adding New Content** - New content needs to be embedded
4. **Updating Existing Content** - Modified content needs re-embedding

**Note:** Changing Top K or Similarity Threshold does NOT require re-processing!

---

## 🧪 **How to Test Your Settings**

1. **Add test content** to your knowledge base
2. **Process the content** with your current settings
3. **Run test queries** like:
   - "What are the core traits of this archetype?"
   - "How does this assessment work?"
   - "What are the key concepts?"
4. **Check similarity scores**:
   - **>0.8** = Excellent match
   - **0.7-0.8** = Good match
   - **0.6-0.7** = Acceptable match
   - **<0.6** = Poor match (consider adjusting settings)
5. **Verify retrieved content** is actually relevant

---

## 💡 **Optimization Tips**

### **For Assessments:**
- Use **400 chunk size** for general assessment content
- Use **80 overlap** to maintain context
- Start with **text-embedding-3-small**
- Test with **Top K = 10**

### **For Archetypes:**
- Use **400 chunk size** for archetype descriptions
- Use **80 overlap** for continuous narratives
- Consider **mistral-embed** for cost savings
- Test with **Top K = 10**

### **Cost Optimization:**
1. Start with **text-embedding-3-small** (cheapest, good quality)
2. Test with **mistral-embed** if you want to save more
3. Only upgrade to **text-embedding-3-large** if quality is critical

### **Quality Optimization:**
1. Start with defaults (400/80/text-embedding-3-small)
2. Test retrieval quality with real queries
3. If results are poor, try **voyage-3-lite** for better relevance
4. If still poor, increase chunk overlap to 100-150

---

## 🚀 **Quick Reference**

**Default Settings (Recommended):**
```
Chunk Size: 400
Chunk Overlap: 80
Embedding Model: text-embedding-3-small
Top K Results: 10
Similarity Threshold: 0.7
```

**Cost-Optimized Settings:**
```
Chunk Size: 400
Chunk Overlap: 60
Embedding Model: mistral-embed
Top K Results: 5
Similarity Threshold: 0.7
```

**Quality-Optimized Settings:**
```
Chunk Size: 600
Chunk Overlap: 120
Embedding Model: voyage-3-lite
Top K Results: 15
Similarity Threshold: 0.75
```

---

## 📚 **Further Reading**

- [OpenAI Embeddings Guide](https://platform.openai.com/docs/guides/embeddings)
- [Chunking Strategies](https://www.pinecone.io/learn/chunking-strategies/)
- [Semantic Search Best Practices](https://www.pinecone.io/learn/semantic-search/)

