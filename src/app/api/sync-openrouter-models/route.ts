import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      return NextResponse.json(
        { error: 'OpenRouter API key not configured' },
        { status: 500 }
      )
    }

    console.log('[sync-openrouter-models] Fetching latest models from OpenRouter...')

    // Fetch latest models from OpenRouter
    const response = await fetch('https://openrouter.ai/api/v1/models', {
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
      },
    })

    if (!response.ok) {
      throw new Error(`OpenRouter API error: ${response.statusText}`)
    }

    const data = await response.json()
    
    if (!data.data || !Array.isArray(data.data)) {
      throw new Error('Invalid response format from OpenRouter')
    }

    console.log(`[sync-openrouter-models] Found ${data.data.length} models from OpenRouter`)

    // Major companies to include (curated list for quality and reliability)
    const majorCompanies = [
      'openai',           // GPT-4, GPT-3.5
      'anthropic',        // Claude 3.5, Claude 3
      'google',           // Gemini
      'meta',             // Llama
      'mistral',          // Mistral
      'perplexity',       // Sonar
      'qwen',             // Qwen
      'cohere',           // Command
      'together',         // Together AI models
      'deepseek',         // DeepSeek
      'nvidia',           // Nemotron
      'aleph-alpha',      // Luminous
      'jina',             // Jina models
      'nousresearch',     // Nous models
      'teknium',          // OpenHermes
      'gryphe',           // MythoMax
      'undi95',           // ReMM
      'cognitivecomputations', // Dolphin
      'lizpreciatior',    // Lzlm
      'xwin-lm',          // Xwin-LM
    ]

    // Transform and filter models - only from major companies
    const models = data.data
      .filter((model: any) => {
        // Check if model is from a major company
        const modelId = model.id?.toLowerCase() || ''
        const isFromMajorCompany = majorCompanies.some(company =>
          modelId.startsWith(company.toLowerCase() + '/')
        )

        // Exclude deprecated models
        const isDeprecated = model.name?.includes('deprecated') || modelId.includes('deprecated')

        return isFromMajorCompany && !isDeprecated && model.id
      })
      .map((model: any) => ({
        id: model.id,
        name: model.name,
        pricing: {
          prompt: parseFloat(model.pricing?.prompt || 0),
          completion: parseFloat(model.pricing?.completion || 0),
        },
        contextLength: model.context_length || 4096,
        description: model.description || '',
        createdAt: model.created_at,
        modifiedAt: model.modified_at,
      }))

    // Log some sample models for debugging
    console.log('[sync-openrouter-models] Sample models:', models.slice(0, 5).map(m => m.id))

    // Store in Supabase for reference
    const supabase = createServiceClient()
    
    // Create or update the openrouter_models_cache table
    const { error: upsertError } = await supabase
      .from('openrouter_models_cache')
      .upsert({
        id: 'latest',
        models: models,
        last_synced: new Date().toISOString(),
        model_count: models.length
      }, {
        onConflict: 'id'
      })

    if (upsertError) {
      console.error('[sync-openrouter-models] Error storing models:', upsertError)
      // Don't fail - we can still return the models
    }

    console.log(`[sync-openrouter-models] Successfully synced ${models.length} models`)

    return NextResponse.json({
      success: true,
      modelCount: models.length,
      models: models,
      lastSynced: new Date().toISOString(),
      message: `Successfully synced ${models.length} models from OpenRouter`
    })

  } catch (error) {
    console.error('[sync-openrouter-models] Error:', error)
    return NextResponse.json(
      { 
        error: 'Failed to sync OpenRouter models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

export async function POST() {
  // POST also triggers a sync (same as GET)
  return GET()
}

