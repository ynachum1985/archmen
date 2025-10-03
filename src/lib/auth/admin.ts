import { createClient } from '@/lib/supabase/server'
import { NextRequest, NextResponse } from 'next/server'

/**
 * Check if the current user is authenticated and has admin privileges
 * @returns Promise<{user: User, isAdmin: boolean} | null>
 */
export async function checkAdminAuth() {
  try {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      return null
    }

    // Check admin status
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', user.id)
      .single()

    if (profileError || !profile) {
      return { user, isAdmin: false }
    }

    return { user, isAdmin: profile.is_admin || false }
  } catch (error) {
    console.error('Error checking admin auth:', error)
    return null
  }
}

/**
 * Middleware for API routes that require admin authentication
 * @param handler - The API route handler
 * @returns Protected API route handler
 */
export function withAdminAuth(
  handler: (request: NextRequest, user: any) => Promise<NextResponse>
) {
  return async (request: NextRequest): Promise<NextResponse> => {
    const authResult = await checkAdminAuth()

    if (!authResult) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      )
    }

    if (!authResult.isAdmin) {
      return NextResponse.json(
        { error: 'Admin privileges required' },
        { status: 403 }
      )
    }

    return handler(request, authResult.user)
  }
}

/**
 * Check if a user ID has admin privileges
 * @param userId - The user ID to check
 * @returns Promise<boolean>
 */
export async function isUserAdmin(userId: string): Promise<boolean> {
  try {
    const supabase = await createClient()
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('is_admin')
      .eq('id', userId)
      .single()

    if (error || !profile) {
      return false
    }

    return profile.is_admin || false
  } catch (error) {
    console.error('Error checking user admin status:', error)
    return false
  }
}
