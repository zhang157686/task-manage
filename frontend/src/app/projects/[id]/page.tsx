'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  ArrowLeft,
  Settings,
  Edit,
  Trash2,
  Copy,
  ExternalLink,
  Calendar,
  Users,
  Target,
  TrendingUp,
  Clock
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';

import { ProjectWithStats, PROJECT_STATUS_OPTIONS } from '@/types/project';
import { projectsService } from '@/services/projects';
import { ProjectForm } from '@/components/projects/project-form';

export default function ProjectDetailPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('加载项目失败');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (data: any) => {
    try {
      await projectsService.updateProject(projectId, data);
      toast.success('项目更新成功');
      setIsEditDialogOpen(false);
      loadProject();
    } catch (error: any) {
      console.error('Failed to update project:', error);
      toast.error(error.response?.data?.detail || '更新项目失败');
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !confirm(`确定要删除项目"${project.name}"吗？`)) {
      return;
    }

    try {
      await projectsService.deleteProject(project.id);
      toast.success('项目删除成功');
      router.push('/projects');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      toast.error(error.response?.data?.detail || '删除项目失败');
    }
  };

  const handleDuplicateProject = async () => {
    if (!project) return;

    try {
      const newProject = await projectsService.duplicateProject(project.id);
      toast.success('项目复制成功');
      router.push(`/projects/${newProject.id}`);
    } catch (error: any) {
      console.error('Failed to duplicate project:', error);
      toast.error(error.response?.data?.detail || '复制项目失败');
    }
  };

  const getStatusBadge = (status: string) => {
    const statusOption = PROJECT_STATUS_OPTIONS.find(opt => opt.value === status);
    return (
      <Badge variant="secondary" className={statusOption?.color}>
        {statusOption?.label || status}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">加载项目中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">项目未找到</h2>
          <p className="text-gray-600 mt-2">您查找的项目不存在。</p>
          <Button asChild className="mt-4">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回项目列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">项目</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>{project.name}</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {getStatusBadge(project.status)}
            {project.is_public && (
              <Badge variant="outline">公开</Badge>
            )}
          </div>
          {project.description && (
            <p className="text-gray-600 text-lg">{project.description}</p>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Edit className="h-4 w-4 mr-2" />
                编辑
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>编辑项目</DialogTitle>
                <DialogDescription>
                  更新项目信息和设置。
                </DialogDescription>
              </DialogHeader>
              <ProjectForm
                initialData={project}
                onSubmit={handleUpdateProject}
                isEditing
              />
            </DialogContent>
          </Dialog>

          <Button variant="outline" asChild>
            <Link href={`/projects/${project.id}/settings`}>
              <Settings className="h-4 w-4 mr-2" />
              设置
            </Link>
          </Button>

          <Button variant="outline" onClick={handleDuplicateProject}>
            <Copy className="h-4 w-4 mr-2" />
            复制
          </Button>

          <Button variant="outline" onClick={handleDeleteProject}>
            <Trash2 className="h-4 w-4 mr-2" />
            删除
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总任务数</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.stats.total_tasks}</div>
            <p className="text-xs text-muted-foreground">
              {project.stats.pending_tasks} 待处理，{project.stats.in_progress_tasks} 进行中
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{project.stats.completed_tasks}</div>
            <p className="text-xs text-muted-foreground">
              {project.stats.completion_percentage.toFixed(1)}% 完成率
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">创建时间</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(project.created_at).split(' ')[0]}</div>
            <p className="text-xs text-muted-foreground">
              {formatDate(project.created_at)}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">最近活动</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.stats.last_activity ? '最近' : '无'}
            </div>
            <p className="text-xs text-muted-foreground">
              {project.stats.last_activity
                ? formatDate(project.stats.last_activity)
                : '暂无活动'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {project.stats.total_tasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>进度概览</CardTitle>
            <CardDescription>
              该项目的任务完成进度
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>进度</span>
                <span>{project.stats.completion_percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${project.stats.completion_percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{project.stats.completed_tasks} 已完成</span>
                <span>{project.stats.total_tasks - project.stats.completed_tasks} 剩余</span>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Project Information */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Details */}
        <Card>
          <CardHeader>
            <CardTitle>项目详情</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">状态</h4>
              <div className="mt-1">
                {getStatusBadge(project.status)}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">可见性</h4>
              <p className="mt-1">{project.is_public ? '公开' : '私有'}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">创建时间</h4>
              <p className="mt-1">{formatDate(project.created_at)}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">最后更新</h4>
              <p className="mt-1">{formatDate(project.updated_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Project Links & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>链接与配置</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.repository_url && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">代码仓库</h4>
                <a
                  href={project.repository_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center text-blue-600 hover:text-blue-800"
                >
                  {project.repository_url}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}

            {project.documentation_url && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">文档</h4>
                <a
                  href={project.documentation_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-1 flex items-center text-blue-600 hover:text-blue-800"
                >
                  {project.documentation_url}
                  <ExternalLink className="h-3 w-3 ml-1" />
                </a>
              </div>
            )}

            <Separator />

            <div>
              <h4 className="text-sm font-medium text-gray-500">AI输出语言</h4>
              <p className="mt-1">{project.settings.ai_output_language}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">任务模板</h4>
              <p className="mt-1">
                {project.settings.task_format_template === 'standard' ? '标准格式' :
                 project.settings.task_format_template === 'detailed' ? '详细格式' :
                 project.settings.task_format_template === 'simple' ? '简单格式' :
                 project.settings.task_format_template === 'agile' ? '敏捷格式' :
                 project.settings.task_format_template}
              </p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">默认优先级</h4>
              <p className="mt-1 capitalize">
                {project.settings.default_priority === 'low' ? '低' :
                 project.settings.default_priority === 'medium' ? '中' :
                 project.settings.default_priority === 'high' ? '高' :
                 project.settings.default_priority === 'urgent' ? '紧急' :
                 project.settings.default_priority}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快捷操作</CardTitle>
          <CardDescription>
            该项目的常用操作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/projects/${project.id}/tasks`}>
                查看任务
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.id}/tasks/new`}>
                添加任务
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.id}/reports`}>
                查看报告
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.id}/settings`}>
                项目设置
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}