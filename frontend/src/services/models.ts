/**
 * AI Models API services
 */

import api from '@/lib/api';
import {
  AIModel,
  AIModelCreate,
  AIModelUpdate,
  AIModelTestRequest,
  AIModelTestResponse,
} from '@/types/models';

export const modelsService = {
  // Get all models for the current user
  async getModels(): Promise<AIModel[]> {
    const response = await api.get('/models');
    return response.data;
  },

  // Get a specific model by ID
  async getModel(id: number): Promise<AIModel> {
    const response = await api.get(`/models/${id}`);
    return response.data;
  },

  // Create a new model
  async createModel(data: AIModelCreate): Promise<AIModel> {
    const response = await api.post('/models', data);
    return response.data;
  },

  // Update an existing model
  async updateModel(id: number, data: AIModelUpdate): Promise<AIModel> {
    const response = await api.put(`/models/${id}`, data);
    return response.data;
  },

  // Delete a model
  async deleteModel(id: number): Promise<void> {
    await api.delete(`/models/${id}`);
  },

  // Test model connection
  async testModel(id: number, testRequest?: AIModelTestRequest): Promise<AIModelTestResponse> {
    const response = await api.post(`/models/${id}/test`, testRequest || {});
    return response.data;
  },

  // Set model as default
  async setDefaultModel(id: number): Promise<AIModel> {
    const response = await api.put(`/models/${id}`, { is_default: true });
    return response.data;
  },

  // Toggle model active status
  async toggleModelStatus(id: number, isActive: boolean): Promise<AIModel> {
    const response = await api.put(`/models/${id}`, { is_active: isActive });
    return response.data;
  },
};