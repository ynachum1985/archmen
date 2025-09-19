import OpenAI from 'openai'
import Anthropic from '@anthropic-ai/sdk'

// LLM Provider Types
export type LLMProvider = 'openrouter' | 'openai' | 'anthropic' | 'kimi' | 'groq' | 'perplexity' | 'together' | 'local'

export interface LLMConfig {
  provider: LLMProvider
  model: string
  temperature: number
  maxTokens: number
  apiKey?: string
  baseURL?: string
}

export interface ChatMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
}

export interface LLMResponse {
  content: string
  usage?: {
    inputTokens: number
    outputTokens: number
    totalTokens: number
  }
  cost?: number
  provider: LLMProvider
  model: string
}

export interface EmbeddingResponse {
  embedding: number[]
  usage?: {
    tokens: number
  }
  cost?: number
  provider: LLMProvider
  model: string
}

// Provider configurations with pricing
export const LLM_PROVIDERS = {
  openrouter: {
    name: 'OpenRouter',
    models: {
      // OpenAI models via OpenRouter (often cheaper)
      'openai/gpt-4-turbo': { inputCost: 0.01, outputCost: 0.03 },
      'openai/gpt-4': { inputCost: 0.03, outputCost: 0.06 },
      'openai/gpt-3.5-turbo': { inputCost: 0.0015, outputCost: 0.002 },
      // Anthropic models via OpenRouter
      'anthropic/claude-3.5-sonnet': { inputCost: 0.003, outputCost: 0.015 },
      'anthropic/claude-3-haiku': { inputCost: 0.00025, outputCost: 0.00125 },
      // Google models
      'google/gemini-pro-1.5': { inputCost: 0.00125, outputCost: 0.005 },
      'google/gemini-flash-1.5': { inputCost: 0.000075, outputCost: 0.0003 },
      // Meta models
      'meta-llama/llama-3.1-405b-instruct': { inputCost: 0.003, outputCost: 0.003 },
      'meta-llama/llama-3.1-70b-instruct': { inputCost: 0.00088, outputCost: 0.00088 },
      'meta-llama/llama-3.1-8b-instruct': { inputCost: 0.00018, outputCost: 0.00018 },
      // Mistral models
      'mistralai/mistral-large': { inputCost: 0.004, outputCost: 0.012 },
      'mistralai/mistral-medium': { inputCost: 0.0027, outputCost: 0.0081 },
      // Kimi AI models via OpenRouter
      'deepseek/deepseek-chat': { inputCost: 0.00014, outputCost: 0.00028 },
      'deepseek/deepseek-coder': { inputCost: 0.00014, outputCost: 0.00028 },
      // DeepSeek models via OpenRouter (very affordable)
      'moonshot/moonshot-v1-8k': { inputCost: 0.0012, outputCost: 0.0012 },
      'moonshot/moonshot-v1-32k': { inputCost: 0.0024, outputCost: 0.0024 },
      'moonshot/moonshot-v1-128k': { inputCost: 0.0060, outputCost: 0.0060 },
      // Perplexity models with web search
      'perplexity/llama-3.1-sonar-large-128k-online': { inputCost: 0.001, outputCost: 0.001 },
      // Qwen models
      'qwen/qwen-2.5-72b-instruct': { inputCost: 0.0009, outputCost: 0.0009 }
    }
  },
  openai: {
    name: 'OpenAI',
    models: {
      'gpt-4-turbo-preview': { inputCost: 0.01, outputCost: 0.03 },
      'gpt-4': { inputCost: 0.03, outputCost: 0.06 },
      'gpt-3.5-turbo': { inputCost: 0.0015, outputCost: 0.002 },
    },
    embeddings: {
      'text-embedding-3-small': { cost: 0.00002 },
      'text-embedding-3-large': { cost: 0.00013 },
      'text-embedding-ada-002': { cost: 0.0001 }
    }
  },
  anthropic: {
    name: 'Anthropic',
    models: {
      'claude-3-5-sonnet-20241022': { inputCost: 0.003, outputCost: 0.015 },
      'claude-3-5-haiku-20241022': { inputCost: 0.001, outputCost: 0.005 },
      'claude-3-opus-20240229': { inputCost: 0.015, outputCost: 0.075 },
      'claude-3-sonnet-20240229': { inputCost: 0.003, outputCost: 0.015 },
      'claude-3-haiku-20240307': { inputCost: 0.00025, outputCost: 0.00125 },
      'claude-2.1': { inputCost: 0.008, outputCost: 0.024 },
      'claude-2.0': { inputCost: 0.008, outputCost: 0.024 },
      'claude-instant-1.2': { inputCost: 0.0008, outputCost: 0.0024 }
    }
  },
  kimi: {
    name: 'Kimi AI (Moonshot)',
    models: {
      'moonshot-v1-8k': { inputCost: 0.0012, outputCost: 0.0012 },
      'moonshot-v1-32k': { inputCost: 0.0024, outputCost: 0.0024 },
      'moonshot-v1-128k': { inputCost: 0.0060, outputCost: 0.0060 }
    }
  },
  groq: {
    name: 'Groq',
    models: {
      'llama-3.1-405b-reasoning': { inputCost: 0.00059, outputCost: 0.00079 },
      'llama-3.1-70b-versatile': { inputCost: 0.00059, outputCost: 0.00079 },
      'llama-3.1-8b-instant': { inputCost: 0.00005, outputCost: 0.00008 },
      'mixtral-8x7b-32768': { inputCost: 0.00024, outputCost: 0.00024 },
      'gemma2-9b-it': { inputCost: 0.00020, outputCost: 0.00020 }
    }
  },
  perplexity: {
    name: 'Perplexity',
    models: {
      'llama-3.1-sonar-small-128k-online': { inputCost: 0.0002, outputCost: 0.0002 },
      'llama-3.1-sonar-large-128k-online': { inputCost: 0.001, outputCost: 0.001 },
      'llama-3.1-8b-instruct': { inputCost: 0.0002, outputCost: 0.0002 },
      'llama-3.1-70b-instruct': { inputCost: 0.001, outputCost: 0.001 }
    }
  },
  together: {
    name: 'Together AI',
    models: {
      'meta-llama/Meta-Llama-3.1-8B-Instruct-Turbo': { inputCost: 0.00018, outputCost: 0.00018 },
      'meta-llama/Meta-Llama-3.1-70B-Instruct-Turbo': { inputCost: 0.00088, outputCost: 0.00088 },
      'meta-llama/Meta-Llama-3.1-405B-Instruct-Turbo': { inputCost: 0.005, outputCost: 0.005 },
      'mistralai/Mixtral-8x7B-Instruct-v0.1': { inputCost: 0.0006, outputCost: 0.0006 }
    }
  },
  local: {
    name: 'Local (Ollama)',
    models: {
      'llama3.1:8b': { inputCost: 0, outputCost: 0 },
      'llama3.1:70b': { inputCost: 0, outputCost: 0 },
      'llama3.2:3b': { inputCost: 0, outputCost: 0 },
      'qwen2.5:7b': { inputCost: 0, outputCost: 0 },
      'mistral:7b': { inputCost: 0, outputCost: 0 },
      'codellama:7b': { inputCost: 0, outputCost: 0 }
    }
  }
} as const

