// ComplaintsPanel — shows citizen complaints for an asset in the detail panel
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const SEVERITY_CONFIG = {
  minor: { label: 'Minor', bg: '#DCFCE7', color: '#16A34A' },
  moderate: { label: 'Moderate', bg: '#FEF3C7', color: '#D97706' },
  severe: { label: 'Severe', bg: '#FEE2E2', color: '#DC2626' },
};

export default function ComplaintsPanel({ asset }) {
  const navigate = useNavigate();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, score: 0 });

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';
        const res = await axios.get(`${baseUrl}/api/complaints?asset_id=${asset.id}&limit=3`);
        if (res.data.success) {
          setComplaints(res.data.data || []);
        }
      } catch {
        setComplaints([]);
      }
      setStats({
        total: asset.complaint_count || 0,
        score: asset.complaint_score || 0,
      });
      setLoading(false);
    };

    if (asset?.id) fetchComplaints();
  }, [asset?.id, asset?.complaint_count, asset?.complaint_score]);

  const cardStyle = {
    background: '#FFFFFF',
    border: '1px solid #E8E8F0',
    borderRadius: '10px',
    padding: '20px',
    marginBottom: '16px',
  };

  const labelStyle = {
    color: '#64748B',
    fontSize: '11px',
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
    marginBottom: '8px',
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  const valueStyle = {
    color: '#1A1A1E',
    fontSize: '22px',
    fontWeight: 800,
    fontFamily: "'Plus Jakarta Sans', sans-serif",
  };

  if (loading) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {[1, 2, 3].map(i => (
          <div key={i} style={{ background: '#F9F9FB', borderRadius: '10px', height: '60px' }} className="animate-pulse" />
        ))}
      </div>
    );
  }

  return (
    <div>
      {/* Stats row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div style={cardStyle} className="!mb-0">
          <div style={labelStyle}>Total Complaints</div>
          <div style={valueStyle}>{stats.total}</div>
        </div>
        <div style={cardStyle} className="!mb-0">
          <div style={labelStyle}>Complaint Score</div>
          <div style={{ ...valueStyle, color: stats.score > 25 ? '#DC2626' : stats.score > 10 ? '#D97706' : '#16A34A' }}>
            {stats.score}
          </div>
        </div>
      </div>

      {/* Recent complaints */}
      <div style={cardStyle}>
        <div style={{ ...labelStyle, marginBottom: '16px' }}>Recent Complaints</div>
        {complaints.length === 0 ? (
          <p className="font-body" style={{ fontSize: '14px', color: '#94A3B8', textAlign: 'center', padding: '20px 0' }}>
            No complaints filed for this asset.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {complaints.map((c, idx) => {
              const sev = SEVERITY_CONFIG[c.severity] || SEVERITY_CONFIG[c.ai_severity] || SEVERITY_CONFIG.minor;
              return (
                <div key={c.id || idx} style={{
                  background: '#F9F9FB', borderRadius: '8px', padding: '14px',
                  borderLeft: `3px solid ${sev.color}`,
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '6px' }}>
                    <span className="font-body" style={{ fontSize: '11px', color: '#94A3B8' }}>
                      {c.created_at ? new Date(c.created_at).toLocaleDateString('en-IN') : '—'}
                    </span>
                    <span style={{
                      fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '9999px',
                      background: sev.bg, color: sev.color,
                    }}>
                      {sev.label}
                    </span>
                  </div>
                  <p className="font-body" style={{ fontSize: '13px', color: '#1A1A1E', lineHeight: 1.5 }}>
                    {c.description ? (c.description.length > 120 ? c.description.slice(0, 120) + '...' : c.description) : '—'}
                  </p>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* View All link */}
      <button
        onClick={() => navigate(`/admin/complaints?asset=${asset.id}`)}
        className="font-body"
        style={{
          width: '100%', padding: '12px', borderRadius: '8px',
          background: '#FFFFFF', border: '1px solid #E8E8F0',
          color: '#9D72FF', fontSize: '13px', fontWeight: 600,
          cursor: 'pointer', transition: 'all 0.2s',
        }}
        onMouseOver={e => { e.currentTarget.style.background = '#F3EEFF'; e.currentTarget.style.borderColor = '#9D72FF'; }}
        onMouseOut={e => { e.currentTarget.style.background = '#FFFFFF'; e.currentTarget.style.borderColor = '#E8E8F0'; }}
      >
        View All Complaints →
      </button>
    </div>
  );
}
