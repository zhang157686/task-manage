'use client';

import { useState } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { 
  Bold, 
  Italic, 
  Code, 
  Link, 
  List, 
  ListOrdered, 
  Quote, 
  Heading1, 
  Heading2, 
  Heading3,
  Eye,
  Edit
} from 'lucide-react';
import { MarkdownViewer } from './markdown-viewer';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  height?: string;
  placeholder?: string;
}

export function MarkdownEditor({ 
  value, 
  onChange, 
  height = '400px', 
  placeholder = 'Write your content in Markdown...' 
}: MarkdownEditorProps) {
  const [activeTab, setActiveTab] = useState<'edit' | 'preview'>('edit');

  const insertText = (before: string, after: string = '', placeholder: string = '') => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const textToInsert = selectedText || placeholder;
    
    const newText = value.substring(0, start) + before + textToInsert + after + value.substring(end);
    onChange(newText);
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + before.length + textToInsert.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const insertAtLineStart = (prefix: string) => {
    const textarea = document.querySelector('textarea') as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const lines = value.split('\n');
    let currentLine = 0;
    let charCount = 0;
    
    // Find which line the cursor is on
    for (let i = 0; i < lines.length; i++) {
      if (charCount + lines[i].length >= start) {
        currentLine = i;
        break;
      }
      charCount += lines[i].length + 1; // +1 for newline
    }
    
    // Insert prefix at the beginning of the line
    lines[currentLine] = prefix + lines[currentLine];
    const newText = lines.join('\n');
    onChange(newText);
    
    // Set cursor position
    setTimeout(() => {
      const newCursorPos = start + prefix.length;
      textarea.setSelectionRange(newCursorPos, newCursorPos);
      textarea.focus();
    }, 0);
  };

  const toolbarButtons = [
    {
      icon: Heading1,
      label: 'Heading 1',
      action: () => insertAtLineStart('# '),
    },
    {
      icon: Heading2,
      label: 'Heading 2',
      action: () => insertAtLineStart('## '),
    },
    {
      icon: Heading3,
      label: 'Heading 3',
      action: () => insertAtLineStart('### '),
    },
    {
      icon: Bold,
      label: 'Bold',
      action: () => insertText('**', '**', 'bold text'),
    },
    {
      icon: Italic,
      label: 'Italic',
      action: () => insertText('*', '*', 'italic text'),
    },
    {
      icon: Code,
      label: 'Inline Code',
      action: () => insertText('`', '`', 'code'),
    },
    {
      icon: Link,
      label: 'Link',
      action: () => insertText('[', '](url)', 'link text'),
    },
    {
      icon: List,
      label: 'Bullet List',
      action: () => insertAtLineStart('- '),
    },
    {
      icon: ListOrdered,
      label: 'Numbered List',
      action: () => insertAtLineStart('1. '),
    },
    {
      icon: Quote,
      label: 'Quote',
      action: () => insertAtLineStart('> '),
    },
  ];

  return (
    <div className="border rounded-lg overflow-hidden">
      {/* Toolbar */}
      <div className="border-b bg-gray-50 p-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-1">
            {toolbarButtons.map((button, index) => (
              <Button
                key={index}
                variant="ghost"
                size="sm"
                onClick={button.action}
                title={button.label}
                className="h-8 w-8 p-0"
              >
                <button.icon className="h-4 w-4" />
              </Button>
            ))}
          </div>
          
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'edit' | 'preview')}>
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="edit" className="flex items-center">
                <Edit className="h-4 w-4 mr-1" />
                Edit
              </TabsTrigger>
              <TabsTrigger value="preview" className="flex items-center">
                <Eye className="h-4 w-4 mr-1" />
                Preview
              </TabsTrigger>
            </TabsList>
          </Tabs>
        </div>
      </div>

      {/* Content */}
      <div style={{ height }}>
        <Tabs value={activeTab} className="h-full">
          <TabsContent value="edit" className="h-full m-0 p-0">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="h-full resize-none border-0 rounded-none focus-visible:ring-0"
              style={{ minHeight: height }}
            />
          </TabsContent>
          
          <TabsContent value="preview" className="h-full m-0 p-4 overflow-y-auto">
            {value.trim() ? (
              <MarkdownViewer content={value} />
            ) : (
              <div className="text-gray-500 text-center py-8">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>Nothing to preview yet</p>
                <p className="text-sm">Start writing in the Edit tab to see a preview here</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* Footer */}
      <div className="border-t bg-gray-50 px-3 py-2 text-xs text-gray-500">
        <div className="flex justify-between items-center">
          <span>
            {value.length} characters • {value.split(/\s+/).filter(word => word.length > 0).length} words
          </span>
          <span>
            Supports Markdown syntax
          </span>
        </div>
      </div>
    </div>
  );
}