'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Settings, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import Link from 'next/link';

export default function MCPSettingsPage() {
  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/settings/models">
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回设置
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">MCP工具配置</h1>
          <p className="text-gray-600 mt-1">
            管理Model Context Protocol工具和服务
          </p>
        </div>
      </div>

      {/* MCP Status */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>MCP服务状态</span>
          </CardTitle>
          <CardDescription>
            当前MCP服务的连接和配置状态
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <AlertCircle className="h-4 w-4 text-yellow-500" />
                <span className="text-sm">MCP服务器</span>
              </div>
              <Badge variant="secondary">未配置</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">TaskManage工具</span>
              </div>
              <Badge variant="destructive">未连接</Badge>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <XCircle className="h-4 w-4 text-red-500" />
                <span className="text-sm">AI模型集成</span>
              </div>
              <Badge variant="destructive">未启用</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Configuration Guide */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>配置指南</CardTitle>
          <CardDescription>
            如何设置和配置MCP工具
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                1
              </div>
              <div>
                <h4 className="font-medium">安装MCP服务器</h4>
                <p className="text-sm text-gray-600">
                  按照项目文档中的说明安装和配置MCP服务器
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                2
              </div>
              <div>
                <h4 className="font-medium">配置连接</h4>
                <p className="text-sm text-gray-600">
                  在IDE中配置MCP连接参数和认证信息
                </p>
              </div>
            </div>
            <div className="flex items-start space-x-3">
              <div className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center text-sm font-medium">
                3
              </div>
              <div>
                <h4 className="font-medium">测试连接</h4>
                <p className="text-sm text-gray-600">
                  验证MCP工具是否正常工作并可以与TaskManage通信
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Tools */}
      <Card>
        <CardHeader>
          <CardTitle>可用工具</CardTitle>
          <CardDescription>
            TaskManage提供的MCP工具列表
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">项目管理工具</h4>
                <p className="text-sm text-gray-600">创建、更新和管理项目</p>
              </div>
              <Badge variant="outline">未启用</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">任务生成工具</h4>
                <p className="text-sm text-gray-600">AI驱动的任务生成和管理</p>
              </div>
              <Badge variant="outline">未启用</Badge>
            </div>
            <div className="flex items-center justify-between p-3 border rounded-lg">
              <div>
                <h4 className="font-medium">进展跟踪工具</h4>
                <p className="text-sm text-gray-600">自动跟踪和报告项目进展</p>
              </div>
              <Badge variant="outline">未启用</Badge>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Documentation Link */}
      <Card className="mt-6">
        <CardContent className="flex flex-col items-center justify-center py-8">
          <Settings className="h-12 w-12 text-gray-400 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">需要配置MCP</h3>
          <p className="text-gray-500 mb-4 text-center">
            请参考项目文档了解如何配置和使用MCP工具
          </p>
          <div className="flex space-x-2">
            <Button asChild>
              <Link href="/debug">系统调试</Link>
            </Button>
            <Button asChild variant="outline">
              <Link href="/settings/models">AI模型配置</Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}