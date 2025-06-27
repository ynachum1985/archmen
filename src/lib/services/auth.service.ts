import { createClient } from '@/lib/supabase/client'
import { createClient as createServerClient } from '@/lib/supabase/server'
import { ProfileRepository } from '@/lib/repositories/profile.repository'
import type { Database } from '@/lib/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export class AuthService {
  async signUp(email: string, password: string, fullName?: string) {
    const supabase = createClient()
    
    // Sign up with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: fullName,
        }
      }
    })

    if (authError) throw authError
    if (!authData.user) throw new Error('Failed to create user')

    // Create profile
    const profileRepo = new ProfileRepository(supabase)
    const profile = await profileRepo.create({
      id: authData.user.id,
      email: authData.user.email!,
      full_name: fullName,
      subscription_status: 'free',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    })

    return { user: authData.user, profile }
  }

  async signIn(email: string, password: string) {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error
    return data
  }

  async signInWithProvider(provider: 'google' | 'github') {
    const supabase = createClient()
    
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) throw error
    return data
  }

  async signOut() {
    const supabase = createClient()
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  }

  async getCurrentUser() {
    const supabase = await createServerClient()
    const { data: { user }, error } = await supabase.auth.getUser()
    
    if (error || !user) return null
    
    // Get profile data
    const profileRepo = new ProfileRepository(supabase)
    const profile = await profileRepo.findById(user.id)
    
    return { user, profile }
  }

  async updateProfile(userId: string, data: Partial<Profile>) {
    const supabase = await createServerClient()
    const profileRepo = new ProfileRepository(supabase)
    return profileRepo.update(userId, data)
  }

  async resetPassword(email: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`,
    })

    if (error) throw error
  }

  async updatePassword(newPassword: string) {
    const supabase = createClient()
    
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error
  }

  async checkSubscriptionStatus(userId: string): Promise<Profile['subscription_status']> {
    const supabase = await createServerClient()
    const profileRepo = new ProfileRepository(supabase)
    const profile = await profileRepo.findById(userId)
    
    if (!profile) throw new Error('Profile not found')
    
    // Check if subscription has expired
    if (profile.subscription_end_date && new Date(profile.subscription_end_date) < new Date()) {
      // Update to free if expired
      await profileRepo.update(userId, {
        subscription_status: 'free',
        subscription_end_date: null
      })
      return 'free'
    }
    
    return profile.subscription_status
  }
} 