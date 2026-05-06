// Trust bar section — stats pills displayed below hero
export default function TrustBar() {
  const stats = [
    { num: '100', label: 'Assets' },
    { num: '5', label: 'Detection Methods' },
    { num: '4', label: 'Asset Types' },
    { num: '11', label: 'AI Features' },
    { num: '24/7', label: 'Monitoring' },
  ];

  return (
    <div style={{
      background: '#FFFFFF',
      borderTop: '1px solid #E8E8F0',
      borderBottom: '1px solid #E8E8F0',
      padding: '20px 80px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
    }}>
      <span className="font-body" style={{
        fontSize: '11px',
        fontWeight: 700,
        color: '#94A3B8',
        letterSpacing: '0.1em',
        whiteSpace: 'nowrap',
      }}>
        TRUSTED BY CHENNAI MUNICIPAL CORPORATION
      </span>

      <div style={{ display: 'flex', alignItems: 'center', gap: '0' }}>
        {stats.map((s, i) => (
          <div key={i} style={{ display: 'flex', alignItems: 'center' }}>
            {i > 0 && (
              <div style={{ width: '1px', height: '24px', background: '#E8E8F0', margin: '0 20px' }} />
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <span className="font-body" style={{ fontSize: '18px', fontWeight: 800, color: '#9D72FF' }}>
                {s.num}
              </span>
              <span className="font-body" style={{ fontSize: '12px', color: '#64748B' }}>
                {s.label}
              </span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
