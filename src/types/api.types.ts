// API layer types

export interface UserProfile {
  id: string; // uuid, references auth.users
  full_name?: string;
  avatar_url?: string;
  storage_used: number; // in bytes
  created_at: string;
  updated_at: string;
}

export interface Project {
  id: string; // uuid
  user_id: string; // uuid
  name: string;
  description?: string;
  tasks_count: number;
  completed_tasks_count: number;
  created_at: string;
  updated_at: string;
}

export interface Task {
  id: string; // uuid
  user_id: string; // uuid
  project_id?: string; // uuid, nullable
  title: string;
  description?: string;
  detailed_description?: string;
  completed: boolean;
  priority: 'low' | 'medium' | 'high';
  start_date?: string; // date
  due_date?: string; // date
  created_at: string;
  updated_at: string;
}

export interface CreateTaskDTO {
  user_id: string;
  project_id?: string;
  title: string;
  description?: string;
  detailed_description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  start_date?: string;
  due_date?: string;
}

export interface UpdateTaskDTO {
  title?: string;
  description?: string;
  detailed_description?: string;
  completed?: boolean;
  priority?: 'low' | 'medium' | 'high';
  start_date?: string;
  due_date?: string;
  project_id?: string;
}

export interface CreateProjectDTO {
  user_id: string;
  name: string;
  description?: string;
}

export interface UpdateProjectDTO {
  name?: string;
  description?: string;
}

export interface UpdateProfileDTO {
  full_name?: string;
  avatar_url?: string;
}

export interface ProjectStats {
  total: number;
  completed: number;
  overdue: number;
}

export interface StorageStats {
  used: number; // in bytes
  limit: number; // 5GB = 5 * 1024 * 1024 * 1024
  percentage: number;
}

export interface UserStats {
  total_tasks: number;
  completed_tasks: number;
  overdue_tasks: number;
  tasks_this_week: number;
}
