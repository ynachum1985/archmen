import { NextResponse } from 'next/server'
import { LLM_PROVIDERS, type LLMProvider } from '@/lib/services/multi-llm.service'

export async function GET() {
  try {
    // Check which providers have API keys configured
    const availableProviders: LLMProvider[] = []
    
    // OpenAI
    if (process.env.OPENAI_API_KEY) {
      availableProviders.push('openai')
    }
    
    // Anthropic
    if (process.env.ANTHROPIC_API_KEY) {
      availableProviders.push('anthropic')
    }
    
    // Kimi AI
    if (process.env.KIMI_API_KEY) {
      availableProviders.push('kimi')
    }
    
    // Groq
    if (process.env.GROQ_API_KEY) {
      availableProviders.push('groq')
    }
    
    // Perplexity
    if (process.env.PERPLEXITY_API_KEY) {
      availableProviders.push('perplexity')
    }
    
    // Together AI
    if (process.env.TOGETHER_API_KEY) {
      availableProviders.push('together')
    }
    
    // Local is always available
    availableProviders.push('local')
    
    // Return providers with their configurations
    const providersWithModels = availableProviders.map(provider => ({
      id: provider,
      name: LLM_PROVIDERS[provider].name,
      models: Object.keys(LLM_PROVIDERS[provider].models)
    }))
    
    return NextResponse.json({
      providers: availableProviders,
      providersWithModels
    })
    
  } catch (error) {
    console.error('Error getting LLM providers:', error)
    return NextResponse.json(
      { error: 'Failed to get LLM providers' },
      { status: 500 }
    )
  }
}
