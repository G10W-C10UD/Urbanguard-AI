import React from 'react';
import { RadialBarChart, RadialBar, ResponsiveContainer } from 'recharts';
import { useAssets } from '../../context/AssetContext.jsx';
import { getRiskColor, CHENNAI_SEASONS } from '../../utils/anomalyDetection.js';
import { useGroqStream } from '../../hooks/useGroqStream';
import StreamingText from '../ai/StreamingText';

export default function AnomalyPanel({ assetId }) {
  const { anomalyData } = useAssets();
  const { text, loading, error, startStream } = useGroqStream();
  const data = anomalyData[assetId];

  if (!data) return <div className="font-body text-sm" style={{ color: '#1A1A1E' }}>Loading Anomaly Data...</div>;

  const color = getRiskColor(data.riskLevel);
  const chartData = [{ name: 'Risk', value: data.riskScore, fill: color }];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div>
        <span className="font-body" style={{ fontSize: '11px', letterSpacing: '0.05em', color: '#64748B', fontWeight: 700 }}>
          PREDICTIVE ANOMALY DETECTION
        </span>
      </div>

      {/* Risk Score */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ position: 'relative', width: '160px', height: '160px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <RadialBarChart
              cx="50%"
              cy="50%"
              innerRadius="70%"
              outerRadius="100%"
              barSize={10}
              data={chartData}
              startAngle={90}
              endAngle={-270}
            >
              <RadialBar
                minAngle={15}
                background={{ fill: '#F4F4F8' }}
                clockWise
                dataKey="value"
                cornerRadius={5}
              />
            </RadialBarChart>
          </ResponsiveContainer>
          <div style={{ position: 'absolute', inset: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
            <span className="font-body" style={{ fontSize: '40px', fontWeight: 800, color: '#1A1A1E', lineHeight: 1 }}>
              {data.riskScore}
            </span>
          </div>
        </div>
        <div className="font-body" style={{ marginTop: '16px', color: color, fontSize: '14px', fontWeight: 700, letterSpacing: '0.05em' }}>
          {data.riskLevel.toUpperCase()} RISK
        </div>
      </div>

      {/* Factor cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '10px', padding: '16px' }}>
          <div className="font-body" style={{ fontSize: '12px', marginBottom: '8px', color: '#64748B' }}>Age Factor</div>
          <div className="font-body" style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#1A1A1E' }}>
            {Math.round(data.ageFactor * 100)}%
          </div>
          <div style={{ height: '4px', background: '#F4F4F8', borderRadius: '2px', marginBottom: '8px', overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${data.ageFactor * 100}%`, background: '#94A3B8' }} />
          </div>
          <div className="font-body" style={{ fontSize: '10px', color: '#94A3B8' }}>
            {data.age} years old of {data.expectedLifespan} year lifespan<br/>
            Installed: {data.installYear}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '10px', padding: '16px' }}>
          <div className="font-body" style={{ fontSize: '12px', marginBottom: '8px', color: '#64748B' }}>Weather Factor</div>
          <div className="font-body" style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#1A1A1E' }}>
            {Math.round(data.weatherFactor * 100)}%
          </div>
          <div className="font-body" style={{ fontSize: '10px', color: '#94A3B8' }}>
            Season: {data.season}<br/>
            Impact level: {data.weatherFactor >= 0.7 ? 'High' : data.weatherFactor >= 0.4 ? 'Medium' : 'Low'}
          </div>
        </div>

        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '10px', padding: '16px' }}>
          <div className="font-body" style={{ fontSize: '12px', marginBottom: '8px', color: '#64748B' }}>Base Decline</div>
          <div className="font-body" style={{ fontSize: '20px', fontWeight: 800, marginBottom: '8px', color: '#1A1A1E' }}>
            10%
          </div>
          <div className="font-body" style={{ fontSize: '10px', color: '#94A3B8' }}>
            Standard annual degradation rate
          </div>
        </div>
      </div>

      {/* Risk formula */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '10px', padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
        <div className="font-body" style={{ background: '#F9F9FB', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          {data.ageFactor} × 40%
        </div>
        <span className="font-body" style={{ color: '#94A3B8' }}>+</span>
        <div className="font-body" style={{ background: '#F9F9FB', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          {data.weatherFactor} × 40%
        </div>
        <span className="font-body" style={{ color: '#94A3B8' }}>+</span>
        <div className="font-body" style={{ background: '#F9F9FB', padding: '6px 10px', borderRadius: '6px', fontSize: '12px', color: '#64748B', fontWeight: 600 }}>
          0.1 × 20%
        </div>
        <span className="font-body" style={{ color: '#94A3B8' }}>=</span>
        <div className="font-body" style={{ background: color + '15', color: color, padding: '6px 10px', borderRadius: '6px', fontSize: '12px', fontWeight: 700 }}>
          {data.riskScore}/100
        </div>
      </div>

      {/* Predicted failure */}
      <div style={{ borderTop: '1px solid #E8E8F0', paddingTop: '20px', marginTop: '4px' }}>
        <span className="font-body" style={{ fontSize: '11px', letterSpacing: '0.05em', display: 'block', marginBottom: '8px', color: '#EF4444', fontWeight: 700 }}>
          PREDICTED FAILURE WINDOW
        </span>
        <div className="font-body" style={{ fontSize: '32px', fontWeight: 800, color: '#1A1A1E' }}>
          {new Date(data.predictedFailureDate).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
        </div>
        <div className="font-body" style={{ fontSize: '14px', marginTop: '4px', color: '#64748B' }}>
          {data.monthsRemaining} months remaining
        </div>
        
        {data.monthsRemaining < 6 && (
          <div style={{ marginTop: '16px', background: '#FEE2E2', border: '1px solid #EF4444', borderRadius: '8px', padding: '12px', display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
            <span className="mt-0.5">⚠️</span>
            <div>
              <div className="font-body" style={{ fontSize: '12px', fontWeight: 700, color: '#EF4444' }}>URGENT ACTION REQUIRED</div>
              <div className="font-body" style={{ fontSize: '13px', marginTop: '2px', color: '#1A1A1E' }}>Asset approaching end of expected lifespan. Schedule replacement.</div>
            </div>
          </div>
        )}
      </div>

      {/* Weather Context */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '10px', padding: '16px', display: 'flex', gap: '16px' }}>
        <div style={{ fontSize: '24px' }}>
          {data.season.includes('Monsoon') ? '🌧️' : data.season.includes('Summer') ? '☀️' : '🌤️'}
        </div>
        <div>
          <div className="font-body" style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1E' }}>{data.season} Analysis</div>
          <div className="font-body" style={{ fontSize: '12px', marginTop: '4px', color: '#64748B' }}>
            This weather pattern historically impacts {data.type || 'this asset'} systems with a {data.weatherFactor >= 0.7 ? 'high' : data.weatherFactor >= 0.4 ? 'moderate' : 'low'} degradation multiplier.
          </div>
        </div>
      </div>

      {/* AI Prediction Section */}
      <div style={{ borderTop: '1px solid #E8E8F0', paddingTop: '20px' }}>
        <div className="flex items-center gap-2 mb-4">
          <span className="font-body" style={{ fontSize: '11px', letterSpacing: '0.05em', color: '#9D72FF', fontWeight: 700 }}>
            AI PREDICTION
          </span>
          <span className="text-white text-[10px] px-[6px] py-[2px] rounded font-body font-bold" style={{ background: '#9D72FF' }}>AI</span>
        </div>
        
        {(!text && !loading) && (
          <button
            onClick={() => startStream(`/api/ai/prediction/${assetId}`)}
            className="w-full px-6 py-3 rounded-full transition-colors font-body text-sm font-medium mb-4"
            style={{ background: '#FFFFFF', border: '1px solid #9D72FF', color: '#9D72FF' }}
            onMouseOver={e => { e.currentTarget.style.background = '#9D72FF'; e.currentTarget.style.color = 'white'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.color = '#9D72FF'; }}
          >
            GET AI PREDICTION
          </button>
        )}

        {(loading || text || error) && (
          <div className="mt-4">
            <StreamingText text={text} loading={loading} error={error} />
          </div>
        )}
      </div>
    </div>
  );
}
