// Renders AI-generated markdown content as clean formatted HTML
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function MarkdownRenderer({ content, className }) {
  if (!content) return null;

  return (
    <div className={`markdown-content ${className || ''}`}>
      <ReactMarkdown remarkPlugins={[remarkGfm]}>{content}</ReactMarkdown>
    </div>
  );
}