export class MultiLLMService {
  private openaiClient: OpenAI | null = null
  private anthropicClient: Anthropic | null = null
  private kimiClient: OpenAI | null = null
  private groqClient: OpenAI | null = null
  private perplexityClient: OpenAI | null = null
  private togetherClient: OpenAI | null = null
  private openrouterClient: OpenAI | null = null

  constructor() {
    // Initialize clients based on available API keys
    if (process.env.OPENAI_API_KEY) {
      this.openaiClient = new OpenAI({
        apiKey: process.env.OPENAI_API_KEY
      })
    }

    if (process.env.ANTHROPIC_API_KEY) {
      this.anthropicClient = new Anthropic({
        apiKey: process.env.ANTHROPIC_API_KEY
      })
    }

    // Kimi AI (Moonshot) - OpenAI-compatible API
    if (process.env.KIMI_API_KEY) {
      this.kimiClient = new OpenAI({
        apiKey: process.env.KIMI_API_KEY,
        baseURL: 'https://api.moonshot.cn/v1'
      })
    }

    // Groq - OpenAI-compatible API
    if (process.env.GROQ_API_KEY) {
      this.groqClient = new OpenAI({
        apiKey: process.env.GROQ_API_KEY,
        baseURL: 'https://api.groq.com/openai/v1'
      })
    }

    // Perplexity - OpenAI-compatible API
    if (process.env.PERPLEXITY_API_KEY) {
      this.perplexityClient = new OpenAI({
        apiKey: process.env.PERPLEXITY_API_KEY,
        baseURL: 'https://api.perplexity.ai'
      })
    }

    // Together AI - OpenAI-compatible API
    if (process.env.TOGETHER_API_KEY) {
      this.togetherClient = new OpenAI({
        apiKey: process.env.TOGETHER_API_KEY,
        baseURL: 'https://api.together.xyz/v1'
      })
    }

    // OpenRouter - OpenAI-compatible API with access to many providers
    if (process.env.OPENROUTER_API_KEY) {
      this.openrouterClient = new OpenAI({
        apiKey: process.env.OPENROUTER_API_KEY,
        baseURL: 'https://openrouter.ai/api/v1'
      })
    }
  }

