'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { AuthService } from '@/lib/services/auth.service'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Save } from 'lucide-react'
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

export default function ProfilePage() {
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null)
  const [fullName, setFullName] = useState('')
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
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
        setFullName(profile.profile?.full_name || profile.user.user_metadata.full_name || '')
      } catch (error) {
        console.error('Failed to load user profile:', error)
        router.push('/login')
      } finally {
        setIsLoading(false)
      }
    }

    loadUserProfile()
  }, [router])

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userProfile) return

    setIsSaving(true)
    setError('')
    setSuccess('')

    try {
      await authService.updateProfile(userProfile.user.id, {
        full_name: fullName
      })
      setSuccess('Profile updated successfully!')
      
      // Refresh the profile data
      const updatedProfile = await authService.getCurrentUser()
      if (updatedProfile) {
        setUserProfile(updatedProfile)
      }
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to update profile')
    } finally {
      setIsSaving(false)
    }
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your profile...</p>
        </div>
      </div>
    )
  }

  if (!userProfile) {
    return null // Will redirect to login
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-white">
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/dashboard" className="text-muted-foreground hover:text-primary">
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-slate-900">Profile Settings</h1>
            <p className="text-slate-600 mt-1">Manage your account information</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* Account Information */}
          <Card>
            <CardHeader>
              <CardTitle>Account Information</CardTitle>
              <CardDescription>
                Your basic account details and subscription status
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {error && (
                <div className="p-3 text-sm text-red-600 bg-red-50 border border-red-200 rounded-md">
                  {error}
                </div>
              )}

              {success && (
                <div className="p-3 text-sm text-green-600 bg-green-50 border border-green-200 rounded-md">
                  {success}
                </div>
              )}

              <form onSubmit={handleSaveProfile} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Enter your full name"
                    disabled={isSaving}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={userProfile.user.email || ''}
                    disabled
                    className="bg-muted"
                  />
                  <p className="text-xs text-muted-foreground">
                    Email cannot be changed. Contact support if you need to update your email.
                  </p>
                </div>

                <div className="space-y-2">
                  <Label>Subscription Status</Label>
                  <div>
                    <Badge variant={userProfile.profile?.subscription_status === 'free' || !userProfile.profile?.subscription_status ? 'secondary' : 'default'}>
                      {userProfile.profile?.subscription_status || 'free'} plan
                    </Badge>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Member Since</Label>
                  <p className="text-sm text-muted-foreground">
                    {userProfile.profile?.created_at ? new Date(userProfile.profile.created_at).toLocaleDateString('en-US', {
                      year: 'numeric',
                      month: 'long',
                      day: 'numeric'
                    }) : 'Unknown'}
                  </p>
                </div>

                <Button type="submit" disabled={isSaving} className="w-full sm:w-auto">
                  <Save className="h-4 w-4 mr-2" />
                  {isSaving ? 'Saving...' : 'Save Changes'}
                </Button>
              </form>
            </CardContent>
          </Card>

          {/* Subscription Management */}
          <Card>
            <CardHeader>
              <CardTitle>Subscription</CardTitle>
              <CardDescription>
                Manage your subscription and billing
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Current Plan</p>
                    <p className="text-sm text-muted-foreground">
                      {userProfile.profile?.subscription_status === 'free' || !userProfile.profile?.subscription_status
                        ? 'Free plan with limited features'
                        : `${userProfile.profile?.subscription_status} subscription`
                      }
                    </p>
                  </div>
                  <Badge variant={userProfile.profile?.subscription_status === 'free' || !userProfile.profile?.subscription_status ? 'secondary' : 'default'}>
                    {userProfile.profile?.subscription_status || 'free'}
                  </Badge>
                </div>
                
                {(userProfile.profile?.subscription_status === 'free' || !userProfile.profile?.subscription_status) && (
                  <div className="pt-4 border-t">
                    <Button variant="outline" className="w-full sm:w-auto">
                      Upgrade to Premium
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Danger Zone */}
          <Card className="border-red-200">
            <CardHeader>
              <CardTitle className="text-red-600">Danger Zone</CardTitle>
              <CardDescription>
                Irreversible and destructive actions
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="destructive" className="w-full sm:w-auto">
                Delete Account
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                This action cannot be undone. All your data will be permanently deleted.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
