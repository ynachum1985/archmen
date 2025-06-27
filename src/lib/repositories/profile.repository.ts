import { BaseRepository } from './base.repository'
import { Database } from '@/lib/types/database'
import { SupabaseClient } from '@supabase/supabase-js'

type Profile = Database['public']['Tables']['profiles']['Row']

export class ProfileRepository extends BaseRepository<'profiles'> {
  constructor(client: SupabaseClient<Database>) {
    super(client, 'profiles')
  }

  async findByEmail(email: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('email', email)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async findByStripeCustomerId(customerId: string): Promise<Profile | null> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .eq('stripe_customer_id', customerId)
      .single()

    if (error && error.code !== 'PGRST116') throw error
    return data
  }

  async updateSubscription(
    userId: string,
    subscriptionData: {
      subscription_status: Profile['subscription_status']
      subscription_end_date?: string | null
      stripe_customer_id?: string | null
    }
  ): Promise<Profile> {
    const { data, error } = await this.client
      .from(this.tableName)
      .update({
        ...subscriptionData,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error
    return data
  }

  async getActiveSubscribers(): Promise<Profile[]> {
    const { data, error } = await this.client
      .from(this.tableName)
      .select('*')
      .neq('subscription_status', 'free')
      .gte('subscription_end_date', new Date().toISOString())

    if (error) throw error
    return data
  }
} 