  async generateChatCompletion(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    switch (config.provider) {
      case 'openai':
        return this.generateOpenAICompletion(messages, config)
      case 'anthropic':
        return this.generateAnthropicCompletion(messages, config)
      case 'kimi':
        return this.generateKimiCompletion(messages, config)
      case 'groq':
        return this.generateGroqCompletion(messages, config)
      case 'perplexity':
        return this.generatePerplexityCompletion(messages, config)
      case 'together':
        return this.generateTogetherCompletion(messages, config)
      case 'openrouter':
        return this.generateOpenRouterCompletion(messages, config)
      case 'local':
        return this.generateLocalCompletion(messages, config)
      default:
        throw new Error(`Unsupported provider: ${config.provider}`)
    }
  }

  async generateEmbedding(
    text: string,
    config: { provider: LLMProvider; model: string }
  ): Promise<EmbeddingResponse> {
    switch (config.provider) {
      case 'openai':
        return this.generateOpenAIEmbedding(text, config.model)
      default:
        throw new Error(`Embedding not supported for provider: ${config.provider}`)
    }
  }

  private async generateOpenAICompletion(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized')
    }

    const completion = await this.openaiClient.chat.completions.create({
      model: config.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })

    const usage = completion.usage
    const modelPricing = LLM_PROVIDERS.openai.models[config.model as keyof typeof LLM_PROVIDERS.openai.models]
    const cost = usage && modelPricing 
      ? (usage.prompt_tokens * modelPricing.inputCost + usage.completion_tokens * modelPricing.outputCost) / 1000
      : undefined

