import { useState } from 'react';
import { useGroqStream } from '../../hooks/useGroqStream';
import MarkdownRenderer from './MarkdownRenderer';
import { Sparkles, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';

export default function DailyDigest() {
  const { text, loading, error, startStream } = useGroqStream();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleGenerate = () => {
    setIsExpanded(true);
    startStream('/api/ai/digest', { method: 'GET' });
  };

  const todayStr = new Date().toLocaleDateString('en-GB', {
    weekday: 'short',
    day: 'numeric',
    month: 'short',
    year: 'numeric'
  });

  return (
    <div style={{
      background: 'linear-gradient(135deg, #F3EEFF 0%, #EDE9FF 100%)',
      border: '1px solid #DDD6FE',
      borderRadius: '16px',
      padding: '24px',
      marginBottom: '24px'
    }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: isExpanded ? '12px' : '0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sparkles size={16} color="#7C3AED" />
          <span className="font-body" style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            AI EXECUTIVE DIGEST
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <span className="font-body" style={{ fontSize: '12px', color: '#7C3AED', fontWeight: 500 }}>{todayStr}</span>
          <button 
            onClick={(e) => { e.stopPropagation(); handleGenerate(); }}
            style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'transparent', border: 'none', color: '#7C3AED', fontSize: '12px', fontWeight: 600, cursor: 'pointer', padding: 0 }}
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} />
            Regenerate
          </button>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            style={{ background: 'transparent', border: 'none', cursor: 'pointer', color: '#7C3AED', display: 'flex', alignItems: 'center', padding: 0 }}
          >
            {isExpanded ? <ChevronUp size={20} /> : <ChevronDown size={20} />}
          </button>
        </div>
      </div>
      
      {isExpanded && (
        <div style={{ marginTop: '16px' }}>
          {loading && !text ? (
            <div style={{ display: 'flex', gap: '4px', alignItems: 'center', padding: '12px 0' }}>
              <div className="animate-bounce" style={{ width: '8px', height: '8px', backgroundColor: '#7C3AED', borderRadius: '50%', animationDelay: '0ms' }} />
              <div className="animate-bounce" style={{ width: '8px', height: '8px', backgroundColor: '#7C3AED', borderRadius: '50%', animationDelay: '150ms' }} />
              <div className="animate-bounce" style={{ width: '8px', height: '8px', backgroundColor: '#7C3AED', borderRadius: '50%', animationDelay: '300ms' }} />
            </div>
          ) : !text && !loading ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '12px 0' }}>
              <span className="font-body" style={{ color: '#94A3B8', fontSize: '14px' }}>Click to generate today's briefing</span>
              <button 
                onClick={handleGenerate}
                style={{ background: '#7C3AED', color: '#FFFFFF', border: 'none', borderRadius: '6px', padding: '6px 12px', fontSize: '12px', fontWeight: 600, cursor: 'pointer' }}
              >
                Generate
              </button>
            </div>
          ) : (
            <div className="font-body" style={{ color: '#1A1A1E', fontSize: '14px', lineHeight: '1.6' }}>
              <MarkdownRenderer content={text} />
              {loading && <span className="inline-block animate-pulse opacity-70 ml-1" style={{ color: '#7C3AED' }}>●</span>}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
