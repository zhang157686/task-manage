'use client';

import { 
  FileText, 
  Clock, 
  TrendingUp, 
  Users, 
  Calendar,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';

import { ProjectProgressStats, formatProgressStats } from '@/types/project-progress';

interface ProgressStatsProps {
  stats: ProjectProgressStats;
}

export function ProgressStats({ stats }: ProgressStatsProps) {
  const formatted = formatProgressStats(stats);

  const StatCard = ({ 
    title, 
    value, 
    description, 
    icon: Icon, 
    trend 
  }: { 
    title: string; 
    value: string | number; 
    description?: string; 
    icon: any; 
    trend?: 'up' | 'down' | 'neutral';
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">
            {description}
          </p>
        )}
        {trend && (
          <div className="flex items-center mt-2">
            <TrendingUp className={`h-3 w-3 mr-1 ${
              trend === 'up' ? 'text-green-500' : 
              trend === 'down' ? 'text-red-500' : 
              'text-gray-500'
            }`} />
            <span className={`text-xs ${
              trend === 'up' ? 'text-green-600' : 
              trend === 'down' ? 'text-red-600' : 
              'text-gray-600'
            }`}>
              {trend === 'up' ? 'Increasing' : trend === 'down' ? 'Decreasing' : 'Stable'}
            </span>
          </div>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard
          title="Total Versions"
          value={stats.total_versions}
          description="Document revisions"
          icon={FileText}
          trend="up"
        />
        
        <StatCard
          title="Word Count"
          value={formatted.wordCount}
          description="Current document"
          icon={BarChart3}
        />
        
        <StatCard
          title="Reading Time"
          value={`${formatted.readingTime} min`}
          description="Estimated time"
          icon={Clock}
        />
        
        <StatCard
          title="Last Updated"
          value={formatted.daysSinceUpdate}
          description="days ago"
          icon={Calendar}
        />
      </div>

      <Separator />

      {/* Detailed Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Content Analysis */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <PieChart className="h-5 w-5 mr-2" />
              Content Analysis
            </CardTitle>
            <CardDescription>
              Breakdown of document content
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Characters</span>
                <span className="font-medium">{formatted.characterCount}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Words</span>
                <span className="font-medium">{formatted.wordCount}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Paragraphs</span>
                <span className="font-medium">{formatted.paragraphCount}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Headings</span>
                <span className="font-medium">{formatted.headingCount}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Code Blocks</span>
                <span className="font-medium">{formatted.codeBlockCount}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Links</span>
                <span className="font-medium">{formatted.linkCount}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Images</span>
                <span className="font-medium">{formatted.imageCount}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Version History */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Activity className="h-5 w-5 mr-2" />
              Version Activity
            </CardTitle>
            <CardDescription>
              Document revision history
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Total Versions</span>
                <span className="font-medium">{stats.total_versions}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Current Version</span>
                <Badge variant="outline">v{stats.current_version}</Badge>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>First Created</span>
                <span className="font-medium">{formatted.firstCreated}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Last Updated</span>
                <span className="font-medium">{formatted.lastUpdated}</span>
              </div>
              
              <div className="flex justify-between text-sm">
                <span>Days Since Update</span>
                <span className="font-medium">{formatted.daysSinceUpdate}</span>
              </div>
            </div>
            
            <Separator />
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Published</span>
                <Badge variant={stats.is_published ? "default" : "secondary"}>
                  {stats.is_published ? 'Yes' : 'No'}
                </Badge>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Growth Metrics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <TrendingUp className="h-5 w-5 mr-2" />
            Growth Metrics
          </CardTitle>
          <CardDescription>
            Document growth over time
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Content Growth</span>
                <span className="text-green-600 font-medium">+{formatted.contentGrowth}%</span>
              </div>
              <Progress value={Math.min(100, Math.abs(parseFloat(formatted.contentGrowth)))} className="h-2" />
              <p className="text-xs text-muted-foreground">Since first version</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Update Frequency</span>
                <span className="font-medium">{formatted.updateFrequency}</span>
              </div>
              <Progress value={75} className="h-2" />
              <p className="text-xs text-muted-foreground">Updates per week</p>
            </div>
            
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Completeness</span>
                <span className="font-medium">{formatted.completeness}%</span>
              </div>
              <Progress value={parseFloat(formatted.completeness)} className="h-2" />
              <p className="text-xs text-muted-foreground">Estimated completion</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Document Health</CardTitle>
          <CardDescription>
            Overall document quality and recommendations
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {stats.word_count > 1000 && (
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-green-100 text-green-800">
                  Good Length
                </Badge>
                <span className="text-sm">Document has substantial content</span>
              </div>
            )}
            
            {stats.total_versions > 5 && (
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-blue-100 text-blue-800">
                  Active Development
                </Badge>
                <span className="text-sm">Regular updates and improvements</span>
              </div>
            )}
            
            {stats.is_published && (
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-purple-100 text-purple-800">
                  Published
                </Badge>
                <span className="text-sm">Document is publicly available</span>
              </div>
            )}
            
            {formatted.daysSinceUpdate === '0' && (
              <div className="flex items-center space-x-2">
                <Badge variant="default" className="bg-orange-100 text-orange-800">
                  Recently Updated
                </Badge>
                <span className="text-sm">Document was updated today</span>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}