'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Edit, 
  Eye, 
  Save, 
  X, 
  History, 
  Download, 
  Share, 
  Globe,
  Lock,
  RotateCcw,
  FileText,
  BarChart3
} from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import { ProjectWithStats } from '@/types/project';
import { 
  ProjectProgress, 
  ProjectProgressStats, 
  formatProgressStats, 
  calculateReadingTime 
} from '@/types/project-progress';
import { projectsService } from '@/services/projects';
import { projectProgressService } from '@/services/project-progress';
import { MarkdownEditor } from '@/components/progress/markdown-editor';
import { MarkdownViewer } from '@/components/progress/markdown-viewer';
import { ProgressHistory } from '@/components/progress/progress-history';
import { ProgressStats } from '@/components/progress/progress-stats';
import { ExportDialog } from '@/components/progress/export-dialog';

export default function ProjectProgressPage() {
  const params = useParams();
  const router = useRouter();
  const projectId = parseInt(params.id as string);
  
  const [project, setProject] = useState<ProjectWithStats | null>(null);
  const [progress, setProgress] = useState<ProjectProgress | null>(null);
  const [stats, setStats] = useState<ProjectProgressStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState('');
  const [isHistoryOpen, setIsHistoryOpen] = useState(false);
  const [isExportOpen, setIsExportOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);

  useEffect(() => {
    if (projectId) {
      loadProject();
      loadProgress();
    }
  }, [projectId]);

  const loadProject = async () => {
    try {
      const data = await projectsService.getProject(projectId);
      setProject(data);
    } catch (error) {
      console.error('Failed to load project:', error);
      toast.error('Failed to load project');
      router.push('/projects');
    }
  };

  const loadProgress = async () => {
    try {
      setLoading(true);
      const progressData = await projectProgressService.getOrCreateProgress(projectId);
      const statsData = await projectProgressService.getProgressStats(projectId);
      
      setProgress(progressData);
      setStats(statsData);
      setEditContent(progressData.content);
    } catch (error) {
      console.error('Failed to load progress:', error);
      toast.error('Failed to load progress document');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!progress) return;

    try {
      setSaving(true);
      const updatedProgress = await projectProgressService.updateProgress(projectId, {
        content: editContent,
        change_summary: 'Document updated',
      });
      
      setProgress(updatedProgress);
      setIsEditing(false);
      toast.success('Progress document saved successfully');
      
      // Reload stats
      const statsData = await projectProgressService.getProgressStats(projectId);
      setStats(statsData);
    } catch (error: any) {
      console.error('Failed to save progress:', error);
      toast.error(error.response?.data?.detail || 'Failed to save progress document');
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    setEditContent(progress?.content || '');
    setIsEditing(false);
  };

  const handleTogglePublish = async () => {
    if (!progress) return;

    try {
      const updatedProgress = await projectProgressService.togglePublishStatus(projectId);
      setProgress(updatedProgress);
      
      const action = updatedProgress.is_published ? 'published' : 'unpublished';
      toast.success(`Progress document ${action} successfully`);
    } catch (error: any) {
      console.error('Failed to toggle publish status:', error);
      toast.error(error.response?.data?.detail || 'Failed to update publish status');
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="container mx-auto py-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">Loading progress document...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!project || !progress) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Document not found</h2>
          <p className="text-gray-600 mt-2">The progress document could not be loaded.</p>
          <Button asChild className="mt-4">
            <Link href="/projects">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Projects
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const readingTime = calculateReadingTime(progress.content);
  const formattedStats = stats ? formatProgressStats(stats) : null;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb>
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink href="/projects">Projects</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink href={`/projects/${project.id}`}>{project.name}</BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Progress</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Header */}
      <div className="flex items-start justify-between">
        <div className="flex-1">
          <div className="flex items-center space-x-4 mb-2">
            <h1 className="text-3xl font-bold">Project Progress</h1>
            <Badge variant={progress.is_published ? "default" : "secondary"}>
              {progress.is_published ? (
                <>
                  <Globe className="h-3 w-3 mr-1" />
                  Published
                </>
              ) : (
                <>
                  <Lock className="h-3 w-3 mr-1" />
                  Draft
                </>
              )}
            </Badge>
            <Badge variant="outline">
              Version {progress.version}
            </Badge>
          </div>
          <p className="text-gray-600">
            Last updated {formatDate(progress.updated_at)} • {readingTime} min read
          </p>
        </div>
        
        <div className="flex items-center space-x-2">
          {!isEditing ? (
            <>
              <Button variant="outline" onClick={() => setIsStatsOpen(true)}>
                <BarChart3 className="h-4 w-4 mr-2" />
                Stats
              </Button>
              
              <Button variant="outline" onClick={() => setIsHistoryOpen(true)}>
                <History className="h-4 w-4 mr-2" />
                History
              </Button>
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="outline">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent>
                  <DropdownMenuLabel>Export Options</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setIsExportOpen(true)}>
                    <FileText className="h-4 w-4 mr-2" />
                    Export Document
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              
              <Button variant="outline" onClick={handleTogglePublish}>
                {progress.is_published ? (
                  <>
                    <Lock className="h-4 w-4 mr-2" />
                    Unpublish
                  </>
                ) : (
                  <>
                    <Share className="h-4 w-4 mr-2" />
                    Publish
                  </>
                )}
              </Button>
              
              <Button onClick={() => setIsEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={handleCancel}>
                <X className="h-4 w-4 mr-2" />
                Cancel
              </Button>
              
              <Button onClick={handleSave} disabled={saving}>
                <Save className="h-4 w-4 mr-2" />
                {saving ? 'Saving...' : 'Save'}
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Content */}
      <div className="grid grid-cols-1 gap-6">
        {isEditing ? (
          <Card>
            <CardHeader>
              <CardTitle>Edit Progress Document</CardTitle>
              <CardDescription>
                Use Markdown syntax to format your content. Changes will be saved as a new version.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <MarkdownEditor
                value={editContent}
                onChange={setEditContent}
                height="600px"
              />
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardContent className="p-6">
              <MarkdownViewer content={progress.content} />
            </CardContent>
          </Card>
        )}
      </div>

      {/* History Dialog */}
      <Dialog open={isHistoryOpen} onOpenChange={setIsHistoryOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              View and manage different versions of the progress document.
            </DialogDescription>
          </DialogHeader>
          <ProgressHistory
            projectId={projectId}
            currentVersion={progress.version}
            onRestore={(version) => {
              // Handle version restore
              setIsHistoryOpen(false);
              loadProgress();
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Stats Dialog */}
      <Dialog open={isStatsOpen} onOpenChange={setIsStatsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Document Statistics</DialogTitle>
            <DialogDescription>
              Detailed statistics about the progress document.
            </DialogDescription>
          </DialogHeader>
          {stats && <ProgressStats stats={stats} />}
        </DialogContent>
      </Dialog>

      {/* Export Dialog */}
      <Dialog open={isExportOpen} onOpenChange={setIsExportOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Export Progress Document</DialogTitle>
            <DialogDescription>
              Export the progress document in various formats.
            </DialogDescription>
          </DialogHeader>
          <ExportDialog
            projectId={projectId}
            onExport={() => setIsExportOpen(false)}
          />
        </DialogContent>
      </Dialog>
    </div>
  );
}