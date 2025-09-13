/**
 * Project Progress related types
 */

export interface ProgressHistory {
  id: number;
  version: number;
  content: string;
  change_summary?: string;
  updated_by: number;
  created_at: string;
}

export interface ProjectProgress {
  id: number;
  project_id: number;
  content: string;
  version: number;
  updated_by: number;
  is_published: boolean;
  created_at: string;
  updated_at: string;
}

export interface ProjectProgressWithHistory extends ProjectProgress {
  history: ProgressHistory[];
}

export interface ProjectProgressStats {
  total_versions: number;
  current_version: number;
  total_characters: number;
  total_words: number;
  total_lines: number;
  word_count: number;
  character_count: number;
  first_created: string;
  last_updated: string;
  is_published: boolean;
}

export interface ProgressVersionCompare {
  version_a: number;
  version_b: number;
  content_a: string;
  content_b: string;
  diff_summary: string;
  added_lines: number;
  removed_lines: number;
  modified_lines: number;
}

export interface ProjectProgressCreate {
  content: string;
  is_published?: boolean;
  change_summary?: string;
}

export interface ProjectProgressUpdate {
  content?: string;
  is_published?: boolean;
  change_summary?: string;
}

export interface ProgressSearchRequest {
  query?: string;
  project_ids?: number[];
  is_published?: boolean;
  updated_from?: string;
  updated_to?: string;
  skip?: number;
  limit?: number;
}

export interface ProgressExportRequest {
  format: 'html' | 'pdf' | 'markdown' | 'docx';
  include_metadata?: boolean;
  include_toc?: boolean;
  include_version_info?: boolean;
  custom_title?: string;
  custom_footer?: string;
}

export interface ProgressExportResponse {
  success: boolean;
  message: string;
  filename: string;
  download_url?: string;
  file_size?: number;
  expires_at?: string;
}

// Export format options for UI
export const EXPORT_FORMAT_OPTIONS = [
  { value: 'markdown', label: 'Markdown (.md)', icon: '📝' },
  { value: 'html', label: 'HTML (.html)', icon: '🌐' },
  { value: 'pdf', label: 'PDF (.pdf)', icon: '📄' },
] as const;

// Helper functions
export const formatProgressStats = (stats: ProjectProgressStats) => {
  const now = new Date();
  const lastUpdated = new Date(stats.last_updated);
  const firstCreated = new Date(stats.first_created);
  const daysSinceUpdate = Math.floor((now.getTime() - lastUpdated.getTime()) / (1000 * 60 * 60 * 24));
  const totalDays = Math.floor((lastUpdated.getTime() - firstCreated.getTime()) / (1000 * 60 * 60 * 24)) || 1;
  
  return {
    versions: stats.total_versions,
    characterCount: stats.character_count.toLocaleString(),
    wordCount: stats.word_count.toLocaleString(),
    paragraphCount: Math.floor(stats.character_count / 500), // Estimate
    headingCount: Math.floor(stats.word_count / 100), // Estimate
    codeBlockCount: Math.floor(stats.word_count / 200), // Estimate
    linkCount: Math.floor(stats.word_count / 150), // Estimate
    imageCount: Math.floor(stats.word_count / 300), // Estimate
    readingTime: Math.ceil(stats.word_count / 200),
    firstCreated: firstCreated.toLocaleDateString('zh-CN'),
    lastUpdated: lastUpdated.toLocaleDateString('zh-CN'),
    daysSinceUpdate: daysSinceUpdate.toString(),
    contentGrowth: ((stats.character_count / 1000) * 10).toFixed(1), // Estimate
    updateFrequency: (stats.total_versions / Math.max(totalDays / 7, 1)).toFixed(1),
    completeness: Math.min(100, (stats.word_count / 50)).toFixed(0), // Estimate based on 5000 words = 100%
  };
};

export const calculateReadingTime = (content: string): number => {
  const wordsPerMinute = 200;
  const words = content.split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
};

export const extractTableOfContents = (content: string) => {
  const headings: Array<{ level: number; text: string; id: string }> = [];
  const lines = content.split('\n');
  
  lines.forEach((line, index) => {
    const match = line.match(/^(#{1,6})\s+(.+)$/);
    if (match) {
      const level = match[1].length;
      const text = match[2].trim();
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      
      headings.push({ level, text, id });
    }
  });
  
  return headings;
};

export const generateMarkdownPreview = (content: string, maxLength: number = 200): string => {
  // Remove markdown syntax for preview
  let preview = content
    .replace(/#{1,6}\s+/g, '') // Remove headers
    .replace(/\*\*(.*?)\*\*/g, '$1') // Remove bold
    .replace(/\*(.*?)\*/g, '$1') // Remove italic
    .replace(/`(.*?)`/g, '$1') // Remove inline code
    .replace(/\[(.*?)\]\(.*?\)/g, '$1') // Remove links
    .replace(/!\[(.*?)\]\(.*?\)/g, '$1') // Remove images
    .replace(/```[\s\S]*?```/g, '[Code Block]') // Replace code blocks
    .replace(/\n+/g, ' ') // Replace newlines with spaces
    .trim();
  
  if (preview.length > maxLength) {
    preview = preview.substring(0, maxLength) + '...';
  }
  
  return preview || 'No content';
};

export const validateMarkdownContent = (content: string): { isValid: boolean; errors: string[] } => {
  const errors: string[] = [];
  
  // Check for basic markdown issues
  const lines = content.split('\n');
  
  // Check for unmatched code blocks
  const codeBlockCount = (content.match(/```/g) || []).length;
  if (codeBlockCount % 2 !== 0) {
    errors.push('Unmatched code block markers (```)');
  }
  
  // Check for unmatched inline code
  lines.forEach((line, index) => {
    const backtickCount = (line.match(/`/g) || []).length;
    if (backtickCount % 2 !== 0) {
      errors.push(`Unmatched inline code markers on line ${index + 1}`);
    }
  });
  
  // Check for malformed links
  const malformedLinks = content.match(/\[([^\]]*)\]\([^)]*$/gm);
  if (malformedLinks) {
    errors.push('Malformed links detected');
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
};