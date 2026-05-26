import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import rehypeRaw from 'rehype-raw';

interface MarkdownRendererProps {
  content: string;
}

export default function MarkdownRenderer({ content }: MarkdownRendererProps) {
  return (
    <div className="prose prose-sky max-w-none dark:prose-invert prose-headings:text-sky-900 dark:prose-headings:text-white prose-a:text-sky-600 dark:prose-a:text-sky-400 prose-code:bg-sky-50 dark:prose-code:bg-slate-800 prose-code:px-1.5 prose-code:py-0.5 prose-code:rounded prose-pre:bg-sky-950 prose-pre:text-sky-50 prose-th:text-sky-900 dark:prose-th:text-white prose-th:border-b-2 prose-th:border-sky-200 dark:prose-th:border-slate-600 prose-th:pb-2 prose-td:border-b prose-td:border-sky-100 dark:prose-td:border-slate-700 prose-td:py-2 prose-td:text-gray-700 dark:prose-td:text-gray-200">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[rehypeHighlight, rehypeRaw]}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
