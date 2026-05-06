// Dispatch section — Rapido-style contractor dispatch feature highlight
import { AlertTriangle, Bell, CheckCircle } from 'lucide-react';

export default function DispatchSection() {
  const pills = [
    { emoji: '⚡', text: 'Real-time via Socket.io' },
    { emoji: '🤖', text: 'AI Job Briefings' },
    { emoji: '₹', text: 'Gov. Payment' },
  ];

  const steps = [
    { icon: <AlertTriangle size={20} color="#DC2626" />, label: 'Fault Detected', sub: 'Sensor anomaly triggered' },
    { icon: <Bell size={20} color="#F59E0B" />, label: 'All Contractors Notified', sub: 'Instant push via Socket.io' },
    { icon: <CheckCircle size={20} color="#22C55E" />, label: 'First to Accept Gets the Job', sub: 'Race-condition guarded' },
  ];

  return (
    <section style={{
      padding: '80px 80px',
      background: 'linear-gradient(135deg, #7C3AED 0%, #9D72FF 50%, #A78BFA 100%)',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center',
      }}>
        {/* Left — text */}
        <div>
          <span className="font-body" style={{
            fontSize: '11px', fontWeight: 700, color: 'rgba(255,255,255,0.7)',
            letterSpacing: '0.15em', display: 'block', marginBottom: '16px',
          }}>INSTANT DISPATCH</span>
          <h2 className="font-body" style={{
            fontSize: '36px', fontWeight: 800, color: 'white',
            letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: 1.15,
          }}>
            Fault Detected. Contractor Dispatched. In Seconds.
          </h2>
          <p className="font-body" style={{
            fontSize: '16px', color: 'rgba(255,255,255,0.8)', lineHeight: 1.8, marginBottom: '28px',
          }}>
            When UrbanGuard-AI detects a critical fault, it instantly notifies all available contractors — like Rapido, but for government repairs.
          </p>
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
            {pills.map((p, i) => (
              <span key={i} className="font-body" style={{
                background: 'rgba(255,255,255,0.15)', borderRadius: '9999px',
                padding: '8px 16px', fontSize: '13px', color: 'white',
                display: 'inline-flex', alignItems: 'center', gap: '6px',
              }}>
                {p.emoji} {p.text}
              </span>
            ))}
          </div>
        </div>

        {/* Right — vertical flow */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0' }}>
          {steps.map((s, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              {i > 0 && (
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', margin: '4px 0' }}>
                  <div style={{ width: '2px', height: '20px', background: 'rgba(255,255,255,0.3)' }} />
                  <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid rgba(255,255,255,0.3)' }} />
                </div>
              )}
              <div style={{
                background: 'rgba(255,255,255,0.15)', backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)', borderRadius: '12px',
                padding: '16px 20px', display: 'flex', alignItems: 'center', gap: '12px',
                width: '320px',
              }}>
                <div style={{
                  width: '40px', height: '40px', borderRadius: '10px',
                  background: 'rgba(255,255,255,0.15)', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                }}>
                  {s.icon}
                </div>
                <div>
                  <div className="font-body" style={{ fontSize: '15px', fontWeight: 700, color: 'white' }}>
                    {s.label}
                  </div>
                  <div className="font-body" style={{ fontSize: '12px', color: 'rgba(255,255,255,0.6)' }}>
                    {s.sub}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
