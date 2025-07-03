import { BaseRepository } from './base.repository'
import { Database } from '@/lib/types/database'
import { SupabaseClient } from '@supabase/supabase-js'
import { 
  AdvancedArchetypeDefinition, 
  PromptTemplate, 
  AnalysisSession, 
  AdminMetrics,
  AIModelConfig,
  ResearchProject,
  CulturalContext 
} from '@/lib/types/archetype-system'

export class EnhancedArchetypeRepository {
  constructor(private client: SupabaseClient<Database>) {}

  // Archetype Definitions Management
  async createArchetypeDefinition(definition: Omit<AdvancedArchetypeDefinition, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await this.client
      .from('enhanced_archetypes')
      .insert({
        ...definition,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data as AdvancedArchetypeDefinition
  }

  async updateArchetypeDefinition(id: string, updates: Partial<AdvancedArchetypeDefinition>) {
    const { data, error } = await this.client
      .from('enhanced_archetypes')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AdvancedArchetypeDefinition
  }

  async getArchetypeDefinitions(activeOnly = true): Promise<AdvancedArchetypeDefinition[]> {
    let query = this.client
      .from('enhanced_archetypes')
      .select('*')
      .order('category', { ascending: true })
      .order('name', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as AdvancedArchetypeDefinition[]
  }

  // Prompt Template Management
  async createPromptTemplate(template: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'performance'>) {
    const { data, error } = await this.client
      .from('prompt_templates')
      .insert({
        ...template,
        id: crypto.randomUUID(),
        performance: {
          success_rate: 0,
          avg_satisfaction_score: 0,
          usage_count: 0
        },
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data as PromptTemplate
  }

  async updatePromptTemplate(id: string, updates: Partial<PromptTemplate>) {
    const { data, error } = await this.client
      .from('prompt_templates')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as PromptTemplate
  }

  async getPromptTemplates(filters?: {
    category?: string
    archetype?: string
    complexity?: string
    activeOnly?: boolean
  }): Promise<PromptTemplate[]> {
    let query = this.client
      .from('prompt_templates')
      .select('*')

    if (filters?.category) {
      query = query.eq('category', filters.category)
    }
    if (filters?.archetype) {
      query = query.eq('archetype', filters.archetype)
    }
    if (filters?.complexity) {
      query = query.eq('complexity', filters.complexity)
    }
    if (filters?.activeOnly) {
      query = query.eq('is_active', true)
    }

    query = query.order('created_at', { ascending: false })

    const { data, error } = await query
    if (error) throw error
    return (data || []) as PromptTemplate[]
  }

  async updatePromptPerformance(id: string, performance: Partial<PromptTemplate['performance']>) {
    const { data: current } = await this.client
      .from('prompt_templates')
      .select('performance')
      .eq('id', id)
      .single()

    if (!current) throw new Error('Prompt template not found')

    const updatedPerformance = {
      ...(current.performance as any || {}),
      ...performance
    }

    const { data, error } = await this.client
      .from('prompt_templates')
      .update({
        performance: updatedPerformance,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as PromptTemplate
  }

  // Analysis Session Management
  async createAnalysisSession(session: Omit<AnalysisSession, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await this.client
      .from('analysis_sessions')
      .insert({
        ...session,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data as AnalysisSession
  }

  async updateAnalysisSession(id: string, updates: Partial<AnalysisSession>) {
    const { data, error } = await this.client
      .from('analysis_sessions')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AnalysisSession
  }

  async getAnalysisSession(id: string): Promise<AnalysisSession | null> {
    const { data, error } = await this.client
      .from('analysis_sessions')
      .select('*')
      .eq('id', id)
      .single()

    if (error) throw error
    return data as AnalysisSession
  }

  async getUserAnalysisSessions(userId: string): Promise<AnalysisSession[]> {
    const { data, error } = await this.client
      .from('analysis_sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) throw error
    return (data || []) as AnalysisSession[]
  }

  // Admin Metrics
  async getSystemMetrics(): Promise<AdminMetrics> {
    // Get system usage metrics
    const { data: sessionsData } = await this.client
      .from('analysis_sessions')
      .select('id, user_id, status, created_at, metadata')

    const { data: activeUsersData } = await this.client
      .from('analysis_sessions')
      .select('user_id')
      .gte('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()) // Last 30 days
      .not('user_id', 'is', null)

    const { data: promptsData } = await this.client
      .from('prompt_templates')
      .select('id, performance')

    const uniqueActiveUsers = new Set(activeUsersData?.map((u: any) => u.user_id)).size
    const completedSessions = sessionsData?.filter((s: any) => s.status === 'completed') || []
    const totalSessions = sessionsData?.length || 0
    const avgDuration = completedSessions.reduce((acc: number, s: any) => acc + (s.metadata?.duration || 0), 0) / completedSessions.length || 0

    // Calculate prompt performance
    const promptPerformance: AdminMetrics['promptPerformance'] = {}
    promptsData?.forEach((prompt: any) => {
      if (prompt.performance) {
        promptPerformance[prompt.id] = {
          usageCount: prompt.performance.usage_count || 0,
          successRate: prompt.performance.success_rate || 0,
          avgResponseTime: 2500, // Mock data - would be calculated from actual response times
          satisfactionScore: prompt.performance.avg_satisfaction_score || 0
        }
      }
    })

    return {
      systemUsage: {
        totalSessions,
        activeUsers: uniqueActiveUsers,
        averageSessionDuration: avgDuration,
        completionRate: completedSessions.length / totalSessions || 0
      },
      promptPerformance,
      archetypeDistribution: {}, // Would be calculated from session results
      aiModelPerformance: {
        'gpt-4-turbo': {
          accuracy: 0.87,
          responseTime: 2100,
          costPerRequest: 0.03,
          errorRate: 0.02
        }
      }
    }
  }

  // AI Model Configuration
  async createAIModelConfig(config: Omit<AIModelConfig, 'id'>) {
    const { data, error } = await this.client
      .from('ai_model_configs')
      .insert({
        ...config,
        id: crypto.randomUUID()
      })
      .select()
      .single()

    if (error) throw error
    return data as AIModelConfig
  }

  async updateAIModelConfig(id: string, updates: Partial<AIModelConfig>) {
    const { data, error } = await this.client
      .from('ai_model_configs')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) throw error
    return data as AIModelConfig
  }

  async getAIModelConfigs(activeOnly = true): Promise<AIModelConfig[]> {
    let query = this.client
      .from('ai_model_configs')
      .select('*')
      .order('name', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as AIModelConfig[]
  }

  // Research Projects
  async createResearchProject(project: Omit<ResearchProject, 'id' | 'createdAt' | 'updatedAt'>) {
    const { data, error } = await this.client
      .from('research_projects')
      .insert({
        ...project,
        id: crypto.randomUUID(),
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) throw error
    return data as ResearchProject
  }

  async getResearchProjects(status?: ResearchProject['status']): Promise<ResearchProject[]> {
    let query = this.client
      .from('research_projects')
      .select('*')
      .order('created_at', { ascending: false })

    if (status) {
      query = query.eq('status', status)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as ResearchProject[]
  }

  // Cultural Context Management
  async createCulturalContext(context: Omit<CulturalContext, 'id'>) {
    const { data, error } = await this.client
      .from('cultural_contexts')
      .insert({
        ...context,
        id: crypto.randomUUID()
      })
      .select()
      .single()

    if (error) throw error
    return data as CulturalContext
  }

  async getCulturalContexts(activeOnly = true): Promise<CulturalContext[]> {
    let query = this.client
      .from('cultural_contexts')
      .select('*')
      .order('region', { ascending: true })

    if (activeOnly) {
      query = query.eq('is_active', true)
    }

    const { data, error } = await query
    if (error) throw error
    return (data || []) as CulturalContext[]
  }

  // Bulk Operations for Testing & Research
  async bulkCreatePromptTemplates(templates: Omit<PromptTemplate, 'id' | 'createdAt' | 'updatedAt' | 'performance'>[]): Promise<PromptTemplate[]> {
    const templateData = templates.map(template => ({
      ...template,
      id: crypto.randomUUID(),
      performance: {
        success_rate: 0,
        avg_satisfaction_score: 0,
        usage_count: 0
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }))

    const { data, error } = await this.client
      .from('prompt_templates')
      .insert(templateData)
      .select()

    if (error) throw error
    return (data || []) as PromptTemplate[]
  }

  // Analytics & Insights
  async getArchetypeUsageAnalytics(timeRange: 'day' | 'week' | 'month' | 'year' = 'month') {
    const startDate = new Date()
    switch (timeRange) {
      case 'day':
        startDate.setDate(startDate.getDate() - 1)
        break
      case 'week':
        startDate.setDate(startDate.getDate() - 7)
        break
      case 'month':
        startDate.setMonth(startDate.getMonth() - 1)
        break
      case 'year':
        startDate.setFullYear(startDate.getFullYear() - 1)
        break
    }

    const { data, error } = await this.client
      .from('analysis_sessions')
      .select('results, created_at')
      .gte('created_at', startDate.toISOString())
      .eq('status', 'completed')

    if (error) throw error
    return data
  }
} 