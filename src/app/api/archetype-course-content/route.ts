import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const archetypeId = searchParams.get('archetypeId')
    const weekNumber = searchParams.get('weekNumber')
    const contentCategory = searchParams.get('contentCategory')

    if (!archetypeId) {
      return NextResponse.json(
        { error: 'Missing archetypeId' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    let query = supabase
      .from('archetype_course_content')
      .select(`
        *,
        enhanced_archetypes (
          name,
          description
        )
      `)
      .eq('archetype_id', archetypeId)

    if (weekNumber) {
      query = query.eq('week_number', parseInt(weekNumber))
    }

    if (contentCategory) {
      query = query.eq('content_category', contentCategory)
    }

    query = query.order('week_number', { ascending: true })
      .order('content_category', { ascending: true })
      .order('order_index', { ascending: true })

    const { data, error } = await query

    if (error) {
      console.error('Error fetching archetype course content:', error)
      return NextResponse.json(
        { error: 'Failed to fetch course content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ content: data || [] })
  } catch (error) {
    console.error('Error in archetype course content API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      archetypeId,
      weekNumber,
      contentCategory,
      title,
      description,
      contentBody,
      estimatedTimeMinutes,
      difficultyLevel,
      isPremium,
      orderIndex
    } = body

    if (!archetypeId || !weekNumber || !contentCategory || !title || !contentBody) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { data, error } = await supabase
      .from('archetype_course_content')
      .insert({
        archetype_id: archetypeId,
        week_number: weekNumber,
        content_category: contentCategory,
        title,
        description,
        content_body: contentBody,
        estimated_time_minutes: estimatedTimeMinutes || 15,
        difficulty_level: difficultyLevel || 'beginner',
        is_premium: isPremium || false,
        order_index: orderIndex || 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()

    if (error) {
      console.error('Error creating archetype course content:', error)
      return NextResponse.json(
        { error: 'Failed to create course content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in archetype course content API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      id,
      title,
      description,
      contentBody,
      estimatedTimeMinutes,
      difficultyLevel,
      isPremium,
      orderIndex
    } = body

    if (!id) {
      return NextResponse.json(
        { error: 'Missing content ID' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const updateData: any = {
      updated_at: new Date().toISOString()
    }

    if (title !== undefined) updateData.title = title
    if (description !== undefined) updateData.description = description
    if (contentBody !== undefined) updateData.content_body = contentBody
    if (estimatedTimeMinutes !== undefined) updateData.estimated_time_minutes = estimatedTimeMinutes
    if (difficultyLevel !== undefined) updateData.difficulty_level = difficultyLevel
    if (isPremium !== undefined) updateData.is_premium = isPremium
    if (orderIndex !== undefined) updateData.order_index = orderIndex

    const { data, error } = await supabase
      .from('archetype_course_content')
      .update(updateData)
      .eq('id', id)
      .select()

    if (error) {
      console.error('Error updating archetype course content:', error)
      return NextResponse.json(
        { error: 'Failed to update course content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error in archetype course content API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const id = searchParams.get('id')

    if (!id) {
      return NextResponse.json(
        { error: 'Missing content ID' },
        { status: 400 }
      )
    }

    const supabase = await createClient()

    const { error } = await supabase
      .from('archetype_course_content')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting archetype course content:', error)
      return NextResponse.json(
        { error: 'Failed to delete course content' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error in archetype course content API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
