import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

// Force dynamic rendering - don't prerender admin pages
export const dynamic = 'force-dynamic'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // ✅ SECURITY: Check authentication and admin status
  const supabase = await createClient()

  // Handle build-time scenario where Supabase client might be null
  if (!supabase) {
    // During build, just render the children without auth check
    return <div className="min-h-screen bg-background">{children}</div>
  }

  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    redirect('/login')
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', user.id)
    .single()

  if (!profile?.is_admin) {
    redirect('/dashboard') // Redirect non-admins to dashboard
  }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}