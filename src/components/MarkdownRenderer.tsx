import React from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { CopyButton } from './CopyButton';

interface MarkdownRendererProps {
  content: string;
  showCopyButton?: boolean;
  className?: string;
}

export const MarkdownRenderer: React.FC<MarkdownRendererProps> = ({
  content,
  showCopyButton = true,
  className = '',
}) => {
  return (
    <div className={`relative group ${className}`}>
      {showCopyButton && content && (
        <div className="absolute top-2 right-2 z-10 opacity-90 group-hover:opacity-100 transition-opacity">
          <CopyButton textToCopy={content} />
        </div>
      )}
      <div className="prose dark:prose-invert max-w-none text-slate-800 dark:text-slate-200 text-sm md:text-base leading-relaxed space-y-3">
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          components={{
            h1: ({ children }) => (
              <h1 className="text-xl md:text-2xl font-bold text-slate-900 dark:text-slate-100 border-b border-slate-200 dark:border-slate-800 pb-2 mt-4 mb-3">
                {children}
              </h1>
            ),
            h2: ({ children }) => (
              <h2 className="text-lg md:text-xl font-semibold text-slate-900 dark:text-slate-100 mt-4 mb-2">
                {children}
              </h2>
            ),
            h3: ({ children }) => (
              <h3 className="text-base md:text-lg font-semibold text-orange-600 dark:text-orange-400 mt-3 mb-1.5">
                {children}
              </h3>
            ),
            p: ({ children }) => (
              <p className="mb-2 leading-relaxed text-slate-700 dark:text-slate-300">
                {children}
              </p>
            ),
            ul: ({ children }) => (
              <ul className="list-disc list-inside space-y-1 mb-3 text-slate-700 dark:text-slate-300 pl-1">
                {children}
              </ul>
            ),
            ol: ({ children }) => (
              <ol className="list-decimal list-inside space-y-1 mb-3 text-slate-700 dark:text-slate-300 pl-1">
                {children}
              </ol>
            ),
            li: ({ children }) => (
              <li className="leading-snug">{children}</li>
            ),
            blockquote: ({ children }) => (
              <blockquote className="border-l-4 border-orange-500 bg-orange-50/50 dark:bg-orange-950/30 dark:border-orange-400 px-4 py-2 my-3 rounded-r-md text-slate-700 dark:text-slate-300 italic">
                {children}
              </blockquote>
            ),
            code: ({ className, children, ...props }: any) => {
              const match = /language-(\w+)/.exec(className || '');
              const isInline = !match && !String(children).includes('\n');
              if (isInline) {
                return (
                  <code className="bg-orange-50 dark:bg-slate-800 text-orange-600 dark:text-orange-300 px-1.5 py-0.5 rounded text-xs font-mono border border-orange-100 dark:border-slate-700" {...props}>
                    {children}
                  </code>
                );
              }
              return (
                <pre className="bg-slate-900 text-slate-100 p-3 rounded-lg overflow-x-auto text-xs md:text-sm font-mono my-3 border border-slate-800 shadow-2xs">
                  <code {...props}>{children}</code>
                </pre>
              );
            },
            table: ({ children }) => (
              <div className="overflow-x-auto my-3">
                <table className="w-full text-left text-xs md:text-sm border-collapse border border-slate-200 dark:border-slate-800">
                  {children}
                </table>
              </div>
            ),
            th: ({ children }) => (
              <th className="bg-slate-100 dark:bg-slate-800 p-2 border border-slate-200 dark:border-slate-800 font-semibold text-slate-900 dark:text-slate-100">
                {children}
              </th>
            ),
            td: ({ children }) => (
              <td className="p-2 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300">
                {children}
              </td>
            ),
          }}
        >
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
};
