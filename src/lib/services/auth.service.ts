import { createClient } from '@/lib/supabase/client'
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

    // For email confirmation flow, we don't create the profile immediately
    // The profile will be created when the user confirms their email
    // and signs in for the first time

    return { user: authData.user, profile: null }
  }

  async signIn(email: string, password: string) {
    const supabase = createClient()

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    })

    if (error) throw error

    // Ensure profile exists after successful login
    if (data.user) {
      await this.ensureProfileExists(data.user)
    }

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
    const supabase = createClient()
    const { data: { user }, error } = await supabase.auth.getUser()

    if (error || !user) return null

    // Get profile data
    const profileRepo = new ProfileRepository(supabase)
    let profile = await profileRepo.findById(user.id)

    // If profile doesn't exist, create it (for users who signed up but haven't had a profile created yet)
    if (!profile && user.email) {
      try {
        profile = await profileRepo.create({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar_url: null,
          stripe_customer_id: null,
          subscription_end_date: null
        })
      } catch (createError) {
        console.error('Failed to create profile:', createError)
        // Continue without profile if creation fails
      }
    }

    return { user, profile }
  }

  private async ensureProfileExists(user: { id: string; email?: string; user_metadata?: { full_name?: string } }) {
    const supabase = createClient()
    const profileRepo = new ProfileRepository(supabase)

    try {
      // Check if profile exists
      const existingProfile = await profileRepo.findById(user.id)

      if (!existingProfile && user.email) {
        // Create profile if it doesn't exist
        await profileRepo.create({
          id: user.id,
          email: user.email,
          full_name: user.user_metadata?.full_name || null,
          subscription_status: 'free',
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          avatar_url: null,
          stripe_customer_id: null,
          subscription_end_date: null
        })
      }
    } catch (error) {
      console.error('Error ensuring profile exists:', error)
      // Don't throw error - allow login to continue even if profile creation fails
    }
  }

  async updateProfile(userId: string, data: Partial<Profile>) {
    const supabase = createClient()
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
    const supabase = createClient()
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