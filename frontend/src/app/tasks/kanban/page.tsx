'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Plus, MoreHorizontal, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { TaskListItem, TaskStatus, TaskPriority } from '@/types/task';
import { tasksService } from '@/services/tasks';
import { getTaskPriorityOption } from '@/types/task';

interface Column {
  id: TaskStatus;
  title: string;
  tasks: TaskListItem[];
  color: string;
}

export default function TaskKanbanPage() {
  const [loading, setLoading] = useState(true);
  const [tasks, setTasks] = useState<TaskListItem[]>([]);
  const [columns, setColumns] = useState<Column[]>([
    {
      id: 'pending',
      title: '待处理',
      color: 'bg-gray-100',
      tasks: []
    },
    {
      id: 'in_progress',
      title: '进行中',
      color: 'bg-blue-100',
      tasks: []
    },
    {
      id: 'review',
      title: '待审核',
      color: 'bg-yellow-100',
      tasks: []
    },
    {
      id: 'done',
      title: '已完成',
      color: 'bg-green-100',
      tasks: []
    }
  ]);

  useEffect(() => {
    loadTasks();
  }, []);

  const loadTasks = async () => {
    try {
      setLoading(true);
      const data = await tasksService.getTasks();
      setTasks(data);
      
      // Group tasks by status
      const updatedColumns = columns.map(column => ({
        ...column,
        tasks: data.filter(task => task.status === column.id)
      }));
      setColumns(updatedColumns);
    } catch (error) {
      console.error('Failed to load tasks:', error);
      toast.error('加载任务失败');
    } finally {
      setLoading(false);
    }
  };

  const handleTaskStatusChange = async (taskId: number, newStatus: TaskStatus) => {
    try {
      await tasksService.updateTaskStatus(taskId, newStatus);
      toast.success('任务状态已更新');
      loadTasks();
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
      loadTasks();
    } catch (error: any) {
      console.error('Failed to delete task:', error);
      toast.error(error.response?.data?.detail || '删除任务失败');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      month: 'short',
      day: 'numeric',
    });
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/tasks">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回任务列表
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">任务看板</h1>
            <p className="text-gray-600 mt-1">
              可视化任务管理，拖拽式工作流
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={loadTasks}>
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

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {columns.map((column) => (
          <div key={column.id} className="space-y-4">
            {/* Column Header */}
            <div className={`${column.color} rounded-lg p-4`}>
              <div className="flex items-center justify-between">
                <h3 className="font-semibold">{column.title}</h3>
                <Badge variant="secondary">{column.tasks.length}</Badge>
              </div>
            </div>

            {/* Tasks */}
            <div className="space-y-3 min-h-[400px]">
              {column.tasks.length === 0 ? (
                <div className="border-2 border-dashed border-gray-200 rounded-lg p-6 text-center">
                  <p className="text-gray-500 text-sm">暂无任务</p>
                  <p className="text-gray-400 text-xs mt-1">拖拽任务到此处</p>
                </div>
              ) : (
                column.tasks.map((task) => {
                  const priorityOption = getTaskPriorityOption(task.priority);
                  return (
                    <Card key={task.id} className="cursor-pointer hover:shadow-md transition-shadow">
                      <CardHeader className="pb-2">
                        <div className="flex items-start justify-between">
                          <CardTitle className="text-sm font-medium line-clamp-2">
                            {task.title}
                          </CardTitle>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant="ghost" size="sm">
                                <MoreHorizontal className="h-4 w-4" />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, 'pending')}>
                                标记为待处理
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, 'in_progress')}>
                                标记为进行中
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, 'review')}>
                                标记为待审核
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTaskStatusChange(task.id, 'done')}>
                                标记为已完成
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={() => handleTaskDelete(task.id)} className="text-red-600">
                                删除
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </CardHeader>
                      <CardContent className="pt-0">
                        <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                          {task.description || '无描述'}
                        </p>
                        <div className="flex items-center justify-between">
                          <Badge className={priorityOption?.color} variant="secondary">
                            {priorityOption?.label || task.priority}
                          </Badge>
                          {task.subtask_count > 0 && (
                            <Badge variant="outline" className="text-xs">
                              {task.subtask_count} 子任务
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center justify-between mt-2 text-xs text-gray-500">
                          <span>创建: {formatDate(task.created_at)}</span>
                          {task.due_date && (
                            <span>截止: {formatDate(task.due_date)}</span>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  );
                })
              )}
            </div>

            {/* Add Task Button */}
            <Button variant="outline" size="sm" className="w-full" asChild>
              <Link href="/projects/new">
                <Plus className="h-4 w-4 mr-2" />
                创建项目
              </Link>
            </Button>
          </div>
        ))}
      </div>

      {/* Empty State */}
      {columns.every(col => col.tasks.length === 0) && (
        <Card className="mt-8">
          <CardContent className="flex flex-col items-center justify-center py-12">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">看板为空</h3>
              <p className="text-gray-500 mb-4">
                还没有任何任务。创建第一个任务开始使用看板功能。
              </p>
              <div className="flex space-x-2">
                <Button asChild>
                  <Link href="/projects/new">创建项目</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/tasks">任务列表</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}