// JobBoard — real-time available job cards for contractors
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useSocket } from '../../hooks/useSocket.js';
import { useAuth } from '../../context/AuthContext.jsx';
import { Briefcase, MapPin, Clock, CheckCircle, X, Zap, AlertCircle, Lightbulb, Construction, Droplets, Waves } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const ASSET_TYPE_CONFIG = {
  streetlight: { icon: Lightbulb, bg: '#FEF3C7', color: '#D97706' },
  road:        { icon: Construction, bg: '#DBEAFE', color: '#2563EB' },
  waterpipe:   { icon: Droplets, bg: '#D1FAE5', color: '#059669' },
  sewer:       { icon: Waves, bg: '#EDE9FE', color: '#7C3AED' },
};

function getTimeSince(dateStr) {
  if (!dateStr) return 'Just now';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function JobBoard() {
  const { user } = useAuth();
  const { on } = useSocket('contractor', user?.id);
  const navigate = useNavigate();

  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/available`);
        setJobs(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch available jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();

    const unbindNewJob = on('new_job', (newJob) => {
      setJobs(prev => {
        if (prev.find(j => j.id === newJob.id)) return prev;
        return [newJob, ...prev];
      });
      showToast('new_job', newJob);
    });

    const unbindJobTaken = on('job_taken', ({ job_id }) => {
      setJobs(prev => {
        const jobExists = prev.find(j => j.id === job_id);
        if (jobExists) {
          showToast('job_taken', jobExists);
          return prev.filter(j => j.id !== job_id);
        }
        return prev;
      });
    });

    return () => {
      unbindNewJob();
      unbindJobTaken();
    };
  }, [on]);

  const showToast = (type, job) => {
    setToast({ type, job });
    if (type === 'new_job') {
      const audio = new Audio('/beep.mp3');
      audio.play().catch(() => {});
    }
    setTimeout(() => setToast(null), 8000);
  };

  const handleAccept = async (jobId) => {
    try {
      const res = await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs/${jobId}/accept`, {});
      if (res.data.success) {
        navigate('/contractor/my-jobs');
      } else {
        alert(res.data.error || 'Failed to accept job');
      }
    } catch (err) {
      console.error('Accept job error:', err);
      alert('Error accepting job');
    }
  };

  const handleSkip = (jobId) => {
    setJobs(prev => prev.filter(j => j.id !== jobId));
  };

  const getTopBarStyles = (severity) => {
    if (severity === 'critical' || severity === 'severe') {
      return { bg: '#FFF5F5', border: '#FECACA' };
    }
    if (severity === 'warning' || severity === 'moderate') {
      return { bg: '#FFFBEB', border: '#FDE68A' };
    }
    return { bg: '#F0F9FF', border: '#BFDBFE' };
  };

  const getSeverityBadge = (severity) => {
    if (severity === 'critical' || severity === 'severe') {
      return { bg: '#FEE2E2', color: '#DC2626', label: 'Critical' };
    }
    if (severity === 'warning' || severity === 'moderate') {
      return { bg: '#FEF3C7', color: '#D97706', label: 'Warning' };
    }
    return { bg: '#DBEAFE', color: '#2563EB', label: 'Info' };
  };

  const getCardBorder = (severity) => {
    if (severity === 'critical' || severity === 'severe') {
      return { borderColor: '#FECACA', boxShadow: '0 2px 8px rgba(239,68,68,0.08)' };
    }
    if (severity === 'warning' || severity === 'moderate') {
      return { borderColor: '#FDE68A', boxShadow: '0 2px 8px rgba(245,158,11,0.08)' };
    }
    return {};
  };

  return (
    <div style={{ background: '#F9F9FB', minHeight: 'calc(100vh - 120px)', padding: '32px 40px' }}>
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: '24px' }}>
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1E', marginBottom: '4px' }}>Available Jobs</h1>
          <p style={{ fontSize: '14px', color: '#64748B' }}>New jobs appear instantly. First to accept gets the job.</p>
        </div>
        <div
          className="flex items-center"
          style={{
            background: '#DCFCE7',
            border: '1px solid #BBF7D0',
            borderRadius: '9999px',
            padding: '6px 14px',
            gap: '6px'
          }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
          </span>
          <span style={{ fontSize: '12px', fontWeight: 600, color: '#16A34A' }}>Listening for new jobs...</span>
        </div>
      </div>

      {/* Toast Notification */}
      {toast && (
        <div className="fixed top-20 right-10 bg-white rounded-xl z-50" style={{ border: '1px solid #E8E8F0', padding: '16px', boxShadow: '0 8px 32px rgba(0,0,0,0.12)', width: '360px' }}>
          <button onClick={() => setToast(null)} className="absolute top-4 right-4 text-[#64748B] hover:text-[#1A1A1E]">
            <X size={16} />
          </button>
          {toast.type === 'new_job' ? (
            <>
              <div className="flex items-center gap-2 mb-2">
                <Zap size={16} className="text-[#9D72FF]" />
                <span style={{ fontWeight: 700, color: '#9D72FF' }}>New Job Available</span>
              </div>
              <p style={{ fontWeight: 700, color: '#1A1A1E', marginBottom: '4px', textTransform: 'capitalize' }}>
                {toast.job.asset_type || '—'} • {toast.job.area || '—'}
              </p>
              <p style={{ fontWeight: 800, fontSize: '24px', color: '#9D72FF', marginBottom: '12px' }}>
                ₹{toast.job.estimated_pay ?? '—'}
              </p>
              <button 
                onClick={() => handleAccept(toast.job.id)}
                className="w-full rounded-lg py-2 font-bold transition-colors"
                style={{ background: '#9D72FF', color: 'white' }}
                onMouseEnter={e => e.target.style.background = '#7C3AED'}
                onMouseLeave={e => e.target.style.background = '#9D72FF'}
              >
                View Job
              </button>
            </>
          ) : (
            <>
              <div className="flex items-center gap-2 mb-2">
                <AlertCircle size={16} className="text-[#64748B]" />
                <span style={{ fontWeight: 700, color: '#64748B' }}>Job Taken</span>
              </div>
              <p style={{ fontSize: '14px', color: '#64748B' }}>A job in {toast.job.area || '—'} was taken by another contractor.</p>
            </>
          )}
        </div>
      )}

      {/* Empty State */}
      {!loading && jobs.length === 0 && (
        <div className="flex flex-col items-center justify-center" style={{ padding: '80px 40px' }}>
          <div className="relative mb-6">
            <div
              className="flex items-center justify-center relative z-10"
              style={{ width: '80px', height: '80px', background: 'white', borderRadius: '50%', border: '1px solid #E8E8F0' }}
            >
              <Briefcase size={48} color="#E8E8F0" />
            </div>
            <div className="absolute top-0 left-0 rounded-full animate-ping opacity-20" style={{ width: '80px', height: '80px', border: '2px solid #9D72FF' }}></div>
            <div className="absolute rounded-full animate-ping opacity-10" style={{ top: '-16px', left: '-16px', width: '112px', height: '112px', border: '1px solid #9D72FF', animationDelay: '0.5s' }}></div>
          </div>
          <h2 style={{ fontSize: '18px', fontWeight: 700, color: '#94A3B8', marginTop: '16px' }}>No jobs available right now</h2>
          <p style={{ fontSize: '14px', color: '#94A3B8' }}>New jobs will appear here instantly when dispatched</p>
        </div>
      )}

      {/* Loading skeleton */}
      {loading && (
        <div className="flex flex-col gap-4">
          {[1, 2, 3].map(i => (
            <div key={i} className="animate-pulse" style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '24px' }}>
              <div style={{ height: '16px', width: '120px', background: '#E8E8F0', borderRadius: '4px', marginBottom: '12px' }}></div>
              <div style={{ height: '14px', width: '240px', background: '#E8E8F0', borderRadius: '4px', marginBottom: '8px' }}></div>
              <div style={{ height: '14px', width: '180px', background: '#E8E8F0', borderRadius: '4px' }}></div>
            </div>
          ))}
        </div>
      )}

      {/* Jobs List */}
      <div className="flex flex-col" style={{ gap: '16px' }}>
        {jobs.map(job => {
          const topBar = getTopBarStyles(job.severity);
          const badge = getSeverityBadge(job.severity);
          const cardBorder = getCardBorder(job.severity);
          const assetConf = ASSET_TYPE_CONFIG[job.asset_type] || ASSET_TYPE_CONFIG.road;
          const AssetIcon = assetConf.icon;

          return (
            <div
              key={job.id}
              style={{
                background: '#FFFFFF',
                border: `1px solid ${cardBorder.borderColor || '#E8E8F0'}`,
                borderRadius: '16px',
                overflow: 'hidden',
                boxShadow: cardBorder.boxShadow || 'none',
                marginBottom: '0'
              }}
            >
              {/* Card Top Bar */}
              <div
                className="flex items-center justify-between"
                style={{
                  background: topBar.bg,
                  borderBottom: `1px solid ${topBar.border}`,
                  padding: '12px 20px'
                }}
              >
                <div className="flex items-center gap-3">
                  {/* Job ID pill */}
                  <span style={{ background: '#EDE9FF', color: '#7C3AED', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px' }}>
                    {job.id || '—'}
                  </span>
                  {/* Asset type icon */}
                  <div
                    className="flex items-center justify-center"
                    style={{ width: '28px', height: '28px', borderRadius: '6px', background: assetConf.bg }}
                  >
                    <AssetIcon size={14} color={assetConf.color} />
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {/* Time */}
                  <span style={{ fontSize: '12px', color: '#94A3B8' }}>{getTimeSince(job.dispatched_at)}</span>
                  {/* Severity badge */}
                  <span
                    style={{
                      background: badge.bg,
                      color: badge.color,
                      borderRadius: '9999px',
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}
                  >
                    {badge.label}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div style={{ padding: '20px' }}>
                {/* Location row */}
                <div className="flex items-center gap-2" style={{ marginBottom: '2px' }}>
                  <MapPin size={14} color="#9D72FF" />
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#1A1A1E' }}>{job.area || '—'}</span>
                  <span
                    style={{
                      background: '#F9F9FB',
                      border: '1px solid #E8E8F0',
                      color: '#64748B',
                      fontSize: '11px',
                      padding: '2px 8px',
                      borderRadius: '4px'
                    }}
                  >
                    {job.asset_id || '—'}
                  </span>
                </div>

                {/* Description */}
                <p style={{ fontSize: '14px', color: '#374151', lineHeight: 1.6, marginTop: '8px', marginBottom: '16px' }}>
                  {job.notification_text || job.fault_description || '—'}
                </p>

                {/* Pay section */}
                <div
                  className="flex items-center justify-between"
                  style={{
                    background: '#F9F9FB',
                    border: '1px solid #E8E8F0',
                    borderRadius: '10px',
                    padding: '14px 18px'
                  }}
                >
                  <div>
                    <div style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                      GOVERNMENT PAY
                    </div>
                    <div style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1E' }}>
                      ₹{job.estimated_pay != null ? Number(job.estimated_pay).toLocaleString() : '—'}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock size={14} color="#94A3B8" />
                    <span style={{ fontSize: '12px', color: '#64748B' }}>Immediate Payout</span>
                  </div>
                </div>
              </div>

              {/* Card Actions */}
              <div className="flex" style={{ padding: '16px 20px', borderTop: '1px solid #F4F4F8', gap: '12px' }}>
                <button
                  onClick={() => handleAccept(job.id)}
                  className="flex items-center justify-center gap-2 transition-all"
                  style={{
                    flex: 1,
                    background: '#9D72FF',
                    color: 'white',
                    borderRadius: '10px',
                    padding: '13px',
                    fontSize: '15px',
                    fontWeight: 700,
                    border: 'none',
                    cursor: 'pointer',
                    boxShadow: '0 4px 12px rgba(157,114,255,0.3)'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#7C3AED'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = '#9D72FF'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  <CheckCircle size={16} />
                  Accept Job
                </button>
                <button
                  onClick={() => handleSkip(job.id)}
                  className="transition-all"
                  style={{
                    padding: '13px 24px',
                    background: '#F9F9FB',
                    border: '1.5px solid #E8E8F0',
                    borderRadius: '10px',
                    fontSize: '15px',
                    fontWeight: 600,
                    color: '#64748B',
                    cursor: 'pointer'
                  }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#9D72FF'; e.currentTarget.style.color = '#9D72FF'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#E8E8F0'; e.currentTarget.style.color = '#64748B'; }}
                >
                  Skip
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
