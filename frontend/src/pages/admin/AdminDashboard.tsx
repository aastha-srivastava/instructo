import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/Card';
import { Users, GraduationCap, FileText, TrendingUp, AlertTriangle } from 'lucide-react';
import { adminAPI } from '@/lib/api';
import type { AdminDashboardStats } from '@/types';
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

export const AdminDashboard: React.FC = () => {
  const [dashboardData, setDashboardData] = useState<AdminDashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const response = await adminAPI.getDashboard();
        
        // Handle the backend response structure correctly
        if (response.data && response.data.success) {
          const stats = response.data.data.stats;
          const recentActivities = response.data.data.recentActivities;
          
          setDashboardData({
            overview: {
              totalAdmins: stats.totalAdmins,
              totalInstructors: stats.totalInstructors,
              totalTrainees: stats.totalTrainees,
              pendingApprovals: stats.pendingTrainees, // backend uses pendingTrainees
              activeTrainees: stats.activeTrainees,
              completedTrainees: stats.completedTrainees,
              totalProjects: stats.totalProjects,
              completedProjects: stats.completedProjects
            },
            monthlyStats: {
              newTrainees: recentActivities?.trainees?.length || 0,
              completedProjects: recentActivities?.projects?.filter((p: any) => p.status === 'completed').length || 0
            },
            recentActivities: recentActivities?.trainees?.map((trainee: any) => ({
              id: trainee.id,
              type: 'trainee_created',
              message: `New trainee ${trainee.name} joined`,
              created_at: trainee.created_at
            })) || []
          });
        } else {
          throw new Error('Invalid response format');
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        toast({
          title: "Error",
          description: "Failed to load dashboard data. Please check your connection.",
          variant: "destructive",
        });
        setDashboardData(null);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader>
                <div className="h-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!dashboardData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground">Failed to load dashboard data</p>
        </div>
      </div>
    );
  }

  const stats = [
    {
      title: 'Total Instructors',
      value: dashboardData.overview.totalInstructors.toString(),
      description: 'Active instructors',
      icon: <GraduationCap className="h-4 w-4 text-muted-foreground" />,
      trend: dashboardData.monthlyStats ? `+${dashboardData.monthlyStats.newTrainees || 0} this month` : undefined
    },
    {
      title: 'Total Trainees',
      value: dashboardData.overview.totalTrainees.toString(),
      description: 'Enrolled trainees',
      icon: <Users className="h-4 w-4 text-muted-foreground" />,
      trend: `${dashboardData.overview.activeTrainees} active, ${dashboardData.overview.pendingApprovals} pending`
    },
    {
      title: 'Total Projects',
      value: dashboardData.overview.totalProjects.toString(),
      description: 'All projects',
      icon: <FileText className="h-4 w-4 text-muted-foreground" />,
      trend: `${dashboardData.overview.completedProjects} completed`
    },
    {
      title: 'Pending Approvals',
      value: dashboardData.overview.pendingApprovals.toString(),
      description: 'Awaiting approval',
      icon: <AlertTriangle className="h-4 w-4 text-muted-foreground" />,
      trend: 'Requires attention'
    },
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome back! Here's what's happening with your training programs.
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
              Latest updates from your training programs
            </CardDescription>
          </CardHeader>          <CardContent>
            <div className="space-y-4">
              {dashboardData.recentActivities && dashboardData.recentActivities.length > 0 ? (
                dashboardData.recentActivities.slice(0, 5).map((activity) => (
                  <div key={activity.id} className="flex items-center space-x-4">
                    <div className={`w-2 h-2 rounded-full ${
                      activity.type === 'trainee_created' ? 'bg-blue-500' :
                      activity.type === 'progress_shared' ? 'bg-green-500' :
                      'bg-yellow-500'
                    }`}></div>
                    <div className="flex-1 space-y-1">
                      <p className="text-sm font-medium">
                        {activity.type === 'trainee_created' ? 'New trainee created' :
                         activity.type === 'progress_shared' ? 'Progress shared' :
                         'General notification'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {activity.message}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {new Date(activity.created_at).toLocaleDateString()}
                    </p>
                  </div>
                ))
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  No recent activities
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>
              Frequently used admin actions
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-2">
              <a
                href="/admin/instructors/new"
                className="flex items-center p-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <GraduationCap className="mr-2 h-4 w-4" />
                Add New Instructor
              </a>
              <a
                href="/admin/trainees/new"
                className="flex items-center p-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <Users className="mr-2 h-4 w-4" />
                Add New Trainee
              </a>
              <a
                href="/admin/projects/new"
                className="flex items-center p-2 text-sm rounded-lg hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <FileText className="mr-2 h-4 w-4" />
                Create New Project
              </a>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
