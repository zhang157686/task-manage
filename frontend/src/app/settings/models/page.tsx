'use client';

import { useState, useEffect } from 'react';
import { Plus, Settings, Trash2, TestTube, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { AIModel } from '@/types/models';
import { modelsService } from '@/services/models';
import { ModelForm } from '@/components/models/model-form';
import { ModelTestDialog } from '@/components/models/model-test-dialog';

export default function ModelsPage() {
  const [models, setModels] = useState<AIModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedModel, setSelectedModel] = useState<AIModel | null>(null);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isTestDialogOpen, setIsTestDialogOpen] = useState(false);
  const [showApiKeys, setShowApiKeys] = useState<Record<number, boolean>>({});

  // Load models on component mount
  useEffect(() => {
    loadModels();
  }, []);

  const loadModels = async () => {
    try {
      setLoading(true);
      const data = await modelsService.getModels();
      setModels(data);
    } catch (error) {
      console.error('Failed to load models:', error);
      toast.error('Failed to load models');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (data: any) => {
    try {
      await modelsService.createModel(data);
      toast.success('Model created successfully');
      setIsCreateDialogOpen(false);
      loadModels();
    } catch (error: any) {
      console.error('Failed to create model:', error);
      toast.error(error.response?.data?.detail || 'Failed to create model');
    }
  };

  const handleUpdateModel = async (data: any) => {
    if (!selectedModel) return;

    try {
      await modelsService.updateModel(selectedModel.id, data);
      toast.success('Model updated successfully');
      setIsEditDialogOpen(false);
      setSelectedModel(null);
      loadModels();
    } catch (error: any) {
      console.error('Failed to update model:', error);
      toast.error(error.response?.data?.detail || 'Failed to update model');
    }
  };

  const handleDeleteModel = async (model: AIModel) => {
    if (!confirm(`Are you sure you want to delete "${model.name}"?`)) {
      return;
    }

    try {
      await modelsService.deleteModel(model.id);
      toast.success('Model deleted successfully');
      loadModels();
    } catch (error: any) {
      console.error('Failed to delete model:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete model');
    }
  };

  const handleSetDefault = async (model: AIModel) => {
    try {
      await modelsService.setDefaultModel(model.id);
      toast.success(`"${model.name}" set as default model`);
      loadModels();
    } catch (error: any) {
      console.error('Failed to set default model:', error);
      toast.error(error.response?.data?.detail || 'Failed to set default model');
    }
  };

  const handleToggleStatus = async (model: AIModel) => {
    try {
      await modelsService.toggleModelStatus(model.id, !model.is_active);
      toast.success(`Model ${model.is_active ? 'disabled' : 'enabled'} successfully`);
      loadModels();
    } catch (error: any) {
      console.error('Failed to toggle model status:', error);
      toast.error(error.response?.data?.detail || 'Failed to toggle model status');
    }
  };

  const toggleApiKeyVisibility = (modelId: number) => {
    setShowApiKeys(prev => ({
      ...prev,
      [modelId]: !prev[modelId]
    }));
  };

  const formatApiKey = (apiKey: string, modelId: number) => {
    if (showApiKeys[modelId]) {
      return apiKey;
    }
    return '***';
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading models...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">AI Models</h1>
          <p className="text-gray-600 mt-1">
            Manage your AI model configurations for task generation
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Model
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New AI Model</DialogTitle>
              <DialogDescription>
                Configure a new AI model for task generation and management.
              </DialogDescription>
            </DialogHeader>
            <ModelForm onSubmit={handleCreateModel} />
          </DialogContent>
        </Dialog>
      </div>

      {/* Models Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Active Models</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {models.filter(m => m.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Default Model</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {models.find(m => m.is_default)?.name || 'None'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models Table */}
      <Card>
        <CardHeader>
          <CardTitle>Model Configurations</CardTitle>
          <CardDescription>
            Manage your AI model settings and configurations
          </CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No models configured yet</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Model
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Name</TableHead>
                  <TableHead>Provider</TableHead>
                  <TableHead>Model ID</TableHead>
                  <TableHead>API Key</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{model.name}</span>
                        {model.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {model.provider}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {model.model_id}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-mono text-sm">
                          {formatApiKey(model.api_key, model.id)}
                        </span>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => toggleApiKeyVisibility(model.id)}
                        >
                          {showApiKeys[model.id] ? (
                            <EyeOff className="h-3 w-3" />
                          ) : (
                            <Eye className="h-3 w-3" />
                          )}
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge
                        variant={model.is_active ? 'default' : 'secondary'}
                        className={model.is_active ? 'bg-green-100 text-green-800' : ''}
                      >
                        {model.is_active ? 'Active' : 'Inactive'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedModel(model);
                            setIsTestDialogOpen(true);
                          }}
                        >
                          <TestTube className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedModel(model);
                            setIsEditDialogOpen(true);
                          }}
                        >
                          <Settings className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteModel(model)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Edit Model Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit Model</DialogTitle>
            <DialogDescription>
              Update the configuration for "{selectedModel?.name}"
            </DialogDescription>
          </DialogHeader>
          {selectedModel && (
            <ModelForm
              initialData={selectedModel}
              onSubmit={handleUpdateModel}
              isEditing
            />
          )}
        </DialogContent>
      </Dialog>

      {/* Test Model Dialog */}
      {selectedModel && (
        <ModelTestDialog
          model={selectedModel}
          open={isTestDialogOpen}
          onOpenChange={setIsTestDialogOpen}
        />
      )}
    </div>
  );
}