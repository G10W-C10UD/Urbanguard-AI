// Dashboard chart components for AdminDashboard redesign
import { useMemo } from 'react';
import {
  AreaChart, Area, BarChart, Bar, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell, Legend
} from 'recharts';

/* ─── Shared tooltip ─── */
function ChartTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div style={{ background: '#FFF', border: '1px solid #E8E8F0', borderRadius: 8, padding: '8px 12px', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' }}>
      <p className="font-body" style={{ fontSize: 11, color: '#64748B', margin: 0 }}>{label}</p>
      {payload.map((p, i) => (
        <p key={i} className="font-body" style={{ fontSize: 13, fontWeight: 700, color: p.color, margin: '2px 0 0' }}>{p.name}: {p.value}</p>
      ))}
    </div>
  );
}

/* ─── 1. Asset Health Timeline (Area Chart) ─── */
export function HealthTimeline({ assets }) {
  const data = useMemo(() => {
    const now = new Date().getHours();
    const healthy = assets.filter(a => a.status === 'healthy').length;
    const critical = assets.filter(a => a.status === 'critical').length;
    return Array.from({ length: 24 }, (_, i) => {
      const hour = (now - 23 + i + 24) % 24;
      const t = (i / 23) * Math.PI * 4;
      return {
        time: `${String(hour).padStart(2, '0')}:00`,
        Healthy: Math.round(Math.max(55, Math.min(80, healthy + Math.sin(t) * 8 + (Math.random() - 0.5) * 4))),
        Critical: Math.round(Math.max(20, Math.min(45, critical + Math.sin(t + 2) * 6 + (Math.random() - 0.5) * 3)))
      };
    });
  }, [assets]);

  const peakCritical = Math.max(...data.map(d => d.Critical));
  const bestHealth = Math.max(...data.map(d => d.Healthy));

  return (
    <div style={{ background: '#FFF', border: '1px solid #E8E8F0', borderRadius: 16, padding: 24, height: '100%' }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1E', marginBottom: 4 }} className="font-body">Asset Health Trend</div>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }} className="font-body">Overall system health score over last 24 hours</div>
      <ResponsiveContainer width="100%" height={220}>
        <AreaChart data={data}>
          <CartesianGrid stroke="#F4F4F8" strokeDasharray="3 3" />
          <XAxis dataKey="time" tick={{ fontSize: 10, fill: '#94A3B8' }} tickLine={false} axisLine={false} interval={3} />
          <YAxis domain={[0, 100]} hide />
          <Tooltip content={<ChartTooltip />} />
          <Area type="monotone" dataKey="Healthy" stroke="#22C55E" fill="rgba(34,197,94,0.08)" strokeWidth={2} dot={false} />
          <Area type="monotone" dataKey="Critical" stroke="#EF4444" fill="rgba(239,68,68,0.06)" strokeWidth={2} dot={false} />
        </AreaChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 20, marginTop: 12, marginBottom: 12 }} className="font-body">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} /> Healthy <b style={{ color: '#1A1A1E' }}>{data[data.length - 1]?.Healthy}</b>
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#EF4444' }} /> Critical <b style={{ color: '#1A1A1E' }}>{data[data.length - 1]?.Critical}</b>
        </span>
      </div>
      <div style={{ display: 'flex', gap: 16, borderTop: '1px solid #F4F4F8', paddingTop: 12 }} className="font-body">
        {[`Peak Critical: ${peakCritical}`, `Best Health: ${bestHealth}%`, 'Avg Response: 2.4hrs'].map((s, i) => (
          <span key={i} style={{ fontSize: 11, color: '#64748B', fontWeight: 600 }}>{s}</span>
        ))}
      </div>
    </div>
  );
}

