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
  const [testMessage, setTestMessage] = useState('Hello, this is a test message. Please respond briefly.');
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
        toast.success('Model test completed successfully');
      } else {
        toast.error('Model test failed');
      }
    } catch (error: any) {
      console.error('Test failed:', error);
      const errorResult: AIModelTestResponse = {
        success: false,
        message: 'Test failed',
        error: error.response?.data?.detail || error.message || 'Unknown error',
      };
      setTestResult(errorResult);
      toast.error('Failed to test model');
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
            <span>Test Model Connection</span>
          </DialogTitle>
          <DialogDescription>
            Test the connection and response from "{model.name}"
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Model Information */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm">Model Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Name:</span>
                <span className="font-medium">{model.name}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Provider:</span>
                <Badge variant="outline" className="capitalize">
                  {model.provider}
                </Badge>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Model ID:</span>
                <span className="font-mono text-sm">{model.model_id}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Base URL:</span>
                <span className="font-mono text-sm text-gray-500">
                  {model.api_base_url || 'Default'}
                </span>
              </div>
            </CardContent>
          </Card>

          {/* Test Configuration */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="test-message">Test Message</Label>
              <Input
                id="test-message"
                value={testMessage}
                onChange={(e) => setTestMessage(e.target.value)}
                placeholder="Enter a test message..."
                className="mt-1"
              />
              <p className="text-sm text-gray-500 mt-1">
                This message will be sent to the model to test the connection
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
                  Testing Connection...
                </>
              ) : (
                <>
                  <TestTube className="h-4 w-4 mr-2" />
                  Test Model
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
                    <span>Test Results</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Status:</span>
                    <Badge 
                      variant={testResult.success ? 'default' : 'destructive'}
                      className={testResult.success ? 'bg-green-100 text-green-800' : ''}
                    >
                      {testResult.success ? 'Success' : 'Failed'}
                    </Badge>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Message:</span>
                    <span className="text-sm">{testResult.message}</span>
                  </div>

                  {testResult.response_time && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Response Time:</span>
                      <span className="text-sm font-mono">{testResult.response_time}s</span>
                    </div>
                  )}

                  {testResult.error && (
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Error Details:</span>
                      <div className="bg-red-50 border border-red-200 rounded-md p-3">
                        <p className="text-sm text-red-800 font-mono">
                          {testResult.error}
                        </p>
                      </div>
                    </div>
                  )}

                  {testResult.model_response && (
                    <div className="space-y-2">
                      <span className="text-sm text-gray-600">Model Response:</span>
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
            Close
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}