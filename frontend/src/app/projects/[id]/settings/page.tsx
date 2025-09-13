'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Save } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
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
import { Separator } from '@/components/ui/separator';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

import {
  ProjectWithStats,
  PROJECT_STATUS_OPTIONS,
  TASK_FORMAT_TEMPLATES,
  PRIORITY_OPTIONS,
  LANGUAGE_OPTIONS
} from '@/types/project';
import { projectsService } from '@/services/projects';

// Form validation schema
const settingsFormSchema = z.object({
  // Basic project info
  name: z.string().min(1, '项目名称不能为空').max(200, '名称过长'),
  description: z.string().max(2000, '描述过长').optional(),
  status: z.enum(['active', 'completed', 'paused', 'archived']),
  repository_url: z.string().url('无效的URL').optional().or(z.literal('')),
  documentation_url: z.string().url('无效的URL').optional().or(z.literal('')),
  is_public: z.boolean(),

  // AI Settings
  ai_output_language: z.string(),
  task_format_template: z.string(),
  auto_generate_tasks: z.boolean(),
  default_priority: z.string(),
  enable_notifications: z.boolean(),

  // Custom fields
  custom_team: z.string().optional(),
  custom_budget: z.number().optional(),
  custom_deadline: z.string().optional(),
});

type SettingsFormData = z.infer<typeof settingsFormSchema>;

export default function ProjectSettingsPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);

  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const form = useForm<SettingsFormData>({
    resolver: zodResolver(settingsFormSchema),
  });

  useEffect(() => {
    if (projectId) {
      loadProject();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      setLoading(true);
      const data = await projectsService.getProject(projectId);
      setProject(data);

      // Set form values
      form.reset({
        name: data.name,
        description: data.description || '',
        status: data.status,
        repository_url: data.repository_url || '',
        documentation_url: data.documentation_url || '',
        is_public: data.is_public,
        ai_output_language: data.settings.ai_output_language,
        task_format_template: data.settings.task_format_template,
        auto_generate_tasks: data.settings.auto_generate_tasks,
        default_priority: data.settings.default_priority,
        enable_notifications: data.settings.enable_notifications,
        custom_team: data.settings.custom_fields?.team || '',
        custom_budget: data.settings.custom_fields?.budget || undefined,
        custom_deadline: data.settings.custom_fields?.deadline || '',
      });
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('加载项目失败');
      router.push('/projects');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveSettings = async (data: SettingsFormData) => {
    try {
      setSaving(true);

      // Update basic project info
      await projectsService.updateProject(projectId, {
        name: data.name,
        description: data.description,
        status: data.status,
        repository_url: data.repository_url || undefined,
        documentation_url: data.documentation_url || undefined,
        is_public: data.is_public,
      });

      // Update project settings
      await projectsService.updateProjectSettings(projectId, {
        ai_output_language: data.ai_output_language,
        task_format_template: data.task_format_template,
        auto_generate_tasks: data.auto_generate_tasks,
        default_priority: data.default_priority,
        enable_notifications: data.enable_notifications,
        custom_fields: {
          team: data.custom_team || undefined,
          budget: data.custom_budget || undefined,
          deadline: data.custom_deadline || undefined,
        },
      });

      toast.success('设置保存成功');
      loadProject(); // Reload to get updated data
    } catch (error: any) {
      console.error('Failed to save settings:', error);
      toast.error(error.response?.data?.detail || '保存设置失败');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">加载项目设置中...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">项目未找到</h2>
          <p className="text-gray-600 mt-2">您要查找的项目不存在。</p>
          <Button asChild className="mt-4">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回项目列表
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">项目</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${project.id}`}>{project.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>设置</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">项目设置</h1>
          <p className="text-gray-600 mt-1">
            配置您的项目设置和偏好
          </p>
        </div>
        <Button asChild variant="outline">
          <Link href={`/projects/${project.id}`}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回项目
          </Link>
        </Button>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSaveSettings)} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle>基本信息</CardTitle>
              <CardDescription>
                更新您项目的基本详情和信息
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
                      <Input {...field} />
                    </FormControl>
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
                        className="min-h-[100px]"
                        {...field}
                      />
                    </FormControl>
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                        <FormLabel>公开项目</FormLabel>
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

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="repository_url"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>代码仓库URL</FormLabel>
                      <FormControl>
                        <Input placeholder="https://github.com/..." {...field} />
                      </FormControl>
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
                        <Input placeholder="https://docs.example.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          {/* AI & Task Settings */}
          <Card>
            <CardHeader>
              <CardTitle>AI与任务设置</CardTitle>
              <CardDescription>
                配置AI如何为此项目生成和管理任务
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="ai_output_language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI输出语言</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="default_priority"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>默认优先级</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue />
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
                        <FormLabel>自动生成任务</FormLabel>
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
                        <FormLabel>启用通知</FormLabel>
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

          {/* Custom Fields */}
          <Card>
            <CardHeader>
              <CardTitle>自定义字段</CardTitle>
              <CardDescription>
                添加项目特定的自定义信息
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <FormField
                  control={form.control}
                  name="custom_team"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>团队</FormLabel>
                      <FormControl>
                        <Input placeholder="开发团队" {...field} />
                      </FormControl>
                      <FormDescription>
                        负责此项目的团队
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="custom_budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>预算</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="10000"
                          {...field}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                      <FormDescription>
                        项目预算 (可选)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="custom_deadline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>截止日期</FormLabel>
                      <FormControl>
                        <Input
                          type="date"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        项目截止日期 (可选)
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </CardContent>
          </Card>

          <Separator />

          {/* Save Button */}
          <div className="flex justify-end">
            <Button type="submit" disabled={saving}>
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  保存中...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  保存设置
                </>
              )}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}