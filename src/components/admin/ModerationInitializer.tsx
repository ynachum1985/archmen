"use client"

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle, Settings } from 'lucide-react'

export function ModerationInitializer() {
  const [isInitializing, setIsInitializing] = useState(false)
  const [initStatus, setInitStatus] = useState<'idle' | 'success' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const initializeModeration = async () => {
    setIsInitializing(true)
    setInitStatus('idle')
    setErrorMessage('')

    try {
      const response = await fetch('/api/init-moderation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const data = await response.json()
        setInitStatus('success')
        console.log('Moderation initialized:', data.message)
        
        // Refresh the page after a short delay to load the new settings
        setTimeout(() => {
          window.location.reload()
        }, 1500)
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to initialize moderation settings')
      }
    } catch (error) {
      console.error('Error initializing moderation:', error)
      setInitStatus('error')
      setErrorMessage(error instanceof Error ? error.message : 'Unknown error occurred')
    } finally {
      setIsInitializing(false)
    }
  }

  return (
    <Card className="border-orange-200 bg-orange-50">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-orange-800">
          <AlertCircle className="h-5 w-5" />
          Moderation Settings Not Found
        </CardTitle>
        <CardDescription className="text-orange-600">
          Initialize default moderation settings and patterns to enable content safety features.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {initStatus === 'success' && (
            <div className="flex items-center gap-2 text-green-600 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="h-4 w-4" />
              <span className="text-sm">Moderation settings initialized successfully! Refreshing page...</span>
            </div>
          )}
          
          {initStatus === 'error' && (
            <div className="flex items-center gap-2 text-red-600 bg-red-50 p-3 rounded-lg">
              <AlertCircle className="h-4 w-4" />
              <span className="text-sm">Error: {errorMessage}</span>
            </div>
          )}

          <div className="text-sm text-orange-700">
            <p className="mb-2">This will create:</p>
            <ul className="list-disc list-inside space-y-1 ml-4">
              <li>Default OpenAI and Perspective API thresholds</li>
              <li>Auto-block and human review categories</li>
              <li>Relationship-specific moderation patterns</li>
              <li>Notification settings</li>
            </ul>
          </div>

          <Button 
            onClick={initializeModeration}
            disabled={isInitializing || initStatus === 'success'}
            className="bg-orange-600 hover:bg-orange-700"
          >
            {isInitializing ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Initializing...
              </>
            ) : (
              <>
                <Settings className="h-4 w-4 mr-2" />
                Initialize Moderation Settings
              </>
            )}
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
