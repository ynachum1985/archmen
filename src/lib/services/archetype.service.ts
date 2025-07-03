import { createClient } from '@supabase/supabase-js'
import type { Database } from '@/lib/types/database'

type Archetype = Database['public']['Tables']['enhanced_archetypes']['Row']
type LinguisticPattern = Database['public']['Tables']['linguistic_patterns']['Row']
type NewArchetype = Database['public']['Tables']['enhanced_archetypes']['Insert']
type NewLinguisticPattern = Database['public']['Tables']['linguistic_patterns']['Insert']

export class ArchetypeService {
  private supabase = createClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

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

  async getArchetypesByCategory(category: string): Promise<Archetype[]> {
    const { data, error } = await this.supabase
      .from('enhanced_archetypes')
      .select('*')
      .eq('category', category)
      .order('name')

    if (error) {
      console.error('Error fetching archetypes by category:', error)
      throw error
    }

    return data || []
  }

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

  async getArchetypeCategories(): Promise<string[]> {
    const { data, error } = await this.supabase
      .from('enhanced_archetypes')
      .select('category')
      .order('category')

    if (error) {
      console.error('Error fetching archetype categories:', error)
      throw error
    }

    const categories = [...new Set(data?.map((item: { category: string }) => item.category) || [])]
    return categories
  }
}

export const archetypeService = new ArchetypeService() 