'use client';

import { useState } from 'react';
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
    CheckCircle
} from 'lucide-react';
import Link from 'next/link';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';

export default function ProgressExportPage() {
    const [selectedProjects, setSelectedProjects] = useState<string[]>([]);
    const [exportFormat, setExportFormat] = useState('pdf');
    const [includeCharts, setIncludeCharts] = useState(true);
    const [includeTaskDetails, setIncludeTaskDetails] = useState(true);
    const [includeTimeline, setIncludeTimeline] = useState(true);
    const [dateRange, setDateRange] = useState('all');
    const [isExporting, setIsExporting] = useState(false);

    const handleExport = async () => {
        setIsExporting(true);
        try {
            // TODO: Implement export functionality
            await new Promise(resolve => setTimeout(resolve, 2000)); // Mock delay
            // Download would happen here
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setIsExporting(false);
        }
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
                            <div className="space-y-3">
                                <div className="flex items-center space-x-2">
                                    <Checkbox
                                        id="all-projects"
                                        checked={selectedProjects.includes('all')}
                                        onCheckedChange={(checked) => {
                                            if (checked) {
                                                setSelectedProjects(['all']);
                                            } else {
                                                setSelectedProjects([]);
                                            }
                                        }}
                                    />
                                    <Label htmlFor="all-projects" className="font-medium">
                                        所有项目
                                    </Label>
                                </div>
                                <div className="ml-6 space-y-2 text-sm text-gray-600">
                                    <p>暂无项目可选择</p>
                                    <p>创建项目后将在此处显示</p>
                                </div>
                            </div>
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
                                            <SelectItem value="xlsx">Excel 表格</SelectItem>
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
                                disabled={isExporting || selectedProjects.length === 0}
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
                                    <span className="font-medium">0</span>
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