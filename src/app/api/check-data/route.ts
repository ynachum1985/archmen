import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = await createClient()

    // Fetch archetypes
    const { data: archetypes, error: archetypesError } = await supabase
      .from('enhanced_archetypes')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (archetypesError) {
      console.error('Error fetching archetypes:', archetypesError)
    }

    // Linguistic patterns are now stored in enhanced_archetypes table
    // No separate linguistic_patterns table needed

    return NextResponse.json({
      archetypes: {
        data: archetypes || [],
        count: archetypes?.length || 0,
        linguistic_patterns_included: true // Patterns are now in archetypes table
      }
    })
  } catch (error) {
    console.error('Error in check-data API:', error)
    return NextResponse.json(
      { error: 'Failed to fetch data' },
      { status: 500 }
    )
  }
} 