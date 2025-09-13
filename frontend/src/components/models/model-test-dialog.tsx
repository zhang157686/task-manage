'use client';

import { useState } from 'react';
import { TestTube, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';

import { AIModel, AIModelTestResponse } from '@/types/models';
import { modelsService } from '@/services/models';

interface ModelTestDialogProps {
  model: AIModel;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ModelTestDialog({ model, open, onOpenChange }: ModelTestDialogProps) {
  const [testMessage, setTestMessage] = useState('你好，这是一条测试消息，请简短回复。');
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<AIModelTestResponse | null>(null);

  const handleTest = async () => {
    try {
      setTesting(true);
      setTestResult(null);
      
      const result = await modelsService.testModel(model.id, {
        test_message: testMessage,
      });
      
      setTestResult(result);
      
      if (result.success) {
        toast.success('模型测试完成');
      } else {
        toast.error('模型测试失败');
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      const errorResult: AIModelTestResponse = {
        success: false,
        message: '测试失败',
        error: error.response?.data?.detail || error.message || '未知错误',
      };
      setTestResult(errorResult);
      toast.error('模型测试失败');
    } finally {
      setTesting(false);
    }
  };

  const handleClose = () => {
    setTestResult(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <TestTube className="h-5 w-5" />
            <span>测试模型连接</span>
          </DialogTitle>
          <DialogDescription>
            测试与 "{model.name}" 的连接和响应
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">模型信息</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">名称:</span>
                <span className="font-medium">{model.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">提供商:</span>
                <Badge variant="outline" className="capitalize">
                  {model.provider}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">模型ID:</span>
                <span className="font-mono text-sm">{model.model_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">基础URL:</span>
                <span className="font-mono text-sm text-gray-500">
                  {model.api_base_url || '默认'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Test Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-message">测试消息</Label>
              <Input
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="输入测试消息..."
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                此消息将发送给模型以测试连接
              </p>
            </div>

            <Button 
              onClick={handleTest} 
              disabled={testing || !testMessage.trim()}
              className="w-full"
            >
              {testing ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  测试连接中...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  测试模型
                </>
              )}
            </Button>
          </div>

          {/* Test Results */}
          {testResult && (
            <>
              <Separator />
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center space-x-2 text-sm">
                    {testResult.success ? (
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    ) : (
                      <XCircle className="h-4 w-4 text-red-600" />
                    )}
                    <span>测试结果</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">状态:</span>
                    <Badge 
                      variant={testResult.success ? 'default' : 'destructive'}
                      className={testResult.success ? 'bg-green-100 text-green-800' : ''}
                    >
                      {testResult.success ? '成功' : '失败'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">消息:</span>
                    <span className="text-sm">{testResult.message}</span>
                  </div>

                  {testResult.response_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">响应时间:</span>
                      <span className="text-sm font-mono">{testResult.response_time}秒</span>
                    </div>
                  )}

                  {testResult.error && (
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">错误详情:</span>
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800 font-mono">
                          {testResult.error}
                        </p>
                      </div>
                    </div>
                  )}

                  {testResult.model_response && (
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">模型响应:</span>
                      <div className="bg-green-50 border border-green-200 rounded-md p-3">
                        <p className="text-sm text-green-800">
                          {testResult.model_response}
                        </p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </div>

        <div className="flex justify-end space-x-2 pt-4">
          <Button variant="outline" onClick={handleClose}>
            关闭
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}