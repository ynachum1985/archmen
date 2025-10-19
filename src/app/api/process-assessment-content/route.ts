import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

interface ChunkData {
  text: string
  index: number
  size: number
  overlap: number
}

// Text chunking function - OPTIMIZED (matches archetype route)
function chunkText(text: string, chunkSize: number = 400, overlap: number = 80): ChunkData[] {
  console.log('[chunkText] Starting chunking...', { textLength: text.length, chunkSize, overlap })

  // Validate inputs to prevent infinite loop
  if (overlap >= chunkSize) {
    console.error('[chunkText] Invalid parameters: overlap must be less than chunkSize')
    throw new Error(`Invalid chunking parameters: overlap (${overlap}) must be less than chunkSize (${chunkSize})`)
  }

  const chunks: ChunkData[] = []
  let start = 0
  let index = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunkText = text.slice(start, end)

    chunks.push({
      text: chunkText,
      index: index,
      size: chunkText.length,
      overlap: start > 0 ? overlap : 0
    })

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
async function generateEmbedding(text: string, model: string = 'mistral-embed'): Promise<number[]> {
  try {
    console.log('[generateEmbedding] Starting with model:', model)
    // Clean and preprocess text
    const cleanText = preprocessText(text)
    console.log('[generateEmbedding] Text preprocessed, length:', cleanText.length)

    // Handle different embedding providers
    if (model.startsWith('mistral-')) {
      console.log('[generateEmbedding] Using Mistral provider')
      return await generateMistralEmbedding(cleanText, model)
    } else if (model.startsWith('voyage-')) {
      console.log('[generateEmbedding] Using Voyage provider')
      return await generateVoyageEmbedding(cleanText, model)
    } else {
      // OpenAI models (default)
      console.log('[generateEmbedding] Using OpenAI provider')
      return await generateOpenAIEmbedding(cleanText, model)
    }
  } catch (error) {
    console.error('[generateEmbedding] Error:', error)
    throw error
  }
}

// Preprocess text for better embedding quality
function preprocessText(text: string): string {
  return text
    .replace(/\n/g, ' ')
    .trim()
    .replace(/\s+/g, ' ') // Normalize whitespace
    .replace(/[^\w\s.,!?;:()\-'"]/g, '') // Remove special characters but keep punctuation
    .substring(0, 8000) // Limit input length
}

// OpenAI embedding generation
async function generateOpenAIEmbedding(text: string, model: string): Promise<number[]> {
  console.log('[generateOpenAIEmbedding] Starting with model:', model)

  if (!openai) {
    console.error('[generateOpenAIEmbedding] OpenAI client not initialized')
    throw new Error('OpenAI API key not configured')
  }

  try {
    console.log('[generateOpenAIEmbedding] Calling OpenAI API with text length:', text.length)
    const response = await openai.embeddings.create({
      model,
      input: text
    })
    console.log('[generateOpenAIEmbedding] Success, embedding dimension:', response.data[0].embedding.length)
    return response.data[0].embedding
  } catch (error) {
    console.error('[generateOpenAIEmbedding] Error:', error)
    if (error instanceof Error) {
      console.error('[generateOpenAIEmbedding] Error message:', error.message)
      console.error('[generateOpenAIEmbedding] Error stack:', error.stack)
    }
    throw error
  }
}

// Mistral embedding generation (placeholder - implement with actual Mistral API)
async function generateMistralEmbedding(text: string, model: string): Promise<number[]> {
  // For now, fallback to OpenAI - implement actual Mistral API when available
  console.log(`Using Mistral model ${model} - falling back to OpenAI for now`)
  return await generateOpenAIEmbedding(text, 'text-embedding-3-small')
}

// Voyage AI embedding generation (placeholder - implement with actual Voyage API)
async function generateVoyageEmbedding(text: string, model: string): Promise<number[]> {
  // For now, fallback to OpenAI - implement actual Voyage API when available
  console.log(`Using Voyage model ${model} - falling back to OpenAI for now`)
  return await generateOpenAIEmbedding(text, 'text-embedding-3-small')
}

export async function POST(request: NextRequest) {
  try {
    console.log('[process-assessment-content] Request received')
    const supabase = createServiceClient()
    const body = await request.json()
    console.log('[process-assessment-content] Request body keys:', Object.keys(body))

    const {
      assessmentId,
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

    console.log('[process-assessment-content] Parsed:', { assessmentId, hasTextContent: !!textContent, hasFileContent: !!fileContent })

    if (!assessmentId) {
      console.error('[process-assessment-content] Missing assessmentId')
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }

    // Check if assessment exists, if not create it
    let finalAssessmentId = assessmentId

    // If assessmentId is not a UUID, try to find or create the assessment
    if (!assessmentId.match(/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i)) {
      // Try to find existing assessment by name
      const { data: existingAssessment } = await supabase
        .from('enhanced_assessments')
        .select('id')
        .eq('name', assessmentId)
        .single()

      if (existingAssessment) {
        finalAssessmentId = existingAssessment.id
      } else {
        return NextResponse.json({
          error: 'Assessment not found. Please create the assessment first.'
        }, { status: 404 })
      }
    }

    // Determine content to process
    let contentToProcess = ''
    if (textContent) {
      contentToProcess = textContent
    } else if (fileContent) {
      contentToProcess = fileContent
    } else {
      return NextResponse.json({ error: 'No content provided' }, { status: 400 })
    }

    if (!contentToProcess.trim()) {
      return NextResponse.json({ error: 'Content is empty' }, { status: 400 })
    }

    // Save or update embedding settings
    const { error: settingsError } = await supabase
      .from('assessment_embedding_settings')
      .upsert({
        assessment_id: finalAssessmentId,
        chunk_size: settings.chunkSize,
        chunk_overlap: settings.chunkOverlap,
        embedding_model: settings.embeddingModel,
        context_window: settings.contextWindow || 4000,
        semantic_search_enabled: settings.semanticSearchEnabled ?? true,
        updated_at: new Date().toISOString()
      })

    if (settingsError) {
      console.error('Error saving embedding settings:', settingsError)
      return NextResponse.json({ error: 'Failed to save embedding settings' }, { status: 500 })
    }

    console.log('Settings saved successfully')

    // Get the current highest chunk index for this assessment (for appending)
    console.log('Getting existing chunk count...')
    let existingChunkCount = 0
    try {
      const { data: existingChunks, error: countError } = await supabase
        .from('assessment_content_chunks')
        .select('chunk_index')
        .eq('assessment_id', finalAssessmentId)
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
    const chunks = chunkText(contentToProcess, settings.chunkSize, settings.chunkOverlap)

    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No chunks generated from content' }, { status: 400 })
    }

    console.log(`Created ${chunks.length} chunks from content`)

    // Limit chunks for Pro plan (60s timeout)
    const maxChunks = 20
    const chunksToProcess = chunks.slice(0, maxChunks)
    console.log(`Processing ${chunksToProcess.length} chunks (limited from ${chunks.length} to avoid timeout)`)

    // Process chunks in batches to avoid rate limits
    const batchSize = 5
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
              assessment_id: finalAssessmentId,
              content_type: contentType,
              chunk_text: chunk.text,
              chunk_index: globalIndex, // Use global index to append
              chunk_size: chunk.size,
              chunk_overlap: chunk.overlap,
              embedding: embedding, // Vector type expects array of numbers
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
      .from('assessment_content_chunks')
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
        ? `Successfully added ${savedChunks?.length || 0} new chunks to assessment (total: ${totalChunksNow} chunks)`
        : wasLimited
        ? `Successfully processed ${chunksToProcess.length} of ${chunks.length} chunks (limited to avoid timeout)`
        : `Successfully processed ${chunks.length} chunks`,
      chunksCreated: savedChunks?.length || 0,
      totalChunks: chunks.length,
      processedChunks: chunksToProcess.length,
      existingChunks: existingChunkCount,
      totalChunksNow: totalChunksNow,
      wasLimited,
      wasAppended,
      assessmentId: finalAssessmentId,
      settings: {
        chunkSize: settings.chunkSize,
        chunkOverlap: settings.chunkOverlap,
        embeddingModel: settings.embeddingModel
      },
      data: {
        assessmentId: finalAssessmentId,
        chunksProcessed: chunksToProcess.length,
        totalCharacters: contentToProcess.length,
        settings: settings,
        chunks: savedChunks?.map(chunk => ({
          id: chunk.id,
          index: chunk.chunk_index,
          size: chunk.chunk_size,
          preview: chunk.chunk_text.substring(0, 100) + '...'
        }))
      }
    })

  } catch (error) {
    console.error('Error in process-assessment-content:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
