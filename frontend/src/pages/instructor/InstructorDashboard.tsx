import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, FileText, BookOpen, TrendingUp, AlertTriangle } from 'lucide-react';
import { instructorAPI } from '@/lib/api';
import type { InstructorDashboardStats } from '@/types';
import { toast } from '@/hooks/use-toast';

const StatCard: React.FC<{
  title: string;
  value: string;
  description: string;
  icon: React.ReactNode;
  trend?: string;
}> = ({ title, value, description, icon, trend }) => (
  <Card>
    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
      <CardTitle className="text-sm font-medium">{title}</CardTitle>
      {icon}
    </CardHeader>
    <CardContent>
      <div className="text-2xl font-bold">{value}</div>
      <p className="text-xs text-muted-foreground">
        {trend && (
          <span className="text-green-600 inline-flex items-center">
            <TrendingUp className="mr-1 h-3 w-3" />
            {trend}
          </span>
        )}
        {description}
      </p>
    </CardContent>
  </Card>
);

export const InstructorDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<InstructorDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await instructorAPI.getDashboard();
        setDashboardData(response.data.data);
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">Loading...</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded w-1/2"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded w-1/3 mb-2"></div>
                <div className="h-3 bg-muted rounded w-3/4"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-red-500">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'My Trainees',
      value: dashboardData.overview.totalTrainees.toString(),
      description: `${dashboardData.overview.activeTrainees} active, ${dashboardData.overview.completedTrainees} completed`,
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Total Projects',
      value: dashboardData.overview.totalProjects.toString(),
      description: `${dashboardData.overview.activeProjects} active, ${dashboardData.overview.completedProjects} completed`,
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Pending Approvals',
      value: dashboardData.overview.pendingApprovals.toString(),
      description: 'Trainees awaiting approval',
      icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
    },
    {
      title: 'Completion Rate',
      value: dashboardData.overview.totalProjects > 0 
        ? `${Math.round((dashboardData.overview.completedProjects / dashboardData.overview.totalProjects) * 100)}%`
        : '0%',
      description: 'Project completion rate',
      icon: <TrendingUp className="h-4 w-4 text-muted-foreground" />,
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's an overview of your training activities.
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <StatCard key={index} {...stat} />
        ))}
      </div>

      {/* Recent Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
            <CardDescription>
              Latest updates from your trainees
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">{getActivityTitle(activity.type)}</p>
                      <p className="text-xs text-muted-foreground">
                        {activity.message}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {formatRelativeTime(activity.created_at)}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No recent activities</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used instructor actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <a
                href="/instructor/trainees/new"
                className="flex items-center p-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Users className="mr-2 h-4 w-4" />
                Add New Trainee
              </a>
              <a
                href="/instructor/projects/new"
                className="flex items-center p-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create New Project
              </a>
              <a
                href="/instructor/reviews"
                className="flex items-center p-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <BookOpen className="mr-2 h-4 w-4" />
                Review Progress
              </a>
              <a
                href="/instructor/trainees"
                className="flex items-center p-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Users className="mr-2 h-4 w-4" />
                View My Trainees
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Deadlines */}
      <Card>
        <CardHeader>
          <CardTitle>Upcoming Deadlines</CardTitle>
          <CardDescription>
            Projects and reviews due soon
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {dashboardData.upcomingDeadlines.length > 0 ? (
              dashboardData.upcomingDeadlines.map((project) => (
                <div key={project.id} className="flex items-center justify-between p-3 bg-accent/50 rounded-lg">
                  <div>
                    <p className="font-medium">{project.project_name}</p>
                    <p className="text-sm text-muted-foreground">
                      {project.trainee?.name} - {project.description || 'Project review'}
                    </p>
                  </div>
                  <span className={`text-sm font-medium ${getDueDateColor(project.due_date)}`}>
                    {formatDueDate(project.due_date)}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming deadlines</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Helper functions
const getActivityTitle = (type: string): string => {
  switch (type) {
    case 'trainee_created':
      return 'New Trainee Added';
    case 'progress_shared':
      return 'Progress Shared';
    case 'general':
      return 'General Update';
    default:
      return 'Activity';
  }
};

const formatRelativeTime = (dateString: string): string => {
  const date = new Date(dateString);
  const now = new Date();
  const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
  
  if (diffInMinutes < 1) return 'Just now';
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
  if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)}h ago`;
  return `${Math.floor(diffInMinutes / 1440)}d ago`;
};

const formatDueDate = (dateString?: string): string => {
  if (!dateString) return 'No due date';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) return 'Overdue';
  if (diffInDays === 0) return 'Due today';
  if (diffInDays === 1) return 'Due tomorrow';
  return `Due in ${diffInDays} days`;
};

const getDueDateColor = (dateString?: string): string => {
  if (!dateString) return 'text-muted-foreground';
  
  const date = new Date(dateString);
  const now = new Date();
  const diffInDays = Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  
  if (diffInDays < 0) return 'text-red-600';
  if (diffInDays <= 1) return 'text-red-600';
  if (diffInDays <= 2) return 'text-orange-600';
  return 'text-green-600';
};
