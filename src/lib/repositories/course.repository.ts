import { BaseRepository } from './base.repository'
import { Database } from '@/lib/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

type Course = Database['public']['Tables']['courses']['Row']
type CourseInsert = Database['public']['Tables']['courses']['Insert']
type CourseUpdate = Database['public']['Tables']['courses']['Update']
type CourseEnrollment = Database['public']['Tables']['course_enrollments']['Row']

export class CourseRepository extends BaseRepository<'courses'> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'courses')
  }

  async findPublished(): Promise<Course[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('is_published', true)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data
  }

  async findBySlug(slug: string): Promise<Course | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('slug', slug)
      .eq('is_published', true)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async findByArchetype(archetype: string): Promise<Course[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .contains('archetype_focus', [archetype])
      .eq('is_published', true)
      .order('order_index', { ascending: true })

    if (error) throw error
    return data
  }

  async getUserEnrollments(userId: string): Promise<
    (Course & { enrollment: CourseEnrollment })[]
  > {
    const { data, error } = await this.client
      .from('course_enrollments')
      .select(`
        *,
        courses (*)
      `)
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    
    return data.map((item: any) => ({
      ...item.courses,
      enrollment: {
        id: item.id,
        user_id: item.user_id,
        course_id: item.course_id,
        created_at: item.created_at,
        updated_at: item.updated_at,
        progress: item.progress,
        completed_at: item.completed_at
      }
    }))
  }

  async enrollUser(userId: string, courseId: string): Promise<CourseEnrollment> {
    const { data, error } = await this.client
      .from('course_enrollments')
      .insert({
        user_id: userId,
        course_id: courseId,
        progress: {},
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateProgress(
    enrollmentId: string,
    progress: Record<string, any>
  ): Promise<CourseEnrollment> {
    const { data, error } = await this.client
      .from('course_enrollments')
      .update({
        progress,
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async completeCourse(enrollmentId: string): Promise<CourseEnrollment> {
    const { data, error } = await this.client
      .from('course_enrollments')
      .update({
        completed_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .eq('id', enrollmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
    const { data, error } = await this.client
      .from('course_enrollments')
      .select('id')
      .eq('user_id', userId)
      .eq('course_id', courseId)
      .single()

    if (error && error.code !== 'PGRST116') {
      if (error.code === 'PGRST116') return false
      throw error
    }

    return !!data
  }
} 