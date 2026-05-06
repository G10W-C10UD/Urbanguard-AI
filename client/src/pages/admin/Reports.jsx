// AI Reports page — generate intelligent infrastructure reports powered by Groq AI
import Breadcrumb from '../../components/common/Breadcrumb.jsx';
import { useState, useRef } from 'react';
import { FileText, BarChart3, AlertTriangle, Search, Sparkles, Check, Copy, Download, Loader2 } from 'lucide-react';
import { useGroqStream } from '../../hooks/useGroqStream';
import { useAssets } from '../../context/AssetContext';
import MarkdownRenderer from '../../components/ai/MarkdownRenderer';

const REPORT_TYPES = [
  {
    id: 'Daily Briefing',
    icon: FileText,
    iconBg: '#EDE9FF',
    iconColor: '#7C3AED',
    title: 'Daily Briefing',
    description: "Real-time snapshot of today's infrastructure health, alerts, and actions needed.",
    tag: '~2 min read',
    tagBg: '#F3EEFF',
    tagColor: '#9D72FF',
  },
  {
    id: 'Weekly Summary',
    icon: BarChart3,
    iconBg: '#DBEAFE',
    iconColor: '#2563EB',
    title: 'Weekly Summary',
    description: 'Trend analysis and performance overview for the past 7 days across all asset types.',
    tag: '~5 min read',
    tagBg: '#DBEAFE',
    tagColor: '#2563EB',
  },
  {
    id: 'Critical Alert Report',
    icon: AlertTriangle,
    iconBg: '#FEE2E2',
    iconColor: '#DC2626',
    title: 'Critical Alert Report',
    description: 'Focused report on all critical and warning assets requiring immediate government attention.',
    tag: 'Priority',
    tagBg: '#FEE2E2',
    tagColor: '#DC2626',
  },
  {
    id: 'Asset Deep-Dive',
    icon: Search,
    iconBg: '#DCFCE7',
    iconColor: '#16A34A',
    title: 'Asset Deep-Dive',
    description: 'Detailed analysis of a specific asset type with predictions and maintenance recommendations.',
    tag: 'Customizable',
    tagBg: '#DCFCE7',
    tagColor: '#16A34A',
  },
];

