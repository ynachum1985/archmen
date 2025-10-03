import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const supabase = createClient()

    // Get all archetype content chunks for general overview
    const { data: chunks, error } = await supabase
      .from('archetype_content_chunks')
      .select(`
        id,
        chunk_text,
        chunk_index,
        content_type,
        created_at,
        archetype_id,
        enhanced_archetypes!inner(name)
      `)
      .order('created_at', { ascending: false })
      .limit(50)

    if (error) {
      console.error('Error fetching general archetype content:', error)
      return NextResponse.json({ error: 'Failed to fetch content' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      chunks: chunks || [],
      total: chunks?.length || 0
    })

  } catch (error) {
    console.error('Error in general archetype content API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
