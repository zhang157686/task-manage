'use client';

import { useState, useEffect } from 'react';
import { ArrowLeft, Bot, Wand2, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import { ProjectListItem } from '@/types/project';
import { projectsService } from '@/services/projects';
import { tasksService } from '@/services/tasks';
import { TaskGenerateRequest } from '@/types/task';
import { useAuth } from '@/contexts/auth-context';
import { useRouter } from 'next/navigation';

export default function TaskGeneratePage() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [projectName, setProjectName] = useState('');
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loadingProjects, setLoadingProjects] = useState(true);

  // Load projects on component mount
  useEffect(() => {
    if (isAuthenticated) {
      loadProjects();
    } else {
      setLoadingProjects(false);
    }
  }, [isAuthenticated]);

  const loadProjects = async () => {
    try {
      setLoadingProjects(true);
      const data = await projectsService.getProjects();
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      // Don't show error toast if user is not authenticated
      if (isAuthenticated) {
        toast.error('加载项目列表失败');
      }
    } finally {
      setLoadingProjects(false);
    }
  };

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('请输入项目描述');
      return;
    }

    if (!isAuthenticated) {
      toast.error('请先登录以生成任务');
      return;
    }

    if (!projectId) {
      toast.error('请选择项目或创建新项目');
      return;
    }

    setLoading(true);
    try {
      let targetProjectId: number;

      if (projectId !== 'new') {
        // Use existing project
        targetProjectId = parseInt(projectId);
      } else {
        // Create new project
        if (!projectName.trim()) {
          toast.error('请输入项目名称');
          setLoading(false);
          return;
        }

        const newProject = await projectsService.createProject({
          name: projectName.trim(),
          description: description.trim(),
          status: 'active',
          is_public: false,
          settings: {
            ai_output_language: '中文',
            task_format_template: 'standard',
            auto_generate_tasks: true,
            default_priority: 'medium',
            enable_notifications: true,
            custom_fields: {},
          },
        });
        targetProjectId = newProject.id;
      }

      // Generate tasks using AI
      const generateRequest: TaskGenerateRequest = {
        project_description: description.trim(),
        include_subtasks: true,
        custom_requirements: '请根据项目描述的复杂度和需求自动决定生成合适数量的任务和子任务。确保任务具体可执行，包含清晰的验收标准。',
      };

      const result = await tasksService.generateTasks(targetProjectId, generateRequest);

      if (result.success) {
        toast.success(`成功生成 ${result.total_generated} 个任务！`);
        // Redirect to the project tasks page
        router.push(`/projects/${targetProjectId}/tasks`);
      } else {
        toast.error(result.message || '任务生成失败');
      }
    } catch (error: any) {
      console.error('Failed to generate tasks:', error);
      toast.error(error.response?.data?.detail || '任务生成失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/tasks">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回任务列表
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">AI任务生成</h1>
          <p className="text-gray-600 mt-1">
            使用AI根据项目描述自动生成任务列表
          </p>
        </div>
      </div>

      {!isAuthenticated && (
        <Card className="border-yellow-200 bg-yellow-50 mb-6">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <Bot className="h-8 w-8 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-yellow-900">建议登录</h3>
                <p className="text-yellow-700 text-sm">
                  登录后可以选择现有项目生成任务，或将生成的任务保存到新项目中
                </p>
                <div className="mt-3">
                  <Button asChild size="sm">
                    <Link href="/login">立即登录</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="h-5 w-5" />
                <span>任务生成配置</span>
              </CardTitle>
              <CardDescription>
                描述您的项目需求，AI将智能分析并生成合适数量的任务和子任务
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project">选择项目</Label>
                <Select value={projectId} onValueChange={setProjectId} disabled={loadingProjects || !isAuthenticated}>
                  <SelectTrigger>
                    <SelectValue placeholder={
                      !isAuthenticated ? "请先登录以查看项目" :
                        loadingProjects ? "加载项目中..." :
                          "选择现有项目或创建新项目"
                    } />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">创建新项目</SelectItem>
                    {projects.map((project) => (
                      <SelectItem key={project.id} value={project.id.toString()}>
                        {project.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {!isAuthenticated && (
                  <p className="text-sm text-yellow-600">
                    请先登录以查看和选择现有项目
                  </p>
                )}
                {isAuthenticated && projects.length === 0 && !loadingProjects && (
                  <p className="text-sm text-gray-500">
                    暂无项目，将创建新项目
                  </p>
                )}
              </div>

              {projectId === 'new' && (
                <div className="space-y-2">
                  <Label htmlFor="projectName">新项目名称</Label>
                  <Input
                    id="projectName"
                    placeholder="输入新项目的名称..."
                    value={projectName}
                    onChange={(e) => setProjectName(e.target.value)}
                  />
                  <p className="text-sm text-gray-500">
                    为新项目起一个清晰、描述性的名称
                  </p>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="description">项目描述</Label>
                <Textarea
                  id="description"
                  placeholder="详细描述您的项目需求、目标、技术栈、功能特性等..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="min-h-[200px]"
                />
                <p className="text-sm text-gray-500">
                  描述越详细，生成的任务越准确。AI将根据项目复杂度自动决定任务数量和层级结构。
                </p>
              </div>



              <Button
                onClick={handleGenerate}
                disabled={
                  loading ||
                  !description.trim() ||
                  !isAuthenticated ||
                  !projectId ||
                  (projectId === 'new' && !projectName.trim())
                }
                className="w-full"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    生成中...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-2" />
                    生成任务
                  </>
                )}
              </Button>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">生成提示</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="text-sm space-y-2">
                <p className="font-medium">为了获得更好的结果，请包含：</p>
                <ul className="space-y-1 text-gray-600">
                  <li>• 项目的主要目标和功能</li>
                  <li>• 使用的技术栈和工具</li>
                  <li>• 预期的时间安排</li>
                  <li>• 团队规模和角色分工</li>
                  <li>• 特殊要求或约束条件</li>
                </ul>
                <div className="mt-3 p-3 bg-blue-50 rounded-lg">
                  <p className="font-medium text-blue-900">AI智能生成</p>
                  <p className="text-blue-700 text-xs mt-1">
                    AI将根据您的描述自动决定生成合适数量的任务和子任务，无需手动指定数量
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">示例描述</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-gray-600 space-y-2">
                <p className="font-medium">电商网站项目：</p>
                <p>
                  "开发一个现代化的电商网站，使用React + Node.js技术栈。
                  需要包含用户注册登录、商品展示、购物车、订单管理、支付集成等功能。
                  预计开发周期3个月，团队3人。需要响应式设计，支持移动端。"
                </p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">快速操作</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link href="/projects/new">
                  <FileText className="h-4 w-4 mr-2" />
                  创建新项目
                </Link>
              </Button>
              <Button asChild variant="outline" size="sm" className="w-full justify-start">
                <Link href="/tasks">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  查看现有任务
                </Link>
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}