export default function Reports() {
  const [reportType, setReportType] = useState('Daily Briefing');
  const [assetType, setAssetType] = useState('streetlight');
  const [lastGenerated, setLastGenerated] = useState(null);
  const [recentReports, setRecentReports] = useState([]);
  const [previewIdx, setPreviewIdx] = useState(null);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const { text, loading, error, startStream, reset } = useGroqStream();
  const { assets } = useAssets();
  const reportRef = useRef(null);

  const handleGenerate = async () => {
    const snapshot = {
      total: assets.length,
      critical: assets.filter(a => a.status === 'critical').length,
      warning: assets.filter(a => a.status === 'warning').length,
      healthy: assets.filter(a => ['healthy', 'normal'].includes(a.status)).length,
      repair: assets.filter(a => a.status === 'repair').length,
      summary: assets.slice(0, 10).map(a => `${a.id}: ${a.status}`).join(', ')
    };

    reset();
    setLastGenerated(new Date());

    await startStream('/api/ai/report', {
      method: 'POST',
      body: {
        report_type: reportType,
        asset_type: reportType === 'Asset Deep-Dive' ? assetType : null,
        snapshot
      }
    });

    // After stream completes, add to recent reports
    setRecentReports(prev => [
      { type: reportType, timestamp: new Date(), text: '' },
      ...prev.slice(0, 4)
    ]);
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    } catch (e) {
      // Fallback silently
    }
  };

  const handleDownload = () => {
    window.print();
  };

  const formatTimestamp = (date) => {
    if (!date) return '';
    return date.toLocaleString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
      hour: 'numeric', minute: '2-digit', hour12: true
    });
  };

  const selectedConfig = REPORT_TYPES.find(r => r.id === reportType);
  const showOutput = text || loading || error;

  return (
    <div style={{ maxWidth: 1200, margin: '0 auto', padding: '40px 48px', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      <Breadcrumb page="AI Reports" />

      {/* ─── Page Header ─── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <h1 style={{
              fontFamily: "'Plus Jakarta Sans', sans-serif",
              fontWeight: 800,
              fontSize: 28,
              color: '#1A1A1E',
              letterSpacing: '-0.02em',
              margin: 0,
              lineHeight: 1.2,
            }}>
              AI Reports
            </h1>
            <span style={{
              background: '#9D72FF',
              color: 'white',
              fontSize: 10,
              fontWeight: 700,
              padding: '3px 8px',
              borderRadius: 6,
              marginLeft: 10,
              verticalAlign: 'middle',
              letterSpacing: '0.02em',
              lineHeight: 1,
            }}>AI</span>
          </div>
          <p style={{
            fontSize: 14,
            color: '#64748B',
            margin: '8px 0 0 0',
            fontWeight: 400,
          }}>
            Generate intelligent infrastructure reports powered by Groq AI
          </p>
        </div>
        {lastGenerated && (
          <span style={{
            fontFamily: "'Space Mono', monospace",
            fontSize: 12,
            color: '#94A3B8',
            whiteSpace: 'nowrap',
            marginTop: 6,
          }}>
            Last generated: {formatTimestamp(lastGenerated)}
          </span>
        )}
      </div>

      {/* ─── Report Type Selector (2x2 Grid) ─── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: 16,
        marginBottom: 32,
      }}>
        {REPORT_TYPES.map((rt) => {
          const isSelected = reportType === rt.id;
          const IconComp = rt.icon;
          return (
            <div
              key={rt.id}
              onClick={() => setReportType(rt.id)}
              style={{
                background: isSelected ? '#FDFBFF' : '#FFFFFF',
                border: `1.5px solid ${isSelected ? '#9D72FF' : '#E8E8F0'}`,
                borderRadius: 16,
                padding: '28px 28px',
                cursor: 'pointer',
                transition: 'all 0.2s',
                boxShadow: isSelected ? '0 4px 20px rgba(157,114,255,0.15)' : 'none',
              }}
              onMouseEnter={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#C4B5FD';
                  e.currentTarget.style.boxShadow = '0 4px 16px rgba(157,114,255,0.1)';
                  e.currentTarget.style.transform = 'translateY(-1px)';
                }
              }}
              onMouseLeave={e => {
                if (!isSelected) {
                  e.currentTarget.style.borderColor = '#E8E8F0';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'translateY(0)';
                } else {
                  e.currentTarget.style.boxShadow = '0 4px 20px rgba(157,114,255,0.15)';
                }
              }}
            >
              {/* Top row: icon + checkmark */}
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: rt.iconBg,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginBottom: 16,
                }}>
                  <IconComp size={22} color={rt.iconColor} strokeWidth={2} />
                </div>
                {isSelected && (
                  <div style={{
                    width: 20,
                    height: 20,
                    borderRadius: '50%',
                    background: '#9D72FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <Check size={12} color="white" strokeWidth={3} />
                  </div>
                )}
              </div>

              {/* Title */}
              <div style={{
                fontSize: 17,
                fontWeight: 700,
                color: '#1A1A1E',
                marginBottom: 8,
              }}>
                {rt.title}
              </div>

              {/* Description */}
              <div style={{
                fontSize: 13,
                color: '#64748B',
                lineHeight: 1.6,
                marginBottom: 14,
              }}>
                {rt.description}
              </div>

              {/* Tag */}
              <span style={{
                background: rt.tagBg,
                color: rt.tagColor,
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 9999,
                display: 'inline-block',
              }}>
                {rt.tag}
              </span>
            </div>
          );
        })}
      </div>

      {/* ─── Asset Type Dropdown (only for Asset Deep-Dive) ─── */}
      {reportType === 'Asset Deep-Dive' && (
        <select
          value={assetType}
          onChange={(e) => setAssetType(e.target.value)}
          style={{
            background: '#FFFFFF',
            border: '1.5px solid #E8E8F0',
            borderRadius: 10,
            padding: '12px 16px',
            fontSize: 14,
            width: '100%',
            marginTop: -8,
            marginBottom: 16,
            outline: 'none',
            color: '#1A1A1E',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            cursor: 'pointer',
            appearance: 'auto',
          }}
          onFocus={e => e.target.style.borderColor = '#9D72FF'}
          onBlur={e => e.target.style.borderColor = '#E8E8F0'}
        >
          <option value="streetlight">Street Lights</option>
          <option value="road">Roads</option>
          <option value="waterpipe">Water Pipelines</option>
          <option value="sewer">Sewers</option>
        </select>
      )}

      {/* ─── Generate Report Button ─── */}
      <button
        onClick={handleGenerate}
        disabled={loading}
        style={{
          width: '100%',
          padding: 16,
          background: loading ? '#C4B5FD' : '#9D72FF',
          color: 'white',
          borderRadius: 12,
          fontSize: 16,
          fontWeight: 700,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          boxShadow: loading ? 'none' : '0 4px 16px rgba(157,114,255,0.3)',
          marginBottom: 32,
          border: 'none',
          cursor: loading ? 'not-allowed' : 'pointer',
          transition: 'all 0.2s',
        }}
        onMouseEnter={e => {
          if (!loading) {
            e.currentTarget.style.background = '#8B5CF6';
            e.currentTarget.style.boxShadow = '0 8px 24px rgba(157,114,255,0.4)';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }
        }}
        onMouseLeave={e => {
          if (!loading) {
            e.currentTarget.style.background = '#9D72FF';
            e.currentTarget.style.boxShadow = '0 4px 16px rgba(157,114,255,0.3)';
            e.currentTarget.style.transform = 'translateY(0)';
          }
        }}
      >
        {loading ? (
          <>
            <Loader2 size={18} style={{ animation: 'spin 1s linear infinite' }} />
            Generating report...
          </>
        ) : (
          <>
            <Sparkles size={18} />
            Generate {reportType} Report
          </>
        )}
      </button>

      {/* ─── Spinner keyframes (injected once) ─── */}
      <style>{`
        @keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
        @keyframes blink { 0%, 100% { opacity: 1; } 50% { opacity: 0; } }
      `}</style>

      {/* ─── Report Output Area ─── */}
      {showOutput && (
        <div
          ref={reportRef}
          style={{
            background: '#FFFFFF',
            border: `1px solid ${loading ? '#9D72FF' : '#E8E8F0'}`,
            borderRadius: 16,
            overflow: 'hidden',
            marginBottom: 32,
            boxShadow: loading ? '0 0 0 3px rgba(157,114,255,0.08)' : 'none',
            transition: 'all 0.3s',
          }}
        >
          {/* Header bar */}
          <div style={{
            background: '#F9F9FB',
            borderBottom: '1px solid #E8E8F0',
            padding: '16px 24px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{
                background: '#9D72FF',
                color: 'white',
                fontSize: 10,
                fontWeight: 700,
                padding: '3px 8px',
                borderRadius: 6,
                letterSpacing: '0.02em',
              }}>AI</span>
              <span style={{
                fontSize: 14,
                fontWeight: 600,
                color: '#1A1A1E',
              }}>{reportType}</span>
              {lastGenerated && (
                <span style={{
                  fontSize: 12,
                  color: '#94A3B8',
                  fontFamily: "'Space Mono', monospace",
                }}>
                  {formatTimestamp(lastGenerated)}
                </span>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCopy}
                disabled={!text || loading}
                style={{
                  background: '#F9F9FB',
                  border: '1.5px solid #E8E8F0',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  color: copyFeedback ? '#16A34A' : '#64748B',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: text && !loading ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                  opacity: text && !loading ? 1 : 0.5,
                }}
                onMouseEnter={e => { if (text && !loading) { e.currentTarget.style.borderColor = '#C4B5FD'; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E8F0'; }}
              >
                {copyFeedback ? <Check size={14} /> : <Copy size={14} />}
                {copyFeedback ? 'Copied' : 'Copy'}
              </button>
              <button
                onClick={handleDownload}
                disabled={!text || loading}
                style={{
                  background: '#9D72FF',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '7px 14px',
                  fontSize: 13,
                  fontWeight: 600,
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                  cursor: text && !loading ? 'pointer' : 'default',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  transition: 'all 0.15s',
                  opacity: text && !loading ? 1 : 0.5,
                }}
                onMouseEnter={e => { if (text && !loading) { e.currentTarget.style.background = '#8B5CF6'; } }}
                onMouseLeave={e => { e.currentTarget.style.background = '#9D72FF'; }}
              >
                <Download size={14} />
                Download PDF
              </button>
            </div>
          </div>

          {/* Report content */}
          <div style={{
            padding: 32,
            minHeight: 200,
            fontFamily: "'Plus Jakarta Sans', sans-serif",
            wordBreak: 'break-word',
          }}>
            {error ? (
              <div style={{ color: '#DC2626', fontSize: 14 }}>
                AI is temporarily unavailable. Please try again.
              </div>
            ) : (
              <>
                <MarkdownRenderer content={text} />
                {loading && (
                  <span style={{ animation: 'blink 1s step-end infinite', fontWeight: 700, color: '#9D72FF', marginLeft: 1 }}>|</span>
                )}
                {!text && loading && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: '#94A3B8', fontSize: 14 }}>
                    <Loader2 size={16} style={{ animation: 'spin 1s linear infinite' }} />
                    Analyzing infrastructure data...
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Recent Reports Section ─── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{
          fontSize: 11,
          fontWeight: 700,
          color: '#64748B',
          letterSpacing: '0.1em',
          textTransform: 'uppercase',
          marginBottom: 16,
          fontFamily: "'Plus Jakarta Sans', sans-serif",
        }}>
          RECENT REPORTS
        </div>
        <div style={{
          background: '#FFFFFF',
          border: '1px solid #E8E8F0',
          borderRadius: 16,
          overflow: 'hidden',
        }}>
          {recentReports.length === 0 ? (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '48px 24px',
              gap: 8,
            }}>
              <FileText size={32} color="#E8E8F0" />
              <span style={{ fontSize: 14, color: '#94A3B8', fontWeight: 500 }}>No reports generated yet</span>
              <span style={{ fontSize: 13, color: '#94A3B8' }}>Generate your first report above</span>
            </div>
          ) : (
            recentReports.map((report, idx) => {
              const config = REPORT_TYPES.find(r => r.id === report.type);
              const IconComp = config?.icon || FileText;
              const isLast = idx === recentReports.length - 1;
              return (
                <div
                  key={idx}
                  style={{
                    padding: '16px 24px',
                    borderBottom: isLast ? 'none' : '1px solid #F4F4F8',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 16,
                    cursor: 'pointer',
                    transition: 'background 0.15s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Icon */}
                  <div style={{
                    width: 36,
                    height: 36,
                    borderRadius: 8,
                    background: config?.iconBg || '#EDE9FF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <IconComp size={16} color={config?.iconColor || '#7C3AED'} strokeWidth={2} />
                  </div>

                  {/* Name and timestamp */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1E' }}>{report.type}</div>
                    <div style={{ fontSize: 12, color: '#94A3B8', marginTop: 2 }}>{formatTimestamp(report.timestamp)}</div>
                  </div>

                  {/* Preview button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setPreviewIdx(previewIdx === idx ? null : idx);
                    }}
                    style={{
                      background: '#F9F9FB',
                      border: '1.5px solid #E8E8F0',
                      borderRadius: 8,
                      padding: '6px 14px',
                      fontSize: 13,
                      fontWeight: 600,
                      color: '#64748B',
                      fontFamily: "'Plus Jakarta Sans', sans-serif",
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                      flexShrink: 0,
                    }}
                    onMouseEnter={e => {
                      e.currentTarget.style.background = '#EDE9FF';
                      e.currentTarget.style.borderColor = '#9D72FF';
                      e.currentTarget.style.color = '#9D72FF';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.background = '#F9F9FB';
                      e.currentTarget.style.borderColor = '#E8E8F0';
                      e.currentTarget.style.color = '#64748B';
                    }}
                  >
                    Preview
                  </button>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ─── Info Banner ─── */}
      <div style={{
        background: '#F3EEFF',
        border: '1px solid #EDE9FF',
        borderRadius: 12,
        padding: '16px 20px',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        marginTop: 24,
      }}>
        <Sparkles size={16} color="#9D72FF" style={{ flexShrink: 0 }} />
        <span style={{
          fontSize: 13,
          color: '#7C3AED',
          lineHeight: 1.5,
        }}>
          Reports are generated using Groq AI (openai/gpt-oss-120b) with real-time asset data from Chennai's infrastructure network.
        </span>
      </div>
    </div>
  );
}
