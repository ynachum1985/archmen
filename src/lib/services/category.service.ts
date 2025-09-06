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
    // For now, return default categories until database is updated
    const defaultCategories = await this.getDefaultCategories()
    return defaultCategories.map((name, index) => ({
      id: `default-${index}`,
      name,
      description: `Assessment category for ${name.toLowerCase()}`,
      color: ['blue', 'green', 'purple', 'orange', 'red', 'indigo', 'pink', 'teal', 'yellow', 'gray'][index % 10],
      icon: ['Heart', 'Briefcase', 'TrendingUp', 'Moon', 'Palette', 'Compass', 'MessageCircle', 'Shield', 'Brain', 'Star'][index % 10],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      is_active: true
    }))
  }

  async createCategory(category: Omit<AssessmentCategory, 'id' | 'created_at' | 'updated_at'>): Promise<AssessmentCategory> {
    // For now, simulate category creation until database is updated
    return {
      id: `custom-${Date.now()}`,
      ...category,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }
  }

  async updateCategory(id: string, updates: Partial<AssessmentCategory>): Promise<AssessmentCategory> {
    // For now, simulate category update until database is updated
    const categories = await this.getAllCategories()
    const category = categories.find(c => c.id === id)
    if (!category) {
      throw new Error('Category not found')
    }
    return {
      ...category,
      ...updates,
      updated_at: new Date().toISOString()
    }
  }

  async deleteCategory(id: string): Promise<void> {
    // For now, simulate category deletion until database is updated
    console.log('Category deleted:', id)
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
