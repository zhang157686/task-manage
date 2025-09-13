'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Bot, FileText, Settings, Users, Plus, BarChart3, CheckCircle, XCircle, AlertCircle, RefreshCw } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";
import { projectsService } from "@/services/projects";
import { modelsService } from "@/services/models";

interface DashboardStats {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  totalTasks: number;
  completedTasks: number;
  inProgressTasks: number;
  totalModels: number;
  activeModels: number;
}

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');
  const [stats, setStats] = useState<DashboardStats>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    totalModels: 0,
    activeModels: 0,
  });
  const [loading, setLoading] = useState(true);

  const loadDashboardStats = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const [projects, models] = await Promise.all([
        projectsService.getProjects().catch((error) => {
          console.error('Failed to load projects:', error);
          return []; // 如果项目服务失败，返回空数组
        }),
        modelsService.getModels().catch((error) => {
          console.error('Failed to load models:', error);
          return []; // 如果模型服务失败，返回空数组
        })
      ]);

      const dashboardStats: DashboardStats = {
        totalProjects: projects.length,
        activeProjects: projects.filter(p => p.status === 'active').length,
        completedProjects: projects.filter(p => p.status === 'completed').length,
        totalTasks: projects.reduce((sum, p) => sum + p.stats.total_tasks, 0),
        completedTasks: projects.reduce((sum, p) => sum + p.stats.completed_tasks, 0),
        inProgressTasks: projects.reduce((sum, p) => sum + p.stats.in_progress_tasks, 0),
        totalModels: models.length,
        activeModels: models.filter(m => m.is_active).length,
      };

      setStats(dashboardStats);
    } catch (error) {
      console.error('Failed to load dashboard stats:', error);
      // 如果出现错误，保持默认的0值
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const checkApiStatus = async () => {
      try {
        const response = await fetch('http://127.0.0.1:8000/health');
        if (response.ok) {
          setApiStatus('connected');
        } else {
          setApiStatus('disconnected');
        }
      } catch {
        setApiStatus('disconnected');
      }
    };

    checkApiStatus();
    loadDashboardStats();
  }, [isAuthenticated]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'disconnected':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'connected':
        return '正常';
      case 'disconnected':
        return '断开';
      default:
        return '检查中';
    }
  };
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">欢迎使用 TaskMaster AI</h2>
          <p className="text-muted-foreground">
            智能任务管理系统，让项目管理更高效
          </p>
        </div>
        {isAuthenticated && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => loadDashboardStats()}
            disabled={loading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
            刷新数据
          </Button>
        )}
      </div>

      {!isAuthenticated && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <div className="flex items-center space-x-4">
              <div className="flex-shrink-0">
                <AlertCircle className="h-8 w-8 text-blue-600" />
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-medium text-blue-900">需要登录</h3>
                <p className="text-blue-700 text-sm">
                  请使用默认管理员账户登录以查看项目数据和使用完整功能
                </p>
                <div className="mt-3 flex space-x-3">
                  <Button asChild size="sm">
                    <Link href="/login">立即登录</Link>
                  </Button>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/debug">系统调试</Link>
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              项目总数
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {!isAuthenticated ? '--' : loading ? '...' : stats.totalProjects}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isAuthenticated ? '请先登录' : stats.totalProjects === 0 ? '暂无项目' : `${stats.activeProjects} 个活跃项目`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              活跃任务
            </CardTitle>
            <Bot className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {!isAuthenticated ? '--' : loading ? '...' : stats.inProgressTasks}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isAuthenticated ? '请先登录' : stats.totalTasks === 0 ? '暂无任务' : `总共 ${stats.totalTasks} 个任务`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              团队成员
            </CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">1</div>
            <p className="text-xs text-muted-foreground">
              当前用户
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              AI模型
            </CardTitle>
            <Settings className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {!isAuthenticated ? '--' : loading ? '...' : stats.totalModels === 0 ? '未配置' : stats.activeModels}
            </div>
            <p className="text-xs text-muted-foreground">
              {!isAuthenticated ? '请先登录' : stats.totalModels === 0 ? '需要配置API密钥' : `总共 ${stats.totalModels} 个模型`}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>快速开始</CardTitle>
            <CardDescription>
              开始使用 TaskMaster AI 管理您的项目
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/projects/new">
                  <Plus className="mr-2 h-4 w-4" />
                  创建新项目
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/settings/models">
                  <Settings className="mr-2 h-4 w-4" />
                  配置AI模型
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/tasks/generate">
                  <Bot className="mr-2 h-4 w-4" />
                  生成任务
                </Link>
              </Button>
              <Button asChild className="w-full justify-start" variant="outline">
                <Link href="/analytics/overview">
                  <BarChart3 className="mr-2 h-4 w-4" />
                  查看分析
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>系统状态</CardTitle>
            <CardDescription>
              当前系统运行状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm">用户状态</span>
              <div className="flex items-center space-x-2">
                {isAuthenticated ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">已登录 ({user?.username})</span>
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 text-red-500" />
                    <span className="text-sm text-red-600">未登录</span>
                  </>
                )}
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">前端服务</span>
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm text-green-600">运行中</span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">后端API</span>
              <div className="flex items-center space-x-2">
                {getStatusIcon(apiStatus)}
                <span className={`text-sm ${apiStatus === 'connected' ? 'text-green-600' :
                  apiStatus === 'disconnected' ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                  {getStatusText(apiStatus)}
                </span>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm">AI服务</span>
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm text-yellow-600">需要配置</span>
              </div>
            </div>

            {!isAuthenticated && (
              <div className="pt-4 border-t">
                <p className="text-sm text-gray-600 mb-3">
                  请先登录以使用完整功能
                </p>
                <div className="space-y-2">
                  <Button asChild size="sm" className="w-full">
                    <Link href="/login">立即登录</Link>
                  </Button>
                  <Button asChild size="sm" variant="outline" className="w-full">
                    <Link href="/debug">系统调试</Link>
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
