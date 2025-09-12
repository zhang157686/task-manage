/**
 * Projects API services
 */

import api from '@/lib/api';
import {
  Project,
  ProjectWithStats,
  ProjectListItem,
  ProjectCreate,
  ProjectUpdate,
  ProjectStats,
  ProjectSettingsUpdate,
  ProjectStatus,
} from '@/types/project';

export const projectsService = {
  // Get all projects for the current user
  async getProjects(params?: {
    skip?: number;
    limit?: number;
    status?: ProjectStatus;
    search?: string;
  }): Promise<ProjectListItem[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    if (params?.status) searchParams.append('status', params.status);
    if (params?.search) searchParams.append('search', params.search);
    
    const response = await api.get(`/projects?${searchParams.toString()}`);
    return response.data;
  },

  // Get a specific project by ID
  async getProject(id: number): Promise<ProjectWithStats> {
    const response = await api.get(`/projects/${id}`);
    return response.data;
  },

  // Create a new project
  async createProject(data: ProjectCreate): Promise<Project> {
    const response = await api.post('/projects', data);
    return response.data;
  },

  // Update an existing project
  async updateProject(id: number, data: ProjectUpdate): Promise<Project> {
    const response = await api.put(`/projects/${id}`, data);
    return response.data;
  },

  // Delete a project (soft delete by default)
  async deleteProject(id: number, hardDelete: boolean = false): Promise<void> {
    const params = hardDelete ? '?hard_delete=true' : '';
    await api.delete(`/projects/${id}${params}`);
  },

  // Restore a soft-deleted project
  async restoreProject(id: number): Promise<Project> {
    const response = await api.post(`/projects/${id}/restore`);
    return response.data;
  },

  // Get project statistics
  async getProjectStats(id: number): Promise<ProjectStats> {
    const response = await api.get(`/projects/${id}/stats`);
    return response.data;
  },

  // Get project settings
  async getProjectSettings(id: number): Promise<Record<string, any>> {
    const response = await api.get(`/projects/${id}/settings`);
    return response.data;
  },

  // Update project settings
  async updateProjectSettings(id: number, settings: ProjectSettingsUpdate): Promise<Project> {
    const response = await api.put(`/projects/${id}/settings`, settings);
    return response.data;
  },

  // Duplicate a project
  async duplicateProject(id: number, newName?: string): Promise<Project> {
    const originalProject = await this.getProject(id);
    
    const duplicateData: ProjectCreate = {
      name: newName || `${originalProject.name} (副本)`,
      description: originalProject.description,
      status: 'active',
      repository_url: originalProject.repository_url,
      documentation_url: originalProject.documentation_url,
      is_public: false, // Always create duplicates as private
      settings: originalProject.settings,
    };
    
    return this.createProject(duplicateData);
  },

  // Get project count by status
  async getProjectCount(status?: ProjectStatus): Promise<number> {
    const projects = await this.getProjects({ status });
    return projects.length;
  },
};