'use client';

import { useState } from 'react';
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
  Eye
} from 'lucide-react';
import Link from 'next/link';

interface Document {
  id: string;
  title: string;
  type: 'progress' | 'report' | 'summary';
  project: string;
  author: string;
  createdAt: string;
  updatedAt: string;
  status: 'draft' | 'published' | 'archived';
}

export default function ProgressPage() {
  const [documents] = useState<Document[]>([]);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'progress':
        return 'bg-blue-100 text-blue-800';
      case 'report':
        return 'bg-green-100 text-green-800';
      case 'summary':
        return 'bg-purple-100 text-purple-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case 'progress':
        return '进展报告';
      case 'report':
        return '项目报告';
      case 'summary':
        return '总结文档';
      default:
        return '文档';
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'published':
        return '已发布';
      case 'draft':
        return '草稿';
      case 'archived':
        return '已归档';
      default:
        return '未知';
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
          <Button>
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
            <div className="text-2xl font-bold">{documents.length}</div>
            <p className="text-xs text-muted-foreground">所有文档</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">已发布</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {documents.filter(d => d.status === 'published').length}
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
              {documents.filter(d => d.status === 'draft').length}
            </div>
            <p className="text-xs text-muted-foreground">待完成</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">本月新增</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">0</div>
            <p className="text-xs text-muted-foreground">新建文档</p>
          </CardContent>
        </Card>
      </div>

      {/* Document List */}
      {documents.length === 0 ? (
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">暂无文档</h3>
            <p className="text-gray-500 mb-4 text-center">
              还没有创建任何进展文档。开始创建第一个文档来记录项目进展。
            </p>
            <div className="flex space-x-2">
              <Button>
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
                    <CardTitle className="text-lg">{doc.title}</CardTitle>
                    <div className="flex items-center space-x-2 mt-2">
                      <Badge className={getTypeColor(doc.type)}>
                        {getTypeLabel(doc.type)}
                      </Badge>
                      <Badge className={getStatusColor(doc.status)}>
                        {getStatusLabel(doc.status)}
                      </Badge>
                    </div>
                  </div>
                  <div className="flex space-x-1">
                    <Button variant="ghost" size="sm">
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600">
                  <div className="flex items-center space-x-2">
                    <FileText className="h-4 w-4" />
                    <span>项目: {doc.project}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <User className="h-4 w-4" />
                    <span>作者: {doc.author}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Calendar className="h-4 w-4" />
                    <span>更新: {doc.updatedAt}</span>
                  </div>
                </div>
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
            <Button variant="outline" className="h-auto p-4">
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
    </div>
  );
}