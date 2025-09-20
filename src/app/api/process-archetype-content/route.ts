import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

// Initialize OpenAI only when needed
const getOpenAI = () => {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error('OpenAI API key not configured')
  }
  return new OpenAI({
    apiKey: process.env.OPENAI_API_KEY,
  })
}

// Text chunking function
function chunkText(text: string, chunkSize: number = 1000, overlap: number = 200) {
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

// Generate embedding for text
async function generateEmbedding(text: string, model: string = 'text-embedding-3-small') {
  const openai = getOpenAI()
  
  const response = await openai.embeddings.create({
    model: model,
    input: text.substring(0, 8000) // Limit input length
  })

  return response.data[0].embedding
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      archetypeId,
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

    if (!archetypeId) {
      return NextResponse.json({ error: 'Archetype ID is required' }, { status: 400 })
    }

    if (!textContent && !fileContent) {
      return NextResponse.json({ error: 'Either textContent or fileContent is required' }, { status: 400 })
    }

    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    // Verify archetype exists
    const { data: archetype, error: archetypeError } = await supabase
      .from('enhanced_archetypes')
      .select('id, name')
      .eq('id', archetypeId)
      .single()

    if (archetypeError || !archetype) {
      return NextResponse.json({ error: 'Archetype not found' }, { status: 404 })
    }

    // Use the provided archetype ID
    const finalArchetypeId = archetype.id

    // Determine content to process
    const contentToProcess = textContent || fileContent || ''

    if (!contentToProcess.trim()) {
      return NextResponse.json({ error: 'Content cannot be empty' }, { status: 400 })
    }

    // Save or update embedding settings
    const { error: settingsError } = await supabase
      .from('archetype_embedding_settings')
      .upsert({
        archetype_id: finalArchetypeId,
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

    // Delete existing chunks for this archetype to replace them
    const { error: deleteError } = await supabase
      .from('archetype_content_chunks')
      .delete()
      .eq('archetype_id', finalArchetypeId)

    if (deleteError) {
      console.error('Error deleting existing chunks:', deleteError)
      return NextResponse.json({ error: 'Failed to delete existing content' }, { status: 500 })
    }

    // Chunk the content
    const chunks = chunkText(contentToProcess, settings.chunkSize, settings.chunkOverlap)
    
    // Process chunks in batches to avoid rate limits
    const batchSize = 5
    const processedChunks = []

    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize)
      
      const batchPromises = batch.map(async (chunk) => {
        try {
          const embedding = await generateEmbedding(chunk.text, settings.embeddingModel)
          
          return {
            archetype_id: finalArchetypeId,
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
      .from('archetype_content_chunks')
      .insert(processedChunks)
      .select()

    if (chunksError) {
      console.error('Error saving chunks:', chunksError)
      return NextResponse.json({ error: 'Failed to save content chunks' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: `Successfully processed ${chunks.length} chunks for archetype "${archetype.name}"`,
      chunksCreated: savedChunks?.length || 0,
      archetypeId: finalArchetypeId,
      settings: {
        chunkSize: settings.chunkSize,
        chunkOverlap: settings.chunkOverlap,
        embeddingModel: settings.embeddingModel
      }
    })

  } catch (error) {
    console.error('Error in process archetype content API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
