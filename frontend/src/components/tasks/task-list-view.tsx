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
  CheckSquare
} from 'lucide-react';
import { format } from 'date-fns';
import { zhCN } from 'date-fns/locale';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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

interface TaskListViewProps {
  tasks: TaskListItem[];
  loading: boolean;
  selectedTasks: number[];
  onTaskSelect: (taskIds: number[]) => void;
  onTaskUpdate: (taskId: number, updates: any) => void;
  onTaskStatusChange: (taskId: number, status: TaskStatus) => void;
  onTaskDelete: (taskId: number) => void;
}

export function TaskListView({
  tasks,
  loading,
  selectedTasks,
  onTaskSelect,
  onTaskUpdate,
  onTaskStatusChange,
  onTaskDelete,
}: TaskListViewProps) {
  const [editingTask, setEditingTask] = useState<number | null>(null);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      onTaskSelect(tasks.map(task => task.id));
    } else {
      onTaskSelect([]);
    }
  };

  const handleSelectTask = (taskId: number, checked: boolean) => {
    if (checked) {
      onTaskSelect([...selectedTasks, taskId]);
    } else {
      onTaskSelect(selectedTasks.filter(id => id !== taskId));
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return format(new Date(dateString), 'MM/dd', { locale: zhCN });
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

  if (loading) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading tasks...</p>
        </div>
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="border rounded-lg">
        <div className="p-8 text-center">
          <CheckSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No tasks found</h3>
          <p className="text-gray-600">Get started by creating your first task.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-12">
              <Checkbox
                checked={selectedTasks.length === tasks.length}
                onCheckedChange={handleSelectAll}
              />
            </TableHead>
            <TableHead>Task</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Priority</TableHead>
            <TableHead>Due Date</TableHead>
            <TableHead>Duration</TableHead>
            <TableHead>Subtasks</TableHead>
            <TableHead>Dependencies</TableHead>
            <TableHead className="w-12"></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {tasks.map((task) => (
            <TableRow key={task.id} className="group">
              <TableCell>
                <Checkbox
                  checked={selectedTasks.includes(task.id)}
                  onCheckedChange={(checked) => handleSelectTask(task.id, checked as boolean)}
                />
              </TableCell>
              
              <TableCell>
                <div className="space-y-1">
                  <div className="font-medium">{task.title}</div>
                  {task.description && (
                    <div className="text-sm text-gray-600 line-clamp-2">
                      {task.description}
                    </div>
                  )}
                  {task.parent_id && (
                    <div className="text-xs text-gray-500">
                      Subtask of #{task.parent_id}
                    </div>
                  )}
                </div>
              </TableCell>
              
              <TableCell>
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
              </TableCell>
              
              <TableCell>
                {getPriorityBadge(task.priority)}
              </TableCell>
              
              <TableCell>
                <div className="flex items-center text-sm">
                  <Calendar className="h-3 w-3 mr-1 text-gray-400" />
                  {formatDate(task.due_date)}
                </div>
              </TableCell>
              
              <TableCell>
                <div className="flex items-center text-sm">
                  <Clock className="h-3 w-3 mr-1 text-gray-400" />
                  {formatTaskDuration(task.estimated_hours)}
                </div>
              </TableCell>
              
              <TableCell>
                {task.subtask_count > 0 && (
                  <Badge variant="outline">
                    {task.subtask_count}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>
                {task.dependency_count > 0 && (
                  <Badge variant="outline">
                    {task.dependency_count}
                  </Badge>
                )}
              </TableCell>
              
              <TableCell>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuLabel>Actions</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem>
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => setEditingTask(task.id)}>
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
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}