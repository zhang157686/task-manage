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
      toast.error('Failed to load project');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProject = async (data: any) => {
    try {
      await projectsService.updateProject(projectId, data);
      toast.success('Project updated successfully');
      setIsEditDialogOpen(false);
      loadProject();
    } catch (error: any) {
      console.error('Failed to update project:', error);
      toast.error(error.response?.data?.detail || 'Failed to update project');
    }
  };

  const handleDeleteProject = async () => {
    if (!project || !confirm(`Are you sure you want to delete "${project.name}"?`)) {
      return;
    }

    try {
      await projectsService.deleteProject(project.id);
      toast.success('Project deleted successfully');
      router.push('/projects');
    } catch (error: any) {
      console.error('Failed to delete project:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete project');
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
                <DialogTitle>Edit Project</DialogTitle>
                <DialogDescription>
                  Update the project information and settings.
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
              Settings
            </Link>
          </Button>

          <Button variant="outline" onClick={handleDuplicateProject}>
            <Copy className="h-4 w-4 mr-2" />
            Duplicate
          </Button>

          <Button variant="outline" onClick={handleDeleteProject}>
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </div>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Tasks</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{project.stats.total_tasks}</div>
            <p className="text-xs text-muted-foreground">
              {project.stats.pending_tasks} pending, {project.stats.in_progress_tasks} in progress
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Completed</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{project.stats.completed_tasks}</div>
            <p className="text-xs text-muted-foreground">
              {project.stats.completion_percentage.toFixed(1)}% completion rate
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Created</CardTitle>
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
            <CardTitle className="text-sm font-medium">Last Activity</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {project.stats.last_activity ? 'Recent' : 'None'}
            </div>
            <p className="text-xs text-muted-foreground">
              {project.stats.last_activity
                ? formatDate(project.stats.last_activity)
                : 'No recent activity'
              }
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      {project.stats.total_tasks > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Progress Overview</CardTitle>
            <CardDescription>
              Task completion progress for this project
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progress</span>
                <span>{project.stats.completion_percentage.toFixed(1)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div
                  className="bg-blue-600 h-3 rounded-full transition-all"
                  style={{ width: `${project.stats.completion_percentage}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-500">
                <span>{project.stats.completed_tasks} completed</span>
                <span>{project.stats.total_tasks - project.stats.completed_tasks} remaining</span>
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
            <CardTitle>Project Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <h4 className="text-sm font-medium text-gray-500">Status</h4>
              <div className="mt-1">
                {getStatusBadge(project.status)}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Visibility</h4>
              <p className="mt-1">{project.is_public ? 'Public' : 'Private'}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Created</h4>
              <p className="mt-1">{formatDate(project.created_at)}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Last Updated</h4>
              <p className="mt-1">{formatDate(project.updated_at)}</p>
            </div>
          </CardContent>
        </Card>

        {/* Project Links & Settings */}
        <Card>
          <CardHeader>
            <CardTitle>Links & Configuration</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {project.repository_url && (
              <div>
                <h4 className="text-sm font-medium text-gray-500">Repository</h4>
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
                <h4 className="text-sm font-medium text-gray-500">Documentation</h4>
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
              <h4 className="text-sm font-medium text-gray-500">AI Output Language</h4>
              <p className="mt-1">{project.settings.ai_output_language}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Task Template</h4>
              <p className="mt-1">{project.settings.task_format_template}</p>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500">Default Priority</h4>
              <p className="mt-1 capitalize">{project.settings.default_priority}</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>
            Common actions for this project
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild>
              <Link href={`/projects/${project.id}/tasks`}>
                View Tasks
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.id}/tasks/new`}>
                Add Task
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.id}/reports`}>
                View Reports
              </Link>
            </Button>
            <Button variant="outline" asChild>
              <Link href={`/projects/${project.id}/settings`}>
                Project Settings
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}