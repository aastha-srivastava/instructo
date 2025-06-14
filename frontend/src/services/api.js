import axios from 'axios'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('instructo_token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Response interceptor to handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('instructo_token')
      localStorage.removeItem('instructo_user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  sendOTP: (email) => api.post('/auth/send-otp', { email }),
  verifyOTP: (email, otp) => api.post('/auth/verify-otp', { email, otp }),
  logout: () => api.post('/auth/logout'),
  refreshToken: () => api.post('/auth/refresh'),
}

// Admin API
export const adminAPI = {
  // Dashboard
  getDashboard: () => api.get('/admin/dashboard'),
  
  // Admins
  getAdmins: () => api.get('/admin/admins'),
  createAdmin: (data) => api.post('/admin/admins', data),
  updateAdmin: (id, data) => api.put(`/admin/admins/${id}`, data),
  deleteAdmin: (id) => api.delete(`/admin/admins/${id}`),
  
  // Instructors
  getInstructors: () => api.get('/admin/instructors'),
  createInstructor: (data) => api.post('/admin/instructors', data),
  updateInstructor: (id, data) => api.put(`/admin/instructors/${id}`, data),
  
  // Trainees
  getPendingTrainees: () => api.get('/admin/trainees/pending'),
  approveTrainee: (id, status, comments) => api.put(`/admin/trainees/${id}/approve`, { status, comments }),
  
  // Progress Reviews
  getProgressReviews: () => api.get('/admin/progress-reviews'),
  markProgressReviewed: (id) => api.put(`/admin/progress-reviews/${id}`),
}

// Instructor API
export const instructorAPI = {
  // Dashboard
  getDashboard: () => api.get('/instructor/dashboard'),
  
  // Trainees
  getTrainees: () => api.get('/instructor/trainees'),
  createTrainee: (data) => api.post('/instructor/trainees', data),
  updateTrainee: (id, data) => api.put(`/instructor/trainees/${id}`, data),
  
  // Projects
  getProjects: () => api.get('/instructor/projects'),
  createProject: (data) => api.post('/instructor/projects', data),
  updateProject: (id, data) => api.put(`/instructor/projects/${id}`, data),
  completeProject: (id, data) => api.put(`/instructor/projects/${id}/complete`, data),
  updateProgress: (data) => api.post('/instructor/progress', data),
  
  // Documents
  uploadDocument: (formData) => api.post('/instructor/documents/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getDocuments: () => api.get('/instructor/documents'),
  
  // Monthly Records
  uploadAttendance: (formData) => api.post('/instructor/attendance/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  }),
  getMonthlyStatus: () => api.get('/instructor/monthly-status'),
  
  // Progress Sharing
  shareProgress: (data) => api.post('/instructor/share-progress', data),
}

// Notifications API
export const notificationsAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  createNotification: (data) => api.post('/notifications', data),
}

export default api
