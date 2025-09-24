'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Plus, Minus } from 'lucide-react'
import { NewAIPersonality } from '@/lib/services/ai-personality.service'

interface QuestionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  personality: NewAIPersonality
  onChange: (personality: NewAIPersonality) => void
}

export function QuestionsDialog({ open, onOpenChange, personality, onChange }: QuestionsDialogProps) {
  const addQuestion = (field: 'open_ended_questions' | 'clarifying_questions' | 'specific_questions') => {
    onChange({
      ...personality,
      [field]: [...(personality[field] || []), '']
    })
  }

  const updateQuestion = (
    field: 'open_ended_questions' | 'clarifying_questions' | 'specific_questions',
    index: number,
    value: string
  ) => {
    const questions = [...(personality[field] || [])]
    questions[index] = value
    onChange({
      ...personality,
      [field]: questions
    })
  }

  const removeQuestion = (
    field: 'open_ended_questions' | 'clarifying_questions' | 'specific_questions',
    index: number
  ) => {
    const questions = [...(personality[field] || [])]
    questions.splice(index, 1)
    onChange({
      ...personality,
      [field]: questions
    })
  }

  const renderQuestionSection = (
    field: 'open_ended_questions' | 'clarifying_questions' | 'specific_questions',
    title: string,
    placeholder: string
  ) => (
    <div className="space-y-3">
      <Label className="text-base font-medium">{title}</Label>
      {(personality[field] || []).map((question, index) => (
        <div key={index} className="flex gap-2">
          <Textarea
            value={question}
            onChange={(e) => updateQuestion(field, index, e.target.value)}
            placeholder={placeholder}
            className="flex-1"
            rows={2}
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => removeQuestion(field, index)}
            className="self-start mt-1"
          >
            <Minus className="h-4 w-4" />
          </Button>
        </div>
      ))}
      <Button
        variant="outline"
        onClick={() => addQuestion(field)}
        className="w-full"
      >
        <Plus className="h-4 w-4 mr-2" />
        Add {title.slice(0, -1)}
      </Button>
    </div>
  )

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Manage Questions</DialogTitle>
          <DialogDescription>
            Configure the three types of questions this AI personality will use.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {renderQuestionSection(
            'open_ended_questions',
            'Open-Ended Questions',
            'Enter an open-ended question that encourages detailed responses...'
          )}
          
          {renderQuestionSection(
            'clarifying_questions',
            'Clarifying Questions',
            'Enter a clarifying question to better understand responses...'
          )}
          
          {renderQuestionSection(
            'specific_questions',
            'Specific Questions',
            'Enter a specific question that requires a direct answer...'
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
