'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Edit, Trash2, Brain, MessageCircle, Target, X, Sparkles } from 'lucide-react'
import { AIPersonality, NewAIPersonality, aiPersonalityService } from '@/lib/services/ai-personality.service'
import { EmbeddingSettingsDialog } from './EmbeddingSettingsDialog'

export function AIPersonalityManager() {
  const [personalities, setPersonalities] = useState<AIPersonality[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showCreateDialog, setShowCreateDialog] = useState(false)
  const [editingPersonality, setEditingPersonality] = useState<AIPersonality | null>(null)
  const [newPersonality, setNewPersonality] = useState<NewAIPersonality>({
    name: '',
    description: '',
    open_ended_questions: [''],
    clarifying_questions: [''],
    specific_questions: [''],
    goals: [],
    behavior_traits: [],
    safety_limits: [''],
    escalation_triggers: [''],
    preferred_interventions: [''],
    pacing_settings: {
      questions_per_session: 8,
      pause_between_questions: 30,
      max_session_duration: 45,
      break_frequency: 'every_15_minutes'
    },
    system_prompt_template: '',
    is_active: true
  })
  


  useEffect(() => {
    loadPersonalities()
  }, [])

  const loadPersonalities = async () => {
    try {
      await aiPersonalityService.initializeDefaultPersonalities()
      const data = await aiPersonalityService.getAllPersonalities()
      setPersonalities(data)
    } catch (error) {
      console.error('Error loading personalities:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleCreate = async () => {
    try {
      const created = await aiPersonalityService.createPersonality(newPersonality)
      setPersonalities(prev => [...prev, created])
      setShowCreateDialog(false)
      resetForm()
    } catch (error) {
      console.error('Error creating personality:', error)
    }
  }

  const handleUpdate = async () => {
    if (!editingPersonality) return
    
    try {
      const updated = await aiPersonalityService.updatePersonality(editingPersonality.id, newPersonality)
      setPersonalities(prev => (prev || []).map(p => p.id === updated.id ? updated : p))
      setEditingPersonality(null)
      resetForm()
    } catch (error) {
      console.error('Error updating personality:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this personality?')) return
    
    try {
      await aiPersonalityService.deletePersonality(id)
      setPersonalities(prev => prev.filter(p => p.id !== id))
    } catch (error) {
      console.error('Error deleting personality:', error)
    }
  }

  const resetForm = () => {
    setNewPersonality({
      name: '',
      description: '',
      open_ended_questions: [''],
      clarifying_questions: [''],
      specific_questions: [''],
      goals: [],
      behavior_traits: [],
      safety_limits: [''],
      escalation_triggers: [''],
      preferred_interventions: [''],
      pacing_settings: {
        questions_per_session: 8,
        pause_between_questions: 30,
        max_session_duration: 45,
        break_frequency: 'every_15_minutes'
      },
      system_prompt_template: '',
      is_active: true
    })
  }

  // Removed bulk embedding generation - now handled individually per personality via dialog

  const startEdit = (personality: AIPersonality) => {
    setEditingPersonality(personality)
    setNewPersonality({
      name: personality.name,
      description: personality.description,
      open_ended_questions: personality.open_ended_questions || [],
      clarifying_questions: personality.clarifying_questions || [],
      specific_questions: personality.specific_questions || [],
      goals: personality.goals || [],
      behavior_traits: personality.behavior_traits || [],
      safety_limits: personality.safety_limits || [],
      escalation_triggers: personality.escalation_triggers || [],
      preferred_interventions: personality.preferred_interventions || [],
      pacing_settings: personality.pacing_settings || {
        questions_per_session: 8,
        pause_between_questions: 30,
        max_session_duration: 45,
        break_frequency: 'every_15_minutes'
      },
      system_prompt_template: personality.system_prompt_template,
      is_active: personality.is_active
    })
  }



  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Loading personalities...</div>
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">AI Personalities</h2>
          <p className="text-gray-600 mt-1">Configure AI personalities for different assessment approaches with RAG capabilities</p>
        </div>
        <div className="flex gap-2">
          {/* Bulk generate embeddings button removed - now handled individually per personality */}
          <Dialog open={showCreateDialog} onOpenChange={setShowCreateDialog}>
            <DialogTrigger asChild>
              <Button className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Create Personality
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
              <DialogHeader>
                <DialogTitle>Create AI Personality</DialogTitle>
                <DialogDescription>
                  Configure a new AI personality for assessments.
                </DialogDescription>
              </DialogHeader>
              <PersonalityForm
                personality={newPersonality}
                onChange={setNewPersonality}
              />
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowCreateDialog(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreate} disabled={!newPersonality.name.trim()}>
                  Create Personality
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(personalities || []).map((personality) => (
          <Card key={personality.id} className="relative">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">{personality.name}</CardTitle>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={personality.is_active ? "default" : "secondary"}>
                    {personality.is_active ? "Active" : "Inactive"}
                  </Badge>
                  <div className="flex gap-1">
                    <EmbeddingSettingsDialog
                      trigger={
                        <Button
                          variant="ghost"
                          size="sm"
                          className="text-gray-400 hover:text-emerald-600"
                          title={`Embedding settings for ${personality.name}`}
                        >
                          <Sparkles className="h-4 w-4" />
                        </Button>
                      }
                      title={personality.name}
                      description={`Configure embedding settings for the ${personality.name} AI personality`}
                      itemId={personality.id}
                      itemType="ai-personality"
                      onSave={(settings) => {
                        console.log(`Saving embedding settings for ${personality.name}:`, settings)
                        // TODO: Save settings to database
                      }}
                    />
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => startEdit(personality)}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(personality.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
              <CardDescription className="line-clamp-2">
                {personality.system_prompt_template || 'No system prompt configured'}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <MessageCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm font-medium">Questions</span>
                </div>
                <div className="text-sm text-gray-600">
                  Total: {(personality.open_ended_questions || []).length + (personality.clarifying_questions || []).length + (personality.specific_questions || []).length} questions
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <Target className="h-4 w-4 text-green-500" />
                  <span className="text-sm font-medium">Safety & Pacing</span>
                </div>
                <div className="text-sm text-gray-600">
                  {(personality.safety_limits || []).length} safety limits • {personality.pacing_settings?.questions_per_session || 8} questions/session
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Edit Dialog */}
      <Dialog open={!!editingPersonality} onOpenChange={(open) => !open && setEditingPersonality(null)}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white">
          <DialogHeader>
            <DialogTitle>Edit AI Personality</DialogTitle>
            <DialogDescription>
              Modify the AI personality configuration.
            </DialogDescription>
          </DialogHeader>
          <PersonalityForm
            personality={newPersonality}
            onChange={setNewPersonality}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setEditingPersonality(null)}>
              Cancel
            </Button>
            <Button onClick={handleUpdate} disabled={!newPersonality.name.trim()}>
              Update Personality
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

interface PersonalityFormProps {
  personality: NewAIPersonality
  onChange: (personality: NewAIPersonality) => void
}

function PersonalityForm({ personality, onChange }: PersonalityFormProps) {


  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="name">Personality Name</Label>
          <Input
            id="name"
            value={personality.name}
            onChange={(e) => onChange({ ...personality, name: e.target.value })}
            placeholder="e.g., Empathetic Guide"
            className="mt-1"
          />
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="active"
            checked={personality.is_active}
            onCheckedChange={(checked) => onChange({ ...personality, is_active: checked })}
          />
          <Label htmlFor="active">Active</Label>
        </div>
      </div>

      <div>
        <Label htmlFor="systemPrompt">System Prompt Template</Label>
        <Textarea
          id="systemPrompt"
          value={personality.system_prompt_template}
          onChange={(e) => onChange({ ...personality, system_prompt_template: e.target.value })}
          placeholder="Define the system prompt template for this personality..."
          className="mt-1 font-mono text-sm resize-none"
          rows={6}
        />
      </div>

      {/* Questions Section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">All Questions</Label>
        <Textarea
          value={[
            ...(personality.open_ended_questions || []),
            ...(personality.clarifying_questions || []),
            ...(personality.specific_questions || [])
          ].join('\n')}
          onChange={(e) => {
            const allQuestions = e.target.value.split('\n').filter(q => q.trim())
            // For simplicity, put all questions in open_ended_questions
            onChange({
              ...personality,
              open_ended_questions: allQuestions,
              clarifying_questions: [],
              specific_questions: []
            })
          }}
          placeholder="Enter all questions here, one per line:&#10;&#10;Tell me about a moment when you felt most authentic...&#10;When you say that, what feelings come up?&#10;Do you tend to initiate plans or follow others?"
          className="mt-1 resize-none"
          rows={6}
        />
        <p className="text-xs text-gray-500">
          Enter all questions (open-ended, clarifying, and specific) in one text box, one question per line.
        </p>
      </div>

      {/* Combined Safety Section */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Safety, Triggers & Interventions</Label>
        <Textarea
          value={[
            ...(personality.safety_limits || []).map(item => `SAFETY: ${item}`),
            ...(personality.escalation_triggers || []).map(item => `TRIGGER: ${item}`),
            ...(personality.preferred_interventions || []).map(item => `INTERVENTION: ${item}`)
          ].join('\n')}
          onChange={(e) => {
            const lines = e.target.value.split('\n').filter(line => line.trim())
            const safety = lines.filter(line => line.startsWith('SAFETY:')).map(line => line.replace('SAFETY:', '').trim())
            const triggers = lines.filter(line => line.startsWith('TRIGGER:')).map(line => line.replace('TRIGGER:', '').trim())
            const interventions = lines.filter(line => line.startsWith('INTERVENTION:')).map(line => line.replace('INTERVENTION:', '').trim())

            onChange({
              ...personality,
              safety_limits: safety,
              escalation_triggers: triggers,
              preferred_interventions: interventions
            })
          }}
          placeholder="Enter safety limits, escalation triggers, and preferred interventions:&#10;&#10;SAFETY: Avoid giving medical or therapeutic advice&#10;SAFETY: Do not encourage harmful behaviors&#10;&#10;TRIGGER: Mentions of self-harm or suicide&#10;TRIGGER: Expressions of violence toward others&#10;&#10;INTERVENTION: Gentle redirection to professional help&#10;INTERVENTION: Validation of feelings while maintaining boundaries"
          className="mt-1 resize-none"
          rows={6}
        />
        <p className="text-xs text-gray-500">
          Use prefixes: SAFETY: for safety limits, TRIGGER: for escalation triggers, INTERVENTION: for preferred interventions. One item per line.
        </p>
      </div>

      {/* Pacing Settings */}
      <div className="space-y-3">
        <Label className="text-base font-medium">Pacing Settings</Label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <Label htmlFor="questionsPerSession">Questions per Session</Label>
            <Input
              id="questionsPerSession"
              type="number"
              min="1"
              max="20"
              value={personality.pacing_settings.questions_per_session}
              onChange={(e) => onChange({
                ...personality,
                pacing_settings: {
                  ...personality.pacing_settings,
                  questions_per_session: parseInt(e.target.value) || 8
                }
              })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="pauseBetween">Pause Between (seconds)</Label>
            <Input
              id="pauseBetween"
              type="number"
              min="0"
              max="300"
              value={personality.pacing_settings.pause_between_questions}
              onChange={(e) => onChange({
                ...personality,
                pacing_settings: {
                  ...personality.pacing_settings,
                  pause_between_questions: parseInt(e.target.value) || 30
                }
              })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="maxDuration">Max Duration (minutes)</Label>
            <Input
              id="maxDuration"
              type="number"
              min="5"
              max="120"
              value={personality.pacing_settings.max_session_duration}
              onChange={(e) => onChange({
                ...personality,
                pacing_settings: {
                  ...personality.pacing_settings,
                  max_session_duration: parseInt(e.target.value) || 45
                }
              })}
              className="mt-1"
            />
          </div>
          <div>
            <Label htmlFor="breakFrequency">Break Frequency</Label>
            <Select
              value={personality.pacing_settings.break_frequency}
              onValueChange={(value) => onChange({
                ...personality,
                pacing_settings: {
                  ...personality.pacing_settings,
                  break_frequency: value
                }
              })}
            >
              <SelectTrigger className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="never">Never</SelectItem>
                <SelectItem value="every_10_minutes">Every 10 minutes</SelectItem>
                <SelectItem value="every_15_minutes">Every 15 minutes</SelectItem>
                <SelectItem value="every_20_minutes">Every 20 minutes</SelectItem>
                <SelectItem value="every_30_minutes">Every 30 minutes</SelectItem>
              </SelectContent>
            </Select>

          </div>
        </div>
      </div>
    </div>
  )
}