    return {
      content: completion.choices[0]?.message?.content || '',
      usage: usage ? {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      } : undefined,
      cost,
      provider: 'openai',
      model: config.model
    }
  }

  private async generateAnthropicCompletion(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    if (!this.anthropicClient) {
      throw new Error('Anthropic client not initialized')
    }

    // Convert messages format for Anthropic Messages API
    const systemMessage = messages.find(m => m.role === 'system')
    const conversationMessages = messages.filter(m => m.role !== 'system')

    // Use the modern Messages API format
    const completion = await this.anthropicClient.messages.create({
      model: config.model,
      max_tokens: config.maxTokens,
      temperature: config.temperature,
      system: systemMessage?.content,
      messages: conversationMessages.map(msg => ({
        role: msg.role === 'assistant' ? 'assistant' : 'user',
        content: msg.content
      }))
    })

    const usage = completion.usage
    const modelPricing = LLM_PROVIDERS.anthropic.models[config.model as keyof typeof LLM_PROVIDERS.anthropic.models]
    const cost = usage && modelPricing
      ? ((usage.input_tokens * modelPricing.inputCost) + (usage.output_tokens * modelPricing.outputCost)) / 1000
      : undefined

    return {
      content: completion.content[0]?.type === 'text' ? completion.content[0].text : '',
      usage: usage ? {
        inputTokens: usage.input_tokens,
        outputTokens: usage.output_tokens,
        totalTokens: usage.input_tokens + usage.output_tokens
      } : undefined,
      cost,
      provider: 'anthropic',
      model: config.model
    }
  }

  private async generateKimiCompletion(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    // Kimi AI uses OpenAI-compatible API
    if (!process.env.KIMI_API_KEY && !config.apiKey) {
      throw new Error('Kimi API key not configured')
    }

    const kimiClient = new OpenAI({
      apiKey: process.env.KIMI_API_KEY || config.apiKey,
      baseURL: 'https://api.moonshot.cn/v1'
    })

    console.log('Kimi API call with model:', config.model)
    const completion = await kimiClient.chat.completions.create({
      model: config.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })
    console.log('Kimi API response received')

    const usage = completion.usage
    const modelPricing = LLM_PROVIDERS.kimi.models[config.model as keyof typeof LLM_PROVIDERS.kimi.models]
    const cost = usage && modelPricing
      ? ((usage.prompt_tokens * modelPricing.inputCost) + (usage.completion_tokens * modelPricing.outputCost)) / 1000
      : undefined

    return {
      content: completion.choices[0]?.message?.content || '',
      usage: usage ? {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      } : undefined,
      cost,
      provider: 'kimi',
      model: config.model
    }
  }

  private async generateGroqCompletion(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    if (!this.groqClient) {
      throw new Error('Groq API key not configured')
    }

    const completion = await this.groqClient.chat.completions.create({
      model: config.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })

    const usage = completion.usage
    const modelPricing = LLM_PROVIDERS.groq.models[config.model as keyof typeof LLM_PROVIDERS.groq.models]
    const cost = usage && modelPricing
      ? ((usage.prompt_tokens * modelPricing.inputCost) + (usage.completion_tokens * modelPricing.outputCost)) / 1000
      : undefined

    return {
      content: completion.choices[0]?.message?.content || '',
      usage: usage ? {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      } : undefined,
      cost,
      provider: 'groq',
      model: config.model
    }
  }

  private async generatePerplexityCompletion(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    if (!this.perplexityClient) {
      throw new Error('Perplexity API key not configured')
    }

    const completion = await this.perplexityClient.chat.completions.create({
      model: config.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })

    const usage = completion.usage
    const modelPricing = LLM_PROVIDERS.perplexity.models[config.model as keyof typeof LLM_PROVIDERS.perplexity.models]
    const cost = usage && modelPricing
      ? ((usage.prompt_tokens * modelPricing.inputCost) + (usage.completion_tokens * modelPricing.outputCost)) / 1000
      : undefined

    return {
      content: completion.choices[0]?.message?.content || '',
      usage: usage ? {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      } : undefined,
      cost,
      provider: 'perplexity',
      model: config.model
    }
  }

  private async generateTogetherCompletion(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    if (!this.togetherClient) {
      throw new Error('Together AI API key not configured')
    }

    const completion = await this.togetherClient.chat.completions.create({
      model: config.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: config.temperature,
      max_tokens: config.maxTokens
    })

    const usage = completion.usage
    const modelPricing = LLM_PROVIDERS.together.models[config.model as keyof typeof LLM_PROVIDERS.together.models]
    const cost = usage && modelPricing
      ? ((usage.prompt_tokens * modelPricing.inputCost) + (usage.completion_tokens * modelPricing.outputCost)) / 1000
      : undefined

    return {
      content: completion.choices[0]?.message?.content || '',
      usage: usage ? {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      } : undefined,
      cost,
      provider: 'together',
      model: config.model
    }
  }

  private async generateOpenRouterCompletion(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    if (!this.openrouterClient) {
      throw new Error('OpenRouter API key not configured')
    }

    console.log('OpenRouter API call:', {
      model: config.model,
      messagesCount: messages.length,
      temperature: config.temperature,
      maxTokens: config.maxTokens
    })

    const completion = await this.openrouterClient.chat.completions.create({
      model: config.model,
      messages: messages as OpenAI.Chat.Completions.ChatCompletionMessageParam[],
      temperature: config.temperature,
      max_tokens: config.maxTokens,
      // OpenRouter specific headers
      headers: {
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://archmen.vercel.app',
        'X-Title': 'ArchMen Assessment Platform'
      }
    })

    const usage = completion.usage
    const modelPricing = LLM_PROVIDERS.openrouter.models[config.model as keyof typeof LLM_PROVIDERS.openrouter.models]
    const cost = usage && modelPricing
      ? ((usage.prompt_tokens * modelPricing.inputCost) + (usage.completion_tokens * modelPricing.outputCost)) / 1000
      : undefined

    return {
      content: completion.choices[0]?.message?.content || '',
      usage: usage ? {
        inputTokens: usage.prompt_tokens,
        outputTokens: usage.completion_tokens,
        totalTokens: usage.total_tokens
      } : undefined,
      cost,
      provider: 'openrouter',
      model: config.model
    }
  }

  private async generateLocalCompletion(
    messages: ChatMessage[],
    config: LLMConfig
  ): Promise<LLMResponse> {
    // Ollama local API
    const response = await fetch(`${config.baseURL || 'http://localhost:11434'}/api/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: config.model,
        messages,
        stream: false,
        options: {
          temperature: config.temperature,
          num_predict: config.maxTokens
        }
      })
    })

    const data = await response.json()
    
    return {
      content: data.message?.content || '',
      usage: {
        inputTokens: data.prompt_eval_count || 0,
        outputTokens: data.eval_count || 0,
        totalTokens: (data.prompt_eval_count || 0) + (data.eval_count || 0)
      },
      cost: 0, // Local models are free
      provider: 'local',
      model: config.model
    }
  }

  private async generateOpenAIEmbedding(
    text: string,
    model: string
  ): Promise<EmbeddingResponse> {
    if (!this.openaiClient) {
      throw new Error('OpenAI client not initialized')
    }

    const response = await this.openaiClient.embeddings.create({
      model,
      input: text.substring(0, 8000) // Limit input length
    })

    const usage = response.usage
    const modelPricing = LLM_PROVIDERS.openai.embeddings[model as keyof typeof LLM_PROVIDERS.openai.embeddings]
    const cost = usage && modelPricing 
      ? (usage.total_tokens * modelPricing.cost) / 1000
      : undefined

    return {
      embedding: response.data[0].embedding,
      usage: usage ? { tokens: usage.total_tokens } : undefined,
      cost,
      provider: 'openai',
      model
    }
  }

  // Utility methods
  getAvailableProviders(): LLMProvider[] {
    const providers: LLMProvider[] = []
    if (this.openrouterClient) providers.push('openrouter') // First priority
    if (this.openaiClient) providers.push('openai')
    if (this.anthropicClient) providers.push('anthropic')
    if (this.kimiClient) providers.push('kimi')
    if (this.groqClient) providers.push('groq')
    if (this.perplexityClient) providers.push('perplexity')
    if (this.togetherClient) providers.push('together')
    providers.push('local') // Always available if Ollama is running
    return providers
  }

  getProviderModels(provider: LLMProvider): string[] {
    return Object.keys(LLM_PROVIDERS[provider].models)
  }

  estimateCost(provider: LLMProvider, model: string, inputTokens: number, outputTokens: number): number {
    const providerConfig = LLM_PROVIDERS[provider]
    const modelConfig = providerConfig.models[model as keyof typeof providerConfig.models]
    
    if (!modelConfig) return 0
    
    if ('inputCost' in modelConfig && 'outputCost' in modelConfig) {
      return (inputTokens * modelConfig.inputCost + outputTokens * modelConfig.outputCost) / 1000
    } else if ('inputCost' in modelConfig) {
      return ((inputTokens + outputTokens) * modelConfig.inputCost) / 1000
    }
    
    return 0
  }
}

// Singleton instance
let multiLLMServiceInstance: MultiLLMService | null = null

export const multiLLMService = {
  getInstance: () => {
    if (!multiLLMServiceInstance) {
      multiLLMServiceInstance = new MultiLLMService()
    }
    return multiLLMServiceInstance
  }
}
