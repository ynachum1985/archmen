import { NextResponse } from 'next/server'
import { createServiceClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createServiceClient()

    // Handle build-time scenario where Supabase client might be null
    if (!supabase) {
      return NextResponse.json(
        { error: 'Supabase client not available' },
        { status: 500 }
      )
    }

    // Fetch the latest synced models from the cache table
    const { data, error } = await supabase
      .from('openrouter_models_cache')
      .select('models, last_synced, model_count')
      .eq('id', 'latest')
      .single()

    if (error) {
      console.error('Error fetching synced models:', error)
      // Return empty array if no cached models exist yet
      return NextResponse.json({
        success: true,
        models: [],
        lastSynced: null,
        modelCount: 0,
        message: 'No synced models found. Click the sync button to fetch latest models.'
      })
    }

    if (!data) {
      return NextResponse.json({
        success: true,
        models: [],
        lastSynced: null,
        modelCount: 0,
        message: 'No synced models found. Click the sync button to fetch latest models.'
      })
    }

    return NextResponse.json({
      success: true,
      models: data.models || [],
      lastSynced: data.last_synced,
      modelCount: data.model_count || 0,
      message: `Found ${data.model_count || 0} synced models`
    })
  } catch (error) {
    console.error('Error in get-synced-models:', error)
    return NextResponse.json(
      {
        error: 'Failed to get synced models',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

