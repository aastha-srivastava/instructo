export interface Trainee {
  id: string;
  name: string;
  email: string;
  phone: string;
  course: string;
  joinDate: string;
  status: 'active' | 'inactive' | 'completed';
  avatar?: string;
  progress: number;
  assignedProjects: string[];
}

export interface Project {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'not-started' | 'in-progress' | 'completed' | 'overdue';
  assignedTo: string[];
  tasks: Task[];
  createdDate: string;
}

export interface Task {
  id: string;
  title: string;
  description: string;
  completed: boolean;
  dueDate: string;
  assignedTo: string;
}

export interface AttendanceRecord {
  id: string;
  traineeId: string;
  date: string;
  status: 'present' | 'absent' | 'late';
  checkInTime?: string;
  notes?: string;
}

export interface ProjectReport {
  id: string;
  projectId: string;
  traineeId: string;
  fileName: string;
  uploadDate: string;
  status: 'pending' | 'reviewed' | 'approved' | 'rejected';
  feedback?: string;
}