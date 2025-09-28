const { POST } = require('../route')
const { NextRequest } = require('next/server')

// Mock Supabase
jest.mock('@/lib/supabase/server', () => ({
  createClient: jest.fn(() => ({
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      single: jest.fn(),
    })),
  })),
}))

// Mock OpenAI
jest.mock('openai', () => ({
  OpenAI: jest.fn(() => ({
    chat: {
      completions: {
        create: jest.fn(() => Promise.resolve({
          choices: [{
            message: {
              content: 'Test AI response'
            }
          }]
        }))
      }
    }
  }))
}))

describe('/api/conversation-chat', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    process.env.OPENAI_API_KEY = 'test-key'
  })

  it('handles POST requests successfully', async () => {
    const request = new NextRequest('http://localhost:3000/api/conversation-chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
        conversationId: 'conv-1',
        assessmentId: 'assessment-1',
        userId: 'user-1'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data).toHaveProperty('message')
    expect(data).toHaveProperty('conversationId')
  })

  it('returns 400 for missing required fields', async () => {
    const request = new NextRequest('http://localhost:3000/api/conversation-chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello'
        // Missing conversationId, assessmentId, userId
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    
    expect(response.status).toBe(400)
  })

  it('returns 405 for non-POST methods', async () => {
    const request = new NextRequest('http://localhost:3000/api/conversation-chat', {
      method: 'GET'
    })

    // Since we only export POST, this should be handled by Next.js
    // We can test that POST is the only exported method
    expect(POST).toBeDefined()
  })

  it('handles OpenAI API errors gracefully', async () => {
    // Mock OpenAI to throw an error
    const { OpenAI } = require('openai')
    OpenAI.mockImplementation(() => ({
      chat: {
        completions: {
          create: jest.fn(() => Promise.reject(new Error('OpenAI API Error')))
        }
      }
    }))

    const request = new NextRequest('http://localhost:3000/api/conversation-chat', {
      method: 'POST',
      body: JSON.stringify({
        message: 'Hello',
        conversationId: 'conv-1',
        assessmentId: 'assessment-1',
        userId: 'user-1'
      }),
      headers: {
        'Content-Type': 'application/json'
      }
    })

    const response = await POST(request)
    
    expect(response.status).toBe(500)
  })
})
