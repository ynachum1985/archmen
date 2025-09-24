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
import { UnifiedPersonalityForm } from './UnifiedPersonalityForm'

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
    unified_questions: [],
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

  // Removed bulk embedding generation - now handled individually per personality via dialog

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
              <UnifiedPersonalityForm
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
          <UnifiedPersonalityForm
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


