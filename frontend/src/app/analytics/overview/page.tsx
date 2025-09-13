'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
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
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { projectsService } from '@/services/projects';
import { tasksService } from '@/services/tasks';
import { TaskStats } from '@/types/task';

export default function AnalyticsOverviewPage() {
  const [loading, setLoading] = useState(true);
  const [projectCount, setProjectCount] = useState(0);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);

  useEffect(() => {
    loadAnalyticsData();
  }, []);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      
      // Load projects count
      const projects = await projectsService.getProjects({});
      setProjectCount(projects.length);
      
      // Load task statistics
      const stats = await tasksService.getTaskStats();
      setTaskStats(stats);
      
    } catch (error) {
      console.error('Failed to load analytics data:', error);
      toast.error('加载分析数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    if (!taskStats || taskStats.total_tasks === 0) return 0;
    return Math.round((taskStats.done_tasks / taskStats.total_tasks) * 100);
  };

  const getActiveTasksCount = () => {
    if (!taskStats) return 0;
    return taskStats.in_progress_tasks + taskStats.review_tasks;
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">数据分析概览</h1>
          <p className="text-gray-600 mt-1">
            项目和任务的全面数据分析
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link href="/analytics/tasks">任务分析</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/analytics/efficiency">效率分析</Link>
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">总项目数</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : projectCount}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>所有项目</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">活跃任务</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : getActiveTasksCount()}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>进行中 + 审核中</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">完成率</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${getCompletionRate()}%`}
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>
                {taskStats ? `${taskStats.done_tasks}/${taskStats.total_tasks} 已完成` : '暂无数据'}
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">平均完成时间</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                taskStats?.average_completion_time ? 
                  `${Math.round(taskStats.average_completion_time)}天` : '--'
              }
            </div>
            <div className="flex items-center text-xs text-muted-foreground">
              <span>每个任务</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Project Progress Chart */}
        <Card>
          <CardHeader>
            <CardTitle>项目进度趋势</CardTitle>
            <CardDescription>
              过去30天的项目完成情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无数据</p>
                <p className="text-sm text-gray-400">创建项目后将显示进度图表</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Task Distribution */}
        <Card>
          <CardHeader>
            <CardTitle>任务分布</CardTitle>
            <CardDescription>
              按状态分类的任务数量
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无数据</p>
                <p className="text-sm text-gray-400">创建任务后将显示分布图表</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity & Top Projects */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle>最近活动</CardTitle>
            <CardDescription>
              最新的项目和任务动态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-center py-8">
                <div className="text-center">
                  <Activity className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-500">暂无活动记录</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Performance Metrics */}
        <Card>
          <CardHeader>
            <CardTitle>性能指标</CardTitle>
            <CardDescription>
              关键绩效指标概览
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <CheckCircle className="h-4 w-4 text-green-500" />
                <span className="text-sm">任务完成率</span>
              </div>
              <span className="font-medium">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                  taskStats ? `${getCompletionRate()}%` : '--'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-blue-500" />
                <span className="text-sm">平均完成时间</span>
              </div>
              <span className="font-medium">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                  taskStats?.average_completion_time ? 
                    `${Math.round(taskStats.average_completion_time)}天` : '--'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">待处理任务</span>
              </div>
              <span className="font-medium">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                  taskStats ? taskStats.pending_tasks : '--'
                }
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <TrendingUp className="h-4 w-4 text-purple-500" />
                <span className="text-sm">阻塞任务</span>
              </div>
              <span className="font-medium">
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 
                  taskStats ? taskStats.blocked_tasks : '--'
                }
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>
            常用的分析和管理功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/projects/stats" className="flex flex-col items-center space-y-2">
                <BarChart3 className="h-6 w-6" />
                <span>项目统计</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/analytics/tasks" className="flex flex-col items-center space-y-2">
                <Target className="h-6 w-6" />
                <span>任务分析</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/analytics/efficiency" className="flex flex-col items-center space-y-2">
                <TrendingUp className="h-6 w-6" />
                <span>效率分析</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Empty State Message - Only show when no data */}
      {!loading && projectCount === 0 && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <BarChart3 className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">开始收集数据</h3>
            <p className="text-gray-500 mb-4 text-center max-w-md">
              创建项目和任务后，这里将显示详细的分析数据和图表，帮助您更好地了解团队的工作效率。
            </p>
            <div className="flex space-x-2">
              <Button asChild>
                <Link href="/projects">创建项目</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/tasks/generate">生成任务</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}