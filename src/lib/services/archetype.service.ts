import { createClient } from '@/lib/supabase/client'
import type { Database } from '@/lib/types/database'

type Archetype = Database['public']['Tables']['enhanced_archetypes']['Row']
type LinguisticPattern = Database['public']['Tables']['linguistic_patterns']['Row']
type NewArchetype = Database['public']['Tables']['enhanced_archetypes']['Insert']
type NewLinguisticPattern = Database['public']['Tables']['linguistic_patterns']['Insert']

export class ArchetypeService {
  private supabase = createClient()

  async getAllArchetypes(): Promise<Archetype[]> {
    const { data, error } = await this.supabase
      .from('enhanced_archetypes')
      .select('*')
      .order('name')

    if (error) {
      console.error('Error fetching archetypes:', error)
      throw error
    }

    return data || []
  }

  // Removed getArchetypesByCategory - categories no longer used

  async createArchetype(archetype: NewArchetype): Promise<Archetype> {
    const { data, error } = await this.supabase
      .from('enhanced_archetypes')
      .insert(archetype)
      .select()
      .single()

    if (error) {
      console.error('Error creating archetype:', error)
      throw error
    }

    return data
  }

  async updateArchetype(id: string, updates: Partial<NewArchetype>): Promise<Archetype> {
    const { data, error } = await this.supabase
      .from('enhanced_archetypes')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating archetype:', error)
      throw error
    }

    return data
  }

  async deleteArchetype(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('enhanced_archetypes')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting archetype:', error)
      throw error
    }
  }

  async getAllLinguisticPatterns(): Promise<LinguisticPattern[]> {
    const { data, error } = await this.supabase
      .from('linguistic_patterns')
      .select('*')
      .order('archetype_name')

    if (error) {
      console.error('Error fetching linguistic patterns:', error)
      throw error
    }

    return data || []
  }

  async getLinguisticPatternsByArchetype(archetypeName: string): Promise<LinguisticPattern[]> {
    const { data, error } = await this.supabase
      .from('linguistic_patterns')
      .select('*')
      .eq('archetype_name', archetypeName)

    if (error) {
      console.error('Error fetching linguistic patterns by archetype:', error)
      throw error
    }

    return data || []
  }

  async createLinguisticPattern(pattern: NewLinguisticPattern): Promise<LinguisticPattern> {
    const { data, error } = await this.supabase
      .from('linguistic_patterns')
      .insert(pattern)
      .select()
      .single()

    if (error) {
      console.error('Error creating linguistic pattern:', error)
      throw error
    }

    return data
  }

  async updateLinguisticPattern(id: string, updates: Partial<NewLinguisticPattern>): Promise<LinguisticPattern> {
    const { data, error } = await this.supabase
      .from('linguistic_patterns')
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating linguistic pattern:', error)
      throw error
    }

    return data
  }

  async deleteLinguisticPattern(id: string): Promise<void> {
    const { error } = await this.supabase
      .from('linguistic_patterns')
      .delete()
      .eq('id', id)

    if (error) {
      console.error('Error deleting linguistic pattern:', error)
      throw error
    }
  }

  // Removed getArchetypeCategories - categories no longer used

  // Assessment-specific methods

  // Get archetype by name for assessment results
  async getArchetypeByName(name: string): Promise<Archetype | null> {
    try {
      const { data, error } = await this.supabase
        .from('enhanced_archetypes')
        .select('*')
        .eq('name', name)
        .eq('is_active', true)
        .single()

      if (error) throw error
      return data
    } catch (error) {
      console.error('Error fetching archetype by name:', error)
      return null
    }
  }

  // Analyze text for archetype patterns using linguistic patterns
  async analyzeTextForArchetypes(text: string): Promise<Record<string, number>> {
    try {
      const patterns = await this.getAllLinguisticPatterns()
      const scores: Record<string, number> = {}

      // Initialize scores
      const archetypes = [...new Set(patterns.map(p => p.archetype_name))]
      archetypes.forEach(archetype => {
        scores[archetype] = 0
      })

      const lowerText = text.toLowerCase()

      // Score based on keyword matches
      patterns.forEach(pattern => {
        let archetypeScore = 0

        // Check patterns (simplified approach)
        if (pattern.patterns) {
          const patterns = pattern.patterns.toLowerCase()
          const words = patterns.split(/[,\n\r]+/).map(w => w.trim()).filter(w => w.length > 0)

          words.forEach(word => {
            if (lowerText.includes(word)) {
              archetypeScore += 0.1
            }
          })

          // Bonus for exact phrase matches
          const phrases = patterns.split(/\n+/).map(p => p.trim()).filter(p => p.length > 10)
          phrases.forEach(phrase => {
            if (lowerText.includes(phrase)) {
              archetypeScore += 0.3
            }
          })
        }

        scores[pattern.archetype_name] = Math.max(scores[pattern.archetype_name], archetypeScore)
      })

      // Normalize scores to 0-1 range
      const maxScore = Math.max(...Object.values(scores))
      if (maxScore > 0) {
        Object.keys(scores).forEach(archetype => {
          scores[archetype] = Math.min(1, scores[archetype] / maxScore)
        })
      }

      return scores
    } catch (error) {
      console.error('Error analyzing text for archetypes:', error)
      return {}
    }
  }

  // Get archetype recommendations based on scores
  async getArchetypeRecommendations(scores: Record<string, number>): Promise<{
    primary: Archetype | null
    secondary: Archetype | null
    recommendations: string[]
  }> {
    try {
      const sortedScores = Object.entries(scores)
        .sort(([,a], [,b]) => b - a)
        .filter(([,score]) => score > 0.3)

      const primary = sortedScores[0] ? await this.getArchetypeByName(sortedScores[0][0]) : null
      const secondary = sortedScores[1] ? await this.getArchetypeByName(sortedScores[1][0]) : null

      const recommendations: string[] = []

      if (primary) {
        recommendations.push(`Embrace your ${primary.name} energy by focusing on ${primary.description.toLowerCase()}`)

        // Add shadow work recommendations
        const shadowInfo = primary.psychology_profile as Record<string, unknown>
        if (shadowInfo?.shadow && typeof shadowInfo.shadow === 'string') {
          recommendations.push(`Be aware of your shadow tendency toward ${shadowInfo.shadow.toLowerCase()}`)
        }
      }

      if (secondary) {
        recommendations.push(`Develop your ${secondary.name} qualities to balance your primary archetype`)
      }

      return { primary, secondary, recommendations }
    } catch (error) {
      console.error('Error getting archetype recommendations:', error)
      return { primary: null, secondary: null, recommendations: [] }
    }
  }
}

export const archetypeService = new ArchetypeService() 