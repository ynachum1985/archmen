'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Progress } from '@/components/ui/progress'
import { Textarea } from '@/components/ui/textarea'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { 
  Calendar,
  CheckCircle,
  Clock,
  Plus,
  Settings,
  Target,
  TrendingUp,
  Bell,
  Star,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface HomeworkTask {
  id: string
  title: string
  description: string
  task_type: string
  frequency: string
  frequency_count: number
  difficulty_level: string
  estimated_duration_minutes: number
  instructions: any
  assigned_at: string
  due_date?: string
  completed_at?: string
  completion_notes?: string
  is_active: boolean
  priority: number
  tags: string[]
}

interface CalendarEvent {
  id: string
  homework_task_id: string
  title: string
  description: string
  start_time: string
  end_time: string
  status: string
  reminder_minutes: number[]
  task?: HomeworkTask
}

interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  daily_reminder_time: string
  reminder_frequency: string
  notification_types: any
}

interface HomeworkCalendarProps {
  userId: string
  assessmentId?: string
  discoveredArchetypes?: any[]
}

export function HomeworkCalendar({ userId, assessmentId, discoveredArchetypes }: HomeworkCalendarProps) {
  const [tasks, setTasks] = useState<HomeworkTask[]>([])
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [preferences, setPreferences] = useState<NotificationPreferences | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [selectedDate, setSelectedDate] = useState(new Date())
  const [showTaskDialog, setShowTaskDialog] = useState(false)
  const [selectedTask, setSelectedTask] = useState<HomeworkTask | null>(null)
  const [completionNotes, setCompletionNotes] = useState('')
  const [completionRating, setCompletionRating] = useState<number>(3)

  useEffect(() => {
    loadHomeworkData()
  }, [userId])

  const loadHomeworkData = async () => {
    try {
      setIsLoading(true)
      const supabase = createClient()

      // Load homework tasks
      const { data: tasksData, error: tasksError } = await supabase
        .from('user_homework_tasks')
        .select('*')
        .eq('user_id', userId)
        .eq('is_active', true)
        .order('priority', { ascending: true })

      if (tasksError) throw tasksError

      // Load calendar events
      const { data: eventsData, error: eventsError } = await supabase
        .from('user_calendar_events')
        .select(`
          *,
          user_homework_tasks (*)
        `)
        .eq('user_id', userId)
        .gte('start_time', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()) // Last 7 days
        .lte('start_time', new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()) // Next 30 days

      if (eventsError) throw eventsError

      // Load notification preferences
      const { data: prefsData, error: prefsError } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (prefsError && prefsError.code !== 'PGRST116') throw prefsError

      setTasks(tasksData || [])
      setEvents(eventsData || [])
      setPreferences(prefsData)
    } catch (error) {
      console.error('Error loading homework data:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const completeTask = async (task: HomeworkTask) => {
    try {
      const supabase = createClient()

      // Create completion record
      const { error: completionError } = await supabase
        .from('homework_task_completions')
        .insert({
          user_id: userId,
          homework_task_id: task.id,
          completion_rating: completionRating,
          completion_notes: completionNotes,
          completed_at: new Date().toISOString()
        })

      if (completionError) throw completionError

      // Update task as completed if it's a one-time task
      if (task.frequency === 'one_time') {
        const { error: updateError } = await supabase
          .from('user_homework_tasks')
          .update({
            completed_at: new Date().toISOString(),
            completion_notes: completionNotes,
            updated_at: new Date().toISOString()
          })
          .eq('id', task.id)

        if (updateError) throw updateError
      }

      // Update calendar event status
      const { error: eventError } = await supabase
        .from('user_calendar_events')
        .update({ status: 'completed' })
        .eq('homework_task_id', task.id)
        .eq('user_id', userId)

      if (eventError) throw eventError

      // Reload data
      await loadHomeworkData()
      setShowTaskDialog(false)
      setCompletionNotes('')
      setCompletionRating(3)
    } catch (error) {
      console.error('Error completing task:', error)
    }
  }

  const scheduleTask = async (task: HomeworkTask, selectedTime: Date) => {
    try {
      const supabase = createClient()
      
      const endTime = new Date(selectedTime)
      endTime.setMinutes(endTime.getMinutes() + task.estimated_duration_minutes)

      const { error } = await supabase
        .from('user_calendar_events')
        .insert({
          user_id: userId,
          homework_task_id: task.id,
          title: task.title,
          description: task.description,
          start_time: selectedTime.toISOString(),
          end_time: endTime.toISOString(),
          event_type: 'homework',
          status: 'scheduled',
          reminder_minutes: [15, 60]
        })

      if (error) throw error
      await loadHomeworkData()
    } catch (error) {
      console.error('Error scheduling task:', error)
    }
  }

  const getTasksByFrequency = () => {
    const daily = tasks.filter(t => t.frequency === 'daily')
    const weekly = tasks.filter(t => t.frequency === 'weekly')
    const oneTime = tasks.filter(t => t.frequency === 'one_time')
    return { daily, weekly, oneTime }
  }

  const getCompletionStats = () => {
    const totalTasks = tasks.length
    const completedTasks = tasks.filter(t => t.completed_at).length
    const completionRate = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0
    return { totalTasks, completedTasks, completionRate }
  }

  const { daily, weekly, oneTime } = getTasksByFrequency()
  const { totalTasks, completedTasks, completionRate } = getCompletionStats()

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-5 w-5" />
            Your Integration Journey
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{completedTasks}</div>
              <div className="text-sm text-gray-600">Tasks Completed</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{Math.round(completionRate)}%</div>
              <div className="text-sm text-gray-600">Completion Rate</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{totalTasks}</div>
              <div className="text-sm text-gray-600">Active Tasks</div>
            </div>
          </div>
          <Progress value={completionRate} className="h-2" />
        </CardContent>
      </Card>

      {/* Task Management Tabs */}
      <Tabs defaultValue="daily" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="daily">Daily ({daily.length})</TabsTrigger>
          <TabsTrigger value="weekly">Weekly ({weekly.length})</TabsTrigger>
          <TabsTrigger value="projects">Projects ({oneTime.length})</TabsTrigger>
        </TabsList>

        <TabsContent value="daily" className="space-y-4">
          <TaskList 
            tasks={daily} 
            onTaskClick={setSelectedTask}
            onSchedule={scheduleTask}
            title="Daily Practices"
          />
        </TabsContent>

        <TabsContent value="weekly" className="space-y-4">
          <TaskList 
            tasks={weekly} 
            onTaskClick={setSelectedTask}
            onSchedule={scheduleTask}
            title="Weekly Practices"
          />
        </TabsContent>

        <TabsContent value="projects" className="space-y-4">
          <TaskList 
            tasks={oneTime} 
            onTaskClick={setSelectedTask}
            onSchedule={scheduleTask}
            title="Integration Projects"
          />
        </TabsContent>
      </Tabs>

      {/* Task Detail Dialog */}
      <Dialog open={!!selectedTask} onOpenChange={() => setSelectedTask(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedTask?.title}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-gray-600">{selectedTask?.description}</p>
            
            {selectedTask?.instructions && (
              <div className="bg-blue-50 p-4 rounded-lg">
                <h4 className="font-medium mb-2">Instructions</h4>
                <div className="text-sm text-gray-700">
                  {typeof selectedTask.instructions === 'string' 
                    ? selectedTask.instructions 
                    : JSON.stringify(selectedTask.instructions, null, 2)}
                </div>
              </div>
            )}

            <div className="flex items-center gap-4 text-sm text-gray-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                {selectedTask?.estimated_duration_minutes} min
              </div>
              <Badge variant="outline">{selectedTask?.difficulty_level}</Badge>
              <Badge variant="outline">{selectedTask?.task_type}</Badge>
            </div>

            {!selectedTask?.completed_at && (
              <div className="space-y-4 pt-4 border-t">
                <div>
                  <Label htmlFor="rating">How well did you complete this? (1-5)</Label>
                  <Select value={completionRating.toString()} onValueChange={(v) => setCompletionRating(parseInt(v))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 - Struggled</SelectItem>
                      <SelectItem value="2">2 - Partial</SelectItem>
                      <SelectItem value="3">3 - Good</SelectItem>
                      <SelectItem value="4">4 - Very Good</SelectItem>
                      <SelectItem value="5">5 - Excellent</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="notes">Completion Notes (optional)</Label>
                  <Textarea
                    id="notes"
                    value={completionNotes}
                    onChange={(e) => setCompletionNotes(e.target.value)}
                    placeholder="How did it go? Any insights or challenges?"
                    className="mt-1"
                  />
                </div>

                <Button 
                  onClick={() => selectedTask && completeTask(selectedTask)}
                  className="w-full"
                >
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Mark as Complete
                </Button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface TaskListProps {
  tasks: HomeworkTask[]
  onTaskClick: (task: HomeworkTask) => void
  onSchedule: (task: HomeworkTask, time: Date) => void
  title: string
}

function TaskList({ tasks, onTaskClick, onSchedule, title }: TaskListProps) {
  if (tasks.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center text-gray-500">
          <Target className="h-8 w-8 mx-auto mb-2 text-gray-400" />
          <p>No {title.toLowerCase()} assigned yet.</p>
          <p className="text-sm">Your AI coach will suggest practices based on your conversation.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-3">
      {tasks.map((task) => (
        <Card key={task.id} className="hover:shadow-md transition-shadow cursor-pointer">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1" onClick={() => onTaskClick(task)}>
                <div className="flex items-center gap-2 mb-1">
                  <h3 className="font-medium">{task.title}</h3>
                  {task.completed_at && <CheckCircle className="h-4 w-4 text-green-500" />}
                  <Badge variant="outline" className="text-xs">
                    {task.frequency_count}x {task.frequency}
                  </Badge>
                </div>
                <p className="text-sm text-gray-600 mb-2">{task.description}</p>
                <div className="flex items-center gap-2 text-xs text-gray-500">
                  <Clock className="h-3 w-3" />
                  {task.estimated_duration_minutes} min
                  <Badge variant="outline" className="text-xs">{task.difficulty_level}</Badge>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={(e) => {
                    e.stopPropagation()
                    onSchedule(task, new Date())
                  }}
                >
                  <Plus className="h-3 w-3 mr-1" />
                  Schedule
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
