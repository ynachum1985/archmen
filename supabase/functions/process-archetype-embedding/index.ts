// Supabase Edge Function for processing archetype embeddings
// This runs on Supabase infrastructure with no timeout limits

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

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

// Generate embedding using OpenAI
async function generateEmbedding(text: string, apiKey: string, model: string = 'text-embedding-3-small') {
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
  })

  if (!response.ok) {
    const error = await response.text()
    throw new Error(`OpenAI API error: ${error}`)
  }

  const data = await response.json()
  return data.data[0].embedding
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

    // Create Supabase client with service role
    const supabase = createClient(supabaseUrl, supabaseServiceKey)

    // Verify archetype exists
    const { data: archetype, error: archetypeError } = await supabase
      .from('enhanced_archetypes')
      .select('id, name')
      .eq('id', archetypeId)
      .single()

    if (archetypeError || !archetype) {
      return new Response(
        JSON.stringify({ error: 'Archetype not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    console.log(`Found archetype: ${archetype.name}`)

    // Save embedding settings - OPTIMIZED DEFAULTS
    const chunkSize = settings.chunkSize || 400  // Optimal: 300-500 tokens
    const chunkOverlap = settings.chunkOverlap || 80  // 20% overlap
    const embeddingModel = settings.embeddingModel || 'text-embedding-3-small'

    await supabase
      .from('archetype_embedding_settings')
      .upsert({
        archetype_id: archetypeId,
        chunk_size: chunkSize,
        chunk_overlap: chunkOverlap,
        embedding_model: embeddingModel,
        context_window: settings.contextWindow || 4000,
        semantic_search_enabled: settings.semanticSearchEnabled ?? true,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'archetype_id'
      })

    // Delete existing chunks
    await supabase
      .from('archetype_content_chunks')
      .delete()
      .eq('archetype_id', archetypeId)

    // Chunk the content
    const chunks = chunkText(textContent, chunkSize, chunkOverlap)
    console.log(`Created ${chunks.length} chunks`)

    // Process all chunks (no timeout limit!)
    const processedChunks = []

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i]
      console.log(`Processing chunk ${i + 1}/${chunks.length}`)

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
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error)
        throw error
      }
    }

    // Save all chunks to database
    const { data: savedChunks, error: chunksError } = await supabase
      .from('archetype_content_chunks')
      .insert(processedChunks)
      .select()

    if (chunksError) {
      console.error('Error saving chunks:', chunksError)
      throw new Error(`Failed to save chunks: ${chunksError.message}`)
    }

    console.log(`Successfully saved ${savedChunks.length} chunks`)

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

