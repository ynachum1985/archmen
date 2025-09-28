'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Slider } from '@/components/ui/slider'
import { Switch } from '@/components/ui/switch'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { AlertTriangle, Shield, Settings, Eye, Plus, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ModerationSettings {
  openai_thresholds: {
    block: number
    flag: number
    allow: number
  }
  perspective_thresholds: {
    toxicity: number
    severe_toxicity: number
    identity_attack: number
    insult: number
    profanity: number
    threat: number
  }
  auto_block_categories: string[]
  human_review_categories: string[]
  notification_settings: {
    admin_email: boolean
    slack_webhook: boolean
    dashboard_alerts: boolean
  }
}

interface ModerationPattern {
  id: string
  pattern_name: string
  pattern_regex: string
  category: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  is_active: boolean
  description: string
}

export default function ModerationSettings() {
  const [settings, setSettings] = useState<ModerationSettings | null>(null)
  const [patterns, setPatterns] = useState<ModerationPattern[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [newPattern, setNewPattern] = useState({
    pattern_name: '',
    pattern_regex: '',
    category: '',
    severity: 'medium' as const,
    description: ''
  })

  useEffect(() => {
    loadSettings()
  }, [])

  const loadSettings = async () => {
    try {
      const supabase = createClient()
      
      // Load moderation settings
      const { data: settingsData } = await supabase
        .from('moderation_settings')
        .select('*')

      // Load moderation patterns
      const { data: patternsData } = await supabase
        .from('moderation_patterns')
        .select('*')
        .order('created_at', { ascending: false })

      // Convert settings array to object
      const settingsObj: any = {}
      settingsData?.forEach(setting => {
        settingsObj[setting.setting_name] = setting.setting_value
      })

      setSettings(settingsObj)
      setPatterns(patternsData || [])
    } catch (error) {
      console.error('Failed to load moderation settings:', error)
    } finally {
      setLoading(false)
    }
  }

  const saveSettings = async () => {
    if (!settings) return

    setSaving(true)
    try {
      const supabase = createClient()

      // Update each setting
      for (const [key, value] of Object.entries(settings)) {
        await supabase
          .from('moderation_settings')
          .upsert({
            setting_name: key,
            setting_value: value,
            updated_at: new Date().toISOString()
          })
      }

      alert('Settings saved successfully!')
    } catch (error) {
      console.error('Failed to save settings:', error)
      alert('Failed to save settings')
    } finally {
      setSaving(false)
    }
  }

  const addPattern = async () => {
    if (!newPattern.pattern_name || !newPattern.pattern_regex) return

    try {
      const supabase = createClient()
      
      const { data, error } = await supabase
        .from('moderation_patterns')
        .insert([{
          ...newPattern,
          is_active: true
        }])
        .select()

      if (error) throw error

      setPatterns([...patterns, data[0]])
      setNewPattern({
        pattern_name: '',
        pattern_regex: '',
        category: '',
        severity: 'medium',
        description: ''
      })
    } catch (error) {
      console.error('Failed to add pattern:', error)
    }
  }

  const togglePattern = async (id: string, isActive: boolean) => {
    try {
      const supabase = createClient()
      
      await supabase
        .from('moderation_patterns')
        .update({ is_active: isActive })
        .eq('id', id)

      setPatterns(patterns.map(p => 
        p.id === id ? { ...p, is_active: isActive } : p
      ))
    } catch (error) {
      console.error('Failed to toggle pattern:', error)
    }
  }

  const deletePattern = async (id: string) => {
    if (!confirm('Are you sure you want to delete this pattern?')) return

    try {
      const supabase = createClient()
      
      await supabase
        .from('moderation_patterns')
        .delete()
        .eq('id', id)

      setPatterns(patterns.filter(p => p.id !== id))
    } catch (error) {
      console.error('Failed to delete pattern:', error)
    }
  }

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'critical': return 'destructive'
      case 'high': return 'secondary'
      case 'medium': return 'outline'
      case 'low': return 'default'
      default: return 'default'
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading moderation settings...</p>
        </div>
      </div>
    )
  }

  if (!settings) {
    return (
      <div className="text-center p-8">
        <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
        <h3 className="text-lg font-medium mb-2">Settings Not Found</h3>
        <p className="text-muted-foreground">Unable to load moderation settings.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-xl font-semibold">Moderation Settings</h3>
          <p className="text-muted-foreground">Configure AI moderation thresholds and patterns</p>
        </div>
        <Button onClick={saveSettings} disabled={saving}>
          <Settings className="h-4 w-4 mr-2" />
          {saving ? 'Saving...' : 'Save Settings'}
        </Button>
      </div>

      <Tabs defaultValue="thresholds" className="space-y-4">
        <TabsList>
          <TabsTrigger value="thresholds">API Thresholds</TabsTrigger>
          <TabsTrigger value="patterns">Custom Patterns</TabsTrigger>
          <TabsTrigger value="categories">Categories</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
        </TabsList>

        <TabsContent value="thresholds" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* OpenAI Thresholds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="h-5 w-5" />
                  OpenAI Moderation API
                </CardTitle>
                <CardDescription>
                  Configure thresholds for OpenAI's content moderation
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Block Threshold: {(settings.openai_thresholds?.block * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.openai_thresholds?.block * 100 || 80]}
                    onValueChange={([value]) => setSettings({
                      ...settings,
                      openai_thresholds: {
                        ...settings.openai_thresholds,
                        block: value / 100
                      }
                    })}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Content above this threshold is automatically blocked
                  </p>
                </div>

                <div>
                  <Label>Flag Threshold: {(settings.openai_thresholds?.flag * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.openai_thresholds?.flag * 100 || 50]}
                    onValueChange={([value]) => setSettings({
                      ...settings,
                      openai_thresholds: {
                        ...settings.openai_thresholds,
                        flag: value / 100
                      }
                    })}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                  <p className="text-xs text-muted-foreground mt-1">
                    Content above this threshold is flagged for review
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Perspective API Thresholds */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="h-5 w-5" />
                  Google Perspective API
                </CardTitle>
                <CardDescription>
                  Configure thresholds for toxicity detection
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Toxicity: {(settings.perspective_thresholds?.toxicity * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.perspective_thresholds?.toxicity * 100 || 70]}
                    onValueChange={([value]) => setSettings({
                      ...settings,
                      perspective_thresholds: {
                        ...settings.perspective_thresholds,
                        toxicity: value / 100
                      }
                    })}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Threat: {(settings.perspective_thresholds?.threat * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.perspective_thresholds?.threat * 100 || 40]}
                    onValueChange={([value]) => setSettings({
                      ...settings,
                      perspective_thresholds: {
                        ...settings.perspective_thresholds,
                        threat: value / 100
                      }
                    })}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>

                <div>
                  <Label>Identity Attack: {(settings.perspective_thresholds?.identity_attack * 100).toFixed(0)}%</Label>
                  <Slider
                    value={[settings.perspective_thresholds?.identity_attack * 100 || 60]}
                    onValueChange={([value]) => setSettings({
                      ...settings,
                      perspective_thresholds: {
                        ...settings.perspective_thresholds,
                        identity_attack: value / 100
                      }
                    })}
                    max={100}
                    step={5}
                    className="mt-2"
                  />
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="patterns" className="space-y-4">
          {/* Add New Pattern */}
          <Card>
            <CardHeader>
              <CardTitle>Add Custom Pattern</CardTitle>
              <CardDescription>
                Create custom regex patterns for relationship-specific content detection
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="pattern-name">Pattern Name</Label>
                  <Input
                    id="pattern-name"
                    value={newPattern.pattern_name}
                    onChange={(e) => setNewPattern({...newPattern, pattern_name: e.target.value})}
                    placeholder="e.g., Manipulation Tactics"
                  />
                </div>
                <div>
                  <Label htmlFor="pattern-category">Category</Label>
                  <Input
                    id="pattern-category"
                    value={newPattern.category}
                    onChange={(e) => setNewPattern({...newPattern, category: e.target.value})}
                    placeholder="e.g., manipulation"
                  />
                </div>
              </div>
              
              <div>
                <Label htmlFor="pattern-regex">Regex Pattern</Label>
                <Input
                  id="pattern-regex"
                  value={newPattern.pattern_regex}
                  onChange={(e) => setNewPattern({...newPattern, pattern_regex: e.target.value})}
                  placeholder="e.g., \\b(gaslight|manipulate).*\\b"
                  className="font-mono"
                />
              </div>

              <div>
                <Label htmlFor="pattern-description">Description</Label>
                <Textarea
                  id="pattern-description"
                  value={newPattern.description}
                  onChange={(e) => setNewPattern({...newPattern, description: e.target.value})}
                  placeholder="Describe what this pattern detects..."
                  className="resize-y overflow-auto max-h-32"
                />
              </div>

              <Button onClick={addPattern} className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                Add Pattern
              </Button>
            </CardContent>
          </Card>

          {/* Existing Patterns */}
          <Card>
            <CardHeader>
              <CardTitle>Active Patterns</CardTitle>
              <CardDescription>
                Manage existing moderation patterns
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {patterns.map((pattern) => (
                  <div key={pattern.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h4 className="font-medium">{pattern.pattern_name}</h4>
                        <Badge variant={getSeverityColor(pattern.severity)}>
                          {pattern.severity}
                        </Badge>
                        <Badge variant="outline">{pattern.category}</Badge>
                      </div>
                      <p className="text-sm text-muted-foreground mb-2">{pattern.description}</p>
                      <code className="text-xs bg-muted px-2 py-1 rounded">{pattern.pattern_regex}</code>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch
                        checked={pattern.is_active}
                        onCheckedChange={(checked) => togglePattern(pattern.id, checked)}
                      />
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => deletePattern(pattern.id)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Auto-Block Categories</CardTitle>
                <CardDescription>
                  Categories that trigger immediate blocking
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {settings.auto_block_categories?.map((category, index) => (
                    <Badge key={index} variant="destructive">{category}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Human Review Categories</CardTitle>
                <CardDescription>
                  Categories that require human review
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {settings.human_review_categories?.map((category, index) => (
                    <Badge key={index} variant="secondary">{category}</Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure how you receive moderation alerts
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Admin Email Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    Receive email alerts for critical incidents
                  </p>
                </div>
                <Switch
                  checked={settings.notification_settings?.admin_email}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notification_settings: {
                      ...settings.notification_settings,
                      admin_email: checked
                    }
                  })}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label>Dashboard Alerts</Label>
                  <p className="text-sm text-muted-foreground">
                    Show real-time alerts in the admin dashboard
                  </p>
                </div>
                <Switch
                  checked={settings.notification_settings?.dashboard_alerts}
                  onCheckedChange={(checked) => setSettings({
                    ...settings,
                    notification_settings: {
                      ...settings.notification_settings,
                      dashboard_alerts: checked
                    }
                  })}
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
