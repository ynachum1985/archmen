import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
)

export async function POST(request: NextRequest) {
  try {
    const { id, updates } = await request.json()

    if (!id) {
      return NextResponse.json({ error: 'Archetype ID is required' }, { status: 400 })
    }

    if (!updates || typeof updates !== 'object') {
      return NextResponse.json({ error: 'Updates object is required' }, { status: 400 })
    }

    // Update the archetype in the database
    const { data: archetype, error } = await supabase
      .from('enhanced_archetypes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select('*')
      .single()

    if (error) {
      console.error('Error updating archetype:', error)
      return NextResponse.json({ 
        error: 'Failed to update archetype',
        details: error.message 
      }, { status: 500 })
    }

    if (!archetype) {
      return NextResponse.json({ error: 'Archetype not found' }, { status: 404 })
    }

    return NextResponse.json({
      success: true,
      archetype,
      message: `Archetype "${archetype.name}" updated successfully`
    })

  } catch (error) {
    console.error('Error in update-archetype API:', error)
    return NextResponse.json({ 
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
