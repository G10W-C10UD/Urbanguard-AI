import React, { useEffect, useState } from 'react';
import { LineChart, Line, ResponsiveContainer, YAxis } from 'recharts';
import { useAssets } from '../../context/AssetContext.jsx';

export default function IoTPanel({ assetId }) {
  const { iotReadings, lastUpdated } = useAssets();
  const reading = iotReadings[assetId];
  const [history, setHistory] = useState([]);
  const [flash, setFlash] = useState(false);

  useEffect(() => {
    if (reading) {
      setFlash(true);
      setTimeout(() => setFlash(false), 500);
      setHistory(prev => {
        const next = [...prev, { time: Date.now(), value: reading.actual }];
        if (next.length > 10) return next.slice(next.length - 10);
        return next;
      });
    }
  }, [reading, lastUpdated]);

  if (!reading) return <div className="font-body text-sm" style={{ color: '#1A1A1E' }}>Loading IoT Data...</div>;

  const getStatusColor = (deviation) => {
    const abs = Math.abs(deviation);
    if (abs < 5) return '#22C55E';
    if (abs < 20) return '#F59E0B';
    return '#EF4444';
  };

  const getStatusText = (deviation) => {
    const abs = Math.abs(deviation);
    if (abs < 5) return 'HEALTHY';
    if (abs < 20) return 'WARNING';
    return 'CRITICAL';
  };

  const getStatusDesc = (deviation) => {
    const abs = Math.abs(deviation);
    if (abs < 5) return 'Reading is within normal operational parameters.';
    if (abs < 20) return 'Reading shows minor deviation from expected baseline.';
    return 'Reading is significantly deviated. Immediate attention recommended.';
  };

  const color = getStatusColor(reading.deviation);
  const status = getStatusText(reading.deviation);
  const percent = Math.min((reading.actual / reading.expected) * 100, 150);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <span className="font-body" style={{ fontSize: '11px', letterSpacing: '0.05em', color: '#64748B', fontWeight: 700 }}>
          IOT SENSOR DATA
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="w-2 h-2 rounded-full bg-[#22C55E] animate-pulse" />
          <span className="font-body" style={{ fontSize: '11px', color: '#1A1A1E', fontWeight: 600 }}>LIVE</span>
          <span className="font-body" style={{ fontSize: '11px', color: '#94A3B8' }}>
            {new Date(lastUpdated).toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* Main reading card */}
      <div
        className={`transition-all duration-300`}
        style={{
          background: flash ? '#F4F4F8' : '#FFFFFF',
          border: '1px solid #E8E8F0',
          borderRadius: '12px',
          padding: '24px'
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
          <div>
            <div className="font-body" style={{ fontSize: '14px', marginBottom: '8px', color: '#64748B' }}>
              {reading.label}
            </div>
            <div style={{ display: 'flex', alignItems: 'baseline', gap: '4px' }}>
              <span className="font-body" style={{ fontSize: '48px', fontWeight: 800, color: color }}>
                {reading.actual}
              </span>
              <span className="font-body" style={{ fontSize: '20px', color: '#94A3B8' }}>
                {reading.unit}
              </span>
            </div>
            <div className="font-body" style={{ fontSize: '12px', marginTop: '4px', color: '#94A3B8' }}>
              Expected: {reading.expected}{reading.unit}
            </div>
          </div>
          <div>
            <div
              className="font-body"
              style={{
                background: `${color}15`,
                color: color,
                padding: '6px 12px',
                borderRadius: '999px',
                fontSize: '14px',
                fontWeight: 700
              }}
            >
              {reading.deviation > 0 ? '+' : ''}{reading.deviation}%
            </div>
          </div>
        </div>

        {/* Gauge */}
        <div style={{ marginTop: '32px' }}>
          <div style={{ height: '12px', borderRadius: '6px', background: '#F4F4F8', position: 'relative', overflow: 'hidden' }}>
            <div
              style={{
                height: '100%',
                width: `${percent}%`,
                background: color,
                transition: 'width 0.5s ease-out'
              }}
            />
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '8px' }}>
            {[0, 80, 100, 120].map(val => (
              <span key={val} className="font-body" style={{ fontSize: '10px', color: '#94A3B8' }}>
                {val}%
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Status card */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '12px', padding: '20px' }}>
        <div
          className="font-body"
          style={{
            display: 'inline-block',
            color: color,
            border: `1px solid ${color}`,
            padding: '4px 12px',
            borderRadius: '999px',
            fontSize: '12px',
            fontWeight: 700,
            marginBottom: '12px'
          }}
        >
          {status}
        </div>
        <p className="font-body" style={{ fontSize: '14px', color: '#64748B' }}>
          {getStatusDesc(reading.deviation)}
        </p>
      </div>

      {/* Mini sparkline */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '12px', padding: '20px' }}>
        <span className="font-body" style={{ fontSize: '10px', letterSpacing: '0.05em', color: '#94A3B8', fontWeight: 700 }}>
          RECENT TREND
        </span>
        <div style={{ height: '80px', marginTop: '12px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={history}>
              <YAxis domain={['auto', 'auto']} hide />
              <Line
                type="monotone"
                dataKey="value"
                stroke={color}
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
