/**
 * Project related types
 */

export interface ProjectSettings {
  ai_output_language: string;
  task_format_template: string;
  auto_generate_tasks: boolean;
  default_priority: string;
  enable_notifications: boolean;
  custom_fields: Record<string, any>;
}

export interface ProjectStats {
  total_tasks: number;
  completed_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  completion_percentage: number;
  last_activity?: string;
}

export type ProjectStatus = 'active' | 'completed' | 'paused' | 'archived';

export interface Project {
  id: number;
  user_id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  repository_url?: string;
  documentation_url?: string;
  is_public: boolean;
  settings: ProjectSettings;
  is_deleted: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectWithStats extends Project {
  stats: ProjectStats;
}

export interface ProjectListItem {
  id: number;
  name: string;
  description?: string;
  status: ProjectStatus;
  is_public: boolean;
  created_at: string;
  updated_at: string;
  stats: ProjectStats;
}

export interface ProjectCreate {
  name: string;
  description?: string;
  status?: ProjectStatus;
  repository_url?: string;
  documentation_url?: string;
  is_public?: boolean;
  settings?: Partial<ProjectSettings>;
}

export interface ProjectUpdate {
  name?: string;
  description?: string;
  status?: ProjectStatus;
  repository_url?: string;
  documentation_url?: string;
  is_public?: boolean;
  settings?: Partial<ProjectSettings>;
}

export interface ProjectSettingsUpdate {
  ai_output_language?: string;
  task_format_template?: string;
  auto_generate_tasks?: boolean;
  default_priority?: string;
  enable_notifications?: boolean;
  custom_fields?: Record<string, any>;
}

// Project status options for UI
export const PROJECT_STATUS_OPTIONS = [
  { value: 'active', label: '进行中', color: 'bg-green-100 text-green-800' },
  { value: 'completed', label: '已完成', color: 'bg-blue-100 text-blue-800' },
  { value: 'paused', label: '已暂停', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'archived', label: '已归档', color: 'bg-gray-100 text-gray-800' },
] as const;

// Task format template options
export const TASK_FORMAT_TEMPLATES = [
  { value: 'standard', label: '标准格式' },
  { value: 'detailed', label: '详细格式' },
  { value: 'simple', label: '简单格式' },
  { value: 'agile', label: '敏捷格式' },
] as const;

// Priority options
export const PRIORITY_OPTIONS = [
  { value: 'low', label: '低' },
  { value: 'medium', label: '中' },
  { value: 'high', label: '高' },
  { value: 'urgent', label: '紧急' },
] as const;

// Language options
export const LANGUAGE_OPTIONS = [
  { value: '中文', label: '中文' },
  { value: 'English', label: 'English' },
  { value: '日本語', label: '日本語' },
  { value: 'Français', label: 'Français' },
  { value: 'Deutsch', label: 'Deutsch' },
  { value: 'Español', label: 'Español' },
] as const;