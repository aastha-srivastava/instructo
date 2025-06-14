import React from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import LoadingSpinner from '../components/ui/LoadingSpinner'
import LoginPage from '../pages/auth/LoginPage'
import AdminDashboard from '../pages/admin/AdminDashboard'
import AdminsList from '../pages/admin/AdminsList'
import InstructorsList from '../pages/admin/InstructorsList'
import TraineeApproval from '../pages/admin/TraineeApproval'
import ProgressReviews from '../pages/admin/ProgressReviews'
import AdminProfile from '../pages/admin/AdminProfile'
import AdminSettings from '../pages/admin/AdminSettings'
import InstructorDashboard from '../pages/instructor/InstructorDashboard'
import TraineesList from '../pages/instructor/TraineesList'
import ProjectsList from '../pages/instructor/ProjectsList'
import DocumentsPage from '../pages/instructor/DocumentsPage'
import MonthlyRecords from '../pages/instructor/MonthlyRecords'
import AttendanceUpload from '../pages/instructor/AttendanceUpload'
import ProgressTracker from '../pages/instructor/ProgressTracker'
import InstructorProfile from '../pages/instructor/InstructorProfile'
import Layout from '../components/layout/Layout'

function ProtectedRoute({ children, allowedRoles }) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  if (allowedRoles && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />
  }

  return children
}

function AppRouter() {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return <LoadingSpinner />
  }

  return (
    <Routes>
      {/* Public Routes */}
      <Route 
        path="/login" 
        element={
          isAuthenticated ? 
            <Navigate to={user?.role === 'admin' ? '/admin' : '/instructor'} replace /> : 
            <LoginPage />
        } 
      />

      {/* Admin Routes */}
      <Route path="/admin" element={
        <ProtectedRoute allowedRoles={['admin']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<AdminDashboard />} />
        <Route path="admins" element={<AdminsList />} />
        <Route path="instructors" element={<InstructorsList />} />
        <Route path="trainees" element={<TraineeApproval />} />
        <Route path="progress-reviews" element={<ProgressReviews />} />
        <Route path="profile" element={<AdminProfile />} />
        <Route path="settings" element={<AdminSettings />} />
      </Route>

      {/* Instructor Routes */}
      <Route path="/instructor" element={
        <ProtectedRoute allowedRoles={['instructor']}>
          <Layout />
        </ProtectedRoute>
      }>
        <Route index element={<InstructorDashboard />} />
        <Route path="trainees" element={<TraineesList />} />
        <Route path="projects" element={<ProjectsList />} />        <Route path="documents" element={<DocumentsPage />} />        <Route path="monthly-records" element={<MonthlyRecords />} />
        <Route path="attendance-upload" element={<AttendanceUpload />} />
        <Route path="progress-tracker" element={<ProgressTracker />} />
        <Route path="profile" element={<InstructorProfile />} />
      </Route>

      {/* Default redirects */}
      <Route 
        path="/" 
        element={
          <Navigate 
            to={
              isAuthenticated 
                ? user?.role === 'admin' 
                  ? '/admin' 
                  : '/instructor'
                : '/login'
            } 
            replace 
          />
        } 
      />

      {/* Catch all */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default AppRouter
