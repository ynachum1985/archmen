import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// Generate embedding using the appropriate provider
async function generateEmbedding(text: string, model: string): Promise<number[]> {
  // Handle OpenRouter models
  if (model.startsWith('openrouter/')) {
    if (!process.env.OPENROUTER_API_KEY) {
      throw new Error('OpenRouter API key not configured')
    }

    let actualModel = model.replace('openrouter/', '')

    // Map common embedding model names to OpenRouter format
    const modelMapping: Record<string, string> = {
      'mistral-embed': 'mistralai/mistral-embed',
      'voyage-3-lite': 'voyage-ai/voyage-3-lite',
      'voyage-3-large': 'voyage-ai/voyage-3-large',
      'text-embedding-3-small': 'openai/text-embedding-3-small',
      'text-embedding-3-large': 'openai/text-embedding-3-large'
    }

    actualModel = modelMapping[actualModel] || actualModel

    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': process.env.NEXT_PUBLIC_SITE_URL || 'https://archmen.vercel.app',
        'X-Title': 'ArchMen Assessment Platform'
      },
      body: JSON.stringify({
        model: actualModel,
        input: text
      })
    })

    if (!response.ok) {
      const error = await response.json()
      throw new Error(`OpenRouter API error: ${error.error?.message || response.statusText}`)
    }

    const data = await response.json()
    if (!data.data || !data.data[0] || !data.data[0].embedding) {
      throw new Error('Invalid embedding response from OpenRouter')
    }

    return data.data[0].embedding
  }

  // Handle OpenAI models
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }

  const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })

  const embeddingResponse = await openai.embeddings.create({
    model: model.startsWith('text-embedding') ? model : 'text-embedding-3-small',
    input: text,
  })

  return embeddingResponse.data[0].embedding
}

export async function POST(request: NextRequest) {
  try {
    const { query, archetypeId } = await request.json()

    if (!query || !archetypeId) {
      return NextResponse.json({ error: 'Query and archetypeId are required' }, { status: 400 })
    }

    // Use service client for admin operations (archetype embedding testing)
    const supabase = createServiceClient()

    // Get the embedding model from the archetype settings or use default
    const { data: settings } = await supabase
      .from('archetype_embedding_settings')
      .select('embedding_model')
      .eq('archetype_id', archetypeId)
      .single()

    const embeddingModel = settings?.embedding_model || 'openrouter/mistral-embed'

    // Generate embedding for the query using the configured model
    const queryEmbedding = await generateEmbedding(query, embeddingModel)

    // Search for similar content chunks
    const { data: chunks, error } = await supabase.rpc('search_archetype_content', {
      query_embedding: queryEmbedding,
      archetype_id_param: archetypeId,
      match_threshold: 0.1, // Lower threshold to get more results for testing
      match_count: 5
    })

    if (error) {
      console.error('Error searching content:', error)
      return NextResponse.json({ error: 'Failed to search content' }, { status: 500 })
    }

    // Format results for display
    const results = chunks?.map((chunk: any) => ({
      content: chunk.content,
      similarity: chunk.similarity
    })) || []

    return NextResponse.json({
      success: true,
      results,
      query
    })

  } catch (error) {
    console.error('Error in test archetype embedding API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
