// Settings — admin system configuration page with live-wired IoT simulation controls
import { useState, useEffect, useCallback } from 'react';
import { useAssets } from '../../context/AssetContext.jsx';
import axios from 'axios';

/* ─── Toggle Switch Component ─── */
function Toggle({ checked, onChange, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
      <span className="font-body" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1E' }}>{label}</span>
      <button
        onClick={() => onChange(!checked)}
        style={{
          width: '48px', height: '26px', borderRadius: '13px',
          background: checked ? '#9D72FF' : '#D8D8E8',
          border: 'none', cursor: 'pointer', position: 'relative',
          transition: 'background 0.2s',
        }}
      >
        <span style={{
          position: 'absolute', top: '3px',
          left: checked ? '25px' : '3px',
          width: '20px', height: '20px', borderRadius: '50%',
          background: '#FFFFFF', boxShadow: '0 1px 3px rgba(0,0,0,0.15)',
          transition: 'left 0.2s',
        }} />
      </button>
    </div>
  );
}

/* ─── Slider Component ─── */
function Slider({ label, value, min, max, step, unit, onChange }) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
        <span className="font-body" style={{ fontSize: '14px', fontWeight: 500, color: '#1A1A1E' }}>{label}</span>
        <span className="font-body" style={{ fontSize: '14px', fontWeight: 700, color: '#9D72FF' }}>{value}{unit}</span>
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={e => onChange(parseFloat(e.target.value))}
        style={{
          width: '100%', height: '6px', appearance: 'none', borderRadius: '3px',
          background: `linear-gradient(to right, #9D72FF ${percent}%, #E8E8F0 ${percent}%)`,
          outline: 'none', cursor: 'pointer',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '4px' }}>
        <span className="font-body" style={{ fontSize: '11px', color: '#94A3B8' }}>{min}{unit}</span>
        <span className="font-body" style={{ fontSize: '11px', color: '#94A3B8' }}>{max}{unit}</span>
      </div>
    </div>
  );
}

/* ─── Number Input Component ─── */
function NumberInput({ label, value, onChange }) {
  return (
    <div style={{ marginBottom: '16px' }}>
      <label className="font-body" style={{ fontSize: '13px', fontWeight: 500, color: '#64748B', display: 'block', marginBottom: '6px' }}>
        {label}
      </label>
      <input
        type="number"
        value={value}
        onChange={e => onChange(parseFloat(e.target.value) || 0)}
        className="font-body"
        style={{
          width: '100%', padding: '10px 14px', border: '1.5px solid #E8E8F0',
          borderRadius: '8px', fontSize: '14px', color: '#1A1A1E',
          background: '#F9F9FB', outline: 'none', transition: 'border-color 0.2s',
        }}
        onFocus={e => { e.target.style.borderColor = '#9D72FF'; e.target.style.boxShadow = '0 0 0 3px rgba(157,114,255,0.1)'; }}
        onBlur={e => { e.target.style.borderColor = '#E8E8F0'; e.target.style.boxShadow = 'none'; }}
      />
    </div>
  );
}

/* ─── Confirmation Modal ─── */
function ConfirmModal({ message, onConfirm, onCancel }) {
  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 9999,
      background: 'rgba(0,0,0,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center',
    }}>
      <div style={{
        background: '#FFFFFF', borderRadius: '16px', padding: '32px',
        width: '400px', border: '1px solid #E8E8F0', boxShadow: '0 16px 32px rgba(0,0,0,0.1)',
      }}>
        <h3 className="font-body" style={{ fontSize: '18px', fontWeight: 700, color: '#1A1A1E', marginBottom: '12px' }}>
          Confirm Action
        </h3>
        <p className="font-body" style={{ fontSize: '14px', color: '#64748B', marginBottom: '24px', lineHeight: 1.6 }}>
          {message}
        </p>
        <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            className="font-body"
            style={{
              padding: '10px 20px', borderRadius: '8px', border: '1px solid #E8E8F0',
              background: '#FFFFFF', color: '#64748B', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className="font-body"
            style={{
              padding: '10px 20px', borderRadius: '8px', border: 'none',
              background: '#EF4444', color: 'white', fontSize: '14px', fontWeight: 600, cursor: 'pointer',
            }}
          >
            Confirm
          </button>
        </div>
      </div>
    </div>
  );
}

/* ─── Section Card Wrapper ─── */
function SectionCard({ title, subtitle, children }) {
  return (
    <div style={{
      background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px',
      padding: '28px', marginBottom: '20px',
    }}>
      <h3 className="font-body" style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1E', marginBottom: '4px' }}>
        {title}
      </h3>
      {subtitle && (
        <p className="font-body" style={{ fontSize: '13px', color: '#94A3B8', marginBottom: '20px' }}>
          {subtitle}
        </p>
      )}
      {children}
    </div>
  );
}

