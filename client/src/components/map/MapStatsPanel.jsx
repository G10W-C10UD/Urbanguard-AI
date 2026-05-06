// MapStatsPanel — fixed overlay in top-right of map showing live status counts
const rows = [
  { key: 'healthy', color: '#22C55E', label: 'Healthy' },
  { key: 'warning', color: '#F59E0B', label: 'Warning' },
  { key: 'critical', color: '#EF4444', label: 'Critical' },
  { key: 'under_repair', color: '#3B82F6', label: 'Under Repair' },
];

export default function MapStatsPanel({ counts }) {
  return (
    <div
      id="map-stats-panel"
      style={{
        position: 'absolute',
        top: '16px',
        right: '16px',
        zIndex: 1000,
        width: '200px',
        background: 'rgba(255, 255, 255, 0.95)',
        border: '1px solid #E8E8F0',
        borderRadius: '12px',
        padding: '20px',
        pointerEvents: 'auto',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
        backdropFilter: 'blur(8px)',
      }}
    >
      {/* Title */}
      <div
        className="font-body"
        style={{
          fontSize: '11px',
          color: '#64748B',
          letterSpacing: '0.1em',
          marginBottom: '16px',
          fontWeight: 700,
        }}
      >
        LIVE MAP
      </div>

      {/* Status rows */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {rows.map((row) => (
          <div
            key={row.key}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <div
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: row.color,
                flexShrink: 0,
                boxShadow: `0 0 6px ${row.color}40`,
              }}
            />
            <span
              className="font-body"
              style={{
                flex: 1,
                fontSize: '13px',
                color: '#64748B',
                fontWeight: 500,
              }}
            >
              {row.label}
            </span>
            <span
              className="font-body"
              style={{
                fontSize: '14px',
                color: '#1A1A1E',
                fontWeight: 700,
                minWidth: '24px',
                textAlign: 'right',
              }}
            >
              {counts[row.key] ?? 0}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
