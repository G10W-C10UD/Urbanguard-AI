import { useState, useRef, useEffect } from 'react';
import { useGroqStream } from '../../hooks/useGroqStream';
import { useAssets } from '../../context/AssetContext';
import { Shield, X, Send } from 'lucide-react';
import MarkdownRenderer from './MarkdownRenderer';

export default function AIChatPanel({ isOpen, onClose }) {
  const [messages, setMessages] = useState([]);
  const [inputVal, setInputVal] = useState('');
  const inputRef = useRef(null);
  
  const { assets } = useAssets();
  const { text: streamingText, loading, error, startStream, reset } = useGroqStream();
  const messagesEndRef = useRef(null);

  useEffect(() => {
    if (isOpen && inputRef.current) {
      setTimeout(() => inputRef.current?.focus(), 300);
    }
  }, [isOpen]);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages, streamingText, loading]);

  useEffect(() => {
    if (isOpen) {
      document.body.style.paddingRight = '420px';
    } else {
      document.body.style.paddingRight = '0px';
    }
    return () => {
      document.body.style.paddingRight = '0px';
    };
  }, [isOpen]);

  const clearChat = () => {
    setMessages([]);
    reset();
  };

  const buildSnapshot = () => {
    const critical = assets.filter(a => a.status === 'critical').length;
    const warning = assets.filter(a => a.status === 'warning').length;
    const healthy = assets.filter(a => ['healthy', 'normal'].includes(a.status)).length;
    const underRepair = assets.filter(a => a.status === 'repair').length;
    const assetSummary = assets.map(a => `${a.id} (${a.type}): ${a.status} (Health: ${a.healthScore})`).join('\n');
    return {
      critical, warning, healthy, underRepair, 
      openJobs: 0,
      todayComplaints: 0,
      season: 'Summer',
      assetSummary
    };
  };

  const handleSend = async (e, forcedMessage = null) => {
    if (e) {
      if (e.type === 'keydown' && (e.key !== 'Enter' || e.shiftKey)) return;
      e.preventDefault();
    }
    const txt = forcedMessage || inputVal;
    if (!txt.trim() || loading) return;

    if (!forcedMessage) setInputVal('');

    let newMessages = [...messages];
    if (streamingText && !loading) {
      newMessages.push({ role: 'assistant', content: streamingText });
      reset();
    }
    
    newMessages.push({ role: 'user', content: txt });
    setMessages(newMessages);

    startStream('/api/ai/chat', {
      method: 'POST',
      body: {
        messages: newMessages.map(m => ({ role: m.role, content: m.content })),
        snapshot: buildSnapshot()
      }
    });
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend(null, null);
    }
  };

  return (
    <>
      <style>{`
        .typing-indicator {
          display: flex;
          gap: 4px;
          padding: 14px 18px;
          background: #FFFFFF;
          border: 1px solid #E8E8F0;
          border-radius: 4px 16px 16px 16px;
          width: fit-content;
        }
        .typing-indicator span {
          width: 7px;
          height: 7px;
          border-radius: 50%;
          background: #9D72FF;
          opacity: 0.4;
          animation: typing-bounce 1.2s infinite;
        }
        .typing-indicator span:nth-child(2) { animation-delay: 0.2s; }
        .typing-indicator span:nth-child(3) { animation-delay: 0.4s; }
        @keyframes typing-bounce {
          0%, 100% { transform: translateY(0); opacity: 0.4; }
          50% { transform: translateY(-4px); opacity: 1; }
        }
      `}</style>
      {isOpen && (
        <div className="fixed inset-0 bg-black/20 z-50 transition-opacity duration-300" onClick={onClose} />
      )}

      <div 
        className={`fixed z-[100] flex flex-col transform transition-transform duration-300 ease-in-out ${isOpen ? 'translate-x-0' : 'translate-x-full'}`} 
        style={{ right: 0, top: 0, height: '100vh', width: '420px', background: '#FFFFFF', borderLeft: '1px solid #E8E8F0', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)', overflow: 'hidden', overscrollBehavior: 'contain' }}
      >
        {/* Panel Header */}
        <div style={{ padding: '20px 24px', borderBottom: '1px solid #E8E8F0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <Shield size={24} color="#9D72FF" />
            <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
              <span className="font-body" style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1E' }}>UrbanGuard-AI Assistant</span>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <span style={{ width: '7px', height: '7px', borderRadius: '50%', background: '#9D72FF', animation: 'pulse 2s infinite' }} />
                <span className="font-body" style={{ fontSize: '12px', color: '#9D72FF' }}>Online</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <button className="font-body" onClick={clearChat} style={{ fontSize: '13px', color: '#64748B', fontWeight: 500, background: 'none', border: 'none', cursor: 'pointer' }}>Clear chat</button>
            <button onClick={onClose} style={{ width: '32px', height: '32px', borderRadius: '8px', background: '#F9F9FB', border: '1px solid #E8E8F0', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>
              <X size={16} color="#64748B" />
            </button>
          </div>
        </div>

        {/* Messages Area */}
        <div style={{ flex: 1, overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: '#F9F9FB' }}>
          {/* Welcome message */}
          {messages.length === 0 && !streamingText && !loading && (
            <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '20px', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="font-body" style={{ background: '#9D72FF', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px', marginRight: '8px' }}>AI</span>
                <span className="font-body" style={{ fontSize: '13px', fontWeight: 600, color: '#9D72FF' }}>UrbanGuard-AI</span>
              </div>
              <div className="font-body" style={{ fontSize: '14px', color: '#1A1A1E', lineHeight: 1.7, marginTop: '10px' }}>
                Hello! I have full visibility into Chennai's infrastructure. Ask me anything about asset health, complaints, jobs, or predictions.
              </div>
            </div>
          )}

          {/* History */}
          {messages.map((msg, idx) => (
            <div key={idx} style={{ 
              alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start', 
              maxWidth: msg.role === 'user' ? '80%' : '85%',
              width: msg.role === 'user' ? 'auto' : '100%'
            }}>
              {msg.role === 'user' ? (
                <>
                  <div className="font-body" style={{ background: '#9D72FF', color: 'white', borderRadius: '16px 16px 4px 16px', padding: '12px 16px', fontSize: '14px', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                    {msg.content}
                  </div>
                  <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'right', marginTop: '4px' }}>Just now</div>
                </>
              ) : (
                <>
                  <div style={{ display: 'flex', alignItems: 'center' }}>
                    <span className="font-body" style={{ background: '#9D72FF', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' }}>AI</span>
                    <span className="font-body" style={{ fontSize: '12px', fontWeight: 600, color: '#9D72FF', marginLeft: '6px' }}>UrbanGuard-AI</span>
                    <span className="font-body" style={{ fontSize: '11px', color: '#94A3B8', marginLeft: 'auto' }}>Just now</span>
                  </div>
                  <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '4px 16px 16px 16px', padding: '14px 16px', marginTop: '6px' }}>
                    <MarkdownRenderer content={msg.content} />
                  </div>
                </>
              )}
            </div>
          ))}

          {/* Streaming Text */}
          {(loading || streamingText || error) && (
            <div style={{ alignSelf: 'flex-start', maxWidth: '85%', width: '100%' }}>
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <span className="font-body" style={{ background: '#9D72FF', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 7px', borderRadius: '5px' }}>AI</span>
                <span className="font-body" style={{ fontSize: '12px', fontWeight: 600, color: '#9D72FF', marginLeft: '6px' }}>UrbanGuard-AI</span>
              </div>
              
              {error ? (
                <div className="font-body" style={{ background: '#FFFFFF', border: '1px solid #EF4444', borderRadius: '4px 16px 16px 16px', padding: '14px 16px', marginTop: '6px', fontSize: '14px', color: '#EF4444' }}>
                  {error}
                </div>
              ) : streamingText ? (
                <div style={{ background: '#FFFFFF', border: '1px solid #9D72FF', borderRadius: '4px 16px 16px 16px', padding: '14px 16px', marginTop: '6px', boxShadow: '0 0 0 3px rgba(157,114,255,0.08)' }}>
                  <MarkdownRenderer content={streamingText} />
                  {loading && <span className="inline-block animate-pulse opacity-70 ml-[2px]" style={{ color: '#9D72FF' }}>|</span>}
                </div>
              ) : (
                <div className="typing-indicator" style={{ marginTop: '6px' }}>
                  <span /><span /><span />
                </div>
              )}
            </div>
          )}

          <div ref={messagesEndRef} />

          {/* Suggestions */}
          {messages.length === 0 && !loading && !streamingText && (
            <div style={{ marginTop: 'auto' }}>
              <div className="font-body" style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.1em', marginBottom: '10px' }}>SUGGESTED QUERIES</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                {['Show critical assets', 'Generate health report', 'Pending complaints', 'Predict failures', 'Top problem areas', 'Jobs status today'].map((chip) => (
                  <button
                    key={chip}
                    onClick={() => handleSend(null, chip)}
                    className="font-body"
                    style={{ background: '#F3EEFF', color: '#9D72FF', border: '1px solid #EDE9FF', borderRadius: '9999px', fontSize: '12px', fontWeight: 500, padding: '6px 14px', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'background-color 0.2s' }}
                    onMouseOver={e => e.currentTarget.style.backgroundColor = '#EDE9FF'}
                    onMouseOut={e => e.currentTarget.style.backgroundColor = '#F3EEFF'}
                  >
                    {chip}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div style={{ padding: '16px 20px', borderTop: '1px solid #E8E8F0', background: '#FFFFFF' }}>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'flex-end' }}>
            <textarea
              ref={inputRef}
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Type your message..."
              style={{ flex: 1, background: '#F9F9FB', border: '1.5px solid #E8E8F0', borderRadius: '12px', padding: '12px 16px', fontSize: '14px', color: '#1A1A1E', resize: 'none', minHeight: '44px', maxHeight: '120px', fontFamily: 'Plus Jakarta Sans, DM Sans, sans-serif', lineHeight: 1.5, outline: 'none', transition: 'all 0.2s' }}
              onFocus={(e) => { e.currentTarget.style.borderColor = '#9D72FF'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(157,114,255,0.08)'; }}
              onBlur={(e) => { e.currentTarget.style.borderColor = '#E8E8F0'; e.currentTarget.style.boxShadow = 'none'; }}
              disabled={loading}
              rows={1}
            />
            <button
              onClick={() => handleSend(null, null)}
              disabled={loading || !inputVal.trim()}
              style={{ 
                width: '44px', height: '44px', borderRadius: '10px', 
                background: (!inputVal.trim() || loading) ? '#E8E8F0' : '#9D72FF', 
                border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', 
                cursor: (!inputVal.trim() || loading) ? 'not-allowed' : 'pointer', 
                flexShrink: 0, 
                boxShadow: (!inputVal.trim() || loading) ? 'none' : '0 4px 12px rgba(157,114,255,0.3)',
                transition: 'all 0.2s'
              }}
              onMouseOver={(e) => { if (inputVal.trim() && !loading) e.currentTarget.style.backgroundColor = '#8B5CF6'; }}
              onMouseOut={(e) => { if (inputVal.trim() && !loading) e.currentTarget.style.backgroundColor = '#9D72FF'; }}
            >
              <Send size={16} color="white" style={{ marginLeft: '2px', position: 'relative', top: '1px' }} />
            </button>
          </div>
          <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', textAlign: 'center', marginTop: '10px' }}>
            Powered by Groq · openai/gpt-oss-120b
          </div>
        </div>
      </div>
    </>
  );
}
