import { Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider, useAuth } from './contexts/AuthContext'
import { ThemeProvider } from './contexts/ThemeContext'
import { LoginPage } from './pages/auth/LoginPage'
import { ForgotPasswordPage } from './pages/auth/ForgotPasswordPage'
import { AdminLayout } from './layouts/AdminLayout'
import { InstructorLayout } from './layouts/InstructorLayout'
import { AdminDashboard } from './pages/admin/AdminDashboard'
import { AdminInstructors } from './pages/admin/AdminInstructors'
import { AdminTrainees } from './pages/admin/AdminTrainees'
import { AdminProgressReviews } from './pages/admin/AdminProgressReviews'
import { InstructorDashboard } from './pages/instructor/InstructorDashboard'
import { InstructorTrainees } from './pages/instructor/InstructorTrainees'
import { InstructorProjects } from './pages/instructor/InstructorProjects'
import { Toaster } from './components/ui/Toaster'

function ProtectedRoute({ 
  children, 
  requiredRole 
}: { 
  children: React.ReactNode
  requiredRole?: 'admin' | 'instructor'
}) {
  const { user, role, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to="/unauthorized" replace />
  }

  return <>{children}</>
}

function AppRoutes() {
  const { user, role } = useAuth()

  return (
    <Routes>
      <Route 
        path="/login" 
        element={
          user ? (
            <Navigate to={role === 'admin' ? '/admin' : '/instructor'} replace />
          ) : (
            <LoginPage />
          )
        } 
      />
      
      <Route 
        path="/forgot-password" 
        element={<ForgotPasswordPage />} 
      />
      
      <Route 
        path="/" 
        element={
          <Navigate 
            to={
              user 
                ? (role === 'admin' ? '/admin' : '/instructor')
                : '/login'
            } 
            replace 
          />
        } 
      />      {/* Admin Routes */}
      <Route
        path="/admin/*"
        element={
          <ProtectedRoute requiredRole="admin">
            <AdminLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<AdminDashboard />} />
        <Route path="instructors" element={<AdminInstructors />} />
        <Route path="trainees" element={<AdminTrainees />} />
        <Route path="reviews" element={<AdminProgressReviews />} />
      </Route>{/* Instructor Routes */}
      <Route
        path="/instructor/*"
        element={
          <ProtectedRoute requiredRole="instructor">
            <InstructorLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<InstructorDashboard />} />
        <Route path="trainees" element={<InstructorTrainees />} />
        <Route path="projects" element={<InstructorProjects />} />
      </Route>

      {/* Fallback Routes */}
      <Route 
        path="/unauthorized" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold text-destructive mb-4">Unauthorized</h1>
              <p className="text-muted-foreground mb-8">You don't have permission to access this page.</p>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go Back
              </button>
            </div>
          </div>
        } 
      />
      
      <Route 
        path="*" 
        element={
          <div className="min-h-screen flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-4xl font-bold mb-4">404 - Page Not Found</h1>
              <p className="text-muted-foreground mb-8">The page you're looking for doesn't exist.</p>
              <button 
                onClick={() => window.history.back()}
                className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90"
              >
                Go Back
              </button>
            </div>
          </div>
        } 
      />
    </Routes>
  )
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <div className="min-h-screen bg-background">
          <AppRoutes />
          <Toaster />
        </div>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
