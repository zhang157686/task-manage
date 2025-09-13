'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ArrowLeft, CheckCircle, Clock, AlertCircle, BarChart3, Loader2 } from 'lucide-react';
import Link from 'next/link';
import { tasksService } from '@/services/tasks';
import { TaskStats } from '@/types/task';

export default function TaskAnalyticsPage() {
  const [loading, setLoading] = useState(true);
  const [taskStats, setTaskStats] = useState<TaskStats | null>(null);

  useEffect(() => {
    loadTaskStats();
  }, []);

  const loadTaskStats = async () => {
    try {
      setLoading(true);
      const stats = await tasksService.getTaskStats();
      setTaskStats(stats);
    } catch (error) {
      console.error('Failed to load task stats:', error);
      toast.error('加载任务统计失败');
    } finally {
      setLoading(false);
    }
  };

  const getCompletionRate = () => {
    if (!taskStats || taskStats.total_tasks === 0) return 0;
    return Math.round((taskStats.done_tasks / taskStats.total_tasks) * 100);
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
            <h1 className="text-3xl font-bold">任务分析</h1>
            <p className="text-gray-600 mt-1">
              深入分析任务执行情况和效率
            </p>
          </div>
        </div>
      </div>

      {/* Task Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总任务数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : taskStats?.total_tasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">所有项目</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">已完成</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : taskStats?.done_tasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">
              完成率 {loading ? '--' : `${getCompletionRate()}%`}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">进行中</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : taskStats?.in_progress_tasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">活跃任务</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">待处理</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : taskStats?.pending_tasks || 0}
            </div>
            <p className="text-xs text-muted-foreground">等待开始</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>任务完成趋势</CardTitle>
            <CardDescription>
              过去30天的任务完成情况
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无数据</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>任务优先级分布</CardTitle>
            <CardDescription>
              按优先级分类的任务数量
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center justify-center border-2 border-dashed border-gray-200 rounded-lg">
              <div className="text-center">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <p className="text-gray-500">暂无数据</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Empty State - Only show when no tasks */}
      {!loading && (!taskStats || taskStats.total_tasks === 0) && (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <CheckCircle className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无任务数据</h3>
            <p className="text-gray-500 mb-4 text-center">
              创建项目和任务后，这里将显示详细的任务分析数据。
            </p>
            <div className="flex space-x-2">
              <Button asChild>
                <Link href="/tasks/generate">生成任务</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects">创建项目</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Additional Task Details - Show when we have data */}
      {!loading && taskStats && taskStats.total_tasks > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>任务状态详情</CardTitle>
              <CardDescription>
                各种状态的任务数量分布
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">已完成</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${getCompletionRate()}%` }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{taskStats.done_tasks}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">进行中</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-blue-500 h-2 rounded-full" 
                      style={{ 
                        width: taskStats.total_tasks > 0 ? 
                          `${(taskStats.in_progress_tasks / taskStats.total_tasks) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{taskStats.in_progress_tasks}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">待处理</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-yellow-500 h-2 rounded-full" 
                      style={{ 
                        width: taskStats.total_tasks > 0 ? 
                          `${(taskStats.pending_tasks / taskStats.total_tasks) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{taskStats.pending_tasks}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">审核中</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full" 
                      style={{ 
                        width: taskStats.total_tasks > 0 ? 
                          `${(taskStats.review_tasks / taskStats.total_tasks) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{taskStats.review_tasks}</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">阻塞</span>
                <div className="flex items-center space-x-2">
                  <div className="w-20 bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-red-500 h-2 rounded-full" 
                      style={{ 
                        width: taskStats.total_tasks > 0 ? 
                          `${(taskStats.blocked_tasks / taskStats.total_tasks) * 100}%` : '0%' 
                      }}
                    ></div>
                  </div>
                  <span className="text-sm font-medium">{taskStats.blocked_tasks}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>效率指标</CardTitle>
              <CardDescription>
                任务执行效率相关指标
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm">完成率</span>
                <span className="text-lg font-bold text-green-600">{getCompletionRate()}%</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">平均完成时间</span>
                <span className="text-lg font-bold">
                  {taskStats.average_completion_time ? 
                    `${Math.round(taskStats.average_completion_time)}天` : '--'
                  }
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm">完成百分比</span>
                <span className="text-lg font-bold">
                  {taskStats.completion_percentage ? 
                    `${Math.round(taskStats.completion_percentage)}%` : '--'
                  }
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}