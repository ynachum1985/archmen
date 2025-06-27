import { BaseRepository } from './base.repository'
import { Database } from '@/lib/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

type Assessment = Database['public']['Tables']['assessments']['Row']
type ArchetypeResult = Database['public']['Tables']['archetype_results']['Row']
type Json = Database['public']['Tables']['assessments']['Update']['responses']

export class AssessmentRepository extends BaseRepository<'assessments'> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'assessments')
  }

  async findByUserId(userId: string): Promise<Assessment[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async findLatestByUserId(userId: string): Promise<Assessment | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async findWithResults(assessmentId: string): Promise<{
    assessment: Assessment
    results: ArchetypeResult | null
  } | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select(`
        *,
        archetype_results (*)
      `)
      .eq('id', assessmentId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    if (!data) return null

    return {
      assessment: data,
      results: data.archetype_results?.[0] || null
    } as { assessment: Assessment; results: ArchetypeResult | null }
  }

  async getCompletedAssessmentsByUserId(userId: string): Promise<Assessment[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('user_id', userId)
      .eq('status', 'completed')
      .order('created_at', { ascending: false })

    if (error) throw error
    return data
  }

  async markAsCompleted(assessmentId: string): Promise<Assessment> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({
        status: 'completed',
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async updateResponses(
    assessmentId: string,
    responses: Json
  ): Promise<Assessment> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({
        responses: responses,
        updated_at: new Date().toISOString()
      })
      .eq('id', assessmentId)
      .select()
      .single()

    if (error) throw error
    return data
  }
} 