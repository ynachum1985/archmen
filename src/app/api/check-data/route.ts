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

    // Fetch linguistic patterns
    const { data: patterns, error: patternsError } = await supabase
      .from('linguistic_patterns')
      .select('*')
      .order('archetype_name')

    if (patternsError) {
      console.error('Error fetching patterns:', patternsError)
    }

    return NextResponse.json({
      archetypes: {
        data: archetypes || [],
        count: archetypes?.length || 0
      },
      patterns: {
        data: patterns || [],
        count: patterns?.length || 0
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