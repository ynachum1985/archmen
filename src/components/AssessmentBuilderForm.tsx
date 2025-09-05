'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Save, Plus, X, ExternalLink } from 'lucide-react'

interface Archetype {
  id: string
  name: string
  category: string
  description: string
  impact_score: number
}

interface AssessmentData {
  name: string
  category: string
  purpose: string
  goal: string
  questionTypes: string[]
  referenceData: ReferenceItem[]
  selectedArchetypes: string[]
  estimatedDuration: number
  // AI Analysis Configuration
  languageIndicators: LanguageIndicator[]
  responseRequirements: ResponseRequirements
  adaptiveLogic: AdaptiveLogic
  archetypeMapping: ArchetypeMapping[]
}

interface LanguageIndicator {
  pattern: string
  archetypeSignal: string
  weight: number
  description: string
}

interface ResponseRequirements {
  minSentences: number
  maxSentences: number
  requiredElements: string[]
  followUpPrompts: string[]
}

interface AdaptiveLogic {
  minQuestions: number
  maxQuestions: number
  branchingRules: BranchingRule[]
  contradictionHandling: string[]
}

interface BranchingRule {
  condition: string
  nextQuestionType: string
  reasoning: string
}

interface ArchetypeMapping {
  archetypeId: string
  triggerPatterns: string[]
  requiredEvidence: number
  conflictingPatterns: string[]
}

interface ReferenceItem {
  title: string
  url: string
  description: string
}

interface AssessmentBuilderFormProps {
  archetypes: Archetype[]
  onSave: (data: AssessmentData) => void
}

const ASSESSMENT_CATEGORIES = [
  'Sexuality & Intimacy',
  'Monogamy vs. Polyamory', 
  'Relationship Patterns',
  'Patriarchy\'s Influence',
  'Consent & Boundaries',
  'Modern Dating',
  'Trauma & Childhood',
  'Communication Styles',
  'Attachment Patterns',
  'Power Dynamics'
]

const QUESTION_TYPE_SUGGESTIONS = {
  'Sexuality & Intimacy': [
    'How do you express physical affection?',
    'What are your comfort levels with intimacy?',
    'How do you communicate sexual needs?',
    'What role does sexuality play in your relationships?'
  ],
  'Monogamy vs. Polyamory': [
    'How do you view relationship exclusivity?',
    'What are your thoughts on multiple partners?',
    'How do you handle jealousy?',
    'What does commitment mean to you?'
  ],
  'Relationship Patterns': [
    'What patterns do you notice in your relationships?',
    'How do you handle conflict?',
    'What attracts you to partners?',
    'How do you show love and care?'
  ],
  'Patriarchy\'s Influence': [
    'How do traditional gender roles affect you?',
    'What masculine expectations do you feel?',
    'How do you view emotional expression?',
    'What does being a "real man" mean to you?'
  ],
  'Consent & Boundaries': [
    'How do you establish boundaries?',
    'How do you ask for consent?',
    'How do you respect others\' limits?',
    'How do you communicate your needs?'
  ],
  'Modern Dating': [
    'How do you approach online dating?',
    'What challenges do you face in dating?',
    'How do you handle rejection?',
    'What are your dating expectations?'
  ]
}

