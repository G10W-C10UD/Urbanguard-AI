// MapControls — filter bar above the asset map with type/status toggles and asset count
const typeButtons = [
  { key: 'all', label: 'All' },
  { key: 'streetlight', label: 'Street Lights' },
  { key: 'road', label: 'Roads' },
  { key: 'waterpipe', label: 'Water Pipelines' },
  { key: 'sewer', label: 'Sewers' },
];

const statusButtons = [
  { key: 'all', label: 'All' },
  { key: 'healthy', label: 'Healthy', color: '#22C55E' },
  { key: 'warning', label: 'Warning', color: '#F59E0B' },
  { key: 'critical', label: 'Critical', color: '#EF4444' },
  { key: 'under_repair', label: 'Under Repair', color: '#3B82F6' },
];

const btnBase = {
  padding: '8px 18px',
  fontSize: '13px',
  fontWeight: 600,
  borderRadius: '6px',
  cursor: 'pointer',
  transition: 'all 0.2s',
  fontFamily: "'Plus Jakarta Sans', sans-serif",
  whiteSpace: 'nowrap',
};

export default function MapControls({ typeFilter, statusFilter, onTypeChange, onStatusChange, assetCount }) {
  return (
    <div
      id="map-controls"
      style={{
        height: '56px',
        background: '#FFFFFF',
        borderBottom: '1px solid #E8E8F0',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 20px',
        gap: '16px',
        overflowX: 'auto',
      }}
    >
      {/* Left — Type filters */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {typeButtons.map((btn) => {
          const isActive = typeFilter === btn.key;
          return (
            <button
              key={btn.key}
              id={`filter-type-${btn.key}`}
              onClick={() => onTypeChange(btn.key)}
              style={{
                ...btnBase,
                background: isActive ? '#9D72FF' : 'transparent',
                color: isActive ? '#FFFFFF' : '#64748B',
                border: isActive ? '1px solid #9D72FF' : '1px solid #E8E8F0',
              }}
            >
              {btn.label}
            </button>
          );
        })}
      </div>

      {/* Right — Status filters + count */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexShrink: 0 }}>
        {statusButtons.map((btn) => {
          const isActive = statusFilter === btn.key;
          return (
            <button
              key={btn.key}
              id={`filter-status-${btn.key}`}
              onClick={() => onStatusChange(btn.key)}
              style={{
                ...btnBase,
                background: isActive ? (btn.color || '#9D72FF') : 'transparent',
                color: isActive ? '#FFFFFF' : '#64748B',
                border: isActive ? `1px solid ${btn.color || '#9D72FF'}` : '1px solid #E8E8F0',
              }}
            >
              {btn.label}
            </button>
          );
        })}

        {/* Divider */}
        <div style={{ width: '1px', height: '28px', background: '#E8E8F0', margin: '0 8px' }} />

        {/* Asset count */}
        <span
          className="font-body"
          style={{ color: '#94A3B8', fontSize: '12px', letterSpacing: '0.06em', whiteSpace: 'nowrap', fontWeight: 500 }}
        >
          Showing {assetCount} assets
        </span>
      </div>
    </div>
  );
}
