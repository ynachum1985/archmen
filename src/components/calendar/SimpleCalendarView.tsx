'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, List, Clock, Check, Circle, ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

interface SimpleCalendarViewProps {
  userId: string
}

export function SimpleCalendarView({ userId }: SimpleCalendarViewProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('calendar')
  const [tasks, setTasks] = useState<HomeworkTask[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())

  useEffect(() => {
    loadData()
  }, [userId])

  const loadData = async () => {
    try {
      const supabase = createClient()
      
      // Load homework tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('homework_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
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

      // Update local state
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
    
    // Add empty cells for days before the first day of the month
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    
    // Add days of the month
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

  const formatDate = (date: Date) => {
    return date.toLocaleDateString('en-US', { 
      weekday: 'long',
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
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
        <div className="text-gray-500">Loading calendar...</div>
      </div>
    )
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-medium text-gray-900">Practice Calendar</h1>
        
        {/* View Toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'calendar' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('calendar')}
            className="flex items-center gap-2"
          >
            <Calendar className="h-4 w-4" />
            Calendar
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => setViewMode('list')}
            className="flex items-center gap-2"
          >
            <List className="h-4 w-4" />
            List
          </Button>
        </div>
      </div>

      {viewMode === 'calendar' ? (
        <div className="space-y-4">
          {/* Calendar Navigation */}
          <div className="flex items-center justify-between">
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('prev')}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            
            <h2 className="text-lg font-medium">
              {currentDate.toLocaleDateString('en-US', { 
                month: 'long', 
                year: 'numeric' 
              })}
            </h2>
            
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigateMonth('next')}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Calendar Grid */}
          <Card>
            <CardContent className="p-4">
              {/* Days of week header */}
              <div className="grid grid-cols-7 gap-2 mb-4">
                {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              {/* Calendar days */}
              <div className="grid grid-cols-7 gap-2">
                {getDaysInMonth(currentDate).map((date, index) => {
                  if (!date) {
                    return <div key={index} className="h-24" />
                  }

                  const dayTasks = getTasksForDate(date)
                  const dayEvents = getEventsForDate(date)
                  const isToday = date.toDateString() === new Date().toDateString()

                  return (
                    <div
                      key={index}
                      className={`h-24 p-2 border rounded-lg ${
                        isToday ? 'bg-blue-50 border-blue-200' : 'border-gray-200'
                      }`}
                    >
                      <div className={`text-sm font-medium mb-1 ${
                        isToday ? 'text-blue-600' : 'text-gray-900'
                      }`}>
                        {date.getDate()}
                      </div>
                      
                      <div className="space-y-1">
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className="text-xs p-1 bg-green-100 text-green-700 rounded truncate"
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayEvents.slice(0, 2).map(event => (
                          <div
                            key={event.id}
                            className="text-xs p-1 bg-blue-100 text-blue-700 rounded truncate"
                          >
                            {event.title}
                          </div>
                        ))}
                        {(dayTasks.length + dayEvents.length) > 2 && (
                          <div className="text-xs text-gray-500">
                            +{(dayTasks.length + dayEvents.length) - 2} more
                          </div>
                        )}
                      </div>
                    </div>
                  )
                })}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : (
        <div className="space-y-4">
          {/* List View */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Tasks */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Circle className="h-5 w-5" />
                  Tasks
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {tasks.map(task => (
                      <div
                        key={task.id}
                        className="flex items-start gap-3 p-3 border rounded-lg"
                      >
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => markTaskComplete(task.id)}
                          className="p-0 h-auto"
                          disabled={!!task.completed_at}
                        >
                          {task.completed_at ? (
                            <Check className="h-4 w-4 text-green-600" />
                          ) : (
                            <Circle className="h-4 w-4 text-gray-400" />
                          )}
                        </Button>
                        
                        <div className="flex-1 min-w-0">
                          <h4 className={`font-medium ${
                            task.completed_at ? 'line-through text-gray-500' : 'text-gray-900'
                          }`}>
                            {task.title}
                          </h4>
                          <p className="text-sm text-gray-600 mt-1">
                            {task.description}
                          </p>
                          <div className="flex items-center gap-2 mt-2">
                            <Badge variant="outline" className="text-xs">
                              {task.task_type}
                            </Badge>
                            <div className="flex items-center gap-1 text-xs text-gray-500">
                              <Clock className="h-3 w-3" />
                              {task.estimated_duration_minutes}m
                            </div>
                            {task.due_date && (
                              <div className="text-xs text-gray-500">
                                Due: {formatDate(new Date(task.due_date))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    
                    {tasks.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No tasks yet
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>

            {/* Events */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Events
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-96">
                  <div className="space-y-3">
                    {events.map(event => (
                      <div
                        key={event.id}
                        className="p-3 border rounded-lg"
                      >
                        <h4 className="font-medium text-gray-900">
                          {event.title}
                        </h4>
                        <p className="text-sm text-gray-600 mt-1">
                          {event.description}
                        </p>
                        <div className="flex items-center gap-2 mt-2">
                          <div className="text-xs text-gray-500">
                            {formatDate(new Date(event.start_time))}
                          </div>
                          <div className="text-xs text-gray-500">
                            {formatTime(event.start_time)} - {formatTime(event.end_time)}
                          </div>
                          <Badge variant="outline" className="text-xs">
                            {event.status}
                          </Badge>
                        </div>
                      </div>
                    ))}
                    
                    {events.length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        No events scheduled
                      </div>
                    )}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}
