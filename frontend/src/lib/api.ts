import axios from 'axios'
import { toast } from '../hooks/use-toast'

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api'

// Create axios instance
export const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const message = error.response?.data?.message || 'An error occurred'

    // Handle authentication errors
    if (error.response?.status === 401) {
      // Check if it's a token expiration and not a login request
      if (originalRequest && !originalRequest._retry && !originalRequest.url?.includes('/auth/login')) {
        originalRequest._retry = true

        // Try to get a new token if we have stored auth data
        const token = localStorage.getItem('token')
        const user = localStorage.getItem('user')
        const role = localStorage.getItem('role')

        if (token && user && role) {
          // Clear expired token
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('role')

          toast({
            title: "Session Expired",
            description: "Please log in again",
            variant: "destructive",
          })
        }
      }

      // Redirect to login
      window.location.href = '/login'
      return Promise.reject(error)
    }

    // Handle other errors
    if (error.response?.status >= 400) {
      toast({
        title: "Error",
        description: message,
        variant: "destructive",
      })
    }

    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (data: { email: string; password: string; role: string }) =>
    api.post('/auth/login', data),

  sendOTP: (data: { email: string; role: string }) =>
    api.post('/auth/send-otp', data),

  verifyOTP: (data: { email: string; otp: string; role: string }) =>
    api.post('/auth/verify-otp', data),

  logout: () => api.post('/auth/logout'),
}

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),

  // Admins
  getAdmins: (params?: { page?: number; limit?: number; search?: string }) =>
    api.get('/admin/admins', { params }),
  createAdmin: (data: any) => api.post('/admin/admins', data),
  updateAdmin: (id: string, data: any) => api.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id: string) => api.delete(`/admin/admins/${id}`),
  // Instructors
  getInstructors: (params?: { page?: number; limit?: number; search?: string; department?: string }) =>
    api.get('/admin/instructors', { params }),
  createInstructor: (data: any) => api.post('/admin/instructors', data),
  updateInstructor: (id: string, data: any) => api.put(`/admin/instructors/${id}`, data),
  deleteInstructor: (id: string) => api.delete(`/admin/instructors/${id}`),
  getInstructorDetails: (id: string) => api.get(`/admin/instructors/${id}`),
  // Trainees
  getPendingTrainees: (params?: { page?: number; limit?: number }) =>
    api.get('/admin/trainees/pending', { params }),
  approveTrainee: (id: string, data: { status: string; comments?: string }) =>
    api.put(`/admin/trainees/${id}/approve`, data),
  getTrainees: (params?: { page?: number; limit?: number; status?: string; search?: string; instructor_id?: string }) =>
    api.get('/admin/trainees', { params }),
  createTrainee: (data: any) => api.post('/admin/trainees', data),
  updateTrainee: (id: string, data: any) => api.put(`/admin/trainees/${id}`, data),
  deleteTrainee: (id: string) => api.delete(`/admin/trainees/${id}`),

  // Progress Reviews
  getProgressReviews: (params?: { page?: number; limit?: number; status?: string }) =>
    api.get('/admin/progress-reviews', { params }),
  markReviewCompleted: (id: string) => api.put(`/admin/progress-reviews/${id}`),

  // Profile
  getProfile: () => api.get('/admin/profile'),
  updateProfile: (data: any) => api.put('/admin/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/admin/change-password', data),
}

// Instructor API
export const instructorAPI = {
  // Dashboard
  getDashboard: () => api.get('/instructor/dashboard'),

  // Trainees
  getTrainees: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get('/instructor/trainees', { params }),
  createTrainee: (data: any) => api.post('/instructor/trainees', data),
  updateTrainee: (id: string, data: any) => api.put(`/instructor/trainees/${id}`, data),
  getTraineeDetails: (id: string) => api.get(`/instructor/trainees/${id}`),

  // Projects
  getProjects: (params?: { page?: number; limit?: number; status?: string; trainee_id?: string }) =>
    api.get('/instructor/projects', { params }),
  createProject: (data: any) => api.post('/instructor/projects', data),
  updateProject: (id: string, data: any) => api.put(`/instructor/projects/${id}`, data),
  getProjectDetails: (id: string) => api.get(`/instructor/projects/${id}`),
  completeProject: (id: string, data: FormData) =>
    api.put(`/instructor/projects/${id}/complete`, data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Progress
  updateProgress: (data: any) => api.post('/instructor/progress', data),

  // Documents
  getDocuments: (params?: { page?: number; limit?: number; trainee_id?: string; document_type?: string }) =>
    api.get('/instructor/documents', { params }),
  uploadDocument: (data: FormData) =>
    api.post('/instructor/documents/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),
  uploadAttendance: (data: FormData) =>
    api.post('/instructor/attendance/upload', data, {
      headers: { 'Content-Type': 'multipart/form-data' }
    }),

  // Monthly Records
  getMonthlyStatus: (params?: { month?: number; year?: number }) =>
    api.get('/instructor/monthly-status', { params }),

  // Progress Sharing
  shareProgress: (data: { trainee_id: string }) => api.post('/instructor/share-progress', data),

  // Profile
  getProfile: () => api.get('/instructor/profile'),
  updateProfile: (data: any) => api.put('/instructor/profile', data),
  changePassword: (data: { currentPassword: string; newPassword: string }) =>
    api.put('/instructor/change-password', data),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: (params?: { page?: number; limit?: number; read_status?: boolean }) =>
    api.get('/notifications', { params }),
  markAsRead: (id: string) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  deleteNotification: (id: string) => api.delete(`/notifications/${id}`),
  getStats: () => api.get('/notifications/stats'),
}

export default api
