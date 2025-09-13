'use client';

import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ProjectForm } from '@/components/projects/project-form';
import { projectsService } from '@/services/projects';
import { ProjectCreate } from '@/types/project';

export default function NewProjectPage() {
  const router = useRouter();

  const handleCreateProject = async (data: ProjectCreate) => {
    try {
      const project = await projectsService.createProject(data);
      toast.success('项目创建成功！');
      router.push(`/projects/${project.id}`);
    } catch (error: any) {
      console.error('Failed to create project:', error);
      
      // Handle different types of errors
      if (error.response?.status === 401) {
        toast.error('请先登录后再创建项目');
        router.push('/login');
      } else if (error.response?.status === 403) {
        toast.error('您没有权限创建项目');
      } else if (error.response?.data?.detail) {
        toast.error(error.response.data.detail);
      } else if (error.message) {
        toast.error(`创建项目失败: ${error.message}`);
      } else {
        toast.error('创建项目失败，请稍后重试');
      }
    }
  };

  return (
    <div className="container mx-auto py-6 max-w-4xl">
      {/* Header */}
      <div className="flex items-center space-x-4 mb-6">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/projects">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Projects
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Create New Project</h1>
          <p className="text-gray-600 mt-1">
            Set up a new project to organize your tasks and track progress
          </p>
        </div>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Project Details</CardTitle>
          <CardDescription>
            Configure your project settings and preferences
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ProjectForm onSubmit={handleCreateProject} />
        </CardContent>
      </Card>
    </div>
  );
}