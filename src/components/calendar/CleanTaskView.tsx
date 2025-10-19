'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Calendar, List, Clock, Check, Circle, ChevronLeft, ChevronRight, Filter } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

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

interface CleanTaskViewProps {
  userId: string
  currentAssessmentId?: string
}

export function CleanTaskView({ userId, currentAssessmentId }: CleanTaskViewProps) {
  const [viewMode, setViewMode] = useState<'calendar' | 'list'>('list')
  const [tasks, setTasks] = useState<HomeworkTask[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [filterMode, setFilterMode] = useState<'all' | 'current' | 'completed'>('current')

  useEffect(() => {
    loadTasks()
  }, [userId, currentAssessmentId])

  const loadTasks = async () => {
    try {
      const supabase = createClient()
      
      // Load homework tasks - filter by assessment if provided
      let tasksQuery = supabase
        .from('user_homework_tasks')
        .select('*')
        .eq('user_id', userId)

      if (currentAssessmentId) {
        tasksQuery = tasksQuery.eq('assessment_id', currentAssessmentId)
      }

      const { data: tasksData, error: tasksError } = await tasksQuery
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      setTasks(tasksData || [])
    } catch (error) {
      console.error('Error loading tasks:', error)
    } finally {
      setLoading(false)
    }
  }

  const markTaskComplete = async (taskId: string) => {
    try {
      const supabase = createClient()
      const { error } = await supabase
        .from('user_homework_tasks')
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
    return filteredTasks.filter(task => 
      task.due_date && task.due_date.startsWith(dateStr)
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

  const filteredTasks = tasks.filter(task => {
    if (filterMode === 'current') {
      return !task.completed_at && task.is_active
    } else if (filterMode === 'completed') {
      return !!task.completed_at
    }
    return true // 'all'
  })

  const currentTasks = tasks.filter(task => !task.completed_at && task.is_active)
  const completedTasks = tasks.filter(task => !!task.completed_at)

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
                        {dayTasks.slice(0, 2).map(task => (
                          <div
                            key={task.id}
                            className={`text-xs p-1 rounded text-center truncate ${
                              task.completed_at 
                                ? 'bg-gray-100/80 text-gray-500 line-through' 
                                : 'bg-green-100/80 text-green-700'
                            }`}
                          >
                            {task.title}
                          </div>
                        ))}
                        {dayTasks.length > 2 && (
                          <div className="text-xs text-gray-400 text-center">
                            +{dayTasks.length - 2}
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
          <div className="space-y-6">
            {/* Filter Buttons */}
            <div className="flex items-center gap-2">
              <Button
                variant={filterMode === 'current' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode('current')}
                className="h-8 px-3 text-xs"
              >
                Current ({currentTasks.length})
              </Button>
              <Button
                variant={filterMode === 'completed' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode('completed')}
                className="h-8 px-3 text-xs"
              >
                Completed ({completedTasks.length})
              </Button>
              <Button
                variant={filterMode === 'all' ? 'default' : 'ghost'}
                size="sm"
                onClick={() => setFilterMode('all')}
                className="h-8 px-3 text-xs"
              >
                All ({tasks.length})
              </Button>
            </div>

            {/* Tasks List */}
            <div className="space-y-3 max-h-96 overflow-y-auto">
              <>
                {filteredTasks.map(task => (
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

                {filteredTasks.length === 0 && (
                  <div className="text-center py-8 text-gray-400">
                    <Circle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No tasks found</p>
                  </div>
                )}
              </>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
