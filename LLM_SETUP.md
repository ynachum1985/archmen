# Multi-LLM Setup Guide

## 🤖 **Available LLM Providers**

Your ArchMen application now supports multiple LLM providers for testing and production use. Here's how to set them up:

## 🔑 **Environment Variables**

Add these to your `.env.local` file:

```bash
# OpenAI (Currently Active)
OPENAI_API_KEY=your_openai_api_key_here
NEXT_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here

# Anthropic Claude (Optional)
ANTHROPIC_API_KEY=your_anthropic_api_key_here

# Kimi AI (Optional - Cheaper Alternative)
KIMI_API_KEY=your_kimi_api_key_here

# Local Ollama (Optional - Free)
# No API key needed, just install Ollama locally
```

## 💰 **Cost Comparison**

### **OpenAI** (Currently Used)
- **GPT-4 Turbo**: $0.01 input / $0.03 output per 1K tokens
- **GPT-3.5 Turbo**: $0.0015 input / $0.002 output per 1K tokens
- **Embeddings**: $0.00002 per 1K tokens (very cheap!)

### **Anthropic Claude** (High Quality)
- **Claude 3.5 Sonnet**: $0.003 input / $0.015 output per 1K tokens (50% cheaper than GPT-4!)
- **Claude 3 Haiku**: $0.00025 input / $0.00125 output per 1K tokens (very cheap!)

### **Kimi AI** (Your Friend's Suggestion - Cheapest)
- **Moonshot v1-8k**: $0.0012 per 1K tokens (both input/output)
- **Moonshot v1-32k**: $0.0024 per 1K tokens
- **Moonshot v1-128k**: $0.0060 per 1K tokens

### **Local Ollama** (Free)
- **Llama 3.1**: Free (runs on your computer)
- **Mistral**: Free (runs on your computer)

## 🚀 **How to Test Different LLMs**

1. **Go to Admin Panel** → Builder Tab → Testing Tab
2. **Choose "LLM Testing"** subtab
3. **Select Provider & Model** from dropdowns
4. **Adjust Temperature** (0.0 = deterministic, 1.0 = creative)
5. **Test Single Model** or **Compare All Models**
6. **View Results** with cost and performance metrics

## 📊 **Real-World Cost Examples**

### **For Your Polyamory Assessment:**
- **Per Assessment** (10-15 questions): $0.10-0.50 with GPT-4, $0.05-0.25 with Claude
- **Per Chat Session**: $0.02-0.10 depending on length
- **Embedding "The Ethical Slut"**: ~$0.004 (one-time cost)

### **Monthly Estimates** (100 users):
- **OpenAI GPT-4**: ~$50-100/month
- **Claude 3.5 Sonnet**: ~$25-50/month  
- **Kimi AI**: ~$15-30/month
- **Local Ollama**: $0 (but requires powerful computer)

## 🔧 **Setup Instructions**

### **1. Anthropic Claude (Recommended)**
```bash
# Get API key from: https://console.anthropic.com/
ANTHROPIC_API_KEY=sk-ant-api03-...
```

### **2. Kimi AI (Cheapest)**
```bash
# Get API key from: https://platform.moonshot.cn/
KIMI_API_KEY=sk-...
```

### **3. Local Ollama (Free)**
```bash
# Install Ollama: https://ollama.ai/
# Then run: ollama pull llama3.1:8b
# No API key needed
```

## 🎯 **Recommendations**

### **For Development/Testing:**
- Use **Claude 3 Haiku** (cheapest, fast)
- Or **Local Ollama** (free, private)

### **For Production:**
- **Claude 3.5 Sonnet** (best quality/price ratio)
- **Kimi AI** (cheapest cloud option)
- **GPT-4 Turbo** (current, reliable)

### **For Embeddings:**
- Stick with **OpenAI text-embedding-3-small** (very cheap, excellent quality)

## 🔄 **Migration Strategy**

1. **Phase 1**: Test different models in the admin panel
2. **Phase 2**: Choose best model for your use case
3. **Phase 3**: Update production configuration
4. **Phase 4**: Monitor costs and quality

## 🛠 **Infrastructure Status**

✅ **Multi-LLM Service** - Complete  
✅ **Testing Interface** - Complete  
✅ **Cost Tracking** - Complete  
✅ **Provider Comparison** - Complete  
✅ **Environment Setup** - Ready  

Your app is now ready to test and use multiple LLM providers! 🎉
