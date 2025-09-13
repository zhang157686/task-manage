'use client';

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Bot, FileText, Settings, Users, Plus, Zap, BarChart3, CheckCircle, XCircle, AlertCircle } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/contexts/auth-context";

export default function Home() {
  const { user, isAuthenticated } = useAuth();
  const [apiStatus, setApiStatus] = useState<'checking' | 'connected' | 'disconnected'>('checking');

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
  }, []);

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
      <div>
        <h2 className="text-3xl font-bold tracking-tight">欢迎使用 TaskMaster AI</h2>
        <p className="text-muted-foreground">
          智能任务管理系统，让项目管理更高效
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              项目总数
            </CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              暂无项目
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
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">
              暂无任务
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
            <div className="text-2xl font-bold">未配置</div>
            <p className="text-xs text-muted-foreground">
              需要配置API密钥
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
                <span className={`text-sm ${
                  apiStatus === 'connected' ? 'text-green-600' : 
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
