'use client'

// Force dynamic rendering to avoid build-time Supabase client creation
export const dynamic = 'force-dynamic'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { ConversationDashboard } from '@/components/chat/ConversationDashboard'
import { Loader2 } from 'lucide-react'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const getUser = async () => {
      const supabase = createClient()
      const { data: { user }, error } = await supabase.auth.getUser()

      if (error) {
        console.error('Error getting user:', error)
        window.location.href = '/auth/login'
        return
      }

      if (!user) {
        window.location.href = '/auth/login'
        return
      }

      setUser(user)
      setLoading(false)
    }

    getUser()
  }, [])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50/30 flex items-center justify-center">
        <div className="flex items-center gap-3">
          <Loader2 className="h-6 w-6 animate-spin text-gray-600" />
          <span className="text-gray-600">Loading your conversations...</span>
        </div>
      </div>
    )
  }

  if (!user) {
    return null
  }

  return <ConversationDashboard userId={user.id} />
}
