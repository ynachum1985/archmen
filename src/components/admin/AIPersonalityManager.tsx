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
    goals: [''],
    behavior_traits: [''],
    system_prompt_template: '',
    is_active: true,
    personality_config: {
      questioning_approach: '',
      behavioral_traits: '',
      goals_and_objectives: ''
    },
    questioning_style: 'reflective',
    tone: 'warm',
    challenge_level: 5,
    emotional_attunement: 7
  })
  
  const [isGeneratingEmbeddings, setIsGeneratingEmbeddings] = useState(false)

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
      goals: [''],
      behavior_traits: [''],
      system_prompt_template: '',
      is_active: true,
      personality_config: {
        questioning_approach: '',
        behavioral_traits: '',
        goals_and_objectives: ''
      },
      questioning_style: 'reflective',
      tone: 'warm',
      challenge_level: 5,
      emotional_attunement: 7
    })
  }

  const generateEmbeddings = async () => {
    setIsGeneratingEmbeddings(true)
    try {
      const response = await fetch('/api/generate-embeddings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) throw new Error('Failed to generate embeddings')

      const data = await response.json()
      console.log('Embeddings generated:', data)
      alert('Embeddings generated successfully! RAG system is now ready.')
    } catch (error) {
      console.error('Error generating embeddings:', error)
      alert('Error generating embeddings. Please try again.')
    } finally {
      setIsGeneratingEmbeddings(false)
    }
  }

  const startEdit = (personality: AIPersonality) => {
    setEditingPersonality(personality)
    setNewPersonality({
      name: personality.name,
      description: personality.description,
      open_ended_questions: personality.open_ended_questions,
      clarifying_questions: personality.clarifying_questions,
      goals: personality.goals,
      behavior_traits: personality.behavior_traits,
      system_prompt_template: personality.system_prompt_template,
      is_active: personality.is_active
    })
  }

  const addArrayItem = (field: keyof Pick<NewAIPersonality, 'open_ended_questions' | 'clarifying_questions' | 'goals' | 'behavior_traits'>) => {
    setNewPersonality(prev => ({
      ...prev,
      [field]: [...(prev[field] || []), '']
    }))
  }

  const updateArrayItem = (field: keyof Pick<NewAIPersonality, 'open_ended_questions' | 'clarifying_questions' | 'goals' | 'behavior_traits'>, index: number, value: string) => {
    setNewPersonality(prev => ({
      ...prev,
      [field]: (prev[field] || []).map((item, i) => i === index ? value : item)
    }))
  }

  const removeArrayItem = (field: keyof Pick<NewAIPersonality, 'open_ended_questions' | 'clarifying_questions' | 'goals' | 'behavior_traits'>, index: number) => {
    setNewPersonality(prev => ({
      ...prev,
      [field]: (prev[field] || []).filter((_, i) => i !== index)
    }))
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
          <Button
            onClick={generateEmbeddings}
            disabled={isGeneratingEmbeddings}
            variant="outline"
            className="flex items-center gap-2"
            title="Generate vector embeddings for all archetypes and personalities to enable RAG (Retrieval-Augmented Generation) functionality"
          >
            <Sparkles className="h-4 w-4" />
            {isGeneratingEmbeddings ? 'Generating...' : 'Generate Embeddings'}
          </Button>
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
                onAddArrayItem={addArrayItem}
                onUpdateArrayItem={updateArrayItem}
                onRemoveArrayItem={removeArrayItem}
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
              <CardDescription>{personality.description}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <MessageCircle className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Questions</span>
              </div>
              <div className="text-sm text-gray-600">
                {(personality.open_ended_questions || []).length} open-ended, {(personality.clarifying_questions || []).length} clarifying
              </div>
              
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-gray-500" />
                <span className="text-sm font-medium">Goals</span>
              </div>
              <div className="text-sm text-gray-600">
                {(personality.goals || []).slice(0, 2).join(', ')}
                {(personality.goals || []).length > 2 && ` +${(personality.goals || []).length - 2} more`}
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
            onAddArrayItem={addArrayItem}
            onUpdateArrayItem={updateArrayItem}
            onRemoveArrayItem={removeArrayItem}
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
  onAddArrayItem: (field: keyof Pick<NewAIPersonality, 'open_ended_questions' | 'clarifying_questions' | 'goals' | 'behavior_traits'>) => void
  onUpdateArrayItem: (field: keyof Pick<NewAIPersonality, 'open_ended_questions' | 'clarifying_questions' | 'goals' | 'behavior_traits'>, index: number, value: string) => void
  onRemoveArrayItem: (field: keyof Pick<NewAIPersonality, 'open_ended_questions' | 'clarifying_questions' | 'goals' | 'behavior_traits'>, index: number) => void
}

function PersonalityForm({ personality, onChange, onAddArrayItem, onUpdateArrayItem, onRemoveArrayItem }: PersonalityFormProps) {
  const renderArrayField = (
    field: keyof Pick<NewAIPersonality, 'open_ended_questions' | 'clarifying_questions' | 'goals' | 'behavior_traits'>,
    label: string,
    placeholder: string
  ) => (
    <div className="space-y-3">
      <Label className="text-base font-medium">{label}</Label>
      {(personality[field] || []).map((item, index) => (
        <div key={index} className="flex gap-2">
          <Textarea
            value={item}
            onChange={(e) => onUpdateArrayItem(field, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            rows={2}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onRemoveArrayItem(field, index)}
            className="self-start mt-1"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        onClick={() => onAddArrayItem(field)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {label.slice(0, -1)}
      </Button>
    </div>
  )

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
        <Label htmlFor="description">Description</Label>
        <Textarea
          id="description"
          value={personality.description}
          onChange={(e) => onChange({ ...personality, description: e.target.value })}
          placeholder="Describe this AI personality's approach and style..."
          className="mt-1"
          rows={3}
        />
      </div>

      {/* Individual Fields Mode */}
      <div className="space-y-6">
        {renderArrayField('open_ended_questions', 'Open-Ended Questions', 'Enter an open-ended question this personality would ask...')}
        {renderArrayField('clarifying_questions', 'Clarifying Questions', 'Enter a clarifying question this personality would ask...')}
        {renderArrayField('goals', 'Goals', 'Enter a goal this personality aims to accomplish...')}
        {renderArrayField('behavior_traits', 'Behavior Traits', 'Enter a behavior trait that describes this personality...')}
      </div>

      {/* Enhanced Configuration Fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="questioningStyle">Questioning Style</Label>
          <Select
            value={personality.questioning_style || 'reflective'}
            onValueChange={(value) => onChange({ ...personality, questioning_style: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="reflective">Reflective</SelectItem>
              <SelectItem value="direct">Direct</SelectItem>
              <SelectItem value="exploratory">Exploratory</SelectItem>
              <SelectItem value="analytical">Analytical</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label htmlFor="tone">Tone</Label>
          <Select
            value={personality.tone || 'warm'}
            onValueChange={(value) => onChange({ ...personality, tone: value })}
          >
            <SelectTrigger className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="warm">Warm</SelectItem>
              <SelectItem value="professional">Professional</SelectItem>
              <SelectItem value="casual">Casual</SelectItem>
              <SelectItem value="formal">Formal</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <Label htmlFor="challengeLevel">Challenge Level (1-10)</Label>
          <Input
            id="challengeLevel"
            type="number"
            min="1"
            max="10"
            value={personality.challenge_level || 5}
            onChange={(e) => onChange({ ...personality, challenge_level: parseInt(e.target.value) || 5 })}
            className="mt-1"
          />
        </div>
        <div>
          <Label htmlFor="emotionalAttunement">Emotional Attunement (1-10)</Label>
          <Input
            id="emotionalAttunement"
            type="number"
            min="1"
            max="10"
            value={personality.emotional_attunement || 7}
            onChange={(e) => onChange({ ...personality, emotional_attunement: parseInt(e.target.value) || 7 })}
            className="mt-1"
          />
        </div>
      </div>

      <div>
        <Label htmlFor="systemPrompt">System Prompt Template</Label>
        <Textarea
          id="systemPrompt"
          value={personality.system_prompt_template}
          onChange={(e) => onChange({ ...personality, system_prompt_template: e.target.value })}
          placeholder="Define the system prompt template for this personality..."
          className="mt-1 font-mono text-sm"
          rows={8}
        />
      </div>
    </div>
  )
}
