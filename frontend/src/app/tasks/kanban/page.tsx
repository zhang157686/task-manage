'use client';

import { useState } from 'react';
import { ArrowLeft, Plus, MoreHorizontal } from 'lucide-react';
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

interface Task {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  assignee?: string;
  dueDate?: string;
}

interface Column {
  id: string;
  title: string;
  tasks: Task[];
  color: string;
}

export default function TaskKanbanPage() {
  const [columns] = useState<Column[]>([
    {
      id: 'todo',
      title: '待处理',
      color: 'bg-gray-100',
      tasks: []
    },
    {
      id: 'in-progress',
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

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'bg-red-100 text-red-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'low':
        return 'bg-green-100 text-green-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'high':
        return '高';
      case 'medium':
        return '中';
      case 'low':
        return '低';
      default:
        return '未知';
    }
  };

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
        <Button>
          <Plus className="h-4 w-4 mr-2" />
          添加任务
        </Button>
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
                column.tasks.map((task) => (
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
                            <DropdownMenuItem>编辑</DropdownMenuItem>
                            <DropdownMenuItem>删除</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                        {task.description}
                      </p>
                      <div className="flex items-center justify-between">
                        <Badge className={getPriorityColor(task.priority)} variant="secondary">
                          {getPriorityLabel(task.priority)}
                        </Badge>
                        {task.assignee && (
                          <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
                            <span className="text-xs text-white font-medium">
                              {task.assignee.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                      {task.dueDate && (
                        <p className="text-xs text-gray-500 mt-2">
                          截止: {task.dueDate}
                        </p>
                      )}
                    </CardContent>
                  </Card>
                ))
              )}
            </div>

            {/* Add Task Button */}
            <Button variant="outline" size="sm" className="w-full">
              <Plus className="h-4 w-4 mr-2" />
              添加任务
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
                  <Link href="/tasks/generate">生成任务</Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/projects/new">创建项目</Link>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}