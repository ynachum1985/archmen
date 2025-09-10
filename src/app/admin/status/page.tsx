'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { assessmentIntegrationService } from "@/lib/services/assessment-integration.service"
import { 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  RefreshCw,
  Database,
  Settings,
  Home
} from 'lucide-react'

interface IntegrationStatus {
  hasEnhancedAssessments: boolean
  hasTemplates: boolean
  hasMainAssessment: boolean
  totalAssessments: number
  recommendedAction: string
}

export default function AdminStatusPage() {
  const [status, setStatus] = useState<IntegrationStatus | null>(null)
  const [loading, setLoading] = useState(true)
  const [lastChecked, setLastChecked] = useState<Date | null>(null)

  const checkStatus = async () => {
    setLoading(true)
    try {
      const integrationStatus = await assessmentIntegrationService.checkIntegrationStatus()
      setStatus(integrationStatus)
      setLastChecked(new Date())
    } catch (error) {
      console.error('Error checking status:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    checkStatus()
  }, [])

  const getStatusIcon = (hasFeature: boolean) => {
    return hasFeature ? (
      <CheckCircle className="h-5 w-5 text-green-500" />
    ) : (
      <XCircle className="h-5 w-5 text-red-500" />
    )
  }

  const getStatusBadge = (hasFeature: boolean) => {
    return hasFeature ? (
      <Badge className="bg-green-100 text-green-800">Active</Badge>
    ) : (
      <Badge variant="secondary" className="bg-red-100 text-red-800">Inactive</Badge>
    )
  }

  return (
    <div className="min-h-screen bg-white">
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-light text-gray-900">Assessment Integration Status</h1>
              <p className="text-gray-600 mt-2">Monitor the connection between Assessment Builder and Homepage</p>
            </div>
            <Button onClick={checkStatus} disabled={loading} className="bg-blue-600 hover:bg-blue-700">
              <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
              Refresh Status
            </Button>
          </div>
          
          {lastChecked && (
            <p className="text-sm text-gray-500 mt-2">
              Last checked: {lastChecked.toLocaleString()}
            </p>
          )}
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : status ? (
          <div className="space-y-6">
            {/* Overall Status */}
            <Alert className={`${status.hasMainAssessment ? 'border-green-600 bg-green-50' : 'border-orange-600 bg-orange-50'}`}>
              {status.hasMainAssessment ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <AlertCircle className="h-4 w-4 text-orange-600" />
              )}
              <AlertDescription className={status.hasMainAssessment ? 'text-green-800' : 'text-orange-800'}>
                <strong>Status:</strong> {status.recommendedAction}
              </AlertDescription>
            </Alert>

            {/* Integration Components */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Enhanced Assessments */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Settings className="h-5 w-5" />
                      Assessment Builder
                    </CardTitle>
                    {getStatusIcon(status.hasEnhancedAssessments)}
                  </div>
                  <CardDescription>Enhanced assessments from admin builder</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getStatusBadge(status.hasEnhancedAssessments)}
                    <p className="text-sm text-gray-600">
                      {status.hasEnhancedAssessments 
                        ? 'Assessment Builder is working and has created assessments'
                        : 'No assessments found from Assessment Builder'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Assessment Templates */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      Templates
                    </CardTitle>
                    {getStatusIcon(status.hasTemplates)}
                  </div>
                  <CardDescription>Legacy assessment templates</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getStatusBadge(status.hasTemplates)}
                    <p className="text-sm text-gray-600">
                      {status.hasTemplates 
                        ? 'Legacy templates available as fallback'
                        : 'No legacy templates found'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>

              {/* Main Assessment */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Home className="h-5 w-5" />
                      Homepage
                    </CardTitle>
                    {getStatusIcon(status.hasMainAssessment)}
                  </div>
                  <CardDescription>Main assessment for homepage</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {getStatusBadge(status.hasMainAssessment)}
                    <p className="text-sm text-gray-600">
                      {status.hasMainAssessment 
                        ? 'Main assessment is configured and ready'
                        : 'No main assessment found for homepage'
                      }
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Summary Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Integration Summary</CardTitle>
                <CardDescription>Overview of assessment system status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600">{status.totalAssessments}</div>
                    <div className="text-sm text-gray-600">Total Assessments</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {status.hasEnhancedAssessments ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Builder Active</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-purple-600">
                      {status.hasMainAssessment ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Main Assessment</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-orange-600">
                      {status.hasTemplates ? '✓' : '✗'}
                    </div>
                    <div className="text-sm text-gray-600">Fallback Ready</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Next Steps */}
            {!status.hasMainAssessment && (
              <Card className="border-blue-200 bg-blue-50">
                <CardHeader>
                  <CardTitle className="text-blue-800">Next Steps</CardTitle>
                  <CardDescription className="text-blue-600">
                    To complete the integration setup
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <p className="text-blue-800">
                      1. Go to the <strong>Assessment Builder</strong> tab in the admin panel
                    </p>
                    <p className="text-blue-800">
                      2. Create a new assessment and set the category to "main"
                    </p>
                    <p className="text-blue-800">
                      3. Configure the assessment with appropriate questions and logic
                    </p>
                    <p className="text-blue-800">
                      4. Save the assessment to make it available on the homepage
                    </p>
                    <Button className="bg-blue-600 hover:bg-blue-700 mt-3">
                      Go to Assessment Builder
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Alert className="border-red-600 bg-red-50">
            <XCircle className="h-4 w-4 text-red-600" />
            <AlertDescription className="text-red-800">
              Failed to load integration status. Please check your database connection.
            </AlertDescription>
          </Alert>
        )}
      </div>
    </div>
  )
}