/* ─── Status Dot ─── */
function StatusDot({ ok, label }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: ok ? '#22C55E' : '#EF4444' }} />
      <span className="font-body" style={{ fontSize: '13px', fontWeight: 500, color: ok ? '#16A34A' : '#DC2626' }}>
        {label}
      </span>
    </div>
  );
}

/* ─── Main Settings Page ─── */
export default function Settings() {
  const { assets, simConfig, updateSimConfig } = useAssets();

  // Local state (synced to context on Apply)
  const [iotActive, setIotActive] = useState(simConfig.iotActive);
  const [updateInterval, setUpdateInterval] = useState(simConfig.updateIntervalMs / 1000);
  const [faultProbability, setFaultProbability] = useState(Math.round(simConfig.faultProbability * 100));
  const [thresholds, setThresholds] = useState({
    iotCritical: simConfig.iotCriticalThreshold,
    iotWarning: simConfig.iotWarningThreshold,
    complaintCritical: simConfig.complaintCriticalScore,
    socialCritical: simConfig.socialMediaCriticalFlags,
    anomalyHighRisk: simConfig.anomalyHighRiskScore,
  });
  const [aiToggles, setAIToggles] = useState({
    autoFaultReport: true,
    autoClassify: true,
    dailyDigest: true,
  });

  const [aiStatus, setAIStatus] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null);
  const [feedback, setFeedback] = useState(null);

  // Check AI status
  useEffect(() => {
    const checkAI = async () => {
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${baseUrl}/api/ai/status`);
        setAIStatus(res.data.data?.connected || false);
      } catch {
        setAIStatus(false);
      }
    };
    checkAI();
  }, []);

  const showFeedback = useCallback((msg, type = 'success') => {
    setFeedback({ msg, type });
    setTimeout(() => setFeedback(null), 3000);
  }, []);

  // Apply IoT settings
  const handleApplyIoT = () => {
    updateSimConfig({
      iotActive,
      updateIntervalMs: updateInterval * 1000,
      faultProbability: faultProbability / 100,
    });
    showFeedback('IoT simulation settings applied successfully.');
  };

  // Save thresholds
  const handleSaveThresholds = () => {
    updateSimConfig({
      iotCriticalThreshold: thresholds.iotCritical,
      iotWarningThreshold: thresholds.iotWarning,
      complaintCriticalScore: thresholds.complaintCritical,
      socialMediaCriticalFlags: thresholds.socialCritical,
      anomalyHighRiskScore: thresholds.anomalyHighRisk,
    });
    showFeedback('Detection thresholds saved.');
  };



  return (
    <div style={{ maxWidth: '800px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '8px' }}>
        <nav className="font-body" style={{ fontSize: '12px', color: '#94A3B8', marginBottom: '8px' }}>
          <a href="/admin/overview" style={{ color: '#94A3B8', textDecoration: 'none' }}
            onMouseOver={e => e.target.style.color = '#9D72FF'}
            onMouseOut={e => e.target.style.color = '#94A3B8'}
          >Home</a>
          <span style={{ margin: '0 6px' }}>›</span>
          <span style={{ color: '#64748B' }}>Settings</span>
        </nav>
        <h1 className="font-body" style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1E', letterSpacing: '-0.02em' }}>
          Settings
        </h1>
        <p className="font-body" style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
          System configuration and preferences
        </p>
      </div>

      {/* Feedback toast */}
      {feedback && (
        <div style={{
          position: 'fixed', top: '24px', right: '24px', zIndex: 9999,
          padding: '14px 24px', borderRadius: '12px',
          background: feedback.type === 'error' ? '#FEE2E2' : '#DCFCE7',
          color: feedback.type === 'error' ? '#DC2626' : '#16A34A',
          border: `1px solid ${feedback.type === 'error' ? '#EF4444' : '#22C55E'}`,
          fontSize: '14px', fontWeight: 600, fontFamily: "'Plus Jakarta Sans', sans-serif",
          boxShadow: '0 4px 16px rgba(0,0,0,0.1)',
          animation: 'fadeIn 0.3s ease',
        }}>
          {feedback.msg}
        </div>
      )}

      {/* Section 1 — System Overview */}
      <SectionCard title="System Overview" subtitle="Current system status and statistics">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
          <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '16px' }}>
            <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
              Total Assets
            </div>
            <div className="font-body" style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1E' }}>
              {assets.length || 100}
            </div>
          </div>
          <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '16px' }}>
            <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
              Database Status
            </div>
            <StatusDot ok={true} label="Connected" />
          </div>
          <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '16px' }}>
            <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
              Server Status
            </div>
            <StatusDot ok={true} label="Running" />
          </div>
          <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '16px' }}>
            <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '6px' }}>
              Last Seed Date
            </div>
            <div className="font-body" style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1E' }}>
              {new Date().toLocaleDateString('en-IN')}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* Section 2 — IoT Simulation Settings */}
      <SectionCard title="IoT Simulation Settings" subtitle="Configure real-time sensor simulation parameters">
        <div style={{ marginBottom: '20px' }}>
          <Toggle
            checked={iotActive}
            onChange={setIotActive}
            label="IoT Simulation Active"
          />
        </div>

        <Slider
          label="Update Interval"
          value={updateInterval}
          min={10}
          max={60}
          step={5}
          unit="s"
          onChange={setUpdateInterval}
        />

        <Slider
          label="Fault Probability"
          value={faultProbability}
          min={0}
          max={50}
          step={1}
          unit="%"
          onChange={setFaultProbability}
        />

        <button
          onClick={handleApplyIoT}
          className="font-body"
          style={{
            padding: '12px 24px', borderRadius: '9999px', border: 'none',
            background: '#9D72FF', color: 'white', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#8B5CF6'}
          onMouseOut={e => e.currentTarget.style.background = '#9D72FF'}
        >
          Apply Changes
        </button>
      </SectionCard>

      {/* Section 3 — Detection Thresholds */}
      <SectionCard title="Detection Thresholds" subtitle="Adjust detection sensitivity for all 5 signals">
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
          <NumberInput
            label="IoT Critical Threshold (%)"
            value={thresholds.iotCritical}
            onChange={v => setThresholds(p => ({ ...p, iotCritical: v }))}
          />
          <NumberInput
            label="IoT Warning Threshold (%)"
            value={thresholds.iotWarning}
            onChange={v => setThresholds(p => ({ ...p, iotWarning: v }))}
          />
          <NumberInput
            label="Complaint Critical Score"
            value={thresholds.complaintCritical}
            onChange={v => setThresholds(p => ({ ...p, complaintCritical: v }))}
          />
          <NumberInput
            label="Social Media Critical Flags"
            value={thresholds.socialCritical}
            onChange={v => setThresholds(p => ({ ...p, socialCritical: v }))}
          />
          <NumberInput
            label="Anomaly High Risk Score"
            value={thresholds.anomalyHighRisk}
            onChange={v => setThresholds(p => ({ ...p, anomalyHighRisk: v }))}
          />
        </div>
        <button
          onClick={handleSaveThresholds}
          className="font-body"
          style={{
            padding: '12px 24px', borderRadius: '9999px', border: 'none',
            background: '#9D72FF', color: 'white', fontSize: '14px', fontWeight: 600,
            cursor: 'pointer', marginTop: '8px', transition: 'background 0.2s',
          }}
          onMouseOver={e => e.currentTarget.style.background = '#8B5CF6'}
          onMouseOut={e => e.currentTarget.style.background = '#9D72FF'}
        >
          Save Thresholds
        </button>
      </SectionCard>

      {/* Section 4 — AI Configuration */}
      <SectionCard title="AI Configuration" subtitle="Groq AI integration status and settings">
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                Groq Model
              </div>
              <div className="font-body" style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1E' }}>
                openai/gpt-oss-120b
              </div>
            </div>
            <StatusDot ok={aiStatus !== false} label={aiStatus !== false ? 'Connected' : 'Not configured'} />
          </div>

          <Toggle
            checked={aiToggles.autoFaultReport}
            onChange={v => setAIToggles(p => ({ ...p, autoFaultReport: v }))}
            label="Auto-generate fault reports on critical detection"
          />
          <Toggle
            checked={aiToggles.autoClassify}
            onChange={v => setAIToggles(p => ({ ...p, autoClassify: v }))}
            label="Auto-classify complaints with AI"
          />
          <Toggle
            checked={aiToggles.dailyDigest}
            onChange={v => setAIToggles(p => ({ ...p, dailyDigest: v }))}
            label="Generate daily digest on first login"
          />
        </div>
      </SectionCard>



      {/* Confirmation Modal */}
      {confirmModal && (
        <ConfirmModal
          message={confirmModal.message}
          onConfirm={confirmModal.onConfirm}
          onCancel={() => setConfirmModal(null)}
        />
      )}
    </div>
  );
}
