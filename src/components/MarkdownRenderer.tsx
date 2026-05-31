'use client';

import { useState, useCallback } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  const copy = useCallback(() => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    });
  }, [text]);

  return (
    <button
      onClick={copy}
      className="absolute top-2 right-2 px-2 py-1 text-xs font-medium rounded-md
        opacity-0 group-hover:opacity-100 transition-opacity duration-200
        bg-sky-700/50 text-sky-200 hover:bg-sky-600/60
        dark:bg-sky-500/10 dark:text-sky-300 dark:hover:bg-sky-500/20"
    >
      {copied ? 'Copied!' : 'Copy'}
    </button>
  );
}

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sky max-w-none dark:prose-invert prose-headings:text-sky-900 dark:prose-headings:text-white prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-code:bg-sky-50 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-sky-950 prose-pre:text-sky-50 prose-th:text-sky-900 dark:prose-th:text-white prose-th:border-b-2 prose-th:border-sky-200 dark:prose-th:border-slate-600 prose-th:pb-2 prose-td:border-b prose-td:border-sky-100 dark:prose-td:border-slate-700 prose-td:py-2 prose-td:text-gray-900 dark:prose-td:text-white">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
        components={{
          pre: ({ children, ...props }) => {
            // Extract text content from the pre block for copying
            const textContent = extractTextContent(children);
            return (
              <div className="relative group">
                <pre {...props}>{children}</pre>
                {textContent && <CopyButton text={textContent} />}
              </div>
            );
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}

/** Recursively extract text from React node tree */
function extractTextContent(node: React.ReactNode): string {
  if (typeof node === 'string') return node;
  if (typeof node === 'number') return String(node);
  if (typeof node === 'boolean' || node === null || node === undefined) return '';
  if (Array.isArray(node)) return node.map(extractTextContent).join('');
  if (typeof node === 'object' && 'props' in node) {
    return extractTextContent((node as any).props.children);
  }
  return '';
}
