import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
})

export async function POST(request: NextRequest) {
  try {
    const { query, assessmentId } = await request.json()

    if (!query || !assessmentId) {
      return NextResponse.json({ error: 'Query and assessmentId are required' }, { status: 400 })
    }

    const supabase = createClient()

    // Generate embedding for the query
    const embeddingResponse = await openai.embeddings.create({
      model: 'text-embedding-3-small',
      input: query,
    })

    const queryEmbedding = embeddingResponse.data[0].embedding

    // Search for similar content chunks
    const { data: chunks, error } = await supabase.rpc('search_assessment_content', {
      query_embedding: queryEmbedding,
      assessment_id_param: assessmentId,
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
    console.error('Error in test embedding API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
