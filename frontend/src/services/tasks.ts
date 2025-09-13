/**
 * Tasks API services
 */

import api from '@/lib/api';
import {
  Task,
  TaskListItem,
  TaskCreate,
  TaskUpdate,
  TaskStats,
  TaskSearchRequest,
  TaskGenerateRequest,
  TaskGenerateResponse,
  TaskLog,
  TaskWithLogs,
  TaskBatchUpdate,
  TaskBatchStatusUpdate,
  TaskStatus,
} from '@/types/task';

export const tasksService = {
  // Get all tasks (global)
  async getTasks(params?: {
    project_id?: number;
    parent_id?: number;
    status?: TaskStatus[];
    skip?: number;
    limit?: number;
  }): Promise<TaskListItem[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.project_id !== undefined) searchParams.append('project_id', params.project_id.toString());
    if (params?.parent_id !== undefined) searchParams.append('parent_id', params.parent_id.toString());
    if (params?.status) params.status.forEach(s => searchParams.append('status', s));
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const response = await api.get(`/tasks?${searchParams.toString()}`);
    return response.data;
  },

  // Get tasks for a specific project
  async getProjectTasks(projectId: number, params?: {
    parent_id?: number;
    skip?: number;
    limit?: number;
  }): Promise<TaskListItem[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.parent_id !== undefined) searchParams.append('parent_id', params.parent_id.toString());
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const response = await api.get(`/projects/${projectId}/tasks?${searchParams.toString()}`);
    return response.data;
  },

  // Get a specific task by ID
  async getTask(id: number): Promise<Task> {
    const response = await api.get(`/tasks/${id}`);
    return response.data;
  },

  // Get task with logs
  async getTaskWithLogs(id: number, logsLimit: number = 20): Promise<TaskWithLogs> {
    const response = await api.get(`/tasks/${id}/with-logs?logs_limit=${logsLimit}`);
    return response.data;
  },

  // Create a new task
  async createTask(data: TaskCreate): Promise<Task> {
    const response = await api.post('/tasks', data);
    return response.data;
  },

  // Create a task for a specific project
  async createProjectTask(projectId: number, data: TaskCreate): Promise<Task> {
    const response = await api.post(`/projects/${projectId}/tasks`, data);
    return response.data;
  },

  // Update an existing task
  async updateTask(id: number, data: TaskUpdate): Promise<Task> {
    const response = await api.put(`/tasks/${id}`, data);
    return response.data;
  },

  // Update task status
  async updateTaskStatus(id: number, status: TaskStatus): Promise<Task> {
    const response = await api.patch(`/tasks/${id}/status`, { status });
    return response.data;
  },

  // Delete a task
  async deleteTask(id: number): Promise<void> {
    await api.delete(`/tasks/${id}`);
  },

  // Generate tasks using AI
  async generateTasks(projectId: number, request: TaskGenerateRequest): Promise<TaskGenerateResponse> {
    const response = await api.post(`/projects/${projectId}/tasks/generate`, request);
    return response.data;
  },

  // Search tasks
  async searchTasks(request: TaskSearchRequest): Promise<TaskListItem[]> {
    const searchParams = new URLSearchParams();
    
    if (request.query) searchParams.append('query', request.query);
    if (request.status) request.status.forEach(s => searchParams.append('status', s));
    if (request.priority) request.priority.forEach(p => searchParams.append('priority', p));
    if (request.assignee_id !== undefined) searchParams.append('assignee_id', request.assignee_id.toString());
    if (request.parent_id !== undefined) searchParams.append('parent_id', request.parent_id.toString());
    if (request.has_subtasks !== undefined) searchParams.append('has_subtasks', request.has_subtasks.toString());
    if (request.has_dependencies !== undefined) searchParams.append('has_dependencies', request.has_dependencies.toString());
    if (request.due_date_from) searchParams.append('due_date_from', request.due_date_from);
    if (request.due_date_to) searchParams.append('due_date_to', request.due_date_to);
    if (request.created_from) searchParams.append('created_from', request.created_from);
    if (request.created_to) searchParams.append('created_to', request.created_to);
    if (request.skip !== undefined) searchParams.append('skip', request.skip.toString());
    if (request.limit !== undefined) searchParams.append('limit', request.limit.toString());
    if (request.sort_by) searchParams.append('sort_by', request.sort_by);
    if (request.sort_order) searchParams.append('sort_order', request.sort_order);
    
    const response = await api.get(`/tasks/search?${searchParams.toString()}`);
    return response.data;
  },

  // Search tasks within a project
  async searchProjectTasks(projectId: number, request: TaskSearchRequest): Promise<TaskListItem[]> {
    const searchParams = new URLSearchParams();
    
    if (request.query) searchParams.append('query', request.query);
    if (request.status) request.status.forEach(s => searchParams.append('status', s));
    if (request.priority) request.priority.forEach(p => searchParams.append('priority', p));
    if (request.assignee_id !== undefined) searchParams.append('assignee_id', request.assignee_id.toString());
    if (request.parent_id !== undefined) searchParams.append('parent_id', request.parent_id.toString());
    if (request.has_subtasks !== undefined) searchParams.append('has_subtasks', request.has_subtasks.toString());
    if (request.has_dependencies !== undefined) searchParams.append('has_dependencies', request.has_dependencies.toString());
    if (request.due_date_from) searchParams.append('due_date_from', request.due_date_from);
    if (request.due_date_to) searchParams.append('due_date_to', request.due_date_to);
    if (request.created_from) searchParams.append('created_from', request.created_from);
    if (request.created_to) searchParams.append('created_to', request.created_to);
    if (request.skip !== undefined) searchParams.append('skip', request.skip.toString());
    if (request.limit !== undefined) searchParams.append('limit', request.limit.toString());
    if (request.sort_by) searchParams.append('sort_by', request.sort_by);
    if (request.sort_order) searchParams.append('sort_order', request.sort_order);
    
    const response = await api.get(`/projects/${projectId}/tasks/search?${searchParams.toString()}`);
    return response.data;
  },

  // Get task statistics
  async getTaskStats(): Promise<TaskStats> {
    const response = await api.get('/tasks/stats');
    return response.data;
  },

  // Get project task statistics
  async getProjectTaskStats(projectId: number): Promise<TaskStats> {
    const response = await api.get(`/projects/${projectId}/tasks/stats`);
    return response.data;
  },

  // Get task logs
  async getTaskLogs(taskId: number, params?: {
    skip?: number;
    limit?: number;
  }): Promise<TaskLog[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const response = await api.get(`/tasks/${taskId}/logs?${searchParams.toString()}`);
    return response.data;
  },

  // Batch update tasks
  async batchUpdateTasks(data: TaskBatchUpdate): Promise<Task[]> {
    const response = await api.post('/tasks/batch/update', data);
    return response.data;
  },

  // Batch update task status
  async batchUpdateStatus(data: TaskBatchStatusUpdate): Promise<Task[]> {
    const response = await api.post('/tasks/batch/status', data);
    return response.data;
  },

  // Add task dependency
  async addDependency(taskId: number, dependsOnId: number): Promise<void> {
    await api.post(`/tasks/${taskId}/dependencies/${dependsOnId}`);
  },

  // Remove task dependency
  async removeDependency(taskId: number, dependsOnId: number): Promise<void> {
    await api.delete(`/tasks/${taskId}/dependencies/${dependsOnId}`);
  },

  // Helper methods
  async getTasksByStatus(status: TaskStatus, projectId?: number): Promise<TaskListItem[]> {
    if (projectId) {
      return this.getProjectTasks(projectId, {});
    }
    return this.getTasks({ status: [status] });
  },

  async getSubtasks(parentId: number, projectId?: number): Promise<TaskListItem[]> {
    if (projectId) {
      return this.getProjectTasks(projectId, { parent_id: parentId });
    }
    return this.getTasks({ parent_id: parentId });
  },

  async duplicateTask(taskId: number): Promise<Task> {
    const originalTask = await this.getTask(taskId);
    
    const duplicateData: TaskCreate = {
      title: `${originalTask.title} (副本)`,
      description: originalTask.description,
      details: originalTask.details,
      test_strategy: originalTask.test_strategy,
      priority: originalTask.priority,
      estimated_hours: originalTask.estimated_hours,
      project_id: originalTask.project_id,
      parent_id: originalTask.parent_id,
    };
    
    return this.createTask(duplicateData);
  },

  async moveTask(taskId: number, newParentId?: number): Promise<Task> {
    return this.updateTask(taskId, { parent_id: newParentId });
  },

  async getTaskCount(projectId?: number, status?: TaskStatus): Promise<number> {
    const tasks = await this.getTasks({ 
      project_id: projectId, 
      status: status ? [status] : undefined 
    });
    return tasks.length;
  },
};