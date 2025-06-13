import React from 'react';
import { Users, FolderOpen, Calendar, TrendingUp } from 'lucide-react';

const DashboardOverview: React.FC = () => {
  const stats = [
    {
      title: 'Total Trainees',
      value: '124',
      change: '+12%',
      changeType: 'positive' as const,
      icon: Users,
      color: 'bg-blue-500'
    },
    {
      title: 'Active Projects',
      value: '18',
      change: '+5%',
      changeType: 'positive' as const,
      icon: FolderOpen,
      color: 'bg-green-500'
    },
    {
      title: 'This Week Attendance',
      value: '89%',
      change: '-2%',
      changeType: 'negative' as const,
      icon: Calendar,
      color: 'bg-amber-500'
    },
    {
      title: 'Completion Rate',
      value: '76%',
      change: '+8%',
      changeType: 'positive' as const,
      icon: TrendingUp,
      color: 'bg-purple-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard Overview</h1>
        <p className="text-gray-600">Welcome back! Here's what's happening with your trainees.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <div key={index} className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{stat.title}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className={`text-sm ${stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600'}`}>
                    {stat.change} from last month
                  </p>
                </div>
                <div className={`${stat.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Submissions</h3>
          <div className="space-y-4">
            {[
              { name: 'Aastha Srivastava', project: 'E-commerce App', time: '2 hours ago' },
              { name: 'Chirag', project: 'Data Analysis', time: '4 hours ago' },
              { name: 'Parth', project: 'Mobile App UI', time: '1 day ago' },
            ].map((submission, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-blue-100 p-2 rounded-full">
                    <FolderOpen className="w-4 h-4 text-blue-600" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{submission.name}</p>
                    <p className="text-sm text-gray-500">{submission.project}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{submission.time}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Upcoming Deadlines</h3>
          <div className="space-y-4">
            {[
              { project: 'Web Development Final', date: 'Dec 15, 2024', trainees: 23 },
              { project: 'Database Design', date: 'Dec 18, 2024', trainees: 15 },
              { project: 'Mobile App Prototype', date: 'Dec 22, 2024', trainees: 18 },
            ].map((deadline, index) => (
              <div key={index} className="flex items-center justify-between py-2">
                <div>
                  <p className="font-medium text-gray-900">{deadline.project}</p>
                  <p className="text-sm text-gray-500">{deadline.trainees} trainees</p>
                </div>
                <span className="text-sm bg-amber-100 text-amber-800 px-2 py-1 rounded">
                  {deadline.date}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardOverview;