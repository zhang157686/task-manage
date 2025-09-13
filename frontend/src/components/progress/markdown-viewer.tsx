'use client';

import { useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';
import { extractTableOfContents } from '@/types/project-progress';

interface MarkdownViewerProps {
  content: string;
  showTableOfContents?: boolean;
  className?: string;
}

export function MarkdownViewer({ 
  content, 
  showTableOfContents = true, 
  className = '' 
}: MarkdownViewerProps) {
  const tableOfContents = useMemo(() => {
    return showTableOfContents ? extractTableOfContents(content) : [];
  }, [content, showTableOfContents]);

  const components = {
    // Custom heading renderer with IDs for TOC
    h1: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return <h1 id={id} className="text-3xl font-bold mt-8 mb-4 pb-2 border-b" {...props}>{children}</h1>;
    },
    h2: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return <h2 id={id} className="text-2xl font-semibold mt-6 mb-3" {...props}>{children}</h2>;
    },
    h3: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return <h3 id={id} className="text-xl font-semibold mt-5 mb-2" {...props}>{children}</h3>;
    },
    h4: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return <h4 id={id} className="text-lg font-semibold mt-4 mb-2" {...props}>{children}</h4>;
    },
    h5: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return <h5 id={id} className="text-base font-semibold mt-3 mb-2" {...props}>{children}</h5>;
    },
    h6: ({ children, ...props }: any) => {
      const text = children?.toString() || '';
      const id = text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
      return <h6 id={id} className="text-sm font-semibold mt-3 mb-2" {...props}>{children}</h6>;
    },
    
    // Paragraph
    p: ({ children, ...props }: any) => (
      <p className="mb-4 leading-7" {...props}>{children}</p>
    ),
    
    // Lists
    ul: ({ children, ...props }: any) => (
      <ul className="mb-4 ml-6 list-disc" {...props}>{children}</ul>
    ),
    ol: ({ children, ...props }: any) => (
      <ol className="mb-4 ml-6 list-decimal" {...props}>{children}</ol>
    ),
    li: ({ children, ...props }: any) => (
      <li className="mb-1" {...props}>{children}</li>
    ),
    
    // Blockquote
    blockquote: ({ children, ...props }: any) => (
      <blockquote className="border-l-4 border-gray-300 pl-4 py-2 mb-4 italic bg-gray-50" {...props}>
        {children}
      </blockquote>
    ),
    
    // Code
    code: ({ inline, className, children, ...props }: any) => {
      const match = /language-(\w+)/.exec(className || '');
      const language = match ? match[1] : '';
      
      if (!inline && language) {
        return (
          <div className="mb-4">
            <SyntaxHighlighter
              style={oneDark}
              language={language}
              PreTag="div"
              className="rounded-md"
              {...props}
            >
              {String(children).replace(/\n$/, '')}
            </SyntaxHighlighter>
          </div>
        );
      }
      
      return (
        <code className="bg-gray-100 px-1 py-0.5 rounded text-sm font-mono" {...props}>
          {children}
        </code>
      );
    },
    
    // Links
    a: ({ children, href, ...props }: any) => (
      <a 
        href={href} 
        className="text-blue-600 hover:text-blue-800 underline" 
        target={href?.startsWith('http') ? '_blank' : undefined}
        rel={href?.startsWith('http') ? 'noopener noreferrer' : undefined}
        {...props}
      >
        {children}
      </a>
    ),
    
    // Images
    img: ({ src, alt, ...props }: any) => (
      <img 
        src={src} 
        alt={alt} 
        className="max-w-full h-auto rounded-lg shadow-sm mb-4" 
        {...props} 
      />
    ),
    
    // Tables
    table: ({ children, ...props }: any) => (
      <div className="overflow-x-auto mb-4">
        <table className="min-w-full border-collapse border border-gray-300" {...props}>
          {children}
        </table>
      </div>
    ),
    th: ({ children, ...props }: any) => (
      <th className="border border-gray-300 px-4 py-2 bg-gray-50 font-semibold text-left" {...props}>
        {children}
      </th>
    ),
    td: ({ children, ...props }: any) => (
      <td className="border border-gray-300 px-4 py-2" {...props}>
        {children}
      </td>
    ),
    
    // Horizontal rule
    hr: ({ ...props }) => (
      <hr className="my-8 border-gray-300" {...props} />
    ),
    
    // Strong and emphasis
    strong: ({ children, ...props }: any) => (
      <strong className="font-bold" {...props}>{children}</strong>
    ),
    em: ({ children, ...props }: any) => (
      <em className="italic" {...props}>{children}</em>
    ),
  };

  return (
    <div className={`w-full ${className}`}>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Table of Contents */}
        {showTableOfContents && tableOfContents.length > 0 && (
          <div className="lg:col-span-1">
            <div className="sticky top-4">
              <h4 className="font-semibold mb-3 text-sm text-gray-700">Table of Contents</h4>
              <nav className="space-y-1">
                {tableOfContents.map((heading, index) => (
                  <a
                    key={index}
                    href={`#${heading.id}`}
                    className={`block text-sm hover:text-blue-600 transition-colors ${
                      heading.level === 1 ? 'font-medium' : 
                      heading.level === 2 ? 'ml-2' : 
                      heading.level === 3 ? 'ml-4' : 
                      'ml-6'
                    }`}
                    style={{ 
                      paddingLeft: `${(heading.level - 1) * 0.5}rem`,
                      color: heading.level === 1 ? '#374151' : '#6B7280'
                    }}
                  >
                    {heading.text}
                  </a>
                ))}
              </nav>
            </div>
          </div>
        )}
        
        {/* Content */}
        <div className={showTableOfContents && tableOfContents.length > 0 ? 'lg:col-span-3' : 'lg:col-span-4'}>
          <div className="prose prose-gray max-w-none">
            {content.trim() ? (
              <ReactMarkdown
                remarkPlugins={[remarkGfm]}
                rehypePlugins={[rehypeHighlight, rehypeRaw]}
                components={components}
              >
                {content}
              </ReactMarkdown>
            ) : (
              <div className="text-gray-500 text-center py-8">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No content to display</p>
                <p className="text-sm">The document is empty</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}