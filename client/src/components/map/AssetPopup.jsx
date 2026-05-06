// AssetPopup — custom popup content for asset markers on the map
const STATUS_COLORS = {
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
  under_repair: '#3B82F6',
};

const STATUS_LABELS = {
  healthy: 'Healthy',
  warning: 'Warning',
  critical: 'Critical',
  under_repair: 'Under Repair',
};

export default function AssetPopup({ asset, onClose, onViewDetails }) {
  if (!asset) return null;

  const statusColor = STATUS_COLORS[asset.status] || '#94A3B8';
  const statusLabel = STATUS_LABELS[asset.status] || asset.status;
  const healthScore = asset.health_score ?? 75;
  const reading = asset.iot_sensor_reading ?? asset.expected;
  const expected = asset.expected ?? 100;
  const showDispatch = asset.status === 'warning' || asset.status === 'critical';

  return (
    <div
      style={{
        width: '280px',
        background: '#FFFFFF',
        border: '1px solid #E8E8F0',
        borderRadius: '12px',
        padding: '20px',
        fontFamily: "'Plus Jakarta Sans', sans-serif",
        position: 'relative',
        boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
      }}
    >
      {/* Close button */}
      <button
        onClick={(e) => { e.stopPropagation(); onClose(); }}
        style={{
          position: 'absolute',
          top: '12px',
          right: '12px',
          background: 'none',
          border: 'none',
          color: '#94A3B8',
          cursor: 'pointer',
          fontSize: '18px',
          lineHeight: 1,
          padding: 0,
        }}
        aria-label="Close popup"
      >
        ×
      </button>

      {/* Top row: ID + status badge */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
        <span
          className="font-body"
          style={{ color: '#9D72FF', fontSize: '13px', fontWeight: 700, letterSpacing: '0.04em' }}
        >
          {asset.id}
        </span>
        <span
          style={{
            fontSize: '10px',
            fontWeight: 700,
            padding: '3px 10px',
            borderRadius: '20px',
            background: `${statusColor}15`,
            color: statusColor,
            border: `1px solid ${statusColor}30`,
            letterSpacing: '0.04em',
            textTransform: 'uppercase',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
        >
          {statusLabel}
        </span>
      </div>

      {/* Asset name */}
      <div
        className="font-body"
        style={{
          fontSize: '20px',
          color: '#1A1A1E',
          lineHeight: 1.2,
          marginBottom: '4px',
          fontWeight: 800,
          letterSpacing: '-0.02em',
        }}
      >
        {asset.name}
      </div>

      {/* Area */}
      <div style={{ fontSize: '13px', color: '#64748B', marginBottom: '14px' }}>
        {asset.area}
      </div>

      {/* Divider */}
      <div style={{ height: '1px', background: '#E8E8F0', marginBottom: '14px' }} />

      {/* Health Score */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
          <span style={{ color: '#64748B', fontSize: '12px', fontWeight: 500 }}>Health Score</span>
          <span className="font-body" style={{ color: '#1A1A1E', fontSize: '14px', fontWeight: 700 }}>
            {healthScore}%
          </span>
        </div>
        <div style={{ width: '100%', height: '4px', background: '#F4F4F8', borderRadius: '2px', overflow: 'hidden' }}>
          <div
            style={{
              width: `${healthScore}%`,
              height: '100%',
              background: healthScore > 70 ? '#22C55E' : healthScore > 40 ? '#F59E0B' : '#EF4444',
              borderRadius: '2px',
              transition: 'width 0.5s ease',
            }}
          />
        </div>
      </div>

      {/* IoT Reading */}
      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ color: '#64748B', fontSize: '12px', fontWeight: 500 }}>IoT Reading</span>
          <span style={{ fontSize: '13px' }}>
            <span className="font-body" style={{ color: '#1A1A1E', fontWeight: 700 }}>
              {typeof reading === 'number' ? reading.toFixed(1) : reading}
            </span>
            <span style={{ color: '#94A3B8', marginLeft: '4px' }}>/ {expected} {asset.unit}</span>
          </span>
        </div>
      </div>

      {/* Last maintained */}
      <div style={{ color: '#94A3B8', fontSize: '11px', marginBottom: '16px' }}>
        Last maintained: {asset.last_maintained || 'N/A'}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          id={`view-details-${asset.id}`}
          onClick={(e) => { e.stopPropagation(); onViewDetails(asset); }}
          style={{
            flex: 1,
            padding: '10px 0',
            fontSize: '13px',
            fontWeight: 600,
            borderRadius: '8px',
            border: '1px solid #E8E8F0',
            background: '#FFFFFF',
            color: '#1A1A1E',
            cursor: 'pointer',
            transition: 'all 0.2s',
            fontFamily: "'Plus Jakarta Sans', sans-serif",
          }}
          onMouseEnter={(e) => { e.target.style.borderColor = '#9D72FF'; e.target.style.color = '#9D72FF'; }}
          onMouseLeave={(e) => { e.target.style.borderColor = '#E8E8F0'; e.target.style.color = '#1A1A1E'; }}
        >
          View Details
        </button>
        {showDispatch && (
          <button
            id={`dispatch-job-${asset.id}`}
            style={{
              flex: 1,
              padding: '10px 0',
              fontSize: '13px',
              fontWeight: 600,
              borderRadius: '8px',
              border: 'none',
              background: '#9D72FF',
              color: '#FFFFFF',
              cursor: 'pointer',
              transition: 'all 0.2s',
              fontFamily: "'Plus Jakarta Sans', sans-serif",
            }}
            onMouseEnter={(e) => { e.target.style.background = '#8B5CF6'; }}
            onMouseLeave={(e) => { e.target.style.background = '#9D72FF'; }}
          >
            Dispatch Job
          </button>
        )}
      </div>
    </div>
  );
}
