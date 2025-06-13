// User types
export interface User {
  id: string
  name: string
  email: string
  phone: string
  date_of_birth?: string
  title?: string
  department?: string
  role?: string
  created_by?: string
  created_at: string
  updated_at: string
}

export interface Admin extends User {
  title?: string
}

export interface Instructor extends User {
  employee_id: string
  department: string
  role: string
  created_by: string
  creator?: Admin
  trainees?: Trainee[]
}

// Trainee types
export interface Trainee {
  id: string
  name: string
  institution_name?: string
  degree?: string
  mobile: string
  joining_date: string
  expected_completion_date?: string
  instructor_id: string
  status: 'pending_approval' | 'approved' | 'rejected' | 'active' | 'completed'
  local_guardian_name?: string
  local_guardian_phone?: string
  local_guardian_email?: string
  reference_person_name?: string
  reference_person_phone?: string
  reference_person_email?: string
  created_at: string
  updated_at: string
  instructor?: Instructor
  projects?: Project[]
  documents?: Document[]
}

// Project types
export interface Project {
  id: string
  trainee_id: string
  project_name: string
  description?: string
  start_date?: string
  end_date?: string
  due_date?: string
  status: 'assigned' | 'in_progress' | 'completed'
  performance_rating?: number
  project_report_path?: string
  attendance_document_path?: string
  created_at: string
  updated_at: string
  trainee?: Trainee
  progress?: ProjectProgress[]
  documents?: Document[]
}

export interface ProjectProgress {
  id: string
  project_id: string
  task_description?: string
  date: string
  status: 'completed' | 'in_progress' | 'not_completed'
  notes?: string
  created_at: string
  updated_at: string
  project?: Project
}

// Document types
export interface Document {
  id: string
  trainee_id: string
  project_id?: string
  document_name?: string
  document_type: 'project_report' | 'attendance_record' | 'other'
  file_path: string
  uploaded_by: string
  uploaded_at: string
  trainee?: Trainee
  project?: Project
  uploader?: Instructor
}

// Notification types
export interface Notification {
  id: string
  recipient_id: string
  recipient_type: 'admin' | 'instructor'
  sender_id: string
  sender_type: 'admin' | 'instructor'
  message: string
  type: 'trainee_created' | 'progress_shared' | 'general'
  read_status: boolean
  created_at: string
}

// Progress Review types
export interface ProgressReview {
  id: string
  trainee_id: string
  shared_by: string
  reviewed_by?: string
  status: 'in_review' | 'completed'
  shared_at: string
  reviewed_at?: string
  trainee?: Trainee
  sharedBy?: Instructor
  reviewedBy?: Admin
}

// Dashboard types
export interface AdminDashboardStats {
  overview: {
    totalAdmins: number
    totalInstructors: number
    totalTrainees: number
    pendingApprovals: number
    activeTrainees: number
    completedTrainees: number
    totalProjects: number
    completedProjects: number
  }
  monthlyStats: {
    newTrainees: number
    completedProjects: number
  }
  recentActivities: Notification[]
}

export interface InstructorDashboardStats {
  overview: {
    totalTrainees: number
    activeTrainees: number
    completedTrainees: number
    totalProjects: number
    activeProjects: number
    completedProjects: number
    pendingApprovals: number
  }
  recentActivities: Notification[]
  upcomingDeadlines: Project[]
}

// Form types
export interface LoginFormData {
  email: string
  password?: string
  role: 'admin' | 'instructor'
  authMethod: 'password' | 'otp'
  otp?: string
}

export interface TraineeFormData {
  name: string
  institution_name?: string
  degree?: string
  mobile: string
  joining_date: string
  expected_completion_date?: string
  local_guardian_name?: string
  local_guardian_phone?: string
  local_guardian_email?: string
  reference_person_name?: string
  reference_person_phone?: string
  reference_person_email?: string
}

export interface ProjectFormData {
  trainee_id: string
  project_name: string
  description?: string
  due_date?: string
}

export interface ProjectCompletionData {
  performance_rating: number
  project_report: File
  attendance_document: File
}

export interface ProgressFormData {
  project_id: string
  task_description?: string
  date: string
  status: 'completed' | 'in_progress' | 'not_completed'
  notes?: string
}

// API Response types
export interface ApiResponse<T = any> {
  success: boolean
  message: string
  data?: T
}

export interface PaginatedResponse<T = any> {
  success: boolean
  data: {
    items: T[]
    pagination: {
      currentPage: number
      totalPages: number
      total: number
      hasNext: boolean
      hasPrev: boolean
    }
  }
}

// Filter and search types
export interface BaseFilters {
  page?: number
  limit?: number
  search?: string
}

export interface TraineeFilters extends BaseFilters {
  status?: string
  instructor_id?: string
}

export interface ProjectFilters extends BaseFilters {
  status?: string
  trainee_id?: string
}

export interface DocumentFilters extends BaseFilters {
  trainee_id?: string
  document_type?: string
}

export interface InstructorFilters extends BaseFilters {
  department?: string
}

export interface NotificationFilters extends BaseFilters {
  read_status?: boolean
}

// Theme types
export type Theme = 'light' | 'dark'

// Auth context types
export interface AuthContextType {
  user: User | null
  role: 'admin' | 'instructor' | null
  token: string | null
  isLoading: boolean
  login: (email: string, password: string, role: 'admin' | 'instructor') => Promise<void>
  loginWithOTP: (email: string, otp: string, role: 'admin' | 'instructor') => Promise<void>
  sendOTP: (email: string, role: 'admin' | 'instructor') => Promise<void>
  logout: () => void
  updateUser: (userData: Partial<User>) => void
}

// Theme context types
export interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
  setTheme: (theme: Theme) => void
}

// Utility types
export type UserRole = 'admin' | 'instructor'
export type TraineeStatus = 'pending_approval' | 'approved' | 'rejected' | 'active' | 'completed'
export type ProjectStatus = 'assigned' | 'in_progress' | 'completed'
export type ProgressStatus = 'completed' | 'in_progress' | 'not_completed'
export type DocumentType = 'project_report' | 'attendance_record' | 'other'
export type NotificationType = 'trainee_created' | 'progress_shared' | 'general'
