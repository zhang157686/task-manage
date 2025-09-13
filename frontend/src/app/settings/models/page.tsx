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
      toast.error('加载模型失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateModel = async (data: any) => {
    try {
      await modelsService.createModel(data);
      toast.success('模型创建成功');
      setIsCreateDialogOpen(false);
      loadModels();
    } catch (error: any) {
      console.error('Failed to create model:', error);
      toast.error(error.response?.data?.detail || '创建模型失败');
    }
  };

  const handleUpdateModel = async (data: any) => {
    if (!selectedModel) return;

    try {
      await modelsService.updateModel(selectedModel.id, data);
      toast.success('模型更新成功');
      setIsEditDialogOpen(false);
      setSelectedModel(null);
      loadModels();
    } catch (error: any) {
      console.error('Failed to update model:', error);
      toast.error(error.response?.data?.detail || '更新模型失败');
    }
  };

  const handleDeleteModel = async (model: AIModel) => {
    if (!confirm(`确定要删除模型 "${model.name}" 吗？`)) {
      return;
    }

    try {
      await modelsService.deleteModel(model.id);
      toast.success('模型删除成功');
      loadModels();
    } catch (error: any) {
      console.error('Failed to delete model:', error);
      toast.error(error.response?.data?.detail || '删除模型失败');
    }
  };

  const handleSetDefault = async (model: AIModel) => {
    try {
      await modelsService.setDefaultModel(model.id);
      toast.success(`"${model.name}" 已设为默认模型`);
      loadModels();
    } catch (error: any) {
      console.error('Failed to set default model:', error);
      toast.error(error.response?.data?.detail || '设置默认模型失败');
    }
  };

  const handleToggleStatus = async (model: AIModel) => {
    try {
      await modelsService.toggleModelStatus(model.id, !model.is_active);
      toast.success(`模型${model.is_active ? '已禁用' : '已启用'}`);
      loadModels();
    } catch (error: any) {
      console.error('Failed to toggle model status:', error);
      toast.error(error.response?.data?.detail || '切换模型状态失败');
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
            <p className="mt-2 text-sm text-gray-600">加载模型中...</p>
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
          <h1 className="text-3xl font-bold">AI模型配置</h1>
          <p className="text-gray-600 mt-1">
            管理用于任务生成的AI模型配置
          </p>
        </div>
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              添加模型
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>添加新的AI模型</DialogTitle>
              <DialogDescription>
                配置用于任务生成和管理的新AI模型。
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
            <CardTitle className="text-sm font-medium">模型总数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{models.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">活跃模型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {models.filter(m => m.is_active).length}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">默认模型</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-sm font-medium">
              {models.find(m => m.is_default)?.name || '无'}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Models Table */}
      <Card>
        <CardHeader>
          <CardTitle>模型配置</CardTitle>
          <CardDescription>
            管理您的AI模型设置和配置
          </CardDescription>
        </CardHeader>
        <CardContent>
          {models.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">尚未配置任何模型</p>
              <Button onClick={() => setIsCreateDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                添加您的第一个模型
              </Button>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>名称</TableHead>
                  <TableHead>提供商</TableHead>
                  <TableHead>模型ID</TableHead>
                  <TableHead>API密钥</TableHead>
                  <TableHead>状态</TableHead>
                  <TableHead>操作</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {models.map((model) => (
                  <TableRow key={model.id}>
                    <TableCell>
                      <div className="flex items-center space-x-2">
                        <span className="font-medium">{model.name}</span>
                        {model.is_default && (
                          <Badge variant="secondary">默认</Badge>
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
                        {model.is_active ? '活跃' : '非活跃'}
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
            <DialogTitle>编辑模型</DialogTitle>
            <DialogDescription>
              更新 "{selectedModel?.name}" 的配置
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