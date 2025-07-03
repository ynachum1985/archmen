import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // For now, allow access if logged in
  // In production, you would check for admin role here
  if (!user) {
    redirect('/login')
  }

  // Optional: Check for admin role
  // const { data: profile } = await supabase
  //   .from('profiles')
  //   .select('role')
  //   .eq('id', user.id)
  //   .single()
  // 
  // if (profile?.role !== 'admin') {
  //   redirect('/')
  // }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 