"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

import { 
  Brain, 
  Lightbulb
} from 'lucide-react'

interface AssessmentAIConfigProps {
  onSave: (config: unknown) => void
}

export function AssessmentAIConfig({ onSave }: AssessmentAIConfigProps) {
  const [aiApproach, setAiApproach] = useState<'global' | 'focused'>('global')
  // const [analysisMode, setAnalysisMode] = useState<'comprehensive' | 'targeted'>('comprehensive')
  const [difficultyLevel, setDifficultyLevel] = useState<'beginner' | 'intermediate' | 'advanced'>('intermediate')
  const [theme, setTheme] = useState<'relationships' | 'career' | 'life-purpose' | 'leadership'>('relationships')
  
  const [config, setConfig] = useState({
    systemPrompt: `You are an expert archetypal analyst with deep knowledge of human psychology and behavioral patterns. Your role is to identify archetypal patterns in human responses by analyzing:

1. **Linguistic Patterns**: Word choice, metaphors, emotional language
2. **Behavioral Indicators**: Described actions, reactions, and patterns
3. **Emotional Signatures**: Underlying emotional states and expressions
4. **Relational Dynamics**: How they describe interactions with others
5. **Value Systems**: What they prioritize and find meaningful

Draw from the complete database of 55 archetypes and their linguistic patterns. Match user responses to archetypal patterns while remaining curious, non-judgmental, and focused on helping the person understand themselves better.`,
    
    questioningStyle: 'conversational-deep',
    confidenceThreshold: 0.7,
    revealTiming: 'progressive',
    focusAreas: ['relationships', 'communication', 'conflict-resolution'],
    excludeArchetypes: ['The Misogynist', 'The Hypocrite'] // Shadow archetypes might be excluded for some assessments
  })

  const archetypeCategories = [
    'Guardian', 'Innovator', 'Counselor', 'Seducer', 'Caretaker', 
    'Conservative', 'Critic', 'Deceiver', 'Possessor', 'Avoidant', 
    'Renegade'
  ]

  const themes = [
    { id: 'relationships', name: 'Relationships & Love', focus: 'How archetypes show up in romantic relationships' },
    { id: 'career', name: 'Career & Leadership', focus: 'Professional identity and leadership patterns' },
    { id: 'life-purpose', name: 'Life Purpose & Meaning', focus: 'Finding purpose and authentic expression' },
    { id: 'leadership', name: 'Leadership & Influence', focus: 'How you lead and influence others' }
  ]

  const questioningStyles = [
    { id: 'conversational-deep', name: 'Conversational Deep Dive', desc: 'Natural conversation that gradually goes deeper' },
    { id: 'story-based', name: 'Story-Based Exploration', desc: 'Uses storytelling and scenarios to reveal patterns' },
    { id: 'direct-analytical', name: 'Direct & Analytical', desc: 'More structured, direct questioning approach' },
    { id: 'metaphorical', name: 'Metaphorical & Creative', desc: 'Uses metaphors and creative exercises' }
  ]

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            AI Analysis Approach
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* AI Approach Selection */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Analysis Strategy</Label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <Card className={`cursor-pointer transition-all ${aiApproach === 'global' ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setAiApproach('global')}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <input 
                          type="radio" 
                          checked={aiApproach === 'global'} 
                          onChange={() => setAiApproach('global')}
                          className="text-blue-600"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">Global Archetype Intelligence</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          AI has access to all 55 archetypes and matches responses against the complete database. 
                          More accurate but may reveal unexpected patterns.
                        </p>
                        <Badge variant="outline" className="mt-2">Recommended</Badge>
                      </div>
                    </div>
                  </CardContent>
                </Card>
                
                <Card className={`cursor-pointer transition-all ${aiApproach === 'focused' ? 'ring-2 ring-blue-500' : ''}`}
                      onClick={() => setAiApproach('focused')}>
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <div className="mt-1">
                        <input 
                          type="radio" 
                          checked={aiApproach === 'focused'} 
                          onChange={() => setAiApproach('focused')}
                          className="text-blue-600"
                        />
                      </div>
                      <div>
                        <h4 className="font-medium">Focused Archetype Set</h4>
                        <p className="text-sm text-gray-600 mt-1">
                          AI only considers specific archetypes relevant to this assessment theme. 
                          More predictable but may miss nuanced patterns.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Assessment Theme */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Assessment Theme</Label>
              <Select value={theme} onValueChange={(value: unknown) => setTheme(value as typeof theme)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {themes.map(t => (
                    <SelectItem key={t.id} value={t.id}>
                      <div>
                        <div className="font-medium">{t.name}</div>
                        <div className="text-sm text-gray-500">{t.focus}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Questioning Style */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Questioning Style</Label>
              <Select value={config.questioningStyle} onValueChange={(value) => setConfig({...config, questioningStyle: value})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {questioningStyles.map(style => (
                    <SelectItem key={style.id} value={style.id}>
                      <div>
                        <div className="font-medium">{style.name}</div>
                        <div className="text-sm text-gray-500">{style.desc}</div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Difficulty Level */}
            <div className="space-y-3">
              <Label className="text-base font-medium">Difficulty Level</Label>
              <Select value={difficultyLevel} onValueChange={(value: unknown) => setDifficultyLevel(value as typeof difficultyLevel)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="beginner">
                    <div>
                      <div className="font-medium">Beginner</div>
                      <div className="text-sm text-gray-500">Surface-level patterns, encouraging tone</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="intermediate">
                    <div>
                      <div className="font-medium">Intermediate</div>
                      <div className="text-sm text-gray-500">Moderate depth, balanced challenge</div>
                    </div>
                  </SelectItem>
                  <SelectItem value="advanced">
                    <div>
                      <div className="font-medium">Advanced</div>
                      <div className="text-sm text-gray-500">Deep analysis, shadow work, complex patterns</div>
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="system-prompt" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="system-prompt">System Prompt</TabsTrigger>
          <TabsTrigger value="analysis-config">Analysis Config</TabsTrigger>
          <TabsTrigger value="archetype-focus">Archetype Focus</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
        </TabsList>

        <TabsContent value="system-prompt" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Core AI Instructions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>System Prompt</Label>
                  <Textarea
                    value={config.systemPrompt}
                    onChange={(e) => setConfig({...config, systemPrompt: e.target.value})}
                    className="min-h-[200px] mt-2"
                    placeholder="Define the AI's core behavior and approach..."
                  />
                </div>
                
                <div className="bg-blue-50 p-4 rounded-lg">
                  <div className="flex items-start gap-3">
                    <Lightbulb className="h-5 w-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900">Recommendation</h4>
                      <p className="text-sm text-blue-800 mt-1">
                        With your comprehensive linguistic patterns database, the AI can be more general and draw from all patterns. 
                        This system prompt looks good - it focuses on the analytical approach rather than specific archetypes.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analysis-config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Analysis Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Confidence Threshold</Label>
                  <Input 
                    type="number" 
                    min="0" 
                    max="1" 
                    step="0.1" 
                    value={config.confidenceThreshold}
                    onChange={(e) => setConfig({...config, confidenceThreshold: parseFloat(e.target.value)})}
                  />
                  <p className="text-sm text-gray-500 mt-1">
                    How confident the AI should be before revealing an archetype (0.0 - 1.0)
                  </p>
                </div>

                <div>
                  <Label>Reveal Timing</Label>
                  <Select value={config.revealTiming} onValueChange={(value) => setConfig({...config, revealTiming: value})}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="progressive">Progressive (reveal as confidence builds)</SelectItem>
                      <SelectItem value="end-only">End Only (reveal at completion)</SelectItem>
                      <SelectItem value="milestone">Milestone (reveal at specific points)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="archetype-focus" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Archetype Focus</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {aiApproach === 'global' ? (
                  <div className="bg-green-50 p-4 rounded-lg">
                    <h4 className="font-medium text-green-900">Global Analysis Mode</h4>
                    <p className="text-sm text-green-800 mt-1">
                      AI will consider all 55 archetypes but can weight results based on assessment theme.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div>
                      <Label>Focus Categories</Label>
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {archetypeCategories.map(category => (
                          <div key={category} className="flex items-center space-x-2">
                            <input type="checkbox" id={category} />
                            <Label htmlFor={category} className="text-sm">{category}</Label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <Label>Exclude Archetypes (Optional)</Label>
                  <p className="text-sm text-gray-500 mb-2">
                    Some assessments may want to exclude potentially triggering archetypes
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {config.excludeArchetypes.map(archetype => (
                      <Badge key={archetype} variant="outline" className="bg-red-50">
                        {archetype}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="advanced" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Configuration</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label>Custom Analysis Instructions</Label>
                  <Textarea
                    placeholder="Additional analysis instructions specific to this assessment..."
                    className="min-h-[100px]"
                  />
                </div>

                <div>
                  <Label>Shadow Work Integration</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select shadow work level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="none">No Shadow Work</SelectItem>
                      <SelectItem value="gentle">Gentle Shadow Exploration</SelectItem>
                      <SelectItem value="moderate">Moderate Shadow Integration</SelectItem>
                      <SelectItem value="deep">Deep Shadow Work</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="flex justify-end gap-3">
        <Button variant="outline">Preview</Button>
        <Button onClick={() => onSave(config)}>Save Configuration</Button>
      </div>
    </div>
  )
} 