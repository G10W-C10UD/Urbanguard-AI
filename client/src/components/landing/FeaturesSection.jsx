// Features section — 5 detection method cards in a single row
import { Wifi, Brain, MessageSquare, Globe, Search } from 'lucide-react';

const features = [
  {
    icon: <Wifi size={20} color="#7C3AED" />,
    iconBg: '#EDE9FF',
    name: 'IoT Sensor Monitoring',
    desc: 'Real-time data from 100+ infrastructure sensors across Chennai, tracking performance metrics every 30 seconds.',
    tag: 'Real-time',
    tagBg: '#DCFCE7',
    tagColor: '#16A34A',
  },
  {
    icon: <Brain size={20} color="#D97706" />,
    iconBg: '#FEF3C7',
    name: 'Predictive Anomaly Detection',
    desc: 'AI-driven models analyse historical data to predict infrastructure failures before they happen.',
    tag: 'Predictive',
    tagBg: '#FEF3C7',
    tagColor: '#D97706',
  },
  {
    icon: <MessageSquare size={20} color="#2563EB" />,
    iconBg: '#DBEAFE',
    name: 'Citizen Complaints',
    desc: 'AI-classified citizen reports with automatic priority scoring and intelligent routing to contractors.',
    tag: 'Citizen-driven',
    tagBg: '#DBEAFE',
    tagColor: '#2563EB',
  },
  {
    icon: <Globe size={20} color="#16A34A" />,
    iconBg: '#DCFCE7',
    name: 'Social Media Intelligence',
    desc: 'AI aggregates and analyses social media mentions to detect unreported infrastructure emergencies.',
    tag: 'Intelligence',
    tagBg: '#DCFCE7',
    tagColor: '#16A34A',
  },
  {
    icon: <Search size={20} color="#DC2626" />,
    iconBg: '#FEE2E2',
    name: 'Binary Search Fault Detection',
    desc: 'Algorithmic binary search isolates exact fault locations within infrastructure segments in O(log n) time.',
    tag: 'Algorithmic',
    tagBg: '#FEE2E2',
    tagColor: '#DC2626',
  },
];

export default function FeaturesSection() {
  return (
    <section id="features" style={{ padding: '100px 80px', background: '#F9F9FB' }}>
      <div style={{ maxWidth: '1280px', margin: '0 auto' }}>
        <div style={{ textAlign: 'center', marginBottom: '56px' }}>
          <span className="font-body" style={{
            fontSize: '11px', fontWeight: 700, color: '#9D72FF',
            letterSpacing: '0.15em', display: 'block', marginBottom: '16px',
          }}>WHAT WE DO</span>
          <h2 className="font-body" style={{
            fontSize: 'clamp(28px, 4vw, 48px)', fontWeight: 800, color: '#1A1A1E',
            letterSpacing: '-0.02em', maxWidth: '700px', margin: '0 auto 16px',
          }}>
            5 Ways UrbanGuard-AI Detects Infrastructure Failure
          </h2>
          <p className="font-body" style={{
            fontSize: '16px', color: '#64748B', maxWidth: '640px', margin: '0 auto',
          }}>
            From live sensor data to AI-powered predictions — we identify faults before they become failures.
          </p>
        </div>

        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '16px',
        }}>
          {features.map((f, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF', border: '1.5px solid #E8E8F0', borderRadius: '16px',
                padding: '28px 20px', display: 'flex', flexDirection: 'column',
                transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.borderColor = '#9D72FF';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(157,114,255,0.1)';
                e.currentTarget.style.transform = 'translateY(-3px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.borderColor = '#E8E8F0';
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div style={{
                width: '48px', height: '48px', borderRadius: '12px',
                background: f.iconBg, display: 'flex', alignItems: 'center',
                justifyContent: 'center', marginBottom: '20px',
              }}>
                {f.icon}
              </div>
              <h3 className="font-body" style={{
                fontSize: '15px', fontWeight: 700, color: '#1A1A1E', marginBottom: '10px',
              }}>{f.name}</h3>
              <p className="font-body" style={{
                fontSize: '13px', color: '#64748B', lineHeight: 1.6, flex: 1,
              }}>{f.desc}</p>
              <span style={{
                fontSize: '10px', fontWeight: 700, padding: '3px 10px',
                borderRadius: '9999px', marginTop: '16px', display: 'inline-block',
                background: f.tagBg, color: f.tagColor, alignSelf: 'flex-start',
              }}>{f.tag}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
