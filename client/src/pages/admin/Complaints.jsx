// Admin Complaints page — table with filters, stats row, and slide-out detail panel
import Breadcrumb from '../../components/common/Breadcrumb.jsx';
import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Lightbulb, Route, Droplets, CircleDot,
  CheckCircle, AlertCircle, Search, Download,
  ChevronLeft, ChevronRight, User, ClipboardList,
  BarChart3, Zap, Clock, X
} from 'lucide-react';

const API_URL = import.meta.env.VITE_API_URL || '';

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Status' },
  { value: 'open', label: 'Open' },
  { value: 'in_review', label: 'In Review' },
  { value: 'resolved', label: 'Resolved' },
];

const SEVERITY_OPTIONS = [
  { value: 'all', label: 'All Severity' },
  { value: 'minor', label: 'Minor' },
  { value: 'moderate', label: 'Moderate' },
  { value: 'severe', label: 'Severe' },
];

const ASSET_TYPE_OPTIONS = [
  { value: 'all', label: 'All Types' },
  { value: 'streetlight', label: 'Street Light' },
  { value: 'road', label: 'Road' },
  { value: 'waterpipe', label: 'Water Pipeline' },
  { value: 'sewer', label: 'Sewer' },
];

/* ─── COLOR / STYLE MAPS ─── */

const severityBadge = {
  minor:    { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
  moderate: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  severe:   { bg: '#FFF5F5', color: '#DC2626', border: '#FECACA' },
};

const statusBadge = {
  open:      { bg: '#EDE9FF', color: '#7C3AED', border: '#DDD6FE' },
  in_review: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A' },
  resolved:  { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0' },
};

const urgencyBadge = {
  immediate:    { bg: '#FFF5F5', color: '#DC2626', border: '#FECACA', label: 'IMMEDIATE' },
  within_24hrs: { bg: '#FFFBEB', color: '#D97706', border: '#FDE68A', label: 'WITHIN 24HRS' },
  within_week:  { bg: '#F0FDF4', color: '#16A34A', border: '#BBF7D0', label: 'WITHIN WEEK' },
  low:          { bg: '#F9F9FB', color: '#64748B', border: '#E8E8F0', label: 'LOW' },
};

const assetTypeConfig = {
  streetlight: { icon: Lightbulb,  bg: '#FEF9C3', color: '#CA8A04', label: 'Street Light' },
  road:        { icon: Route,      bg: '#DBEAFE', color: '#2563EB', label: 'Road' },
  waterpipe:   { icon: Droplets,   bg: '#CFFAFE', color: '#0891B2', label: 'Water Pipe' },
  sewer:       { icon: CircleDot,  bg: '#F3E8FF', color: '#7C3AED', label: 'Sewer' },
};

/* ─── Reusable badge builders ─── */

function SeverityBadge({ severity }) {
  const s = severityBadge[severity] || severityBadge.minor;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: '90px', width: '90px', height: '26px',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: '9999px',
      fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {severity}
    </span>
  );
}

function StatusBadge({ status }) {
  const s = statusBadge[status] || statusBadge.open;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: '100px', width: '100px', height: '26px',
      background: s.bg, color: s.color, border: `1px solid ${s.border}`,
      borderRadius: '9999px',
      fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700,
      letterSpacing: '0.04em', textTransform: 'uppercase', whiteSpace: 'nowrap',
    }}>
      {status?.replace(/_/g, ' ')}
    </span>
  );
}

function UrgencyBadge({ urgency }) {
  const u = urgencyBadge[urgency] || urgencyBadge.low;
  return (
    <span style={{
      display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
      minWidth: '110px', width: '110px', height: '26px',
      background: u.bg, color: u.color, border: `1px solid ${u.border}`,
      borderRadius: '6px',
      fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700,
      textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap',
    }}>
      {u.label}
    </span>
  );
}

function AssetTypeCell({ type }) {
  const cfg = assetTypeConfig[type];
  if (!cfg) return <span style={{ fontSize: '13px', fontWeight: 500, color: '#1A1A1E' }}>{type}</span>;
  const Icon = cfg.icon;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
      <span style={{
        width: '28px', height: '28px', borderRadius: '6px',
        background: cfg.bg, color: cfg.color,
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
      }}>
        <Icon size={14} />
      </span>
      <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 500, color: '#1A1A1E', whiteSpace: 'nowrap' }}>
        {cfg.label}
      </span>
    </div>
  );
}

