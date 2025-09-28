import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

// Rate limiting store (in production, use Redis or similar)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>()

// Rate limiting configuration
const RATE_LIMIT_WINDOW = 60 * 1000 // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 60 // 60 requests per minute

// API Error class for consistent error handling
export class APIError extends Error {
  constructor(
    public message: string,
    public statusCode: number = 500,
    public code?: string
  ) {
    super(message)
    this.name = 'APIError'
  }
}

// Rate limiting middleware
export function rateLimit(identifier: string): boolean {
  const now = Date.now()
  const userLimit = rateLimitStore.get(identifier)

  if (!userLimit || now > userLimit.resetTime) {
    // Reset or create new limit
    rateLimitStore.set(identifier, {
      count: 1,
      resetTime: now + RATE_LIMIT_WINDOW
    })
    return true
  }

  if (userLimit.count >= RATE_LIMIT_MAX_REQUESTS) {
    return false
  }

  userLimit.count++
  return true
}

// Get client IP for rate limiting
export function getClientIP(request: NextRequest): string {
  const forwarded = request.headers.get('x-forwarded-for')
  const realIP = request.headers.get('x-real-ip')
  
  if (forwarded) {
    return forwarded.split(',')[0].trim()
  }
  
  if (realIP) {
    return realIP
  }
  
  return 'unknown'
}

// Validation middleware
export async function validateRequest<T>(
  request: NextRequest,
  schema: z.ZodSchema<T>
): Promise<{ data: T; error?: never } | { data?: never; error: NextResponse }> {
  try {
    // Check rate limiting
    const clientIP = getClientIP(request)
    if (!rateLimit(clientIP)) {
      return {
        error: NextResponse.json(
          { 
            error: 'Rate limit exceeded',
            message: 'Too many requests. Please try again later.',
            code: 'RATE_LIMIT_EXCEEDED'
          },
          { status: 429 }
        )
      }
    }

    // Parse and validate request body
    const body = await request.json()
    const validatedData = schema.parse(body)

    return { data: validatedData }
  } catch (error) {
    if (error instanceof z.ZodError) {
      return {
        error: NextResponse.json(
          {
            error: 'Validation failed',
            message: 'Invalid request data',
            details: error.errors.map(err => ({
              field: err.path.join('.'),
              message: err.message,
              code: err.code
            })),
            code: 'VALIDATION_ERROR'
          },
          { status: 400 }
        )
      }
    }

    if (error instanceof SyntaxError) {
      return {
        error: NextResponse.json(
          {
            error: 'Invalid JSON',
            message: 'Request body must be valid JSON',
            code: 'INVALID_JSON'
          },
          { status: 400 }
        )
      }
    }

    return {
      error: NextResponse.json(
        {
          error: 'Internal server error',
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

// Error handler wrapper for API routes
export function withErrorHandler(
  handler: (request: NextRequest) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    try {
      return await handler(request)
    } catch (error) {
      console.error('API Error:', error)

      if (error instanceof APIError) {
        return NextResponse.json(
          {
            error: error.message,
            code: error.code,
            statusCode: error.statusCode
          },
          { status: error.statusCode }
        )
      }

      // Log unexpected errors for monitoring
      console.error('Unexpected API error:', {
        error: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        url: request.url,
        method: request.method,
        timestamp: new Date().toISOString()
      })

      return NextResponse.json(
        {
          error: 'Internal server error',
          message: 'An unexpected error occurred',
          code: 'INTERNAL_ERROR'
        },
        { status: 500 }
      )
    }
  }
}

// CORS headers for API responses
export function addCORSHeaders(response: NextResponse): NextResponse {
  response.headers.set('Access-Control-Allow-Origin', '*')
  response.headers.set('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
  response.headers.set('Access-Control-Allow-Headers', 'Content-Type, Authorization')
  return response
}

// Security headers for API responses
export function addSecurityHeaders(response: NextResponse): NextResponse {
  response.headers.set('X-Content-Type-Options', 'nosniff')
  response.headers.set('X-Frame-Options', 'DENY')
  response.headers.set('X-XSS-Protection', '1; mode=block')
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin')
  return response
}

// Combined middleware for API routes
export function withAPIMiddleware<T>(
  schema: z.ZodSchema<T>,
  handler: (request: NextRequest, data: T) => Promise<NextResponse>
) {
  return withErrorHandler(async (request: NextRequest) => {
    // Handle OPTIONS requests for CORS
    if (request.method === 'OPTIONS') {
      return addCORSHeaders(new NextResponse(null, { status: 200 }))
    }

    // Validate request
    const validation = await validateRequest(request, schema)
    if (validation.error) {
      return addSecurityHeaders(addCORSHeaders(validation.error))
    }

    // Call handler with validated data
    const response = await handler(request, validation.data)
    
    // Add security and CORS headers
    return addSecurityHeaders(addCORSHeaders(response))
  })
}
