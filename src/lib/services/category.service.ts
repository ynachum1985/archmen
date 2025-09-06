import { createClient } from '@/lib/supabase/client'

export interface AssessmentCategory {
  id: string
  name: string
  description: string
  color: string
  icon: string
  created_at: string
  updated_at: string
  is_active: boolean
}

export class CategoryService {
  private supabase = createClient()

  async getAllCategories(): Promise<AssessmentCategory[]> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('assessment_categories')
      .select('*')
      .eq('is_active', true)
      .order('name')

    if (error) {
      console.error('Error fetching categories:', error)
      throw error
    }

    return data || []
  }

  async createCategory(category: Omit<AssessmentCategory, 'id' | 'created_at' | 'updated_at'>): Promise<AssessmentCategory> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('assessment_categories')
      .insert({
        ...category,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      })
      .select()
      .single()

    if (error) {
      console.error('Error creating category:', error)
      throw error
    }

    return data
  }

  async updateCategory(id: string, updates: Partial<AssessmentCategory>): Promise<AssessmentCategory> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { data, error } = await (this.supabase as any)
      .from('assessment_categories')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating category:', error)
      throw error
    }

    return data
  }

  async deleteCategory(id: string): Promise<void> {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { error } = await (this.supabase as any)
      .from('assessment_categories')
      .update({ is_active: false })
      .eq('id', id)

    if (error) {
      console.error('Error deleting category:', error)
      throw error
    }
  }

  // Get default categories if none exist
  async getDefaultCategories(): Promise<string[]> {
    return [
      'Relationships',
      'Career & Leadership', 
      'Personal Growth',
      'Shadow Work',
      'Creativity & Innovation',
      'Life Purpose',
      'Communication',
      'Conflict Resolution',
      'Emotional Intelligence',
      'Spiritual Development'
    ]
  }

  // Initialize default categories
  async initializeDefaultCategories(): Promise<void> {
    const existingCategories = await this.getAllCategories()
    
    if (existingCategories.length === 0) {
      const defaultCategories = await this.getDefaultCategories()
      const colors = ['blue', 'green', 'purple', 'orange', 'red', 'indigo', 'pink', 'teal', 'yellow', 'gray']
      const icons = ['Heart', 'Briefcase', 'TrendingUp', 'Moon', 'Palette', 'Compass', 'MessageCircle', 'Shield', 'Brain', 'Star']
      
      for (let i = 0; i < defaultCategories.length; i++) {
        await this.createCategory({
          name: defaultCategories[i],
          description: `Assessment category for ${defaultCategories[i].toLowerCase()}`,
          color: colors[i % colors.length],
          icon: icons[i % icons.length],
          is_active: true
        })
      }
    }
  }
}
