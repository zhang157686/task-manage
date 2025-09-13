'use client';

import { useState } from 'react';
import { ArrowLeft, Bot, Wand2, FileText } from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export default function TaskGeneratePage() {
  const [loading, setLoading] = useState(false);
  const [description, setDescription] = useState('');
  const [projectId, setProjectId] = useState('');
  const [taskCount, setTaskCount] = useState('5');

  const handleGenerate = async () => {
    if (!description.trim()) {
      toast.error('请输入项目描述');
      return;
    }

    setLoading(true);
    try {
      // TODO: Implement task generation API call
      await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
      toast.success('任务生成成功！');
    } catch (error) {
      toast.error('任务生成失败，请稍后重试');
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
                描述您的项目需求，AI将为您生成详细的任务列表
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="project">选择项目（可选）</Label>
                <Select value={projectId} onValueChange={setProjectId}>
                  <SelectTrigger>
                    <SelectValue placeholder="选择现有项目或创建新项目" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="new">创建新项目</SelectItem>
                    {/* TODO: Load actual projects */}
                  </SelectContent>
                </Select>
              </div>

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
                  描述越详细，生成的任务越准确。建议包含：项目目标、技术要求、功能模块、时间安排等。
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="taskCount">生成任务数量</Label>
                <Select value={taskCount} onValueChange={setTaskCount}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="3">3个任务</SelectItem>
                    <SelectItem value="5">5个任务</SelectItem>
                    <SelectItem value="8">8个任务</SelectItem>
                    <SelectItem value="10">10个任务</SelectItem>
                    <SelectItem value="15">15个任务</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button 
                onClick={handleGenerate} 
                disabled={loading || !description.trim()}
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