import { NextRequest, NextResponse } from 'next/server'
import { createClient, createServiceClient } from '@/lib/supabase/server'
import { z } from 'zod'

const ModerationPatternSchema = z.object({
  pattern_name: z.string().min(1),
  pattern_regex: z.string().min(1),
  category: z.string().min(1),
  severity: z.enum(['low', 'medium', 'high', 'critical']),
  is_active: z.boolean().optional().default(true),
  description: z.string().optional()
})

export async function GET() {
  try {
    // Use service role client for admin operations
    const supabase = createServiceClient()
    const { data: patterns, error } = await supabase
      .from('moderation_patterns')
      .select('*')
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to load patterns' }, { status: 500 })
    }

    return NextResponse.json({ patterns })
  } catch (error) {
    console.error('Error loading moderation patterns:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validatedPattern = ModerationPatternSchema.parse(body)

    // Test the regex pattern
    try {
      new RegExp(validatedPattern.pattern_regex)
    } catch (regexError) {
      return NextResponse.json({ 
        error: 'Invalid regex pattern',
        details: 'The provided regex pattern is not valid'
      }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { data: pattern, error } = await supabase
      .from('moderation_patterns')
      .insert({
        ...validatedPattern,
        created_by: 'admin' // Use admin as default since we're using service role
      })
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to create pattern' }, { status: 500 })
    }

    return NextResponse.json({ pattern }, { status: 201 })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid pattern format',
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Error creating moderation pattern:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function PUT(request: NextRequest) {
  try {

    const body = await request.json()
    const { id, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ error: 'Pattern ID is required' }, { status: 400 })
    }

    const validatedPattern = ModerationPatternSchema.partial().parse(updateData)

    // Test the regex pattern if provided
    if (validatedPattern.pattern_regex) {
      try {
        new RegExp(validatedPattern.pattern_regex)
      } catch (regexError) {
        return NextResponse.json({ 
          error: 'Invalid regex pattern',
          details: 'The provided regex pattern is not valid'
        }, { status: 400 })
      }
    }

    const supabase = createServiceClient()
    const { data: pattern, error } = await supabase
      .from('moderation_patterns')
      .update(validatedPattern)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to update pattern' }, { status: 500 })
    }

    return NextResponse.json({ pattern })
  } catch (error) {
    if (error instanceof z.ZodError) {
      return NextResponse.json({ 
        error: 'Invalid pattern format',
        details: error.errors 
      }, { status: 400 })
    }

    console.error('Error updating moderation pattern:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json({ error: 'Pattern ID is required' }, { status: 400 })
    }

    const supabase = createServiceClient()
    const { error } = await supabase
      .from('moderation_patterns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Database error:', error)
      return NextResponse.json({ error: 'Failed to delete pattern' }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting moderation pattern:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
