'use client';

import { useState } from 'react';
import { 
  Download, 
  FileText, 
  Globe, 
  Printer, 
  Share2,
  Copy,
  Check
} from 'lucide-react';
import { toast } from 'sonner';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';

import { ProgressExportRequest } from '@/types/project-progress';
import { projectProgressService } from '@/services/project-progress';

interface ExportDialogProps {
  projectId: number;
  onExport?: () => void;
}

export function ExportDialog({ projectId, onExport }: ExportDialogProps) {
  const [format, setFormat] = useState<'markdown' | 'html' | 'pdf' | 'docx'>('markdown');
  const [includeMetadata, setIncludeMetadata] = useState(true);
  const [includeTableOfContents, setIncludeTableOfContents] = useState(true);
  const [includeVersionInfo, setIncludeVersionInfo] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customFooter, setCustomFooter] = useState('');
  const [exporting, setExporting] = useState(false);
  const [exportUrl, setExportUrl] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const exportOptions = [
    {
      value: 'markdown',
      label: 'Markdown',
      description: 'Raw Markdown file (.md)',
      icon: FileText,
      badge: 'Popular'
    },
    {
      value: 'html',
      label: 'HTML',
      description: 'Styled HTML document (.html)',
      icon: Globe,
      badge: 'Web Ready'
    },
    {
      value: 'pdf',
      label: 'PDF',
      description: 'Portable Document Format (.pdf)',
      icon: Printer,
      badge: 'Print Ready'
    },
    {
      value: 'docx',
      label: 'Word Document',
      description: 'Microsoft Word format (.docx)',
      icon: FileText,
      badge: 'Office'
    }
  ];

  const handleExport = async () => {
    try {
      setExporting(true);
      
      const request: ProgressExportRequest = {
        format,
        include_metadata: includeMetadata,
        include_toc: includeTableOfContents,
        include_version_info: includeVersionInfo,
        custom_title: customTitle || undefined,
        custom_footer: customFooter || undefined,
      };

      const response = await projectProgressService.exportProgress(projectId, request);
      
      if (response.download_url) {
        // Create download link
        const link = document.createElement('a');
        link.href = response.download_url;
        link.download = response.filename;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        
        setExportUrl(response.download_url);
        toast.success('Document exported successfully');
      } else {
        toast.error('Export failed: No download URL provided');
      }
      
      onExport?.();
    } catch (error: any) {
      console.error('Export failed:', error);
      toast.error(error.response?.data?.detail || 'Failed to export document');
    } finally {
      setExporting(false);
    }
  };

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      toast.success('URL copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    } catch (error) {
      toast.error('Failed to copy URL');
    }
  };

  const selectedOption = exportOptions.find(option => option.value === format);

  return (
    <div className="space-y-6">
      {/* Format Selection */}
      <div>
        <Label className="text-base font-medium">Export Format</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Choose the format for your exported document
        </p>
        
        <RadioGroup value={format} onValueChange={(value) => setFormat(value as any)}>
          <div className="grid grid-cols-1 gap-3">
            {exportOptions.map((option) => (
              <div key={option.value} className="flex items-center space-x-3">
                <RadioGroupItem value={option.value} id={option.value} />
                <Label 
                  htmlFor={option.value} 
                  className="flex-1 cursor-pointer"
                >
                  <Card className={`transition-colors ${format === option.value ? 'ring-2 ring-blue-500' : ''}`}>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <option.icon className="h-5 w-5 text-muted-foreground" />
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="font-medium">{option.label}</span>
                              {option.badge && (
                                <Badge variant="secondary" className="text-xs">
                                  {option.badge}
                                </Badge>
                              )}
                            </div>
                            <p className="text-sm text-muted-foreground">
                              {option.description}
                            </p>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Label>
              </div>
            ))}
          </div>
        </RadioGroup>
      </div>

      <Separator />

      {/* Export Options */}
      <div>
        <Label className="text-base font-medium">Export Options</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Customize what to include in your export
        </p>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="metadata" 
              checked={includeMetadata}
              onCheckedChange={setIncludeMetadata}
            />
            <Label htmlFor="metadata" className="text-sm">
              Include document metadata (creation date, version, etc.)
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="toc" 
              checked={includeTableOfContents}
              onCheckedChange={setIncludeTableOfContents}
            />
            <Label htmlFor="toc" className="text-sm">
              Generate table of contents
            </Label>
          </div>
          
          <div className="flex items-center space-x-2">
            <Checkbox 
              id="version" 
              checked={includeVersionInfo}
              onCheckedChange={setIncludeVersionInfo}
            />
            <Label htmlFor="version" className="text-sm">
              Include version history information
            </Label>
          </div>
        </div>
      </div>

      <Separator />

      {/* Customization */}
      <div>
        <Label className="text-base font-medium">Customization</Label>
        <p className="text-sm text-muted-foreground mb-4">
          Add custom title and footer (optional)
        </p>
        
        <div className="space-y-4">
          <div>
            <Label htmlFor="title" className="text-sm">Custom Title</Label>
            <Input
              id="title"
              placeholder="Leave empty to use document title"
              value={customTitle}
              onChange={(e) => setCustomTitle(e.target.value)}
            />
          </div>
          
          <div>
            <Label htmlFor="footer" className="text-sm">Custom Footer</Label>
            <Textarea
              id="footer"
              placeholder="Add custom footer text (e.g., copyright, contact info)"
              value={customFooter}
              onChange={(e) => setCustomFooter(e.target.value)}
              rows={3}
            />
          </div>
        </div>
      </div>

      <Separator />

      {/* Export Summary */}
      <div>
        <Label className="text-base font-medium">Export Summary</Label>
        <Card className="mt-2">
          <CardContent className="p-4">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Format:</span>
                <span className="font-medium">{selectedOption?.label}</span>
              </div>
              <div className="flex justify-between">
                <span>Include metadata:</span>
                <span className="font-medium">{includeMetadata ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Table of contents:</span>
                <span className="font-medium">{includeTableOfContents ? 'Yes' : 'No'}</span>
              </div>
              <div className="flex justify-between">
                <span>Version info:</span>
                <span className="font-medium">{includeVersionInfo ? 'Yes' : 'No'}</span>
              </div>
              {customTitle && (
                <div className="flex justify-between">
                  <span>Custom title:</span>
                  <span className="font-medium truncate ml-2">{customTitle}</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Export Button */}
      <div className="flex justify-end space-x-2">
        <Button
          onClick={handleExport}
          disabled={exporting}
          className="min-w-[120px]"
        >
          {exporting ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Exporting...
            </>
          ) : (
            <>
              <Download className="h-4 w-4 mr-2" />
              Export
            </>
          )}
        </Button>
      </div>

      {/* Export Result */}
      {exportUrl && (
        <Card className="border-green-200 bg-green-50">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Check className="h-5 w-5 text-green-600" />
                <span className="text-sm font-medium text-green-800">
                  Export completed successfully
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyToClipboard(exportUrl)}
                  className="text-green-700 border-green-300"
                >
                  {copied ? (
                    <>
                      <Check className="h-4 w-4 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy URL
                    </>
                  )}
                </Button>
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => window.open(exportUrl, '_blank')}
                  className="text-green-700 border-green-300"
                >
                  <Share2 className="h-4 w-4 mr-1" />
                  Open
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}