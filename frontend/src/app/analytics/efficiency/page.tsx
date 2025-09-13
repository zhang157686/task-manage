'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, TrendingUp, Clock, Target, Users, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { tasksService } from '@/services/tasks';
import { projectsService } from '@/services/projects';
import { TaskStats } from '@/types/task';

export default function EfficiencyAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);
  const [projectCount, setProjectCount] = useState(0);

  useEffect(() => {
    loadEfficiencyData();
  }, []);

  const loadEfficiencyData = async () => {
    try {
      setLoading(true);
      
      // Load task statistics
      const stats = await tasksService.getTaskStats();
      setTaskStats(stats);
      
      // Load project count
      const projects = await projectsService.getProjects({});
      setProjectCount(projects.length);
      
    } catch (error) {
      console.error('Failed to load efficiency data:', error);
      toast.error('加载效率数据失败');
    } finally {
      setLoading(false);
    }
  };

  const getProductivityIndex = () => {
    if (!taskStats || taskStats.total_tasks === 0) return 0;
    // Simple productivity calculation: (completed + in_progress) / total * 100
    const activeWork = taskStats.done_tasks + taskStats.in_progress_tasks;
    return Math.round((activeWork / taskStats.total_tasks) * 100);
  };

  const getOnTimeCompletionRate = () => {
    if (!taskStats || taskStats.total_tasks === 0) return 0;
    // Assuming tasks completed without being blocked are "on time"
    const onTimeCompleted = taskStats.done_tasks;
    return Math.round((onTimeCompleted / taskStats.total_tasks) * 100);
  };

  const getTeamLoad = () => {
    if (!taskStats || projectCount === 0) return 0;
    // Simple calculation: total tasks per project
    return Math.round(taskStats.total_tasks / projectCount);
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button variant="ghost" size="sm" asChild>
            <Link href="/analytics/overview">
              <ArrowLeft className="h-4 w-4 mr-2" />
              返回概览
            </Link>
          </Button>
          <div>
            <h1 className="text-3xl font-bold">效率分析</h1>
            <p className="text-gray-600 mt-1">
              团队工作效率和生产力分析
            </p>
          </div>
        </div>
      </div>

      {/* Efficiency Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">生产力指数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${getProductivityIndex()}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {taskStats ? '活跃任务占比' : '暂无数据'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">平均完成时间</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : 
                taskStats?.average_completion_time ? 
                  `${Math.round(taskStats.average_completion_time)}天` : '--'
              }
            </div>
            <p className="text-xs text-muted-foreground">每个任务</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">按时完成率</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : `${getOnTimeCompletionRate()}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {taskStats ? '准时交付' : '暂无数据'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">项目负载</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : getTeamLoad()}
            </div>
            <p className="text-xs text-muted-foreground">
              {taskStats && projectCount > 0 ? '任务/项目' : '暂无数据'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>效率趋势</CardTitle>
            <CardDescription>
              团队效率随时间变化
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <TrendingUp className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无数据</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>工作负载分布</CardTitle>
            <CardDescription>
              团队成员工作量分析
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无数据</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State */}
      <Card>
        <CardContent className="flex flex-col items-center justify-center py-12">
          <Target className="h-16 w-16 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">暂无效率数据</h3>
          <p className="text-gray-500 mb-4 text-center">
            完成一些任务后，这里将显示团队效率分析数据。
          </p>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/tasks">查看任务</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/projects">管理项目</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}