/* ─── 2. Hotspot Areas (Horizontal Bar) ─── */
export function HotspotAreas({ assets }) {
  const data = useMemo(() => {
    const counts = {};
    assets.filter(a => a.status === 'critical').forEach(a => { counts[a.area] = (counts[a.area] || 0) + 1; });
    return Object.entries(counts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([area, count]) => ({ area, count }));
  }, [assets]);

  if (data.length === 0) {
    data.push({ area: 'No critical', count: 0 });
  }

  return (
    <div style={{ background: '#FFF', border: '1px solid #E8E8F0', borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1E', marginBottom: 4 }} className="font-body">Hotspot Areas</div>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }} className="font-body">Most critical assets by zone</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
          <XAxis type="number" hide domain={[0, 'auto']} />
          <YAxis type="category" dataKey="area" tick={{ fontSize: 11, fill: '#64748B' }} width={100} tickLine={false} axisLine={false} />
          <Bar dataKey="count" fill="#EF4444" radius={[0, 4, 4, 0]} barSize={20} background={{ fill: '#F9F9FB', radius: [0, 4, 4, 0] }} label={{ position: 'right', fill: '#1A1A1E', fontSize: 12, fontWeight: 700 }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

/* ─── 3. Detection Method Breakdown ─── */
export function DetectionMethods() {
  const methods = [
    { name: 'IoT Sensors', count: 18, color: '#9D72FF', max: 18 },
    { name: 'Anomaly Detection', count: 12, color: '#F59E0B', max: 18 },
    { name: 'Citizen Complaints', count: 8, color: '#3B82F6', max: 18 },
    { name: 'Social Media', count: 5, color: '#22C55E', max: 18 },
    { name: 'Binary Search', count: 7, color: '#EF4444', max: 18 },
  ];

  return (
    <div style={{ background: '#FFF', border: '1px solid #E8E8F0', borderRadius: 16, padding: 20 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1E', marginBottom: 4 }} className="font-body">Alert Sources Today</div>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }} className="font-body">Which detection methods triggered alerts</div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
        {methods.map(m => (
          <div key={m.name}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }} className="font-body">
              <span style={{ fontSize: 12, color: '#1A1A1E', fontWeight: 500 }}>{m.name}</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1E' }}>{m.count}</span>
            </div>
            <div style={{ height: 6, borderRadius: 3, background: '#F4F4F8' }}>
              <div style={{ height: 6, borderRadius: 3, background: m.color, width: `${(m.count / m.max) * 100}%`, transition: 'width 0.6s ease' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── 4. Job Activity (Grouped Bar) ─── */
export function JobActivity() {
  const data = useMemo(() => {
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const today = new Date().getDay();
    return Array.from({ length: 7 }, (_, i) => ({
      day: days[(today - 6 + i + 7) % 7],
      Dispatched: 2 + Math.floor(Math.random() * 7),
      Completed: 1 + Math.floor(Math.random() * 6),
    }));
  }, []);

  return (
    <div style={{ background: '#FFF', border: '1px solid #E8E8F0', borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1E', marginBottom: 4 }} className="font-body">Job Dispatch Activity</div>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }} className="font-body">Jobs dispatched vs completed — last 7 days</div>
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data}>
          <CartesianGrid stroke="#F4F4F8" vertical={false} />
          <XAxis dataKey="day" tick={{ fontSize: 11, fill: '#94A3B8' }} tickLine={false} axisLine={false} />
          <YAxis hide />
          <Tooltip content={<ChartTooltip />} />
          <Bar dataKey="Dispatched" fill="#9D72FF" radius={[4, 4, 0, 0]} barSize={12} />
          <Bar dataKey="Completed" fill="#22C55E" radius={[4, 4, 0, 0]} barSize={12} />
        </BarChart>
      </ResponsiveContainer>
      <div style={{ display: 'flex', gap: 20, marginTop: 12 }} className="font-body">
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#9D72FF' }} /> Dispatched
        </span>
        <span style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 12, color: '#64748B' }}>
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22C55E' }} /> Completed
        </span>
      </div>
    </div>
  );
}

/* ─── 5. Health Radar ─── */
export function HealthRadar({ assets }) {
  const { data, overall } = useMemo(() => {
    const types = [
      { key: 'streetlight', label: 'Street Lights' },
      { key: 'road', label: 'Roads' },
      { key: 'waterpipe', label: 'Water Pipes' },
      { key: 'sewer', label: 'Sewers' },
    ];
    let totalScore = 0, totalCount = 0;
    const d = types.map(t => {
      const items = assets.filter(a => a.type === t.key);
      const avg = items.length ? Math.round(items.reduce((s, a) => s + (a.healthScore || 75), 0) / items.length) : 75;
      totalScore += avg; totalCount++;
      return { subject: t.label, score: avg, fullMark: 100 };
    });
    return { data: d, overall: totalCount ? Math.round(totalScore / totalCount) : 0 };
  }, [assets]);

  return (
    <div style={{ background: '#FFF', border: '1px solid #E8E8F0', borderRadius: 16, padding: 24 }}>
      <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1E', marginBottom: 4 }} className="font-body">Health by Asset Type</div>
      <div style={{ fontSize: 12, color: '#64748B', marginBottom: 20 }} className="font-body">Average health score per infrastructure type</div>
      <div style={{ position: 'relative' }}>
        <ResponsiveContainer width="100%" height={180}>
          <RadarChart data={data} cx="50%" cy="50%" outerRadius="70%">
            <PolarGrid stroke="#E8E8F0" />
            <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fill: '#64748B' }} />
            <Radar dataKey="score" stroke="#9D72FF" fill="rgba(157,114,255,0.2)" strokeWidth={2} />
          </RadarChart>
        </ResponsiveContainer>
        <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', textAlign: 'center' }}>
          <div className="font-body" style={{ fontSize: 20, fontWeight: 800, color: '#1A1A1E' }}>{overall}%</div>
        </div>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 12 }}>
        {data.map(d => (
          <span key={d.subject} className="font-body" style={{ background: '#F9F9FB', border: '1px solid #E8E8F0', borderRadius: 9999, padding: '4px 12px', fontSize: 12, fontWeight: 600, color: '#1A1A1E' }}>
            {d.subject}: {d.score}%
          </span>
        ))}
      </div>
    </div>
  );
}
