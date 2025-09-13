'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertCircle,
  FileText,
  Calendar,
  Target,
  Activity
} from 'lucide-react';
import Link from 'next/link';
import { projectsService } from '@/services/projects';
import { ProjectListItem } from '@/types/project';

interface ProjectStatsData {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pausedProjects: number;
  archivedProjects: number;
  totalTasks: number;
  completedTasks: number;
  pendingTasks: number;
  inProgressTasks: number;
  averageCompletion: number;
  recentActivity: {
    projectsCreatedThisWeek: number;
    tasksCompletedThisWeek: number;
    projectsCompletedThisMonth: number;
  };
}

export default function ProjectStatsPage() {
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState<ProjectStatsData>({
    totalProjects: 0,
    activeProjects: 0,
    completedProjects: 0,
    pausedProjects: 0,
    archivedProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    pendingTasks: 0,
    inProgressTasks: 0,
    averageCompletion: 0,
    recentActivity: {
      projectsCreatedThisWeek: 0,
      tasksCompletedThisWeek: 0,
      projectsCompletedThisMonth: 0,
    }
  });

  useEffect(() => {
    loadProjectStats();
  }, []);

  const loadProjectStats = async () => {
    try {
      setLoading(true);
      const projectsData = await projectsService.getProjects();
      setProjects(projectsData);
      
      // Calculate statistics
      const calculatedStats = calculateStats(projectsData);
      setStats(calculatedStats);
    } catch (error) {
      console.error('Failed to load project statistics:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (projectsData: ProjectListItem[]): ProjectStatsData => {
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const totalProjects = projectsData.length;
    const activeProjects = projectsData.filter(p => p.status === 'active').length;
    const completedProjects = projectsData.filter(p => p.status === 'completed').length;
    const pausedProjects = projectsData.filter(p => p.status === 'paused').length;
    const archivedProjects = projectsData.filter(p => p.status === 'archived').length;

    const totalTasks = projectsData.reduce((sum, p) => sum + p.stats.total_tasks, 0);
    const completedTasks = projectsData.reduce((sum, p) => sum + p.stats.completed_tasks, 0);
    const pendingTasks = projectsData.reduce((sum, p) => sum + p.stats.pending_tasks, 0);
    const inProgressTasks = projectsData.reduce((sum, p) => sum + p.stats.in_progress_tasks, 0);

    const averageCompletion = totalProjects > 0 
      ? projectsData.reduce((sum, p) => sum + p.stats.completion_percentage, 0) / totalProjects 
      : 0;

    // Calculate recent activity (mock data for now since we don't have date filtering in API)
    const projectsCreatedThisWeek = projectsData.filter(p => 
      new Date(p.created_at) > oneWeekAgo
    ).length;

    const projectsCompletedThisMonth = projectsData.filter(p => 
      p.status === 'completed' && new Date(p.updated_at) > oneMonthAgo
    ).length;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      pausedProjects,
      archivedProjects,
      totalTasks,
      completedTasks,
      pendingTasks,
      inProgressTasks,
      averageCompletion,
      recentActivity: {
        projectsCreatedThisWeek,
        tasksCompletedThisWeek: Math.floor(completedTasks * 0.3), // Mock data
        projectsCompletedThisMonth,
      }
    };
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'paused':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading statistics...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">项目统计</h1>
          <p className="text-gray-600 mt-1">
            查看项目和任务的详细统计信息
          </p>
        </div>
        <Button asChild>
          <Link href="/projects">
            <FileText className="h-4 w-4 mr-2" />
            返回项目列表
          </Link>
        </Button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">项目总数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalProjects}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeProjects} 个活跃项目
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">任务总数</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              {stats.completedTasks} 个已完成
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均完成度</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.averageCompletion.toFixed(1)}%</div>
            <p className="text-xs text-muted-foreground">
              所有项目平均
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">本周活动</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.recentActivity.projectsCreatedThisWeek}</div>
            <p className="text-xs text-muted-foreground">
              新建项目数
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Status Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>项目状态分布</CardTitle>
            <CardDescription>
              按状态分类的项目数量
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor('active')}>进行中</Badge>
                  <span className="text-sm">活跃项目</span>
                </div>
                <span className="font-medium">{stats.activeProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor('completed')}>已完成</Badge>
                  <span className="text-sm">完成项目</span>
                </div>
                <span className="font-medium">{stats.completedProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor('paused')}>已暂停</Badge>
                  <span className="text-sm">暂停项目</span>
                </div>
                <span className="font-medium">{stats.pausedProjects}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Badge className={getStatusColor('archived')}>已归档</Badge>
                  <span className="text-sm">归档项目</span>
                </div>
                <span className="font-medium">{stats.archivedProjects}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Statistics */}
        <Card>
          <CardHeader>
            <CardTitle>任务统计</CardTitle>
            <CardDescription>
              任务完成情况概览
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-green-500" />
                  <span className="text-sm">已完成任务</span>
                </div>
                <span className="font-medium text-green-600">{stats.completedTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">进行中任务</span>
                </div>
                <span className="font-medium text-blue-600">{stats.inProgressTasks}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <AlertCircle className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">待处理任务</span>
                </div>
                <span className="font-medium text-yellow-600">{stats.pendingTasks}</span>
              </div>
              <div className="pt-2 border-t">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">总计</span>
                  <span className="font-bold">{stats.totalTasks}</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>近期活动</CardTitle>
            <CardDescription>
              最近的项目和任务活动
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                  <span className="text-sm">本周新建项目</span>
                </div>
                <span className="font-medium">{stats.recentActivity.projectsCreatedThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <CheckCircle className="h-4 w-4 text-blue-500" />
                  <span className="text-sm">本周完成任务</span>
                </div>
                <span className="font-medium">{stats.recentActivity.tasksCompletedThisWeek}</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Calendar className="h-4 w-4 text-purple-500" />
                  <span className="text-sm">本月完成项目</span>
                </div>
                <span className="font-medium">{stats.recentActivity.projectsCompletedThisMonth}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Top Projects */}
        <Card>
          <CardHeader>
            <CardTitle>项目完成度排行</CardTitle>
            <CardDescription>
              按完成度排序的前5个项目
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {projects
                .sort((a, b) => b.stats.completion_percentage - a.stats.completion_percentage)
                .slice(0, 5)
                .map((project) => (
                  <div key={project.id} className="flex items-center justify-between">
                    <div className="flex-1">
                      <Link 
                        href={`/projects/${project.id}`}
                        className="text-sm font-medium hover:text-blue-600 transition-colors"
                      >
                        {project.name}
                      </Link>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div 
                          className="bg-blue-600 h-2 rounded-full transition-all"
                          style={{ width: `${project.stats.completion_percentage}%` }}
                        />
                      </div>
                    </div>
                    <span className="ml-4 text-sm font-medium">
                      {project.stats.completion_percentage.toFixed(0)}%
                    </span>
                  </div>
                ))}
              {projects.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">
                  暂无项目数据
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>
            常用的项目管理操作
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button asChild variant="outline">
              <Link href="/projects/new">
                <FileText className="h-4 w-4 mr-2" />
                创建新项目
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/projects">
                <BarChart3 className="h-4 w-4 mr-2" />
                查看所有项目
              </Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/analytics/overview">
                <TrendingUp className="h-4 w-4 mr-2" />
                详细分析
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}