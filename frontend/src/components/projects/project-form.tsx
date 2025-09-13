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
  name: z.string().min(1, '项目名称不能为空').max(200, '名称过长'),
  description: z.string().max(2000, '描述过长').optional(),
  status: z.enum(['active', 'completed', 'paused', 'archived']).default('active'),
  repository_url: z.string().url('无效的URL').optional().or(z.literal('')),
  documentation_url: z.string().url('无效的URL').optional().or(z.literal('')),
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
            <CardTitle>基本信息</CardTitle>
            <CardDescription>
              配置项目的基本详情
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>项目名称</FormLabel>
                  <FormControl>
                    <Input placeholder="我的项目" {...field} />
                  </FormControl>
                  <FormDescription>
                    为您的项目起一个清晰、描述性的名称
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
                  <FormLabel>项目描述</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="描述这个项目的内容..."
                      className="min-h-[100px]"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    可选的描述，帮助您和其他人理解项目的目的
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
                    <FormLabel>状态</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择状态" />
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
                      <FormLabel className="text-base">公开项目</FormLabel>
                      <FormDescription>
                        让其他人可以看到这个项目
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
            <CardTitle>项目链接</CardTitle>
            <CardDescription>
              可选的相关资源链接
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="repository_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>代码仓库URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://github.com/username/project"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    项目源代码仓库的链接
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
                  <FormLabel>文档URL</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://docs.example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    项目文档的链接
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
            <CardTitle>AI与任务设置</CardTitle>
            <CardDescription>
              配置AI如何为此项目生成和管理任务
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="ai_output_language"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>AI输出语言</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择语言" />
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
                      AI生成内容的语言
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
                    <FormLabel>任务格式模板</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择模板" />
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
                      任务结构和格式的模板
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
                    <FormLabel>默认任务优先级</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="选择优先级" />
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
                      新任务的默认优先级
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
                      <FormLabel className="text-base">自动生成任务</FormLabel>
                      <FormDescription>
                        根据项目需求自动生成任务
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
                      <FormLabel className="text-base">启用通知</FormLabel>
                      <FormDescription>
                        接收项目更新和任务变更的通知
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
            {isEditing ? '更新项目' : '创建项目'}
          </Button>
        </div>
      </form>
    </Form>
  );
}