'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Bell, Shield, Palette } from 'lucide-react'

interface SimpleSettingsViewProps {
  userId: string
}

export function SimpleSettingsView({ userId }: SimpleSettingsViewProps) {
  return (
    <div className="w-full h-full bg-gray-50/30">
      <div className="p-6 space-y-6 max-w-4xl mx-auto">
        <div>
          <h1 className="text-xl font-medium text-gray-900 mb-2">Settings</h1>
          <p className="text-sm text-gray-500">Manage your account preferences and settings</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <User className="h-4 w-4" />
                Profile Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Display Name</label>
                <input
                  type="text"
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-sm"
                  placeholder="Your display name"
                />
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Email</label>
                <input
                  type="email"
                  className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-sm"
                  placeholder="your.email@example.com"
                />
              </div>
              <Button className="w-full h-8 text-sm">
                Update Profile
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Bell className="h-4 w-4" />
                Notifications
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Email Notifications</p>
                  <p className="text-xs text-gray-500">Receive updates via email</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Task Reminders</p>
                  <p className="text-xs text-gray-500">Get reminded about upcoming tasks</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-700">Assessment Updates</p>
                  <p className="text-xs text-gray-500">Notifications about new assessments</p>
                </div>
                <input type="checkbox" className="rounded" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Shield className="h-4 w-4" />
                Privacy & Security
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button variant="outline" className="w-full h-8 text-sm">
                Change Password
              </Button>
              <Button variant="outline" className="w-full h-8 text-sm">
                Download My Data
              </Button>
              <Button variant="destructive" className="w-full h-8 text-sm">
                Delete Account
              </Button>
            </CardContent>
          </Card>

          <Card className="bg-white/60 backdrop-blur-sm border-gray-200/50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Palette className="h-4 w-4" />
                Appearance
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium text-gray-700">Theme</label>
                <select className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-sm">
                  <option>Light</option>
                  <option>Dark</option>
                  <option>System</option>
                </select>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-700">Language</label>
                <select className="mt-1 block w-full px-3 py-2 border border-gray-200 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white/80 text-sm">
                  <option>English</option>
                  <option>Spanish</option>
                  <option>French</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
