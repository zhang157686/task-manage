/**
 * Project Progress API services
 */

import api from '@/lib/api';
import {
  ProjectProgress,
  ProjectProgressWithHistory,
  ProgressHistory,
  ProjectProgressStats,
  ProgressVersionCompare,
  ProjectProgressCreate,
  ProjectProgressUpdate,
  ProgressSearchRequest,
  ProgressExportRequest,
  ProgressExportResponse,
} from '@/types/project-progress';

export const projectProgressService = {
  // Get project progress document
  async getProgress(projectId: number): Promise<ProjectProgress> {
    const response = await api.get(`/projects/${projectId}/progress`);
    return response.data;
  },

  // Get project progress with history
  async getProgressWithHistory(
    projectId: number, 
    historyLimit: number = 10
  ): Promise<ProjectProgressWithHistory> {
    const response = await api.get(
      `/projects/${projectId}/progress/with-history?history_limit=${historyLimit}`
    );
    return response.data;
  },

  // Create project progress document
  async createProgress(
    projectId: number, 
    data: ProjectProgressCreate
  ): Promise<ProjectProgress> {
    const response = await api.post(`/projects/${projectId}/progress`, data);
    return response.data;
  },

  // Update project progress document
  async updateProgress(
    projectId: number, 
    data: ProjectProgressUpdate
  ): Promise<ProjectProgress> {
    const response = await api.put(`/projects/${projectId}/progress`, data);
    return response.data;
  },

  // Delete project progress document
  async deleteProgress(projectId: number): Promise<void> {
    await api.delete(`/projects/${projectId}/progress`);
  },

  // Get progress history
  async getProgressHistory(
    projectId: number,
    params?: { skip?: number; limit?: number }
  ): Promise<ProgressHistory[]> {
    const searchParams = new URLSearchParams();
    
    if (params?.skip !== undefined) searchParams.append('skip', params.skip.toString());
    if (params?.limit !== undefined) searchParams.append('limit', params.limit.toString());
    
    const response = await api.get(
      `/projects/${projectId}/progress/history?${searchParams.toString()}`
    );
    return response.data;
  },

  // Get specific version
  async getProgressVersion(
    projectId: number, 
    version: number
  ): Promise<ProgressHistory> {
    const response = await api.get(`/projects/${projectId}/progress/version/${version}`);
    return response.data;
  },

  // Compare versions
  async compareVersions(
    projectId: number, 
    versionA: number, 
    versionB: number
  ): Promise<ProgressVersionCompare> {
    const response = await api.get(
      `/projects/${projectId}/progress/compare/${versionA}/${versionB}`
    );
    return response.data;
  },

  // Get progress statistics
  async getProgressStats(projectId: number): Promise<ProjectProgressStats> {
    const response = await api.get(`/projects/${projectId}/progress/stats`);
    return response.data;
  },

  // Restore to specific version
  async restoreVersion(
    projectId: number, 
    version: number, 
    changeSummary?: string
  ): Promise<ProjectProgress> {
    const params = changeSummary ? `?change_summary=${encodeURIComponent(changeSummary)}` : '';
    const response = await api.post(`/projects/${projectId}/progress/restore/${version}${params}`);
    return response.data;
  },

  // Publish progress document
  async publishProgress(projectId: number): Promise<ProjectProgress> {
    const response = await api.post(`/projects/${projectId}/progress/publish`);
    return response.data;
  },

  // Unpublish progress document
  async unpublishProgress(projectId: number): Promise<ProjectProgress> {
    const response = await api.post(`/projects/${projectId}/progress/unpublish`);
    return response.data;
  },

  // Search progress documents
  async searchProgress(request: ProgressSearchRequest): Promise<ProjectProgress[]> {
    const response = await api.post('/projects/progress/search', request);
    return response.data;
  },

  // Export progress document
  async exportProgress(
    projectId: number, 
    request: ProgressExportRequest
  ): Promise<ProgressExportResponse> {
    const response = await api.post(`/projects/${projectId}/progress/export`, request);
    return response.data;
  },

  // Helper methods
  async getOrCreateProgress(projectId: number): Promise<ProjectProgress> {
    try {
      return await this.getProgress(projectId);
    } catch (error: any) {
      if (error.response?.status === 404) {
        // Create empty progress document
        return await this.createProgress(projectId, {
          content: '# Project Progress\n\nThis document tracks the progress of the project.\n\n## Overview\n\n*Add your project overview here...*\n\n## Recent Updates\n\n*Add recent updates here...*',
          is_published: false,
          change_summary: 'Initial progress document creation',
        });
      }
      throw error;
    }
  },

  async togglePublishStatus(projectId: number): Promise<ProjectProgress> {
    const progress = await this.getProgress(projectId);
    
    if (progress.is_published) {
      return await this.unpublishProgress(projectId);
    } else {
      return await this.publishProgress(projectId);
    }
  },

  async duplicateProgress(
    sourceProjectId: number, 
    targetProjectId: number
  ): Promise<ProjectProgress> {
    const sourceProgress = await this.getProgress(sourceProjectId);
    
    return await this.createProgress(targetProjectId, {
      content: sourceProgress.content,
      is_published: false,
      change_summary: `Duplicated from project ${sourceProjectId}`,
    });
  },

  async getProgressCount(params?: { is_published?: boolean }): Promise<number> {
    const searchRequest: ProgressSearchRequest = {
      is_published: params?.is_published,
      limit: 1000, // Get all to count
    };
    
    const results = await this.searchProgress(searchRequest);
    return results.length;
  },

  // Batch operations
  async batchUpdateProgress(
    updates: Array<{ projectId: number; data: ProjectProgressUpdate }>
  ): Promise<ProjectProgress[]> {
    const promises = updates.map(({ projectId, data }) => 
      this.updateProgress(projectId, data)
    );
    
    return Promise.all(promises);
  },

  async batchPublishProgress(projectIds: number[]): Promise<ProjectProgress[]> {
    const promises = projectIds.map(projectId => 
      this.publishProgress(projectId)
    );
    
    return Promise.all(promises);
  },
};