'use client'

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { QuestionStep } from './QuestioningFlowBuilder'
import { 
  Settings, 
  Target, 
  Brain, 
  Heart, 
  Clock, 
  Zap,
  AlertTriangle,
  MessageSquare,
  Plus,
  X
} from 'lucide-react'

interface QuestionStepEditorProps {
  step: QuestionStep | null
  isOpen: boolean
  onClose: () => void
  onSave: (step: QuestionStep) => void
}

const STRATEGY_OPTIONS = [
  { value: 'open-ended', label: 'Open-Ended', description: 'Broad questions to gather rich information', icon: MessageSquare },
  { value: 'adaptive', label: 'Adaptive', description: 'Adjusts based on previous responses', icon: Brain },
  { value: 'focused', label: 'Focused', description: 'Targeted questions on specific themes', icon: Target },
  { value: 'exploratory', label: 'Exploratory', description: 'Wide-ranging discovery questions', icon: Zap },
  { value: 'clarifying', label: 'Clarifying', description: 'Seeks specific meanings and definitions', icon: Settings },
  { value: 'deepening', label: 'Deepening', description: 'Explores underlying motivations', icon: Heart },
  { value: 'reflective', label: 'Reflective', description: 'Encourages self-reflection and insight', icon: Brain },
  { value: 'provocative', label: 'Provocative', description: 'Challenges assumptions and patterns', icon: AlertTriangle }
]

const TRIGGER_CONDITIONS = [
  { value: 'automatic', label: 'Automatic', description: 'Always ask this question in sequence' },
  { value: 'pattern-detected', label: 'Pattern Detected', description: 'Ask when specific patterns emerge' },
  { value: 'resistance-met', label: 'Resistance Met', description: 'Ask when user shows resistance' },
  { value: 'depth-achieved', label: 'Depth Achieved', description: 'Ask when sufficient depth is reached' },
  { value: 'time-elapsed', label: 'Time Elapsed', description: 'Ask after certain time/questions' },
  { value: 'emotional-peak', label: 'Emotional Peak', description: 'Ask when high emotional engagement' },
  { value: 'confusion-detected', label: 'Confusion Detected', description: 'Ask when user seems confused' },
  { value: 'breakthrough-moment', label: 'Breakthrough Moment', description: 'Ask during insight moments' }
]

const RESPONSE_REQUIREMENTS = [
  { value: 'brief', label: 'Brief', description: '1-2 sentences, quick response' },
  { value: 'detailed', label: 'Detailed', description: '3-5 sentences, thorough explanation' },
  { value: 'story', label: 'Story', description: 'Narrative format, personal anecdote' },
  { value: 'example', label: 'Example', description: 'Specific concrete example' },
  { value: 'reflection', label: 'Reflection', description: 'Deep personal reflection' },
  { value: 'comparison', label: 'Comparison', description: 'Compare different situations' },
  { value: 'visualization', label: 'Visualization', description: 'Describe mental images or scenarios' }
]

const SKIP_CONDITIONS = [
  'User shows high emotional distress',
  'Previous similar question answered',
  'Time constraints detected',
  'User requests to skip topic',
  'Cultural sensitivity concerns',
  'Age-inappropriate content',
  'Sufficient evidence already gathered',
  'User fatigue detected'
]

