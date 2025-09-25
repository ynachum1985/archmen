'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Badge } from '@/components/ui/badge'
import {
  Calendar,
  Clock,
  Bell,
  Mail,
  Repeat,
  X,
  Plus,
  Minus
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface AddToCalendarModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
  practiceTitle: string
  practiceDescription: string
  suggestedDuration?: number
  onScheduled?: () => void
}

export function AddToCalendarModal({
  isOpen,
  onClose,
  userId,
  practiceTitle,
  practiceDescription,
  suggestedDuration = 15,
  onScheduled
}: AddToCalendarModalProps) {
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: practiceTitle,
    description: practiceDescription,
    date: new Date().toISOString().split('T')[0],
    time: '09:00',
    duration: suggestedDuration,
    frequency: 'one_time',
    reminderMinutes: [15],
    emailReminders: true,
    pushNotifications: true,
    notes: ''
  })

  const handleReminderChange = (minutes: number, checked: boolean) => {
    if (checked) {
      setFormData(prev => ({
        ...prev,
        reminderMinutes: [...prev.reminderMinutes, minutes].sort((a, b) => a - b)
      }))
    } else {
      setFormData(prev => ({
        ...prev,
        reminderMinutes: prev.reminderMinutes.filter(m => m !== minutes)
      }))
    }
  }

  const handleSchedule = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      // Create homework task first
      const { data: task, error: taskError } = await supabase
        .from('user_homework_tasks')
        .insert({
          user_id: userId,
          title: formData.title,
          description: formData.description,
          task_type: 'integration_practice',
          frequency: formData.frequency,
          difficulty_level: 'beginner',
          estimated_duration_minutes: formData.duration,
          instructions: {
            notes: formData.notes,
            scheduled_via: 'conversation'
          },
          assigned_by: 'ai',
          priority: 3,
          tags: ['conversation', 'scheduled'],
          is_active: true
        })
        .select()
        .single()

      if (taskError) throw taskError

      // Create calendar event
      const startDateTime = new Date(`${formData.date}T${formData.time}:00`)
      const endDateTime = new Date(startDateTime.getTime() + formData.duration * 60000)

      const { data: event, error: eventError } = await supabase
        .from('user_calendar_events')
        .insert({
          user_id: userId,
          homework_task_id: task.id,
          title: formData.title,
          description: formData.description,
          start_time: startDateTime.toISOString(),
          end_time: endDateTime.toISOString(),
          event_type: 'homework',
          status: 'scheduled',
          reminder_minutes: formData.reminderMinutes,
          notes: formData.notes
        })
        .select()
        .single()

      if (eventError) throw eventError

      // Update user notification preferences if needed
      if (formData.emailReminders || formData.pushNotifications) {
        await supabase
          .from('user_notification_preferences')
          .upsert({
            user_id: userId,
            email_notifications: formData.emailReminders,
            push_notifications: formData.pushNotifications,
            notification_types: {
              homework_due: true,
              homework_overdue: true,
              weekly_summary: true,
              encouragement: true,
              milestone: true
            }
          })
      }

      onScheduled?.()
      onClose()
    } catch (error) {
      console.error('Error scheduling practice:', error)
    } finally {
      setLoading(false)
    }
  }

  const reminderOptions = [
    { value: 5, label: '5 minutes' },
    { value: 15, label: '15 minutes' },
    { value: 30, label: '30 minutes' },
    { value: 60, label: '1 hour' },
    { value: 120, label: '2 hours' },
    { value: 1440, label: '1 day' }
  ]

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Schedule Practice
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Practice Details */}
          <div className="space-y-3">
            <div>
              <Label htmlFor="title">Practice Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
                placeholder="Enter practice title"
              />
            </div>

            <div>
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Practice description"
                rows={2}
              />
            </div>
          </div>

          {/* Scheduling */}
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="date">Date</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData(prev => ({ ...prev, date: e.target.value }))}
                />
              </div>
              <div>
                <Label htmlFor="time">Time</Label>
                <Input
                  id="time"
                  type="time"
                  value={formData.time}
                  onChange={(e) => setFormData(prev => ({ ...prev, time: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="duration">Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  min="5"
                  max="120"
                  value={formData.duration}
                  onChange={(e) => setFormData(prev => ({ ...prev, duration: parseInt(e.target.value) }))}
                />
              </div>
              <div>
                <Label htmlFor="frequency">Frequency</Label>
                <Select
                  value={formData.frequency}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, frequency: value }))}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="one_time">One time</SelectItem>
                    <SelectItem value="daily">Daily</SelectItem>
                    <SelectItem value="weekly">Weekly</SelectItem>
                    <SelectItem value="bi_weekly">Bi-weekly</SelectItem>
                    <SelectItem value="monthly">Monthly</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          {/* Reminders */}
          <div className="space-y-3">
            <Label className="flex items-center gap-2">
              <Bell className="h-4 w-4" />
              Reminders
            </Label>
            <div className="grid grid-cols-2 gap-2">
              {reminderOptions.map((option) => (
                <label key={option.value} className="flex items-center space-x-2 text-sm">
                  <input
                    type="checkbox"
                    checked={formData.reminderMinutes.includes(option.value)}
                    onChange={(e) => handleReminderChange(option.value, e.target.checked)}
                    className="rounded"
                  />
                  <span>{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Notification Preferences */}
          <div className="space-y-3">
            <Label>Notification Options</Label>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">Email reminders</span>
                </div>
                <Switch
                  checked={formData.emailReminders}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, emailReminders: checked }))}
                />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Bell className="h-4 w-4" />
                  <span className="text-sm">Push notifications</span>
                </div>
                <Switch
                  checked={formData.pushNotifications}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, pushNotifications: checked }))}
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea
              id="notes"
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              placeholder="Any additional notes or instructions..."
              rows={2}
            />
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={loading} className="flex-1">
              {loading ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Scheduling...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Schedule
                </div>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
