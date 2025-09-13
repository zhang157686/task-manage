'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, XCircle, AlertCircle } from 'lucide-react';

export default function DebugPage() {
  const [apiStatus, setApiStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle');
  const [apiMessage, setApiMessage] = useState('');

  const testApiConnection = async () => {
    setApiStatus('testing');
    try {
      const response = await fetch('http://127.0.0.1:8000/health');
      if (response.ok) {
        const data = await response.json();
        setApiStatus('success');
        setApiMessage(`API正常运行 - 版本: ${data.version}`);
      } else {
        setApiStatus('error');
        setApiMessage(`API响应错误: ${response.status} ${response.statusText}`);
      }
    } catch (error) {
      setApiStatus('error');
      setApiMessage(`连接失败: ${error instanceof Error ? error.message : '未知错误'}`);
    }
  };

  const getStatusIcon = () => {
    switch (apiStatus) {
      case 'success':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'error':
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 'testing':
        return <AlertCircle className="h-5 w-5 text-yellow-500 animate-pulse" />;
      default:
        return <AlertCircle className="h-5 w-5 text-gray-400" />;
    }
  };

  const getStatusBadge = () => {
    switch (apiStatus) {
      case 'success':
        return <Badge variant="default" className="bg-green-100 text-green-800">正常</Badge>;
      case 'error':
        return <Badge variant="destructive">错误</Badge>;
      case 'testing':
        return <Badge variant="secondary">测试中...</Badge>;
      default:
        return <Badge variant="outline">未测试</Badge>;
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">系统调试</h1>
          <p className="text-gray-600 mt-1">
            检查系统状态和连接
          </p>
        </div>

        {/* API连接测试 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              {getStatusIcon()}
              <span>API连接状态</span>
              {getStatusBadge()}
            </CardTitle>
            <CardDescription>
              测试前端与后端API的连接状态
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium">后端API地址</p>
                <p className="text-sm text-gray-600">http://127.0.0.1:8000</p>
              </div>
              <Button onClick={testApiConnection} disabled={apiStatus === 'testing'}>
                {apiStatus === 'testing' ? '测试中...' : '测试连接'}
              </Button>
            </div>
            {apiMessage && (
              <div className={`p-3 rounded-md ${
                apiStatus === 'success' 
                  ? 'bg-green-50 text-green-800 border border-green-200' 
                  : 'bg-red-50 text-red-800 border border-red-200'
              }`}>
                {apiMessage}
              </div>
            )}
          </CardContent>
        </Card>

        {/* 登录信息 */}
        <Card>
          <CardHeader>
            <CardTitle>默认登录信息</CardTitle>
            <CardDescription>
              使用以下默认账户登录系统
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm">用户名</p>
                  <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">admin</p>
                </div>
                <div>
                  <p className="font-medium text-sm">密码</p>
                  <p className="text-lg font-mono bg-gray-100 px-3 py-2 rounded">admin123</p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button asChild>
                  <a href="/login">前往登录</a>
                </Button>
                <Button variant="outline" asChild>
                  <a href="/register">注册新账户</a>
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 系统信息 */}
        <Card>
          <CardHeader>
            <CardTitle>系统信息</CardTitle>
            <CardDescription>
              当前系统配置和状态
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <p className="font-medium text-sm">前端地址</p>
                <p className="text-sm text-gray-600">http://localhost:3000</p>
              </div>
              <div>
                <p className="font-medium text-sm">后端地址</p>
                <p className="text-sm text-gray-600">http://127.0.0.1:8000</p>
              </div>
              <div>
                <p className="font-medium text-sm">API版本</p>
                <p className="text-sm text-gray-600">v1</p>
              </div>
              <div>
                <p className="font-medium text-sm">数据库</p>
                <p className="text-sm text-gray-600">MySQL (localhost:3303)</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 故障排除 */}
        <Card>
          <CardHeader>
            <CardTitle>故障排除</CardTitle>
            <CardDescription>
              常见问题和解决方案
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <h4 className="font-medium">1. 创建项目按钮一直转圈</h4>
                <p className="text-sm text-gray-600 mt-1">
                  原因：用户未登录或API连接失败
                </p>
                <p className="text-sm text-gray-600">
                  解决：先使用默认账户登录，然后再尝试创建项目
                </p>
              </div>
              <div>
                <h4 className="font-medium">2. API连接失败</h4>
                <p className="text-sm text-gray-600 mt-1">
                  确保后端服务正在运行：
                </p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded block mt-1">
                  cd backend && python -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
                </code>
              </div>
              <div>
                <h4 className="font-medium">3. 数据库连接问题</h4>
                <p className="text-sm text-gray-600 mt-1">
                  确保MySQL服务运行在localhost:3303，数据库名为taskmaster
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}