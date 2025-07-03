"use client"

import { useState, useEffect, useCallback } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowLeft, Plus, Edit, Trash2, Save, GripVertical } from 'lucide-react'
import { assessmentService } from '@/lib/services/assessment.service'
import type { Database } from '@/lib/types/database'

type AssessmentTemplate = Database['public']['Tables']['assessment_templates']['Row']
type AssessmentQuestion = Database['public']['Tables']['assessment_questions']['Row']

export default function AssessmentEditor() {
  const params = useParams()
  const router = useRouter()
  const assessmentId = params.id as string

  const [assessment, setAssessment] = useState<AssessmentTemplate | null>(null)
  const [questions, setQuestions] = useState<AssessmentQuestion[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [editingQuestion, setEditingQuestion] = useState<string | null>(null)
  const [editForm, setEditForm] = useState({
    question_text: '',
    options: ['', '', '', ''],
    order_index: 0,
  })

  const loadAssessment = useCallback(async () => {
    try {
      setIsLoading(true)
      const data = await assessmentService.getTemplateWithQuestions(assessmentId)
      if (data) {
        setAssessment(data)
        setQuestions(data.questions || [])
      }
    } catch (error) {
      console.error('Error loading assessment:', error)
    } finally {
      setIsLoading(false)
    }
  }, [assessmentId])

  useEffect(() => {
    if (assessmentId) {
      loadAssessment()
    }
  }, [assessmentId, loadAssessment])

  const handleEditQuestion = (question: AssessmentQuestion) => {
    setEditingQuestion(question.id)
    const options = question.options as string[]
    setEditForm({
      question_text: question.question_text,
      options: options,
      order_index: question.order_index,
    })
  }

  const handleSaveQuestion = async () => {
    if (!editingQuestion) return

    try {
      await assessmentService.updateQuestion(editingQuestion, {
        question_text: editForm.question_text,
        options: JSON.stringify(editForm.options.filter(opt => opt.trim())),
      })
      setEditingQuestion(null)
      loadAssessment()
    } catch (error) {
      console.error('Error updating question:', error)
    }
  }

  const handleDeleteQuestion = async (questionId: string) => {
    if (confirm('Are you sure you want to delete this question?')) {
      try {
        await assessmentService.deleteQuestion(questionId)
        loadAssessment()
      } catch (error) {
        console.error('Error deleting question:', error)
      }
    }
  }

  const handleAddQuestion = async () => {
    try {
      const newQuestion = {
        template_id: assessmentId,
        question_text: 'New question',
        question_type: 'multiple_choice' as const,
        options: JSON.stringify(['Option 1', 'Option 2', 'Option 3', 'Option 4']),
        order_index: questions.length + 1,
        is_required: true,
        scoring_weights: null,
        archetype_indicators: null,
        metadata: null,
      }
      await assessmentService.createQuestion(newQuestion)
      loadAssessment()
    } catch (error) {
      console.error('Error adding question:', error)
    }
  }

  const updateOptionText = (index: number, value: string) => {
    const newOptions = [...editForm.options]
    newOptions[index] = value
    setEditForm(prev => ({ ...prev, options: newOptions }))
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="container mx-auto">
          <div className="text-center text-white">Loading assessment...</div>
        </div>
      </div>
    )
  }

  if (!assessment) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
        <div className="container mx-auto">
          <div className="text-center text-white">Assessment not found</div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8">
      <div className="container mx-auto max-w-4xl">
        <div className="flex items-center gap-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => router.push('/admin')}
            className="text-white hover:bg-slate-700"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">{assessment.name}</h1>
            <p className="text-gray-400">Edit assessment questions</p>
          </div>
          <Badge variant="outline" className="border-teal-600 text-teal-400">
            {questions.length} questions
          </Badge>
        </div>

        <div className="space-y-6">
          {questions.map((question, index) => (
            <Card key={question.id} className="bg-slate-800/50 border-slate-700">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg text-white flex items-center gap-2">
                    <GripVertical className="h-4 w-4 text-gray-400" />
                    Question {index + 1}
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleEditQuestion(question)}
                      className="text-white hover:bg-slate-700"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => handleDeleteQuestion(question.id)}
                      className="text-red-400 hover:bg-red-900/20"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {editingQuestion === question.id ? (
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="question_text" className="text-white">Question Text</Label>
                      <Textarea
                        id="question_text"
                        value={editForm.question_text}
                        onChange={(e) => setEditForm(prev => ({ ...prev, question_text: e.target.value }))}
                        className="bg-slate-700 border-slate-600 text-white"
                        rows={3}
                      />
                    </div>
                    <div>
                      <Label className="text-white">Answer Options</Label>
                      <div className="space-y-2">
                        {editForm.options.map((option, idx) => (
                          <Input
                            key={idx}
                            value={option}
                            onChange={(e) => updateOptionText(idx, e.target.value)}
                            placeholder={`Option ${idx + 1}`}
                            className="bg-slate-700 border-slate-600 text-white"
                          />
                        ))}
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={handleSaveQuestion}
                        className="bg-teal-600 hover:bg-teal-700 text-white"
                      >
                        <Save className="h-4 w-4 mr-2" />
                        Save Changes
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => setEditingQuestion(null)}
                        className="border-slate-600 text-white hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <p className="text-white font-medium">{question.question_text}</p>
                    <div className="space-y-2">
                      {(question.options as string[]).map((option: string, idx: number) => (
                        <div key={idx} className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full border-2 border-slate-600 flex items-center justify-center">
                            <span className="text-xs text-gray-400">{idx + 1}</span>
                          </div>
                          <span className="text-gray-300">{option}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          <Card className="bg-slate-800/30 border-slate-700 border-dashed">
            <CardContent className="p-8 text-center">
              <Button
                onClick={handleAddQuestion}
                className="bg-teal-600 hover:bg-teal-700 text-white"
              >
                <Plus className="h-4 w-4 mr-2" />
                Add New Question
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
} 