'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Progress } from '@/components/ui/progress'

interface DevelopmentTask {
  id: string
  type: 'archetype' | 'pattern' | 'question' | 'prompt'
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  aiSuggestions?: string[]
  progress: number
}

export function AIDevelopmentAssistant() {
  const [userQuery, setUserQuery] = useState('')
  const [aiResponse, setAiResponse] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [activeTasks, setActiveTasks] = useState<DevelopmentTask[]>([])

  const mockTasks: DevelopmentTask[] = [
    {
      id: 't1',
      type: 'archetype',
      title: 'Define Rebel Archetype in Dating Context',
      description: 'Need to specify how the Rebel archetype manifests in early dating scenarios',
      status: 'in-progress',
      progress: 60,
      aiSuggestions: [
        'Challenges conventional dating norms',
        'Tests boundaries early in relationships',
        'Attracted to partners who respect independence'
      ]
    },
    {
      id: 't2',
      type: 'pattern',
      title: 'Create Avoidant Language Patterns',
      description: 'Develop linguistic markers for avoidant attachment style',
      status: 'pending',
      progress: 0
    }
  ]

  const handleAIAssist = () => {
    setIsProcessing(true)
    // Mock AI processing
    setTimeout(() => {
      setAiResponse(`Based on your request, here's what I suggest:

1. **Archetype Development**: Start with the major archetypes (Warrior, Lover, Sage) and define their behaviors across all contexts (dating, marriage, conflict).

2. **Language Patterns**: Focus on action verbs for Warriors ("I will", "I must"), emotion words for Lovers ("I feel", "My heart"), and analytical phrases for Sages ("I think", "Let me analyze").

3. **Question Design**: Create scenarios that trigger authentic responses - relationship conflicts work best for revealing true archetypes.

Would you like me to generate specific examples for any of these?`)
      setIsProcessing(false)
    }, 2000)
  }

  const aiCapabilities = [
    {
      icon: '🎭',
      title: 'Archetype Generator',
      description: 'Generate complete archetype definitions with context-specific behaviors'
    },
    {
      icon: '🔍',
      title: 'Pattern Analyzer',
      description: 'Analyze text samples to identify linguistic patterns'
    },
    {
      icon: '❓',
      title: 'Question Creator',
      description: 'Generate scenario-based assessment questions'
    },
    {
      icon: '🤖',
      title: 'Prompt Engineer',
      description: 'Create AI prompts for analyzing user responses'
    }
  ]

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-slate-200 mb-2">AI Development Assistant</h2>
        <p className="text-slate-400">
          Collaborative AI to help develop archetypes, patterns, and assessment content
        </p>
      </div>

      {/* Main AI Interface */}
      <Card className="bg-gradient-to-br from-purple-900/20 to-blue-900/20 border-purple-500/30">
        <CardHeader>
          <CardTitle className="text-purple-300">Ask the AI Assistant</CardTitle>
          <CardDescription className="text-slate-400">
            Get help developing any aspect of your archetype system
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label className="text-slate-300">What would you like help with?</Label>
            <Textarea
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              placeholder="E.g., 'Help me create language patterns for the Magician archetype' or 'Generate questions that reveal shadow patterns'..."
              className="bg-slate-900/50 border-slate-600 text-slate-200 min-h-[100px]"
            />
          </div>

          <Button 
            onClick={handleAIAssist}
            disabled={!userQuery.trim() || isProcessing}
            className="w-full bg-purple-600 hover:bg-purple-700"
          >
            {isProcessing ? 'AI is thinking...' : 'Get AI Assistance'}
          </Button>

          {aiResponse && (
            <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-600">
              <h4 className="text-blue-300 font-medium mb-2">AI Response:</h4>
              <div className="text-slate-200 whitespace-pre-line">{aiResponse}</div>
              <div className="flex gap-2 mt-4">
                <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                  Apply Suggestions
                </Button>
                <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                  Generate More
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* AI Capabilities */}
      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
        {aiCapabilities.map((capability) => (
          <Card key={capability.title} className="bg-slate-800/50 border-slate-700 hover:border-purple-500 cursor-pointer transition-colors">
            <CardContent className="p-4 text-center">
              <div className="text-3xl mb-2">{capability.icon}</div>
              <h4 className="text-slate-200 font-medium mb-1">{capability.title}</h4>
              <p className="text-slate-400 text-sm">{capability.description}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Development Tasks */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle className="text-slate-200">Development Tasks</CardTitle>
            <Button size="sm" className="bg-teal-600 hover:bg-teal-700">
              Add Task
            </Button>
          </div>
          <CardDescription className="text-slate-400">
            Track your archetype development progress
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mockTasks.map((task) => (
              <div key={task.id} className="p-4 bg-slate-900/50 rounded-lg border border-slate-600">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <h4 className="text-slate-200 font-medium">{task.title}</h4>
                    <p className="text-slate-400 text-sm">{task.description}</p>
                  </div>
                  <Badge 
                    variant={task.status === 'completed' ? 'default' : 'secondary'}
                    className={task.status === 'completed' ? 'bg-green-600' : task.status === 'in-progress' ? 'bg-yellow-600' : ''}
                  >
                    {task.status}
                  </Badge>
                </div>
                
                {task.progress > 0 && (
                  <div className="mb-2">
                    <Progress value={task.progress} className="h-2" />
                    <span className="text-slate-400 text-xs">{task.progress}% complete</span>
                  </div>
                )}

                {task.aiSuggestions && (
                  <div className="mt-3 p-3 bg-purple-900/20 rounded border border-purple-500/30">
                    <div className="text-purple-300 text-sm font-medium mb-1">AI Suggestions:</div>
                    <ul className="text-slate-300 text-sm space-y-1">
                      {task.aiSuggestions.map((suggestion, index) => (
                        <li key={index}>• {suggestion}</li>
                      ))}
                    </ul>
                  </div>
                )}

                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                    Get AI Help
                  </Button>
                  <Button size="sm" variant="outline" className="border-slate-600 text-slate-300">
                    Mark Complete
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Integration Overview */}
      <Card className="bg-slate-800/50 border-slate-700">
        <CardHeader>
          <CardTitle className="text-slate-200">System Integration Overview</CardTitle>
          <CardDescription className="text-slate-400">
            How all components work together
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-6 text-center">
            <div>
              <div className="text-4xl mb-2">1️⃣</div>
              <h4 className="text-teal-300 font-medium mb-2">Define Archetypes</h4>
              <p className="text-slate-400 text-sm">
                Create archetypes with context-specific behaviors using the Enhanced Archetype Manager
              </p>
            </div>
            <div>
              <div className="text-4xl mb-2">2️⃣</div>
              <h4 className="text-orange-300 font-medium mb-2">Build Patterns</h4>
              <p className="text-slate-400 text-sm">
                Develop language patterns that detect archetypes using the Pattern Builder
              </p>
            </div>
            <div>
              <div className="text-4xl mb-2">3️⃣</div>
              <h4 className="text-purple-300 font-medium mb-2">Create Questions</h4>
              <p className="text-slate-400 text-sm">
                Design scenarios that trigger authentic responses in the Question Bank
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
} 