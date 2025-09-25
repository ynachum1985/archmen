'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Calendar,
  Clock,
  CheckCircle,
  Circle,
  Plus,
  Bell,
  Target,
  TrendingUp,
  BookOpen,
  Brain,
  Heart,
  Zap,
  X
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface HomeworkTask {
  id: string
  title: string
  description: string
  task_type: string
  frequency: string
  difficulty_level: string
  estimated_duration_minutes: number
  due_date: string | null
  completed_at: string | null
  priority: number
  tags: string[]
  instructions: any
}

interface CalendarEvent {
  id: string
  title: string
  description: string
  start_time: string
  end_time: string
  status: string
  event_type: string
  reminder_minutes: number[]
}

interface HomeworkCalendarProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

export function HomeworkCalendar({ isOpen, onClose, userId }: HomeworkCalendarProps) {
  const [tasks, setTasks] = useState<HomeworkTask[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (isOpen && userId) {
      loadHomeworkData()
    }
  }, [isOpen, userId])

  const loadHomeworkData = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Load homework tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('user_homework_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('priority', { ascending: true })
        .order('created_at', { ascending: false })

      if (tasksError) throw tasksError

      // Load calendar events
      const { data: eventsData, error: eventsError } = await supabase
        .from('user_calendar_events')
        .select('*')
        .eq('user_id', userId)
        .gte('start_time', new Date().toISOString())
        .order('start_time', { ascending: true })

      if (eventsError) throw eventsError

      setTasks(tasksData || [])
      setEvents(eventsData || [])
    } catch (error) {
      console.error('Error loading homework data:', error)
    } finally {
      setLoading(false)
    }
  }

  const getTaskTypeIcon = (taskType: string) => {
    const icons = {
      affirmation: Heart,
      meditation: Brain,
      journaling: BookOpen,
      integration_practice: Target,
      shadow_work: Zap,
      reflection: Circle,
      behavioral_change: TrendingUp,
      custom: Plus
    }
    return icons[taskType as keyof typeof icons] || Circle
  }

  const getTaskTypeColor = (taskType: string) => {
    const colors = {
      affirmation: 'bg-pink-100 text-pink-700',
      meditation: 'bg-purple-100 text-purple-700',
      journaling: 'bg-blue-100 text-blue-700',
      integration_practice: 'bg-green-100 text-green-700',
      shadow_work: 'bg-yellow-100 text-yellow-700',
      reflection: 'bg-gray-100 text-gray-700',
      behavioral_change: 'bg-orange-100 text-orange-700',
      custom: 'bg-indigo-100 text-indigo-700'
    }
    return colors[taskType as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const getDifficultyColor = (difficulty: string) => {
    const colors = {
      beginner: 'bg-green-100 text-green-700',
      intermediate: 'bg-yellow-100 text-yellow-700',
      advanced: 'bg-red-100 text-red-700'
    }
    return colors[difficulty as keyof typeof colors] || 'bg-gray-100 text-gray-700'
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  const completedTasks = tasks.filter(task => task.completed_at)
  const pendingTasks = tasks.filter(task => !task.completed_at)
  const upcomingEvents = events.filter(event => event.status === 'scheduled')

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-4xl max-h-[80vh]">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading your practices...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Your Practice Calendar
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="tasks">Tasks ({pendingTasks.length})</TabsTrigger>
            <TabsTrigger value="calendar">Calendar ({upcomingEvents.length})</TabsTrigger>
            <TabsTrigger value="progress">Progress</TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[60vh] mt-4">
            <TabsContent value="overview" className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Target className="h-4 w-4 text-blue-500" />
                      Active Tasks
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-blue-600">{pendingTasks.length}</div>
                    <p className="text-xs text-gray-500">Ready to practice</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Completed
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-green-600">{completedTasks.length}</div>
                    <p className="text-xs text-gray-500">This month</p>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm font-medium flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-purple-500" />
                      Scheduled
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold text-purple-600">{upcomingEvents.length}</div>
                    <p className="text-xs text-gray-500">Upcoming events</p>
                  </CardContent>
                </Card>
              </div>

              {/* Recent Tasks */}
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Recent Tasks</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {pendingTasks.slice(0, 3).map((task) => {
                    const Icon = getTaskTypeIcon(task.task_type)
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-3 border rounded-lg">
                        <Icon className="h-5 w-5 text-gray-600" />
                        <div className="flex-1">
                          <h4 className="font-medium">{task.title}</h4>
                          <p className="text-sm text-gray-600">{task.description}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Badge className={getTaskTypeColor(task.task_type)} variant="secondary">
                              {task.task_type.replace('_', ' ')}
                            </Badge>
                            <Badge className={getDifficultyColor(task.difficulty_level)} variant="secondary">
                              {task.difficulty_level}
                            </Badge>
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {task.estimated_duration_minutes}min
                            </span>
                          </div>
                        </div>
                        <Button size="sm" variant="outline">
                          Schedule
                        </Button>
                      </div>
                    )
                  })}
                  {pendingTasks.length === 0 && (
                    <div className="text-center py-8 text-gray-500">
                      <Target className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                      <p>No active tasks. Complete an assessment to get personalized practices!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="tasks" className="space-y-4">
              <div className="space-y-3">
                {pendingTasks.map((task) => {
                  const Icon = getTaskTypeIcon(task.task_type)
                  return (
                    <Card key={task.id}>
                      <CardContent className="p-4">
                        <div className="flex items-start gap-3">
                          <Icon className="h-5 w-5 text-gray-600 mt-1" />
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h4 className="font-medium">{task.title}</h4>
                              <Badge className={getTaskTypeColor(task.task_type)} variant="secondary">
                                {task.task_type.replace('_', ' ')}
                              </Badge>
                              <Badge className={getDifficultyColor(task.difficulty_level)} variant="secondary">
                                {task.difficulty_level}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-3">{task.description}</p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                {task.estimated_duration_minutes} minutes
                              </span>
                              <span className="flex items-center gap-1">
                                <Bell className="h-3 w-3" />
                                {task.frequency}
                              </span>
                              {task.due_date && (
                                <span>Due: {formatDate(task.due_date)}</span>
                              )}
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button size="sm" variant="outline">
                              Schedule
                            </Button>
                            <Button size="sm">
                              Complete
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            </TabsContent>

            <TabsContent value="calendar" className="space-y-4">
              <div className="space-y-3">
                {upcomingEvents.map((event) => (
                  <Card key={event.id}>
                    <CardContent className="p-4">
                      <div className="flex items-center gap-3">
                        <Calendar className="h-5 w-5 text-blue-500" />
                        <div className="flex-1">
                          <h4 className="font-medium">{event.title}</h4>
                          <p className="text-sm text-gray-600">{event.description}</p>
                          <div className="flex items-center gap-4 text-xs text-gray-500 mt-2">
                            <span>{formatDate(event.start_time)}</span>
                            <span className="flex items-center gap-1">
                              <Bell className="h-3 w-3" />
                              {event.reminder_minutes.join(', ')} min before
                            </span>
                          </div>
                        </div>
                        <Badge variant="outline">{event.status}</Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
                {upcomingEvents.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Calendar className="h-12 w-12 mx-auto mb-4 text-gray-400" />
                    <p>No scheduled events. Schedule your practices to stay on track!</p>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="progress" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Completion Progress</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span>Tasks Completed</span>
                      <span className="font-medium">{completedTasks.length} / {tasks.length}</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all"
                        style={{ width: `${tasks.length > 0 ? (completedTasks.length / tasks.length) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Completions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {completedTasks.slice(0, 5).map((task) => {
                    const Icon = getTaskTypeIcon(task.task_type)
                    return (
                      <div key={task.id} className="flex items-center gap-3 p-2 border rounded">
                        <CheckCircle className="h-4 w-4 text-green-500" />
                        <Icon className="h-4 w-4 text-gray-600" />
                        <div className="flex-1">
                          <span className="font-medium">{task.title}</span>
                          <div className="text-xs text-gray-500">
                            Completed {task.completed_at ? formatDate(task.completed_at) : 'Recently'}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                  {completedTasks.length === 0 && (
                    <div className="text-center py-4 text-gray-500">
                      <p>No completed tasks yet. Start your first practice!</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
