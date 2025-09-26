'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, List, Clock, Check, Circle, ChevronLeft, ChevronRight, Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'

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
  assessment_id?: string
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

interface ModernCalendarViewProps {
  userId: string
  currentAssessmentId?: string
}

export function ModernCalendarView({ userId, currentAssessmentId }: ModernCalendarViewProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [tasks, setTasks] = useState<HomeworkTask[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [userId, currentAssessmentId])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Load homework tasks - filter by assessment if provided
      let tasksQuery = supabase
        .from('homework_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)

      if (currentAssessmentId) {
        tasksQuery = tasksQuery.eq('assessment_id', currentAssessmentId)
      }

      const { data: tasksData, error: tasksError } = await tasksQuery
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      // Load calendar events
      const { data: eventsData, error: eventsError } = await supabase
        .from('calendar_events')
        .select('*')
        .eq('user_id', userId)
        .order('start_time', { ascending: true })

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
      const { error } = await supabase
        .from('homework_tasks')
        .update({ completed_at: new Date().toISOString() })
        .eq('id', taskId)

      if (error) throw error

      setTasks(prev => prev.map(task => 
        task.id === taskId 
          ? { ...task, completed_at: new Date().toISOString() }
          : task
      ))
    } catch (error) {
      console.error('Error marking task complete:', error)
    }
  }

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear()
    const month = date.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    for (let day = 1; day <= daysInMonth; day++) {
      days.push(new Date(year, month, day))
    }
    
    return days
  }

  const getTasksForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return tasks.filter(task => 
      task.due_date && task.due_date.startsWith(dateStr)
    )
  }

  const getEventsForDate = (date: Date) => {
    const dateStr = date.toISOString().split('T')[0]
    return events.filter(event => 
      event.start_time && event.start_time.startsWith(dateStr)
    )
  }

  const navigateMonth = (direction: 'prev' | 'next') => {
    setCurrentDate(prev => {
      const newDate = new Date(prev)
      if (direction === 'prev') {
        newDate.setMonth(prev.getMonth() - 1)
      } else {
        newDate.setMonth(prev.getMonth() + 1)
      }
      return newDate
    })
  }

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', {
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-gray-400">Loading...</div>
      </div>
    )
  }

  return (
    <div className="w-full h-full bg-gray-50/30">
      {/* Header */}
      <div className="flex items-center justify-between p-6 pb-4">
        <div>
          <h1 className="text-xl font-medium text-gray-900">
            {currentAssessmentId ? 'Assessment Tasks' : 'Practice Tasks'}
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            {currentAssessmentId ? 'Tasks for current assessment' : 'All your practice tasks'}
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="h-8 px-3 text-xs"
          >
            <Calendar className="h-3 w-3 mr-1" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="h-8 px-3 text-xs"
          >
            <List className="h-3 w-3 mr-1" />
            List
          </Button>
        </div>
      </div>

      <div className="px-6 pb-6">
        {viewMode === 'calendar' ? (
          <div className="space-y-4">
            {/* Calendar Navigation */}
            <div className="flex items-center justify-between">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('prev')}
                className="h-8 w-8 p-0"
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <h2 className="text-base font-medium text-gray-900">
                {currentDate.toLocaleDateString('en-US', { 
                  month: 'long', 
                  year: 'numeric' 
                })}
              </h2>
              
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigateMonth('next')}
                className="h-8 w-8 p-0"
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>

            {/* Calendar Grid */}
            <div className="bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50 overflow-hidden">
              {/* Days of week header */}
              <div className="grid grid-cols-7 border-b border-gray-200/50">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="p-3 text-center text-xs font-medium text-gray-500 bg-gray-50/50">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7">
                {getDaysInMonth(currentDate).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-20 sm:h-24 border-r border-b border-gray-200/30" />
                  }

                  const dayTasks = getTasksForDate(date)
                  const dayEvents = getEventsForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={index}
                      className={`h-20 sm:h-24 p-2 border-r border-b border-gray-200/30 ${
                        isToday ? 'bg-blue-50/50' : 'bg-white/30'
                      }`}
                    >
                      <div className={`text-xs font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-700'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayTasks.slice(0, 1).map(task => (
                          <div
                            key={task.id}
                            className="text-xs p-1 bg-green-100/80 text-green-700 rounded text-center truncate"
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayEvents.slice(0, 1).map(event => (
                          <div
                            key={event.id}
                            className="text-xs p-1 bg-blue-100/80 text-blue-700 rounded text-center truncate"
                          >
                            {event.title}
                          </div>
                        ))}
                        {(dayTasks.length + dayEvents.length) > 1 && (
                          <div className="text-xs text-gray-400 text-center">
                            +{(dayTasks.length + dayEvents.length) - 1}
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tasks */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Circle className="h-4 w-4" />
                Tasks ({tasks.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {tasks.map(task => (
                  <div
                    key={task.id}
                    className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50"
                  >
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => markTaskComplete(task.id)}
                      className="p-0 h-auto mt-0.5"
                      disabled={!!task.completed_at}
                    >
                      {task.completed_at ? (
                        <Check className="h-4 w-4 text-green-600" />
                      ) : (
                        <Circle className="h-4 w-4 text-gray-400" />
                      )}
                    </Button>
                    
                    <div className="flex-1 min-w-0">
                      <h4 className={`text-sm font-medium ${
                        task.completed_at ? 'line-through text-gray-500' : 'text-gray-900'
                      }`}>
                        {task.title}
                      </h4>
                      <p className="text-xs text-gray-600 mt-1">
                        {task.description}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant="outline" className="text-xs h-5">
                          {task.task_type}
                        </Badge>
                        <div className="flex items-center gap-1 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {task.estimated_duration_minutes}m
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
                
                {tasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks yet</p>
                  </div>
                )}
              </div>
            </div>

            {/* Events */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-gray-900 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Events ({events.length})
              </h3>
              
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {events.map(event => (
                  <div
                    key={event.id}
                    className="p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-gray-200/50"
                  >
                    <h4 className="text-sm font-medium text-gray-900">
                      {event.title}
                    </h4>
                    <p className="text-xs text-gray-600 mt-1">
                      {event.description}
                    </p>
                    <div className="flex items-center gap-2 mt-2">
                      <div className="text-xs text-gray-500">
                        {formatTime(event.start_time)} - {formatTime(event.end_time)}
                      </div>
                      <Badge variant="outline" className="text-xs h-5">
                        {event.status}
                      </Badge>
                    </div>
                  </div>
                ))}
                
                {events.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Calendar className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No events scheduled</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
