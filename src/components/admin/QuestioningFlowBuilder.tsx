'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  DragDropContext, 
  Droppable, 
  Draggable,
  DropResult
} from '@hello-pangea/dnd'
import {
  Plus,
  Trash2,
  Copy,
  Play,
  Settings,
  Target,
  Brain,
  MessageCircle,
  ArrowRight,
  RotateCcw,
  Eye
} from 'lucide-react'
import { QuestionStepEditor } from './QuestionStepEditor'

export interface QuestionStep {
  id: string
  strategy: 'open-ended' | 'adaptive' | 'focused' | 'exploratory' | 'clarifying' | 'deepening' | 'reflective' | 'provocative'
  depth: 'surface' | 'moderate' | 'deep' | 'profound'
  timing: 'immediate' | 'delayed' | 'conditional'
  trigger: 'automatic' | 'pattern-detected' | 'resistance-met' | 'depth-achieved' | 'time-elapsed'
  responseRequirement: 'brief' | 'detailed' | 'story' | 'example' | 'reflection'
  followUpBehavior: 'always' | 'if-brief' | 'if-unclear' | 'if-emotional' | 'never'
  emotionalTone: 'neutral' | 'warm' | 'curious' | 'challenging' | 'supportive' | 'playful'
  focusArea: 'general' | 'relationships' | 'career' | 'values' | 'fears' | 'dreams' | 'patterns' | 'shadow'
  evidenceWeight: number // 1-10 how much this question contributes to archetype evidence
  skipConditions: string[]
  customPrompt?: string
}

export interface QuestioningFlow {
  id: string
  name: string
  description: string
  steps: QuestionStep[]
  cycleSettings: {
    enabled: boolean
    cycleAfter: number
    maxCycles: number
    adaptOnCycle: boolean
  }
  globalSettings: {
    minQuestions: number
    maxQuestions: number
    evidenceThreshold: number
    adaptationSensitivity: 'low' | 'medium' | 'high'
    personalityAdaptation: boolean
    culturalSensitivity: boolean
  }
}

const STRATEGY_OPTIONS = [
  { value: 'open-ended', label: 'Open-Ended', description: 'Broad questions to gather rich information', color: 'blue' },
  { value: 'adaptive', label: 'Adaptive', description: 'Adjusts based on previous responses', color: 'green' },
  { value: 'focused', label: 'Focused', description: 'Targeted questions on specific themes', color: 'purple' },
  { value: 'exploratory', label: 'Exploratory', description: 'Wide-ranging discovery questions', color: 'orange' },
  { value: 'clarifying', label: 'Clarifying', description: 'Seeks specific meanings and definitions', color: 'teal' },
  { value: 'deepening', label: 'Deepening', description: 'Explores underlying motivations', color: 'red' },
  { value: 'reflective', label: 'Reflective', description: 'Encourages self-reflection and insight', color: 'indigo' },
  { value: 'provocative', label: 'Provocative', description: 'Challenges assumptions and patterns', color: 'pink' }
]

const DEPTH_OPTIONS = [
  { value: 'surface', label: 'Surface', description: 'Basic information and preferences' },
  { value: 'moderate', label: 'Moderate', description: 'Behavioral patterns and motivations' },
  { value: 'deep', label: 'Deep', description: 'Core beliefs and psychological patterns' },
  { value: 'profound', label: 'Profound', description: 'Unconscious dynamics and shadow work' }
]

// Removed unused constants - these are defined in QuestionStepEditor where they're used

interface QuestioningFlowBuilderProps {
  flow?: QuestioningFlow
  onSave: (flow: QuestioningFlow) => void
  onTest: (flow: QuestioningFlow) => void
}

