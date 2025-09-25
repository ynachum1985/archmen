'use client'

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Settings,
  Bell,
  Mail,
  Clock,
  Calendar,
  User,
  Shield,
  X,
  Save
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface UserSettingsModalProps {
  isOpen: boolean
  onClose: () => void
  userId: string
}

interface NotificationPreferences {
  email_notifications: boolean
  push_notifications: boolean
  sms_notifications: boolean
  daily_reminder_time: string
  weekly_summary_day: number
  reminder_frequency: string
  notification_types: {
    homework_due: boolean
    homework_overdue: boolean
    weekly_summary: boolean
    encouragement: boolean
    milestone: boolean
  }
  quiet_hours_start: string
  quiet_hours_end: string
  timezone: string
}

export function UserSettingsModal({ isOpen, onClose, userId }: UserSettingsModalProps) {
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    email_notifications: true,
    push_notifications: true,
    sms_notifications: false,
    daily_reminder_time: '09:00:00',
    weekly_summary_day: 1,
    reminder_frequency: 'normal',
    notification_types: {
      homework_due: true,
      homework_overdue: true,
      weekly_summary: true,
      encouragement: true,
      milestone: true
    },
    quiet_hours_start: '22:00:00',
    quiet_hours_end: '08:00:00',
    timezone: 'UTC'
  })

  useEffect(() => {
    if (isOpen && userId) {
      loadUserPreferences()
    }
  }, [isOpen, userId])

  const loadUserPreferences = async () => {
    try {
      setLoading(true)
      const supabase = createClient()

      const { data, error } = await supabase
        .from('user_notification_preferences')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (error && error.code !== 'PGRST116') { // PGRST116 = no rows returned
        throw error
      }

      if (data) {
        setPreferences({
          email_notifications: data.email_notifications,
          push_notifications: data.push_notifications,
          sms_notifications: data.sms_notifications,
          daily_reminder_time: data.daily_reminder_time,
          weekly_summary_day: data.weekly_summary_day,
          reminder_frequency: data.reminder_frequency,
          notification_types: data.notification_types,
          quiet_hours_start: data.quiet_hours_start,
          quiet_hours_end: data.quiet_hours_end,
          timezone: data.timezone
        })
      }
    } catch (error) {
      console.error('Error loading user preferences:', error)
    } finally {
      setLoading(false)
    }
  }

  const savePreferences = async () => {
    try {
      setSaving(true)
      const supabase = createClient()

      const { error } = await supabase
        .from('user_notification_preferences')
        .upsert({
          user_id: userId,
          ...preferences,
          updated_at: new Date().toISOString()
        })

      if (error) throw error

      onClose()
    } catch (error) {
      console.error('Error saving preferences:', error)
    } finally {
      setSaving(false)
    }
  }

  const updateNotificationType = (type: keyof typeof preferences.notification_types, enabled: boolean) => {
    setPreferences(prev => ({
      ...prev,
      notification_types: {
        ...prev.notification_types,
        [type]: enabled
      }
    }))
  }

  const weekDays = [
    { value: 0, label: 'Sunday' },
    { value: 1, label: 'Monday' },
    { value: 2, label: 'Tuesday' },
    { value: 3, label: 'Wednesday' },
    { value: 4, label: 'Thursday' },
    { value: 5, label: 'Friday' },
    { value: 6, label: 'Saturday' }
  ]

  if (loading) {
    return (
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className="max-w-2xl">
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-gray-600">Loading settings...</span>
          </div>
        </DialogContent>
      </Dialog>
    )
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-hidden">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Settings
            </DialogTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </DialogHeader>

        <Tabs defaultValue="notifications" className="flex-1">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="notifications">Notifications</TabsTrigger>
            <TabsTrigger value="schedule">Schedule</TabsTrigger>
            <TabsTrigger value="privacy">Privacy</TabsTrigger>
          </TabsList>

          <div className="mt-4 max-h-[60vh] overflow-y-auto">
            <TabsContent value="notifications" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Bell className="h-5 w-5" />
                    Notification Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {/* Main notification toggles */}
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Mail className="h-4 w-4" />
                        <span>Email notifications</span>
                      </div>
                      <Switch
                        checked={preferences.email_notifications}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, email_notifications: checked }))}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Bell className="h-4 w-4" />
                        <span>Push notifications</span>
                      </div>
                      <Switch
                        checked={preferences.push_notifications}
                        onCheckedChange={(checked) => setPreferences(prev => ({ ...prev, push_notifications: checked }))}
                      />
                    </div>
                  </div>

                  {/* Notification types */}
                  <div className="space-y-3">
                    <Label className="text-sm font-medium">Notification Types</Label>
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Practice reminders</span>
                        <Switch
                          checked={preferences.notification_types.homework_due}
                          onCheckedChange={(checked) => updateNotificationType('homework_due', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Overdue practices</span>
                        <Switch
                          checked={preferences.notification_types.homework_overdue}
                          onCheckedChange={(checked) => updateNotificationType('homework_overdue', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Weekly summaries</span>
                        <Switch
                          checked={preferences.notification_types.weekly_summary}
                          onCheckedChange={(checked) => updateNotificationType('weekly_summary', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Encouragement messages</span>
                        <Switch
                          checked={preferences.notification_types.encouragement}
                          onCheckedChange={(checked) => updateNotificationType('encouragement', checked)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm">Milestone celebrations</span>
                        <Switch
                          checked={preferences.notification_types.milestone}
                          onCheckedChange={(checked) => updateNotificationType('milestone', checked)}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Reminder frequency */}
                  <div>
                    <Label htmlFor="reminder-frequency">Reminder Frequency</Label>
                    <Select
                      value={preferences.reminder_frequency}
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, reminder_frequency: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="minimal">Minimal</SelectItem>
                        <SelectItem value="normal">Normal</SelectItem>
                        <SelectItem value="frequent">Frequent</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="schedule" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Schedule Preferences
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label htmlFor="daily-reminder">Daily Reminder Time</Label>
                    <Input
                      id="daily-reminder"
                      type="time"
                      value={preferences.daily_reminder_time.slice(0, 5)}
                      onChange={(e) => setPreferences(prev => ({ ...prev, daily_reminder_time: e.target.value + ':00' }))}
                    />
                  </div>

                  <div>
                    <Label htmlFor="weekly-summary">Weekly Summary Day</Label>
                    <Select
                      value={preferences.weekly_summary_day.toString()}
                      onValueChange={(value) => setPreferences(prev => ({ ...prev, weekly_summary_day: parseInt(value) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {weekDays.map((day) => (
                          <SelectItem key={day.value} value={day.value.toString()}>
                            {day.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="quiet-start">Quiet Hours Start</Label>
                      <Input
                        id="quiet-start"
                        type="time"
                        value={preferences.quiet_hours_start.slice(0, 5)}
                        onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_start: e.target.value + ':00' }))}
                      />
                    </div>
                    <div>
                      <Label htmlFor="quiet-end">Quiet Hours End</Label>
                      <Input
                        id="quiet-end"
                        type="time"
                        value={preferences.quiet_hours_end.slice(0, 5)}
                        onChange={(e) => setPreferences(prev => ({ ...prev, quiet_hours_end: e.target.value + ':00' }))}
                      />
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="privacy" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Shield className="h-5 w-5" />
                    Privacy & Data
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-sm text-gray-600 space-y-2">
                    <p>Your privacy is important to us. Here's how we handle your data:</p>
                    <ul className="list-disc list-inside space-y-1">
                      <li>Assessment responses are encrypted and stored securely</li>
                      <li>Personal insights are only visible to you</li>
                      <li>We never share your individual data with third parties</li>
                      <li>You can export or delete your data at any time</li>
                    </ul>
                  </div>
                  
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full">
                      Export My Data
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </div>

          <div className="flex gap-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose} className="flex-1">
              Cancel
            </Button>
            <Button onClick={savePreferences} disabled={saving} className="flex-1">
              {saving ? (
                <div className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <Save className="h-4 w-4" />
                  Save Settings
                </div>
              )}
            </Button>
          </div>
        </Tabs>
      </DialogContent>
    </Dialog>
  )
}
