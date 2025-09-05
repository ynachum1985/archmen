'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/services/auth.service'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { User, LogOut, Brain, BookOpen, Settings } from 'lucide-react'
import Link from 'next/link'

interface UserProfile {
  user: {
    id: string
    email?: string
    user_metadata: {
      full_name?: string
    }
  }
  profile: {
    id: string
    email: string
    full_name: string | null
    subscription_status: string | null
    created_at: string | null
    avatar_url: string | null
    stripe_customer_id: string | null
    subscription_end_date: string | null
    updated_at: string | null
  } | null
}

const authService = new AuthService()

export default function DashboardPage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const loadUserProfile = async () => {
      try {
        const profile = await authService.getCurrentUser()
        if (!profile) {
          router.push('/login')
          return
        }
        setUserProfile(profile)
      } catch (error) {
        console.error('Failed to load user profile:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  const handleSignOut = async () => {
    try {
      await authService.signOut()
      router.push('/')
    } catch (error) {
      console.error('Failed to sign out:', error)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your dashboard...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return null // Will redirect to login
  }

  const displayName = userProfile.profile?.full_name ||
                     userProfile.user.user_metadata.full_name ||
                     userProfile.user.email || 'User'

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Welcome back, {displayName}!</h1>
            <p className="text-slate-600 mt-1">Your archetypal journey continues here</p>
          </div>
          <div className="flex items-center gap-4">
            <Badge variant={userProfile.profile?.subscription_status === 'free' || !userProfile.profile?.subscription_status ? 'secondary' : 'default'}>
              {userProfile.profile?.subscription_status || 'free'} plan
            </Badge>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign out
            </Button>
          </div>
        </div>

        {/* Profile Card */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Profile</CardTitle>
              <User className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{displayName}</div>
              <p className="text-xs text-muted-foreground">{userProfile.user.email || 'No email'}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Member since {userProfile.profile?.created_at ? new Date(userProfile.profile.created_at).toLocaleDateString() : 'Unknown'}
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Assessments</CardTitle>
              <Brain className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Completed assessments</p>
              <Link href="/chat" className="text-xs text-primary hover:underline mt-1 block">
                Start your first assessment →
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Courses</CardTitle>
              <BookOpen className="h-4 w-4 ml-auto text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">0</div>
              <p className="text-xs text-muted-foreground">Courses in progress</p>
              <Link href="/courses" className="text-xs text-primary hover:underline mt-1 block">
                Browse courses →
              </Link>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/chat">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5 text-primary" />
                  Take Assessment
                </CardTitle>
                <CardDescription>
                  Discover your dominant archetypes through our AI-powered assessment
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/courses">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5 text-primary" />
                  Explore Courses
                </CardTitle>
                <CardDescription>
                  Learn about shadow work and archetypal development
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer">
            <Link href="/profile">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Settings className="h-5 w-5 text-primary" />
                  Profile Settings
                </CardTitle>
                <CardDescription>
                  Manage your account and subscription preferences
                </CardDescription>
              </CardHeader>
            </Link>
          </Card>
        </div>

        {/* Welcome Message for New Users */}
        <Card className="mt-8 bg-gradient-to-r from-primary/10 to-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>Welcome to ArchMen!</CardTitle>
            <CardDescription>
              Ready to discover your archetypal patterns? Here&apos;s how to get started:
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">1</span>
              Take your first assessment to identify your dominant archetypes
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">2</span>
              Review your personalized archetype analysis and shadow patterns
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-xs font-bold">3</span>
              Explore courses designed for your specific archetypal profile
            </div>
            <div className="pt-4">
              <Link href="/chat">
                <Button className="w-full sm:w-auto">
                  Start Your Journey
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
