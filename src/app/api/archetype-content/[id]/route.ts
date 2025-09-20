import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params
    const archetypeId = id

    if (!archetypeId) {
      return NextResponse.json({ error: 'Archetype ID is required' }, { status: 400 })
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

    // Fetch content chunks for the archetype
    const { data: chunks, error } = await supabase
      .from('archetype_content_chunks')
      .select('*')
      .eq('archetype_id', archetypeId)
      .order('chunk_index', { ascending: true })

    if (error) {
      console.error('Error fetching content chunks:', error)
      return NextResponse.json({ error: 'Failed to fetch content chunks' }, { status: 500 })
    }

    // Also fetch embedding settings
    const { data: settings, error: settingsError } = await supabase
      .from('archetype_embedding_settings')
      .select('*')
      .eq('archetype_id', archetypeId)
      .single()

    if (settingsError && settingsError.code !== 'PGRST116') { // PGRST116 is "not found"
      console.error('Error fetching embedding settings:', settingsError)
    }

    return NextResponse.json({
      success: true,
      archetype: {
        id: archetype.id,
        name: archetype.name
      },
      chunks: chunks || [],
      settings: settings || null,
      totalChunks: chunks?.length || 0
    })

  } catch (error) {
    console.error('Error in get archetype-content API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Delete a specific chunk by ID
    const supabase = await createClient()

    // Check if user is authenticated
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    const { error } = await supabase
      .from('archetype_content_chunks')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting content chunk:', error)
      return NextResponse.json({ error: 'Failed to delete content chunk' }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: 'Content chunk deleted successfully' })

  } catch (error) {
    console.error('Error in delete archetype-content API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
