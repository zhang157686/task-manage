'use client';

import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { 
  Project, 
  ProjectCreate, 
  PROJECT_STATUS_OPTIONS, 
  TASK_FORMAT_TEMPLATES, 
  PRIORITY_OPTIONS, 
  LANGUAGE_OPTIONS 
} from '@/types/project';

// Form validation schema
const projectFormSchema = z.object({
  name: z.string().min(1, 'Project name is required').max(200, 'Name too long'),
  description: z.string().max(2000, 'Description too long').optional(),
  status: z.enum(['active', 'completed', 'paused', 'archived']).default('active'),
  repository_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  documentation_url: z.string().url('Invalid URL').optional().or(z.literal('')),
  is_public: z.boolean().default(false),
  // Settings
  ai_output_language: z.string().default('中文'),
  task_format_template: z.string().default('standard'),
  auto_generate_tasks: z.boolean().default(true),
  default_priority: z.string().default('medium'),
  enable_notifications: z.boolean().default(true),
});

type ProjectFormData = z.infer<typeof projectFormSchema>;

interface ProjectFormProps {
  initialData?: Project;
  onSubmit: (data: ProjectCreate) => void;
  isEditing?: boolean;
}

export function ProjectForm({ initialData, onSubmit, isEditing = false }: ProjectFormProps) {
  const form = useForm<ProjectFormData>({
    resolver: zodResolver(projectFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      description: initialData?.description || '',
      status: initialData?.status || 'active',
      repository_url: initialData?.repository_url || '',
      documentation_url: initialData?.documentation_url || '',
      is_public: initialData?.is_public || false,
      ai_output_language: initialData?.settings?.ai_output_language || '中文',
      task_format_template: initialData?.settings?.task_format_template || 'standard',
      auto_generate_tasks: initialData?.settings?.auto_generate_tasks ?? true,
      default_priority: initialData?.settings?.default_priority || 'medium',
      enable_notifications: initialData?.settings?.enable_notifications ?? true,
    },
  });

  const handleSubmit = (data: ProjectFormData) => {
    const { 
      ai_output_language, 
      task_format_template, 
      auto_generate_tasks, 
      default_priority, 
      enable_notifications,
      ...baseData 
    } = data;
    
    const submitData: ProjectCreate = {
      ...baseData,
      repository_url: data.repository_url || undefined,
      documentation_url: data.documentation_url || undefined,
      settings: {
        ai_output_language,
        task_format_template,
        auto_generate_tasks,
        default_priority,
        enable_notifications,
        custom_fields: initialData?.settings?.custom_fields || {},
      },
    };

    onSubmit(submitData);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the basic details for your project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My Awesome Project" {...field} />
                  </FormControl>
                  <FormDescription>
                    A clear, descriptive name for your project
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe what this project is about..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional description to help you and others understand the project's purpose
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                        {PROJECT_STATUS_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
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
                name="is_public"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Public Project</FormLabel>
                      <FormDescription>
                        Make this project visible to others
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        {/* URLs */}
        <Card>
          <CardHeader>
            <CardTitle>Project Links</CardTitle>
            <CardDescription>
              Optional links to related resources
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="repository_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Repository URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/username/project"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link to your project's source code repository
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="documentation_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Documentation URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://docs.example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Link to your project's documentation
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* AI Settings */}
        <Card>
          <CardHeader>
            <CardTitle>AI & Task Settings</CardTitle>
            <CardDescription>
              Configure how AI will generate and manage tasks for this project
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ai_output_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI Output Language</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select language" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {LANGUAGE_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Language for AI-generated content
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="task_format_template"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Task Format Template</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select template" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {TASK_FORMAT_TEMPLATES.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Template for task structure and format
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="default_priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Default Task Priority</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select priority" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {PRIORITY_OPTIONS.map((option) => (
                          <SelectItem key={option.value} value={option.value}>
                            {option.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormDescription>
                      Default priority for new tasks
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="auto_generate_tasks"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Auto-Generate Tasks</FormLabel>
                      <FormDescription>
                        Automatically generate tasks based on project requirements
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="enable_notifications"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                    <div className="space-y-0.5">
                      <FormLabel className="text-base">Enable Notifications</FormLabel>
                      <FormDescription>
                        Receive notifications about project updates and task changes
                      </FormDescription>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button type="submit">
            {isEditing ? 'Update Project' : 'Create Project'}
          </Button>
        </div>
      </form>
    </Form>
  );
}