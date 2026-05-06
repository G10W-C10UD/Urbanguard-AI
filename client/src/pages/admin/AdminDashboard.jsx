// Admin Dashboard Overview — redesigned compact, data-dense layout
import { useMemo, useState } from 'react';
import { useAssets } from '../../context/AssetContext.jsx';
import DailyDigest from '../../components/ai/DailyDigest.jsx';
import { HealthTimeline, HotspotAreas, DetectionMethods, JobActivity, HealthRadar } from '../../components/charts/DashboardCharts.jsx';
import { Building2, CheckCircle, AlertTriangle, Siren, Wrench, Briefcase, MessageSquare, Sparkles, ChevronRight } from 'lucide-react';

/* ─── Compact Stat Card ─── */
function StatCard({ label, value, icon: Icon, bg, iconColor, numColor, borderColor }) {
  return (
    <div style={{
      background: '#FFFFFF',
      border: '1px solid #E8E8F0',
      borderRadius: 12,
      padding: '16px 18px',
      borderBottom: `3px solid ${borderColor}`,
    }}>
      <div style={{
        width: 32, height: 32, borderRadius: 8, background: bg, color: iconColor,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        {Icon && <Icon size={16} />}
      </div>
      <div className="font-body" style={{
        fontSize: 10, fontWeight: 700, color: '#64748B', letterSpacing: '0.06em',
        textTransform: 'uppercase', marginTop: 10, marginBottom: 4,
      }}>{label}</div>
      <div className="font-body" style={{
        fontSize: 28, fontWeight: 800, lineHeight: 1, color: numColor,
      }}>{value}</div>
    </div>
  );
}

/* ─── Alert Ticker with LIVE pulse ─── */
function AlertTicker({ assets }) {
  const tickerAlerts = useMemo(() => {
    return assets
      .filter(a => a.status === 'critical' || a.status === 'warning')
      .map(a => ({ label: 'ALERT', id: a.id, area: a.area, level: a.status.toUpperCase() }));
  }, [assets]);

  const items = useMemo(() => tickerAlerts.length > 0 ? [...tickerAlerts, ...tickerAlerts, ...tickerAlerts] : [], [tickerAlerts]);

  return (
    <div style={{ background: '#FFF8F8', border: '1px solid #FEE2E2', borderRadius: 8, overflow: 'hidden', marginBottom: 24 }}>
      <div className="flex items-center h-12">
        <div className="flex-shrink-0 flex items-center gap-2 px-5 z-10 h-full" style={{ background: '#FFF8F8' }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <span className="animate-pulse" style={{ width: 6, height: 6, borderRadius: '50%', background: '#EF4444', display: 'inline-block' }} />
            <span style={{ background: '#EF4444', color: 'white', borderRadius: 9999, fontSize: 11, fontWeight: 700, padding: '3px 10px' }}>LIVE</span>
          </span>
        </div>
        <div className="ticker-track flex-1 overflow-hidden">
          <div className="ticker-content">
            {items.map((item, i) => (
              <span key={i} className="inline-flex items-center gap-2 px-3">
                <span className={`font-body text-xs font-bold ${item.level === 'CRITICAL' ? 'text-[#EF4444]' : 'text-[#F59E0B]'}`}>{item.label}</span>
                <span className="font-body font-bold text-xs" style={{ color: '#94A3B8' }}>·</span>
                <span className="font-body text-xs" style={{ color: '#1A1A1E' }}>{item.id}</span>
                <span className="font-body font-bold text-xs" style={{ color: '#64748B' }}>{item.area}</span>
                <span className={`font-body font-bold px-2 py-0.5 rounded-full ${item.level === 'CRITICAL' ? 'bg-[#FEE2E2] text-[#EF4444]' : 'bg-[#FEF3C7] text-[#F59E0B]'}`} style={{ fontSize: 10 }}>{item.level}</span>
                <span className="font-body font-bold text-xs px-1" style={{ color: '#94A3B8' }}>·</span>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Activity Feed (compact, 8 items) ─── */
const activityEvents = [
  { type: 'complaint', text: 'New complaint received for SL-010 Mylapore — streetlight outage reported by citizen', time: '2 min ago' },
  { type: 'critical', text: 'CRITICAL: WP-003 Adyar pipeline flow dropped below 60% of expected rate', time: '5 min ago' },
  { type: 'job_dispatched', text: 'Job #J-042 dispatched to contractor team for RD-001 GST Road pothole repair', time: '8 min ago' },
  { type: 'sensor', text: 'Sensor alert: SW-008 Egmore sewer flow deviation exceeds 15% threshold', time: '12 min ago' },
  { type: 'job_completed', text: 'Job #J-038 completed — SL-022 Chetpet streetlight replaced and verified', time: '18 min ago' },
  { type: 'complaint', text: 'Complaint filed for RD-007 Arcot Road — road surface deterioration near junction', time: '22 min ago' },
  { type: 'critical', text: 'CRITICAL: SL-014 Ambattur industrial light power consumption at 28% of expected', time: '25 min ago' },
  { type: 'job_dispatched', text: 'Job #J-043 dispatched for WP-011 Guindy pipeline inspection and repair', time: '30 min ago' },
];

const eventTypeConfig = {
  complaint: { label: 'Complaint', dotColor: '#7C3AED', badgeBg: '#EDE9FF', badgeColor: '#7C3AED' },
  critical: { label: 'Critical Alert', dotColor: '#DC2626', badgeBg: '#FEE2E2', badgeColor: '#DC2626' },
  job_dispatched: { label: 'Job Dispatched', dotColor: '#2563EB', badgeBg: '#DBEAFE', badgeColor: '#2563EB' },
  sensor: { label: 'Sensor Alert', dotColor: '#D97706', badgeBg: '#FEF3C7', badgeColor: '#D97706' },
  job_completed: { label: 'Job Completed', dotColor: '#16A34A', badgeBg: '#DCFCE7', badgeColor: '#16A34A' },
};

/* ─── Main Dashboard ─── */
export default function AdminDashboard() {
  const { assets, lastUpdated } = useAssets();

  if (!assets || assets.length === 0) return <div className="p-8 font-body" style={{ color: '#1A1A1E' }}>Loading Live Data...</div>;

  const healthy = assets.filter(a => a.status === 'healthy').length;
  const warning = assets.filter(a => a.status === 'warning').length;
  const critical = assets.filter(a => a.status === 'critical').length;
  const repair = assets.filter(a => a.status === 'repair').length;

  const hour = new Date().getHours();
  let greeting = 'Good evening';
  if (hour < 12) greeting = 'Good morning';
  else if (hour < 18) greeting = 'Good afternoon';

  const fullDate = new Date().toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  return (
    <div>
      {/* PART 7.1 — Page Header (compact 60px) */}
      <div style={{ marginBottom: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', height: 60 }}>
        <div>
          <p className="font-body" style={{ fontSize: 13, color: '#64748B', margin: 0 }}>{greeting}, Admin</p>
          <h1 className="font-body" style={{ fontSize: 24, fontWeight: 800, color: '#1A1A1E', letterSpacing: '-0.02em', margin: 0 }}>Dashboard Overview</h1>
        </div>
        <div className="font-body" style={{ fontSize: 13, color: '#64748B' }}>{fullDate}</div>
      </div>

      {/* PART 6 — AI Digest (collapsed by default) */}
      <DailyDigest />

      {/* PART 7.3 — Critical Alert Banner */}
      {critical > 0 && (
        <div style={{
          background: '#FFF5F5', border: '1px solid #FECACA', borderRadius: 12,
          padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          marginBottom: 16,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <Siren size={18} color="#DC2626" />
            <span className="font-body" style={{ fontSize: 14, fontWeight: 600, color: '#DC2626' }}>
              {critical} assets require immediate attention across Chennai
            </span>
          </div>
          <button style={{ background: 'transparent', border: 'none', color: '#DC2626', fontSize: 13, fontWeight: 600, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4, padding: 0 }}>
            View Critical Assets <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* PART 1 — 8 Compact Stat Cards in single row */}
      <div id="stat-cards" style={{
        display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 12, marginBottom: 20,
      }}>
        <StatCard label="Total Assets" value={100} icon={Building2} bg="#EDE9FF" iconColor="#7C3AED" numColor="#1A1A1E" borderColor="#9D72FF" />
        <StatCard label="Healthy" value={healthy} icon={CheckCircle} bg="#DCFCE7" iconColor="#16A34A" numColor="#16A34A" borderColor="#22C55E" />
        <StatCard label="Warning" value={warning} icon={AlertTriangle} bg="#FEF3C7" iconColor="#D97706" numColor="#D97706" borderColor="#F59E0B" />
        <StatCard label="Critical" value={critical} icon={Siren} bg="#FEE2E2" iconColor="#DC2626" numColor="#DC2626" borderColor="#EF4444" />
        <StatCard label="Under Repair" value={repair} icon={Wrench} bg="#DBEAFE" iconColor="#2563EB" numColor="#2563EB" borderColor="#3B82F6" />
        <StatCard label="Open Jobs" value={7} icon={Briefcase} bg="#FEF3C7" iconColor="#D97706" numColor="#D97706" borderColor="#F59E0B" />
        <StatCard label="Today's Complaints" value={4} icon={MessageSquare} bg="#F3EEFF" iconColor="#7C3AED" numColor="#7C3AED" borderColor="#9D72FF" />
        <StatCard label="AI Alerts" value={12} icon={Sparkles} bg="#F3EEFF" iconColor="#7C3AED" numColor="#7C3AED" borderColor="#9D72FF" />
      </div>

      {/* PART 4 — Live Ticker */}
      <AlertTicker assets={assets} />

      {/* PART 2 — Main Chart Area: 60/40 split */}
      <div id="health-charts" style={{ display: 'grid', gridTemplateColumns: '60fr 40fr', gap: 16, marginBottom: 16 }}>
        <HealthTimeline assets={assets} />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <HotspotAreas assets={assets} />
          <DetectionMethods />
        </div>
      </div>

      {/* PART 3 — Secondary Chart Area: 50/50 */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
        <JobActivity />
        <HealthRadar assets={assets} />
      </div>

      {/* PART 5 — Recent Activity Feed (full width, 8 items) */}
      <div id="activity-feed">
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 }}>
          <h2 className="font-body" style={{ fontSize: 13, fontWeight: 700, letterSpacing: '0.08em', color: '#64748B', textTransform: 'uppercase', margin: 0 }}>RECENT ACTIVITY</h2>
          <span className="font-body" style={{ fontSize: 13, fontWeight: 600, color: '#7C3AED', cursor: 'pointer' }}>View All →</span>
        </div>
        <div style={{ background: '#FFF', border: '1px solid #E8E8F0', borderRadius: 16, overflow: 'hidden' }}>
          {activityEvents.map((event, idx) => {
            const config = eventTypeConfig[event.type];
            return (
              <div key={idx} style={{
                display: 'flex', alignItems: 'center', gap: 14,
                padding: '0 20px', height: 56,
                borderBottom: idx < activityEvents.length - 1 ? '1px solid #F4F4F8' : 'none',
              }}>
                <span className={event.type === 'critical' ? 'animate-pulse' : ''} style={{
                  width: 8, height: 8, borderRadius: '50%', backgroundColor: config.dotColor, flexShrink: 0,
                }} />
                <span className="font-body" style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1E', flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {event.text}
                </span>
                <span className="font-body" style={{ fontSize: 11, color: '#94A3B8', whiteSpace: 'nowrap', marginRight: 8 }}>{event.time}</span>
                <span className="font-body" style={{
                  fontSize: 10, fontWeight: 600, padding: '3px 10px', borderRadius: 6, whiteSpace: 'nowrap',
                  background: config.badgeBg, color: config.badgeColor,
                }}>{config.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
