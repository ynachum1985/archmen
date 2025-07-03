'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface ArchetypeDefinition {
  id: string
  name: string
  category: 'major' | 'minor' | 'shadow'
  description: string
  contexts: {
    general: string
    dating: string
    marriage: string
    breakup: string
    conflict: string
  }
  traits: {
    positive: string[]
    negative: string[]
    neutral: string[]
  }
  relatedArchetypes: string[]
  oppositeArchetypes: string[]
  isActive: boolean
  detectionKeywords: string[]
  behavioralIndicators: string[]
}

export function EnhancedArchetypeManager() {
  const [selectedArchetype, setSelectedArchetype] = useState<ArchetypeDefinition | null>(null)
  const [editingContext, setEditingContext] = useState<keyof ArchetypeDefinition['contexts']>('general')

  // Mock Caroline Myss inspired archetypes
  const mockArchetypes: ArchetypeDefinition[] = [
    {
      id: 'warrior',
      name: 'Warrior',
      category: 'major',
      description: 'The Warrior archetype represents the part of us that protects, defends, and fights for what we believe in.',
      contexts: {
        general: 'Takes action, sets boundaries, and stands up for beliefs',
        dating: 'Protective of partner, decisive about relationship direction, clear about needs',
        marriage: 'Defends the relationship, tackles problems head-on, provides security',
        breakup: 'Direct about ending, protects own interests, moves forward decisively',
        conflict: 'Confronts issues directly, doesn\'t back down, fights fair'
      },
      traits: {
        positive: ['Protective', 'Decisive', 'Strong', 'Courageous'],
        negative: ['Aggressive', 'Controlling', 'Inflexible'],
        neutral: ['Direct', 'Action-oriented', 'Assertive']
      },
      relatedArchetypes: ['Hero', 'Protector', 'Knight'],
      oppositeArchetypes: ['Victim', 'Innocent', 'Hermit'],
      isActive: true,
      detectionKeywords: ['must', 'will', 'fight', 'protect', 'defend'],
      behavioralIndicators: ['Takes charge', 'Sets clear boundaries', 'Direct communication']
    },
    {
      id: 'lover',
      name: 'Lover',
      category: 'major',
      description: 'The Lover archetype is driven by connection, passion, and the desire for intimacy and union.',
      contexts: {
        general: 'Seeks connection, values intimacy, expresses emotions freely',
        dating: 'Romantic, passionate, seeks deep connection, emotionally expressive',
        marriage: 'Nurtures intimacy, keeps passion alive, prioritizes emotional connection',
        breakup: 'Grieves deeply, struggles to let go, seeks closure through connection',
        conflict: 'Wants to reconnect, uses emotion to bridge gaps, seeks understanding'
      },
      traits: {
        positive: ['Passionate', 'Devoted', 'Empathetic', 'Romantic'],
        negative: ['Clingy', 'Jealous', 'Emotionally dependent'],
        neutral: ['Emotional', 'Sensual', 'Connection-seeking']
      },
      relatedArchetypes: ['Romantic', 'Companion', 'Devotee'],
      oppositeArchetypes: ['Hermit', 'Sage', 'Ascetic'],
      isActive: true,
      detectionKeywords: ['feel', 'love', 'heart', 'connect', 'together'],
      behavioralIndicators: ['Seeks physical touch', 'Expresses emotions', 'Prioritizes quality time']
    },
    {
      id: 'saboteur',
      name: 'Saboteur',
      category: 'shadow',
      description: 'The Saboteur represents our capacity for self-destruction and undermining our own success.',
      contexts: {
        general: 'Undermines own efforts, creates obstacles, fears success',
        dating: 'Pushes away good partners, creates drama, tests relationships destructively',
        marriage: 'Creates problems when things are good, picks fights, threatens stability',
        breakup: 'Sabotages reconciliation attempts, burns bridges, ensures no return',
        conflict: 'Escalates unnecessarily, says hurtful things, damages trust'
      },
      traits: {
        positive: ['Awareness of danger', 'Cautious', 'Reality-testing'],
        negative: ['Self-destructive', 'Pessimistic', 'Undermining'],
        neutral: ['Questioning', 'Skeptical', 'Testing']
      },
      relatedArchetypes: ['Destroyer', 'Critic', 'Skeptic'],
      oppositeArchetypes: ['Builder', 'Optimist', 'Supporter'],
      isActive: true,
      detectionKeywords: ['but', 'can\'t', 'won\'t work', 'always fails', 'doomed'],
      behavioralIndicators: ['Creates problems', 'Negative self-talk', 'Procrastination']
    }
  ]

  const contextDescriptions = {
    general: 'How this archetype shows up in everyday life',
    dating: 'Patterns in early relationship stages and courtship',
    marriage: 'Expression in committed, long-term relationships',
    breakup: 'Behavior during relationship endings and separation',
    conflict: 'Response patterns during disagreements and tensions'
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">Enhanced Archetype Manager</h2>
        <p className="text-slate-400">
          Define context-specific archetype expressions and behavioral patterns
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Archetype Library */}
        <Card className="bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-teal-300">Archetype Library</CardTitle>
            <CardDescription className="text-slate-400">
              Major, Minor, and Shadow Archetypes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 mb-4">
              <div className="flex gap-2">
                <Badge className="bg-teal-600">Major: 12</Badge>
                <Badge className="bg-orange-600">Minor: 31</Badge>
                <Badge className="bg-purple-600">Shadow: 12</Badge>
              </div>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {mockArchetypes.map((archetype) => (
                <div
                  key={archetype.id}
                  onClick={() => setSelectedArchetype(archetype)}
                  className={`p-3 rounded-lg border cursor-pointer transition-colors ${
                    selectedArchetype?.id === archetype.id
                      ? 'border-teal-500 bg-teal-900/20'
                      : 'border-slate-600 bg-slate-900/50 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-slate-200 font-medium">{archetype.name}</span>
                    <Badge 
                      variant="outline" 
                      className={
                        archetype.category === 'major' ? 'border-teal-500 text-teal-300' :
                        archetype.category === 'minor' ? 'border-orange-500 text-orange-300' :
                        'border-purple-500 text-purple-300'
                      }
                    >
                      {archetype.category}
                    </Badge>
                  </div>
                  <p className="text-slate-400 text-xs">
                    {archetype.description.substring(0, 60)}...
                  </p>
                </div>
              ))}
            </div>

            <Button className="w-full mt-4 bg-teal-600 hover:bg-teal-700">
              Add New Archetype
            </Button>
          </CardContent>
        </Card>

        {/* Context-Specific Editor */}
        <Card className="lg:col-span-2 bg-slate-800/50 border-slate-700">
          <CardHeader>
            <CardTitle className="text-orange-300">
              {selectedArchetype ? `Edit: ${selectedArchetype.name}` : 'Select an Archetype'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {selectedArchetype ? (
              <Tabs defaultValue="contexts" className="space-y-4">
                <TabsList className="bg-slate-800 border-slate-700">
                  <TabsTrigger value="contexts">Contexts</TabsTrigger>
                  <TabsTrigger value="traits">Traits</TabsTrigger>
                  <TabsTrigger value="detection">Detection</TabsTrigger>
                  <TabsTrigger value="relationships">Relationships</TabsTrigger>
                </TabsList>

                <TabsContent value="contexts" className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Select Context to Edit</Label>
                    <Select 
                      value={editingContext} 
                      onValueChange={(value) => setEditingContext(value as keyof ArchetypeDefinition['contexts'])}
                    >
                      <SelectTrigger className="bg-slate-900/50 border-slate-600 text-slate-200">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(contextDescriptions).map(([key, desc]) => (
                          <SelectItem key={key} value={key}>
                            {key.charAt(0).toUpperCase() + key.slice(1)} - {desc}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label className="text-slate-300">
                      {editingContext.charAt(0).toUpperCase() + editingContext.slice(1)} Context Expression
                    </Label>
                    <Textarea
                      value={selectedArchetype.contexts[editingContext]}
                      className="bg-slate-900/50 border-slate-600 text-slate-200 min-h-[100px]"
                      placeholder={`How does the ${selectedArchetype.name} archetype express in ${editingContext} contexts?`}
                    />
                    <p className="text-slate-400 text-sm mt-2">
                      {contextDescriptions[editingContext]}
                    </p>
                  </div>

                  <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                    <h4 className="text-blue-300 font-medium mb-2">AI Context Assistant</h4>
                    <Button 
                      size="sm" 
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      Generate {editingContext} context description
                    </Button>
                  </div>
                </TabsContent>

                <TabsContent value="traits" className="space-y-4">
                  <div>
                    <Label className="text-slate-300 mb-2">Positive Traits</Label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedArchetype.traits.positive.map((trait) => (
                        <Badge key={trait} className="bg-green-900/30 text-green-300">
                          {trait}
                        </Badge>
                      ))}
                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs border-slate-600">
                        + Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2">Shadow Traits</Label>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {selectedArchetype.traits.negative.map((trait) => (
                        <Badge key={trait} className="bg-red-900/30 text-red-300">
                          {trait}
                        </Badge>
                      ))}
                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs border-slate-600">
                        + Add
                      </Button>
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300 mb-2">Neutral Traits</Label>
                    <div className="flex flex-wrap gap-2">
                      {selectedArchetype.traits.neutral.map((trait) => (
                        <Badge key={trait} variant="secondary" className="bg-slate-700">
                          {trait}
                        </Badge>
                      ))}
                      <Button size="sm" variant="outline" className="h-6 px-2 text-xs border-slate-600">
                        + Add
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="detection" className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Detection Keywords</Label>
                    <Textarea
                      value={selectedArchetype.detectionKeywords.join(', ')}
                      className="bg-slate-900/50 border-slate-600 text-slate-200"
                      placeholder="Keywords that indicate this archetype..."
                    />
                  </div>

                  <div>
                    <Label className="text-slate-300">Behavioral Indicators</Label>
                    <div className="space-y-2">
                      {selectedArchetype.behavioralIndicators.map((indicator, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <Input
                            value={indicator}
                            className="bg-slate-900/50 border-slate-600 text-slate-200"
                          />
                          <Button size="sm" variant="outline" className="border-slate-600">
                            Remove
                          </Button>
                        </div>
                      ))}
                      <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                        Add Behavioral Indicator
                      </Button>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="relationships" className="space-y-4">
                  <div>
                    <Label className="text-slate-300">Related Archetypes</Label>
                    <p className="text-slate-400 text-sm mb-2">Archetypes that share similar patterns</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedArchetype.relatedArchetypes.map((related) => (
                        <Badge key={related} variant="outline" className="border-teal-500/50 text-teal-300">
                          {related}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div>
                    <Label className="text-slate-300">Opposite Archetypes</Label>
                    <p className="text-slate-400 text-sm mb-2">Archetypes with opposing patterns</p>
                    <div className="flex flex-wrap gap-2">
                      {selectedArchetype.oppositeArchetypes.map((opposite) => (
                        <Badge key={opposite} variant="outline" className="border-orange-500/50 text-orange-300">
                          {opposite}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            ) : (
              <div className="text-center py-12">
                <div className="text-slate-400 mb-4">🎭</div>
                <h3 className="text-slate-300 text-lg font-medium mb-2">
                  Select an Archetype to Edit
                </h3>
                <p className="text-slate-400 text-sm">
                  Choose from the library or create a new archetype
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Context Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">Context-Specific Applications</CardTitle>
          <CardDescription className="text-slate-400">
            How archetypes adapt to different relationship contexts
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-5 gap-4 text-center">
            <div className="p-4">
              <div className="text-2xl mb-2">🌐</div>
              <h4 className="text-slate-300 font-medium">General</h4>
              <p className="text-slate-400 text-sm">Everyday patterns</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">💕</div>
              <h4 className="text-slate-300 font-medium">Dating</h4>
              <p className="text-slate-400 text-sm">Early relationships</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">💍</div>
              <h4 className="text-slate-300 font-medium">Marriage</h4>
              <p className="text-slate-400 text-sm">Long-term dynamics</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">💔</div>
              <h4 className="text-slate-300 font-medium">Breakup</h4>
              <p className="text-slate-400 text-sm">Separation patterns</p>
            </div>
            <div className="p-4">
              <div className="text-2xl mb-2">⚡</div>
              <h4 className="text-slate-300 font-medium">Conflict</h4>
              <p className="text-slate-400 text-sm">Disagreement styles</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 