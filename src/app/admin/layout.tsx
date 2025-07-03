export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Authentication temporarily disabled for development
  // TODO: Re-enable authentication in production
  // const supabase = await createClient()
  // const { data: { user } } = await supabase.auth.getUser()
  // if (!user) {
  //   redirect('/login')
  // }

  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
} 