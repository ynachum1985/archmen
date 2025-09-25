'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, Check, Clock, Target, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AddToCalendarModal } from '@/components/calendar/AddToCalendarModal'

interface HomeworkTask {
  id: string
  title: string
  description: string
  task_type: string
  difficulty_level: string
  estimated_duration_minutes: number
  due_date: string | null
  priority: number
  is_active: boolean
  completed_at: string | null
  created_at: string
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  status: string
  reminder_minutes: number[]
}

interface MinimalDashboardProps {
  userId: string
}

export function MinimalDashboard({ userId }: MinimalDashboardProps) {
  const [tasks, setTasks] = useState<HomeworkTask[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddToCalendar, setShowAddToCalendar] = useState(false)
  const [selectedPractice, setSelectedPractice] = useState<{
    title: string
    description: string
    duration?: number
  } | null>(null)

  useEffect(() => {
    if (userId) {
      loadData()
    }
  }, [userId])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Load tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('user_homework_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      // Load events
      const { data: eventsData, error: eventsError } = await supabase
        .from('user_calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })
        .limit(10)

      if (eventsError) throw eventsError

      setTasks(tasksData || [])
      setEvents(eventsData || [])
    } catch (error) {
      console.error('Error loading data:', error)
    } finally {
      setLoading(false)
    }
  }

  const markTaskComplete = async (taskId: string) => {
    try {
      const supabase = createClient()
      await supabase
        .from('user_homework_tasks')
        .update({ 
          completed_at: new Date().toISOString(),
          is_active: false 
        })
        .eq('id', taskId)

      // Reload data
      loadData()
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return 'Today'
    if (diffDays === 1) return 'Tomorrow'
    if (diffDays < 7) return `In ${diffDays} days`
    
    return date.toLocaleDateString('en-US', { 
      month: 'short', 
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const handleAddToCalendar = (task: HomeworkTask) => {
    setSelectedPractice({
      title: task.title,
      description: task.description,
      duration: task.estimated_duration_minutes
    })
    setShowAddToCalendar(true)
  }

  const pendingTasks = tasks.filter(task => !task.completed_at)
  const completedTasks = tasks.filter(task => task.completed_at)
  const upcomingEvents = events.slice(0, 5)

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-500">Loading...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-900">Your Practice</h1>
        <Button
          onClick={() => setShowAddToCalendar(true)}
          className="bg-gray-900 hover:bg-gray-800 text-white"
        >
          <Plus className="h-4 w-4 mr-2" />
          Schedule Practice
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tasks Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Target className="h-5 w-5" />
            Tasks ({pendingTasks.length})
          </h2>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {pendingTasks.map((task) => (
                <Card key={task.id} className="border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{task.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">
                            {task.difficulty_level}
                          </Badge>
                          <span className="text-xs text-gray-500 flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {task.estimated_duration_minutes}min
                          </span>
                        </div>
                      </div>
                      <div className="flex flex-col gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleAddToCalendar(task)}
                          className="text-xs"
                        >
                          Schedule
                        </Button>
                        <Button
                          size="sm"
                          onClick={() => markTaskComplete(task.id)}
                          className="bg-green-600 hover:bg-green-700 text-xs"
                        >
                          <Check className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {pendingTasks.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No active tasks</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>

        {/* Calendar Section */}
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Upcoming ({upcomingEvents.length})
          </h2>
          
          <ScrollArea className="h-96">
            <div className="space-y-3">
              {upcomingEvents.map((event) => (
                <Card key={event.id} className="border-gray-100">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-4 w-4 text-gray-500 mt-1" />
                      <div className="flex-1">
                        <h3 className="font-medium text-gray-900 mb-1">{event.title}</h3>
                        <p className="text-sm text-gray-600 mb-2">{event.description}</p>
                        <div className="text-xs text-gray-500">
                          {formatDate(event.start_time)}
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs">
                        {event.status}
                      </Badge>
                    </div>
                  </CardContent>
                </Card>
              ))}
              
              {upcomingEvents.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-8 w-8 mx-auto mb-2 text-gray-400" />
                  <p className="text-sm">No upcoming events</p>
                </div>
              )}
            </div>
          </ScrollArea>
        </div>
      </div>

      {/* Completed Tasks */}
      {completedTasks.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-lg font-medium text-gray-900 flex items-center gap-2">
            <Check className="h-5 w-5" />
            Completed ({completedTasks.length})
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {completedTasks.slice(0, 6).map((task) => (
              <Card key={task.id} className="border-gray-100 opacity-60">
                <CardContent className="p-3">
                  <h3 className="font-medium text-gray-700 text-sm mb-1">{task.title}</h3>
                  <div className="text-xs text-gray-500">
                    Completed {new Date(task.completed_at!).toLocaleDateString()}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* Add to Calendar Modal */}
      {showAddToCalendar && (
        <AddToCalendarModal
          isOpen={showAddToCalendar}
          onClose={() => {
            setShowAddToCalendar(false)
            setSelectedPractice(null)
          }}
          userId={userId}
          practiceTitle={selectedPractice?.title || 'Practice Session'}
          practiceDescription={selectedPractice?.description || 'Scheduled practice session'}
          suggestedDuration={selectedPractice?.duration || 15}
          onScheduled={() => {
            loadData()
            setShowAddToCalendar(false)
            setSelectedPractice(null)
          }}
        />
      )}
    </div>
  )
}
