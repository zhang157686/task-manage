'use client';

import { useState, useMemo } from 'react';
import { 
  MoreHorizontal, 
  Edit, 
  Trash2, 
  Copy, 
  Eye,
  Calendar,
  Clock,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { 
  TaskListItem, 
  TaskStatus, 
  TASK_STATUS_OPTIONS,
  getTaskStatusOption,
  getTaskPriorityOption,
  formatTaskDuration
} from '@/types/task';

interface TaskKanbanViewProps {
  tasks: TaskListItem[];
  loading: boolean;
  onTaskUpdate: (taskId: number, updates: any) => void;
  onTaskStatusChange: (taskId: number, status: TaskStatus) => void;
  onTaskDelete: (taskId: number) => void;
}

interface KanbanColumn {
  status: TaskStatus;
  title: string;
  color: string;
  tasks: TaskListItem[];
}

export function TaskKanbanView({
  tasks,
  loading,
  onTaskUpdate,
  onTaskStatusChange,
  onTaskDelete,
}: TaskKanbanViewProps) {
  const [draggedTask, setDraggedTask] = useState<TaskListItem | null>(null);
  const [dragOverColumn, setDragOverColumn] = useState<TaskStatus | null>(null);

  const columns: KanbanColumn[] = useMemo(() => {
    const statusColumns = TASK_STATUS_OPTIONS.map(status => ({
      status: status.value as TaskStatus,
      title: status.label,
      color: status.color,
      tasks: tasks.filter(task => task.status === status.value)
    }));
    
    return statusColumns;
  }, [tasks]);

  const handleDragStart = (e: React.DragEvent, task: TaskListItem) => {
    setDraggedTask(task);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverColumn(status);
  };

  const handleDragLeave = () => {
    setDragOverColumn(null);
  };

  const handleDrop = (e: React.DragEvent, status: TaskStatus) => {
    e.preventDefault();
    setDragOverColumn(null);
    
    if (draggedTask && draggedTask.status !== status) {
      onTaskStatusChange(draggedTask.id, status);
    }
    
    setDraggedTask(null);
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return null;
    return format(new Date(dateString), 'MM/dd', { locale: zhCN });
  };

  const getPriorityBadge = (priority: string) => {
    const option = getTaskPriorityOption(priority as any);
    return (
      <Badge variant="outline" className={`${option?.color} text-xs`}>
        {option?.icon}
      </Badge>
    );
  };

  if (loading) {
    return (
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {TASK_STATUS_OPTIONS.map((status) => (
          <div key={status.value} className="flex-shrink-0 w-80">
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="h-6 bg-gray-200 rounded w-24 mb-4"></div>
              <div className="space-y-3">
                {Array.from({ length: 3 }).map((_, i) => (
                  <div key={i} className="bg-white rounded-lg p-3 animate-pulse">
                    <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                    <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex space-x-4 overflow-x-auto pb-4">
      {columns.map((column) => (
        <div
          key={column.status}
          className={`flex-shrink-0 w-80 bg-gray-50 rounded-lg p-4 ${
            dragOverColumn === column.status ? 'bg-blue-50 border-2 border-blue-300 border-dashed' : ''
          }`}
          onDragOver={(e) => handleDragOver(e, column.status)}
          onDragLeave={handleDragLeave}
          onDrop={(e) => handleDrop(e, column.status)}
        >
          {/* Column Header */}
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2">
              <h3 className="font-medium text-sm">{column.title}</h3>
              <Badge variant="secondary" className="text-xs">
                {column.tasks.length}
              </Badge>
            </div>
            <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
              <Plus className="h-3 w-3" />
            </Button>
          </div>

          {/* Tasks */}
          <div className="space-y-3 min-h-[200px]">
            {column.tasks.map((task) => (
              <Card
                key={task.id}
                className={`cursor-move hover:shadow-md transition-shadow group ${
                  draggedTask?.id === task.id ? 'opacity-50' : ''
                }`}
                draggable
                onDragStart={(e) => handleDragStart(e, task)}
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between">
                    <h4 className="font-medium text-sm leading-tight line-clamp-2 flex-1">
                      {task.title}
                    </h4>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0 ml-2"
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
                    <p className="text-xs text-gray-600 line-clamp-2 mt-1">
                      {task.description}
                    </p>
                  )}
                </CardHeader>
                
                <CardContent className="pt-0">
                  <div className="space-y-2">
                    {/* Priority and ID */}
                    <div className="flex items-center justify-between">
                      {getPriorityBadge(task.priority)}
                      <span className="text-xs text-gray-500">#{task.id}</span>
                    </div>
                    
                    {/* Meta Information */}
                    <div className="space-y-1 text-xs text-gray-500">
                      {task.due_date && (
                        <div className="flex items-center">
                          <Calendar className="h-3 w-3 mr-1" />
                          <span>{formatDate(task.due_date)}</span>
                        </div>
                      )}
                      
                      {task.estimated_hours && (
                        <div className="flex items-center">
                          <Clock className="h-3 w-3 mr-1" />
                          <span>{formatTaskDuration(task.estimated_hours)}</span>
                        </div>
                      )}
                      
                      {(task.subtask_count > 0 || task.dependency_count > 0) && (
                        <div className="flex items-center justify-between">
                          {task.subtask_count > 0 && (
                            <span>{task.subtask_count} subtasks</span>
                          )}
                          {task.dependency_count > 0 && (
                            <span>{task.dependency_count} deps</span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
            
            {/* Empty State */}
            {column.tasks.length === 0 && (
              <div className="text-center py-8 text-gray-400">
                <div className="text-sm">No tasks</div>
              </div>
            )}
          </div>
        </div>
      ))}
    </div>
  );
}