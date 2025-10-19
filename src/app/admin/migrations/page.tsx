'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { AlertCircle, CheckCircle, Database, Play, Loader2 } from 'lucide-react'

interface MigrationResult {
  success: boolean
  message: string
  details: string
}

export default function MigrationsPage() {
  const [runningMigration, setRunningMigration] = useState<string | null>(null)
  const [migrationResults, setMigrationResults] = useState<Record<string, MigrationResult>>({})

  const migrations = [
    {
      name: 'assessment_levels_and_gateways',
      title: 'Assessment Levels & Gateways',
      description: 'Creates the assessment level system and gateway templates table',
      required: true
    },
    {
      name: 'conversational_gateway_quiz',
      title: 'Conversational Gateway Quiz',
      description: 'Adds quiz prompt fields and creates quiz tracking tables',
      required: true
    },
    {
      name: 'update_existing_assessments',
      title: 'Update Existing Assessments',
      description: 'Updates existing assessments with default level and quiz settings',
      required: false
    }
  ]

  const runMigration = async (migrationName: string) => {
    setRunningMigration(migrationName)
    
    try {
      const response = await fetch('/api/run-migrations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ migration_name: migrationName })
      })

      const result = await response.json()
      
      setMigrationResults(prev => ({
        ...prev,
        [migrationName]: result
      }))
    } catch (error) {
      setMigrationResults(prev => ({
        ...prev,
        [migrationName]: {
          success: false,
          message: 'Migration failed',
          details: error instanceof Error ? error.message : 'Unknown error'
        }
      }))
    } finally {
      setRunningMigration(null)
    }
  }

  const runAllMigrations = async () => {
    for (const migration of migrations) {
      if (migration.required) {
        await runMigration(migration.name)
        // Small delay between migrations
        await new Promise(resolve => setTimeout(resolve, 1000))
      }
    }
  }

  return (
    <div className="container mx-auto p-6 max-w-4xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Database Migrations</h1>
        <p className="text-gray-600">
          Run these migrations to set up the conversational gateway quiz system and assessment levels.
          <span className="text-green-600 font-medium">✅ Database migrations have been completed via Supabase!</span>
        </p>
      </div>

      <div className="mb-6">
        <Card className="border-blue-200 bg-blue-50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-800">
              <AlertCircle className="h-5 w-5" />
              Important Setup Information
            </CardTitle>
          </CardHeader>
          <CardContent className="text-blue-700">
            <div className="space-y-2">
              <p>
                <strong>Before running migrations:</strong> Make sure you're connected to the correct Supabase project.
              </p>
              <p>
                <strong>Required migrations:</strong> Run the required migrations in order to enable the conversational gateway quiz system.
              </p>
              <p>
                <strong>Safe to re-run:</strong> These migrations use IF NOT EXISTS clauses and are safe to run multiple times.
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mb-6">
        <Button 
          onClick={runAllMigrations}
          disabled={runningMigration !== null}
          className="flex items-center gap-2"
        >
          {runningMigration ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Play className="h-4 w-4" />
          )}
          Run All Required Migrations
        </Button>
      </div>

      <div className="space-y-4">
        <>
          {migrations.map((migration) => {
            const result = migrationResults[migration.name]
            const isRunning = runningMigration === migration.name

            return (
              <Card key={migration.name} className="relative">
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="flex items-center gap-2">
                      <Database className="h-5 w-5" />
                      {migration.title}
                      {migration.required && (
                        <Badge variant="destructive" className="text-xs">Required</Badge>
                      )}
                    </CardTitle>
                    <CardDescription>{migration.description}</CardDescription>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {result && (
                      <div className="flex items-center gap-1">
                        {result.success ? (
                          <CheckCircle className="h-5 w-5 text-green-600" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-red-600" />
                        )}
                      </div>
                    )}
                    
                    <Button
                      onClick={() => runMigration(migration.name)}
                      disabled={isRunning || runningMigration !== null}
                      variant={result?.success ? "outline" : "default"}
                      size="sm"
                    >
                      {isRunning ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin mr-2" />
                          Running...
                        </>
                      ) : result?.success ? (
                        'Re-run'
                      ) : (
                        'Run Migration'
                      )}
                    </Button>
                  </div>
                </div>
              </CardHeader>
              
              {result && (
                <CardContent>
                  <div className={`p-3 rounded-lg ${
                    result.success 
                      ? 'bg-green-50 border border-green-200' 
                      : 'bg-red-50 border border-red-200'
                  }`}>
                    <div className="flex items-start gap-2">
                      {result.success ? (
                        <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                      ) : (
                        <AlertCircle className="h-5 w-5 text-red-600 mt-0.5" />
                      )}
                      <div>
                        <p className={`font-medium ${
                          result.success ? 'text-green-800' : 'text-red-800'
                        }`}>
                          {result.message}
                        </p>
                        {result.details && (
                          <p className={`text-sm mt-1 ${
                            result.success ? 'text-green-700' : 'text-red-700'
                          }`}>
                            {result.details}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              )}
            </Card>
          )
          })}
        </>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Next Steps</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 text-sm text-gray-600">
              <p>1. Run the required migrations above</p>
              <p>2. Go to the Assessment Builder to create or edit assessments</p>
              <p>3. Configure the Assessment Gateways tab with quiz prompts</p>
              <p>4. Test the conversational gateway quiz system</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
