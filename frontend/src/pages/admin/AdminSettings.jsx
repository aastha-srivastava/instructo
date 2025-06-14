import React, { useState, useEffect } from 'react'
import { Save, Settings, Database, Bell, Users, Download } from 'lucide-react'
import { Button } from '../../components/ui/Button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Input } from '../../components/ui/Input'
import { Label } from '../../components/ui/Label'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/Tabs'
import { Badge } from '../../components/ui/Badge'
import { Textarea } from '../../components/ui/Textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../components/ui/Select'
import { useTheme } from '../../contexts/ThemeContext'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

function AdminSettings() {
  const { theme } = useTheme()
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)
  
  const [appSettings, setAppSettings] = useState({
    siteName: 'Instructo',
    siteDescription: 'Trainee Management System',
    maxFileSize: '10',
    allowedFileTypes: '.pdf,.doc,.docx,.jpg,.jpeg,.png',
    sessionTimeout: '24',
    maintenanceMode: false
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    approvalNotifications: true,
    progressNotifications: true,
    systemNotifications: true,
    emailFrequency: 'immediate'
  })

  const [backupSettings, setBackupSettings] = useState({
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: '30',
    backupLocation: 'local'
  })

  const [systemStats, setSystemStats] = useState({
    totalUsers: 0,
    totalTrainees: 0,
    activeProjects: 0,
    systemUptime: '99.9%',
    lastBackup: new Date().toISOString(),
    databaseSize: '145 MB'
  })

  useEffect(() => {
    fetchSystemStats()
  }, [])

  const fetchSystemStats = async () => {
    // Mock system stats - in real app this would come from API
    setSystemStats({
      totalUsers: 156,
      totalTrainees: 89,
      activeProjects: 34,
      systemUptime: '99.9%',
      lastBackup: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      databaseSize: '145 MB'
    })
  }

  const handleAppSettingsSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // In real app, this would call the API
      // await adminAPI.updateAppSettings(appSettings)
      console.log('App settings saved:', appSettings)
    } catch (error) {
      console.error('Failed to save app settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleNotificationSettingsSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // In real app, this would call the API
      // await adminAPI.updateNotificationSettings(notificationSettings)
      console.log('Notification settings saved:', notificationSettings)
    } catch (error) {
      console.error('Failed to save notification settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleBackupSettingsSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    try {
      // In real app, this would call the API
      // await adminAPI.updateBackupSettings(backupSettings)
      console.log('Backup settings saved:', backupSettings)
    } catch (error) {
      console.error('Failed to save backup settings:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleManualBackup = async () => {
    setSaving(true)
    try {
      // In real app, this would trigger a backup
      console.log('Manual backup initiated')
      setSystemStats(prev => ({
        ...prev,
        lastBackup: new Date().toISOString()
      }))
    } catch (error) {
      console.error('Failed to create backup:', error)
    } finally {
      setSaving(false)
    }
  }

  const handleExportData = async (type) => {
    setSaving(true)
    try {
      // In real app, this would export data
      console.log(`Exporting ${type} data`)
    } catch (error) {
      console.error(`Failed to export ${type} data:`, error)
    } finally {
      setSaving(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">System Settings</h1>
        <p className="text-muted-foreground">
          Configure application settings and system preferences.
        </p>
      </div>

      {/* System Overview Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">
              Admins + Instructors
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Trainees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.totalTrainees}</div>
            <p className="text-xs text-muted-foreground">
              Currently enrolled
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Projects</CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systemStats.activeProjects}</div>
            <p className="text-xs text-muted-foreground">
              In progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">System Uptime</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{systemStats.systemUptime}</div>
            <p className="text-xs text-muted-foreground">
              This month
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Settings Tabs */}
      <Tabs defaultValue="general">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="backup">Backup & Data</TabsTrigger>
          <TabsTrigger value="system">System Info</TabsTrigger>
        </TabsList>

        {/* General Settings Tab */}
        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Application Settings</CardTitle>
              <CardDescription>
                Configure general application settings and preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleAppSettingsSave} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="siteName">Site Name</Label>
                    <Input
                      id="siteName"
                      value={appSettings.siteName}
                      onChange={(e) => setAppSettings({ ...appSettings, siteName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="sessionTimeout">Session Timeout (hours)</Label>
                    <Input
                      id="sessionTimeout"
                      type="number"
                      value={appSettings.sessionTimeout}
                      onChange={(e) => setAppSettings({ ...appSettings, sessionTimeout: e.target.value })}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="siteDescription">Site Description</Label>
                  <Textarea
                    id="siteDescription"
                    value={appSettings.siteDescription}
                    onChange={(e) => setAppSettings({ ...appSettings, siteDescription: e.target.value })}
                    rows={3}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="maxFileSize">Max File Size (MB)</Label>
                    <Input
                      id="maxFileSize"
                      type="number"
                      value={appSettings.maxFileSize}
                      onChange={(e) => setAppSettings({ ...appSettings, maxFileSize: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="allowedFileTypes">Allowed File Types</Label>
                    <Input
                      id="allowedFileTypes"
                      value={appSettings.allowedFileTypes}
                      onChange={(e) => setAppSettings({ ...appSettings, allowedFileTypes: e.target.value })}
                      placeholder=".pdf,.doc,.docx,.jpg,.png"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="maintenanceMode"
                    checked={appSettings.maintenanceMode}
                    onChange={(e) => setAppSettings({ ...appSettings, maintenanceMode: e.target.checked })}
                    className="rounded"
                  />
                  <Label htmlFor="maintenanceMode">Enable Maintenance Mode</Label>
                </div>

                <Button type="submit" disabled={saving}>
                  <Save className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Tab */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Notification Settings</CardTitle>
              <CardDescription>
                Configure system-wide notification preferences.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleNotificationSettingsSave} className="space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Email Notifications</Label>
                      <p className="text-sm text-muted-foreground">Send email notifications to users</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.emailNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, emailNotifications: e.target.checked })}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Approval Notifications</Label>
                      <p className="text-sm text-muted-foreground">Notify when trainee approvals are needed</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.approvalNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, approvalNotifications: e.target.checked })}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Progress Notifications</Label>
                      <p className="text-sm text-muted-foreground">Notify when progress reports are shared</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.progressNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, progressNotifications: e.target.checked })}
                      className="rounded"
                    />
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>System Notifications</Label>
                      <p className="text-sm text-muted-foreground">Notify about system updates and maintenance</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={notificationSettings.systemNotifications}
                      onChange={(e) => setNotificationSettings({ ...notificationSettings, systemNotifications: e.target.checked })}
                      className="rounded"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="emailFrequency">Email Frequency</Label>
                  <Select
                    value={notificationSettings.emailFrequency}
                    onValueChange={(value) => setNotificationSettings({ ...notificationSettings, emailFrequency: value })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="immediate">Immediate</SelectItem>
                      <SelectItem value="hourly">Hourly Digest</SelectItem>
                      <SelectItem value="daily">Daily Digest</SelectItem>
                      <SelectItem value="weekly">Weekly Digest</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <Button type="submit" disabled={saving}>
                  <Bell className="h-4 w-4 mr-2" />
                  {saving ? 'Saving...' : 'Save Notification Settings'}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Backup & Data Tab */}
        <TabsContent value="backup">
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Backup Settings</CardTitle>
                <CardDescription>
                  Configure automatic backups and data retention.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleBackupSettingsSave} className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="space-y-0.5">
                      <Label>Automatic Backup</Label>
                      <p className="text-sm text-muted-foreground">Enable automatic system backups</p>
                    </div>
                    <input
                      type="checkbox"
                      checked={backupSettings.autoBackup}
                      onChange={(e) => setBackupSettings({ ...backupSettings, autoBackup: e.target.checked })}
                      className="rounded"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="backupFrequency">Backup Frequency</Label>
                      <Select
                        value={backupSettings.backupFrequency}
                        onValueChange={(value) => setBackupSettings({ ...backupSettings, backupFrequency: value })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="hourly">Hourly</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                          <SelectItem value="weekly">Weekly</SelectItem>
                          <SelectItem value="monthly">Monthly</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="retentionDays">Retention (Days)</Label>
                      <Input
                        id="retentionDays"
                        type="number"
                        value={backupSettings.retentionDays}
                        onChange={(e) => setBackupSettings({ ...backupSettings, retentionDays: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="flex items-center space-x-4">
                    <Button type="submit" disabled={saving}>
                      <Save className="h-4 w-4 mr-2" />
                      {saving ? 'Saving...' : 'Save Backup Settings'}
                    </Button>
                    <Button type="button" variant="outline" onClick={handleManualBackup} disabled={saving}>
                      <Database className="h-4 w-4 mr-2" />
                      Create Manual Backup
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Data Export</CardTitle>
                <CardDescription>
                  Export system data for analysis or migration.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-4">
                  <Button variant="outline" onClick={() => handleExportData('users')} disabled={saving}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Users
                  </Button>
                  <Button variant="outline" onClick={() => handleExportData('trainees')} disabled={saving}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Trainees
                  </Button>
                  <Button variant="outline" onClick={() => handleExportData('projects')} disabled={saving}>
                    <Download className="h-4 w-4 mr-2" />
                    Export Projects
                  </Button>
                  <Button variant="outline" onClick={() => handleExportData('all')} disabled={saving}>
                    <Download className="h-4 w-4 mr-2" />
                    Export All Data
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* System Info Tab */}
        <TabsContent value="system">
          <Card>
            <CardHeader>
              <CardTitle>System Information</CardTitle>
              <CardDescription>
                Current system status and configuration details.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Application Version</Label>
                      <p className="mt-1 font-medium">v1.0.0</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Database Size</Label>
                      <p className="mt-1 font-medium">{systemStats.databaseSize}</p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Last Backup</Label>
                      <p className="mt-1 font-medium">
                        {new Date(systemStats.lastBackup).toLocaleString()}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Current Theme</Label>
                      <p className="mt-1">
                        <Badge variant="outline" className="capitalize">{theme}</Badge>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">System Status</Label>
                      <p className="mt-1">
                        <Badge variant="success">Operational</Badge>
                      </p>
                    </div>
                    <div>
                      <Label className="text-sm font-medium text-muted-foreground">Server Uptime</Label>
                      <p className="mt-1 font-medium">{systemStats.systemUptime}</p>
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t">
                  <h4 className="font-semibold mb-3">Quick Actions</h4>
                  <div className="flex space-x-4">
                    <Button variant="outline" size="sm">
                      Clear Cache
                    </Button>
                    <Button variant="outline" size="sm">
                      Restart Services
                    </Button>
                    <Button variant="outline" size="sm">
                      Check Updates
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

export default AdminSettings
