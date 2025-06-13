import React from 'react';
import { Outlet } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useTheme } from '@/contexts/ThemeContext';
import { Button } from '@/components/ui/Button';
import { 
  Users, 
  FileText, 
  Settings, 
  LogOut, 
  Moon, 
  Sun,
  Bell,
  Home,
  BookOpen
} from 'lucide-react';

export const InstructorLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const navigation = [
    { name: 'Dashboard', href: '/instructor', icon: Home },
    { name: 'My Trainees', href: '/instructor/trainees', icon: Users },
    { name: 'Projects', href: '/instructor/projects', icon: FileText },
    { name: 'Progress Reviews', href: '/instructor/reviews', icon: BookOpen },
    { name: 'Settings', href: '/instructor/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Sidebar */}
      <div className="fixed inset-y-0 left-0 z-50 w-64 bg-card border-r border-border">
        <div className="flex h-full flex-col">
          {/* Logo */}
          <div className="flex h-16 items-center justify-center border-b border-border">
            <h1 className="text-2xl font-bold text-primary">Instructo</h1>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-1 p-4">
            {navigation.map((item) => (
              <a
                key={item.name}
                href={item.href}
                className="flex items-center px-4 py-2 text-sm font-medium rounded-lg text-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
              >
                <item.icon className="mr-3 h-5 w-5" />
                {item.name}
              </a>
            ))}
          </nav>

          {/* User info */}
          <div className="border-t border-border p-4">
            <div className="flex items-center">
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">
                  {user?.name}
                </p>
                <p className="text-xs text-muted-foreground truncate">
                  Instructor
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="pl-64">
        {/* Top bar */}
        <div className="sticky top-0 z-40 bg-background border-b border-border">
          <div className="flex h-16 items-center justify-between px-6">
            <div className="flex items-center space-x-4">
              <h2 className="text-xl font-semibold text-foreground">
                Instructor Dashboard
              </h2>
            </div>
            
            <div className="flex items-center space-x-4">
              <Button
                variant="ghost"
                size="icon"
                onClick={toggleTheme}
                className="text-muted-foreground hover:text-foreground"
              >
                {theme === 'dark' ? (
                  <Sun className="h-5 w-5" />
                ) : (
                  <Moon className="h-5 w-5" />
                )}
              </Button>
              
              <Button
                variant="ghost"
                size="icon"
                className="text-muted-foreground hover:text-foreground"
              >
                <Bell className="h-5 w-5" />
              </Button>
              
              <Button
                variant="ghost"
                onClick={logout}
                className="text-muted-foreground hover:text-foreground"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Logout
              </Button>
            </div>
          </div>
        </div>

        {/* Page content */}
        <main className="p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
