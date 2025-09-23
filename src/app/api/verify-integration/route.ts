import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { integration_id, ai_response } = await request.json()

    if (!integration_id || !ai_response) {
      return NextResponse.json(
        { error: 'Missing integration_id or ai_response' },
        { status: 400 }
      )
    }

    const supabase = createClient()

    // Get integration details
    const { data: integration, error: integrationError } = await supabase
      .from('content_integrations')
      .select(`
        *,
        archetype_media (
          file_name,
          media_type,
          description
        ),
        enhanced_archetypes (
          name,
          description
        )
      `)
      .eq('id', integration_id)
      .single()

    if (integrationError || !integration) {
      return NextResponse.json(
        { error: 'Integration not found' },
        { status: 404 }
      )
    }

    // Create AI verification prompt based on integration type
    let verificationPrompt = ''
    
    switch (integration.integration_type) {
      case 'video_watched':
        verificationPrompt = `
          The user watched a video about the ${integration.enhanced_archetypes?.name} archetype.
          Video: ${integration.archetype_media?.file_name}
          Description: ${integration.archetype_media?.description}
          
          User's reflection: "${ai_response}"
          
          Evaluate if the user demonstrates understanding of:
          1. Key concepts from the video
          2. Personal insights about how this archetype shows up in their life
          3. Emotional awareness and integration
          4. Readiness to apply these insights
          
          Rate their integration on a scale of 0-100 and provide specific feedback.
          Consider their emotional maturity and depth of reflection.
        `
        break

      case 'exercise_completed':
        verificationPrompt = `
          The user completed an exercise related to the ${integration.enhanced_archetypes?.name} archetype.
          
          User's response: "${ai_response}"
          
          Evaluate if the user demonstrates:
          1. Genuine engagement with the exercise
          2. Self-awareness and honest reflection
          3. Integration of archetypal insights
          4. Emotional processing and growth
          5. Practical application potential
          
          Rate their integration on a scale of 0-100 and provide constructive feedback.
        `
        break

      case 'shadow_work':
        verificationPrompt = `
          The user engaged in shadow work related to the ${integration.enhanced_archetypes?.name} archetype.
          
          User's reflection: "${ai_response}"
          
          Evaluate if the user demonstrates:
          1. Courage to face difficult aspects of themselves
          2. Understanding of shadow patterns
          3. Emotional regulation during difficult insights
          4. Integration rather than just intellectual understanding
          5. Readiness for deeper work
          
          Shadow work requires high emotional maturity. Rate their integration on a scale of 0-100.
          Be especially careful about readiness for advanced concepts.
        `
        break

      default:
        verificationPrompt = `
          The user completed a ${integration.integration_type} activity.
          
          User's response: "${ai_response}"
          
          Evaluate their level of integration and understanding on a scale of 0-100.
          Provide specific feedback on their readiness to proceed.
        `
    }

    // Call OpenAI for verification
    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: `You are an expert in Jungian psychology and archetypal integration. Your role is to assess whether users have genuinely integrated content and are ready for more advanced work.

          Respond with a JSON object containing:
          {
            "passed": boolean,
            "score": number (0-100),
            "feedback": "detailed feedback string",
            "emotional_maturity_assessment": number (1-10),
            "readiness_for_advanced_work": boolean,
            "specific_insights": ["insight1", "insight2"],
            "areas_for_growth": ["area1", "area2"]
          }

          Scoring guidelines:
          - 90-100: Exceptional integration, ready for advanced concepts
          - 80-89: Strong integration, ready to proceed
          - 70-79: Good integration, may proceed with support
          - 60-69: Moderate integration, needs more work
          - Below 60: Insufficient integration, should not proceed

          Be thorough but compassionate. The goal is growth, not gatekeeping.`
        },
        {
          role: 'user',
          content: verificationPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const aiResult = completion.choices[0]?.message?.content
    if (!aiResult) {
      throw new Error('No response from AI verification')
    }

    // Parse AI response
    let verificationResult
    try {
      verificationResult = JSON.parse(aiResult)
    } catch (parseError) {
      // Fallback if JSON parsing fails
      verificationResult = {
        passed: false,
        score: 50,
        feedback: 'Unable to parse AI verification response. Please try again.',
        emotional_maturity_assessment: 5,
        readiness_for_advanced_work: false,
        specific_insights: [],
        areas_for_growth: ['Complete the reflection more thoroughly']
      }
    }

    // Update user progression if they passed with high score
    if (verificationResult.passed && verificationResult.score >= 80) {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        // Update emotional maturity score if it's higher
        await supabase
          .from('user_progression')
          .update({
            emotional_maturity_score: verificationResult.emotional_maturity_assessment,
            integration_scores: supabase.raw(`
              COALESCE(integration_scores, '{}') || 
              jsonb_build_object('${integration.integration_type}', ${verificationResult.score})
            `),
            updated_at: new Date().toISOString()
          })
          .eq('user_id', user.id)
      }
    }

    return NextResponse.json({
      passed: verificationResult.passed,
      score: verificationResult.score,
      feedback: verificationResult.feedback,
      emotional_maturity_assessment: verificationResult.emotional_maturity_assessment,
      readiness_for_advanced_work: verificationResult.readiness_for_advanced_work,
      specific_insights: verificationResult.specific_insights || [],
      areas_for_growth: verificationResult.areas_for_growth || []
    })

  } catch (error) {
    console.error('Error in AI verification:', error)
    return NextResponse.json(
      { 
        error: 'Verification failed',
        passed: false,
        score: 0,
        feedback: 'Technical error occurred during verification. Please try again.'
      },
      { status: 500 }
    )
  }
}
