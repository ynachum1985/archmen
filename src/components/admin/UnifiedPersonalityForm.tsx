'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Plus, Minus, MessageCircle, HelpCircle, Target, ArrowRight } from 'lucide-react'
import { NewAIPersonality, UnifiedQuestion } from '@/lib/services/ai-personality.service'

interface UnifiedPersonalityFormProps {
  personality: NewAIPersonality
  onChange: (personality: NewAIPersonality) => void
}

const QUESTION_TYPES = [
  { value: 'open_ended', label: 'Open-Ended', icon: MessageCircle, color: 'bg-blue-100 text-blue-700' },
  { value: 'clarifying', label: 'Clarifying', icon: HelpCircle, color: 'bg-green-100 text-green-700' },
  { value: 'specific', label: 'Specific', icon: Target, color: 'bg-purple-100 text-purple-700' },
  { value: 'follow_up', label: 'Follow-Up', icon: ArrowRight, color: 'bg-orange-100 text-orange-700' }
] as const

const DIFFICULTY_LEVELS = ['easy', 'moderate', 'challenging', 'deep'] as const
const EMOTIONAL_TONES = ['neutral', 'warm', 'curious', 'challenging', 'supportive'] as const
const CATEGORIES = ['identity', 'relationships', 'values', 'emotions', 'patterns', 'growth', 'conflict', 'motivation', 'social'] as const

