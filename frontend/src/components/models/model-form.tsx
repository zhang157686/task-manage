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
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  provider: z.enum(['openai', 'anthropic', 'azure', 'custom']),
  model_id: z.string().min(1, 'Model ID is required'),
  api_key: z.string().min(1, 'API key is required'),
  api_base_url: z.string().optional().refine((val) => !val || z.string().url().safeParse(val).success, {
    message: 'Invalid URL format',
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
      provider: (initialData?.provider as ModelProvider) || 'openai',
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

  const watchedProvider = form.watch('provider');

  useEffect(() => {
    setSelectedProvider(watchedProvider as ModelProvider);

    // Update default base URL when provider changes
    const providerInfo = MODEL_PROVIDERS.find(p => p.id === watchedProvider);
    if (providerInfo?.defaultBaseUrl && !isEditing) {
      form.setValue('api_base_url', providerInfo.defaultBaseUrl);
    }
  }, [watchedProvider, form, isEditing]);

  const handleSubmit = (data: ModelFormData) => {
    const { max_tokens, temperature, top_p, ...baseData } = data;

    const submitData: AIModelCreate = {
      ...baseData,
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
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>
              Configure the basic settings for your AI model
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model Name</FormLabel>
                  <FormControl>
                    <Input placeholder="My GPT-4 Model" {...field} />
                  </FormControl>
                  <FormDescription>
                    A friendly name to identify this model configuration
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
                  <FormLabel>Provider</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a provider" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {MODEL_PROVIDERS.map((provider) => (
                        <SelectItem key={provider.id} value={provider.id}>
                          <div>
                            <div className="font-medium">{provider.name}</div>
                            <div className="text-sm text-gray-500">{provider.description}</div>
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="model_id"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Model ID</FormLabel>
                  <FormControl>
                    {providerInfo?.supportedModels.length ? (
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a model" />
                        </SelectTrigger>
                        <SelectContent>
                          {providerInfo.supportedModels.map((model) => (
                            <SelectItem key={model} value={model}>
                              {model}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      <Input placeholder="Enter model ID" {...field} />
                    )}
                  </FormControl>
                  <FormDescription>
                    The specific model identifier (e.g., gpt-4, claude-3-sonnet)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        {/* API Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>API Configuration</CardTitle>
            <CardDescription>
              Configure the API connection settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="api_key"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>API Key</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="sk-..."
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Your API key for the selected provider
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
                  <FormLabel>API Base URL (Optional)</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="https://api.openai.com/v1"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Custom API endpoint URL. Leave empty to use the default.
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
            <CardTitle>Model Parameters</CardTitle>
            <CardDescription>
              Fine-tune the model behavior and output settings
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
            <CardTitle>Status Settings</CardTitle>
            <CardDescription>
              Configure the model status and default settings
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="is_active"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Active</FormLabel>
                    <FormDescription>
                      Enable this model for use in task generation
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
                    <FormLabel className="text-base">Default Model</FormLabel>
                    <FormDescription>
                      Use this model as the default for new tasks
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
            {isEditing ? 'Update Model' : 'Create Model'}
          </Button>
        </div>
      </form>
    </Form>
  );
}