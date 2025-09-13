'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { FolderOpen, Search, Plus } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';

import { ProjectListItem } from '@/types/project';
import { projectsService } from '@/services/projects';
import { projectProgressService } from '@/services/project-progress';

interface ProjectSelectionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ProjectSelectionDialog({ open, onOpenChange }: ProjectSelectionDialogProps) {
  const router = useRouter();
  const [projects, setProjects] = useState<ProjectListItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [creating, setCreating] = useState<number | null>(null);

  useEffect(() => {
    if (open) {
      loadProjects();
    }
  }, [open]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const params: any = {};
      
      if (searchQuery.trim()) {
        params.search = searchQuery.trim();
      }
      
      const data = await projectsService.getProjects(params);
      setProjects(data);
    } catch (error) {
      console.error('Failed to load projects:', error);
      toast.error('加载项目失败');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateProgressDocument = async (project: ProjectListItem) => {
    try {
      setCreating(project.id);
      
      // Try to get existing progress document first
      try {
        await projectProgressService.getProgress(project.id);
        // If it exists, navigate to it
        router.push(`/projects/${project.id}/progress`);
        onOpenChange(false);
        return;
      } catch (error: any) {
        // If it doesn't exist (404), create a new one
        if (error.response?.status === 404) {
          await projectProgressService.createProgress(project.id, {
            content: `# ${project.name} - 项目进展文档

## 项目概述

${project.description || '请在此添加项目概述...'}

## 最新进展

*请在此添加最新的项目进展...*

## 待办事项

- [ ] 添加具体的待办事项

## 完成的工作

- [x] 创建项目进展文档

## 遇到的问题

*记录项目中遇到的问题和解决方案...*

## 下一步计划

*描述下一阶段的工作计划...*
`,
            is_published: false,
            change_summary: '创建初始项目进展文档',
          });
          
          toast.success('进展文档创建成功');
          router.push(`/projects/${project.id}/progress`);
          onOpenChange(false);
        } else {
          throw error;
        }
      }
    } catch (error: any) {
      console.error('Failed to create progress document:', error);
      toast.error(error.response?.data?.detail || '创建进展文档失败');
    } finally {
      setCreating(null);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800';
      case 'completed':
        return 'bg-blue-100 text-blue-800';
      case 'on_hold':
        return 'bg-yellow-100 text-yellow-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return '进行中';
      case 'completed':
        return '已完成';
      case 'on_hold':
        return '暂停';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <FolderOpen className="h-5 w-5" />
            <span>选择项目</span>
          </DialogTitle>
          <DialogDescription>
            选择一个项目来创建或查看进展文档
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="搜索项目..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  loadProjects();
                }
              }}
            />
          </div>

          {/* Project List */}
          <ScrollArea className="h-[400px]">
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="text-gray-500">加载中...</div>
              </div>
            ) : projects.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-8 space-y-4">
                <FolderOpen className="h-12 w-12 text-gray-400" />
                <div className="text-center">
                  <h3 className="text-lg font-medium text-gray-900 mb-2">暂无项目</h3>
                  <p className="text-gray-500 mb-4">
                    {searchQuery ? '没有找到匹配的项目' : '还没有创建任何项目'}
                  </p>
                  <Button asChild variant="outline">
                    <a href="/projects" target="_blank" rel="noopener noreferrer">
                      <Plus className="h-4 w-4 mr-2" />
                      创建项目
                    </a>
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {projects.map((project) => (
                  <Card 
                    key={project.id} 
                    className="hover:shadow-md transition-shadow cursor-pointer"
                    onClick={() => handleCreateProgressDocument(project)}
                  >
                    <CardHeader className="pb-2">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <CardTitle className="text-base">{project.name}</CardTitle>
                          {project.description && (
                            <CardDescription className="mt-1 text-sm">
                              {project.description}
                            </CardDescription>
                          )}
                        </div>
                        <Badge className={getStatusColor(project.status)}>
                          {getStatusLabel(project.status)}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="pt-0">
                      <div className="flex items-center justify-between">
                        <div className="text-xs text-gray-500">
                          创建于 {new Date(project.created_at).toLocaleDateString('zh-CN')}
                        </div>
                        <Button
                          size="sm"
                          disabled={creating === project.id}
                          onClick={(e) => {
                            e.stopPropagation();
                            handleCreateProgressDocument(project);
                          }}
                        >
                          {creating === project.id ? '创建中...' : '创建文档'}
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </ScrollArea>
        </div>
      </DialogContent>
    </Dialog>
  );
}