// About section — project description with 2x2 stat cards
export default function AboutSection() {
  const stats = [
    { num: '100', label: 'Assets Monitored' },
    { num: '11', label: 'AI Features' },
    { num: '25', label: 'Areas Covered' },
    { num: '₹48K+', label: 'Pay Disbursed' },
  ];

  return (
    <section id="about" style={{
      padding: '100px 80px', background: '#F9F9FB', borderTop: '1px solid #E8E8F0',
    }}>
      <div style={{
        maxWidth: '1280px', margin: '0 auto',
        display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '80px', alignItems: 'center',
      }}>
        {/* Left — text */}
        <div>
          <span className="font-body" style={{
            fontSize: '11px', fontWeight: 700, color: '#9D72FF',
            letterSpacing: '0.15em', display: 'block', marginBottom: '16px',
          }}>ABOUT URBANGUARD-AI</span>
          <h2 className="font-body" style={{
            fontSize: '40px', fontWeight: 800, color: '#1A1A1E',
            letterSpacing: '-0.02em', marginBottom: '20px', lineHeight: 1.1,
          }}>
            Built for Chennai. Designed for the Future.
          </h2>
          <p className="font-body" style={{
            fontSize: '16px', color: '#64748B', lineHeight: 1.8, marginBottom: '20px',
          }}>
            UrbanGuard-AI is a real-time government infrastructure monitoring platform protecting Chennai&apos;s critical urban assets. We combine IoT sensor data, predictive AI, citizen intelligence, and algorithmic fault detection to identify and repair infrastructure issues before they escalate.
          </p>
          <p className="font-body" style={{
            fontSize: '16px', color: '#64748B', lineHeight: 1.8, marginBottom: '32px',
          }}>
            When a fault is detected, our Rapido-style dispatch system instantly notifies available contractors — getting repairs started faster than ever before.
          </p>
          <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
            <span className="font-body" style={{
              background: '#F3EEFF', color: '#9D72FF', borderRadius: '9999px',
              padding: '6px 16px', fontSize: '13px', fontWeight: 600,
            }}>Powered by Groq AI</span>
            <span className="font-body" style={{
              background: '#F3EEFF', color: '#9D72FF', borderRadius: '9999px',
              padding: '6px 16px', fontSize: '13px', fontWeight: 600,
            }}>openai/gpt-oss-120b</span>
          </div>
        </div>

        {/* Right — 2x2 stat grid */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px',
        }}>
          {stats.map((s, i) => (
            <div
              key={i}
              style={{
                background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px',
                padding: '28px', textAlign: 'center', transition: 'all 0.2s',
              }}
              onMouseOver={e => {
                e.currentTarget.style.boxShadow = '0 4px 16px rgba(157,114,255,0.1)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              <div className="font-body" style={{
                fontSize: '48px', fontWeight: 800, color: '#9D72FF', lineHeight: 1,
              }}>{s.num}</div>
              <div className="font-body" style={{
                fontSize: '13px', color: '#64748B', marginTop: '8px',
              }}>{s.label}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
