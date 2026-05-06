// Streaming text display with AI badge — renders markdown content properly
import AIBadge from './AIBadge';
import MarkdownRenderer from './MarkdownRenderer';

export default function StreamingText({ text, loading, error, title }) {
  return (
    <div className={`p-5 rounded-xl transition-colors duration-300`} style={{
      background: '#FDFBFF',
      border: loading ? '1px solid #9D72FF' : '1px solid #EDE9FF',
      boxShadow: loading ? '0 0 0 3px rgba(157,114,255,0.08)' : 'none',
    }}>
      <div className="flex items-center mb-3 text-sm">
        <AIBadge size="sm" />
        {title && <span className="ml-2 font-medium font-body" style={{ color: '#1A1A1E' }}>{title}</span>}
        {loading && (
          <span className="ml-auto text-xs flex items-center gap-1.5 font-body" style={{ color: '#9D72FF' }}>
            <span className="w-1.5 h-1.5 rounded-full bg-[#9D72FF] animate-ping"></span>
            Generating...
          </span>
        )}
      </div>

      {error ? (
        <div className="text-sm font-body" style={{ color: '#EF4444' }}>{error}</div>
      ) : text || loading ? (
        <div className={`${loading ? 'opacity-90' : 'opacity-100'}`}>
          <MarkdownRenderer content={text} />
          {loading && <span className="inline-block animate-pulse opacity-70 ml-0.5" style={{ color: '#9D72FF' }}>|</span>}
        </div>
      ) : (
        <div className="text-sm italic font-body" style={{ color: '#94A3B8' }}>Click generate to get AI analysis</div>
      )}
    </div>
  );
}
