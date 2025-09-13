'use client';

import { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';

import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

import { AIModel, AIModelCreate, MODEL_PROVIDERS, ModelProvider } from '@/types/models';

// Form validation schema
const modelFormSchema = z.object({
  name: z.string().min(1, '模型名称不能为空').max(100, '名称过长'),
  provider: z.enum(['openai', 'anthropic', 'azure', 'custom']),
  model_id: z.string().min(1, '模型ID不能为空'),
  api_key: z.string().min(1, 'API密钥不能为空'),
  api_base_url: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: '无效的URL格式',
  }),
  is_active: z.boolean(),
  is_default: z.boolean(),
  // Config fields
  max_tokens: z.number().min(1).max(8192).optional(),
  temperature: z.number().min(0).max(2).optional(),
  top_p: z.number().min(0).max(1).optional(),
});

type ModelFormData = z.infer<typeof modelFormSchema>;

interface ModelFormProps {
  initialData?: AIModel;
  onSubmit: (data: AIModelCreate) => void;
  isEditing?: boolean;
}

export function ModelForm({ initialData, onSubmit, isEditing = false }: ModelFormProps) {
  const [selectedProvider, setSelectedProvider] = useState<ModelProvider>('openai');

  const form = useForm<ModelFormData>({
    resolver: zodResolver(modelFormSchema),
    defaultValues: {
      name: initialData?.name || '',
      provider: (initialData?.provider as ModelProvider) || 'custom',
      model_id: initialData?.model_id || '',
      api_key: initialData?.api_key || '',
      api_base_url: initialData?.api_base_url || '',
      is_active: initialData?.is_active ?? true,
      is_default: initialData?.is_default ?? false,
      max_tokens: initialData?.config?.max_tokens || 1000,
      temperature: initialData?.config?.temperature || 0.7,
      top_p: initialData?.config?.top_p || 1,
    },
  });

  useEffect(() => {
    // Always use custom provider
    setSelectedProvider('custom');
    form.setValue('provider', 'custom');
  }, [form]);

  const handleSubmit = (data: ModelFormData) => {
    const { max_tokens, temperature, top_p, ...baseData } = data;

    const submitData: AIModelCreate = {
      ...baseData,
      provider: 'custom', // Always use custom provider
      api_base_url: data.api_base_url || undefined,
      config: {
        max_tokens,
        temperature,
        top_p,
      },
    };

    onSubmit(submitData);
  };

  const providerInfo = MODEL_PROVIDERS.find(p => p.id === selectedProvider);

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Basic Information */}
        <Card>
          <CardHeader>
            <CardTitle>基本信息</CardTitle>
            <CardDescription>
              配置AI模型的基本设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模型名称</FormLabel>
                  <FormControl>
                    <Input placeholder="我的 GPT-4 模型" {...field} />
                  </FormControl>
                  <FormDescription>
                    为此模型配置起一个便于识别的友好名称
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="provider"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>提供商</FormLabel>
                  <FormControl>
                    <Input
                      value="Custom Provider (OpenAI兼容)"
                      disabled
                      className="bg-gray-50"
                    />
                  </FormControl>
                  <FormDescription>
                    支持任何OpenAI兼容的API服务
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>模型ID</FormLabel>
                  <FormControl>
                    <Input placeholder="输入模型ID (例如: gpt-4, claude-3-sonnet)" {...field} />
                  </FormControl>
                  <FormDescription>
                    具体的模型标识符，支持任何OpenAI兼容的模型ID
                  </FormDescription>
                  <div className="mt-2">
                    <p className="text-sm text-gray-600 mb-2">常用模型参考：</p>
                    <div className="flex flex-wrap gap-1">
                      {['gpt-4', 'gpt-4-turbo', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet', 'gemini-pro'].map((model) => (
                        <button
                          key={model}
                          type="button"
                          onClick={() => field.onChange(model)}
                          className="px-2 py-1 text-xs bg-gray-100 hover:bg-gray-200 rounded border text-gray-700 transition-colors"
                        >
                          {model}
                        </button>
                      ))}
                    </div>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API配置</CardTitle>
            <CardDescription>
              配置API连接设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API密钥</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="sk-..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    所选提供商的API密钥
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="api_base_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API基础URL (可选)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.openai.com/v1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    自定义API端点URL。留空则使用默认值。
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* Model Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>模型参数</CardTitle>
            <CardDescription>
              微调模型行为和输出设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {providerInfo?.configFields.map((configField) => (
              <FormField
                key={configField.key}
                control={form.control}
                name={configField.key as keyof ModelFormData}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{configField.label}</FormLabel>
                    <FormControl>
                      {configField.type === 'number' ? (
                        <Input
                          type="number"
                          min={configField.min}
                          max={configField.max}
                          step={configField.step || 1}
                          value={typeof field.value === 'number' ? field.value : ''}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      ) : configField.type === 'select' ? (
                        <Select onValueChange={field.onChange} value={String(field.value || '')}>
                          <SelectTrigger>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {configField.options?.map((option) => (
                              <SelectItem key={String(option.value)} value={String(option.value)}>
                                {option.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          value={field.value || ''}
                          onChange={field.onChange}
                        />
                      )}
                    </FormControl>
                    {configField.description && (
                      <FormDescription>{configField.description}</FormDescription>
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />
            ))}
          </CardContent>
        </Card>

        {/* Status Settings */}
        <Card>
          <CardHeader>
            <CardTitle>状态设置</CardTitle>
            <CardDescription>
              配置模型状态和默认设置
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">启用</FormLabel>
                    <FormDescription>
                      启用此模型用于任务生成
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="is_default"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">默认模型</FormLabel>
                    <FormDescription>
                      将此模型设为新任务的默认模型
                    </FormDescription>
                  </div>
                  <FormControl>
                    <Switch
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <Separator />

        <div className="flex justify-end space-x-2">
          <Button type="submit">
            {isEditing ? '更新模型' : '创建模型'}
          </Button>
        </div>
      </form>
    </Form>
  );
}