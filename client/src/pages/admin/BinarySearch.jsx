import { useState, useMemo, useRef } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb.jsx';
import { Lightbulb, Route, Droplets, CircleDot, ShieldCheck, ArrowRight } from 'lucide-react';
import { useAssets } from '../../context/AssetContext.jsx';
import BinarySearchVisualiser from '../../components/binary-search/BinarySearchVisualiser.jsx';
import { BINARY_SEARCH_CONFIGS } from '../../utils/binarySearchConfig';

const TYPE_ICONS = {
  streetlight: Lightbulb,
  road: Route,
  waterpipe: Droplets,
  sewer: CircleDot
};

export default function BinarySearch() {
  const [selectedType, setSelectedType] = useState('streetlight');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [faultRecord, setFaultRecord] = useState(null);
  const [manualTrigger, setManualTrigger] = useState(0);
  const visualiserRef = useRef(null);

  const { assets, autoDetectedFaults, markFaultReviewed } = useAssets();

  const filteredAssets = useMemo(
    () => assets?.filter(a => a.type === selectedType) || [],
    [assets, selectedType]
  );

  const unreviewedFaults = useMemo(() => {
    return autoDetectedFaults?.filter(f => f.status === 'unreviewed') || [];
  }, [autoDetectedFaults]);

  const handleFaultClick = (fault) => {
    const asset = assets?.find(a => a.id === fault.assetId);
    if (asset) {
      setSelectedType(asset.type);
      setSelectedAsset(asset);
    }
    setFaultRecord(fault);
    markFaultReviewed(fault.assetId);

    // Give state a moment to update before scrolling
    setTimeout(() => {
      visualiserRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  // When manually selecting an asset or type, clear the preset fault record
  const handleTypeSelect = (typeKey) => {
    setSelectedType(typeKey);
    setSelectedAsset(null);
    setFaultRecord(null);
  };

  const handleAssetSelect = (assetId) => {
    const asset = filteredAssets.find(a => a.id === assetId);
    setSelectedAsset(asset || null);
    setFaultRecord(null);
  };

  const handleRunManual = () => {
    setManualTrigger(prev => prev + 1);
    setFaultRecord(null);
    setTimeout(() => {
      visualiserRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  return (
    <div style={{ padding: '40px 48px', maxWidth: '1280px', margin: '0 auto' }}>
      <Breadcrumb page="Binary Search" />
      
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 className="font-display" style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1E', margin: 0, lineHeight: 1.2 }}>
            Binary Search Diagnostic
          </h1>
          <p className="font-body" style={{ fontSize: '14px', color: '#64748B', marginTop: '4px', marginBottom: 0 }}>
            AI-powered fault isolation using O(log n) binary search algorithm
          </p>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#F3EEFF', padding: '8px 16px', borderRadius: '20px' }}>
          <span 
            style={{
              width: '8px', height: '8px', borderRadius: '50%', background: '#9D72FF',
              boxShadow: '0 0 0 4px rgba(157,114,255,0.2)',
              animation: 'pulse 2s infinite'
            }}
          />
          <span className="font-body" style={{ fontSize: '13px', fontWeight: 600, color: '#9D72FF' }}>
            Auto-detecting faults
          </span>
        </div>
      </div>

      {/* SECTION A: Live Fault Detection Feed */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '24px', marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px' }}>
          <span className="font-mono" style={{ fontSize: '13px', fontWeight: 700, color: '#9D72FF', letterSpacing: '0.06em', textTransform: 'uppercase' }}>
            LIVE FAULT DETECTIONS
          </span>
          <span className="font-mono" style={{ background: '#F3EEFF', color: '#9D72FF', padding: '2px 8px', borderRadius: '12px', fontSize: '12px', fontWeight: 700 }}>
            {unreviewedFaults.length}
          </span>
        </div>

        {unreviewedFaults.length === 0 ? (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 0', background: '#F9F9FB', borderRadius: '12px', border: '1px dashed #E8E8F0' }}>
            <ShieldCheck size={32} color="#94A3B8" style={{ marginBottom: '12px' }} />
            <p className="font-body" style={{ color: '#94A3B8', fontSize: '14px', fontWeight: 500, margin: 0 }}>
              All systems nominal — no faults detected
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {unreviewedFaults.map(fault => {
              const Icon = TYPE_ICONS[fault.assetType] || Lightbulb;
              const config = BINARY_SEARCH_CONFIGS[fault.assetType];
              
              return (
                <div 
                  key={fault.assetId + fault.detectedAt}
                  onClick={() => handleFaultClick(fault)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '16px', cursor: 'pointer',
                    background: '#F9F9FB', border: '1px solid #E8E8F0', borderRadius: '12px', 
                    padding: '16px 20px', transition: 'all 0.2s ease',
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.background = '#F3EEFF';
                    e.currentTarget.style.borderColor = '#9D72FF';
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.background = '#F9F9FB';
                    e.currentTarget.style.borderColor = '#E8E8F0';
                  }}
                >
                  <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: `${config.color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <Icon size={20} color={config.color} />
                  </div>
                  
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                      <span className="font-mono" style={{ color: '#9D72FF', fontSize: '14px', fontWeight: 700 }}>{fault.assetId}</span>
                      <span className="font-body" style={{ color: '#1A1A1E', fontSize: '15px', fontWeight: 700 }}>{fault.assetName}</span>
                    </div>
                    <div className="font-body" style={{ color: '#64748B', fontSize: '13px', marginBottom: '6px' }}>{fault.area}</div>
                    <div className="font-body" style={{ fontSize: '13px' }}>
                      <span style={{ color: '#EF4444', fontWeight: 600 }}>Fault isolated at Unit #{fault.faultyUnitIndex + 1}</span>
                      <span style={{ color: '#E8E8F0', margin: '0 8px' }}>|</span>
                      <span style={{ color: '#94A3B8' }}>{fault.totalSteps} steps taken</span>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '12px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <span className="font-mono" style={{ background: '#FFF5F5', color: '#EF4444', padding: '4px 10px', borderRadius: '20px', fontSize: '12px', fontWeight: 700 }}>
                        {Math.abs(fault.iotDeviation)}% dev
                      </span>
                      <span style={{ width: '8px', height: '8px', background: '#EF4444', borderRadius: '50%' }} />
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '4px', color: '#9D72FF', fontSize: '13px', fontWeight: 600 }}>
                      View Analysis <ArrowRight size={14} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      <div ref={visualiserRef} />

      {/* SECTION B: Manual Selector and Visualiser */}
      {/* Target asset selector row */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '12px', padding: '20px 24px', marginBottom: '24px' }}>
        <label className="font-body" style={{ display: 'block', fontSize: '12px', fontWeight: 600, color: '#64748B', letterSpacing: '0.06em', textTransform: 'uppercase', marginBottom: '16px' }}>
          Select Target Asset for Manual Diagnostic
        </label>
        
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {Object.keys(BINARY_SEARCH_CONFIGS).map(typeKey => {
            const Icon = TYPE_ICONS[typeKey] || Lightbulb;
            const isSelected = selectedType === typeKey;
            const config = BINARY_SEARCH_CONFIGS[typeKey];
            return (
              <div
                key={typeKey}
                onClick={() => handleTypeSelect(typeKey)}
                style={{
                  background: isSelected ? '#FDFBFF' : '#FFFFFF',
                  border: `1.5px solid ${isSelected ? '#9D72FF' : '#E8E8F0'}`,
                  borderRadius: '12px', padding: '20px', cursor: 'pointer',
                  boxShadow: isSelected ? '0 4px 16px rgba(157,114,255,0.12)' : 'none',
                  transition: 'all 0.2s'
                }}
              >
                <div style={{ width: '40px', height: '40px', background: '#F3EEFF', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '12px' }}>
                  <Icon size={18} color={isSelected ? '#9D72FF' : '#94A3B8'} />
                </div>
                <div className="font-body" style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1E', margin: '0 0 6px 0' }}>
                  {config.label}
                </div>
                <div className="font-body" style={{ fontSize: '12px', color: '#64748B', lineHeight: 1.4 }}>
                  {config.totalUnits} units
                </div>
              </div>
            );
          })}
        </div>

        <select
          value={selectedAsset?.id || ''}
          onChange={(e) => handleAssetSelect(e.target.value)}
          className="font-body"
          style={{
            width: '100%', padding: '12px 16px', background: '#FFFFFF', border: '1.5px solid #E8E8F0', borderRadius: '8px',
            fontSize: '14px', color: '#1A1A1E', outline: 'none'
          }}
        >
          <option value="">Choose an asset...</option>
          {filteredAssets.map(a => (
            <option key={a.id} value={a.id}>{a.id} — {a.name} ({a.area})</option>
          ))}
        </select>

        <button
          onClick={handleRunManual}
          disabled={!selectedAsset}
          className="font-body"
          style={{
            background: '#9D72FF', color: 'white', border: 'none', borderRadius: '10px', padding: '12px 32px',
            fontSize: '15px', fontWeight: 600, width: '100%', marginTop: '16px',
            cursor: selectedAsset ? 'pointer' : 'not-allowed', opacity: selectedAsset ? 1 : 0.5
          }}
        >
          Run Manual Diagnostic
        </button>
      </div>

      {/* Visualiser */}
      {selectedAsset ? (
        <BinarySearchVisualiser
          key={faultRecord ? `auto-${faultRecord.assetId}-${faultRecord.detectedAt}` : `manual-${selectedAsset.id}-${manualTrigger}`}
          assetType={selectedAsset.type}
          assetId={selectedAsset.id}
          assetName={selectedAsset.name}
          faultRecord={faultRecord}
          manualTrigger={manualTrigger}
        />
      ) : (
        <div className="font-body" style={{ textAlign: 'center', padding: '80px 20px', borderRadius: '12px', background: '#FFFFFF', border: '1px solid #E8E8F0' }}>
          <p style={{ color: '#94A3B8', fontSize: '14px', margin: 0 }}>
            Select an asset above to begin the binary search diagnostic
          </p>
        </div>
      )}

      <style>{`
        @keyframes pulse {
          0% { box-shadow: 0 0 0 0 rgba(157,114,255,0.4); }
          70% { box-shadow: 0 0 0 6px rgba(157,114,255,0); }
          100% { box-shadow: 0 0 0 0 rgba(157,114,255,0); }
        }
      `}</style>
    </div>
  );
}
