import { NextRequest, NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const supabase = createServiceClient()
    const body = await request.json()
    const { assessmentId, settings } = body

    if (!assessmentId) {
      return NextResponse.json({ error: 'Assessment ID is required' }, { status: 400 })
    }

    if (!settings) {
      return NextResponse.json({ error: 'Settings are required' }, { status: 400 })
    }

    // Upsert embedding settings
    const { error } = await supabase
      .from('assessment_embedding_settings')
      .upsert({
        assessment_id: assessmentId,
        chunk_size: settings.chunkSize || 400,
        chunk_overlap: settings.chunkOverlap || 80,
        embedding_model: settings.embeddingModel || 'text-embedding-3-small',
        context_window: settings.maxContextTokens || 4000,
        semantic_search_enabled: true,
        settings: {
          topK: settings.topK || 10,
          similarityThreshold: settings.similarityThreshold || 0.7,
          enableMetadataFiltering: settings.enableMetadataFiltering || false
        },
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'assessment_id'
      })

    if (error) {
      console.error('Error saving embedding settings:', error)
      return NextResponse.json({ 
        error: 'Failed to save embedding settings',
        details: error.message 
      }, { status: 500 })
    }

    return NextResponse.json({ 
      success: true,
      message: 'Embedding settings saved successfully' 
    })
  } catch (error) {
    console.error('Error in save-embedding-settings API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

