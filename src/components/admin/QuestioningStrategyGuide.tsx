'use client'

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  MessageCircle, 
  Target, 
  TrendingUp, 
  Search, 
  Brain,
  ArrowRight,
  Lightbulb,
  Heart
} from 'lucide-react'

export function QuestioningStrategyGuide() {
  const strategies = {
    adaptive: {
      name: 'Adaptive Questioning',
      description: 'Adjusts questioning approach based on user responses and emerging patterns',
      icon: Brain,
      color: 'blue',
      techniques: [
        'Pattern Recognition: Identify emerging archetypal themes and adjust questions accordingly',
        'Response Depth Analysis: Gauge emotional depth and adjust complexity',
        'Resistance Detection: Notice avoidance patterns and pivot to safer topics',
        'Energy Matching: Match the user\'s communication style and energy level'
      ],
      examples: [
        'Initial: "Tell me about a recent challenge you faced." → If response shows leadership patterns → "How do you typically guide others through uncertainty?"',
        'If user gives brief responses → "I sense there\'s more to that story. What felt most significant about that moment?"',
        'If user shows emotional resistance → "Let\'s approach this differently. What brings you the most joy in your daily life?"'
      ]
    },
    progressive: {
      name: 'Progressive Questioning',
      description: 'Builds complexity and depth gradually, starting with surface-level topics',
      icon: TrendingUp,
      color: 'green',
      techniques: [
        'Surface to Depth: Begin with comfortable topics, gradually explore deeper themes',
        'Trust Building: Establish rapport before asking vulnerable questions',
        'Complexity Layering: Add nuance and complexity as understanding develops',
        'Integration Moments: Periodically connect insights across different areas'
      ],
      examples: [
        'Level 1: "What activities energize you most?"',
        'Level 2: "When you\'re energized like that, how do you typically interact with others?"',
        'Level 3: "What do you think drives that need to [specific pattern identified]?"',
        'Level 4: "How might that pattern both serve and limit you in different contexts?"'
      ]
    },
    exploratory: {
      name: 'Exploratory Questioning',
      description: 'Wide-ranging discovery approach to uncover unexpected patterns and insights',
      icon: Search,
      color: 'purple',
      techniques: [
        'Domain Jumping: Explore different life areas to find consistent patterns',
        'Metaphor Mining: Use analogies and metaphors to reveal unconscious patterns',
        'Contrast Exploration: Examine opposites and contradictions',
        'Story Archaeology: Dig into personal narratives and meaning-making'
      ],
      examples: [
        'Domain Jump: "You mentioned leadership at work. How do you show up in your family relationships?"',
        'Metaphor: "If your life were a story, what genre would it be and what role would you play?"',
        'Contrast: "Tell me about a time when you acted completely unlike your usual self."',
        'Story: "What story do you tell yourself about why that relationship ended?"'
      ]
    },
    focused: {
      name: 'Focused Deep-Dive',
      description: 'Concentrated exploration of specific archetypal themes or life areas',
      icon: Target,
      color: 'orange',
      techniques: [
        'Theme Saturation: Thoroughly explore one archetypal theme from multiple angles',
        'Micro-Analysis: Examine specific moments, words, and reactions in detail',
        'Pattern Validation: Test archetypal hypotheses through targeted questions',
        'Shadow Integration: Explore the shadow aspects of identified patterns'
      ],
      examples: [
        'Theme Focus: "Let\'s explore your relationship with authority. Tell me about your earliest memory of someone in power."',
        'Micro-Analysis: "You used the word \'should\' three times. What does that word mean to you?"',
        'Pattern Test: "I\'m sensing a caretaker pattern. How do you feel when others don\'t need your help?"',
        'Shadow Work: "When has your desire to help others actually caused harm?"'
      ]
    }
  }

  const questionTypes = {
    openEnded: {
      name: 'Open-Ended Questions',
      purpose: 'Gather rich, detailed responses that reveal natural language patterns',
      examples: [
        'Tell me about a moment when you felt most alive and authentic.',
        'Describe a relationship that has shaped who you are today.',
        'Walk me through how you make important decisions.',
        'What does success mean to you, and how has that definition evolved?'
      ]
    },
    followUp: {
      name: 'Follow-Up Questions',
      purpose: 'Deepen understanding and encourage elaboration on key themes',
      examples: [
        'What specifically about that experience stands out to you?',
        'How did that make you feel, both in the moment and looking back?',
        'What do you think drove you to respond that way?',
        'Can you give me a concrete example of what that looks like?'
      ]
    },
    clarifying: {
      name: 'Clarifying Questions',
      purpose: 'Understand personal meanings and definitions behind key words and concepts',
      examples: [
        'When you say "strong," what does that mean to you personally?',
        'How would you define "success" in your own words?',
        'What\'s the difference between being "helpful" and being "needed"?',
        'What does "authentic" look like in your daily life?'
      ]
    },
    deepening: {
      name: 'Deepening Questions',
      purpose: 'Explore underlying motivations, fears, and unconscious patterns',
      examples: [
        'What do you think you\'re really seeking when you [specific behavior]?',
        'What would happen if you couldn\'t [specific role/behavior] anymore?',
        'What part of yourself do you think you\'re protecting when you [pattern]?',
        'If that fear weren\'t there, how might you show up differently?'
      ]
    }
  }

  const adaptiveTriggers = [
    {
      trigger: 'Strong Archetypal Pattern Emerges',
      response: 'Shift to focused questioning to validate and explore the pattern deeply',
      example: 'User shows clear Hero archetype → "Tell me about a time when you had to stand up for something important, even when it was difficult."'
    },
    {
      trigger: 'User Shows Resistance or Discomfort',
      response: 'Pivot to safer topics or use indirect approaches like metaphors',
      example: 'User becomes defensive about relationships → "If you were to describe your ideal friendship as a type of weather, what would it be?"'
    },
    {
      trigger: 'Response Patterns Become Repetitive',
      response: 'Change questioning style or explore different life domains',
      example: 'User keeps mentioning work → "Let\'s step away from career for a moment. Tell me about your relationship with nature or creativity."'
    },
    {
      trigger: 'Emotional Depth Increases Significantly',
      response: 'Slow down, validate the emotion, and explore with greater sensitivity',
      example: 'User becomes emotional → "I can sense this touches something important for you. Take your time. What feels most significant about this?"'
    }
  ]

  return (
    <div className="max-w-6xl mx-auto p-6 space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">AI Questioning Strategy Guide</h1>
        <p className="text-gray-600">Comprehensive guide to effective archetypal assessment questioning</p>
      </div>

      <Tabs defaultValue="strategies" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="strategies">Questioning Strategies</TabsTrigger>
          <TabsTrigger value="types">Question Types</TabsTrigger>
          <TabsTrigger value="adaptive">Adaptive Triggers</TabsTrigger>
          <TabsTrigger value="best-practices">Best Practices</TabsTrigger>
        </TabsList>

        <TabsContent value="strategies" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(strategies).map(([key, strategy]) => (
              <Card key={key} className="h-full">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <strategy.icon className={`h-5 w-5 text-${strategy.color}-500`} />
                    {strategy.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{strategy.description}</p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-medium mb-2">Key Techniques:</h4>
                    <ul className="space-y-1">
                      {strategy.techniques.map((technique, index) => (
                        <li key={index} className="text-sm text-gray-700 flex items-start gap-2">
                          <ArrowRight className="h-3 w-3 mt-1 text-gray-400 flex-shrink-0" />
                          {technique}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h4 className="font-medium mb-2">Examples:</h4>
                    <div className="space-y-2">
                      {strategy.examples.map((example, index) => (
                        <div key={index} className="text-sm bg-gray-50 p-2 rounded border-l-2 border-gray-300">
                          {example}
                        </div>
                      ))}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="types" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {Object.entries(questionTypes).map(([key, type]) => (
              <Card key={key}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageCircle className="h-5 w-5 text-blue-500" />
                    {type.name}
                  </CardTitle>
                  <p className="text-sm text-gray-600">{type.purpose}</p>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {type.examples.map((example, index) => (
                      <div key={index} className="text-sm bg-blue-50 p-3 rounded border-l-2 border-blue-300">
                        &quot;{example}&quot;
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="adaptive" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5 text-purple-500" />
                Adaptive Questioning Triggers
              </CardTitle>
              <p className="text-sm text-gray-600">
                How to recognize key moments and adapt your questioning approach accordingly
              </p>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {adaptiveTriggers.map((item, index) => (
                  <div key={index} className="border rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <Badge variant="outline" className="mt-1">{item.trigger}</Badge>
                      <div className="flex-1">
                        <p className="font-medium text-gray-900 mb-2">{item.response}</p>
                        <div className="bg-gray-50 p-3 rounded border-l-2 border-gray-300">
                          <p className="text-sm text-gray-700">{item.example}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="best-practices" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Lightbulb className="h-5 w-5 text-yellow-500" />
                  Do&apos;s
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Always require 2-3 sentence minimum responses',
                    'Use follow-up prompts for brief or surface-level answers',
                    'Pay attention to emotional vocabulary and power language',
                    'Notice patterns across different life domains',
                    'Validate emotions and create psychological safety',
                    'Ask about specific moments rather than generalizations',
                    'Explore both light and shadow aspects of patterns',
                    'Remain curious and non-judgmental throughout'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Heart className="h-5 w-5 text-red-500" />
                  Don&apos;ts
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {[
                    'Don&apos;t accept one-word or single-sentence responses',
                    'Don&apos;t lead with assumptions about archetypes',
                    'Don&apos;t push when someone shows clear resistance',
                    'Don&apos;t ask multiple questions in one prompt',
                    'Don&apos;t use psychological jargon or technical terms',
                    'Don&apos;t make interpretations too early in the process',
                    'Don&apos;t ignore emotional cues or energy shifts',
                    'Don&apos;t rush to conclusions without sufficient evidence'
                  ].map((item, index) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <div className="w-2 h-2 bg-red-500 rounded-full mt-2 flex-shrink-0" />
                      {item}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
