import { useState, useEffect } from 'react';
import { useGroqStream } from '../../hooks/useGroqStream';
import StreamingText from './StreamingText';

export default function FaultReport({ asset }) {
  const { text, loading, error, startStream, reset } = useGroqStream();
  const [savedReport, setSavedReport] = useState(asset.ai_fault_report || '');

  useEffect(() => {
    setSavedReport(asset.ai_fault_report || '');
    reset();
  }, [asset.id, asset.ai_fault_report, reset]);

  const handleGenerate = async () => {
    await startStream(`/api/ai/fault-report/${asset.id}`, {
      method: 'POST',
      body: asset
    });
  };

  const handleSave = async (reportText) => {
    if (!reportText) return;
    try {
      const token = localStorage.getItem('urbanguard_token');
      await fetch(`/api/assets/${asset.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ ai_fault_report: reportText })
      });
      setSavedReport(reportText);
    } catch (err) {
      console.error('Failed to save report', err);
    }
  };

  useEffect(() => {
    if (!loading && text && text.length > 0 && text !== savedReport) {
      handleSave(text);
    }
  }, [loading, text]); // eslint-disable-line react-hooks/exhaustive-deps

  const displayReport = text || savedReport;

  return (
    <div className="rounded-xl p-5 mb-4" style={{ background: '#FFFFFF', border: '1px solid #E8E8F0' }}>
      <div className="flex items-center gap-2 mb-4">
        <h3 className="font-body text-[11px] font-medium tracking-widest uppercase" style={{ color: '#64748B' }}>
          AI Fault Report
        </h3>
      </div>
      
      {(!displayReport && !loading) && (
        <div className="mb-4">
          <p className="font-body text-sm leading-relaxed mb-4" style={{ color: '#64748B' }}>
            No AI fault report generated yet. Click generate to analyze {asset.id} data and produce a comprehensive technical report.
          </p>
          <button
            onClick={handleGenerate}
            className="text-white px-6 py-2.5 rounded-full transition-colors font-body text-sm"
            style={{ background: '#9D72FF' }}
            onMouseOver={e => e.currentTarget.style.background = '#8B5CF6'}
            onMouseOut={e => e.currentTarget.style.background = '#9D72FF'}
          >
            Generate AI Fault Report
          </button>
        </div>
      )}

      {(displayReport || loading || error) && (
        <div className="space-y-4">
          <StreamingText 
            text={displayReport} 
            loading={loading} 
            error={error} 
            title="FAULT REPORT"
          />
          
          {!loading && (
            <button
              onClick={handleGenerate}
              className="px-4 py-2 rounded-full transition-colors font-body text-sm"
              style={{ color: '#64748B', border: '1px solid #E8E8F0' }}
              onMouseOver={e => { e.currentTarget.style.color = '#1A1A1E'; e.currentTarget.style.borderColor = '#9D72FF'; }}
              onMouseOut={e => { e.currentTarget.style.color = '#64748B'; e.currentTarget.style.borderColor = '#E8E8F0'; }}
            >
              Regenerate Report
            </button>
          )}
        </div>
      )}
    </div>
  );
}
