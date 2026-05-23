'use client';

import { useState, useRef } from 'react';
import MarkdownRenderer from './MarkdownRenderer';
import ImageUploader from './ImageUploader';

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  minHeight?: string;
}

export default function MarkdownEditor({ value, onChange, minHeight = '400px' }: MarkdownEditorProps) {
  const [preview, setPreview] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleInsertImage = (markdown: string) => {
    const textarea = textareaRef.current;
    if (textarea) {
      const start = textarea.selectionStart;
      const end = textarea.selectionEnd;
      const before = value.substring(0, start);
      const after = value.substring(end);
      const newValue = before + markdown + after;
      onChange(newValue);
      setTimeout(() => {
        textarea.selectionStart = textarea.selectionEnd = start + markdown.length;
        textarea.focus();
      }, 0);
    } else {
      onChange(value + '\n' + markdown);
    }
  };

  return (
    <div className="border border-gray-300 dark:border-gray-600 rounded-lg overflow-hidden">
      <div className="flex items-center bg-gray-50 dark:bg-sky-900 border-b border-gray-300 dark:border-gray-600">
        <button
          type="button"
          onClick={() => setPreview(false)}
          className={`px-4 py-2 text-sm font-medium transition ${
            !preview
              ? 'bg-white dark:bg-sky-950 text-sky-600 border-b-2 border-sky-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-sky-600'
          }`}
        >
          Edit
        </button>
        <button
          type="button"
          onClick={() => setPreview(true)}
          className={`px-4 py-2 text-sm font-medium transition ${
            preview
              ? 'bg-white dark:bg-sky-950 text-sky-600 border-b-2 border-sky-600'
              : 'text-gray-600 dark:text-gray-400 hover:text-sky-600'
          }`}
        >
          Preview
        </button>
        <div className="ml-auto px-2">
          <ImageUploader onInsert={handleInsertImage} />
        </div>
      </div>
      {preview ? (
        <div
          className="p-4 bg-white dark:bg-sky-950 overflow-auto"
          style={{ minHeight }}
        >
          {value ? (
            <MarkdownRenderer content={value} />
          ) : (
            <p className="text-gray-400 italic">Nothing to preview...</p>
          )}
        </div>
      ) : (
        <textarea
          ref={textareaRef}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 bg-white dark:bg-sky-950 text-gray-800 dark:text-white font-mono text-sm focus:outline-none resize-y"
          style={{ minHeight }}
          placeholder="Write your content in Markdown..."
        />
      )}
    </div>
  );
}
