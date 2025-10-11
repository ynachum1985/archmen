// Supabase Edge Function for processing archetype embeddings
// This runs on Supabase infrastructure with no timeout limits

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Text chunking function - OPTIMIZED DEFAULTS (see EMBEDDING_CONFIGURATION_ANALYSIS.md)
function chunkText(text: string, chunkSize: number = 400, overlap: number = 80) {
  const chunks = []
  let start = 0
  let index = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunk = text.slice(start, end)
    
    chunks.push({
      text: chunk,
      index: index,
      size: chunk.length,
      overlap: start > 0 ? overlap : 0
    })
    
    start = end - overlap
    index++
  }

  return chunks
}

// Generate embedding using OpenAI with timeout
async function generateEmbedding(text: string, apiKey: string, model: string = 'text-embedding-3-small') {
  console.log(`Calling OpenAI API for embedding (model: ${model}, text length: ${text.length})`)

  // Create abort controller for timeout
  const controller = new AbortController()
  const timeoutId = setTimeout(() => controller.abort(), 30000) // 30 second timeout

  try {
    const response = await fetch('https://api.openai.com/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: model,
        input: text,
      }),
      signal: controller.signal,
    })

    clearTimeout(timeoutId)

    if (!response.ok) {
      const error = await response.text()
      console.error(`OpenAI API error (${response.status}):`, error)
      throw new Error(`OpenAI API error (${response.status}): ${error}`)
    }

    const data = await response.json()
    console.log(`Successfully generated embedding (dimension: ${data.data[0].embedding.length})`)
    return data.data[0].embedding
  } catch (error) {
    clearTimeout(timeoutId)
    if (error.name === 'AbortError') {
      throw new Error('OpenAI API request timed out after 30 seconds')
    }
    throw error
  }
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { archetypeId, textContent, settings = {} } = await req.json()

    console.log('Processing archetype embedding:', { archetypeId, contentLength: textContent?.length })

    // Validate input
    if (!archetypeId || !textContent) {
      return new Response(
        JSON.stringify({ error: 'archetypeId and textContent are required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get environment variables
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const openaiApiKey = Deno.env.get('OPENAI_API_KEY')!

    console.log('Environment check:', {
      hasSupabaseUrl: !!supabaseUrl,
      hasServiceKey: !!supabaseServiceKey,
      hasOpenAIKey: !!openaiApiKey
    })

    // Helper function for Supabase REST API calls (lighter than client library)
    const supabaseRequest = async (path: string, options: RequestInit = {}) => {
      const response = await fetch(`${supabaseUrl}/rest/v1/${path}`, {
        ...options,
        headers: {
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`,
          'Content-Type': 'application/json',
          'Prefer': 'return=representation',
          ...options.headers,
        },
      })

      if (!response.ok) {
        const error = await response.text()
        throw new Error(`Supabase API error: ${error}`)
      }

      return response.json()
    }

    // Verify archetype exists using REST API
    const archetypes = await supabaseRequest(
      `enhanced_archetypes?id=eq.${archetypeId}&select=id,name`
    )

    if (!archetypes || archetypes.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Archetype not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const archetype = archetypes[0]
    console.log(`Found archetype: ${archetype.name}`)

    // Save embedding settings - OPTIMIZED DEFAULTS
    const chunkSize = settings.chunkSize || 400  // Optimal: 300-500 tokens
    const chunkOverlap = settings.chunkOverlap || 80  // 20% overlap
    const embeddingModel = settings.embeddingModel || 'text-embedding-3-small'

    // Save embedding settings using REST API (upsert)
    const settingsData = {
      archetype_id: archetypeId,
      chunk_size: chunkSize,
      chunk_overlap: chunkOverlap,
      embedding_model: embeddingModel,
      context_window: settings.contextWindow || 4000,
      semantic_search_enabled: settings.semanticSearchEnabled ?? true,
      updated_at: new Date().toISOString()
    }

    // Try to update first, if no rows affected then insert
    const updateResponse = await fetch(`${supabaseUrl}/rest/v1/archetype_embedding_settings?archetype_id=eq.${archetypeId}`, {
      method: 'PATCH',
      headers: {
        'apikey': supabaseServiceKey,
        'Authorization': `Bearer ${supabaseServiceKey}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal'
      },
      body: JSON.stringify(settingsData)
    })

    // If update didn't affect any rows, insert
    if (updateResponse.status === 200 && updateResponse.headers.get('content-range') === '*/0') {
      await supabaseRequest('archetype_embedding_settings', {
        method: 'POST',
        body: JSON.stringify(settingsData)
      })
    }

    // Delete existing chunks using REST API
    await supabaseRequest(`archetype_content_chunks?archetype_id=eq.${archetypeId}`, {
      method: 'DELETE'
    })

    // Chunk the content
    const chunks = chunkText(textContent, chunkSize, chunkOverlap)
    console.log(`Created ${chunks.length} chunks from ${textContent.length} characters`)

    // Safety check: Limit to 100 chunks to prevent runaway processing
    if (chunks.length > 100) {
      console.warn(`Too many chunks (${chunks.length}), limiting to 100`)
      chunks.length = 100
    }

    // Process chunks in batches to avoid memory limits
    const BATCH_SIZE = 10  // Process and save 10 chunks at a time
    let totalSaved = 0

    for (let batchStart = 0; batchStart < chunks.length; batchStart += BATCH_SIZE) {
      const batchEnd = Math.min(batchStart + BATCH_SIZE, chunks.length)
      const batchChunks = chunks.slice(batchStart, batchEnd)

      console.log(`Processing batch ${Math.floor(batchStart / BATCH_SIZE) + 1}/${Math.ceil(chunks.length / BATCH_SIZE)} (chunks ${batchStart + 1}-${batchEnd})`)

      const processedChunks = []

      for (let i = 0; i < batchChunks.length; i++) {
        const chunk = batchChunks[i]
        const globalIdx = batchStart + i
        console.log(`Processing chunk ${globalIdx + 1}/${chunks.length}`)

        try {
          const embedding = await generateEmbedding(chunk.text, openaiApiKey, embeddingModel)

          processedChunks.push({
            archetype_id: archetypeId,
            content_type: 'text',
            chunk_text: chunk.text,
            chunk_index: chunk.index,
            chunk_size: chunk.size,
            chunk_overlap: chunk.overlap,
            embedding: embedding,
            metadata: {
              originalLength: textContent.length,
              chunkCount: chunks.length,
              processedAt: new Date().toISOString(),
              model: embeddingModel
            }
          })

          // Small delay to respect rate limits
          await new Promise(resolve => setTimeout(resolve, 50))
        } catch (error) {
          console.error(`Error processing chunk ${globalIdx}:`, error)
          throw error
        }
      }

      // Save this batch to database using REST API
      const savedChunks = await supabaseRequest('archetype_content_chunks', {
        method: 'POST',
        body: JSON.stringify(processedChunks)
      })

      totalSaved += savedChunks.length
      console.log(`Saved batch: ${savedChunks.length} chunks (total: ${totalSaved}/${chunks.length})`)

      // Clear processed chunks from memory
      processedChunks.length = 0
    }

    console.log(`Successfully saved all ${totalSaved} chunks`)

    return new Response(
      JSON.stringify({
        success: true,
        message: `Successfully processed ${chunks.length} chunks for archetype "${archetype.name}"`,
        chunksCreated: savedChunks.length,
        archetypeId: archetypeId,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error in process-archetype-embedding:', error)
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})

