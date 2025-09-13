'use client';

import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Wand2, Sparkles, Settings } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import { ProjectWithStats } from '@/types/project';
import { TaskGenerateRequest } from '@/types/task';

const generateSchema = z.object({
  project_description: z.string().min(10, 'Project description must be at least 10 characters'),
  task_count: z.number().min(1).max(20).default(5),
  include_subtasks: z.boolean().default(true),
  custom_requirements: z.string().optional(),
  priority_distribution: z.object({
    high: z.number().min(0).max(10).default(2),
    medium: z.number().min(0).max(10).default(3),
    low: z.number().min(0).max(10).default(1),
  }).default({
    high: 2,
    medium: 3,
    low: 1,
  }),
});

type GenerateFormData = z.infer<typeof generateSchema>;

interface TaskGenerateDialogProps {
  project: ProjectWithStats;
  onGenerate: (request: TaskGenerateRequest) => void;
  onCancel: () => void;
}

export function TaskGenerateDialog({
  project,
  onGenerate,
  onCancel,
}: TaskGenerateDialogProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [showAdvanced, setShowAdvanced] = useState(false);

  const form = useForm<GenerateFormData>({
    resolver: zodResolver(generateSchema),
    defaultValues: {
      project_description: project.description || '',
      task_count: 5,
      include_subtasks: true,
      custom_requirements: '',
      priority_distribution: {
        high: 2,
        medium: 3,
        low: 1,
      },
    },
  });

  const handleSubmit = async (data: GenerateFormData) => {
    setIsGenerating(true);
    try {
      await onGenerate(data);
    } catch (error) {
      console.error('Failed to generate tasks:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const taskCount = form.watch('task_count');
  const priorityDistribution = form.watch('priority_distribution');
  const includeSubtasks = form.watch('include_subtasks');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="flex items-center justify-center space-x-2">
            <Sparkles className="h-5 w-5 text-blue-500" />
            <h3 className="text-lg font-medium">AI Task Generator</h3>
          </div>
          <p className="text-sm text-gray-600">
            Let AI create a comprehensive task breakdown for your project
          </p>
        </div>

        <Tabs defaultValue="basic" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic">Basic Settings</TabsTrigger>
            <TabsTrigger value="advanced">Advanced Options</TabsTrigger>
          </TabsList>
          
          <TabsContent value="basic" className="space-y-4">
            {/* Project Description */}
            <FormField
              control={form.control}
              name="project_description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Project Description *</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Describe your project in detail. What are you building? What features do you need? What technologies are you using?"
                      rows={6}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Provide a detailed description of your project. The more specific you are, the better the AI can generate relevant tasks.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Task Count */}
            <FormField
              control={form.control}
              name="task_count"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Number of Tasks: {taskCount}</FormLabel>
                  <FormControl>
                    <Slider
                      min={1}
                      max={20}
                      step={1}
                      value={[field.value]}
                      onValueChange={(value) => field.onChange(value[0])}
                      className="w-full"
                    />
                  </FormControl>
                  <FormDescription>
                    How many main tasks should be generated? (1-20)
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Include Subtasks */}
            <FormField
              control={form.control}
              name="include_subtasks"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Include Subtasks</FormLabel>
                    <FormDescription>
                      Generate detailed subtasks for complex main tasks
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
          </TabsContent>
          
          <TabsContent value="advanced" className="space-y-4">
            {/* Priority Distribution */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Priority Distribution</CardTitle>
                <CardDescription>
                  Configure how tasks should be distributed across priority levels
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="priority_distribution.high"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>🔥 High Priority</FormLabel>
                        <span className="text-sm text-gray-500">{field.value} tasks</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority_distribution.medium"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>➡️ Medium Priority</FormLabel>
                        <span className="text-sm text-gray-500">{field.value} tasks</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="priority_distribution.low"
                  render={({ field }) => (
                    <FormItem>
                      <div className="flex items-center justify-between">
                        <FormLabel>⬇️ Low Priority</FormLabel>
                        <span className="text-sm text-gray-500">{field.value} tasks</span>
                      </div>
                      <FormControl>
                        <Slider
                          min={0}
                          max={10}
                          step={1}
                          value={[field.value]}
                          onValueChange={(value) => field.onChange(value[0])}
                          className="w-full"
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>

            {/* Custom Requirements */}
            <FormField
              control={form.control}
              name="custom_requirements"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Custom Requirements</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Any specific requirements, constraints, or preferences for task generation..."
                      rows={4}
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Optional: Add any specific requirements, technologies to use, or constraints to consider.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </TabsContent>
        </Tabs>

        {/* Preview */}
        <Card className="bg-blue-50 border-blue-200">
          <CardHeader>
            <CardTitle className="text-base flex items-center">
              <Wand2 className="h-4 w-4 mr-2" />
              Generation Preview
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium">Tasks to generate:</span> {taskCount}
              </div>
              <div>
                <span className="font-medium">Include subtasks:</span> {includeSubtasks ? 'Yes' : 'No'}
              </div>
              <div>
                <span className="font-medium">High priority:</span> {priorityDistribution.high}
              </div>
              <div>
                <span className="font-medium">Medium priority:</span> {priorityDistribution.medium}
              </div>
              <div>
                <span className="font-medium">Low priority:</span> {priorityDistribution.low}
              </div>
              <div>
                <span className="font-medium">Language:</span> {project.settings.ai_output_language}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Actions */}
        <div className="flex justify-end space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button type="submit" disabled={isGenerating}>
            {isGenerating ? (
              <>
                <Wand2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Tasks
              </>
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}