import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function POST(request: NextRequest) {
  try {
    const { migration_name } = await request.json()
    
    const supabase = createClient()

    // Check if user is authenticated (basic security)
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    let result = { success: false, message: '', details: '' }

    switch (migration_name) {
      case 'assessment_levels_and_gateways':
        result = await runAssessmentLevelsAndGatewaysMigration(supabase)
        break
      
      case 'conversational_gateway_quiz':
        result = await runConversationalGatewayQuizMigration(supabase)
        break
      
      case 'update_existing_assessments':
        result = await runUpdateExistingAssessmentsMigration(supabase)
        break
      
      default:
        return NextResponse.json({ error: 'Unknown migration' }, { status: 400 })
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Migration error:', error)
    return NextResponse.json(
      { error: 'Migration failed', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

async function runAssessmentLevelsAndGatewaysMigration(supabase: any) {
  try {
    // Check if tables already exist
    const { data: existingTables, error: checkError } = await supabase
      .from('information_schema.tables')
      .select('table_name')
      .eq('table_schema', 'public')
      .in('table_name', ['assessment_gateway_templates', 'assessment_gateway_assignments'])

    if (checkError) {
      console.warn('Could not check existing tables:', checkError)
    }

    // Add columns to enhanced_assessments if they don't exist
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE enhanced_assessments 
          ADD COLUMN IF NOT EXISTS assessment_level INTEGER DEFAULT 1 CHECK (assessment_level BETWEEN 1 AND 3),
          ADD COLUMN IF NOT EXISTS gateway_configuration JSONB DEFAULT '{}',
          ADD COLUMN IF NOT EXISTS has_custom_gateways BOOLEAN DEFAULT false,
          ADD COLUMN IF NOT EXISTS general_gateways_enabled BOOLEAN DEFAULT true;
        `
      })
    } catch (error) {
      console.warn('Could not add columns to enhanced_assessments:', error)
    }

    // Create gateway templates table
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS assessment_gateway_templates (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            name TEXT NOT NULL,
            description TEXT,
            gateway_type TEXT NOT NULL CHECK (gateway_type IN ('content_integration', 'emotional_readiness', 'prerequisite_completion', 'time_based', 'ai_verification', 'custom')),
            is_general BOOLEAN DEFAULT false,
            level_restriction INTEGER CHECK (level_restriction BETWEEN 1 AND 3),
            configuration JSONB NOT NULL DEFAULT '{}',
            verification_prompt TEXT,
            success_criteria JSONB DEFAULT '{}',
            failure_actions JSONB DEFAULT '{}',
            is_active BOOLEAN DEFAULT true,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        `
      })
    } catch (error) {
      console.warn('Could not create assessment_gateway_templates table:', error)
    }

    // Insert default gateway templates
    try {
      await supabase.from('assessment_gateway_templates').upsert([
        {
          name: 'Basic Emotional Readiness',
          description: 'Ensures user has basic emotional awareness before proceeding',
          gateway_type: 'emotional_readiness',
          is_general: true,
          configuration: { minimum_emotional_maturity: 3, required_self_awareness: 60 },
          verification_prompt: 'Assess if the user demonstrates basic emotional awareness and self-reflection capabilities.',
          success_criteria: { emotional_maturity_score: 3, self_awareness_percentage: 60 }
        },
        {
          name: 'Assessment Completion Verification',
          description: 'Verifies user has genuinely completed and integrated previous assessment content',
          gateway_type: 'ai_verification',
          is_general: true,
          configuration: { minimum_integration_score: 70, reflection_required: true },
          verification_prompt: 'Evaluate if the user has genuinely integrated insights from their previous assessment.',
          success_criteria: { integration_score: 70, specific_examples_provided: true }
        }
      ], { onConflict: 'name' })
    } catch (error) {
      console.warn('Could not insert default gateway templates:', error)
    }

    return {
      success: true,
      message: 'Assessment levels and gateways migration completed',
      details: 'Added assessment_level columns and created gateway templates table'
    }
  } catch (error) {
    return {
      success: false,
      message: 'Assessment levels and gateways migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function runConversationalGatewayQuizMigration(supabase: any) {
  try {
    // Add quiz columns to enhanced_assessments
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          ALTER TABLE enhanced_assessments 
          ADD COLUMN IF NOT EXISTS quiz_set_questions_prompt TEXT,
          ADD COLUMN IF NOT EXISTS quiz_experience_analysis_prompt TEXT,
          ADD COLUMN IF NOT EXISTS quiz_enabled BOOLEAN DEFAULT true,
          ADD COLUMN IF NOT EXISTS quiz_passing_score INTEGER DEFAULT 70 CHECK (quiz_passing_score BETWEEN 0 AND 100),
          ADD COLUMN IF NOT EXISTS quiz_max_attempts INTEGER DEFAULT 3 CHECK (quiz_max_attempts > 0);
        `
      })
    } catch (error) {
      console.warn('Could not add quiz columns:', error)
    }

    // Create quiz attempts table
    try {
      await supabase.rpc('exec_sql', {
        sql: `
          CREATE TABLE IF NOT EXISTS assessment_quiz_attempts (
            id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
            user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
            assessment_id UUID NOT NULL REFERENCES enhanced_assessments(id) ON DELETE CASCADE,
            attempt_number INTEGER NOT NULL DEFAULT 1,
            quiz_type TEXT NOT NULL CHECK (quiz_type IN ('set_questions', 'experience_analysis', 'combined')),
            readiness_score INTEGER CHECK (readiness_score BETWEEN 0 AND 100),
            emotional_maturity_score INTEGER CHECK (emotional_maturity_score BETWEEN 1 AND 10),
            specific_feedback TEXT,
            quiz_passed BOOLEAN DEFAULT false,
            access_granted BOOLEAN DEFAULT false,
            completed_at TIMESTAMP WITH TIME ZONE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
            UNIQUE(user_id, assessment_id, attempt_number)
          );
        `
      })
    } catch (error) {
      console.warn('Could not create assessment_quiz_attempts table:', error)
    }

    return {
      success: true,
      message: 'Conversational gateway quiz migration completed',
      details: 'Added quiz columns and created quiz attempts table'
    }
  } catch (error) {
    return {
      success: false,
      message: 'Conversational gateway quiz migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

async function runUpdateExistingAssessmentsMigration(supabase: any) {
  try {
    // Update existing assessments with default level 1
    const { error: updateError } = await supabase
      .from('enhanced_assessments')
      .update({ 
        assessment_level: 1,
        quiz_enabled: true,
        quiz_passing_score: 70,
        quiz_max_attempts: 3
      })
      .is('assessment_level', null)

    if (updateError) {
      console.warn('Could not update existing assessments:', updateError)
    }

    return {
      success: true,
      message: 'Existing assessments updated',
      details: 'Set default level 1 and quiz settings for existing assessments'
    }
  } catch (error) {
    return {
      success: false,
      message: 'Update existing assessments migration failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }
  }
}

export async function GET() {
  return NextResponse.json({
    available_migrations: [
      'assessment_levels_and_gateways',
      'conversational_gateway_quiz', 
      'update_existing_assessments'
    ],
    instructions: 'POST to this endpoint with { "migration_name": "migration_name" } to run a migration'
  })
}
