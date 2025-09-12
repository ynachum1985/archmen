import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { enhancedAIService } from '@/lib/services/enhanced-ai.service'

export async function POST() {
  try {
    const supabase = await createClient()
    
    // Check if user is authenticated and has admin privileges
    const { data: { user } } = await supabase.auth.getUser()
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    // For now, allow any authenticated user to generate embeddings
    // In production, you might want to check for admin role
    
    console.log('Starting embedding generation...')
    
    // Generate embeddings for all existing data
    await enhancedAIService.getInstance().generateEmbeddingsForExistingData()
    
    return NextResponse.json({ 
      success: true,
      message: 'Embeddings generated successfully for all existing data'
    })
  } catch (error) {
    console.error('Generate embeddings API error:', error)
    return NextResponse.json(
      { error: 'Failed to generate embeddings' },
      { status: 500 }
    )
  }
}
