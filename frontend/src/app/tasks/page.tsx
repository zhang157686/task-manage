'use client';

import { useState, useEffect } from 'react';
import { Plus, Search, Filter, MoreHorizontal, CheckCircle, Clock, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { TaskListItem, TaskStats, TaskStatus } from '@/types/task';
import { tasksService } from '@/services/tasks';
import { TaskListView } from '@/components/tasks/task-list-view';

export default function TasksPage() {
  const [loading, setLoading] = useState(true);
  const [tasksLoading, setTasksLoading] = useState(false);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    setLoading(true);
    try {
      await Promise.all([
        loadTasks(false),
        loadTaskStats()
      ]);
    } catch (error) {
      console.error('Failed to load initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadTasks = async (showLoading = true) => {
    try {
      if (showLoading) setTasksLoading(true);
      const statusArray = statusFilter === 'all' ? undefined : [statusFilter as TaskStatus];
      const data = await tasksService.getTasks({ status: statusArray });
      setTasks(data);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('加载任务失败');
    } finally {
      if (showLoading) setTasksLoading(false);
    }
  };

  const loadTaskStats = async () => {
    try {
      const stats = await tasksService.getTaskStats();
      setTaskStats(stats);
    } catch (error) {
      console.error('Failed to load task stats:', error);
      toast.error('加载任务统计失败');
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

  const handleTaskStatusChange = async (taskId: number, status: TaskStatus) => {
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

  // Filter tasks based on search query
  const filteredTasks = tasks.filter(task =>
    task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    task.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Reload tasks when status filter changes
  useEffect(() => {
    if (!loading) {
      loadTasks(true);
    }
  }, [statusFilter]);

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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">任务管理</h1>
          <p className="text-gray-600 mt-1">
            管理和跟踪所有项目的任务
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => loadTasks(true)}>
            <RefreshCw className="h-4 w-4 mr-2" />
            刷新
          </Button>
          <Button asChild>
            <Link href="/projects/new">
              <Plus className="h-4 w-4 mr-2" />
              创建项目
            </Link>
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center space-x-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="搜索任务..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="h-4 w-4 mr-2" />
            <SelectValue placeholder="筛选状态" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">所有状态</SelectItem>
            <SelectItem value="pending">待处理</SelectItem>
            <SelectItem value="in_progress">进行中</SelectItem>
            <SelectItem value="review">待审核</SelectItem>
            <SelectItem value="done">已完成</SelectItem>
            <SelectItem value="blocked">已阻塞</SelectItem>
            <SelectItem value="cancelled">已取消</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Task Overview */}
      {taskStats && (
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">总任务数</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{taskStats.total_tasks}</div>
              <p className="text-xs text-muted-foreground">
                {taskStats.total_tasks === 0 ? '暂无任务' : '所有任务'}
              </p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">待处理</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{taskStats.pending_tasks}</div>
              <p className="text-xs text-muted-foreground">等待开始</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">进行中</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{taskStats.in_progress_tasks}</div>
              <p className="text-xs text-muted-foreground">活跃任务</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">待审核</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{taskStats.review_tasks}</div>
              <p className="text-xs text-muted-foreground">等待审核</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">已完成</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{taskStats.done_tasks}</div>
              <p className="text-xs text-muted-foreground">完成任务</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">已阻塞</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{taskStats.blocked_tasks}</div>
              <p className="text-xs text-muted-foreground">阻塞任务</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">已取消</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-400">{taskStats.cancelled_tasks}</div>
              <p className="text-xs text-muted-foreground">取消任务</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Task List or Empty State */}
      {filteredTasks.length > 0 ? (
        <TaskListView
          tasks={filteredTasks}
          loading={tasksLoading}
          selectedTasks={[]}
          onTaskSelect={() => {}}
          onTaskUpdate={handleTaskUpdate}
          onTaskStatusChange={handleTaskStatusChange}
          onTaskDelete={handleTaskDelete}
        />
      ) : (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || statusFilter !== 'all' ? '未找到匹配的任务' : '暂无任务'}
            </h3>
            <p className="text-gray-500 mb-4 text-center">
              {searchQuery || statusFilter !== 'all' 
                ? '尝试调整搜索条件或筛选器。'
                : '还没有创建任何任务。先创建一个项目，然后生成或添加任务。'
              }
            </p>
            <div className="flex space-x-2">
              {searchQuery || statusFilter !== 'all' ? (
                <Button onClick={() => {
                  setSearchQuery('');
                  setStatusFilter('all');
                }}>
                  清除筛选
                </Button>
              ) : (
                <>
                  <Button asChild>
                    <Link href="/projects/new">创建项目</Link>
                  </Button>
                  <Button asChild variant="outline">
                    <Link href="/tasks/kanban">看板视图</Link>
                  </Button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}