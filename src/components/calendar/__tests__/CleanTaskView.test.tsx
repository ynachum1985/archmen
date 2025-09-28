import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { CleanTaskView } from '../CleanTaskView'

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

const mockTasks = [
  {
    id: '1',
    title: 'Test Task 1',
    description: 'Test description 1',
    due_date: '2024-01-15',
    status: 'pending',
    assessment_id: 'assessment-1',
    created_at: '2024-01-01T00:00:00Z'
  },
  {
    id: '2',
    title: 'Test Task 2',
    description: 'Test description 2',
    due_date: '2024-01-20',
    status: 'completed',
    assessment_id: 'assessment-1',
    created_at: '2024-01-02T00:00:00Z'
  }
]

describe('CleanTaskView', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ data: mockTasks })
    } as Response)
  })

  it('renders without crashing', async () => {
    render(<CleanTaskView userId="test-user" currentAssessmentId="assessment-1" />)
    
    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument()
    })
  })

  it('displays tasks correctly', async () => {
    render(<CleanTaskView userId="test-user" currentAssessmentId="assessment-1" />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
      expect(screen.getByText('Test Task 2')).toBeInTheDocument()
    })
  })

  it('filters tasks by status', async () => {
    render(<CleanTaskView userId="test-user" currentAssessmentId="assessment-1" />)
    
    await waitFor(() => {
      expect(screen.getByText('Test Task 1')).toBeInTheDocument()
    })

    // Click on Completed filter
    const completedButton = screen.getByText('Completed')
    fireEvent.click(completedButton)

    await waitFor(() => {
      expect(screen.getByText('Test Task 2')).toBeInTheDocument()
      expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument()
    })
  })

  it('toggles between calendar and list view', async () => {
    render(<CleanTaskView userId="test-user" currentAssessmentId="assessment-1" />)
    
    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument()
    })

    // Should start in list view
    expect(screen.getByText('List View')).toBeInTheDocument()

    // Click calendar view button
    const calendarButton = screen.getByLabelText('Calendar View')
    fireEvent.click(calendarButton)

    expect(screen.getByText('Calendar View')).toBeInTheDocument()
  })

  it('handles API errors gracefully', async () => {
    const mockFetch = fetch as jest.MockedFunction<typeof fetch>
    mockFetch.mockRejectedValue(new Error('API Error'))

    render(<CleanTaskView userId="test-user" currentAssessmentId="assessment-1" />)
    
    await waitFor(() => {
      expect(screen.getByText('Tasks')).toBeInTheDocument()
    })

    // Should not crash and should handle the error
    expect(screen.queryByText('Test Task 1')).not.toBeInTheDocument()
  })
})