/* ─── Row left-border color logic ─── */
function getRowBorderLeft(c) {
  if (c.status === 'resolved') return '3px solid #E8E8F0';
  if (c.ai_severity === 'severe' || c.severity === 'severe') return '3px solid #DC2626';
  if (c.ai_severity === 'moderate' || c.severity === 'moderate') return '3px solid #F59E0B';
  return '3px solid #22C55E';
}

export default function Complaints() {
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({ status: 'all', severity: 'all', asset_type: 'all', search: '' });
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [detailData, setDetailData] = useState(null);
  const [detailLoading, setDetailLoading] = useState(false);

  const token = localStorage.getItem('urbanguard_token');
  const headers = { Authorization: `Bearer ${token}` };

  const fetchComplaints = useCallback(async () => {
    setLoading(true);
    try {
      const params = { page, limit: 15 };
      if (filters.status !== 'all') params.status = filters.status;
      if (filters.severity !== 'all') params.severity = filters.severity;
      if (filters.asset_type !== 'all') params.asset_type = filters.asset_type;
      if (filters.search) params.search = filters.search;

      const res = await axios.get(`${API_URL}/api/complaints`, { headers, params });
      if (res.data.success) {
        setComplaints(res.data.data.complaints);
        setTotalPages(res.data.data.totalPages);
        setTotal(res.data.data.total);
      }
    } catch (err) {
      // Silently handle — skeleton will stay
    } finally {
      setLoading(false);
    }
  }, [page, filters]);

  const fetchStats = useCallback(async () => {
    try {
      const res = await axios.get(`${API_URL}/api/complaints/stats`, { headers });
      if (res.data.success) setStats(res.data.data);
    } catch {
      // no-op
    }
  }, []);

  useEffect(() => { fetchComplaints(); }, [fetchComplaints]);
  useEffect(() => { fetchStats(); }, []);

  const openDetail = async (complaint) => {
    setSelectedComplaint(complaint.id);
    setDetailLoading(true);
    try {
      const res = await axios.get(`${API_URL}/api/complaints/${complaint.id}`, { headers });
      if (res.data.success) setDetailData(res.data.data);
    } catch {
      setDetailData(complaint);
    } finally {
      setDetailLoading(false);
    }
  };

  const closeDetail = () => {
    setSelectedComplaint(null);
    setDetailData(null);
  };

  const updateStatus = async (id, newStatus, notes = null) => {
    try {
      await axios.put(`${API_URL}/api/complaints/${id}/status`, { status: newStatus, admin_notes: notes }, { headers });
      fetchComplaints();
      fetchStats();
      if (detailData && detailData.id === id) {
        setDetailData({ ...detailData, status: newStatus, admin_notes: notes || detailData.admin_notes });
      }
    } catch {
      // no-op
    }
  };

  const clearFilters = () => {
    setFilters({ status: 'all', severity: 'all', asset_type: 'all', search: '' });
    setPage(1);
  };

  const hasActiveFilters = filters.status !== 'all' || filters.severity !== 'all' || filters.asset_type !== 'all' || filters.search;

  const exportCSV = () => {
    if (!complaints.length) return;
    const csvHeaders = ['ID', 'Name', 'Phone', 'Area', 'Asset Type', 'Severity', 'AI Severity', 'Status', 'Description', 'Created'];
    const rows = complaints.map(c => [
      c.id, c.name, c.phone, c.area, c.asset_type, c.severity, c.ai_severity || '', c.status, `"${(c.description || '').replace(/"/g, '""')}"`, new Date(c.created_at).toLocaleDateString()
    ]);
    const csv = [csvHeaders.join(','), ...rows.map(r => r.join(','))].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `complaints_${new Date().toISOString().split('T')[0]}.csv`; a.click();
    URL.revokeObjectURL(url);
  };

  /* ─── Dropdown style ─── */
  const selectStyle = {
    fontFamily: "'DM Sans', sans-serif", fontSize: '14px', padding: '9px 14px',
    background: '#F9F9FB', border: '1.5px solid #E8E8F0', borderRadius: '8px', color: '#1A1A1E',
    outline: 'none', appearance: 'none', cursor: 'pointer', minWidth: '140px',
    backgroundImage: `url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%2364748B' stroke-width='1.5' stroke-linecap='round'/%3E%3C/svg%3E")`,
    backgroundRepeat: 'no-repeat', backgroundPosition: 'right 12px center', paddingRight: '32px',
  };

  /* ─── Table grid columns ─── */
  const gridCols = '120px 180px 140px 110px 150px 130px 120px 80px';

  return (
    <div style={{ position: 'relative' }}>
      <Breadcrumb page="Complaints" />
      {/* ── Fix 15: Page Header ── */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '32px' }}>
        <div>
          <h1 style={{ fontFamily: "'DM Sans', sans-serif", fontWeight: 800, fontSize: '28px', color: '#1A1A1E', letterSpacing: '-0.02em', margin: 0 }}>
            Complaints
          </h1>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#64748B', marginTop: '4px' }}>
            Manage citizen complaints and AI classifications
          </p>
        </div>
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {stats && (
            <span style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
              color: '#9D72FF', background: '#F3EEFF',
              padding: '6px 16px', borderRadius: '9999px',
            }}>
              Today: {stats.today_count || 0}
            </span>
          )}
          <button onClick={exportCSV} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600,
            padding: '9px 18px', borderRadius: '8px', border: '1.5px solid #E8E8F0',
            background: '#FFFFFF', color: '#64748B', cursor: 'pointer', transition: 'all 0.2s',
            display: 'inline-flex', alignItems: 'center', gap: '6px',
          }}
            onMouseOver={e => { e.currentTarget.style.borderColor = '#9D72FF'; e.currentTarget.style.color = '#9D72FF'; }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#E8E8F0'; e.currentTarget.style.color = '#64748B'; }}
          >
            <Download size={15} /> Export CSV
          </button>
        </div>
      </div>

      {/* ── Fix 14: Stats Cards Row ── */}
      {stats && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
          {[
            { label: 'Total', value: stats.total || 0, dot: null },
            { label: 'Open', value: stats.open_count || 0, dot: '#9D72FF', pulse: true },
            { label: 'In Review', value: stats.in_review_count || 0, dot: '#F59E0B' },
            { label: 'Resolved', value: stats.resolved_count || 0, dot: '#22C55E' },
          ].map(s => (
            <div key={s.label} style={{
              background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '12px',
              padding: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)',
            }}>
              <div style={{
                fontFamily: "'DM Sans', sans-serif", fontSize: '11px', color: '#64748B',
                textTransform: 'uppercase', letterSpacing: '0.08em', fontWeight: 700, marginBottom: '12px',
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              }}>
                <span>{s.label}</span>
                {s.dot && (
                  <span style={{
                    width: '10px', height: '10px', borderRadius: '50%',
                    backgroundColor: s.dot, display: 'inline-block',
                    animation: s.pulse ? 'pulse 2s infinite' : 'none',
                  }} />
                )}
              </div>
              <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '40px', fontWeight: 800, color: '#1A1A1E', lineHeight: 1 }}>
                {s.value}
              </span>
            </div>
          ))}
        </div>
      )}

      {/* ── Fix 11: Filter Bar ── */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '20px', flexWrap: 'wrap',
        background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '12px', padding: '16px 20px',
      }}>
        <select value={filters.status} onChange={e => { setFilters({...filters, status: e.target.value}); setPage(1); }}
          style={selectStyle}
          onFocus={e => e.target.style.borderColor = '#9D72FF'}
          onBlur={e => e.target.style.borderColor = '#E8E8F0'}
        >
          {STATUS_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filters.severity} onChange={e => { setFilters({...filters, severity: e.target.value}); setPage(1); }}
          style={selectStyle}
          onFocus={e => e.target.style.borderColor = '#9D72FF'}
          onBlur={e => e.target.style.borderColor = '#E8E8F0'}
        >
          {SEVERITY_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <select value={filters.asset_type} onChange={e => { setFilters({...filters, asset_type: e.target.value}); setPage(1); }}
          style={selectStyle}
          onFocus={e => e.target.style.borderColor = '#9D72FF'}
          onBlur={e => e.target.style.borderColor = '#E8E8F0'}
        >
          {ASSET_TYPE_OPTIONS.map(o => <option key={o.value} value={o.value}>{o.label}</option>)}
        </select>
        <div style={{ flex: 1, position: 'relative', minWidth: '180px' }}>
          <Search size={16} style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94A3B8', pointerEvents: 'none' }} />
          <input type="text" placeholder="Search complaints..." value={filters.search}
            onChange={e => { setFilters({...filters, search: e.target.value}); setPage(1); }}
            style={{
              width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: '14px', padding: '9px 14px 9px 40px',
              background: '#F9F9FB', border: '1.5px solid #E8E8F0', borderRadius: '8px', color: '#1A1A1E', outline: 'none',
            }}
            onFocus={e => e.target.style.borderColor = '#9D72FF'}
            onBlur={e => e.target.style.borderColor = '#E8E8F0'}
          />
        </div>
        {hasActiveFilters && (
          <button onClick={clearFilters} style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
            background: 'none', border: 'none', color: '#9D72FF', cursor: 'pointer', whiteSpace: 'nowrap',
            padding: 0,
          }}>
            Clear filters
          </button>
        )}
      </div>

      {/* ── Fix 12: Results count ── */}
      <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#64748B', marginBottom: '12px' }}>
        Showing <span style={{ fontWeight: 700, color: '#1A1A1E' }}>{complaints.length}</span> of <span style={{ fontWeight: 700, color: '#1A1A1E' }}>{total}</span> complaints
      </div>

      {/* ── Complaints Table ── */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '12px', overflow: 'hidden', marginBottom: '20px', overflowX: 'auto' }}>
        {/* Fix 7: Table header */}
        <div style={{
          display: 'grid', gridTemplateColumns: gridCols,
          padding: '14px 20px', borderBottom: '2px solid #E8E8F0', background: '#F9F9FB',
        }}>
          {['ID', 'Citizen / Area', 'Asset Type', 'Severity', 'AI Severity', 'Urgency', 'Status', 'Action'].map((h, i) => (
            <span key={h} style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700,
              color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em',
              textAlign: i === 7 ? 'right' : 'left',
            }}>
              {h}
            </span>
          ))}
        </div>

        {/* Loading skeleton */}
        {loading && Array.from({ length: 5 }).map((_, i) => (
          <div key={i} style={{
            display: 'grid', gridTemplateColumns: gridCols,
            padding: '20px', minHeight: '72px', borderBottom: '1px solid #F4F4F8', alignItems: 'center',
          }}>
            {Array.from({ length: 8 }).map((_, j) => (
              <div key={j} style={{ height: '14px', background: '#F4F4F8', borderRadius: '6px', width: '70%', animation: 'pulse 1.5s infinite' }} />
            ))}
          </div>
        ))}

        {/* Fix 6: Table rows */}
        {!loading && complaints.map(c => {
          const sevMatch = c.severity === c.ai_severity;

          return (
            <div key={c.id} style={{
              display: 'grid', gridTemplateColumns: gridCols,
              padding: '0 20px', minHeight: '72px', borderBottom: '1px solid #F4F4F8',
              borderLeft: getRowBorderLeft(c),
              alignItems: 'center', cursor: 'pointer', transition: 'background 0.15s',
            }}
              onClick={() => openDetail(c)}
              onMouseOver={e => e.currentTarget.style.background = '#FAFAFA'}
              onMouseOut={e => e.currentTarget.style.background = 'transparent'}
            >
              {/* Fix 9: Complaint ID */}
              <span>
                <span style={{
                  fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: '13px', fontWeight: 700,
                  color: '#9D72FF', background: '#EDE9FF', padding: '4px 8px', borderRadius: '6px',
                  display: 'inline-block',
                }}>
                  {c.id}
                </span>
              </span>

              {/* Fix 8: Citizen / Area */}
              <div style={{ overflow: 'hidden', maxWidth: '200px' }}>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', fontWeight: 600, color: '#1A1A1E', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {c.name || 'Anonymous'}
                </div>
                <div style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748B', marginTop: '2px' }}>
                  {c.area}
                </div>
              </div>

              {/* Fix 1: Asset Type with Lucide icon */}
              <AssetTypeCell type={c.asset_type} />

              {/* Fix 2: Citizen Severity badge */}
              <SeverityBadge severity={c.severity} />

              {/* Fix 3: AI Severity + match indicator */}
              <div style={{
                display: 'flex', alignItems: 'center', gap: '8px', whiteSpace: 'nowrap',
              }}>
                {c.ai_severity ? (
                  <>
                    <SeverityBadge severity={c.ai_severity} />
                    <span style={{ flexShrink: 0, width: '16px', height: '16px', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                      {sevMatch
                        ? <CheckCircle size={14} color="#16A34A" />
                        : <AlertCircle size={14} color="#DC2626" />
                      }
                    </span>
                  </>
                ) : (
                  <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#94A3B8' }}>—</span>
                )}
              </div>

              {/* Fix 4: Urgency badge */}
              {c.ai_urgency ? <UrgencyBadge urgency={c.ai_urgency} /> : (
                <span style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#94A3B8' }}>—</span>
              )}

              {/* Fix 5: Status badge */}
              <StatusBadge status={c.status} />

              {/* Fix 10: View button */}
              <div style={{ textAlign: 'right' }}>
                <button style={{
                  fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600,
                  padding: '7px 16px', borderRadius: '8px', border: '1.5px solid #E8E8F0',
                  background: '#F9F9FB', color: '#64748B', cursor: 'pointer', transition: 'all 0.15s',
                  whiteSpace: 'nowrap',
                }}
                  onClick={(e) => { e.stopPropagation(); openDetail(c); }}
                  onMouseOver={e => { e.currentTarget.style.background = '#EDE9FF'; e.currentTarget.style.borderColor = '#9D72FF'; e.currentTarget.style.color = '#9D72FF'; }}
                  onMouseOut={e => { e.currentTarget.style.background = '#F9F9FB'; e.currentTarget.style.borderColor = '#E8E8F0'; e.currentTarget.style.color = '#64748B'; }}
                >
                  View
                </button>
              </div>
            </div>
          );
        })}

        {/* Empty state */}
        {!loading && complaints.length === 0 && (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '15px', color: '#94A3B8', fontWeight: 600 }}>No complaints found</p>
            <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#C8C8D4', marginTop: '6px' }}>Try adjusting your filters</p>
          </div>
        )}
      </div>

      {/* ── Fix 13: Pagination ── */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', padding: '24px 0' }}>
          <button disabled={page === 1} onClick={() => setPage(p => p - 1)}
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600,
              padding: '8px 20px', borderRadius: '8px', border: '1.5px solid #E8E8F0',
              background: '#FFFFFF', color: '#64748B', cursor: page === 1 ? 'not-allowed' : 'pointer',
              opacity: page === 1 ? 0.4 : 1, transition: 'all 0.15s',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
            }}
            onMouseOver={e => { if (page !== 1) { e.currentTarget.style.borderColor = '#9D72FF'; e.currentTarget.style.color = '#9D72FF'; } }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#E8E8F0'; e.currentTarget.style.color = '#64748B'; }}
          >
            <ChevronLeft size={16} /> Prev
          </button>
          <span style={{
            fontFamily: "'DM Sans', sans-serif", fontSize: '14px', color: '#64748B', fontWeight: 500,
            padding: '8px 16px',
          }}>
            {page} of {totalPages}
          </span>
          <button disabled={page === totalPages} onClick={() => setPage(p => p + 1)}
            style={{
              fontFamily: "'DM Sans', sans-serif", fontSize: '14px', fontWeight: 600,
              padding: '8px 20px', borderRadius: '8px', border: '1.5px solid #E8E8F0',
              background: '#FFFFFF', color: '#64748B', cursor: page === totalPages ? 'not-allowed' : 'pointer',
              opacity: page === totalPages ? 0.4 : 1, transition: 'all 0.15s',
              display: 'inline-flex', alignItems: 'center', gap: '4px',
            }}
            onMouseOver={e => { if (page !== totalPages) { e.currentTarget.style.borderColor = '#9D72FF'; e.currentTarget.style.color = '#9D72FF'; } }}
            onMouseOut={e => { e.currentTarget.style.borderColor = '#E8E8F0'; e.currentTarget.style.color = '#64748B'; }}
          >
            Next <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* ─── DETAIL PANEL (slide from right) ─── */}
      {selectedComplaint && (
        <>
          {/* Backdrop */}
          <div onClick={closeDetail} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.3)', zIndex: 100,
            animation: 'fadeIn 0.2s ease-out',
          }} />

          {/* Panel */}
          <div style={{
            position: 'fixed', top: 0, right: 0, width: '480px', height: '100vh',
            background: '#FFFFFF', zIndex: 101, overflowY: 'auto',
            borderLeft: '1px solid #E8E8F0', boxShadow: '-8px 0 32px rgba(0,0,0,0.08)',
            animation: 'slideInRight 0.25s ease-out',
          }}>
            {detailLoading ? (
              <div style={{ padding: '40px', textAlign: 'center' }}>
                <div style={{ width: '32px', height: '32px', border: '3px solid #E8E8F0', borderTop: '3px solid #9D72FF', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto' }} />
              </div>
            ) : detailData && (
              <DetailPanel data={detailData} onClose={closeDetail} onUpdateStatus={updateStatus} />
            )}
          </div>
        </>
      )}

      <style>{`
        @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes slideInRight { from { transform: translateX(100%); } to { transform: translateX(0); } }
        @keyframes spin { to { transform: rotate(360deg); } }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
      `}</style>
    </div>
  );
}

