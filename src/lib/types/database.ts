// This file contains the TypeScript types for your Supabase database
// You can generate this file using the Supabase CLI:
// npx supabase gen types typescript --project-id your-project-id > src/lib/types/database.ts

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          email: string
          full_name: string | null
          avatar_url: string | null
          subscription_status: 'free' | 'monthly' | 'yearly' | 'lifetime'
          subscription_end_date: string | null
          stripe_customer_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          email: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'monthly' | 'yearly' | 'lifetime'
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          email?: string
          full_name?: string | null
          avatar_url?: string | null
          subscription_status?: 'free' | 'monthly' | 'yearly' | 'lifetime'
          subscription_end_date?: string | null
          stripe_customer_id?: string | null
        }
      }
      assessments: {
        Row: {
          id: string
          user_id: string
          created_at: string
          updated_at: string
          status: 'in_progress' | 'completed'
          questions: Json
          responses: Json
        }
        Insert: {
          id?: string
          user_id: string
          created_at?: string
          updated_at?: string
          status?: 'in_progress' | 'completed'
          questions?: Json
          responses?: Json
        }
        Update: {
          id?: string
          user_id?: string
          created_at?: string
          updated_at?: string
          status?: 'in_progress' | 'completed'
          questions?: Json
          responses?: Json
        }
      }
      archetype_results: {
        Row: {
          id: string
          assessment_id: string
          created_at: string
          archetype_scores: Json
          shadow_patterns: Json
          recommendations: Json
        }
        Insert: {
          id?: string
          assessment_id: string
          created_at?: string
          archetype_scores: Json
          shadow_patterns: Json
          recommendations: Json
        }
        Update: {
          id?: string
          assessment_id?: string
          created_at?: string
          archetype_scores?: Json
          shadow_patterns?: Json
          recommendations?: Json
        }
      }
      conversations: {
        Row: {
          id: string
          user_id: string
          assessment_id: string | null
          created_at: string
          updated_at: string
          messages: Json
          metadata: Json | null
        }
        Insert: {
          id?: string
          user_id: string
          assessment_id?: string | null
          created_at?: string
          updated_at?: string
          messages?: Json
          metadata?: Json | null
        }
        Update: {
          id?: string
          user_id?: string
          assessment_id?: string | null
          created_at?: string
          updated_at?: string
          messages?: Json
          metadata?: Json | null
        }
      }
      courses: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          title: string
          description: string
          slug: string
          archetype_focus: string[]
          price_monthly: number
          price_yearly: number
          price_lifetime: number
          is_published: boolean
          order_index: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          title: string
          description: string
          slug: string
          archetype_focus?: string[]
          price_monthly: number
          price_yearly: number
          price_lifetime: number
          is_published?: boolean
          order_index?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          title?: string
          description?: string
          slug?: string
          archetype_focus?: string[]
          price_monthly?: number
          price_yearly?: number
          price_lifetime?: number
          is_published?: boolean
          order_index?: number
        }
      }
      course_enrollments: {
        Row: {
          id: string
          user_id: string
          course_id: string
          created_at: string
          updated_at: string
          progress: Json
          completed_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          course_id: string
          created_at?: string
          updated_at?: string
          progress?: Json
          completed_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          course_id?: string
          created_at?: string
          updated_at?: string
          progress?: Json
          completed_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      subscription_status: 'free' | 'monthly' | 'yearly' | 'lifetime'
      assessment_status: 'in_progress' | 'completed'
    }
  }
} 