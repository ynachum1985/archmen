import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import OpenAI from 'openai'

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
})

export async function POST(request: NextRequest) {
  try {
    const { 
      action, 
      user_id, 
      assessment_id, 
      conversation_id,
      user_message,
      quiz_attempt_id 
    } = await request.json()

    const supabase = createClient()

    switch (action) {
      case 'check_access':
        return await checkQuizAccess(supabase, user_id, assessment_id)
      
      case 'start_quiz':
        return await startQuiz(supabase, user_id, assessment_id, conversation_id)
      
      case 'process_response':
        return await processQuizResponse(supabase, quiz_attempt_id, user_message)
      
      case 'complete_quiz':
        return await completeQuiz(supabase, quiz_attempt_id)
      
      default:
        return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
    }
  } catch (error) {
    console.error('Error in assessment quiz API:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

async function checkQuizAccess(supabase: any, userId: string, assessmentId: string) {
  try {
    const { data, error } = await supabase
      .rpc('check_assessment_quiz_access', {
        p_user_id: userId,
        p_assessment_id: assessmentId
      })

    if (error) throw error

    return NextResponse.json({ access_result: data })
  } catch (error) {
    console.error('Error checking quiz access:', error)
    return NextResponse.json({ error: 'Failed to check access' }, { status: 500 })
  }
}

async function startQuiz(supabase: any, userId: string, assessmentId: string, conversationId?: string) {
  try {
    // Get assessment details
    const { data: assessment, error: assessmentError } = await supabase
      .from('enhanced_assessments')
      .select('name, assessment_level, quiz_set_questions_prompt, quiz_experience_analysis_prompt')
      .eq('id', assessmentId)
      .single()

    if (assessmentError) throw assessmentError

    // Start new quiz attempt
    const { data: attemptId, error: attemptError } = await supabase
      .rpc('start_quiz_attempt', {
        p_user_id: userId,
        p_assessment_id: assessmentId,
        p_conversation_id: conversationId
      })

    if (attemptError) throw attemptError

    // Get user's previous assessment history for experience analysis
    const { data: userHistory, error: historyError } = await supabase
      .from('assessment_quiz_attempts')
      .select(`
        assessment_id,
        readiness_score,
        emotional_maturity_score,
        completed_at,
        enhanced_assessments!inner(name, assessment_level)
      `)
      .eq('user_id', userId)
      .eq('quiz_passed', true)
      .order('completed_at', { ascending: false })

    if (historyError) console.warn('Could not load user history:', historyError)

    // Generate initial quiz questions using AI
    const quizPrompt = `${assessment.quiz_set_questions_prompt}

${assessment.quiz_experience_analysis_prompt}

USER HISTORY CONTEXT:
${userHistory && userHistory.length > 0 ? 
  userHistory.map(h => 
    `- Completed "${h.enhanced_assessments.name}" (Level ${h.enhanced_assessments.assessment_level}) with score ${h.readiness_score}/100`
  ).join('\n') 
  : 'No previous assessment history available'
}

INSTRUCTIONS:
1. Start with a warm, welcoming introduction
2. Explain that this is a readiness assessment for "${assessment.name}" (Level ${assessment.assessment_level})
3. Begin with the first set question
4. Keep questions conversational and supportive
5. Ask one question at a time and wait for responses

Begin the quiz now.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a compassionate AI assessment guide helping users determine their readiness for psychological assessments. Be warm, supportive, and thorough in your evaluation.'
        },
        {
          role: 'user',
          content: quizPrompt
        }
      ],
      temperature: 0.7,
      max_tokens: 800
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Welcome to your readiness assessment. Let\'s begin with some questions to ensure you\'re prepared for this assessment.'

    // Save the initial question
    await supabase
      .from('quiz_question_responses')
      .insert({
        quiz_attempt_id: attemptId,
        question_number: 1,
        question_type: 'set_question',
        question_text: aiResponse,
        question_context: {
          assessment_name: assessment.name,
          assessment_level: assessment.assessment_level,
          quiz_phase: 'introduction'
        }
      })

    return NextResponse.json({
      quiz_attempt_id: attemptId,
      ai_response: aiResponse,
      assessment_name: assessment.name,
      assessment_level: assessment.assessment_level
    })

  } catch (error) {
    console.error('Error starting quiz:', error)
    return NextResponse.json({ error: 'Failed to start quiz' }, { status: 500 })
  }
}

async function processQuizResponse(supabase: any, quizAttemptId: string, userMessage: string) {
  try {
    // Get quiz attempt details
    const { data: attempt, error: attemptError } = await supabase
      .from('assessment_quiz_attempts')
      .select(`
        *,
        enhanced_assessments!inner(
          name, 
          assessment_level, 
          quiz_set_questions_prompt, 
          quiz_experience_analysis_prompt,
          quiz_passing_score
        )
      `)
      .eq('id', quizAttemptId)
      .single()

    if (attemptError) throw attemptError

    // Get previous questions and responses
    const { data: previousQA, error: qaError } = await supabase
      .from('quiz_question_responses')
      .select('*')
      .eq('quiz_attempt_id', quizAttemptId)
      .order('question_number')

    if (qaError) throw qaError

    const currentQuestionNumber = previousQA.length
    const lastQuestion = previousQA[previousQA.length - 1]

    // Update the last question with user's response
    if (lastQuestion && !lastQuestion.user_response) {
      await supabase
        .from('quiz_question_responses')
        .update({ user_response: userMessage })
        .eq('id', lastQuestion.id)
    }

    // Analyze the response and determine next steps
    const conversationHistory = previousQA.map(qa => 
      `Q${qa.question_number}: ${qa.question_text}\nA${qa.question_number}: ${qa.user_response || userMessage}`
    ).join('\n\n')

    const analysisPrompt = `You are analyzing a user's responses in a readiness quiz for "${attempt.enhanced_assessments.name}" (Level ${attempt.enhanced_assessments.assessment_level}).

CONVERSATION SO FAR:
${conversationHistory}

ASSESSMENT PROMPTS:
${attempt.enhanced_assessments.quiz_set_questions_prompt}

${attempt.enhanced_assessments.quiz_experience_analysis_prompt}

ANALYSIS TASK:
1. Analyze the user's latest response: "${userMessage}"
2. Determine if you need to ask more questions or if you have enough information
3. If more questions needed, ask the next appropriate question
4. If ready to conclude, provide a final assessment

CURRENT STATUS:
- Question number: ${currentQuestionNumber}
- Assessment level: ${attempt.enhanced_assessments.assessment_level}
- Passing score required: ${attempt.enhanced_assessments.quiz_passing_score}

RESPONSE FORMAT:
If continuing quiz: Ask the next question naturally
If concluding: Provide assessment summary and score (0-100)

Continue the conversation appropriately.`

    const completion = await openai.chat.completions.create({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are conducting a psychological readiness assessment. Be thorough but compassionate. Ask follow-up questions if responses seem shallow. Conclude when you have sufficient information to make a fair assessment.'
        },
        {
          role: 'user',
          content: analysisPrompt
        }
      ],
      temperature: 0.3,
      max_tokens: 1000
    })

    const aiResponse = completion.choices[0]?.message?.content || 'Thank you for your response. Let me ask you another question.'

    // Determine if this is a question or final assessment
    const isConclusion = aiResponse.toLowerCase().includes('score') || 
                        aiResponse.toLowerCase().includes('assessment complete') ||
                        aiResponse.toLowerCase().includes('ready') ||
                        currentQuestionNumber >= 6 // Max questions limit

    if (isConclusion) {
      // This is the final assessment - extract score and complete quiz
      return await completeQuizWithAssessment(supabase, quizAttemptId, aiResponse, userMessage)
    } else {
      // This is another question - save it
      await supabase
        .from('quiz_question_responses')
        .insert({
          quiz_attempt_id: quizAttemptId,
          question_number: currentQuestionNumber + 1,
          question_type: currentQuestionNumber < 3 ? 'set_question' : 'experience_based',
          question_text: aiResponse,
          question_context: {
            previous_response: userMessage,
            quiz_phase: currentQuestionNumber < 3 ? 'set_questions' : 'experience_analysis'
          }
        })

      return NextResponse.json({
        ai_response: aiResponse,
        quiz_continues: true,
        question_number: currentQuestionNumber + 1
      })
    }

  } catch (error) {
    console.error('Error processing quiz response:', error)
    return NextResponse.json({ error: 'Failed to process response' }, { status: 500 })
  }
}

async function completeQuizWithAssessment(supabase: any, quizAttemptId: string, aiAssessment: string, lastUserResponse: string) {
  try {
    // Extract score from AI assessment (look for numbers 0-100)
    const scoreMatch = aiAssessment.match(/\b([0-9]{1,2}|100)\b/)
    const extractedScore = scoreMatch ? parseInt(scoreMatch[1]) : 50

    // Get quiz attempt details
    const { data: attempt, error: attemptError } = await supabase
      .from('assessment_quiz_attempts')
      .select(`
        *,
        enhanced_assessments!inner(quiz_passing_score)
      `)
      .eq('id', quizAttemptId)
      .single()

    if (attemptError) throw attemptError

    const passingScore = attempt.enhanced_assessments.quiz_passing_score
    const quizPassed = extractedScore >= passingScore

    // Update quiz attempt with results
    await supabase
      .from('assessment_quiz_attempts')
      .update({
        readiness_score: extractedScore,
        emotional_maturity_score: Math.min(Math.floor(extractedScore / 10), 10),
        specific_feedback: aiAssessment,
        quiz_passed: quizPassed,
        access_granted: quizPassed,
        completed_at: new Date().toISOString(),
        retry_allowed: !quizPassed,
        next_attempt_allowed_at: !quizPassed ? 
          new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString() : // 24 hour cooldown
          null
      })
      .eq('id', quizAttemptId)

    return NextResponse.json({
      quiz_completed: true,
      quiz_passed: quizPassed,
      score: extractedScore,
      passing_score: passingScore,
      ai_assessment: aiAssessment,
      access_granted: quizPassed,
      message: quizPassed ? 
        'Congratulations! You\'ve passed the readiness assessment and can now access this assessment.' :
        `You scored ${extractedScore}/${passingScore}. Please continue your growth work and try again in 24 hours.`
    })

  } catch (error) {
    console.error('Error completing quiz:', error)
    return NextResponse.json({ error: 'Failed to complete quiz' }, { status: 500 })
  }
}

async function completeQuiz(supabase: any, quizAttemptId: string) {
  // This function can be used for manual quiz completion if needed
  return NextResponse.json({ message: 'Quiz completion endpoint' })
}