export function UnifiedPersonalityForm({ personality, onChange }: UnifiedPersonalityFormProps) {
  const [activeTab, setActiveTab] = useState('basic')

  const updatePersonality = (updates: Partial<NewAIPersonality>) => {
    onChange({ ...personality, ...updates })
  }

  const addUnifiedQuestion = () => {
    const newQuestion: UnifiedQuestion = {
      id: `q-${Date.now()}`,
      question_text: '',
      question_type: 'open_ended',
      category: 'general',
      difficulty_level: 'moderate',
      emotional_tone: 'neutral',
      is_active: true,
      order_index: (personality.unified_questions?.length || 0) + 1
    }

    updatePersonality({
      unified_questions: [...(personality.unified_questions || []), newQuestion]
    })
  }

  const updateUnifiedQuestion = (index: number, updates: Partial<UnifiedQuestion>) => {
    const questions = [...(personality.unified_questions || [])]
    questions[index] = { ...questions[index], ...updates }
    updatePersonality({ unified_questions: questions })
  }

  const removeUnifiedQuestion = (index: number) => {
    const questions = [...(personality.unified_questions || [])]
    questions.splice(index, 1)
    updatePersonality({ unified_questions: questions })
  }

  const addArrayItem = (field: 'goals' | 'behavior_traits') => {
    updatePersonality({
      [field]: [...(personality[field] || []), '']
    })
  }

  const updateArrayItem = (field: 'goals' | 'behavior_traits', index: number, value: string) => {
    const items = [...(personality[field] || [])]
    items[index] = value
    updatePersonality({ [field]: items })
  }

  const removeArrayItem = (field: 'goals' | 'behavior_traits', index: number) => {
    const items = [...(personality[field] || [])]
    items.splice(index, 1)
    updatePersonality({ [field]: items })
  }

  const loadStandardQuestions = (type: UnifiedQuestion['question_type']) => {
    const standardQuestions: Record<UnifiedQuestion['question_type'], UnifiedQuestion[]> = {
      open_ended: [
        {
          id: `q-${Date.now()}-1`,
          question_text: "Tell me about a moment when you felt most authentic and true to yourself.",
          question_type: 'open_ended',
          category: 'identity',
          difficulty_level: 'moderate',
          emotional_tone: 'warm',
          is_active: true,
          order_index: 1
        },
        {
          id: `q-${Date.now()}-2`,
          question_text: "Describe a relationship that has significantly shaped who you are today.",
          question_type: 'open_ended',
          category: 'relationships',
          difficulty_level: 'moderate',
          emotional_tone: 'curious',
          is_active: true,
          order_index: 2
        },
        {
          id: `q-${Date.now()}-3`,
          question_text: "What does feeling 'at home' mean to you, and when do you experience that feeling?",
          question_type: 'open_ended',
          category: 'values',
          difficulty_level: 'moderate',
          emotional_tone: 'warm',
          is_active: true,
          order_index: 3
        }
      ],
      clarifying: [
        {
          id: `q-${Date.now()}-4`,
          question_text: "When you say that, what feelings come up for you?",
          question_type: 'clarifying',
          category: 'emotions',
          difficulty_level: 'easy',
          emotional_tone: 'warm',
          is_active: true,
          order_index: 1
        },
        {
          id: `q-${Date.now()}-5`,
          question_text: "Can you help me understand what that experience was like for you?",
          question_type: 'clarifying',
          category: 'emotions',
          difficulty_level: 'easy',
          emotional_tone: 'curious',
          is_active: true,
          order_index: 2
        }
      ],
      specific: [
        {
          id: `q-${Date.now()}-6`,
          question_text: "In your closest relationships, do you tend to be the one who initiates plans and takes charge, or do you prefer to follow someone else's lead?",
          question_type: 'specific',
          category: 'relationships',
          difficulty_level: 'moderate',
          emotional_tone: 'neutral',
          is_active: true,
          order_index: 1
        },
        {
          id: `q-${Date.now()}-7`,
          question_text: "When facing a major life decision, do you rely more on logical analysis or gut feelings?",
          question_type: 'specific',
          category: 'values',
          difficulty_level: 'moderate',
          emotional_tone: 'neutral',
          is_active: true,
          order_index: 2
        }
      ],
      follow_up: [
        {
          id: `q-${Date.now()}-8`,
          question_text: "Can you give me a specific example of when that happened?",
          question_type: 'follow_up',
          category: 'emotions',
          difficulty_level: 'easy',
          emotional_tone: 'curious',
          is_active: true,
          order_index: 1
        },
        {
          id: `q-${Date.now()}-9`,
          question_text: "How did that make you feel in the moment?",
          question_type: 'follow_up',
          category: 'emotions',
          difficulty_level: 'easy',
          emotional_tone: 'warm',
          is_active: true,
          order_index: 2
        }
      ]
    }

    const questionsToAdd = standardQuestions[type]
    const existingQuestions = personality.unified_questions || []
    const nextOrderIndex = existingQuestions.length + 1

    const updatedQuestions = questionsToAdd.map((q, index) => ({
      ...q,
      order_index: nextOrderIndex + index
    }))

    updatePersonality({
      unified_questions: [...existingQuestions, ...updatedQuestions]
    })
  }

  return (
    <div className="space-y-6">
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="basic">Basic Info</TabsTrigger>
          <TabsTrigger value="questions">Questions</TabsTrigger>
          <TabsTrigger value="behavior">Behavior & Goals</TabsTrigger>
        </TabsList>

        <TabsContent value="basic" className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Personality Name</Label>
              <Input
                id="name"
                value={personality.name}
                onChange={(e) => updatePersonality({ name: e.target.value })}
                placeholder="e.g., Empathetic Guide"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="tone">Tone</Label>
              <Select value={personality.tone} onValueChange={(value) => updatePersonality({ tone: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tone" />
                </SelectTrigger>
                <SelectContent>
                  {EMOTIONAL_TONES.map(tone => (
                    <SelectItem key={tone} value={tone}>
                      {tone.charAt(0).toUpperCase() + tone.slice(1)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={personality.description}
              onChange={(e) => updatePersonality({ description: e.target.value })}
              placeholder="Describe this AI personality's approach and characteristics..."
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="system_prompt">System Prompt Template</Label>
            <Textarea
              id="system_prompt"
              value={personality.system_prompt_template}
              onChange={(e) => updatePersonality({ system_prompt_template: e.target.value })}
              placeholder="Define how this personality should behave and respond..."
              rows={4}
            />
          </div>
        </TabsContent>

        <TabsContent value="questions" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Unified Question System</span>
                <div className="flex gap-2">
                  {QUESTION_TYPES.map(type => (
                    <Button
                      key={type.value}
                      variant="outline"
                      size="sm"
                      onClick={() => loadStandardQuestions(type.value)}
                      className="text-xs"
                    >
                      Add {type.label}
                    </Button>
                  ))}
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {(personality.unified_questions || []).map((question, index) => {
                  const typeInfo = QUESTION_TYPES.find(t => t.value === question.question_type)
                  const Icon = typeInfo?.icon || MessageCircle

                  return (
                    <div key={question.id} className="border rounded-lg p-4 space-y-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <Icon className="h-4 w-4" />
                          <Badge className={typeInfo?.color}>
                            {typeInfo?.label}
                          </Badge>
                          <span className="text-sm text-gray-500">#{question.order_index}</span>
                        </div>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeUnifiedQuestion(index)}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                      </div>

                      <Textarea
                        value={question.question_text}
                        onChange={(e) => updateUnifiedQuestion(index, { question_text: e.target.value })}
                        placeholder="Enter the question text..."
                        rows={2}
                      />

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                        <Select
                          value={question.question_type}
                          onValueChange={(value: UnifiedQuestion['question_type']) => 
                            updateUnifiedQuestion(index, { question_type: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {QUESTION_TYPES.map(type => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={question.category}
                          onValueChange={(value) => updateUnifiedQuestion(index, { category: value })}
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {CATEGORIES.map(cat => (
                              <SelectItem key={cat} value={cat}>
                                {cat.charAt(0).toUpperCase() + cat.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={question.difficulty_level}
                          onValueChange={(value: UnifiedQuestion['difficulty_level']) => 
                            updateUnifiedQuestion(index, { difficulty_level: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {DIFFICULTY_LEVELS.map(level => (
                              <SelectItem key={level} value={level}>
                                {level.charAt(0).toUpperCase() + level.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>

                        <Select
                          value={question.emotional_tone}
                          onValueChange={(value: UnifiedQuestion['emotional_tone']) => 
                            updateUnifiedQuestion(index, { emotional_tone: value })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {EMOTIONAL_TONES.map(tone => (
                              <SelectItem key={tone} value={tone}>
                                {tone.charAt(0).toUpperCase() + tone.slice(1)}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  )
                })}

                <Button
                  variant="outline"
                  onClick={addUnifiedQuestion}
                  className="w-full"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Custom Question
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          {/* Goals Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Goals</Label>
            {(personality.goals || []).map((goal, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={goal}
                  onChange={(e) => updateArrayItem('goals', index, e.target.value)}
                  placeholder="Enter a goal this personality aims to accomplish..."
                  className="flex-1"
                  rows={2}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('goals', index)}
                  className="self-start mt-1"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => addArrayItem('goals')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Goal
            </Button>
          </div>

          {/* Behavior Traits Section */}
          <div className="space-y-3">
            <Label className="text-base font-medium">Behavior Traits</Label>
            {(personality.behavior_traits || []).map((trait, index) => (
              <div key={index} className="flex gap-2">
                <Textarea
                  value={trait}
                  onChange={(e) => updateArrayItem('behavior_traits', index, e.target.value)}
                  placeholder="Enter a behavior trait that describes this personality..."
                  className="flex-1"
                  rows={2}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => removeArrayItem('behavior_traits', index)}
                  className="self-start mt-1"
                >
                  <Minus className="h-4 w-4" />
                </Button>
              </div>
            ))}
            <Button
              variant="outline"
              onClick={() => addArrayItem('behavior_traits')}
              className="w-full"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Behavior Trait
            </Button>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
