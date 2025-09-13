'use client';

import { useState } from 'react';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  Calendar,
  Clock,
  User,
  CheckSquare,
  ArrowRight
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Progress } from '@/components/ui/progress';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { 
  TaskListItem, 
  TaskStatus, 
  TaskPriority,
  TASK_STATUS_OPTIONS, 
  TASK_PRIORITY_OPTIONS,
  getTaskStatusOption,
  getTaskPriorityOption,
  formatTaskDuration
} from '@/types/task';

interface TaskCardsViewProps {
  tasks: TaskListItem[];
  loading: boolean;
  selectedTasks: number[];
  onTaskSelect: (taskIds: number[]) => void;
  onTaskUpdate: (taskId: number, updates: any) => void;
  onTaskStatusChange: (taskId: number, status: TaskStatus) => void;
  onTaskDelete: (taskId: number) => void;
}

export function TaskCardsView({
  tasks,
  loading,
  selectedTasks,
  onTaskSelect,
  onTaskUpdate,
  onTaskStatusChange,
  onTaskDelete,
}: TaskCardsViewProps) {
  const handleSelectTask = (taskId: number, checked: boolean) => {
    if (checked) {
      onTaskSelect([...selectedTasks, taskId]);
    } else {
      onTaskSelect(selectedTasks.filter(id => id !== taskId));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'MM月dd日', { locale: zhCN });
  };

  const getStatusBadge = (status: TaskStatus) => {
    const option = getTaskStatusOption(status);
    return (
      <Badge variant="secondary" className={option?.color}>
        <span className="mr-1">{option?.icon}</span>
        {option?.label}
      </Badge>
    );
  };

  const getPriorityBadge = (priority: TaskPriority) => {
    const option = getTaskPriorityOption(priority);
    return (
      <Badge variant="outline" className={option?.color}>
        <span className="mr-1">{option?.icon}</span>
        {option?.label}
      </Badge>
    );
  };

  const getProgressValue = (task: TaskListItem) => {
    if (task.status === 'done') return 100;
    if (task.status === 'in_progress') return 50;
    if (task.status === 'review') return 80;
    return 0;
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {Array.from({ length: 8 }).map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="pb-3">
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              <div className="h-3 bg-gray-200 rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="h-3 bg-gray-200 rounded"></div>
                <div className="h-3 bg-gray-200 rounded w-2/3"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="text-center py-12">
        <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
        <p className="text-gray-600">Get started by creating your first task.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {tasks.map((task) => (
        <Card 
          key={task.id} 
          className={`group hover:shadow-md transition-shadow ${
            selectedTasks.includes(task.id) ? 'ring-2 ring-blue-500' : ''
          }`}
        >
          <CardHeader className="pb-3">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-2 flex-1">
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                  className="mt-1"
                />
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-sm leading-tight line-clamp-2">
                    {task.title}
                  </h3>
                  {task.parent_id && (
                    <div className="text-xs text-gray-500 mt-1">
                      Subtask of #{task.parent_id}
                    </div>
                  )}
                </div>
              </div>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="ghost" 
                    size="sm" 
                    className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0"
                  >
                    <MoreHorizontal className="h-3 w-3" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>Actions</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Eye className="h-4 w-4 mr-2" />
                    View Details
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Copy className="h-4 w-4 mr-2" />
                    Duplicate
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem 
                    onClick={() => onTaskDelete(task.id)}
                    className="text-red-600"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
            
            {task.description && (
              <p className="text-xs text-gray-600 line-clamp-2 mt-2">
                {task.description}
              </p>
            )}
          </CardHeader>
          
          <CardContent className="space-y-3">
            {/* Status and Priority */}
            <div className="flex items-center justify-between">
              <Select
                value={task.status}
                onValueChange={(value) => onTaskStatusChange(task.id, value as TaskStatus)}
              >
                <SelectTrigger className="w-auto border-none p-0 h-auto">
                  <SelectValue asChild>
                    {getStatusBadge(task.status)}
                  </SelectValue>
                </SelectTrigger>
                <SelectContent>
                  {TASK_STATUS_OPTIONS.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      <div className="flex items-center">
                        <span className="mr-2">{option.icon}</span>
                        {option.label}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              
              {getPriorityBadge(task.priority)}
            </div>
            
            {/* Progress */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs">
                <span>Progress</span>
                <span>{getProgressValue(task)}%</span>
              </div>
              <Progress value={getProgressValue(task)} className="h-1" />
            </div>
            
            {/* Meta Information */}
            <div className="space-y-2 text-xs text-gray-500">
              {task.due_date && (
                <div className="flex items-center">
                  <Calendar className="h-3 w-3 mr-1" />
                  <span>Due: {formatDate(task.due_date)}</span>
                </div>
              )}
              
              {task.estimated_hours && (
                <div className="flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  <span>{formatTaskDuration(task.estimated_hours)}</span>
                </div>
              )}
              
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  {task.subtask_count > 0 && (
                    <div className="flex items-center">
                      <CheckSquare className="h-3 w-3 mr-1" />
                      <span>{task.subtask_count} subtasks</span>
                    </div>
                  )}
                  
                  {task.dependency_count > 0 && (
                    <div className="flex items-center">
                      <ArrowRight className="h-3 w-3 mr-1" />
                      <span>{task.dependency_count} deps</span>
                    </div>
                  )}
                </div>
                
                <span>#{task.id}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  );
}