// Auto-generated database types from Supabase
// Generated with: npx supabase gen types typescript --project-id rkqujvonllmxjkkkeqsy

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      archetype_results: {
        Row: {
          archetype_scores: Json
          assessment_id: string
          created_at: string | null
          id: string
          recommendations: Json
          shadow_patterns: Json
        }
        Insert: {
          archetype_scores: Json
          assessment_id: string
          created_at?: string | null
          id?: string
          recommendations: Json
          shadow_patterns: Json
        }
        Update: {
          archetype_scores?: Json
          assessment_id?: string
          created_at?: string | null
          id?: string
          recommendations?: Json
          shadow_patterns?: Json
        }
        Relationships: [
          {
            foreignKeyName: "archetype_results_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_questions: {
        Row: {
          archetype_indicators: Json | null
          created_at: string | null
          id: string
          is_required: boolean | null
          metadata: Json | null
          options: Json | null
          order_index: number
          question_text: string
          question_type: string
          scoring_weights: Json | null
          template_id: string
          updated_at: string | null
        }
        Insert: {
          archetype_indicators?: Json | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          options?: Json | null
          order_index?: number
          question_text: string
          question_type?: string
          scoring_weights?: Json | null
          template_id: string
          updated_at?: string | null
        }
        Update: {
          archetype_indicators?: Json | null
          created_at?: string | null
          id?: string
          is_required?: boolean | null
          metadata?: Json | null
          options?: Json | null
          order_index?: number
          question_text?: string
          question_type?: string
          scoring_weights?: Json | null
          template_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assessment_questions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "assessment_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_responses: {
        Row: {
          created_at: string | null
          id: string
          question_id: string
          response_data: Json | null
          response_value: string
          session_id: string | null
          template_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          question_id: string
          response_data?: Json | null
          response_value: string
          session_id?: string | null
          template_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          question_id?: string
          response_data?: Json | null
          response_value?: string
          session_id?: string | null
          template_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_responses_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "assessment_questions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "assessment_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_responses_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      assessment_sessions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_question_index: number | null
          discovered_archetypes: Json | null
          id: string
          progress_percentage: number | null
          session_data: Json | null
          status: string
          template_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_question_index?: number | null
          discovered_archetypes?: Json | null
          id?: string
          progress_percentage?: number | null
          session_data?: Json | null
          status?: string
          template_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_question_index?: number | null
          discovered_archetypes?: Json | null
          id?: string
          progress_percentage?: number | null
          session_data?: Json | null
          status?: string
          template_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessment_sessions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "assessment_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "assessment_sessions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_personalities: {
        Row: {
          id: string
          name: string
          description: string
          open_ended_questions: string[]
          clarifying_questions: string[]
          goals: string[]
          behavior_traits: string[]
          system_prompt_template: string
          is_active: boolean
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description: string
          open_ended_questions?: string[]
          clarifying_questions?: string[]
          goals?: string[]
          behavior_traits?: string[]
          system_prompt_template: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string
          open_ended_questions?: string[]
          clarifying_questions?: string[]
          goals?: string[]
          behavior_traits?: string[]
          system_prompt_template?: string
          is_active?: boolean
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      assessment_templates: {
        Row: {
          archetype_focus: string[] | null
          category: string
          completion_text: string | null
          created_at: string | null
          description: string | null
          estimated_duration_minutes: number | null
          id: string
          intro_text: string | null
          is_active: boolean | null
          is_free: boolean | null
          metadata: Json | null
          name: string
          updated_at: string | null
        }
        Insert: {
          archetype_focus?: string[] | null
          category?: string
          completion_text?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          intro_text?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string | null
        }
        Update: {
          archetype_focus?: string[] | null
          category?: string
          completion_text?: string | null
          created_at?: string | null
          description?: string | null
          estimated_duration_minutes?: number | null
          id?: string
          intro_text?: string | null
          is_active?: boolean | null
          is_free?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      assessments: {
        Row: {
          created_at: string | null
          id: string
          questions: Json | null
          responses: Json | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          questions?: Json | null
          responses?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          questions?: Json | null
          responses?: Json | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assessments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          assessment_id: string | null
          created_at: string | null
          id: string
          messages: Json | null
          metadata: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          metadata?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          assessment_id?: string | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversations_assessment_id_fkey"
            columns: ["assessment_id"]
            isOneToOne: false
            referencedRelation: "assessments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "conversations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      course_enrollments: {
        Row: {
          completed_at: string | null
          course_id: string
          created_at: string | null
          id: string
          progress: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          course_id: string
          created_at?: string | null
          id?: string
          progress?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          course_id?: string
          created_at?: string | null
          id?: string
          progress?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "course_enrollments_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "course_enrollments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      courses: {
        Row: {
          archetype_focus: string[] | null
          created_at: string | null
          description: string
          id: string
          is_published: boolean | null
          order_index: number | null
          price_lifetime: number
          price_monthly: number
          price_yearly: number
          slug: string
          title: string
          updated_at: string | null
        }
        Insert: {
          archetype_focus?: string[] | null
          created_at?: string | null
          description: string
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          price_lifetime: number
          price_monthly: number
          price_yearly: number
          slug: string
          title: string
          updated_at?: string | null
        }
        Update: {
          archetype_focus?: string[] | null
          created_at?: string | null
          description?: string
          id?: string
          is_published?: boolean | null
          order_index?: number | null
          price_lifetime?: number
          price_monthly?: number
          price_yearly?: number
          slug?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      enhanced_archetypes: {
        Row: {
          category: string
          created_at: string
          description: string
          id: string
          impact_score: number
          is_active: boolean | null
          name: string
          psychology_profile: Json | null
          traits: Json | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          description: string
          id?: string
          impact_score: number
          is_active?: boolean | null
          name: string
          psychology_profile?: Json | null
          traits?: Json | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string
          id?: string
          impact_score?: number
          is_active?: boolean | null
          name?: string
          psychology_profile?: Json | null
          traits?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      linguistic_patterns: {
        Row: {
          archetype_name: string
          behavioral_patterns: string[] | null
          category: string
          created_at: string
          emotional_indicators: string[] | null
          id: string
          keywords: string[] | null
          phrases: string[] | null
          updated_at: string
        }
        Insert: {
          archetype_name: string
          behavioral_patterns?: string[] | null
          category: string
          created_at?: string
          emotional_indicators?: string[] | null
          id?: string
          keywords?: string[] | null
          phrases?: string[] | null
          updated_at?: string
        }
        Update: {
          archetype_name?: string
          behavioral_patterns?: string[] | null
          category?: string
          created_at?: string
          emotional_indicators?: string[] | null
          id?: string
          keywords?: string[] | null
          phrases?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "linguistic_patterns_archetype_name_fkey"
            columns: ["archetype_name"]
            isOneToOne: false
            referencedRelation: "enhanced_archetypes"
            referencedColumns: ["name"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          email: string
          full_name: string | null
          id: string
          stripe_customer_id: string | null
          subscription_end_date: string | null
          subscription_status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          email: string
          full_name?: string | null
          id: string
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          email?: string
          full_name?: string | null
          id?: string
          stripe_customer_id?: string | null
          subscription_end_date?: string | null
          subscription_status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const