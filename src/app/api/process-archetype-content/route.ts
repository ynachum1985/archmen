import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// Force dynamic rendering to ensure environment variables are available
export const dynamic = 'force-dynamic'
export const maxDuration = 60 // Allow up to 60 seconds for embedding generation

// Handle CORS preflight requests
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// Initialize OpenAI only when needed
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Text chunking function - OPTIMIZED DEFAULTS (see EMBEDDING_CONFIGURATION_ANALYSIS.md)
function chunkText(text: string, chunkSize: number = 400, overlap: number = 80) {
  console.log('[chunkText] Starting chunking...', { textLength: text.length, chunkSize, overlap })

  // Validate inputs to prevent infinite loop
  if (overlap >= chunkSize) {
    console.error('[chunkText] Invalid parameters: overlap must be less than chunkSize')
    throw new Error(`Invalid chunking parameters: overlap (${overlap}) must be less than chunkSize (${chunkSize})`)
  }

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

    // Move to next chunk position
    // If this is the last chunk, break to avoid infinite loop
    if (end >= text.length) {
      break
    }

    start = end - overlap
    index++

    // Safety check to prevent infinite loop
    if (index > 1000) {
      console.error('[chunkText] Too many chunks, breaking loop')
      break
    }
  }

  console.log('[chunkText] Chunking complete:', chunks.length, 'chunks created')
  return chunks
}

// Generate embedding for text with support for multiple providers
async function generateEmbedding(text: string, model: string = 'openrouter/text-embedding-3-small') {
  // Clean and preprocess text
  const cleanText = preprocessText(text)

  // Handle different embedding providers
  if (model.startsWith('openrouter/')) {
    return await generateOpenRouterEmbedding(cleanText, model)
  } else if (model.startsWith('mistral-')) {
    return await generateMistralEmbedding(cleanText, model)
  } else if (model.startsWith('voyage-')) {
    return await generateVoyageEmbedding(cleanText, model)
  } else {
    // OpenAI models (default)
    return await generateOpenAIEmbedding(cleanText, model)
  }
}

// Preprocess text for better embedding quality
function preprocessText(text: string): string {
  return text
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:()\-'"]/g, '') // Remove special characters but keep punctuation
    .substring(0, 8000) // Limit input length
}

// OpenRouter embedding generation
async function generateOpenRouterEmbedding(text: string, model: string) {
  try {
    if (!process.env.OPENROUTER_API_KEY) {
      console.warn('OpenRouter API key not configured, falling back to OpenAI')
      return await generateOpenAIEmbedding(text, 'text-embedding-3-small')
    }

    console.log(`Generating embedding with OpenRouter model: ${model}`)

    // Extract the actual model name (e.g., 'openrouter/text-embedding-3-small' -> 'text-embedding-3-small')
    const actualModel = model.replace('openrouter/', '')

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

    console.log(`Successfully generated embedding with ${data.data[0].embedding.length} dimensions`)
    return data.data[0].embedding
  } catch (error) {
    console.error('OpenRouter embedding error:', error)
    console.warn('Falling back to OpenAI')
    return await generateOpenAIEmbedding(text, 'text-embedding-3-small')
  }
}

