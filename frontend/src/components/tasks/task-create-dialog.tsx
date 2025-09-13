'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';

import { 
  TaskCreate, 
  TASK_STATUS_OPTIONS, 
  TASK_PRIORITY_OPTIONS 
} from '@/types/task';

const taskSchema = z.object({
  title: z.string().min(1, 'Title is required').max(200, 'Title too long'),
  description: z.string().optional(),
  details: z.string().optional(),
  test_strategy: z.string().optional(),
  status: z.enum(['pending', 'in_progress', 'review', 'done', 'blocked', 'cancelled']).default('pending'),
  priority: z.enum(['low', 'medium', 'high', 'urgent']).default('medium'),
  estimated_hours: z.number().min(0).optional(),
  due_date: z.string().optional(),
  parent_id: z.number().optional(),
});

type TaskFormData = z.infer<typeof taskSchema>;

interface TaskCreateDialogProps {
  projectId: number;
  parentId?: number;
  onSubmit: (data: TaskCreate) => void;
  onCancel: () => void;
}

export function TaskCreateDialog({
  projectId,
  parentId,
  onSubmit,
  onCancel,
}: TaskCreateDialogProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      title: '',
      description: '',
      details: '',
      test_strategy: '',
      status: 'pending',
      priority: 'medium',
      parent_id: parentId,
    },
  });

  const handleSubmit = async (data: TaskFormData) => {
    setIsSubmitting(true);
    try {
      const taskData: TaskCreate = {
        ...data,
        project_id: projectId,
        due_date: data.due_date || undefined,
        estimated_hours: data.estimated_hours || undefined,
      };
      
      await onSubmit(taskData);
    } catch (error) {
      console.error('Failed to create task:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Title */}
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Task Title *</FormLabel>
              <FormControl>
                <Input placeholder="Enter task title..." {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Description */}
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Brief description of the task..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                A brief overview of what this task involves.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Details */}
        <FormField
          control={form.control}
          name="details"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Implementation Details</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Detailed implementation notes, requirements, etc..."
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Detailed implementation notes and requirements.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Test Strategy */}
        <FormField
          control={form.control}
          name="test_strategy"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Test Strategy</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="How to test and verify this task..."
                  rows={3}
                  {...field}
                />
              </FormControl>
              <FormDescription>
                Describe how to test and verify completion of this task.
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* Status and Priority */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="status"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Status</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                  </FormControl>
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
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="priority"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Priority</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select priority" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {TASK_PRIORITY_OPTIONS.map((option) => (
                      <SelectItem key={option.value} value={option.value}>
                        <div className="flex items-center">
                          <span className="mr-2">{option.icon}</span>
                          {option.label}
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Estimated Hours and Due Date */}
        <div className="grid grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="estimated_hours"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Estimated Hours</FormLabel>
                <FormControl>
                  <Input 
                    type="number" 
                    min="0" 
                    step="0.5"
                    placeholder="8"
                    {...field}
                    onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : undefined)}
                  />
                </FormControl>
                <FormDescription>
                  Estimated time to complete this task.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="due_date"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Due Date</FormLabel>
                <FormControl>
                  <Input 
                    type="date"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  Optional deadline for this task.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Creating...' : 'Create Task'}
          </Button>
        </div>
      </form>
    </Form>
  );
}