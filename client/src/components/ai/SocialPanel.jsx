// SocialPanel — displays social media flags, simulated posts, and AI sentiment summary
import { useState } from 'react';
import { useGroqStream } from '../../hooks/useGroqStream';
import StreamingText from './StreamingText';
import AIBadge from './AIBadge';
import { useAssets } from '../../context/AssetContext';

export default function SocialPanel({ asset }) {
  const { text, loading, error, startStream, reset } = useGroqStream();
  const { socialPosts } = useAssets();
  const [showAI, setShowAI] = useState(false);

  const posts = socialPosts[asset.id] || [];
  const recentPosts = posts.slice(-3).reverse(); // Show last 3, newest first
  const flagCount = asset.social_media_flags || 0;

  const handleSummarise = () => {
    setShowAI(true);
    reset();
    startStream(`/api/ai/social-summary/${asset.id}`, { method: 'GET' });
  };

  const getSentiment = () => {
    if (flagCount > 15) return { label: 'Angry', color: '#DC2626', bg: '#FEE2E2' };
    if (flagCount > 5) return { label: 'Concerned', color: '#D97706', bg: '#FEF3C7' };
    if (flagCount > 0) return { label: 'Aware', color: '#2563EB', bg: '#DBEAFE' };
    return { label: 'Calm', color: '#16A34A', bg: '#DCFCE7' };
  };

  const sentiment = getSentiment();

  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #E8E8F0',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '16px',
  };

  const labelStyle = {
    color: '#64748B',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '8px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const valueStyle = {
    color: '#1A1A1E',
    fontSize: '22px',
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <div style={cardStyle} className="!mb-0">
          <div style={labelStyle}>Flags</div>
          <div style={{ ...valueStyle, color: flagCount > 15 ? '#DC2626' : flagCount > 5 ? '#D97706' : '#1A1A1E' }}>
            {flagCount}
          </div>
        </div>
        <div style={cardStyle} className="!mb-0">
          <div style={labelStyle}>Trend</div>
          <div style={{ ...valueStyle, fontSize: '18px' }}>
            {flagCount > 10 ? '↑ Rising' : flagCount > 3 ? '→ Stable' : '↓ Low'}
          </div>
        </div>
        <div style={cardStyle} className="!mb-0">
          <div style={labelStyle}>Sentiment</div>
          <span style={{
            display: 'inline-block', fontSize: '11px', fontWeight: 700,
            padding: '4px 10px', borderRadius: '9999px', marginTop: '4px',
            background: sentiment.bg, color: sentiment.color,
          }}>
            {sentiment.label}
          </span>
        </div>
      </div>

      {/* Simulated Posts */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: '16px' }}>Recent Social Mentions</div>
        {recentPosts.length === 0 ? (
          <p className="font-body" style={{ fontSize: '13px', color: '#94A3B8', textAlign: 'center', padding: '16px 0' }}>
            No social media mentions detected for this asset.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {recentPosts.map((post, idx) => {
              const postData = typeof post === 'string' ? { text: post, platform: 'Twitter/X', timestamp: null } : post;
              return (
                <div key={idx} style={{
                  background: '#F9F9FB', borderRadius: '8px', padding: '14px',
                  borderLeft: '3px solid #9D72FF',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="font-body" style={{ fontSize: '11px', color: '#9D72FF', fontWeight: 600 }}>
                      {postData.platform || 'Twitter/X'}
                    </span>
                    <span className="font-body" style={{ fontSize: '10px', color: '#94A3B8' }}>
                      {postData.timestamp ? new Date(postData.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : 'Recent'}
                    </span>
                  </div>
                  <p className="font-body" style={{ fontSize: '13px', color: '#1A1A1E', lineHeight: 1.5, fontStyle: 'italic' }}>
                    "{postData.text}"
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* AI Sentiment Summary */}
      <div style={cardStyle}>
        <div className="flex items-center gap-2 mb-4">
          <div style={{ ...labelStyle }} className="!mb-0">AI Sentiment Analysis</div>
          <AIBadge size="sm" />
        </div>

        {!showAI && !text && !loading ? (
          <button
            onClick={handleSummarise}
            className="font-body"
            style={{
              width: '100%', padding: '12px', borderRadius: '8px',
              background: '#FFFFFF', border: '1px solid #9D72FF',
              color: '#9D72FF', fontSize: '13px', fontWeight: 600,
              cursor: 'pointer', transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#9D72FF'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#9D72FF'; }}
          >
            Summarise with AI
          </button>
        ) : (
          <StreamingText text={text} loading={loading} error={error} />
        )}
      </div>
    </div>
  );
}