// OpenAI embedding generation
async function generateOpenAIEmbedding(text: string, model: string) {
  try {
    console.log('Attempting to get OpenAI client...')
    const openai = getOpenAI()
    console.log('OpenAI client obtained successfully')

    if (!text || text.trim().length === 0) {
      throw new Error('Text content is empty')
    }

    console.log(`Generating embedding for text (${text.length} chars) with model: ${model}`)

    const response = await openai.embeddings.create({
      model: model.startsWith('text-embedding') ? model : 'text-embedding-3-small',
      input: text,
      timeout: 30000, // 30 second timeout
    })

    if (!response.data || !response.data[0] || !response.data[0].embedding) {
      throw new Error('Invalid embedding response from OpenAI')
    }

    console.log(`Successfully generated embedding with ${response.data[0].embedding.length} dimensions`)
    return response.data[0].embedding
  } catch (error) {
    console.error('OpenAI embedding error:', error)
    console.error('Error details:', {
      name: error instanceof Error ? error.name : 'Unknown',
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : 'No stack trace'
    })
    throw new Error(`OpenAI embedding failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

// Mistral embedding generation (placeholder - implement with actual Mistral API)
async function generateMistralEmbedding(text: string, model: string) {
  // For now, fallback to OpenAI - implement actual Mistral API when available
  console.log(`Using Mistral model ${model} - falling back to OpenAI for now`)
  return await generateOpenAIEmbedding(text, 'text-embedding-3-small')
}

// Voyage AI embedding generation (placeholder - implement with actual Voyage API)
async function generateVoyageEmbedding(text: string, model: string) {
  // For now, fallback to OpenAI - implement actual Voyage API when available
  console.log(`Using Voyage model ${model} - falling back to OpenAI for now`)
  return await generateOpenAIEmbedding(text, 'text-embedding-3-small')
}

export async function POST(request: NextRequest) {
  console.log('=== POST /api/process-archetype-content called ===')
  console.log('Request method:', request.method)
  console.log('Request URL:', request.url)
  console.log('Environment check:')
  console.log('- OPENAI_API_KEY:', !!process.env.OPENAI_API_KEY)
  console.log('- SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY)

  try {
    const body = await request.json()
    console.log('Request body received:', { archetypeId: body.archetypeId, hasTextContent: !!body.textContent, hasFileContent: !!body.fileContent })

    const {
      archetypeId,
      textContent,
      fileContent,
      sourceUrl,
      contentType = 'text',
      settings = {
        chunkSize: 1000,
        chunkOverlap: 200,
        embeddingModel: 'mistral-embed'
      }
    } = body

    if (!archetypeId) {
      return NextResponse.json({ error: 'Archetype ID is required' }, { status: 400 })
    }

    if (!textContent && !fileContent) {
      return NextResponse.json({ error: 'Either textContent or fileContent is required' }, { status: 400 })
    }

    // Use service client for admin operations (bypasses RLS)
    console.log('Using service client for archetype content processing')
    console.log('Environment check (v3 - after refresh):')
    console.log('NEXT_PUBLIC_SUPABASE_URL:', !!process.env.NEXT_PUBLIC_SUPABASE_URL, process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 20) + '...')
    console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY, process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.substring(0, 20) + '...')
    console.log('SUPABASE_SERVICE_ROLE_KEY:', !!process.env.SUPABASE_SERVICE_ROLE_KEY, process.env.SUPABASE_SERVICE_ROLE_KEY?.substring(0, 20) + '...')
    console.log('All environment variables present:', !!process.env.NEXT_PUBLIC_SUPABASE_URL && !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY && !!process.env.SUPABASE_SERVICE_ROLE_KEY)

    const supabase = createServiceClient()

    // Handle build-time scenario where Supabase client might be null
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // For admin operations, we don't need user authentication since we're using service role
    console.log('Using service role - bypassing user authentication')

    // Verify archetype exists
    console.log('Querying archetype from database...')
    let archetype, archetypeError
    try {
      const result = await supabase
        .from('enhanced_archetypes')
        .select('id, name')
        .eq('id', archetypeId)
        .single()

      archetype = result.data
      archetypeError = result.error
      console.log('Archetype query result:', { found: !!archetype, error: !!archetypeError })
    } catch (error) {
      console.error('Exception during archetype query:', error)
      return NextResponse.json({
        error: 'Database query failed',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    if (archetypeError || !archetype) {
      console.error('Archetype not found or error:', archetypeError)
      return NextResponse.json({
        error: 'Archetype not found',
        details: archetypeError?.message || 'No archetype with this ID'
      }, { status: 404 })
    }

    console.log(`Found archetype: ${archetype.name}`)

    // Use the provided archetype ID
    const finalArchetypeId = archetype.id
    console.log('Final archetype ID:', finalArchetypeId)

    // Determine content to process
    const contentToProcess = textContent || fileContent || ''
    console.log('Content to process length:', contentToProcess.length)

    if (!contentToProcess.trim()) {
      console.error('Content is empty after trim')
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
    }

    // Save or update embedding settings with proper conflict resolution
    console.log('Attempting to save embedding settings...')
    console.log('Settings to save:', {
      archetype_id: finalArchetypeId,
      chunk_size: settings.chunkSize,
      chunk_overlap: settings.chunkOverlap,
      embedding_model: settings.embeddingModel,
      context_window: settings.contextWindow || 4000,
      semantic_search_enabled: settings.semanticSearchEnabled ?? true
    })

    let settingsError
    try {
      const result = await supabase
        .from('archetype_embedding_settings')
        .upsert({
          archetype_id: finalArchetypeId,
          chunk_size: settings.chunkSize,
          chunk_overlap: settings.chunkOverlap,
          embedding_model: settings.embeddingModel,
          context_window: settings.contextWindow || 4000,
          semantic_search_enabled: settings.semanticSearchEnabled ?? true,
          updated_at: new Date().toISOString()
        }, {
          onConflict: 'archetype_id'
        })

      settingsError = result.error
      console.log('Settings save result:', { error: !!settingsError })
    } catch (error) {
      console.error('Exception during settings save:', error)
      return NextResponse.json({
        error: 'Failed to save embedding settings',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    if (settingsError) {
      console.error('Error saving embedding settings:', settingsError)
      console.error('Settings data:', {
        archetype_id: finalArchetypeId,
        chunk_size: settings.chunkSize,
        chunk_overlap: settings.chunkOverlap,
        embedding_model: settings.embeddingModel
      })
      return NextResponse.json({
        error: 'Failed to save embedding settings',
        details: settingsError.message
      }, { status: 500 })
    }

    console.log('Settings saved successfully')

    // Get the current highest chunk index for this archetype
    console.log('Getting existing chunk count...')
    let existingChunkCount = 0
    try {
      const { data: existingChunks, error: countError } = await supabase
        .from('archetype_content_chunks')
        .select('chunk_index')
        .eq('archetype_id', finalArchetypeId)
        .order('chunk_index', { ascending: false })
        .limit(1)

      if (countError) {
        console.error('Error getting chunk count:', countError)
      } else if (existingChunks && existingChunks.length > 0) {
        existingChunkCount = existingChunks[0].chunk_index + 1
        console.log(`Found ${existingChunkCount} existing chunks`)
      } else {
        console.log('No existing chunks found')
      }
    } catch (error) {
      console.error('Exception getting chunk count:', error)
      // Continue anyway - we'll just start from index 0
    }

    // Chunk the content
    console.log('Creating chunks from content...')
    console.log('Content length:', contentToProcess.length, 'Chunk size:', settings.chunkSize, 'Overlap:', settings.chunkOverlap)

    let chunks
    try {
      chunks = chunkText(contentToProcess, settings.chunkSize, settings.chunkOverlap)
      console.log(`Created ${chunks.length} chunks from content`)
    } catch (error) {
      console.error('Error creating chunks:', error)
      return NextResponse.json({
        error: 'Failed to create chunks',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    // With Vercel Pro (60s timeout), we can process more chunks
    // Increased to 30 to handle larger documents (linguistic patterns ~25 chunks)
    const maxChunks = 30 // Increased from 20 to 30 for larger documents
    const chunksToProcess = chunks.slice(0, maxChunks)
    console.log(`Processing ${chunksToProcess.length} chunks (limited from ${chunks.length} to avoid timeout)`)

    // Process chunks in batches to avoid rate limits
    const batchSize = 5 // Increased to 5 for Pro plan (60s timeout)
    const processedChunks = []

    console.log(`Starting batch processing: ${chunksToProcess.length} chunks in batches of ${batchSize}`)

    try {
      for (let i = 0; i < chunksToProcess.length; i += batchSize) {
        const batch = chunksToProcess.slice(i, i + batchSize)
        const batchNum = Math.floor(i / batchSize) + 1
        const totalBatches = Math.ceil(chunksToProcess.length / batchSize)
        console.log(`Processing batch ${batchNum}/${totalBatches} (chunks ${i} to ${i + batch.length - 1})`)

        const batchPromises = batch.map(async (chunk) => {
          try {
            // Use offset index to append to existing chunks
            const globalIndex = existingChunkCount + chunk.index
            console.log(`Generating embedding for chunk ${globalIndex} (local: ${chunk.index})...`)
            const embedding = await generateEmbedding(chunk.text, settings.embeddingModel)
            console.log(`Successfully generated embedding for chunk ${globalIndex}`)

            return {
              archetype_id: finalArchetypeId,
              content_type: contentType,
              chunk_text: chunk.text,
              chunk_index: globalIndex, // Use global index to append
              chunk_size: chunk.size,
              chunk_overlap: chunk.overlap,
              embedding: embedding, // Vector type expects array of numbers, not JSON string
              source_url: sourceUrl || null,
              metadata: {
                originalLength: contentToProcess.length,
                chunkCount: chunks.length,
                processedAt: new Date().toISOString(),
                model: settings.embeddingModel,
                isAppended: existingChunkCount > 0
              }
            }
          } catch (error) {
            console.error(`Error processing chunk ${chunk.index}:`, error)
            throw error
          }
        })

        const batchResults = await Promise.all(batchPromises)
        processedChunks.push(...batchResults)
        console.log(`Batch ${batchNum}/${totalBatches} complete. Total processed: ${processedChunks.length}`)

        // Small delay between batches to respect rate limits
        if (i + batchSize < chunksToProcess.length) {
          await new Promise(resolve => setTimeout(resolve, 100))
        }
      }
    } catch (error) {
      console.error('Error during batch processing:', error)
      return NextResponse.json({
        error: 'Failed to process chunks',
        details: error instanceof Error ? error.message : 'Unknown error'
      }, { status: 500 })
    }

    console.log(`Successfully processed ${processedChunks.length} chunks`)

    // Save all chunks to database
    const { data: savedChunks, error: chunksError } = await supabase
      .from('archetype_content_chunks')
      .insert(processedChunks)
      .select()

    if (chunksError) {
      console.error('Error saving chunks:', chunksError)
      return NextResponse.json({ error: 'Failed to save content chunks' }, { status: 500 })
    }

    const wasLimited = chunks.length > maxChunks
    const wasAppended = existingChunkCount > 0
    const totalChunksNow = existingChunkCount + (savedChunks?.length || 0)

    return NextResponse.json({
      success: true,
      message: wasAppended
        ? `Successfully added ${savedChunks?.length || 0} new chunks to archetype "${archetype.name}" (total: ${totalChunksNow} chunks)`
        : wasLimited
        ? `Successfully processed ${chunksToProcess.length} of ${chunks.length} chunks for archetype "${archetype.name}" (limited to avoid timeout)`
        : `Successfully processed ${chunks.length} chunks for archetype "${archetype.name}"`,
      chunksCreated: savedChunks?.length || 0,
      totalChunks: chunks.length,
      processedChunks: chunksToProcess.length,
      existingChunks: existingChunkCount,
      totalChunksNow: totalChunksNow,
      wasLimited,
      wasAppended,
      archetypeId: finalArchetypeId,
      settings: {
        chunkSize: settings.chunkSize,
        chunkOverlap: settings.chunkOverlap,
        embeddingModel: settings.embeddingModel
      }
    })

  } catch (error) {
    console.error('Error in process archetype content API:', error)
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace')

    // Provide more specific error information
    let errorMessage = 'Internal server error'
    let errorDetails = 'Unknown error'

    if (error instanceof Error) {
      errorDetails = error.message

      // Check for specific error types
      if (error.message.includes('OpenAI')) {
        errorMessage = 'OpenAI API error - check your API key configuration'
      } else if (error.message.includes('embedding')) {
        errorMessage = 'Embedding generation failed'
      } else if (error.message.includes('database') || error.message.includes('supabase')) {
        errorMessage = 'Database error'
      }
    }

    return NextResponse.json({
      error: errorMessage,
      details: errorDetails,
      timestamp: new Date().toISOString()
    }, { status: 500 })
  }
}
