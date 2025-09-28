import { z } from 'zod'

// Chat API validation schemas
export const conversationChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  conversationId: z.string().uuid('Invalid conversation ID'),
  assessmentId: z.string().uuid('Invalid assessment ID'),
  userId: z.string().uuid('Invalid user ID'),
})

export const enhancedChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  provider: z.enum(['openai', 'anthropic', 'google']).optional(),
  model: z.string().optional(),
  temperature: z.number().min(0).max(2).optional(),
  maxTokens: z.number().min(1).max(4000).optional(),
})

export const basicChatSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  conversationId: z.string().optional(),
})

// Assessment API validation schemas
export const createAssessmentSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(500, 'Description too long'),
  category: z.string().min(1, 'Category is required'),
  level: z.number().int().min(1).max(3),
  system_prompt: z.string().min(1, 'System prompt is required'),
  min_questions: z.number().int().min(1).max(50),
  max_questions: z.number().int().min(1).max(50),
  evidence_threshold: z.number().min(0).max(1),
  adaptation_sensitivity: z.number().min(0).max(1),
})

export const updateAssessmentSchema = createAssessmentSchema.partial().extend({
  id: z.string().uuid('Invalid assessment ID'),
})

// User management validation schemas
export const createUserSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name too long'),
})

export const updateUserSchema = z.object({
  id: z.string().uuid('Invalid user ID'),
  email: z.string().email('Invalid email address').optional(),
  full_name: z.string().min(1, 'Full name is required').max(100, 'Name too long').optional(),
  is_active: z.boolean().optional(),
})

// Task validation schemas
export const createTaskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().max(1000, 'Description too long').optional(),
  due_date: z.string().datetime('Invalid date format').optional(),
  assessment_id: z.string().uuid('Invalid assessment ID'),
  user_id: z.string().uuid('Invalid user ID'),
})

export const updateTaskSchema = createTaskSchema.partial().extend({
  id: z.string().uuid('Invalid task ID'),
  status: z.enum(['pending', 'in_progress', 'completed', 'cancelled']).optional(),
})

// Archetype validation schemas
export const createArchetypeSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  description: z.string().min(1, 'Description is required').max(1000, 'Description too long'),
  impact_score: z.number().int().min(1).max(7),
  growth_potential_score: z.number().int().min(1).max(7).optional(),
  awareness_difficulty_score: z.number().int().min(1).max(7).optional(),
  trigger_intensity_score: z.number().int().min(1).max(7).optional(),
  integration_complexity_score: z.number().int().min(1).max(7).optional(),
  shadow_depth_score: z.number().int().min(1).max(7).optional(),
})

export const updateArchetypeSchema = createArchetypeSchema.partial().extend({
  id: z.string().uuid('Invalid archetype ID'),
  is_active: z.boolean().optional(),
})

// Common validation helpers
export const uuidSchema = z.string().uuid('Invalid UUID format')
export const paginationSchema = z.object({
  page: z.number().int().min(1).default(1),
  limit: z.number().int().min(1).max(100).default(10),
})

// Type exports for use in API routes
export type ConversationChatRequest = z.infer<typeof conversationChatSchema>
export type EnhancedChatRequest = z.infer<typeof enhancedChatSchema>
export type BasicChatRequest = z.infer<typeof basicChatSchema>
export type CreateAssessmentRequest = z.infer<typeof createAssessmentSchema>
export type UpdateAssessmentRequest = z.infer<typeof updateAssessmentSchema>
export type CreateUserRequest = z.infer<typeof createUserSchema>
export type UpdateUserRequest = z.infer<typeof updateUserSchema>
export type CreateTaskRequest = z.infer<typeof createTaskSchema>
export type UpdateTaskRequest = z.infer<typeof updateTaskSchema>
export type CreateArchetypeRequest = z.infer<typeof createArchetypeSchema>
export type UpdateArchetypeRequest = z.infer<typeof updateArchetypeSchema>
export type PaginationRequest = z.infer<typeof paginationSchema>
