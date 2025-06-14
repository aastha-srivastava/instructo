import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { 
  LayoutDashboard, 
  Users, 
  GraduationCap, 
  Settings, 
  User,
  FileText,
  Calendar,
  FolderOpen,
  CheckCircle,
  Upload,
  TrendingUp,
  LogOut
} from 'lucide-react'
import { Button } from '../ui/Button'
import { cn } from '../../lib/utils'

function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login')
  }
  const adminNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/admin' },
    { icon: Users, label: 'Admins', path: '/admin/admins' },
    { icon: GraduationCap, label: 'Instructors', path: '/admin/instructors' },
    { icon: Users, label: 'Trainees', path: '/admin/trainees' },
    { icon: CheckCircle, label: 'Progress Reviews', path: '/admin/progress-reviews' },
    { icon: User, label: 'Profile', path: '/admin/profile' },
    { icon: Settings, label: 'Settings', path: '/admin/settings' },
  ]

  const instructorNavItems = [
    { icon: LayoutDashboard, label: 'Dashboard', path: '/instructor' },
    { icon: Users, label: 'Trainees', path: '/instructor/trainees' },
    { icon: FileText, label: 'Projects', path: '/instructor/projects' },
    { icon: FolderOpen, label: 'Documents', path: '/instructor/documents' },
    { icon: Calendar, label: 'Monthly Records', path: '/instructor/monthly-records' },
    { icon: Upload, label: 'Attendance Upload', path: '/instructor/attendance-upload' },
    { icon: TrendingUp, label: 'Progress Tracker', path: '/instructor/progress-tracker' },
    { icon: User, label: 'Profile', path: '/instructor/profile' },
  ]

  const navItems = user?.role === 'admin' ? adminNavItems : instructorNavItems

  return (
    <div className="fixed left-0 top-0 h-full w-64 bg-card border-r border-gray-200">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">I</span>
          </div>
          <h1 className="text-xl font-bold">Instructo</h1>
        </div>
      </div>

      <nav className="px-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              cn(
                'flex items-center space-x-3 px-3 py-2 rounded-md text-sm font-medium transition-colors',
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-muted-foreground hover:text-foreground hover:bg-accent'
              )
            }
          >
            <item.icon className="h-4 w-4" />
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="absolute bottom-4 left-4 right-4">
        <div className="p-3 rounded-md bg-muted/50">
          <div className="text-sm font-medium">{user?.name}</div>
          <div className="text-xs text-muted-foreground">{user?.email}</div>
          <div className="text-xs text-muted-foreground capitalize">{user?.role}</div>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleLogout}
          className="w-full mt-2 justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Logout
        </Button>
      </div>
    </div>
  )
}

export default Sidebar
