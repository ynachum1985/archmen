import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import OpenAI from 'openai'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
}) : null

interface ChunkData {
  text: string
  index: number
  size: number
  overlap: number
}

function chunkText(text: string, chunkSize: number, overlap: number): ChunkData[] {
  const chunks: ChunkData[] = []
  let index = 0
  let start = 0

  while (start < text.length) {
    const end = Math.min(start + chunkSize, text.length)
    const chunkText = text.slice(start, end)
    
    chunks.push({
      text: chunkText,
      index: index++,
      size: chunkText.length,
      overlap: start > 0 ? overlap : 0
    })

    // Move start position, accounting for overlap
    start = end - overlap
    if (start >= text.length) break
  }

  return chunks
}

async function generateEmbedding(text: string, model: string = 'text-embedding-3-small'): Promise<number[]> {
  if (!openai) {
    throw new Error('OpenAI API key not configured')
  }

  try {
    const response = await openai.embeddings.create({
      model,
      input: text.replace(/\n/g, ' ').trim()
    })
    return response.data[0].embedding
  } catch (error) {
    console.error('Error generating embedding:', error)
    throw error
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { 
      assessmentId, 
      textContent, 
      fileContent, 
      sourceUrl, 
      contentType = 'text',
      settings = {
        chunkSize: 1000,
        chunkOverlap: 200,
        embeddingModel: 'text-embedding-3-small'
      }
    } = body

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
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
        assessment_id: assessmentId,
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

    // Chunk the content
    const chunks = chunkText(contentToProcess, settings.chunkSize, settings.chunkOverlap)
    
    if (chunks.length === 0) {
      return NextResponse.json({ error: 'No chunks generated from content' }, { status: 400 })
    }

    // Process chunks in batches to avoid rate limits
    const batchSize = 5
    const processedChunks = []

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (chunk) => {
        try {
          const embedding = await generateEmbedding(chunk.text, settings.embeddingModel)
          
          return {
            assessment_id: assessmentId,
            content_type: contentType,
            chunk_text: chunk.text,
            chunk_index: chunk.index,
            chunk_size: chunk.size,
            chunk_overlap: chunk.overlap,
            embedding: JSON.stringify(embedding), // Convert to JSON string for Supabase
            source_url: sourceUrl || null,
            metadata: {
              originalLength: contentToProcess.length,
              chunkCount: chunks.length,
              processedAt: new Date().toISOString(),
              model: settings.embeddingModel
            }
          }
        } catch (error) {
          console.error(`Error processing chunk ${chunk.index}:`, error)
          throw error
        }
      })

      const batchResults = await Promise.all(batchPromises)
      processedChunks.push(...batchResults)

      // Small delay between batches to respect rate limits
      if (i + batchSize < chunks.length) {
        await new Promise(resolve => setTimeout(resolve, 100))
      }
    }

    // Save all chunks to database
    const { data: savedChunks, error: chunksError } = await supabase
      .from('assessment_content_chunks')
      .insert(processedChunks)
      .select()

    if (chunksError) {
      console.error('Error saving chunks:', chunksError)
      return NextResponse.json({ error: 'Failed to save content chunks' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed and embedded ${chunks.length} chunks`,
      data: {
        assessmentId,
        chunksProcessed: chunks.length,
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