/* ─── DETAIL PANEL COMPONENT ─── */
function DetailPanel({ data, onClose, onUpdateStatus }) {
  const [notes, setNotes] = useState(data.admin_notes || '');
  const [savingStatus, setSavingStatus] = useState(null);

  const handleStatusChange = async (newStatus) => {
    setSavingStatus(newStatus);
    await onUpdateStatus(data.id, newStatus, notes);
    setSavingStatus(null);
  };

  const sev = severityBadge[data.severity] || severityBadge.minor;
  const aiSev = severityBadge[data.ai_severity] || { bg: '#F9F9FB', color: '#94A3B8', border: '#E8E8F0' };
  const urg = urgencyBadge[data.ai_urgency] || urgencyBadge.low;

  const sectionTitle = {
    fontFamily: "'DM Sans', sans-serif", fontSize: '11px', fontWeight: 700, color: '#64748B',
    textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '14px', marginTop: '28px',
    display: 'flex', alignItems: 'center', gap: '8px',
  };

  const infoRow = {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '8px 0', borderBottom: '1px solid #F4F4F8',
  };

  const infoLabel = { fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748B' };
  const infoValue = { fontFamily: "'DM Sans', sans-serif", fontSize: '13px', fontWeight: 600, color: '#1A1A1E' };

  return (
    <div style={{ padding: '28px 32px 40px' }}>
      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '24px' }}>
        <div>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: '14px', fontWeight: 700,
            color: '#9D72FF', background: '#EDE9FF', padding: '4px 10px', borderRadius: '6px',
            display: 'inline-block', marginBottom: '8px',
          }}>
            {data.id}
          </span>
          <div style={{ marginTop: '4px' }}>
            <StatusBadge status={data.status} />
          </div>
        </div>
        <button onClick={onClose} style={{
          width: '32px', height: '32px', borderRadius: '8px', border: '1px solid #E8E8F0',
          background: 'white', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
          color: '#94A3B8', transition: 'all 0.15s',
        }}
          onMouseOver={e => { e.currentTarget.style.borderColor = '#EF4444'; e.currentTarget.style.color = '#EF4444'; }}
          onMouseOut={e => { e.currentTarget.style.borderColor = '#E8E8F0'; e.currentTarget.style.color = '#94A3B8'; }}
        >
          <X size={16} />
        </button>
      </div>

      {/* Section 1: Citizen Info */}
      <div style={sectionTitle}><User size={14} /> Citizen Information</div>
      <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '14px 18px' }}>
        <div style={infoRow}>
          <span style={infoLabel}>Name</span>
          <span style={infoValue}>{data.name || 'Anonymous'}</span>
        </div>
        <div style={infoRow}>
          <span style={infoLabel}>Phone</span>
          <span style={{ ...infoValue, fontFamily: "'JetBrains Mono', monospace", fontSize: '12px' }}>{data.phone || '—'}</span>
        </div>
        <div style={{ ...infoRow, borderBottom: 'none' }}>
          <span style={infoLabel}>Area</span>
          <span style={infoValue}>{data.area || '—'}</span>
        </div>
      </div>

      {/* Section 2: Complaint Content */}
      <div style={sectionTitle}><ClipboardList size={14} /> Complaint Details</div>
      <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '14px 18px' }}>
        <div style={{ ...infoRow }}>
          <span style={infoLabel}>Asset Type</span>
          <AssetTypeCell type={data.asset_type} />
        </div>
        <div style={{ ...infoRow }}>
          <span style={infoLabel}>Asset ID</span>
          <span style={{
            fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
            color: '#9D72FF', background: '#EDE9FF', padding: '3px 8px', borderRadius: '6px',
          }}>
            {data.asset_id || 'Not specified'}
          </span>
        </div>
        <div style={{ ...infoRow }}>
          <span style={infoLabel}>Citizen Severity</span>
          <SeverityBadge severity={data.severity} />
        </div>
        <div style={{ ...infoRow, borderBottom: 'none', flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
          <span style={infoLabel}>Description</span>
          <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '13px', color: '#1A1A1E', lineHeight: 1.6, margin: 0 }}>
            {data.description}
          </p>
        </div>
      </div>

      {/* Section 3: AI Analysis */}
      {data.ai_severity && (
        <>
          <div style={sectionTitle}>
            <span style={{ background: '#EF4444', color: 'white', fontSize: '9px', fontWeight: 800, padding: '2px 5px', borderRadius: '3px', fontFamily: "'JetBrains Mono', monospace" }}>AI</span>
            Analysis
          </div>
          <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '14px 18px', border: '1px solid #F0EBFF' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
              <div style={{ background: 'white', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E8E8F0' }}>
                <div style={{ ...infoLabel, fontSize: '10px', marginBottom: '6px' }}>AI Severity</div>
                <SeverityBadge severity={data.ai_severity} />
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E8E8F0' }}>
                <div style={{ ...infoLabel, fontSize: '10px', marginBottom: '4px' }}>Confidence</div>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 700, color: '#1A1A1E' }}>
                  {data.ai_confidence}%
                </span>
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E8E8F0' }}>
                <div style={{ ...infoLabel, fontSize: '10px', marginBottom: '6px' }}>Urgency</div>
                <UrgencyBadge urgency={data.ai_urgency} />
              </div>
              <div style={{ background: 'white', borderRadius: '8px', padding: '10px 12px', border: '1px solid #E8E8F0' }}>
                <div style={{ ...infoLabel, fontSize: '10px', marginBottom: '4px' }}>Dispatch</div>
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', fontWeight: 700,
                  color: data.ai_requires_dispatch ? '#EF4444' : '#10B981',
                  display: 'inline-flex', alignItems: 'center', gap: '4px',
                }}>
                  {data.ai_requires_dispatch
                    ? <><AlertCircle size={13} /> Required</>
                    : <><CheckCircle size={13} /> Not needed</>
                  }
                </span>
              </div>
            </div>

            {/* Key Issues */}
            {data.ai_key_issues && (
              <div style={{ marginBottom: '10px' }}>
                <div style={{ ...infoLabel, fontSize: '10px', marginBottom: '6px' }}>Key Issues</div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                  {(typeof data.ai_key_issues === 'string' ? JSON.parse(data.ai_key_issues) : data.ai_key_issues).map((issue, i) => (
                    <span key={i} style={{
                      fontFamily: "'JetBrains Mono', monospace", fontSize: '10px', fontWeight: 600,
                      padding: '3px 8px', borderRadius: '6px', background: '#FEF2F2', color: '#EF4444',
                    }}>
                      {issue.replace(/_/g, ' ')}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reasoning */}
            {data.ai_reasoning && (
              <div>
                <div style={{ ...infoLabel, fontSize: '10px', marginBottom: '4px' }}>AI Reasoning</div>
                <p style={{ fontFamily: "'DM Sans', sans-serif", fontSize: '12px', color: '#64748B', lineHeight: 1.5, fontStyle: 'italic', margin: 0 }}>
                  "{data.ai_reasoning}"
                </p>
              </div>
            )}
          </div>
        </>
      )}

      {/* Section 4: Asset Impact */}
      {data.asset_id && (
        <>
          <div style={sectionTitle}><BarChart3 size={14} /> Asset Impact</div>
          <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '14px 18px' }}>
            <div style={infoRow}>
              <span style={infoLabel}>Asset</span>
              <span style={{
                fontFamily: "'Plus Jakarta Sans', 'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
                color: '#9D72FF', background: '#EDE9FF', padding: '3px 8px', borderRadius: '6px',
              }}>{data.asset_id}</span>
            </div>
            {data.asset_name && (
              <div style={infoRow}>
                <span style={infoLabel}>Asset Name</span>
                <span style={infoValue}>{data.asset_name}</span>
              </div>
            )}
            {data.asset_status && (
              <div style={infoRow}>
                <span style={infoLabel}>Current Status</span>
                <StatusBadge status={data.asset_status} />
              </div>
            )}
            {data.health_score !== undefined && (
              <div style={{ ...infoRow, borderBottom: 'none' }}>
                <span style={infoLabel}>Health Score</span>
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '14px', fontWeight: 700, color: data.health_score > 70 ? '#10B981' : data.health_score > 40 ? '#F59E0B' : '#EF4444' }}>
                  {data.health_score}/100
                </span>
              </div>
            )}
          </div>
        </>
      )}

      {/* Section 5: Admin Actions */}
      <div style={sectionTitle}><Zap size={14} /> Admin Actions</div>
      <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '14px 18px' }}>
        {/* Status buttons */}
        <div style={{ ...infoLabel, fontSize: '10px', marginBottom: '10px' }}>Change Status</div>
        <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
          {['open', 'in_review', 'resolved'].map(s => {
            const sc = statusBadge[s];
            const isActive = data.status === s;
            return (
              <button key={s} disabled={isActive || savingStatus === s}
                onClick={() => handleStatusChange(s)}
                style={{
                  flex: 1, padding: '10px', borderRadius: '8px', border: `1.5px solid ${isActive ? sc.color : '#E8E8F0'}`,
                  background: isActive ? sc.bg : 'white', cursor: isActive ? 'default' : 'pointer',
                  fontFamily: "'DM Sans', sans-serif", fontSize: '12px', fontWeight: 700,
                  color: isActive ? sc.color : '#64748B', transition: 'all 0.15s', textTransform: 'capitalize',
                }}
                onMouseOver={e => { if (!isActive) { e.currentTarget.style.borderColor = sc.color; e.currentTarget.style.color = sc.color; } }}
                onMouseOut={e => { if (!isActive) { e.currentTarget.style.borderColor = '#E8E8F0'; e.currentTarget.style.color = '#64748B'; } }}
              >
                {savingStatus === s ? '...' : s.replace(/_/g, ' ')}
              </button>
            );
          })}
        </div>

        {/* Admin notes */}
        <div style={{ ...infoLabel, fontSize: '10px', marginBottom: '6px' }}>Admin Notes</div>
        <textarea value={notes} onChange={e => setNotes(e.target.value)}
          placeholder="Add internal notes about this complaint..."
          rows={3}
          style={{
            width: '100%', fontFamily: "'DM Sans', sans-serif", fontSize: '13px', padding: '10px 14px',
            background: 'white', border: '1px solid #E8E8F0', borderRadius: '8px', color: '#1A1A1E',
            outline: 'none', resize: 'vertical', minHeight: '60px', boxSizing: 'border-box',
          }}
          onFocus={e => e.target.style.borderColor = '#9D72FF'}
          onBlur={e => e.target.style.borderColor = '#E8E8F0'}
        />
      </div>

      {/* Section 6: Timestamps */}
      <div style={sectionTitle}><Clock size={14} /> Timeline</div>
      <div style={{ background: '#F9F9FB', borderRadius: '10px', padding: '14px 18px' }}>
        <div style={infoRow}>
          <span style={infoLabel}>Created</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#64748B' }}>
            {data.created_at ? new Date(data.created_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
          </span>
        </div>
        <div style={{ ...infoRow, borderBottom: 'none' }}>
          <span style={infoLabel}>Updated</span>
          <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '11px', color: '#64748B' }}>
            {data.updated_at ? new Date(data.updated_at).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' }) : '—'}
          </span>
        </div>
      </div>
    </div>
  );
}
