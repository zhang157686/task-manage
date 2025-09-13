'use client';

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ArrowLeft, Settings, Save } from 'lucide-react';
import Link from 'next/link';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';

export default function PreferencesPage() {
  const [language, setLanguage] = useState('zh-CN');
  const [theme, setTheme] = useState('system');
  const [notifications, setNotifications] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [compactMode, setCompactMode] = useState(false);
  const [showTips, setShowTips] = useState(true);

  const handleSave = () => {
    // TODO: Save preferences to backend
    toast.success('偏好设置已保存');
  };

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
          <h1 className="text-3xl font-bold">系统偏好</h1>
          <p className="text-gray-600 mt-1">
            个性化您的TaskMaster使用体验
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* General Settings */}
        <Card>
          <CardHeader>
            <CardTitle>常规设置</CardTitle>
            <CardDescription>
              基本的系统配置选项
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label>界面语言</Label>
                <Select value={language} onValueChange={setLanguage}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="zh-CN">简体中文</SelectItem>
                    <SelectItem value="en-US">English</SelectItem>
                    <SelectItem value="ja-JP">日本語</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>主题模式</Label>
                <Select value={theme} onValueChange={setTheme}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">浅色模式</SelectItem>
                    <SelectItem value="dark">深色模式</SelectItem>
                    <SelectItem value="system">跟随系统</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notification Settings */}
        <Card>
          <CardHeader>
            <CardTitle>通知设置</CardTitle>
            <CardDescription>
              管理系统通知和提醒
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">启用通知</Label>
                <p className="text-sm text-gray-600">
                  接收任务更新和项目进展通知
                </p>
              </div>
              <Switch
                checked={notifications}
                onCheckedChange={setNotifications}
              />
            </div>
          </CardContent>
        </Card>

        {/* Editor Settings */}
        <Card>
          <CardHeader>
            <CardTitle>编辑器设置</CardTitle>
            <CardDescription>
              自定义编辑和工作体验
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">自动保存</Label>
                <p className="text-sm text-gray-600">
                  自动保存编辑的内容
                </p>
              </div>
              <Switch
                checked={autoSave}
                onCheckedChange={setAutoSave}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">紧凑模式</Label>
                <p className="text-sm text-gray-600">
                  使用更紧凑的界面布局
                </p>
              </div>
              <Switch
                checked={compactMode}
                onCheckedChange={setCompactMode}
              />
            </div>

            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label className="text-base">显示提示</Label>
                <p className="text-sm text-gray-600">
                  显示功能提示和帮助信息
                </p>
              </div>
              <Switch
                checked={showTips}
                onCheckedChange={setShowTips}
              />
            </div>
          </CardContent>
        </Card>

        {/* Data & Privacy */}
        <Card>
          <CardHeader>
            <CardTitle>数据与隐私</CardTitle>
            <CardDescription>
              管理您的数据和隐私设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <Button variant="outline" className="w-full justify-start">
                导出我的数据
              </Button>
              <Button variant="outline" className="w-full justify-start">
                清除缓存数据
              </Button>
              <Button variant="destructive" className="w-full justify-start">
                删除所有数据
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Card>
          <CardContent className="pt-6">
            <Button onClick={handleSave} className="w-full" size="lg">
              <Save className="h-4 w-4 mr-2" />
              保存设置
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}