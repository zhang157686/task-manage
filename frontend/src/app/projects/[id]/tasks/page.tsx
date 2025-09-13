'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreHorizontal,
  Grid3X3,
  List,
  Kanban,
  Download,
  Upload,
  Wand2,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

import { ProjectWithStats } from '@/types/project';
import { TaskListItem, TaskViewMode, TaskStats, TASK_VIEW_OPTIONS, TaskGenerateRequest } from '@/types/task';
import { projectsService } from '@/services/projects';
import { tasksService } from '@/services/tasks';
import { TaskListView } from '@/components/tasks/task-list-view';
import { TaskCardsView } from '@/components/tasks/task-cards-view';
import { TaskKanbanView } from '@/components/tasks/task-kanban-view';
import { TaskCreateDialog } from '@/components/tasks/task-create-dialog';
import { TaskGenerateDialog } from '@/components/tasks/task-generate-dialog';
import { TaskFilters } from '@/components/tasks/task-filters';

export default function ProjectTasksPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);
  
  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [viewMode, setViewMode] = useState<TaskViewMode>('list');
  const [selectedTasks, setSelectedTasks] = useState<number[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isGenerateDialogOpen, setIsGenerateDialogOpen] = useState(false);
  const [isFiltersOpen, setIsFiltersOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadInitialData();
    }
  }, [projectId]);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadProject(),
        loadTasks(false), // Don't show tasks loading during initial load
        loadTaskStats()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProject = async () => {
    try {
      const data = await projectsService.getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('加载项目失败');
      router.push('/projects');
      throw error;
    }
  };

  const loadTasks = async (showLoading = true) => {
    try {
      if (showLoading) setTasksLoading(true);
      const data = await tasksService.getProjectTasks(projectId);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('加载任务失败');
      throw error;
    } finally {
      if (showLoading) setTasksLoading(false);
    }
  };

  const loadTaskStats = async () => {
    try {
      const stats = await tasksService.getProjectTaskStats(projectId);
      setTaskStats(stats);
    } catch (error) {
      console.error('Failed to load task stats:', error);
      throw error;
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await tasksService.createProjectTask(projectId, taskData);
      toast.success('任务创建成功');
      setIsCreateDialogOpen(false);
      loadTasks(true);
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.response?.data?.detail || '创建任务失败');
    }
  };

  const handleGenerateTasks = async (request: TaskGenerateRequest) => {
    try {
      const result = await tasksService.generateTasks(projectId, request);
      if (result.success) {
        toast.success(`成功生成了 ${result.total_generated} 个任务`);
        setIsGenerateDialogOpen(false);
        loadTasks(true);
        loadTaskStats();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Failed to generate tasks:', error);
      toast.error(error.response?.data?.detail || '生成任务失败');
    }
  };

  const handleTaskUpdate = async (taskId: number, updates: any) => {
    try {
      await tasksService.updateTask(taskId, updates);
      toast.success('任务更新成功');
      loadTasks(true);
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to update task:', error);
      toast.error(error.response?.data?.detail || '更新任务失败');
    }
  };

  const handleTaskStatusChange = async (taskId: number, status: any) => {
    try {
      await tasksService.updateTaskStatus(taskId, status);
      toast.success('任务状态已更新');
      loadTasks(true);
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      toast.error(error.response?.data?.detail || '更新任务状态失败');
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    if (!confirm('确定要删除这个任务吗？')) {
      return;
    }

    try {
      await tasksService.deleteTask(taskId);
      toast.success('任务删除成功');
      loadTasks(true);
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast.error(error.response?.data?.detail || '删除任务失败');
    }
  };

  const handleBatchStatusUpdate = async (status: any) => {
    if (selectedTasks.length === 0) {
      toast.error('请选择要更新的任务');
      return;
    }

    try {
      await tasksService.batchUpdateStatus({
        task_ids: selectedTasks,
        status
      });
      toast.success(`已更新 ${selectedTasks.length} 个任务`);
      setSelectedTasks([]);
      loadTasks(true);
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to batch update tasks:', error);
      toast.error(error.response?.data?.detail || '更新任务失败');
    }
  };

  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const getViewModeIcon = (mode: TaskViewMode) => {
    switch (mode) {
      case 'list': return <List className="h-4 w-4" />;
      case 'cards': return <Grid3X3 className="h-4 w-4" />;
      case 'kanban': return <Kanban className="h-4 w-4" />;
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">加载任务中...</p>
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
            <Link href="/projects">返回项目列表</Link>
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
            <BreadcrumbLink href={`/projects/${project.id}`}>{project.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>任务</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">任务</h1>
          <p className="text-gray-600">管理 {project.name} 的任务</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadTasks(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wand2 className="h-4 w-4 mr-2" />
                生成任务
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>使用AI生成任务</DialogTitle>
                <DialogDescription>
                  基于您的项目描述，使用AI自动生成任务。
                </DialogDescription>
              </DialogHeader>
              <TaskGenerateDialog
                project={project}
                onGenerate={handleGenerateTasks}
                onCancel={() => setIsGenerateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
          
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                添加任务
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>创建新任务</DialogTitle>
                <DialogDescription>
                  为此项目添加一个新任务。
                </DialogDescription>
              </DialogHeader>
              <TaskCreateDialog
                projectId={projectId}
                onSubmit={handleCreateTask}
                onCancel={() => setIsCreateDialogOpen(false)}
              />
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Task Stats */}
      {taskStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold">{taskStats.total_tasks}</div>
              <p className="text-xs text-muted-foreground">总计</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{taskStats.pending_tasks}</div>
              <p className="text-xs text-muted-foreground">待处理</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{taskStats.in_progress_tasks}</div>
              <p className="text-xs text-muted-foreground">进行中</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{taskStats.review_tasks}</div>
              <p className="text-xs text-muted-foreground">待审核</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{taskStats.done_tasks}</div>
              <p className="text-xs text-muted-foreground">已完成</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{taskStats.blocked_tasks}</div>
              <p className="text-xs text-muted-foreground">已阻塞</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-400">{taskStats.cancelled_tasks}</div>
              <p className="text-xs text-muted-foreground">已取消</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Controls */}
      <div className="flex items-center justify-between space-x-4">
        <div className="flex items-center space-x-2 flex-1">
          <div className="relative flex-1 max-w-sm">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="搜索任务..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
          
          <Button
            variant="outline"
            onClick={() => setIsFiltersOpen(!isFiltersOpen)}
          >
            <Filter className="h-4 w-4 mr-2" />
            筛选
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {selectedTasks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  已选择 {selectedTasks.length} 个
                  <MoreHorizontal className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>批量操作</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('pending')}>
                  标记为待处理
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('in_progress')}>
                  标记为进行中
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('review')}>
                  标记为待审核
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('done')}>
                  标记为已完成
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('blocked')}>
                  标记为已阻塞
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('cancelled')}>
                  标记为已取消
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          <Tabs value={viewMode} onValueChange={(value) => setViewMode(value as TaskViewMode)}>
            <TabsList>
              {TASK_VIEW_OPTIONS.map((option) => (
                <TabsTrigger key={option.value} value={option.value}>
                  {getViewModeIcon(option.value)}
                  <span className="ml-2 hidden sm:inline">{option.label}</span>
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Filters */}
      {isFiltersOpen && (
        <Card>
          <CardContent className="p-4">
            <TaskFilters
              onFiltersChange={(filters) => {
                // TODO: Apply filters to task list
                console.log('Filters changed:', filters);
              }}
            />
          </CardContent>
        </Card>
      )}

      {/* Task Views */}
      <div className="min-h-[400px]">
        {viewMode === 'list' && (
          <TaskListView
            tasks={filteredTasks}
            loading={tasksLoading}
            selectedTasks={selectedTasks}
            onTaskSelect={setSelectedTasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskDelete={handleTaskDelete}
          />
        )}
        
        {viewMode === 'cards' && (
          <TaskCardsView
            tasks={filteredTasks}
            loading={tasksLoading}
            selectedTasks={selectedTasks}
            onTaskSelect={setSelectedTasks}
            onTaskUpdate={handleTaskUpdate}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskDelete={handleTaskDelete}
          />
        )}
        
        {viewMode === 'kanban' && (
          <TaskKanbanView
            tasks={filteredTasks}
            loading={tasksLoading}
            onTaskUpdate={handleTaskUpdate}
            onTaskStatusChange={handleTaskStatusChange}
            onTaskDelete={handleTaskDelete}
          />
        )}
      </div>
    </div>
  );
}