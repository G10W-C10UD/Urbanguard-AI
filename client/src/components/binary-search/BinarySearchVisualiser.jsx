import { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2 } from 'lucide-react';
import { useBinarySearch } from '../../hooks/useBinarySearch';
import { BINARY_SEARCH_CONFIGS } from '../../utils/binarySearchConfig';
import axios from 'axios';
import { useAssets } from '../../context/AssetContext';
import MarkdownRenderer from '../ai/MarkdownRenderer';

export default function BinarySearchVisualiser({
  assetType,
  assetId,
  assetName,
  faultRecord = null,
  manualTrigger = 0,
  compact = false
}) {
  const config = BINARY_SEARCH_CONFIGS[assetType] || BINARY_SEARCH_CONFIGS['streetlight'];
  
  const {
    readings,
    steps,
    currentStep,
    faultyIndex,
    isRunning,
    isComplete,
    simulateFault,
    reset
  } = useBinarySearch(config);

  const [dispatchStage, setDispatchStage] = useState('idle'); // idle | loading | success
  const [toast, setToast] = useState(null);
  
  const [reportLoading, setReportLoading] = useState(false);
  const [reportText, setReportText] = useState('');
  
  const { getAssetById, anomalyData } = useAssets();
  const selectedAsset = getAssetById(assetId) || { id: assetId, name: assetName, type: assetType };

  // Run on mount if faultRecord is provided with a 500ms delay
  useEffect(() => {
    let timer;
    if (faultRecord) {
      timer = setTimeout(() => {
        simulateFault(faultRecord.faultyUnitIndex);
      }, 500);
    }
    return () => clearTimeout(timer);
  }, [faultRecord, simulateFault]);

  // Run on manual trigger
  useEffect(() => {
    if (manualTrigger > 0 && !faultRecord) {
      simulateFault(null);
    }
  }, [manualTrigger, faultRecord, simulateFault]);

  const currentSearchState = useMemo(() => {
    if (currentStep >= 0 && currentStep < steps.length) {
      return steps[currentStep];
    }
    return null;
  }, [steps, currentStep]);

  const confirmedHealthy = useMemo(() => {
    const set = new Set();
    steps.forEach((step, i) => {
      if (i > currentStep) return;
      if (step.left === step.mid && step.leftDeviation === 0) set.add(step.left);
      if (step.mid + 1 === step.right && step.rightDeviation === 0) set.add(step.right);
    });
    return set;
  }, [steps, currentStep]);

  const calculatePay = (assetType, severity) => {
    const rates = {
      streetlight: { warning: 800, critical: 1500 },
      road: { warning: 5000, critical: 12000 },
      waterpipe: { warning: 3000, critical: 8000 },
      sewer: { warning: 2500, critical: 6000 }
    };
    return rates[assetType]?.[severity] || 1500;
  };

  const handleGenerateReport = async () => {
    setReportLoading(true);
    setReportText('');

    const token = localStorage.getItem('urbanguard_token');
    const actualDev = faultRecord ? faultRecord.iotDeviation : 35; // mock dev if manual

    try {
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      const response = await fetch(
        `${baseUrl}/api/ai/fault-report/${selectedAsset.id}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            asset_id: selectedAsset.id,
            asset_name: selectedAsset.name,
            asset_type: selectedAsset.type,
            area: selectedAsset.location?.area || selectedAsset.area || (faultRecord?.area) || 'System Area',
            iot_actual: config.expectedPerUnit * (1 - actualDev/100),
            iot_expected: config.expectedPerUnit,
            iot_deviation: actualDev,
            age: selectedAsset.age || 5,
            lifespan: selectedAsset.expected_lifespan_years || 10,
            risk_score: anomalyData?.[selectedAsset.id] || 50,
            binary_search_result: `Fault isolated at Unit #${faultyIndex + 1} of ${config.totalUnits} units in ${steps.length} steps`,
            complaint_count: selectedAsset.complaint_count || 0,
            social_flags: selectedAsset.social_media_flags || 0
          })
        }
      );

      if (!response.ok) throw new Error('Request failed');

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value);
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              setReportLoading(false);
              return;
            }
            try {
              const parsed = JSON.parse(data);
              if (parsed.text) setReportText(prev => prev + parsed.text);
            } catch {}
          }
        }
      }
    } catch (err) {
      setReportText('Failed to generate report. Please check your GROQ_API_KEY in server/.env and try again.');
      setReportLoading(false);
    }
  };

  const handleDispatchJob = async () => {
    try {
      setDispatchStage('loading');
      
      const actualDev = faultRecord ? faultRecord.iotDeviation : 35; // mock dev if manual
      const severity = Math.abs(actualDev) > 30 ? 'critical' : 'warning';
      
      const payload = {
        asset_id: assetId,
        asset_type: assetType,
        area: faultRecord?.area || 'System Area',
        fault_description: `Binary search isolated fault at Unit #${faultyIndex + 1} out of ${config.totalUnits} units. IoT deviation: ${actualDev}%. Fault detected in ${steps.length} binary search steps.`,
        severity: severity,
        estimated_pay: calculatePay(assetType, severity),
        source: 'binary_search'
      };

      const token = localStorage.getItem('urbanguard_token');
      const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
      await axios.post(`${baseUrl}/api/jobs`, payload, {
        headers: { Authorization: `Bearer ${token}` }
      });

      setDispatchStage('success');
      setToast('Repair job dispatched successfully — contractors have been notified');
      setTimeout(() => setToast(null), 5000);
      
    } catch (err) {
      console.error(err);
      setDispatchStage('idle');
    }
  };

  const totalStepsTarget = useMemo(() => Math.ceil(Math.log2(config.totalUnits)), [config.totalUnits]);
  
  return (
    <div className="flex flex-col gap-0" style={{ width: '100%', position: 'relative' }}>
      
      {/* Toast Notification */}
      {toast && (
        <div style={{
          position: 'fixed', bottom: '40px', right: '40px', background: '#FFFFFF',
          border: '1px solid #22C55E', borderRadius: '12px', padding: '16px 20px',
          boxShadow: '0 8px 32px rgba(34,197,94,0.2)', display: 'flex', alignItems: 'center', gap: '12px',
          zIndex: 9999, animation: 'toastSlide 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
        }}>
          <CheckCircle2 color="#22C55E" size={24} />
          <span className="font-body" style={{ color: '#1A1A1E', fontSize: '15px', fontWeight: 600 }}>{toast}</span>
        </div>
      )}

      {/* Visualiser Header Section */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '24px 28px', marginBottom: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
          <div>
            <h2 className="font-body" style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1E', letterSpacing: '-0.02em', marginBottom: '8px', lineHeight: 1 }}>
              {config.label}
            </h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span className="font-mono" style={{ background: '#F3EEFF', color: '#9D72FF', border: '1px solid #EDE9FF', fontSize: '12px', fontWeight: 700, padding: '4px 12px', borderRadius: '9999px' }}>
                {assetId}
              </span>
            </div>
            <div className="font-body" style={{ fontSize: '13px', color: '#64748B', marginTop: '4px' }}>
              {config.description}
            </div>
          </div>
          <div style={{ display: 'flex', gap: '12px' }}>
            <button
              onClick={reset}
              disabled={isRunning}
              className="font-body"
              style={{
                padding: '10px 20px', background: '#F9F9FB', border: '1.5px solid #E8E8F0', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600, color: '#64748B', cursor: isRunning ? 'not-allowed' : 'pointer',
                opacity: isRunning ? 0.5 : 1, transition: 'all 0.2s ease',
              }}
              onMouseOver={e => !isRunning && (e.currentTarget.style.borderColor = '#D8D8E8')}
              onMouseOut={e => !isRunning && (e.currentTarget.style.borderColor = '#E8E8F0')}
            >
              Reset
            </button>
            <button
              onClick={() => simulateFault(null)}
              disabled={isRunning}
              className="font-body"
              style={{
                padding: '10px 24px', background: '#9D72FF', color: 'white', border: 'none', borderRadius: '8px',
                fontSize: '14px', fontWeight: 600, boxShadow: '0 4px 12px rgba(157,114,255,0.3)',
                cursor: isRunning ? 'not-allowed' : 'pointer', opacity: isRunning ? 0.5 : 1, transition: 'background 0.2s',
              }}
              onMouseOver={e => !isRunning && (e.currentTarget.style.background = '#8B5CF6')}
              onMouseOut={e => !isRunning && (e.currentTarget.style.background = '#9D72FF')}
            >
              {isRunning ? 'Running...' : 'Run Manual Diagnostic'}
            </button>
          </div>
        </div>
      </div>

      {/* Step Progress Bar */}
      {(!compact) && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '12px', padding: '20px 24px', marginBottom: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'relative' }}>
            {Array.from({ length: totalStepsTarget }).map((_, i) => {
              const isCompleted = currentStep > i || isComplete;
              const isCurrent = currentStep === i;
              const isFuture = currentStep < i && !isComplete;
              
              let bg = '#F9F9FB', border = '#E8E8F0', color = '#94A3B8';
              if (isCompleted) { bg = '#22C55E'; border = '#22C55E'; color = 'white'; }
              else if (isCurrent) { bg = '#9D72FF'; border = '#9D72FF'; color = 'white'; }

              const lineBg = isCompleted ? '#22C55E' : '#E8E8F0';

              return (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: i === totalStepsTarget - 1 ? '0' : '1' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', position: 'relative', zIndex: 1 }}>
                    <div 
                      className="font-mono"
                      style={{
                        width: '36px', height: '36px', borderRadius: '50%',
                        background: bg, border: `2px solid ${border}`, color: color,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '14px', fontWeight: 700,
                        boxShadow: isCurrent ? '0 0 0 4px rgba(157,114,255,0.2)' : 'none',
                        transition: 'all 0.3s',
                      }}
                    >
                      {isCompleted ? <CheckCircle2 size={18} /> : i + 1}
                    </div>
                    <span 
                      className="font-body" 
                      style={{ 
                        position: 'absolute', top: '100%', marginTop: '6px', whiteSpace: 'nowrap',
                        fontSize: '12px', fontWeight: isCurrent ? 600 : 500, color: isCurrent ? '#9D72FF' : '#64748B' 
                      }}
                    >
                      {steps[i] ? `Split ${steps[i].left+1}–${steps[i].right+1}` : `Step ${i+1}`}
                    </span>
                  </div>
                  {i < totalStepsTarget - 1 && (
                    <div style={{ height: '2px', background: lineBg, flex: 1, margin: '0 -4px', position: 'relative', top: '-12px', transition: 'background 0.3s' }} />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Main Diagram Area */}
      <div style={{ background: '#F9F9FB', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '32px', marginBottom: '16px', overflow: 'hidden' }}>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'nowrap', width: '100%' }}>
          {Array.from({ length: config.totalUnits }).map((_, i) => {
            const currentReading = readings.length > 0 ? readings[i] : config.expectedPerUnit;
            let state = 'future'; // future, active, eliminated, fault, healthy
            let faultSide = null;
            let inLeftHalf = false;
            let inRightHalf = false;

            if (isComplete) {
              if (i === faultyIndex) state = 'fault';
              else if (confirmedHealthy.has(i)) state = 'healthy';
              else state = 'eliminated';
            } else if (currentSearchState) {
              const { left, right, mid } = currentSearchState;
              faultSide = currentSearchState.faultSide;
              const inSearchWindow = i >= left && i <= right;
              
              if (!inSearchWindow) {
                state = 'eliminated';
              } else {
                state = 'active';
                inLeftHalf = i >= left && i <= mid;
                inRightHalf = i > mid && i <= right;
              }
            } else {
               // Started simulation but wait 500ms before step 1 OR resting state
               state = 'active';
            }

            // Styles mapping
            // Default eliminated
            let width = '32px';
            let height = '32px';
            let bgClass = '#E8E8F0';
            let borderClass = '1.5px solid #E8E8F0';
            let opacity = 0.25;
            let textColor = '#1A1A1E';
            let labelColor = '#94A3B8';
            let boxShadow = 'none';

            if (state === 'active') {
              width = '64px';
              height = '72px';
              opacity = 1;
              bgClass = '#FFFFFF';
              borderClass = '1.5px solid #E8E8F0';
              
              if (faultSide === 'left') {
                 if (inRightHalf) {
                    bgClass = '#F0FDF4'; 
                    borderClass = '2px solid #22C55E'; 
                 }
                 if (inLeftHalf) {
                    bgClass = '#FFF5F5';
                    borderClass = '2px solid #EF4444';
                    boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
                 }
              } else if (faultSide === 'right') {
                 if (inLeftHalf) {
                    bgClass = '#F0FDF4'; 
                    borderClass = '2px solid #22C55E'; 
                 }
                 if (inRightHalf) {
                    bgClass = '#FFF5F5';
                    borderClass = '2px solid #EF4444';
                    boxShadow = '0 0 0 3px rgba(239,68,68,0.1)';
                 }
              }
            } else if (state === 'fault') {
              width = '72px';
              height = '80px';
              opacity = 1;
              bgClass = '#EF4444';
              borderClass = 'none';
              textColor = '#FFFFFF';
              labelColor = 'rgba(255,255,255,0.7)';
              boxShadow = '0 8px 24px rgba(239,68,68,0.3)';
            } else if (state === 'healthy') {
              width = '32px';
              height = '32px';
              opacity = 0.5;
              bgClass = '#F0FDF4';
              borderClass = '1.5px solid #22C55E';
            } else if (state === 'future') {
              width = '64px';
              height = '72px';
              opacity = 1;
              bgClass = '#FFFFFF';
            }

            return (
              <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', transition: 'all 400ms ease-in-out', width: width, flexShrink: 0, justifyContent: 'center' }}>
                <div
                  style={{
                    width: width, height: height, borderRadius: '10px',
                    border: borderClass, background: bgClass,
                    boxShadow: boxShadow, display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center', gap: '2px',
                    transition: 'all 400ms ease-in-out', opacity: opacity,
                    overflow: 'hidden'
                  }}
                >
                  {(state === 'active' || state === 'future' || state === 'fault') && (
                    <>
                      <span className="font-mono" style={{ fontSize: '10px', fontWeight: 600, color: labelColor }}>
                        {i + 1}
                      </span>
                      <span className="font-mono" style={{ fontSize: '20px', fontWeight: 800, color: textColor, lineHeight: 1 }}>
                        {currentReading}
                      </span>
                      <span className="font-body" style={{ fontSize: '10px', color: labelColor }}>
                        {config.unit}
                      </span>
                    </>
                  )}
                </div>
                {state === 'fault' && (
                  <div className="font-body" style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '11px', fontWeight: 700, color: '#EF4444', marginTop: '8px', letterSpacing: '0.06em' }}>
                    <AlertTriangle size={12} /> FAULT
                  </div>
                )}
              </div>
            );
          })}
        </div>
        
        {/* Reading Summary Row */}
        {currentSearchState && (
          <div className="font-mono" style={{ marginTop: '24px', fontSize: '12px', color: '#64748B', display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <span>Active window: Units {currentSearchState.left+1}–{currentSearchState.right+1}</span>
            <span>Expected: {currentSearchState.leftExpected + currentSearchState.rightExpected}{config.unit}</span>
            <span>
              Deviation: <span style={{ color: (Math.abs(currentSearchState.leftDeviation) > 20 || Math.abs(currentSearchState.rightDeviation) > 20) ? '#EF4444' : 'inherit' }}>
                {Math.max(Math.abs(currentSearchState.leftDeviation), Math.abs(currentSearchState.rightDeviation))}%
              </span>
            </span>
          </div>
        )}
      </div>

      {/* Search Log Section */}
      {(!compact && steps.length > 0) && (
        <div style={{ marginBottom: '24px' }}>
          <div className="font-body" style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.12em', textTransform: 'uppercase', marginBottom: '16px' }}>
            SEARCH LOG
          </div>
          <div style={{ display: 'flex', flexDirection: 'column-reverse', gap: '12px' }}>
            {steps.map((step, i) => {
              if (i > currentStep) return null;
              
              const getDevColor = (dev) => {
                const absDev = Math.abs(dev);
                if (absDev === 0) return '#16A34A'; 
                if (absDev < 15) return '#D97706'; 
                return '#DC2626'; 
              };

              return (
                <div key={i} className="animate-step" style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '10px', padding: '20px 24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                    <span className="font-body" style={{ background: '#F3EEFF', color: '#9D72FF', fontSize: '11px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
                      Step {step.step}
                    </span>
                    <span className="font-body" style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1E' }}>
                      Split {step.left + 1}–{step.right + 1}
                    </span>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                    <div style={{ background: '#F9F9FB', border: '1px solid #E8E8F0', borderRadius: '8px', padding: '14px 16px' }}>
                      <span className="font-body" style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        L: {step.left + 1}–{step.mid + 1}
                      </span>
                      <div className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1E', marginBottom: '4px' }}>
                        {step.leftSum}{config.unit} <span className="font-body" style={{ color: '#94A3B8', fontWeight: 400, fontSize: '13px' }}>(exp: {step.leftExpected})</span>
                      </div>
                      <div className="font-body" style={{ fontSize: '13px', fontWeight: 700, color: getDevColor(step.leftDeviation) }}>
                        {step.leftDeviation}% dev
                      </div>
                    </div>
                    <div style={{ background: '#F9F9FB', border: '1px solid #E8E8F0', borderRadius: '8px', padding: '14px 16px' }}>
                      <span className="font-body" style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', display: 'block', marginBottom: '6px' }}>
                        R: {step.mid + 2}–{step.right + 1}
                      </span>
                      <div className="font-mono" style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1E', marginBottom: '4px' }}>
                        {step.rightSum}{config.unit} <span className="font-body" style={{ color: '#94A3B8', fontWeight: 400, fontSize: '13px' }}>(exp: {step.rightExpected})</span>
                      </div>
                      <div className="font-body" style={{ fontSize: '13px', fontWeight: 700, color: getDevColor(step.rightDeviation) }}>
                        {step.rightDeviation}% dev
                      </div>
                    </div>
                  </div>

                  <div className="font-body" style={{ fontSize: '13px', fontWeight: 600, color: '#EF4444', marginTop: '14px', paddingTop: '14px', borderTop: '1px solid #E8E8F0', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    {step.faultSide === 'right' ? '→ Fault detected in RIGHT half' : '← Fault detected in LEFT half'}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Fault Detected Result Card */}
      {(isComplete && !compact) && (
        <div className="animate-step" style={{ background: '#FFF5F5', border: '2px solid #EF4444', borderRadius: '16px', padding: '48px 40px', textAlign: 'center', marginTop: '8px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <AlertTriangle size={40} color="#EF4444" />
          <h3 className="font-display" style={{ fontSize: '48px', fontWeight: 800, color: '#EF4444', letterSpacing: '-0.02em', margin: '16px 0 8px', lineHeight: 1 }}>
            FAULT DETECTED
          </h3>
          <p className="font-body" style={{ fontSize: '18px', fontWeight: 600, color: '#1A1A1E', margin: '0 0 32px 0' }}>
            {config.faultLabel} #{faultyIndex + 1} — {assetName}
          </p>
          
          <div style={{ display: 'flex', justifyContent: 'center', gap: '56px', marginBottom: '40px' }}>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="font-body" style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>TOTAL CHECKED</span>
              <span className="font-mono" style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1E' }}>{config.totalUnits}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="font-body" style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>STEPS</span>
              <span className="font-mono" style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1E' }}>{steps.length}</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span className="font-body" style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '6px' }}>FAULTY UNIT</span>
              <span className="font-mono" style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1E' }}>#{faultyIndex + 1}</span>
            </div>
          </div>
          
          <div style={{ width: '100%', maxWidth: '380px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button 
              onClick={handleGenerateReport}
              className="font-body cursor-pointer" 
              style={{ background: '#9D72FF', color: 'white', borderRadius: '10px', padding: '16px', fontSize: '15px', fontWeight: 600, width: '100%', border: 'none', boxShadow: '0 4px 16px rgba(157,114,255,0.3)', transition: 'background 0.2s' }} 
              onMouseOver={e => (e.currentTarget.style.background = '#8B5CF6')} 
              onMouseOut={e => (e.currentTarget.style.background = '#9D72FF')}
            >
              Generate AI Fault Report
            </button>
            <button 
              onClick={handleDispatchJob}
              disabled={dispatchStage !== 'idle'}
              className="font-body cursor-pointer" 
              style={{ background: dispatchStage === 'success' ? '#22C55E' : '#EF4444', color: 'white', opacity: dispatchStage === 'loading' ? 0.7 : 1, borderRadius: '10px', padding: '16px', fontSize: '15px', fontWeight: 600, width: '100%', border: 'none', boxShadow: dispatchStage === 'success' ? 'none' : '0 4px 16px rgba(239,68,68,0.2)', transition: 'background 0.2s' }}
            >
              {dispatchStage === 'success' ? 'Job Dispatched ✓' : dispatchStage === 'loading' ? 'Dispatching...' : 'Dispatch Repair Job'}
            </button>
          </div>
        </div>
      )}

      {/* AI Report Section */}
      {(reportText || reportLoading) && (
        <div style={{
          background: '#FFFFFF', border: reportLoading ? '2px solid #9D72FF' : '1px solid #E8E8F0', borderRadius: '16px',
          padding: '24px', marginTop: '16px', animation: reportLoading ? 'pulseBorder 2s infinite' : 'none'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
             <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
               <span className="font-mono bg-accent text-white" style={{ fontSize: '11px', fontWeight: 800, padding: '2px 6px', borderRadius: '4px' }}>AI</span>
               <span className="font-mono" style={{ fontSize: '11px', color: '#64748B', fontWeight: 700, letterSpacing: '0.08em' }}>AI FAULT REPORT</span>
               {reportLoading && (
                 <div style={{ display: 'flex', gap: '4px', marginLeft: '8px' }}>
                   <span className="dot" style={{ width: '4px', height: '4px', background: '#9D72FF', borderRadius: '50%' }}></span>
                   <span className="dot2" style={{ width: '4px', height: '4px', background: '#9D72FF', borderRadius: '50%' }}></span>
                   <span className="dot3" style={{ width: '4px', height: '4px', background: '#9D72FF', borderRadius: '50%' }}></span>
                 </div>
               )}
             </div>
             {!reportLoading && reportText && (
               <button
                 className="font-body"
                 onClick={() => {
                   navigator.clipboard.writeText(reportText);
                   setToast('Report copied to clipboard!');
                   setTimeout(() => setToast(null), 3000);
                 }}
                 style={{ background: 'none', border: '1.5px solid #E8E8F0', padding: '6px 12px', borderRadius: '6px', fontSize: '12px', fontWeight: 600, color: '#1A1A1E', cursor: 'pointer' }}
               >
                 Copy Report
               </button>
             )}
          </div>
          <div>
            <MarkdownRenderer content={reportText} />
          </div>
        </div>
      )}

      <style>{`
        @keyframes customFadeIn {
          0% { opacity: 0; transform: translateY(8px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        @keyframes toastSlide {
          0% { opacity: 0; transform: translateY(20px); }
          100% { opacity: 1; transform: translateY(0); }
        }
        .animate-step { animation: customFadeIn 0.3s ease-out forwards; }

        @keyframes pulseBorder {
          0% { border-color: #E8E8F0; box-shadow: 0 0 0 0 rgba(157, 114, 255, 0.4); }
          50% { border-color: #9D72FF; box-shadow: 0 0 0 4px rgba(157, 114, 255, 0.1); }
          100% { border-color: #E8E8F0; box-shadow: 0 0 0 0 rgba(157, 114, 255, 0); }
        }
        
        .dot { animation: bounce 1.4s infinite ease-in-out both; }
        .dot2 { animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.2s; }
        .dot3 { animation: bounce 1.4s infinite ease-in-out both; animation-delay: 0.4s; }
        
        @keyframes bounce {
          0%, 80%, 100% { transform: scale(0); }
          40% { transform: scale(1); }
        }
      `}</style>
    </div>
  );
}
