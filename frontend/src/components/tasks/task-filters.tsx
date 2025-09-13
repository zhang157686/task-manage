'use client';

import { useState, useEffect } from 'react';
import { X, Filter } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

import { 
  TaskStatus, 
  TaskPriority,
  TaskSearchRequest,
  TASK_STATUS_OPTIONS, 
  TASK_PRIORITY_OPTIONS,
  TASK_SORT_OPTIONS
} from '@/types/task';

interface TaskFiltersProps {
  onFiltersChange: (filters: TaskSearchRequest) => void;
  initialFilters?: Partial<TaskSearchRequest>;
}

export function TaskFilters({ onFiltersChange, initialFilters = {} }: TaskFiltersProps) {
  const [filters, setFilters] = useState<TaskSearchRequest>({
    query: '',
    status: [],
    priority: [],
    has_subtasks: undefined,
    has_dependencies: undefined,
    due_date_from: '',
    due_date_to: '',
    created_from: '',
    created_to: '',
    sort_by: 'created_at',
    sort_order: 'desc',
    ...initialFilters,
  });

  useEffect(() => {
    onFiltersChange(filters);
  }, [filters, onFiltersChange]);

  const updateFilter = (key: keyof TaskSearchRequest, value: any) => {
    setFilters(prev => ({
      ...prev,
      [key]: value,
    }));
  };

  const toggleStatus = (status: TaskStatus) => {
    const currentStatuses = filters.status || [];
    const newStatuses = currentStatuses.includes(status)
      ? currentStatuses.filter(s => s !== status)
      : [...currentStatuses, status];
    
    updateFilter('status', newStatuses);
  };

  const togglePriority = (priority: TaskPriority) => {
    const currentPriorities = filters.priority || [];
    const newPriorities = currentPriorities.includes(priority)
      ? currentPriorities.filter(p => p !== priority)
      : [...currentPriorities, priority];
    
    updateFilter('priority', newPriorities);
  };

  const clearFilters = () => {
    setFilters({
      query: '',
      status: [],
      priority: [],
      has_subtasks: undefined,
      has_dependencies: undefined,
      due_date_from: '',
      due_date_to: '',
      created_from: '',
      created_to: '',
      sort_by: 'created_at',
      sort_order: 'desc',
    });
  };

  const getActiveFilterCount = () => {
    let count = 0;
    if (filters.query) count++;
    if (filters.status && filters.status.length > 0) count++;
    if (filters.priority && filters.priority.length > 0) count++;
    if (filters.has_subtasks !== undefined) count++;
    if (filters.has_dependencies !== undefined) count++;
    if (filters.due_date_from) count++;
    if (filters.due_date_to) count++;
    if (filters.created_from) count++;
    if (filters.created_to) count++;
    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4" />
          <h3 className="font-medium">Filters</h3>
          {activeFilterCount > 0 && (
            <Badge variant="secondary">{activeFilterCount}</Badge>
          )}
        </div>
        {activeFilterCount > 0 && (
          <Button variant="ghost" size="sm" onClick={clearFilters}>
            <X className="h-4 w-4 mr-1" />
            Clear All
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Search Query */}
        <div className="space-y-2">
          <Label>Search</Label>
          <Input
            placeholder="Search tasks..."
            value={filters.query || ''}
            onChange={(e) => updateFilter('query', e.target.value)}
          />
        </div>

        {/* Sort */}
        <div className="space-y-2">
          <Label>Sort By</Label>
          <div className="flex space-x-2">
            <Select
              value={filters.sort_by}
              onValueChange={(value) => updateFilter('sort_by', value)}
            >
              <SelectTrigger className="flex-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TASK_SORT_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={filters.sort_order}
              onValueChange={(value) => updateFilter('sort_order', value)}
            >
              <SelectTrigger className="w-20">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">↑</SelectItem>
                <SelectItem value="desc">↓</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Date Filters */}
        <div className="space-y-2">
          <Label>Due Date Range</Label>
          <div className="space-y-2">
            <Input
              type="date"
              placeholder="From"
              value={filters.due_date_from || ''}
              onChange={(e) => updateFilter('due_date_from', e.target.value)}
            />
            <Input
              type="date"
              placeholder="To"
              value={filters.due_date_to || ''}
              onChange={(e) => updateFilter('due_date_to', e.target.value)}
            />
          </div>
        </div>

        {/* Created Date Range */}
        <div className="space-y-2">
          <Label>Created Date Range</Label>
          <div className="space-y-2">
            <Input
              type="date"
              placeholder="From"
              value={filters.created_from || ''}
              onChange={(e) => updateFilter('created_from', e.target.value)}
            />
            <Input
              type="date"
              placeholder="To"
              value={filters.created_to || ''}
              onChange={(e) => updateFilter('created_to', e.target.value)}
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Status Filter */}
        <div className="space-y-2">
          <Label>Status</Label>
          <div className="space-y-2">
            {TASK_STATUS_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`status-${option.value}`}
                  checked={filters.status?.includes(option.value as TaskStatus) || false}
                  onCheckedChange={() => toggleStatus(option.value as TaskStatus)}
                />
                <Label 
                  htmlFor={`status-${option.value}`}
                  className="flex items-center cursor-pointer"
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Filter */}
        <div className="space-y-2">
          <Label>Priority</Label>
          <div className="space-y-2">
            {TASK_PRIORITY_OPTIONS.map((option) => (
              <div key={option.value} className="flex items-center space-x-2">
                <Checkbox
                  id={`priority-${option.value}`}
                  checked={filters.priority?.includes(option.value as TaskPriority) || false}
                  onCheckedChange={() => togglePriority(option.value as TaskPriority)}
                />
                <Label 
                  htmlFor={`priority-${option.value}`}
                  className="flex items-center cursor-pointer"
                >
                  <span className="mr-2">{option.icon}</span>
                  {option.label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Task Type Filter */}
        <div className="space-y-2">
          <Label>Task Type</Label>
          <div className="space-y-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-subtasks"
                checked={filters.has_subtasks === true}
                onCheckedChange={(checked) => 
                  updateFilter('has_subtasks', checked ? true : undefined)
                }
              />
              <Label htmlFor="has-subtasks" className="cursor-pointer">
                Has Subtasks
              </Label>
            </div>
            <div className="flex items-center space-x-2">
              <Checkbox
                id="has-dependencies"
                checked={filters.has_dependencies === true}
                onCheckedChange={(checked) => 
                  updateFilter('has_dependencies', checked ? true : undefined)
                }
              />
              <Label htmlFor="has-dependencies" className="cursor-pointer">
                Has Dependencies
              </Label>
            </div>
          </div>
        </div>

        {/* Active Filters Summary */}
        {activeFilterCount > 0 && (
          <div className="space-y-2">
            <Label>Active Filters</Label>
            <div className="space-y-1">
              {filters.query && (
                <Badge variant="secondary" className="mr-1">
                  Search: {filters.query}
                </Badge>
              )}
              {filters.status && filters.status.length > 0 && (
                <Badge variant="secondary" className="mr-1">
                  Status: {filters.status.length}
                </Badge>
              )}
              {filters.priority && filters.priority.length > 0 && (
                <Badge variant="secondary" className="mr-1">
                  Priority: {filters.priority.length}
                </Badge>
              )}
              {filters.has_subtasks && (
                <Badge variant="secondary" className="mr-1">
                  Has Subtasks
                </Badge>
              )}
              {filters.has_dependencies && (
                <Badge variant="secondary" className="mr-1">
                  Has Dependencies
                </Badge>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}