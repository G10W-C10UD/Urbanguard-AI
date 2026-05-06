// Asset Detail Panel — slides in from right when clicking any asset
// Tab order: IoT → Anomaly → Complaints → Social → Binary Search
// AI Fault Report at bottom (not a tab)
import { useState, useEffect } from 'react';
import IoTPanel from '../iot/IoTPanel';
import AnomalyPanel from '../anomaly/AnomalyPanel';
import FaultReport from '../ai/FaultReport';
import SocialPanel from '../ai/SocialPanel';
import ComplaintsPanel from '../ai/ComplaintsPanel';
import { useAssets } from '../../context/AssetContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const STATUS_COLORS = {
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
  repair: '#3B82F6',
  under_repair: '#3B82F6',
};

const STATUS_LABELS = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  repair: 'Under Repair',
  under_repair: 'Under Repair',
};

const TABS = [
  { key: 'iot', label: 'IoT Sensor' },
  { key: 'anomaly', label: 'Anomaly' },
  { key: 'complaints', label: 'Complaints' },
  { key: 'social', label: 'Social Media' },
  { key: 'binary', label: 'Binary Search' },
];

export default function AssetDetailPanel({ asset, onClose }) {
  const [activeTab, setActiveTab] = useState('iot');
  const [visible, setVisible] = useState(false);
  const [dispatching, setDispatching] = useState(false);
  const [dispatchResult, setDispatchResult] = useState(null);

  useEffect(() => {
    if (asset) {
      requestAnimationFrame(() => setVisible(true));
      setDispatchResult(null);
    } else {
      setVisible(false);
    }
  }, [asset]);

  const handleClose = () => {
    setVisible(false);
    setTimeout(onClose, 300);
  };

  const handleDispatch = async () => {
    if (!asset || dispatching) return;
    setDispatching(true);
    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const res = await axios.post(`${baseUrl}/api/jobs`, {
        asset_id: asset.id,
        asset_type: asset.type,
        area: asset.area,
        fault_description: `Manual dispatch for ${asset.name} — ${asset.status} status detected. Health score: ${asset.healthScore}/100.`,
        severity: asset.status === 'critical' ? 'critical' : 'warning',
        source: 'manual'
      });
      if (res.data.success) {
        setDispatchResult({ success: true, jobId: res.data.data.id });
      } else {
        setDispatchResult({ success: false, error: res.data.error || 'Failed to create job' });
      }
    } catch (err) {
      setDispatchResult({ success: false, error: 'Failed to create job' });
    } finally {
      setDispatching(false);
    }
  };

  if (!asset && !visible) return null;

  const displayAsset = asset || {};
  const statusColor = STATUS_COLORS[displayAsset.status] || '#94A3B8';
  const statusLabel = STATUS_LABELS[displayAsset.status] || displayAsset.status || '';
  const hasActiveJob = displayAsset.job_status && displayAsset.job_status !== 'none';

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={handleClose}
        style={{
          position: 'fixed',
          inset: 0,
          zIndex: 1100,
          background: visible ? 'rgba(0,0,0,0.15)' : 'transparent',
          transition: 'background 0.3s ease',
          pointerEvents: visible ? 'auto' : 'none',
        }}
      />

      {/* Panel */}
      <div
        id="asset-detail-panel"
        style={{
          position: 'fixed',
          top: 0,
          right: 0,
          width: '480px',
          height: '100vh',
          background: '#FFFFFF',
          borderLeft: '1px solid #E8E8F0',
          zIndex: 1200,
          transform: visible ? 'translateX(0)' : 'translateX(100%)',
          transition: 'transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: '24px 28px 20px', borderBottom: '1px solid #E8E8F0', flexShrink: 0 }}>
          {/* Close button */}
          <button
            id="detail-panel-close"
            onClick={handleClose}
            style={{
              position: 'absolute', top: '20px', right: '20px',
              width: '32px', height: '32px', background: '#F9F9FB',
              border: '1px solid #E8E8F0', borderRadius: '8px',
              color: '#64748B', cursor: 'pointer',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '16px', transition: 'all 0.2s',
            }}
            onMouseEnter={(e) => { e.target.style.borderColor = '#9D72FF'; e.target.style.color = '#1A1A1E'; }}
            onMouseLeave={(e) => { e.target.style.borderColor = '#E8E8F0'; e.target.style.color = '#64748B'; }}
          >
            ✕
          </button>

          {/* Asset ID + Status */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
            <span className="font-body" style={{ color: '#9D72FF', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}>
              {displayAsset.id}
            </span>
            <span style={{
              fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '20px',
              background: `${statusColor}15`, color: statusColor,
              border: `1px solid ${statusColor}30`, letterSpacing: '0.04em',
              textTransform: 'uppercase', fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}>
              {statusLabel}
            </span>
            {displayAsset.healthScore !== undefined && (
              <span className="font-body" style={{ fontSize: '12px', fontWeight: 700, color: '#64748B' }}>
                Score: {displayAsset.healthScore}/100
              </span>
            )}
          </div>

          {/* Name */}
          <h2 className="font-body" style={{ fontSize: '28px', color: '#1A1A1E', lineHeight: 1.2, letterSpacing: '-0.02em', marginBottom: '4px', fontWeight: 800 }}>
            {displayAsset.name}
          </h2>

          {/* Area */}
          <p className="font-body" style={{ fontSize: '14px', color: '#64748B' }}>
            {displayAsset.area}
          </p>
        </div>

        {/* Tab bar */}
        <div style={{ display: 'flex', borderBottom: '1px solid #E8E8F0', overflowX: 'auto', flexShrink: 0, padding: '0 28px' }}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <button
                key={tab.key}
                onClick={() => setActiveTab(tab.key)}
                style={{
                  padding: '14px 14px', fontSize: '12px',
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? '#9D72FF' : '#94A3B8',
                  background: 'none', border: 'none',
                  borderBottom: isActive ? '2px solid #9D72FF' : '2px solid transparent',
                  cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.2s',
                  fontFamily: "'Plus Jakarta Sans', sans-serif",
                }}
              >
                {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab content + AI Fault Report at bottom */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '24px 28px' }}>
          <TabContent tab={activeTab} asset={displayAsset} />

          {/* Divider */}
          <div style={{ borderTop: '1px solid #E8E8F0', margin: '28px 0 20px' }} />

          {/* AI Fault Report (always visible at bottom) */}
          <div style={{ marginLeft: '-12px', marginRight: '-12px' }}>
            <FaultReport asset={displayAsset} />
          </div>

          {/* Dispatch / Job Status section */}
          <div style={{ marginTop: '16px', padding: '0 0 24px' }}>
            {hasActiveJob ? (
              <div style={{
                background: '#F3EEFF', border: '1px solid #E8E8F0', borderRadius: '12px',
                padding: '16px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between'
              }}>
                <div>
                  <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>
                    Active Job
                  </div>
                  <div className="font-body" style={{ fontSize: '14px', color: '#1A1A1E', fontWeight: 700 }}>
                    Status: {displayAsset.job_status?.replace(/_/g, ' ').toUpperCase() || '—'}
                  </div>
                </div>
                <span style={{
                  background: '#9D72FF', color: 'white', fontSize: '11px', fontWeight: 700,
                  padding: '4px 12px', borderRadius: '20px'
                }}>
                  IN PROGRESS
                </span>
              </div>
            ) : (
              <>
                {dispatchResult?.success ? (
                  <div style={{ background: '#DCFCE7', border: '1px solid #22C55E', borderRadius: '12px', padding: '16px 20px' }}>
                    <div className="font-body" style={{ fontSize: '14px', color: '#16A34A', fontWeight: 600 }}>
                      ✓ Job dispatched: {dispatchResult.jobId}
                    </div>
                  </div>
                ) : (
                  <button
                    onClick={handleDispatch}
                    disabled={dispatching || displayAsset.status === 'healthy'}
                    className="font-body"
                    style={{
                      width: '100%', padding: '14px', borderRadius: '12px', border: 'none',
                      background: displayAsset.status === 'healthy' ? '#F4F4F8' : '#9D72FF',
                      color: displayAsset.status === 'healthy' ? '#94A3B8' : 'white',
                      fontSize: '14px', fontWeight: 600, cursor: displayAsset.status === 'healthy' ? 'not-allowed' : 'pointer',
                      transition: 'all 0.2s',
                    }}
                  >
                    {dispatching ? 'Dispatching...' : 'Dispatch Repair Job'}
                  </button>
                )}
                {dispatchResult && !dispatchResult.success && (
                  <p className="font-body" style={{ color: '#EF4444', fontSize: '12px', marginTop: '8px' }}>
                    {dispatchResult.error}
                  </p>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </>
  );
}

// ─── Tab content ───
function TabContent({ tab, asset }) {
  const { autoDetectedFaults } = useAssets();
  const navigate = useNavigate();

  switch (tab) {
    case 'iot':
      return <IoTPanel assetId={asset.id} />;

    case 'anomaly':
      return <AnomalyPanel assetId={asset.id} />;

    case 'complaints':
      return <ComplaintsPanel asset={asset} />;

    case 'social':
      return <SocialPanel asset={asset} />;

    case 'binary': {
      const faultRecord = autoDetectedFaults?.find(f => f.assetId === asset.id);

      return (
        <div style={{ marginLeft: '-12px', marginRight: '-12px', padding: '0 12px' }}>
          {faultRecord ? (
            <div style={{ background: '#F9F9FB', border: '1px solid #E8E8F0', borderRadius: '12px', padding: '24px', textAlign: 'center' }}>
               <h4 className="font-body" style={{ color: '#1A1A1E', fontSize: '18px', fontWeight: 800, marginBottom: '20px' }}>Binary Search Complete</h4>
               <div style={{ display: 'flex', justifyContent: 'center', gap: '32px', marginBottom: '24px' }}>
                 <div>
                   <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Faulty Unit</div>
                   <div className="font-mono" style={{ fontSize: '24px', color: '#EF4444', fontWeight: 800 }}>#{faultRecord.faultyUnitIndex + 1}</div>
                 </div>
                 <div>
                   <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Steps</div>
                   <div className="font-mono" style={{ fontSize: '24px', color: '#1A1A1E', fontWeight: 800 }}>{faultRecord.totalSteps}</div>
                 </div>
                 <div>
                   <div className="font-body" style={{ fontSize: '11px', color: '#94A3B8', fontWeight: 600, textTransform: 'uppercase', marginBottom: '4px' }}>Deviation</div>
                   <div className="font-mono" style={{ fontSize: '24px', color: '#1A1A1E', fontWeight: 800 }}>{Math.abs(faultRecord.iotDeviation)}%</div>
                 </div>
               </div>
               <button
                 onClick={() => navigate('/admin/binary-search')}
                 className="font-body cursor-pointer"
                 style={{ background: '#9D72FF', color: 'white', padding: '12px 24px', borderRadius: '8px', border: 'none', fontWeight: 600, width: '100%' }}
               >
                 View Full Analysis
               </button>
            </div>
          ) : (
            <div style={{ background: '#F9F9FB', border: '1px solid #E8E8F0', borderRadius: '12px', padding: '40px 24px', textAlign: 'center' }}>
              <p className="font-body" style={{ color: '#64748B', fontSize: '14px', marginBottom: '20px' }}>No automated binary search has been run for this asset recently.</p>
              <button
                 onClick={() => navigate('/admin/binary-search')}
                 className="font-body cursor-pointer"
                 style={{ background: '#FFFFFF', color: '#1A1A1E', border: '1px solid #E8E8F0', padding: '12px 24px', borderRadius: '8px', fontWeight: 600, width: '100%' }}
               >
                 Run Binary Search Diagnostic
               </button>
            </div>
          )}
        </div>
      );
    }

    default:
      return null;
  }
}
