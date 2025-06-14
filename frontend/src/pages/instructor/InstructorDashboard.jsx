import React, { useState, useEffect } from 'react'
import { Users, FileText, CheckCircle, Clock, Calendar, Plus, TrendingUp } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Badge } from '../../components/ui/Badge'
import { instructorAPI } from '../../services/api'
import LoadingSpinner from '../../components/ui/LoadingSpinner'

function InstructorDashboard() {
  const [dashboardData, setDashboardData] = useState(null)
  const [loading, setLoading] = useState(true)
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    setLoading(true)
    try {
      const response = await instructorAPI.getDashboard()
      setDashboardData(response.data)
      setRecentActivity(response.data.recentActivity || [])
      setUpcomingDeadlines(response.data.upcomingDeadlines || [])
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingSpinner />
  }

  const stats = [
    {
      title: 'Total Trainees',
      value: dashboardData?.totalTrainees || 0,
      description: 'Active trainees',
      icon: Users,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100 dark:bg-blue-900/20'
    },
    {
      title: 'Active Projects',
      value: dashboardData?.activeProjects || 0,
      description: 'In progress',
      icon: FileText,
      color: 'text-green-600',
      bgColor: 'bg-green-100 dark:bg-green-900/20'
    },
    {
      title: 'Completed Projects',
      value: dashboardData?.completedProjects || 0,
      description: 'This month',
      icon: CheckCircle,
      color: 'text-purple-600',
      bgColor: 'bg-purple-100 dark:bg-purple-900/20'
    },
    {
      title: 'Pending Reviews',
      value: dashboardData?.pendingReviews || 0,
      description: 'Awaiting progress',
      icon: Clock,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100 dark:bg-orange-900/20'
    }
  ]

  const quickActions = [
    { 
      label: 'Add New Trainee', 
      path: '/instructor/trainees',
      icon: Users,
      description: 'Register a new trainee'
    },
    { 
      label: 'Create Project', 
      path: '/instructor/projects',
      icon: FileText,
      description: 'Assign new project'
    },
    { 
      label: 'Upload Documents', 
      path: '/instructor/documents',
      icon: FileText,
      description: 'Manage project files'
    },
    { 
      label: 'Monthly Records', 
      path: '/instructor/monthly-records',
      icon: Calendar,
      description: 'Update attendance'
    }
  ]

  const getActivityIcon = (type) => {
    switch (type) {
      case 'trainee_added':
        return <Users className="h-4 w-4" />
      case 'project_created':
        return <FileText className="h-4 w-4" />
      case 'project_completed':
        return <CheckCircle className="h-4 w-4" />
      case 'progress_updated':
        return <TrendingUp className="h-4 w-4" />
      default:
        return <Clock className="h-4 w-4" />
    }
  }

  const getActivityColor = (type) => {
    switch (type) {
      case 'trainee_added':
        return 'default'
      case 'project_created':
        return 'success'
      case 'project_completed':
        return 'success'
      case 'progress_updated':
        return 'warning'
      default:
        return 'secondary'
    }
  }

  const getDeadlineUrgency = (date) => {
    const now = new Date()
    const deadline = new Date(date)
    const diffDays = Math.ceil((deadline - now) / (1000 * 60 * 60 * 24))
    
    if (diffDays <= 3) return 'destructive'
    if (diffDays <= 7) return 'warning'
    return 'default'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Instructor Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your training activities.
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => {
          const Icon = stat.icon
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-md ${stat.bgColor}`}>
                  <Icon className={`h-4 w-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{stat.value}</div>
                <p className="text-xs text-muted-foreground">
                  {stat.description}
                </p>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Quick Actions */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used instructor actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {quickActions.map((action, index) => {
              const Icon = action.icon
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="w-full justify-start h-auto p-4"
                  onClick={() => {
                    window.location.href = action.path
                  }}
                >
                  <div className="flex items-start space-x-3">
                    <Icon className="h-5 w-5 mt-0.5" />
                    <div className="text-left">
                      <div className="font-medium">{action.label}</div>
                      <div className="text-xs text-muted-foreground">{action.description}</div>
                    </div>
                  </div>
                </Button>
              )
            })}
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates and actions
            </CardDescription>
          </CardHeader>
          <CardContent>
            {recentActivity.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No recent activity
              </p>
            ) : (
              <div className="space-y-4">
                {recentActivity.slice(0, 4).map((activity, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <div className="p-1 rounded-md bg-muted">
                      {getActivityIcon(activity.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {activity.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.description}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant={getActivityColor(activity.type)} className="text-xs">
                          {activity.type?.replace('_', ' ')}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {new Date(activity.created_at).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Upcoming Deadlines */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Upcoming Deadlines</CardTitle>
            <CardDescription>
              Important dates and milestones
            </CardDescription>
          </CardHeader>
          <CardContent>
            {upcomingDeadlines.length === 0 ? (
              <p className="text-center text-muted-foreground py-4">
                No upcoming deadlines
              </p>
            ) : (
              <div className="space-y-4">
                {upcomingDeadlines.slice(0, 4).map((deadline, index) => (
                  <div key={index} className="flex items-start space-x-3">
                    <Calendar className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">
                        {deadline.title}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {deadline.project_name}
                      </p>
                      <div className="flex items-center justify-between mt-1">
                        <Badge variant={getDeadlineUrgency(deadline.due_date)} className="text-xs">
                          {new Date(deadline.due_date).toLocaleDateString()}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {Math.ceil((new Date(deadline.due_date) - new Date()) / (1000 * 60 * 60 * 24))} days
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Calendar Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Training Calendar</CardTitle>
          <CardDescription>
            Overview of current month's training activities
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Training calendar will be displayed here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Calendar integration coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Training Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Training Progress Overview</CardTitle>
          <CardDescription>
            Progress tracking for all active trainees and projects
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center border-2 border-dashed border-muted-foreground/25 rounded-lg">
            <div className="text-center">
              <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">
                Progress charts and analytics will be displayed here
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                Advanced analytics coming soon
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default InstructorDashboard
