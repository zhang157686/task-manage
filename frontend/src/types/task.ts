/**
 * Task related types
 */

export type TaskStatus = 'pending' | 'in_progress' | 'review' | 'done' | 'blocked' | 'cancelled';
export type TaskPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface TaskDependency {
  id: number;
  depends_on_id: number;
  created_at: string;
}

export interface Task {
  id: number;
  project_id?: number;
  parent_id?: number;
  title: string;
  description?: string;
  details?: string;
  test_strategy?: string;
  status: TaskStatus;
  priority: TaskPriority;
  order_index: number;
  estimated_hours?: number;
  actual_hours?: number;
  assignee_id?: number;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  dependencies: TaskDependency[];
  subtasks: Task[];
}

export interface TaskListItem {
  id: number;
  title: string;
  description?: string;
  status: TaskStatus;
  priority: TaskPriority;
  project_id?: number;
  parent_id?: number;
  order_index: number;
  estimated_hours?: number;
  actual_hours?: number;
  assignee_id?: number;
  due_date?: string;
  completed_at?: string;
  created_at: string;
  updated_at: string;
  subtask_count: number;
  dependency_count: number;
}

export interface TaskCreate {
  title: string;
  description?: string;
  details?: string;
  test_strategy?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  order_index?: number;
  estimated_hours?: number;
  actual_hours?: number;
  assignee_id?: number;
  due_date?: string;
  project_id?: number;
  parent_id?: number;
  dependencies?: number[];
}

export interface TaskUpdate {
  title?: string;
  description?: string;
  details?: string;
  test_strategy?: string;
  status?: TaskStatus;
  priority?: TaskPriority;
  order_index?: number;
  estimated_hours?: number;
  actual_hours?: number;
  assignee_id?: number;
  due_date?: string;
}

export interface TaskGenerateRequest {
  project_description: string;
  task_count?: number;
  include_subtasks?: boolean;
  priority_distribution?: Record<string, number>;
  custom_requirements?: string;
}

export interface TaskGenerateResponse {
  success: boolean;
  message: string;
  tasks: TaskCreate[];
  total_generated: number;
  generation_time: number;
  model_used?: string;
}

export interface TaskStats {
  total_tasks: number;
  pending_tasks: number;
  in_progress_tasks: number;
  review_tasks: number;
  done_tasks: number;
  blocked_tasks: number;
  cancelled_tasks: number;
  completion_percentage: number;
  average_completion_time?: number;
}

export interface TaskSearchRequest {
  query?: string;
  status?: TaskStatus[];
  priority?: TaskPriority[];
  assignee_id?: number;
  parent_id?: number;
  has_subtasks?: boolean;
  has_dependencies?: boolean;
  due_date_from?: string;
  due_date_to?: string;
  created_from?: string;
  created_to?: string;
  skip?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: 'asc' | 'desc';
}

export interface TaskLog {
  id: number;
  task_id: number;
  user_id: number;
  action: string;
  field_name?: string;
  old_value?: string;
  new_value?: string;
  description?: string;
  extra_data?: Record<string, any>;
  created_at: string;
}

export interface TaskWithLogs extends Task {
  logs: TaskLog[];
}

export interface TaskBatchUpdate {
  task_ids: number[];
  updates: TaskUpdate;
}

export interface TaskBatchStatusUpdate {
  task_ids: number[];
  status: TaskStatus;
}

// Task status options for UI
export const TASK_STATUS_OPTIONS = [
  { value: 'pending', label: '待处理', color: 'bg-gray-100 text-gray-800', icon: '⏳' },
  { value: 'in_progress', label: '进行中', color: 'bg-blue-100 text-blue-800', icon: '🔄' },
  { value: 'review', label: '待审核', color: 'bg-yellow-100 text-yellow-800', icon: '👀' },
  { value: 'done', label: '已完成', color: 'bg-green-100 text-green-800', icon: '✅' },
  { value: 'blocked', label: '已阻塞', color: 'bg-red-100 text-red-800', icon: '🚫' },
  { value: 'cancelled', label: '已取消', color: 'bg-gray-100 text-gray-600', icon: '❌' },
] as const;

// Task priority options for UI
export const TASK_PRIORITY_OPTIONS = [
  { value: 'low', label: '低', color: 'bg-gray-100 text-gray-800', icon: '⬇️' },
  { value: 'medium', label: '中', color: 'bg-blue-100 text-blue-800', icon: '➡️' },
  { value: 'high', label: '高', color: 'bg-orange-100 text-orange-800', icon: '⬆️' },
  { value: 'urgent', label: '紧急', color: 'bg-red-100 text-red-800', icon: '🔥' },
] as const;

// Task view modes
export type TaskViewMode = 'list' | 'cards' | 'kanban';

export const TASK_VIEW_OPTIONS = [
  { value: 'list', label: '列表视图', icon: '📋' },
  { value: 'cards', label: '卡片视图', icon: '🗂️' },
  { value: 'kanban', label: '看板视图', icon: '📊' },
] as const;

// Sort options for tasks
export const TASK_SORT_OPTIONS = [
  { value: 'created_at', label: '创建时间' },
  { value: 'updated_at', label: '更新时间' },
  { value: 'title', label: '标题' },
  { value: 'priority', label: '优先级' },
  { value: 'status', label: '状态' },
  { value: 'due_date', label: '截止日期' },
  { value: 'order_index', label: '排序' },
] as const;

// Helper functions
export const getTaskStatusOption = (status: TaskStatus) => {
  return TASK_STATUS_OPTIONS.find(option => option.value === status);
};

export const getTaskPriorityOption = (priority: TaskPriority) => {
  return TASK_PRIORITY_OPTIONS.find(option => option.value === priority);
};

export const getTaskViewOption = (view: TaskViewMode) => {
  return TASK_VIEW_OPTIONS.find(option => option.value === view);
};

export const formatTaskDuration = (hours?: number): string => {
  if (!hours) return '未设置';
  if (hours < 1) return `${Math.round(hours * 60)}分钟`;
  if (hours < 8) return `${hours}小时`;
  const days = Math.floor(hours / 8);
  const remainingHours = hours % 8;
  if (remainingHours === 0) return `${days}天`;
  return `${days}天${remainingHours}小时`;
};

export const calculateTaskProgress = (task: Task): number => {
  if (task.subtasks.length === 0) {
    return task.status === 'done' ? 100 : 0;
  }
  
  const completedSubtasks = task.subtasks.filter(subtask => subtask.status === 'done').length;
  return Math.round((completedSubtasks / task.subtasks.length) * 100);
};

export const getTaskStatusColor = (status: TaskStatus): string => {
  const option = getTaskStatusOption(status);
  return option?.color || 'bg-gray-100 text-gray-800';
};

export const getTaskPriorityColor = (priority: TaskPriority): string => {
  const option = getTaskPriorityOption(priority);
  return option?.color || 'bg-gray-100 text-gray-800';
};