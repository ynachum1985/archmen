import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { InlineChatView } from '../InlineChatView'

// Mock Supabase client
jest.mock('@/lib/supabase/client', () => ({
  createClient: jest.fn(() => ({
    auth: {
      getUser: jest.fn(),
    },
    from: jest.fn(() => ({
      select: jest.fn().mockReturnThis(),
      insert: jest.fn().mockReturnThis(),
      update: jest.fn().mockReturnThis(),
      delete: jest.fn().mockReturnThis(),
      eq: jest.fn().mockReturnThis(),
      order: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
    })),
  })),
}))

// Mock fetch globally
global.fetch = jest.fn()

const mockConversation = {
  id: 'conv-1',
  assessment_id: 'assessment-1',
  user_id: 'user-1',
  messages: [
    {
      id: 'msg-1',
      role: 'assistant',
      content: 'Hello! How can I help you today?',
      created_at: '2024-01-01T00:00:00Z'
    }
  ],
  created_at: '2024-01-01T00:00:00Z'
}

const mockAssessment = {
  id: 'assessment-1',
  name: 'Test Assessment',
  category: 'Relationship',
  level: 1
}

describe('InlineChatView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockConversation })
    } as Response)
  })

  it('renders without crashing', async () => {
    render(
      <InlineChatView 
        conversationId="conv-1"
        assessment={mockAssessment}
        onBack={() => {}}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Test Assessment')).toBeInTheDocument()
    })
  })

  it('displays conversation messages', async () => {
    render(
      <InlineChatView 
        conversationId="conv-1"
        assessment={mockAssessment}
        onBack={() => {}}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Hello! How can I help you today?')).toBeInTheDocument()
    })
  })

  it('allows sending messages', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: mockConversation })
      } as Response)
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({
          message: 'Thank you for your message!',
          conversationId: 'conv-1'
        })
      } as Response)

    render(
      <InlineChatView 
        conversationId="conv-1"
        assessment={mockAssessment}
        onBack={() => {}}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText('Message ArchMen...')).toBeInTheDocument()
    })

    const input = screen.getByPlaceholderText('Message ArchMen...')
    const sendButton = screen.getByLabelText('Send message')

    fireEvent.change(input, { target: { value: 'Test message' } })
    fireEvent.click(sendButton)

    await waitFor(() => {
      expect(fetch).toHaveBeenCalledWith('/api/conversation-chat', expect.objectContaining({
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: expect.stringContaining('Test message')
      }))
    })
  })

  it('calls onBack when back button is clicked', () => {
    const mockOnBack = jest.fn()
    
    render(
      <InlineChatView 
        conversationId="conv-1"
        assessment={mockAssessment}
        onBack={mockOnBack}
      />
    )
    
    const backButton = screen.getByLabelText('Back to assessments')
    fireEvent.click(backButton)
    
    expect(mockOnBack).toHaveBeenCalled()
  })

  it('handles API errors gracefully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValue(new Error('API Error'))

    render(
      <InlineChatView 
        conversationId="conv-1"
        assessment={mockAssessment}
        onBack={() => {}}
      />
    )
    
    await waitFor(() => {
      expect(screen.getByText('Test Assessment')).toBeInTheDocument()
    })

    // Should not crash and should handle the error
    expect(screen.queryByText('Hello! How can I help you today?')).not.toBeInTheDocument()
  })
})
