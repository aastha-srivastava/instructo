import React, { useState } from 'react';
import Sidebar from './components/Layout/Sidebar';
import Navbar from './components/Layout/Navbar';
import DashboardOverview from './components/Dashboard/DashboardOverview';
import TraineeManagement from './components/Trainees/TraineeManagement';
import ProjectManagement from './components/Projects/ProjectManagement';
import AttendanceTracker from './components/Attendance/AttendanceTracker';
import ReportManagement from './components/Reports/ReportManagement';

function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const renderContent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <DashboardOverview />;
      case 'trainees':
        return <TraineeManagement />;
      case 'projects':
        return <ProjectManagement />;
      case 'attendance':
        return <AttendanceTracker />;
      case 'reports':
        return <ReportManagement />;
      case 'settings':
        return (
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Settings</h2>
            <p className="text-gray-600">Settings panel coming soon...</p>
          </div>
        );
      default:
        return <DashboardOverview />;
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isCollapsed={sidebarCollapsed}
      />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Navbar onToggleSidebar={() => setSidebarCollapsed(!sidebarCollapsed)} />
        <main className="flex-1 overflow-y-auto p-6">
          {renderContent()}
        </main>
      </div>
    </div>
  );
}

export default App;