export default function AssessmentBuilderForm({ archetypes, onSave }: AssessmentBuilderFormProps) {
  const [formData, setFormData] = useState<AssessmentData>({
    name: '',
    category: '',
    purpose: '',
    goal: '',
    questionTypes: [],
    referenceData: [],
    selectedArchetypes: [],
    estimatedDuration: 15,
    languageIndicators: [],
    responseRequirements: {
      minSentences: 2,
      maxSentences: 8,
      requiredElements: [],
      followUpPrompts: []
    },
    adaptiveLogic: {
      minQuestions: 8,
      maxQuestions: 15,
      branchingRules: [],
      contradictionHandling: []
    },
    archetypeMapping: []
  })

  const [newQuestionType, setNewQuestionType] = useState('')
  const [newReference, setNewReference] = useState<ReferenceItem>({
    title: '',
    url: '',
    description: ''
  })

  const handleSave = () => {
    onSave(formData)
    // Reset form
    setFormData({
      name: '',
      category: '',
      purpose: '',
      goal: '',
      questionTypes: [],
      referenceData: [],
      selectedArchetypes: [],
      estimatedDuration: 15,
      languageIndicators: [],
      responseRequirements: {
        minSentences: 2,
        maxSentences: 8,
        requiredElements: [],
        followUpPrompts: []
      },
      adaptiveLogic: {
        minQuestions: 8,
        maxQuestions: 15,
        branchingRules: [],
        contradictionHandling: []
      },
      archetypeMapping: []
    })
  }

  const addQuestionType = () => {
    if (newQuestionType.trim()) {
      setFormData(prev => ({
        ...prev,
        questionTypes: [...prev.questionTypes, newQuestionType.trim()]
      }))
      setNewQuestionType('')
    }
  }

  const removeQuestionType = (index: number) => {
    setFormData(prev => ({
      ...prev,
      questionTypes: prev.questionTypes.filter((_, i) => i !== index)
    }))
  }

  const addReference = () => {
    if (newReference.title.trim() && newReference.url.trim()) {
      setFormData(prev => ({
        ...prev,
        referenceData: [...prev.referenceData, newReference]
      }))
      setNewReference({ title: '', url: '', description: '' })
    }
  }

  const removeReference = (index: number) => {
    setFormData(prev => ({
      ...prev,
      referenceData: prev.referenceData.filter((_, i) => i !== index)
    }))
  }

  const toggleArchetype = (archetypeId: string) => {
    setFormData(prev => ({
      ...prev,
      selectedArchetypes: prev.selectedArchetypes.includes(archetypeId)
        ? prev.selectedArchetypes.filter(id => id !== archetypeId)
        : [...prev.selectedArchetypes, archetypeId]
    }))
  }

  const loadSuggestedQuestions = () => {
    const suggestions = QUESTION_TYPE_SUGGESTIONS[formData.category as keyof typeof QUESTION_TYPE_SUGGESTIONS] || []
    setFormData(prev => ({
      ...prev,
      questionTypes: [...prev.questionTypes, ...suggestions.filter(q => !prev.questionTypes.includes(q))]
    }))
  }

  return (
    <div className="space-y-6">
      {/* Basic Information */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Assessment Name</label>
          <Input
            value={formData.name}
            onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
            placeholder="e.g., Sexuality & Intimacy Assessment"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
          <Select value={formData.category} onValueChange={(value) => setFormData(prev => ({ ...prev, category: value }))}>
            <SelectTrigger>
              <SelectValue placeholder="Select category" />
            </SelectTrigger>
            <SelectContent>
              {ASSESSMENT_CATEGORIES.map(category => (
                <SelectItem key={category} value={category}>{category}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Purpose</label>
        <Textarea
          value={formData.purpose}
          onChange={(e) => setFormData(prev => ({ ...prev, purpose: e.target.value }))}
          placeholder="What is the purpose of this assessment? What will it help users understand about themselves?"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Goal</label>
        <Textarea
          value={formData.goal}
          onChange={(e) => setFormData(prev => ({ ...prev, goal: e.target.value }))}
          placeholder="What specific insights or outcomes should users gain from this assessment?"
          rows={3}
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Estimated Duration (minutes)</label>
        <Input
          type="number"
          min="5"
          max="60"
          value={formData.estimatedDuration}
          onChange={(e) => setFormData(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 15 }))}
          className="w-32"
        />
      </div>

      {/* Question Types */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="block text-sm font-medium text-gray-700">Suggested Question Types</label>
          {formData.category && QUESTION_TYPE_SUGGESTIONS[formData.category as keyof typeof QUESTION_TYPE_SUGGESTIONS] && (
            <Button size="sm" variant="outline" onClick={loadSuggestedQuestions}>
              Load Suggestions
            </Button>
          )}
        </div>
        <div className="flex gap-2 mb-2">
          <Input
            value={newQuestionType}
            onChange={(e) => setNewQuestionType(e.target.value)}
            placeholder="Add a question type or example question"
            onKeyPress={(e) => e.key === 'Enter' && addQuestionType()}
          />
          <Button onClick={addQuestionType} size="sm">
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {formData.questionTypes.map((question, index) => (
            <Badge key={index} variant="secondary" className="flex items-center gap-1">
              {question}
              <button onClick={() => removeQuestionType(index)} className="ml-1 hover:text-red-600">
                <X className="w-3 h-3" />
              </button>
            </Badge>
          ))}
        </div>
      </div>

      {/* Reference Data */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Reference Data & Resources</label>
        <Card className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2 mb-3">
            <Input
              value={newReference.title}
              onChange={(e) => setNewReference(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Resource title"
            />
            <Input
              value={newReference.url}
              onChange={(e) => setNewReference(prev => ({ ...prev, url: e.target.value }))}
              placeholder="URL"
            />
            <div className="flex gap-2">
              <Input
                value={newReference.description}
                onChange={(e) => setNewReference(prev => ({ ...prev, description: e.target.value }))}
                placeholder="Description"
              />
              <Button onClick={addReference} size="sm">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>
          <div className="space-y-2">
            {formData.referenceData.map((ref, index) => (
              <div key={index} className="flex items-center justify-between p-2 bg-gray-50 rounded">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium">{ref.title}</span>
                    <a href={ref.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                  {ref.description && <p className="text-sm text-gray-600">{ref.description}</p>}
                </div>
                <button onClick={() => removeReference(index)} className="text-red-600 hover:text-red-800">
                  <X className="w-4 h-4" />
                </button>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Archetype Selection */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Related Archetypes ({formData.selectedArchetypes.length} selected)
        </label>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 max-h-60 overflow-y-auto border rounded p-3">
          {archetypes.map((archetype) => (
            <div
              key={archetype.id}
              className={`p-2 rounded cursor-pointer transition-colors ${
                formData.selectedArchetypes.includes(archetype.id)
                  ? 'bg-blue-100 border-blue-300'
                  : 'bg-gray-50 hover:bg-gray-100'
              }`}
              onClick={() => toggleArchetype(archetype.id)}
            >
              <div className="font-medium text-sm">{archetype.name}</div>
              <div className="text-xs text-gray-600">{archetype.category}</div>
            </div>
          ))}
        </div>
      </div>

      {/* AI Analysis Configuration */}
      <div className="space-y-4 p-4 bg-gray-50 rounded-lg">
        <h3 className="text-lg font-medium text-gray-900">AI Analysis Configuration</h3>
        <p className="text-sm text-gray-600">Configure how the AI analyzes responses and determines archetypes</p>

        {/* Response Requirements */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Min Sentences</label>
            <Input
              type="number"
              min="1"
              max="10"
              value={formData.responseRequirements.minSentences}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                responseRequirements: {
                  ...prev.responseRequirements,
                  minSentences: parseInt(e.target.value) || 2
                }
              }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Max Sentences</label>
            <Input
              type="number"
              min="2"
              max="20"
              value={formData.responseRequirements.maxSentences}
              onChange={(e) => setFormData(prev => ({
                ...prev,
                responseRequirements: {
                  ...prev.responseRequirements,
                  maxSentences: parseInt(e.target.value) || 8
                }
              }))}
              className="w-full"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Question Range</label>
            <div className="flex gap-2">
              <Input
                type="number"
                min="5"
                max="30"
                value={formData.adaptiveLogic.minQuestions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  adaptiveLogic: {
                    ...prev.adaptiveLogic,
                    minQuestions: parseInt(e.target.value) || 8
                  }
                }))}
                placeholder="Min"
                className="w-full"
              />
              <Input
                type="number"
                min="8"
                max="50"
                value={formData.adaptiveLogic.maxQuestions}
                onChange={(e) => setFormData(prev => ({
                  ...prev,
                  adaptiveLogic: {
                    ...prev.adaptiveLogic,
                    maxQuestions: parseInt(e.target.value) || 15
                  }
                }))}
                placeholder="Max"
                className="w-full"
              />
            </div>
          </div>
        </div>

        {/* Language Pattern Analysis */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Language Patterns to Detect</label>
          <p className="text-xs text-gray-500 mb-3">Add specific language patterns that indicate certain archetypes</p>
          <div className="space-y-2">
            <div className="grid grid-cols-1 md:grid-cols-4 gap-2">
              <Input placeholder="Language pattern (e.g., 'she made me')" className="text-sm" />
              <Input placeholder="Archetype signal (e.g., 'Victim mentality')" className="text-sm" />
              <Input placeholder="Weight (1-10)" type="number" min="1" max="10" className="text-sm" />
              <Button size="sm" className="bg-green-600 hover:bg-green-700">
                <Plus className="w-4 h-4" />
              </Button>
            </div>
            <div className="text-xs text-gray-500">
              Examples: &quot;I can&apos;t help it&quot; → Avoidant patterns | &quot;She should know&quot; → Communication issues | &quot;All women are&quot; → Generalization patterns
            </div>
          </div>
        </div>

        {/* Follow-up Prompts */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Follow-up Prompts</label>
          <p className="text-xs text-gray-500 mb-3">Prompts to encourage deeper responses when answers are too brief</p>
          <div className="flex gap-2 mb-2">
            <Input
              placeholder="e.g., 'Can you give me a specific example of that?'"
              className="flex-1"
            />
            <Button size="sm">
              <Plus className="w-4 h-4" />
            </Button>
          </div>
          <div className="text-xs text-gray-500">
            Suggested prompts: &quot;Tell me more about how that felt&quot; | &quot;What was going through your mind?&quot; | &quot;Can you describe what happened next?&quot;
          </div>
        </div>

        {/* Archetype Detection Rules */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Archetype Detection Rules</label>
          <p className="text-xs text-gray-500 mb-3">Define what evidence is needed to identify each archetype</p>
          <div className="space-y-2 max-h-40 overflow-y-auto border rounded p-2">
            {formData.selectedArchetypes.map((archetypeId) => {
              const archetype = archetypes.find(a => a.id === archetypeId)
              return (
                <div key={archetypeId} className="flex items-center justify-between p-2 bg-white rounded border">
                  <span className="text-sm font-medium">{archetype?.name}</span>
                  <div className="flex gap-2 text-xs">
                    <Input placeholder="Required evidence count" type="number" min="1" max="10" className="w-20" />
                    <Button size="sm" variant="outline">Configure</Button>
                  </div>
                </div>
              )
            })}
            {formData.selectedArchetypes.length === 0 && (
              <p className="text-sm text-gray-500 italic">Select archetypes above to configure detection rules</p>
            )}
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="flex justify-end pt-4 border-t">
        <Button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700">
          <Save className="w-4 h-4 mr-2" />
          Save Assessment
        </Button>
      </div>
    </div>
  )
}