export function QuestioningFlowBuilder({ flow, onSave, onTest }: QuestioningFlowBuilderProps) {
  const [currentFlow, setCurrentFlow] = useState<QuestioningFlow>(flow || {
    id: `flow-${Date.now()}`,
    name: '',
    description: '',
    steps: [],
    cycleSettings: {
      enabled: false,
      cycleAfter: 5,
      maxCycles: 3,
      adaptOnCycle: true
    },
    globalSettings: {
      minQuestions: 8,
      maxQuestions: 15,
      evidenceThreshold: 3,
      adaptationSensitivity: 'medium',
      personalityAdaptation: true,
      culturalSensitivity: true
    }
  })

  const [selectedStep, setSelectedStep] = useState<QuestionStep | null>(null)
  const [showStepEditor, setShowStepEditor] = useState(false)

  const createNewStep = (): QuestionStep => ({
    id: `step-${Date.now()}`,
    strategy: 'open-ended',
    depth: 'moderate',
    timing: 'immediate',
    trigger: 'automatic',
    responseRequirement: 'detailed',
    followUpBehavior: 'if-brief',
    emotionalTone: 'warm',
    focusArea: 'general',
    evidenceWeight: 5,
    skipConditions: []
  })

  const addStep = () => {
    const newStep = createNewStep()
    setCurrentFlow(prev => ({
      ...prev,
      steps: [...prev.steps, newStep]
    }))
    setSelectedStep(newStep)
    setShowStepEditor(true)
  }

  const duplicateStep = (stepId: string) => {
    const stepToDuplicate = currentFlow.steps.find(s => s.id === stepId)
    if (stepToDuplicate) {
      const duplicatedStep = {
        ...stepToDuplicate,
        id: `step-${Date.now()}`
      }
      setCurrentFlow(prev => ({
        ...prev,
        steps: [...prev.steps, duplicatedStep]
      }))
    }
  }

  const removeStep = (stepId: string) => {
    setCurrentFlow(prev => ({
      ...prev,
      steps: prev.steps.filter(s => s.id !== stepId)
    }))
  }

  const onDragEnd = (result: DropResult) => {
    if (!result.destination) return

    const items = Array.from(currentFlow.steps)
    const [reorderedItem] = items.splice(result.source.index, 1)
    items.splice(result.destination.index, 0, reorderedItem)

    setCurrentFlow(prev => ({
      ...prev,
      steps: items
    }))
  }

  const getStrategyColor = (strategy: string) => {
    const option = STRATEGY_OPTIONS.find(opt => opt.value === strategy)
    return option?.color || 'gray'
  }

  const handleSave = () => {
    onSave(currentFlow)
  }

  const handleTest = () => {
    onTest(currentFlow)
  }

  const updateStep = (updatedStep: QuestionStep) => {
    setCurrentFlow(prev => ({
      ...prev,
      steps: prev.steps.map(step =>
        step.id === updatedStep.id ? updatedStep : step
      )
    }))
  }

  return (
    <div className="space-y-6">
      {/* Minimal Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-xl font-medium text-gray-900">Flow Builder</h2>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={handleTest} className="flex items-center gap-2">
            <Play className="h-4 w-4" />
            Test Flow
          </Button>
          <Button onClick={handleSave} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700">
            <Settings className="h-4 w-4" />
            Save Flow
          </Button>
        </div>
      </div>

      <Tabs defaultValue="builder" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="builder">Flow Builder</TabsTrigger>
          <TabsTrigger value="settings">Global Settings</TabsTrigger>
          <TabsTrigger value="preview">Preview & Test</TabsTrigger>
          <TabsTrigger value="templates">Templates</TabsTrigger>
        </TabsList>

        {/* Flow Builder Tab */}
        <TabsContent value="builder" className="space-y-6">
          {/* Basic Info */}
          <Card>
            <CardHeader>
              <CardTitle>Flow Information</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="flow-name">Flow Name</Label>
                <Input
                  id="flow-name"
                  value={currentFlow.name}
                  onChange={(e) => setCurrentFlow(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Deep Relationship Exploration"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="flow-description">Description</Label>
                <Input
                  id="flow-description"
                  value={currentFlow.description}
                  onChange={(e) => setCurrentFlow(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Brief description of this questioning approach"
                  className="mt-1"
                />
              </div>
            </CardContent>
          </Card>

          {/* Question Steps */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <MessageCircle className="h-5 w-5" />
                Question Sequence ({currentFlow.steps.length} steps)
              </CardTitle>
              <Button onClick={addStep} className="flex items-center gap-2">
                <Plus className="h-4 w-4" />
                Add Step
              </Button>
            </CardHeader>
            <CardContent>
              {currentFlow.steps.length === 0 ? (
                <div className="text-center py-12 text-gray-500">
                  <MessageCircle className="mx-auto h-12 w-12 text-gray-300 mb-4" />
                  <p className="text-sm">No questioning steps yet.</p>
                  <p className="text-xs mt-1">Add your first step to start building the flow.</p>
                </div>
              ) : (
                <DragDropContext onDragEnd={onDragEnd}>
                  <Droppable droppableId="question-steps">
                    {(provided) => (
                      <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-3">
                        {currentFlow.steps.map((step, index) => (
                          <Draggable key={step.id} draggableId={step.id} index={index}>
                            {(provided, snapshot) => (
                              <div
                                ref={provided.innerRef}
                                {...provided.draggableProps}
                                {...provided.dragHandleProps}
                                className={`p-4 border rounded-lg bg-white shadow-sm transition-shadow ${
                                  snapshot.isDragging ? 'shadow-lg' : 'hover:shadow-md'
                                }`}
                              >
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-3">
                                    <div className="text-sm font-medium text-gray-500">
                                      Step {index + 1}
                                    </div>
                                    <Badge 
                                      variant="outline" 
                                      className={`bg-${getStrategyColor(step.strategy)}-50 text-${getStrategyColor(step.strategy)}-700 border-${getStrategyColor(step.strategy)}-200`}
                                    >
                                      {STRATEGY_OPTIONS.find(opt => opt.value === step.strategy)?.label}
                                    </Badge>
                                    <Badge variant="outline">
                                      {DEPTH_OPTIONS.find(opt => opt.value === step.depth)?.label}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {step.emotionalTone}
                                    </Badge>
                                    <Badge variant="outline" className="text-xs">
                                      {step.focusArea}
                                    </Badge>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => {
                                        setSelectedStep(step)
                                        setShowStepEditor(true)
                                      }}
                                    >
                                      <Settings className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => duplicateStep(step.id)}
                                    >
                                      <Copy className="h-4 w-4" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() => removeStep(step.id)}
                                    >
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                </div>
                                
                                {step.customPrompt && (
                                  <div className="mt-3 p-2 bg-gray-50 rounded text-sm text-gray-700">
                                    {step.customPrompt.substring(0, 100)}...
                                  </div>
                                )}
                              </div>
                            )}
                          </Draggable>
                        ))}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                </DragDropContext>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Global Settings Tab */}
        <TabsContent value="settings" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Flow Control */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Target className="h-5 w-5" />
                  Flow Control
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="min-questions">Min Questions</Label>
                    <Input
                      id="min-questions"
                      type="number"
                      value={currentFlow.globalSettings.minQuestions}
                      onChange={(e) => setCurrentFlow(prev => ({
                        ...prev,
                        globalSettings: {
                          ...prev.globalSettings,
                          minQuestions: parseInt(e.target.value) || 8
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                  <div>
                    <Label htmlFor="max-questions">Max Questions</Label>
                    <Input
                      id="max-questions"
                      type="number"
                      value={currentFlow.globalSettings.maxQuestions}
                      onChange={(e) => setCurrentFlow(prev => ({
                        ...prev,
                        globalSettings: {
                          ...prev.globalSettings,
                          maxQuestions: parseInt(e.target.value) || 15
                        }
                      }))}
                      className="mt-1"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="evidence-threshold">Evidence Threshold</Label>
                  <Input
                    id="evidence-threshold"
                    type="number"
                    value={currentFlow.globalSettings.evidenceThreshold}
                    onChange={(e) => setCurrentFlow(prev => ({
                      ...prev,
                      globalSettings: {
                        ...prev.globalSettings,
                        evidenceThreshold: parseInt(e.target.value) || 3
                      }
                    }))}
                    className="mt-1"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Minimum evidence points needed for archetype confidence
                  </p>
                </div>

                <div>
                  <Label htmlFor="adaptation-sensitivity">Adaptation Sensitivity</Label>
                  <Select
                    value={currentFlow.globalSettings.adaptationSensitivity}
                    onValueChange={(value: 'low' | 'medium' | 'high') => setCurrentFlow(prev => ({
                      ...prev,
                      globalSettings: {
                        ...prev.globalSettings,
                        adaptationSensitivity: value
                      }
                    }))}
                  >
                    <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      <SelectItem value="low" className="hover:bg-gray-50">Low - Stable questioning</SelectItem>
                      <SelectItem value="medium" className="hover:bg-gray-50">Medium - Balanced adaptation</SelectItem>
                      <SelectItem value="high" className="hover:bg-gray-50">High - Highly responsive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            {/* Cycle Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <RotateCcw className="h-5 w-5" />
                  Cycle Settings
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="enable-cycles"
                    checked={currentFlow.cycleSettings.enabled}
                    onChange={(e) => setCurrentFlow(prev => ({
                      ...prev,
                      cycleSettings: {
                        ...prev.cycleSettings,
                        enabled: e.target.checked
                      }
                    }))}
                    className="rounded"
                  />
                  <Label htmlFor="enable-cycles">Enable Question Cycles</Label>
                </div>

                {currentFlow.cycleSettings.enabled && (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="cycle-after">Cycle After</Label>
                        <Input
                          id="cycle-after"
                          type="number"
                          value={currentFlow.cycleSettings.cycleAfter}
                          onChange={(e) => setCurrentFlow(prev => ({
                            ...prev,
                            cycleSettings: {
                              ...prev.cycleSettings,
                              cycleAfter: parseInt(e.target.value) || 5
                            }
                          }))}
                          className="mt-1"
                        />
                        <p className="text-xs text-gray-500 mt-1">Questions before cycling</p>
                      </div>
                      <div>
                        <Label htmlFor="max-cycles">Max Cycles</Label>
                        <Input
                          id="max-cycles"
                          type="number"
                          value={currentFlow.cycleSettings.maxCycles}
                          onChange={(e) => setCurrentFlow(prev => ({
                            ...prev,
                            cycleSettings: {
                              ...prev.cycleSettings,
                              maxCycles: parseInt(e.target.value) || 3
                            }
                          }))}
                          className="mt-1"
                        />
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        id="adapt-on-cycle"
                        checked={currentFlow.cycleSettings.adaptOnCycle}
                        onChange={(e) => setCurrentFlow(prev => ({
                          ...prev,
                          cycleSettings: {
                            ...prev.cycleSettings,
                            adaptOnCycle: e.target.checked
                          }
                        }))}
                        className="rounded"
                      />
                      <Label htmlFor="adapt-on-cycle">Adapt questions on each cycle</Label>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {/* Advanced Options */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Advanced AI Behavior
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="personality-adaptation"
                      checked={currentFlow.globalSettings.personalityAdaptation}
                      onChange={(e) => setCurrentFlow(prev => ({
                        ...prev,
                        globalSettings: {
                          ...prev.globalSettings,
                          personalityAdaptation: e.target.checked
                        }
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor="personality-adaptation">Personality Adaptation</Label>
                    <p className="text-xs text-gray-500">Adjust tone based on user personality</p>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="cultural-sensitivity"
                      checked={currentFlow.globalSettings.culturalSensitivity}
                      onChange={(e) => setCurrentFlow(prev => ({
                        ...prev,
                        globalSettings: {
                          ...prev.globalSettings,
                          culturalSensitivity: e.target.checked
                        }
                      }))}
                      className="rounded"
                    />
                    <Label htmlFor="cultural-sensitivity">Cultural Sensitivity</Label>
                    <p className="text-xs text-gray-500">Consider cultural context in questioning</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Preview Tab */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Flow Preview
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {currentFlow.steps.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No steps to preview. Add some questioning steps first.</p>
                ) : (
                  <div className="space-y-3">
                    {currentFlow.steps.map((step, index) => (
                      <div key={step.id} className="flex items-center gap-4 p-4 border rounded-lg">
                        <div className="flex-shrink-0 w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600">
                          {index + 1}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <Badge variant="outline" className={`bg-${getStrategyColor(step.strategy)}-50`}>
                              {STRATEGY_OPTIONS.find(opt => opt.value === step.strategy)?.label}
                            </Badge>
                            <Badge variant="outline">
                              {DEPTH_OPTIONS.find(opt => opt.value === step.depth)?.label}
                            </Badge>
                            <span className="text-xs text-gray-500">
                              {step.emotionalTone} tone • {step.focusArea} focus
                            </span>
                          </div>
                          <p className="text-sm text-gray-700">
                            {STRATEGY_OPTIONS.find(opt => opt.value === step.strategy)?.description}
                          </p>
                        </div>
                        <ArrowRight className="h-4 w-4 text-gray-400" />
                      </div>
                    ))}

                    {currentFlow.cycleSettings.enabled && (
                      <div className="flex items-center justify-center py-4">
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <RotateCcw className="h-4 w-4" />
                          Cycle repeats up to {currentFlow.cycleSettings.maxCycles} times
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Templates Tab */}
        <TabsContent value="templates" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Flow Templates</CardTitle>
              <p className="text-sm text-gray-600">Pre-built questioning flows for different assessment types</p>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* Template cards will go here */}
                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-medium mb-2">Deep Relationship Exploration</h3>
                  <p className="text-sm text-gray-600 mb-3">Progressive questioning for relationship archetypes</p>
                  <div className="flex gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">8 steps</Badge>
                    <Badge variant="outline" className="text-xs">Cycles</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-medium mb-2">Career & Leadership</h3>
                  <p className="text-sm text-gray-600 mb-3">Focused questioning for professional archetypes</p>
                  <div className="flex gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">6 steps</Badge>
                    <Badge variant="outline" className="text-xs">Adaptive</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>

                <div className="p-4 border rounded-lg hover:shadow-md transition-shadow cursor-pointer">
                  <h3 className="font-medium mb-2">Shadow Work Intensive</h3>
                  <p className="text-sm text-gray-600 mb-3">Deep exploration of hidden aspects</p>
                  <div className="flex gap-1 mb-3">
                    <Badge variant="outline" className="text-xs">10 steps</Badge>
                    <Badge variant="outline" className="text-xs">Profound</Badge>
                  </div>
                  <Button variant="outline" size="sm" className="w-full">
                    Use Template
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Step Editor Dialog */}
      <QuestionStepEditor
        step={selectedStep}
        isOpen={showStepEditor}
        onClose={() => {
          setShowStepEditor(false)
          setSelectedStep(null)
        }}
        onSave={updateStep}
      />
    </div>
  )
}
