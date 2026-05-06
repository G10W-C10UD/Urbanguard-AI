// Binary search algorithm showcase section — visual diagram of O(log n) fault detection
import { Check } from 'lucide-react';

function BinarySearchDiagram() {
  const greenBox = { background: '#DCFCE7', border: '1.5px solid #BBF7D0' };
  const redBox = { background: '#FEE2E2', border: '1.5px solid #FECACA' };
  const faultBox = { background: '#DC2626', border: '1.5px solid #DC2626' };
  const boxBase = {
    width: '36px', height: '36px', borderRadius: '6px',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    fontSize: '10px', fontWeight: 700, transition: 'all 0.3s',
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '20px' }}>
      {/* Step label */}
      <span className="font-body" style={{ fontSize: '11px', fontWeight: 700, color: '#9D72FF', letterSpacing: '0.1em' }}>
        STEP-BY-STEP ISOLATION
      </span>

      {/* Row 1 — all 10 boxes, right 5 highlighted */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {[...Array(5)].map((_, i) => (
          <div key={`g1-${i}`} style={{ ...boxBase, ...greenBox, opacity: 0.5 }}>
            <span style={{ color: '#16A34A', fontSize: '9px' }}>✓</span>
          </div>
        ))}
        <div style={{ width: '1px', height: '24px', background: '#9D72FF', margin: '0 4px' }} />
        {[...Array(5)].map((_, i) => (
          <div key={`r1-${i}`} style={{ ...boxBase, ...redBox }}>
            <span style={{ color: '#DC2626', fontSize: '9px' }}>?</span>
          </div>
        ))}
      </div>

      {/* Arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '2px', height: '16px', background: '#D8D8E8' }} />
        <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #D8D8E8' }} />
      </div>

      {/* Row 2 — right 5 split: left 2 green, right 3 red */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        {[...Array(2)].map((_, i) => (
          <div key={`g2-${i}`} style={{ ...boxBase, ...greenBox, opacity: 0.5 }}>
            <span style={{ color: '#16A34A', fontSize: '9px' }}>✓</span>
          </div>
        ))}
        <div style={{ width: '1px', height: '24px', background: '#9D72FF', margin: '0 4px' }} />
        {[...Array(3)].map((_, i) => (
          <div key={`r2-${i}`} style={{ ...boxBase, ...redBox }}>
            <span style={{ color: '#DC2626', fontSize: '9px' }}>?</span>
          </div>
        ))}
      </div>

      {/* Arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '2px', height: '16px', background: '#D8D8E8' }} />
        <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #D8D8E8' }} />
      </div>

      {/* Row 3 — 1 green, 1 red narrowed */}
      <div style={{ display: 'flex', gap: '6px', alignItems: 'center' }}>
        <div style={{ ...boxBase, ...greenBox, opacity: 0.5 }}>
          <span style={{ color: '#16A34A', fontSize: '9px' }}>✓</span>
        </div>
        <div style={{ width: '1px', height: '24px', background: '#9D72FF', margin: '0 4px' }} />
        <div style={{ ...boxBase, ...redBox }}>
          <span style={{ color: '#DC2626', fontSize: '9px' }}>?</span>
        </div>
      </div>

      {/* Arrow */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
        <div style={{ width: '2px', height: '16px', background: '#D8D8E8' }} />
        <div style={{ width: 0, height: 0, borderLeft: '5px solid transparent', borderRight: '5px solid transparent', borderTop: '5px solid #D8D8E8' }} />
      </div>

      {/* Final — single fault box */}
      <div style={{
        ...boxBase, ...faultBox, width: '72px', height: '40px',
        color: 'white', fontSize: '11px', fontWeight: 800, letterSpacing: '0.05em',
        boxShadow: '0 4px 16px rgba(220,38,38,0.3)',
      }}>
        FAULT
      </div>
    </div>
  );
}

export default function BinarySearchSection() {
  const bullets = [
    '20 street lights monitored per cluster',
    'Fault isolated in 4-5 steps maximum',
    'Exact GPS location of broken unit',
  ];

  return (
    <section style={{
      padding: '100px 80px', background: '#FFFFFF', borderTop: '1px solid #E8E8F0',
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
          }}>THE ALGORITHM</span>
          <h2 className="font-body" style={{
            fontSize: '40px', fontWeight: 800, color: '#1A1A1E',
            letterSpacing: '-0.02em', marginBottom: '20px',
          }}>
            O(log n) Fault Detection
          </h2>
          <p className="font-body" style={{
            fontSize: '16px', color: '#64748B', lineHeight: 1.8, marginBottom: '32px',
          }}>
            UrbanGuard-AI uses binary search to pinpoint the exact broken unit within any asset group — in as few as 4-5 steps, regardless of size.
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 36px' }}>
            {bullets.map((b, i) => (
              <li key={i} className="font-body" style={{
                display: 'flex', alignItems: 'center', gap: '12px',
                fontSize: '15px', color: '#1A1A1E', marginBottom: '14px',
              }}>
                <div style={{
                  width: '22px', height: '22px', borderRadius: '6px',
                  background: '#F3EEFF', display: 'flex', alignItems: 'center', justifyContent: 'center',
                  flexShrink: 0,
                }}>
                  <Check size={13} color="#9D72FF" strokeWidth={3} />
                </div>
                {b}
              </li>
            ))}
          </ul>
          <a
            href="#login"
            className="font-body"
            style={{
              display: 'inline-block', background: '#9D72FF', color: 'white',
              borderRadius: '9999px', padding: '13px 28px', fontSize: '15px',
              fontWeight: 600, textDecoration: 'none',
              boxShadow: '0 4px 16px rgba(157,114,255,0.25)',
              transition: 'all 0.2s',
            }}
            onMouseOver={e => { e.currentTarget.style.background = '#8B5CF6'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={e => { e.currentTarget.style.background = '#9D72FF'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            See It In Action →
          </a>
        </div>

        {/* Right — visual diagram */}
        <div style={{
          background: '#FAFAFE', border: '1.5px solid #E8E8F0', borderRadius: '20px',
          padding: '48px 32px', display: 'flex', justifyContent: 'center',
        }}>
          <BinarySearchDiagram />
        </div>
      </div>
    </section>
  );
}
