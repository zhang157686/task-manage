'use client';

import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import {
    ArrowLeft,
    Download,
    FileText,
    Calendar,
    Settings,
    CheckCircle,
    Loader2
} from 'lucide-react';
import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { projectsService } from '@/services/projects';
import { projectProgressService } from '@/services/project-progress';
import { ProjectListItem } from '@/types/project';

export default function ProgressExportPage() {
    const [projects, setProjects] = useState<ProjectListItem[]>([]);
    const [projectsWithProgress, setProjectsWithProgress] = useState<number[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [exportFormat, setExportFormat] = useState<'html' | 'pdf' | 'markdown' | 'docx'>('pdf');
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includeTaskDetails, setIncludeTaskDetails] = useState(true);
    const [includeTimeline, setIncludeTimeline] = useState(true);
    const [dateRange, setDateRange] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    useEffect(() => {
        loadProjects();
    }, []);

    const loadProjects = async () => {
        try {
            setLoading(true);

            // Get all projects
            const allProjects = await projectsService.getProjects({});
            setProjects(allProjects);

            // Check which projects have progress documents
            const progressChecks = await Promise.all(
                allProjects.map(async (project) => {
                    try {
                        await projectProgressService.getProgress(project.id);
                        return project.id;
                    } catch (error: any) {
                        if (error.response?.status === 404) {
                            return null;
                        }
                        throw error;
                    }
                })
            );

            const validProjectIds = progressChecks.filter(id => id !== null) as number[];
            setProjectsWithProgress(validProjectIds);

        } catch (error) {
            console.error('Failed to load projects:', error);
            toast.error('加载项目失败');
        } finally {
            setLoading(false);
        }
    };

    const handleExport = async () => {
        if (selectedProjects.length === 0) {
            toast.error('请选择要导出的项目');
            return;
        }

        setIsExporting(true);
        try {
            const projectIds = selectedProjects.includes('all')
                ? projectsWithProgress
                : selectedProjects.map(id => parseInt(id));

            // Export each project's progress document
            for (const projectId of projectIds) {
                const project = projects.find(p => p.id === projectId);
                if (!project) continue;

                try {
                    // Get progress document
                    const progress = await projectProgressService.getProgress(projectId);

                    // Generate export content based on format
                    let content = '';
                    let filename = '';
                    let mimeType = '';

                    if (exportFormat === 'markdown') {
                        content = generateMarkdownExport(project, progress, {
                            includeCharts,
                            includeTaskDetails,
                            includeTimeline
                        });
                        filename = `${project.name}-进展报告.md`;
                        mimeType = 'text/markdown';
                    } else if (exportFormat === 'html') {
                        content = generateHtmlExport(project, progress, {
                            includeCharts,
                            includeTaskDetails,
                            includeTimeline
                        });
                        filename = `${project.name}-进展报告.html`;
                        mimeType = 'text/html';
                    } else {
                        // For PDF and DOCX, we'll generate HTML and let the user save/print
                        content = generateHtmlExport(project, progress, {
                            includeCharts,
                            includeTaskDetails,
                            includeTimeline
                        });
                        filename = `${project.name}-进展报告.html`;
                        mimeType = 'text/html';
                    }

                    // Create and download file
                    const blob = new Blob([content], { type: mimeType });
                    const url = URL.createObjectURL(blob);
                    const link = document.createElement('a');
                    link.href = url;
                    link.download = filename;
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);

                    toast.success(`${project.name} 导出成功`);
                } catch (error: any) {
                    console.error(`Failed to export project ${project.name}:`, error);
                    toast.error(`${project.name} 导出失败: ${error.response?.data?.detail || error.message}`);
                }
            }

        } catch (error: any) {
            console.error('Export failed:', error);
            toast.error('导出失败');
        } finally {
            setIsExporting(false);
        }
    };

    const generateMarkdownExport = (project: ProjectListItem, progress: any, options: any) => {
        const now = new Date().toLocaleString('zh-CN');

        let content = `# ${project.name} - 项目进展报告

**生成时间**: ${now}
**项目描述**: ${project.description || '无'}
**项目状态**: ${getProjectStatusLabel(project.status)}
**文档版本**: ${progress.version}
**最后更新**: ${new Date(progress.updated_at).toLocaleString('zh-CN')}

---

## 项目概览

${progress.content}

---

## 文档信息

- **创建时间**: ${new Date(progress.created_at).toLocaleString('zh-CN')}
- **更新时间**: ${new Date(progress.updated_at).toLocaleString('zh-CN')}
- **版本号**: ${progress.version}
- **发布状态**: ${progress.is_published ? '已发布' : '草稿'}
- **内容长度**: ${progress.content.length.toLocaleString()} 字符

---

*此报告由任务管理系统自动生成*
`;

        return content;
    };

    const generateHtmlExport = (project: ProjectListItem, progress: any, options: any) => {
        const now = new Date().toLocaleString('zh-CN');

        return `<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${project.name} - 项目进展报告</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; max-width: 800px; margin: 0 auto; padding: 20px; }
        h1, h2, h3 { color: #333; }
        .header { border-bottom: 2px solid #eee; padding-bottom: 20px; margin-bottom: 30px; }
        .meta { background: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0; }
        .meta-item { margin: 5px 0; }
        .content { margin: 30px 0; }
        .footer { border-top: 1px solid #eee; padding-top: 20px; margin-top: 40px; text-align: center; color: #666; font-size: 0.9em; }
    </style>
</head>
<body>
    <div class="header">
        <h1>${project.name} - 项目进展报告</h1>
        <p><strong>生成时间</strong>: ${now}</p>
    </div>
    
    <div class="meta">
        <div class="meta-item"><strong>项目描述</strong>: ${project.description || '无'}</div>
        <div class="meta-item"><strong>项目状态</strong>: ${getProjectStatusLabel(project.status)}</div>
        <div class="meta-item"><strong>文档版本</strong>: ${progress.version}</div>
        <div class="meta-item"><strong>最后更新</strong>: ${new Date(progress.updated_at).toLocaleString('zh-CN')}</div>
        <div class="meta-item"><strong>发布状态</strong>: ${progress.is_published ? '已发布' : '草稿'}</div>
    </div>
    
    <div class="content">
        <h2>项目概览</h2>
        <div>${progress.content.replace(/\n/g, '<br>')}</div>
    </div>
    
    <div class="footer">
        <p>此报告由任务管理系统自动生成</p>
    </div>
</body>
</html>`;
    };

    const getProjectStatusLabel = (status: string) => {
        switch (status) {
            case 'active': return '进行中';
            case 'completed': return '已完成';
            case 'on_hold': return '暂停';
            case 'cancelled': return '已取消';
            default: return '未知';
        }
    };

    const handleProjectSelection = (projectId: string, checked: boolean) => {
        if (projectId === 'all') {
            if (checked) {
                setSelectedProjects(['all']);
            } else {
                setSelectedProjects([]);
            }
        } else {
            setSelectedProjects(prev => {
                const newSelection = prev.filter(id => id !== 'all');
                if (checked) {
                    return [...newSelection, projectId];
                } else {
                    return newSelection.filter(id => id !== projectId);
                }
            });
        }
    };

    const getSelectedProjectCount = () => {
        if (selectedProjects.includes('all')) {
            return projectsWithProgress.length;
        }
        return selectedProjects.length;
    };

    return (
        <div className="container mx-auto py-6 max-w-4xl">
            {/* Header */}
            <div className="flex items-center space-x-4 mb-6">
                <Button variant="ghost" size="sm" asChild>
                    <Link href="/progress">
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        返回文档管理
                    </Link>
                </Button>
                <div>
                    <h1 className="text-3xl font-bold">导出报告</h1>
                    <p className="text-gray-600 mt-1">
                        生成和导出项目进展报告
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Export Configuration */}
                <div className="lg:col-span-2 space-y-6">
                    {/* Project Selection */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>选择项目</span>
                            </CardTitle>
                            <CardDescription>
                                选择要包含在报告中的项目
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            {loading ? (
                                <div className="flex items-center justify-center py-8">
                                    <Loader2 className="h-6 w-6 animate-spin mr-2" />
                                    <span>加载项目中...</span>
                                </div>
                            ) : projectsWithProgress.length === 0 ? (
                                <div className="space-y-3">
                                    <div className="text-center py-8">
                                        <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                                        <h3 className="text-lg font-medium text-gray-900 mb-2">暂无可导出的项目</h3>
                                        <p className="text-gray-500 mb-4">
                                            没有找到包含进展文档的项目
                                        </p>
                                        <Button asChild variant="outline">
                                            <Link href="/progress">
                                                <FileText className="h-4 w-4 mr-2" />
                                                创建进展文档
                                            </Link>
                                        </Button>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="all-projects"
                                            checked={selectedProjects.includes('all')}
                                            onCheckedChange={(checked) => handleProjectSelection('all', !!checked)}
                                        />
                                        <Label htmlFor="all-projects" className="font-medium">
                                            所有项目 ({projectsWithProgress.length} 个)
                                        </Label>
                                    </div>
                                    <div className="ml-6 space-y-2">
                                        {projects
                                            .filter(project => projectsWithProgress.includes(project.id))
                                            .map((project) => (
                                                <div key={project.id} className="flex items-center space-x-2">
                                                    <Checkbox
                                                        id={`project-${project.id}`}
                                                        checked={selectedProjects.includes('all') || selectedProjects.includes(project.id.toString())}
                                                        onCheckedChange={(checked) => handleProjectSelection(project.id.toString(), !!checked)}
                                                        disabled={selectedProjects.includes('all')}
                                                    />
                                                    <Label htmlFor={`project-${project.id}`} className="text-sm">
                                                        {project.name}
                                                    </Label>
                                                    {project.description && (
                                                        <span className="text-xs text-gray-500 truncate max-w-xs">
                                                            - {project.description}
                                                        </span>
                                                    )}
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    {/* Export Options */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center space-x-2">
                                <Settings className="h-5 w-5" />
                                <span>导出选项</span>
                            </CardTitle>
                            <CardDescription>
                                配置报告的格式和内容
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>导出格式</Label>
                                    <Select value={exportFormat} onValueChange={setExportFormat}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="pdf">PDF 文档</SelectItem>
                                            <SelectItem value="docx">Word 文档</SelectItem>
                                            <SelectItem value="html">HTML 网页</SelectItem>
                                            <SelectItem value="markdown">Markdown 文档</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className="space-y-2">
                                    <Label>时间范围</Label>
                                    <Select value={dateRange} onValueChange={setDateRange}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="all">全部时间</SelectItem>
                                            <SelectItem value="last-week">最近一周</SelectItem>
                                            <SelectItem value="last-month">最近一月</SelectItem>
                                            <SelectItem value="last-quarter">最近一季度</SelectItem>
                                            <SelectItem value="custom">自定义范围</SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <Label className="text-base font-medium">包含内容</Label>
                                <div className="space-y-3">
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="include-charts"
                                            checked={includeCharts}
                                            onCheckedChange={setIncludeCharts}
                                        />
                                        <Label htmlFor="include-charts">
                                            图表和统计数据
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="include-task-details"
                                            checked={includeTaskDetails}
                                            onCheckedChange={setIncludeTaskDetails}
                                        />
                                        <Label htmlFor="include-task-details">
                                            任务详细信息
                                        </Label>
                                    </div>
                                    <div className="flex items-center space-x-2">
                                        <Checkbox
                                            id="include-timeline"
                                            checked={includeTimeline}
                                            onCheckedChange={setIncludeTimeline}
                                        />
                                        <Label htmlFor="include-timeline">
                                            项目时间线
                                        </Label>
                                    </div>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Export Button */}
                    <Card>
                        <CardContent className="pt-6">
                            <Button
                                onClick={handleExport}
                                disabled={isExporting || selectedProjects.length === 0 || projectsWithProgress.length === 0}
                                className="w-full"
                                size="lg"
                            >
                                {isExporting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                                        生成报告中...
                                    </>
                                ) : (
                                    <>
                                        <Download className="h-4 w-4 mr-2" />
                                        导出报告
                                    </>
                                )}
                            </Button>
                        </CardContent>
                    </Card>
                </div>

                {/* Sidebar */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">报告预览</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                            <div className="text-sm space-y-2">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">格式:</span>
                                    <span className="font-medium">{exportFormat.toUpperCase()}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">项目数:</span>
                                    <span className="font-medium">
                                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : getSelectedProjectCount()}
                                    </span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-gray-600">时间范围:</span>
                                    <span className="font-medium">
                                        {dateRange === 'all' ? '全部' :
                                            dateRange === 'last-week' ? '最近一周' :
                                                dateRange === 'last-month' ? '最近一月' :
                                                    dateRange === 'last-quarter' ? '最近一季度' : '自定义'}
                                    </span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">报告内容</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-2 text-sm">
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>项目概览</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <CheckCircle className="h-4 w-4 text-green-500" />
                                    <span>任务统计</span>
                                </div>
                                {includeCharts && (
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>图表数据</span>
                                    </div>
                                )}
                                {includeTaskDetails && (
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>任务详情</span>
                                    </div>
                                )}
                                {includeTimeline && (
                                    <div className="flex items-center space-x-2">
                                        <CheckCircle className="h-4 w-4 text-green-500" />
                                        <span>时间线</span>
                                    </div>
                                )}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle className="text-lg">快速操作</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <Button asChild variant="outline" size="sm" className="w-full justify-start">
                                <Link href="/projects">
                                    <FileText className="h-4 w-4 mr-2" />
                                    查看项目
                                </Link>
                            </Button>
                            <Button asChild variant="outline" size="sm" className="w-full justify-start">
                                <Link href="/analytics/overview">
                                    <Calendar className="h-4 w-4 mr-2" />
                                    数据分析
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </div>
    );
}