export function QuestionStepEditor({ step, isOpen, onClose, onSave }: QuestionStepEditorProps) {
  const [editingStep, setEditingStep] = useState<QuestionStep | null>(step)
  const [newSkipCondition, setNewSkipCondition] = useState('')

  if (!editingStep) return null

  const handleSave = () => {
    onSave(editingStep)
    onClose()
  }

  const addSkipCondition = () => {
    if (newSkipCondition.trim()) {
      setEditingStep(prev => prev ? {
        ...prev,
        skipConditions: [...prev.skipConditions, newSkipCondition.trim()]
      } : null)
      setNewSkipCondition('')
    }
  }

  const removeSkipCondition = (index: number) => {
    setEditingStep(prev => prev ? {
      ...prev,
      skipConditions: prev.skipConditions.filter((_, i) => i !== index)
    } : null)
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Configure Question Step
          </DialogTitle>
          <DialogDescription>
            Fine-tune the questioning strategy, timing, and behavior for this step
          </DialogDescription>
        </DialogHeader>

        <Tabs defaultValue="strategy" className="space-y-4">
          <TabsList className="grid w-full grid-cols-5">
            <TabsTrigger value="strategy">Strategy</TabsTrigger>
            <TabsTrigger value="behavior">Behavior</TabsTrigger>
            <TabsTrigger value="triggers">Triggers</TabsTrigger>
            <TabsTrigger value="conditions">Conditions</TabsTrigger>
            <TabsTrigger value="custom">Custom</TabsTrigger>
          </TabsList>

          {/* Strategy Tab */}
          <TabsContent value="strategy" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Questioning Strategy</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Strategy Type</Label>
                    <Select
                      value={editingStep.strategy}
                      onValueChange={(value: QuestionStep['strategy']) => setEditingStep(prev => prev ? { ...prev, strategy: value } : null)}
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        {STRATEGY_OPTIONS.map(option => (
                          <SelectItem key={option.value} value={option.value} className="hover:bg-gray-50">
                            <div className="flex items-center gap-2">
                              <option.icon className="h-4 w-4" />
                              <div>
                                <div className="font-medium">{option.label}</div>
                                <div className="text-xs text-gray-500">{option.description}</div>
                              </div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Questioning Depth</Label>
                    <Select 
                      value={editingStep.depth} 
                      onValueChange={(value: QuestionStep['depth']) => setEditingStep(prev => prev ? { ...prev, depth: value } : null)}
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        <SelectItem value="surface" className="hover:bg-gray-50">Surface - Basic patterns</SelectItem>
                        <SelectItem value="moderate" className="hover:bg-gray-50">Moderate - Behavioral insights</SelectItem>
                        <SelectItem value="deep" className="hover:bg-gray-50">Deep - Psychological patterns</SelectItem>
                        <SelectItem value="profound" className="hover:bg-gray-50">Profound - Unconscious dynamics</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Focus Area</Label>
                    <Select 
                      value={editingStep.focusArea} 
                      onValueChange={(value: QuestionStep['focusArea']) => setEditingStep(prev => prev ? { ...prev, focusArea: value } : null)}
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        <SelectItem value="general" className="hover:bg-gray-50">General - Broad exploration</SelectItem>
                        <SelectItem value="relationships" className="hover:bg-gray-50">Relationships - Interpersonal dynamics</SelectItem>
                        <SelectItem value="career" className="hover:bg-gray-50">Career - Professional life</SelectItem>
                        <SelectItem value="values" className="hover:bg-gray-50">Values - Core beliefs</SelectItem>
                        <SelectItem value="fears" className="hover:bg-gray-50">Fears - Anxieties and limitations</SelectItem>
                        <SelectItem value="dreams" className="hover:bg-gray-50">Dreams - Aspirations</SelectItem>
                        <SelectItem value="patterns" className="hover:bg-gray-50">Patterns - Behavioral patterns</SelectItem>
                        <SelectItem value="shadow" className="hover:bg-gray-50">Shadow - Hidden aspects</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Evidence & Impact</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Evidence Weight (1-10)</Label>
                    <div className="mt-2">
                      <Slider
                        value={[editingStep.evidenceWeight]}
                        onValueChange={(value) => setEditingStep(prev => prev ? { ...prev, evidenceWeight: value[0] } : null)}
                        max={10}
                        min={1}
                        step={1}
                        className="w-full"
                      />
                      <div className="flex justify-between text-xs text-gray-500 mt-1">
                        <span>Low Impact</span>
                        <span className="font-medium">{editingStep.evidenceWeight}</span>
                        <span>High Impact</span>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      How much this question contributes to archetype identification
                    </p>
                  </div>

                  <div>
                    <Label>Response Requirement</Label>
                    <Select 
                      value={editingStep.responseRequirement} 
                      onValueChange={(value: QuestionStep['responseRequirement']) => setEditingStep(prev => prev ? { ...prev, responseRequirement: value } : null)}
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        {RESPONSE_REQUIREMENTS.map(req => (
                          <SelectItem key={req.value} value={req.value} className="hover:bg-gray-50">
                            <div>
                              <div className="font-medium">{req.label}</div>
                              <div className="text-xs text-gray-500">{req.description}</div>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Behavior Tab */}
          <TabsContent value="behavior" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Heart className="h-5 w-5" />
                    Emotional Approach
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Emotional Tone</Label>
                    <Select 
                      value={editingStep.emotionalTone} 
                      onValueChange={(value: QuestionStep['emotionalTone']) => setEditingStep(prev => prev ? { ...prev, emotionalTone: value } : null)}
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        <SelectItem value="neutral" className="hover:bg-gray-50">Neutral - Professional and balanced</SelectItem>
                        <SelectItem value="warm" className="hover:bg-gray-50">Warm - Caring and supportive</SelectItem>
                        <SelectItem value="curious" className="hover:bg-gray-50">Curious - Inquisitive and interested</SelectItem>
                        <SelectItem value="challenging" className="hover:bg-gray-50">Challenging - Pushes for deeper thinking</SelectItem>
                        <SelectItem value="supportive" className="hover:bg-gray-50">Supportive - Encouraging and validating</SelectItem>
                        <SelectItem value="playful" className="hover:bg-gray-50">Playful - Light and engaging</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label>Follow-up Behavior</Label>
                    <Select 
                      value={editingStep.followUpBehavior} 
                      onValueChange={(value: QuestionStep['followUpBehavior']) => setEditingStep(prev => prev ? { ...prev, followUpBehavior: value } : null)}
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        <SelectItem value="always" className="hover:bg-gray-50">Always - Always ask follow-up</SelectItem>
                        <SelectItem value="if-brief" className="hover:bg-gray-50">If Brief - Only if response is too short</SelectItem>
                        <SelectItem value="if-unclear" className="hover:bg-gray-50">If Unclear - Only if response is unclear</SelectItem>
                        <SelectItem value="if-emotional" className="hover:bg-gray-50">If Emotional - Only if emotional content</SelectItem>
                        <SelectItem value="never" className="hover:bg-gray-50">Never - No follow-up questions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="text-lg flex items-center gap-2">
                    <Clock className="h-5 w-5" />
                    Timing & Flow
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <Label>Timing</Label>
                    <Select 
                      value={editingStep.timing} 
                      onValueChange={(value: QuestionStep['timing']) => setEditingStep(prev => prev ? { ...prev, timing: value } : null)}
                    >
                      <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                        <SelectItem value="immediate" className="hover:bg-gray-50">Immediate - Ask right away</SelectItem>
                        <SelectItem value="delayed" className="hover:bg-gray-50">Delayed - Wait for right moment</SelectItem>
                        <SelectItem value="conditional" className="hover:bg-gray-50">Conditional - Based on conditions</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Triggers Tab */}
          <TabsContent value="triggers" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Question Triggers
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Trigger Condition</Label>
                  <Select 
                    value={editingStep.trigger}
                    onValueChange={(value: QuestionStep['trigger']) => setEditingStep(prev => prev ? { ...prev, trigger: value } : null)}
                  >
                    <SelectTrigger className="mt-1 bg-white border-gray-300 shadow-sm">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-white border border-gray-200 shadow-lg z-50">
                      {TRIGGER_CONDITIONS.map(trigger => (
                        <SelectItem key={trigger.value} value={trigger.value} className="hover:bg-gray-50">
                          <div>
                            <div className="font-medium">{trigger.label}</div>
                            <div className="text-xs text-gray-500">{trigger.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Conditions Tab */}
          <TabsContent value="conditions" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <AlertTriangle className="h-5 w-5" />
                  Skip Conditions
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Add Skip Condition</Label>
                  <div className="flex gap-2 mt-1">
                    <Input
                      value={newSkipCondition}
                      onChange={(e) => setNewSkipCondition(e.target.value)}
                      placeholder="e.g., User shows emotional distress"
                      className="flex-1"
                    />
                    <Button onClick={addSkipCondition} size="sm">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div>
                  <Label>Current Skip Conditions</Label>
                  <div className="space-y-2 mt-2">
                    {editingStep.skipConditions.map((condition, index) => (
                      <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                        <span className="text-sm">{condition}</span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeSkipCondition(index)}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>

                <div>
                  <Label>Common Skip Conditions</Label>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2 mt-2">
                    {SKIP_CONDITIONS.map((condition, index) => (
                      <Button
                        key={index}
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          if (!editingStep.skipConditions.includes(condition)) {
                            setEditingStep(prev => prev ? {
                              ...prev,
                              skipConditions: [...prev.skipConditions, condition]
                            } : null)
                          }
                        }}
                        className="text-left justify-start text-xs"
                      >
                        {condition}
                      </Button>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Custom Tab */}
          <TabsContent value="custom" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Custom Question Prompt</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="custom-prompt">Custom AI Instructions</Label>
                  <Textarea
                    id="custom-prompt"
                    value={editingStep.customPrompt || ''}
                    onChange={(e) => setEditingStep(prev => prev ? { ...prev, customPrompt: e.target.value } : null)}
                    placeholder="Enter specific instructions for this question step..."
                    className="mt-1 min-h-[120px]"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Optional: Override default behavior with custom instructions for this specific question
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
            Save Step
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
