'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Shield, Eye, TrendingUp, Users, MessageSquare } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

interface ModerationIncident {
  id: string
  content_hash: string
  flagged_categories: string[]
  confidence: number
  action_taken: string
  reasoning: string
  user_id: string
  assessment_id?: string
  conversation_type?: string
  created_at: string
  reviewed_by?: string
  reviewed_at?: string
  review_decision?: string
  review_notes?: string
}

interface ModerationStats {
  total_incidents: number
  blocked_content: number
  flagged_content: number
  human_reviews: number
  top_categories: Array<{ category: string; count: number }>
  incidents_by_day: Array<{ date: string; count: number }>
}

export default function ModerationDashboard() {
  const [incidents, setIncidents] = useState<ModerationIncident[]>([])
  const [stats, setStats] = useState<ModerationStats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedIncident, setSelectedIncident] = useState<ModerationIncident | null>(null)

  useEffect(() => {
    loadModerationData()
  }, [])

  const loadModerationData = async () => {
    try {
      const supabase = createClient()
      
      // Load recent incidents
      const { data: incidentsData } = await supabase
        .from('moderation_incidents')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50)

      // Load stats
      const { data: statsData } = await supabase
        .rpc('get_moderation_stats')

      setIncidents(incidentsData || [])
      setStats(statsData?.[0] || null)
    } catch (error) {
      console.error('Failed to load moderation data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReviewIncident = async (incidentId: string, decision: string, notes?: string) => {
    try {
      const supabase = createClient()
      
      await supabase
        .from('moderation_incidents')
        .update({
          reviewed_by: (await supabase.auth.getUser()).data.user?.id,
          reviewed_at: new Date().toISOString(),
          review_decision: decision,
          review_notes: notes
        })
        .eq('id', incidentId)

      // Reload data
      loadModerationData()
      setSelectedIncident(null)
    } catch (error) {
      console.error('Failed to review incident:', error)
    }
  }

  const getActionBadgeColor = (action: string) => {
    switch (action) {
      case 'block': return 'destructive'
      case 'flag': return 'secondary'
      case 'human_review': return 'outline'
      default: return 'default'
    }
  }

  const getCategoryBadgeColor = (category: string) => {
    const criticalCategories = ['relationship_abuse', 'manipulation', 'violence', 'harassment_threatening']
    const highCategories = ['misogyny', 'toxic_masculinity', 'harassment']
    
    if (criticalCategories.includes(category)) return 'destructive'
    if (highCategories.includes(category)) return 'secondary'
    return 'outline'
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <Shield className="h-8 w-8 animate-spin mx-auto mb-2" />
          <p>Loading moderation dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Content Moderation Dashboard</h2>
          <p className="text-muted-foreground">Monitor and review AI-flagged content</p>
        </div>
        <Button onClick={loadModerationData} variant="outline">
          <Shield className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Stats Overview */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Incidents</CardTitle>
              <AlertTriangle className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.total_incidents}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Blocked Content</CardTitle>
              <Shield className="h-4 w-4 text-destructive" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.blocked_content}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Flagged Content</CardTitle>
              <Eye className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.flagged_content}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Human Reviews</CardTitle>
              <Users className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.human_reviews}</div>
            </CardContent>
          </Card>
        </div>
      )}

      <Tabs defaultValue="incidents" className="space-y-4">
        <TabsList>
          <TabsTrigger value="incidents">Recent Incidents</TabsTrigger>
          <TabsTrigger value="categories">Top Categories</TabsTrigger>
          <TabsTrigger value="trends">Trends</TabsTrigger>
        </TabsList>

        <TabsContent value="incidents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Recent Moderation Incidents</CardTitle>
              <CardDescription>
                Content flagged by AI moderation systems
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {incidents.map((incident) => (
                  <div
                    key={incident.id}
                    className="border rounded-lg p-4 hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedIncident(incident)}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center space-x-2">
                        <Badge variant={getActionBadgeColor(incident.action_taken)}>
                          {incident.action_taken}
                        </Badge>
                        <span className="text-sm text-muted-foreground">
                          Confidence: {(incident.confidence * 100).toFixed(0)}%
                        </span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {new Date(incident.created_at).toLocaleDateString()}
                      </span>
                    </div>
                    
                    <div className="flex flex-wrap gap-1 mb-2">
                      {incident.flagged_categories.map((category) => (
                        <Badge
                          key={category}
                          variant={getCategoryBadgeColor(category)}
                          className="text-xs"
                        >
                          {category.replace('_', ' ')}
                        </Badge>
                      ))}
                    </div>
                    
                    {incident.reasoning && (
                      <p className="text-sm text-muted-foreground">
                        {incident.reasoning}
                      </p>
                    )}
                    
                    {incident.conversation_type && (
                      <div className="flex items-center mt-2 text-xs text-muted-foreground">
                        <MessageSquare className="h-3 w-3 mr-1" />
                        {incident.conversation_type}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="categories" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Top Flagged Categories</CardTitle>
              <CardDescription>
                Most common content violations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.top_categories && (
                <div className="space-y-2">
                  {stats.top_categories.map((item, index) => (
                    <div key={item.category} className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-medium">#{index + 1}</span>
                        <Badge variant={getCategoryBadgeColor(item.category)}>
                          {item.category.replace('_', ' ')}
                        </Badge>
                      </div>
                      <span className="text-sm font-bold">{item.count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="trends" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Moderation Trends</CardTitle>
              <CardDescription>
                Incidents over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              {stats?.incidents_by_day && (
                <div className="space-y-2">
                  {stats.incidents_by_day.map((item) => (
                    <div key={item.date} className="flex items-center justify-between">
                      <span className="text-sm">{item.date}</span>
                      <span className="text-sm font-bold">{item.count} incidents</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Incident Review Modal */}
      {selectedIncident && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto">
            <CardHeader>
              <CardTitle>Review Moderation Incident</CardTitle>
              <CardDescription>
                Incident ID: {selectedIncident.id}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Action Taken</h4>
                <Badge variant={getActionBadgeColor(selectedIncident.action_taken)}>
                  {selectedIncident.action_taken}
                </Badge>
              </div>

              <div>
                <h4 className="font-medium mb-2">Flagged Categories</h4>
                <div className="flex flex-wrap gap-1">
                  {selectedIncident.flagged_categories.map((category) => (
                    <Badge
                      key={category}
                      variant={getCategoryBadgeColor(category)}
                    >
                      {category.replace('_', ' ')}
                    </Badge>
                  ))}
                </div>
              </div>

              <div>
                <h4 className="font-medium mb-2">AI Reasoning</h4>
                <p className="text-sm text-muted-foreground">
                  {selectedIncident.reasoning}
                </p>
              </div>

              <div>
                <h4 className="font-medium mb-2">Confidence Score</h4>
                <p className="text-sm">
                  {(selectedIncident.confidence * 100).toFixed(1)}%
                </p>
              </div>

              <div className="flex space-x-2 pt-4">
                <Button
                  onClick={() => handleReviewIncident(selectedIncident.id, 'approved')}
                  variant="outline"
                >
                  Approve
                </Button>
                <Button
                  onClick={() => handleReviewIncident(selectedIncident.id, 'rejected')}
                  variant="destructive"
                >
                  Reject
                </Button>
                <Button
                  onClick={() => setSelectedIncident(null)}
                  variant="ghost"
                >
                  Close
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
