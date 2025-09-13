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
      loadProject();
      loadTasks();
      loadTaskStats();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectsService.getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
      router.push('/projects');
    }
  };

  const loadTasks = async () => {
    try {
      setTasksLoading(true);
      const data = await tasksService.getProjectTasks(projectId);
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('Failed to load tasks');
    } finally {
      setTasksLoading(false);
    }
  };

  const loadTaskStats = async () => {
    try {
      const stats = await tasksService.getProjectTaskStats(projectId);
      setTaskStats(stats);
    } catch (error) {
      console.error('Failed to load task stats:', error);
    }
  };

  const handleCreateTask = async (taskData: any) => {
    try {
      await tasksService.createProjectTask(projectId, taskData);
      toast.success('Task created successfully');
      setIsCreateDialogOpen(false);
      loadTasks();
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to create task:', error);
      toast.error(error.response?.data?.detail || 'Failed to create task');
    }
  };

  const handleGenerateTasks = async (request: TaskGenerateRequest) => {
    try {
      const result = await tasksService.generateTasks(projectId, request);
      if (result.success) {
        toast.success(`Successfully generated ${result.total_generated} tasks`);
        setIsGenerateDialogOpen(false);
        loadTasks();
        loadTaskStats();
      } else {
        toast.error(result.message);
      }
    } catch (error: any) {
      console.error('Failed to generate tasks:', error);
      toast.error(error.response?.data?.detail || 'Failed to generate tasks');
    }
  };

  const handleTaskUpdate = async (taskId: number, updates: any) => {
    try {
      await tasksService.updateTask(taskId, updates);
      toast.success('Task updated successfully');
      loadTasks();
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to update task:', error);
      toast.error(error.response?.data?.detail || 'Failed to update task');
    }
  };

  const handleTaskStatusChange = async (taskId: number, status: any) => {
    try {
      await tasksService.updateTaskStatus(taskId, status);
      toast.success('Task status updated');
      loadTasks();
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to update task status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update task status');
    }
  };

  const handleTaskDelete = async (taskId: number) => {
    if (!confirm('Are you sure you want to delete this task?')) {
      return;
    }

    try {
      await tasksService.deleteTask(taskId);
      toast.success('Task deleted successfully');
      loadTasks();
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast.error(error.response?.data?.detail || 'Failed to delete task');
    }
  };

  const handleBatchStatusUpdate = async (status: any) => {
    if (selectedTasks.length === 0) {
      toast.error('Please select tasks to update');
      return;
    }

    try {
      await tasksService.batchUpdateStatus({
        task_ids: selectedTasks,
        status
      });
      toast.success(`Updated ${selectedTasks.length} tasks`);
      setSelectedTasks([]);
      loadTasks();
      loadTaskStats();
    } catch (error: any) {
      console.error('Failed to batch update tasks:', error);
      toast.error(error.response?.data?.detail || 'Failed to update tasks');
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
            <p className="mt-2 text-sm text-gray-600">Loading tasks...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Project not found</h2>
          <p className="text-gray-600 mt-2">The project you're looking for doesn't exist.</p>
          <Button asChild className="mt-4">
            <Link href="/projects">Back to Projects</Link>
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
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${project.id}`}>{project.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Tasks</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Tasks</h1>
          <p className="text-gray-600">Manage tasks for {project.name}</p>
        </div>
        
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadTasks()}>
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          
          <Dialog open={isGenerateDialogOpen} onOpenChange={setIsGenerateDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Wand2 className="h-4 w-4 mr-2" />
                Generate Tasks
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Generate Tasks with AI</DialogTitle>
                <DialogDescription>
                  Use AI to automatically generate tasks based on your project description.
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
                Add Task
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create New Task</DialogTitle>
                <DialogDescription>
                  Add a new task to this project.
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
              <p className="text-xs text-muted-foreground">Total</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-600">{taskStats.pending_tasks}</div>
              <p className="text-xs text-muted-foreground">Pending</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-blue-600">{taskStats.in_progress_tasks}</div>
              <p className="text-xs text-muted-foreground">In Progress</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-yellow-600">{taskStats.review_tasks}</div>
              <p className="text-xs text-muted-foreground">Review</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-green-600">{taskStats.done_tasks}</div>
              <p className="text-xs text-muted-foreground">Done</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-red-600">{taskStats.blocked_tasks}</div>
              <p className="text-xs text-muted-foreground">Blocked</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <div className="text-2xl font-bold text-gray-400">{taskStats.cancelled_tasks}</div>
              <p className="text-xs text-muted-foreground">Cancelled</p>
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
              placeholder="Search tasks..."
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
            Filters
          </Button>
        </div>

        <div className="flex items-center space-x-2">
          {selectedTasks.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  {selectedTasks.length} selected
                  <MoreHorizontal className="h-4 w-4 ml-2" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuLabel>Batch Actions</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('pending')}>
                  Mark as Pending
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('in_progress')}>
                  Mark as In Progress
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('review')}>
                  Mark as Review
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('done')}>
                  Mark as Done
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('blocked')}>
                  Mark as Blocked
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleBatchStatusUpdate('cancelled')}>
                  Mark as Cancelled
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