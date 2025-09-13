'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  FileText,
  Plus,
  Download,
  Edit,
  Trash2,
  Calendar,
  User,
  Eye,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { ProjectSelectionDialog } from '@/components/progress/project-selection-dialog';
import { projectsService } from '@/services/projects';
import { projectProgressService } from '@/services/project-progress';
import { ProjectProgress } from '@/types/project-progress';
import { ProjectListItem } from '@/types/project';

interface ProgressDocumentWithProject extends ProjectProgress {
  project_name: string;
  project_description?: string;
}

export default function ProgressPage() {
  const [documents, setDocuments] = useState<ProgressDocumentWithProject[]>([]);
  const [loading, setLoading] = useState(true);
  const [isProjectSelectionOpen, setIsProjectSelectionOpen] = useState(false);

  useEffect(() => {
    loadProgressDocuments();
  }, []);

  const loadProgressDocuments = async () => {
    try {
      setLoading(true);

      // First get all projects
      const projects = await projectsService.getProjects({});

      // Then get progress documents for each project
      const progressPromises = projects.map(async (project: ProjectListItem) => {
        try {
          const progress = await projectProgressService.getProgress(project.id);
          return {
            ...progress,
            project_name: project.name,
            project_description: project.description,
          };
        } catch (error: any) {
          // If progress document doesn't exist (404), skip this project
          if (error.response?.status === 404) {
            return null;
          }
          throw error;
        }
      });

      const progressResults = await Promise.all(progressPromises);
      const validDocuments = progressResults.filter(doc => doc !== null) as ProgressDocumentWithProject[];

      setDocuments(validDocuments);
    } catch (error) {
      console.error('Failed to load progress documents:', error);
      toast.error('加载进展文档失败');
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (isPublished: boolean) => {
    return isPublished
      ? 'bg-green-100 text-green-800'
      : 'bg-yellow-100 text-yellow-800';
  };

  const getStatusLabel = (isPublished: boolean) => {
    return isPublished ? '已发布' : '草稿';
  };

  const handleViewDocument = (doc: ProgressDocumentWithProject) => {
    window.open(`/projects/${doc.project_id}/progress`, '_blank');
  };

  const handleEditDocument = (doc: ProgressDocumentWithProject) => {
    window.open(`/projects/${doc.project_id}/progress`, '_blank');
  };

  const handleDeleteDocument = async (doc: ProgressDocumentWithProject) => {
    if (!confirm(`确定要删除项目 "${doc.project_name}" 的进展文档吗？`)) {
      return;
    }

    try {
      await projectProgressService.deleteProgress(doc.project_id);
      toast.success('进展文档删除成功');
      loadProgressDocuments();
    } catch (error: any) {
      console.error('Failed to delete progress document:', error);
      toast.error(error.response?.data?.detail || '删除进展文档失败');
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">进展文档</h1>
          <p className="text-gray-600 mt-1">
            管理项目进展报告和相关文档
          </p>
        </div>
        <div className="flex space-x-2">
          <Button asChild variant="outline">
            <Link href="/progress/export">
              <Download className="h-4 w-4 mr-2" />
              导出报告
            </Link>
          </Button>
          <Button onClick={() => setIsProjectSelectionOpen(true)}>
            <Plus className="h-4 w-4 mr-2" />
            创建文档
          </Button>
        </div>
      </div>

      {/* Document Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">总文档数</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : documents.length}
            </div>
            <p className="text-xs text-muted-foreground">所有文档</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">已发布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : documents.filter(d => d.is_published).length}
            </div>
            <p className="text-xs text-muted-foreground">公开文档</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">草稿</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : documents.filter(d => !d.is_published).length}
            </div>
            <p className="text-xs text-muted-foreground">待完成</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">本月新增</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? <Loader2 className="h-6 w-6 animate-spin" /> : (() => {
                const now = new Date();
                const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
                return documents.filter(d => new Date(d.created_at) >= thisMonth).length;
              })()}
            </div>
            <p className="text-xs text-muted-foreground">新建文档</p>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      {loading ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-16 w-16 text-gray-400 mb-4 animate-spin" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">加载中...</h3>
            <p className="text-gray-500 text-center">
              正在获取进展文档数据
            </p>
          </CardContent>
        </Card>
      ) : documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文档</h3>
            <p className="text-gray-500 mb-4 text-center">
              还没有创建任何进展文档。开始创建第一个文档来记录项目进展。
            </p>
            <div className="flex space-x-2">
              <Button onClick={() => setIsProjectSelectionOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                创建文档
              </Button>
              <Button asChild variant="outline">
                <Link href="/projects">查看项目</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {documents.map((doc) => (
            <Card key={doc.id} className="hover:shadow-md transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <CardTitle className="text-lg">{doc.project_name}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className="bg-blue-100 text-blue-800">
                        进展文档
                      </Badge>
                      <Badge className={getStatusColor(doc.is_published)}>
                        {getStatusLabel(doc.is_published)}
                      </Badge>
                      <span className="text-sm text-gray-500">
                        版本 {doc.version}
                      </span>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleViewDocument(doc)}
                      title="查看文档"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEditDocument(doc)}
                      title="编辑文档"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteDocument(doc)}
                      title="删除文档"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>项目: {doc.project_name}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>字符数: {doc.content.length.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>更新: {new Date(doc.updated_at).toLocaleDateString('zh-CN')}</span>
                  </div>
                </div>
                {doc.project_description && (
                  <div className="mt-3 text-sm text-gray-600">
                    <p className="line-clamp-2">{doc.project_description}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>快速操作</CardTitle>
          <CardDescription>
            常用的文档管理功能
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button
              variant="outline"
              className="h-auto p-4"
              onClick={() => setIsProjectSelectionOpen(true)}
            >
              <div className="flex flex-col items-center space-y-2">
                <Plus className="h-6 w-6" />
                <span>创建进展报告</span>
              </div>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/progress/export" className="flex flex-col items-center space-y-2">
                <Download className="h-6 w-6" />
                <span>导出项目报告</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4">
              <Link href="/projects" className="flex flex-col items-center space-y-2">
                <FileText className="h-6 w-6" />
                <span>查看项目</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Project Selection Dialog */}
      <ProjectSelectionDialog
        open={isProjectSelectionOpen}
        onOpenChange={(open) => {
          setIsProjectSelectionOpen(open);
          if (!open) {
            // Refresh the documents list when dialog closes
            loadProgressDocuments();
          }
        }}
      />
    </div>
  );
}