'use client';

import { useState, useEffect } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { 
  Clock, 
  User, 
  FileText, 
  RotateCcw, 
  Eye, 
  GitCompare,
  ChevronDown,
  ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';

import { ProgressHistory as ProgressHistoryType, ProgressVersionCompare } from '@/types/project-progress';
import { projectProgressService } from '@/services/project-progress';
import { MarkdownViewer } from './markdown-viewer';

interface ProgressHistoryProps {
  projectId: number;
  currentVersion: number;
  onRestore?: (version: number) => void;
}

export function ProgressHistory({ projectId, currentVersion, onRestore }: ProgressHistoryProps) {
  const [history, setHistory] = useState<ProgressHistoryType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVersion, setSelectedVersion] = useState<ProgressHistoryType | null>(null);
  const [compareVersion, setCompareVersion] = useState<ProgressHistoryType | null>(null);
  const [comparison, setComparison] = useState<ProgressVersionCompare | null>(null);
  const [expandedVersions, setExpandedVersions] = useState<Set<number>>(new Set());

  useEffect(() => {
    loadHistory();
  }, [projectId]);

  const loadHistory = async () => {
    try {
      setLoading(true);
      const data = await projectProgressService.getProgressHistory(projectId, { limit: 50 });
      setHistory(data);
    } catch (error) {
      console.error('Failed to load history:', error);
      toast.error('Failed to load version history');
    } finally {
      setLoading(false);
    }
  };

  const handleRestore = async (version: number) => {
    try {
      await projectProgressService.restoreVersion(
        projectId, 
        version, 
        `Restored to version ${version}`
      );
      toast.success(`Successfully restored to version ${version}`);
      onRestore?.(version);
    } catch (error: any) {
      console.error('Failed to restore version:', error);
      toast.error(error.response?.data?.detail || 'Failed to restore version');
    }
  };

  const handleCompare = async (versionA: number, versionB: number) => {
    try {
      const data = await projectProgressService.compareVersions(projectId, versionA, versionB);
      setComparison(data);
    } catch (error: any) {
      console.error('Failed to compare versions:', error);
      toast.error(error.response?.data?.detail || 'Failed to compare versions');
    }
  };

  const toggleExpanded = (version: number) => {
    const newExpanded = new Set(expandedVersions);
    if (newExpanded.has(version)) {
      newExpanded.delete(version);
    } else {
      newExpanded.add(version);
    }
    setExpandedVersions(newExpanded);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getRelativeTime = (dateString: string) => {
    return formatDistanceToNow(new Date(dateString), { 
      addSuffix: true, 
      locale: zhCN 
    });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="text-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900 mx-auto"></div>
          <p className="mt-2 text-sm text-gray-600">Loading history...</p>
        </div>
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="text-center py-8">
        <Clock className="h-8 w-8 mx-auto mb-2 text-gray-400" />
        <p className="text-gray-600">No version history available</p>
        <p className="text-sm text-gray-500">Changes will appear here as you edit the document</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Version History</h3>
          <p className="text-sm text-gray-600">{history.length} versions available</p>
        </div>
        
        {compareVersion && (
          <div className="flex items-center space-x-2">
            <Badge variant="outline">
              Comparing v{compareVersion.version}
            </Badge>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setCompareVersion(null)}
            >
              Cancel Compare
            </Button>
          </div>
        )}
      </div>

      {/* History List */}
      <ScrollArea className="h-96">
        <div className="space-y-2">
          {history.map((version) => {
            const isExpanded = expandedVersions.has(version.version);
            const isCurrent = version.version === currentVersion;
            const isComparing = compareVersion?.version === version.version;
            
            return (
              <Card key={version.version} className={`${isCurrent ? 'ring-2 ring-blue-500' : ''}`}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleExpanded(version.version)}
                        className="h-6 w-6 p-0"
                      >
                        {isExpanded ? (
                          <ChevronDown className="h-4 w-4" />
                        ) : (
                          <ChevronRight className="h-4 w-4" />
                        )}
                      </Button>
                      
                      <div>
                        <div className="flex items-center space-x-2">
                          <CardTitle className="text-sm">
                            Version {version.version}
                          </CardTitle>
                          {isCurrent && (
                            <Badge variant="default" className="text-xs">
                              Current
                            </Badge>
                          )}
                          {isComparing && (
                            <Badge variant="secondary" className="text-xs">
                              Comparing
                            </Badge>
                          )}
                        </div>
                        <CardDescription className="text-xs">
                          {formatDate(version.created_at)} • {getRelativeTime(version.created_at)}
                        </CardDescription>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-1">
                      {!compareVersion ? (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => setCompareVersion(version)}
                            disabled={isCurrent}
                            title="Compare with current version"
                          >
                            <GitCompare className="h-4 w-4" />
                          </Button>
                          
                          <Dialog>
                            <DialogTrigger asChild>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => setSelectedVersion(version)}
                                title="View this version"
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                            </DialogTrigger>
                            <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                              <DialogHeader>
                                <DialogTitle>Version {version.version}</DialogTitle>
                                <DialogDescription>
                                  Created {formatDate(version.created_at)}
                                </DialogDescription>
                              </DialogHeader>
                              <div className="mt-4">
                                <MarkdownViewer 
                                  content={version.content} 
                                  showTableOfContents={false}
                                />
                              </div>
                            </DialogContent>
                          </Dialog>
                          
                          {!isCurrent && (
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  title="Restore this version"
                                >
                                  <RotateCcw className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>Restore Version {version.version}?</AlertDialogTitle>
                                  <AlertDialogDescription>
                                    This will create a new version with the content from version {version.version}. 
                                    The current version will be preserved in history.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                                  <AlertDialogAction onClick={() => handleRestore(version.version)}>
                                    Restore
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          )}
                        </>
                      ) : (
                        <Button
                          variant={isComparing ? "default" : "outline"}
                          size="sm"
                          onClick={() => {
                            if (isComparing) {
                              setCompareVersion(null);
                            } else {
                              handleCompare(compareVersion.version, version.version);
                            }
                          }}
                          disabled={version.version === compareVersion.version}
                        >
                          {isComparing ? 'Cancel' : 'Compare'}
                        </Button>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                {isExpanded && (
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {version.change_summary && (
                        <div>
                          <p className="text-sm font-medium text-gray-700">Changes:</p>
                          <p className="text-sm text-gray-600">{version.change_summary}</p>
                        </div>
                      )}
                      
                      <div className="grid grid-cols-3 gap-4 text-xs text-gray-500">
                        <div>
                          <span className="font-medium">Size:</span> {version.content.length} chars
                        </div>
                        <div>
                          <span className="font-medium">Words:</span> {version.content.split(/\s+/).length}
                        </div>
                        <div>
                          <span className="font-medium">Lines:</span> {version.content.split('\n').length}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                )}
              </Card>
            );
          })}
        </div>
      </ScrollArea>

      {/* Comparison Dialog */}
      {comparison && (
        <Dialog open={!!comparison} onOpenChange={() => setComparison(null)}>
          <DialogContent className="max-w-6xl max-h-[80vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>
                Compare Versions {comparison.version_a} and {comparison.version_b}
              </DialogTitle>
              <DialogDescription>
                Differences between the two versions
              </DialogDescription>
            </DialogHeader>
            
            <div className="mt-4 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h4 className="font-medium mb-2">Version {comparison.version_a}</h4>
                  <div className="border rounded p-4 bg-red-50">
                    <MarkdownViewer 
                      content={comparison.content_a} 
                      showTableOfContents={false}
                    />
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium mb-2">Version {comparison.version_b}</h4>
                  <div className="border rounded p-4 bg-green-50">
                    <MarkdownViewer 
                      content={comparison.content_b} 
                      showTableOfContents={false}
                    />
                  </div>
                </div>
              </div>
              
              {comparison.diff_summary && (
                <div>
                  <h4 className="font-medium mb-2">Summary of Changes</h4>
                  <div className="bg-gray-50 p-4 rounded text-sm">
                    {comparison.diff_summary}
                  </div>
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}