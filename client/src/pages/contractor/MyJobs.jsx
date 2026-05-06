// MyJobs — active job lifecycle, AI briefing, stepper, and past jobs table
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext.jsx';
import { useGroqStream } from '../../hooks/useGroqStream.js';
import StreamingText from '../../components/ai/StreamingText.jsx';
import {
  Truck, Wrench, CheckCircle, Navigation, Camera, CheckCircle2,
  MapPin, Lightbulb, Construction, Droplets, Waves, Package, FileText
} from 'lucide-react';
import MarkdownRenderer from '../../components/ai/MarkdownRenderer.jsx';

const ASSET_TYPE_CONFIG = {
  streetlight: { icon: Lightbulb, bg: '#FEF3C7', color: '#D97706', label: 'Street Light' },
  road:        { icon: Construction, bg: '#DBEAFE', color: '#2563EB', label: 'Road' },
  waterpipe:   { icon: Droplets, bg: '#D1FAE5', color: '#059669', label: 'Water Pipe' },
  sewer:       { icon: Waves, bg: '#EDE9FE', color: '#7C3AED', label: 'Sewer' },
};

export default function MyJobs() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [activeJob, setActiveJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [completionNotes, setCompletionNotes] = useState('');
  const [showCompletionForm, setShowCompletionForm] = useState(false);
  const [justCompleted, setJustCompleted] = useState(false);

  const { text: briefingText, loading: briefingLoading, error: briefingError, startStream } = useGroqStream();

  const fetchJobs = async () => {
    try {
      const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/my-jobs`);
      const myJobs = res.data.data || [];
      setJobs(myJobs);

      const active = myJobs.find(j => ['assigned', 'en_route', 'in_progress'].includes(j.status));
      setActiveJob(active || null);

      if (active && !briefingText) {
        startStream(`/api/ai/briefing/${active.id}`, { method: 'GET' });
      }
    } catch (err) {
      console.error('Failed to fetch my jobs:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, []);

  const updateStatus = async (status) => {
    try {
      const res = await axios.put(
        `${import.meta.env.VITE_API_URL}/api/jobs/${activeJob.id}/status`,
        { status, completion_notes: completionNotes }
      );
      if (res.data.success) {
        if (status === 'completed') {
          setJustCompleted(true);
          setShowCompletionForm(false);
          setActiveJob(null);
          setTimeout(() => setJustCompleted(false), 5000);
        }
        fetchJobs();
      }
    } catch (err) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const steps = [
    { id: 'assigned', label: 'Assigned', icon: CheckCircle2 },
    { id: 'en_route', label: 'En Route', icon: Navigation },
    { id: 'in_progress', label: 'Work Started', icon: Wrench },
    { id: 'completed', label: 'Completed', icon: CheckCircle }
  ];

  const getCurrentStepIndex = () => {
    if (!activeJob) return -1;
    return steps.findIndex(s => s.id === activeJob.status);
  };

  const pastJobs = jobs.filter(j => !['assigned', 'en_route', 'in_progress'].includes(j.status));
  const currentStepIdx = getCurrentStepIndex();

  const formatPay = (val) => {
    if (val == null || val === '' || val === undefined) return '—';
    return `₹${Number(val).toLocaleString()}`;
  };

  const safe = (val, fallback = '—') => (val != null && val !== '' ? val : fallback);

  return (
    <div style={{ background: '#F9F9FB', padding: '32px 40px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '24px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1E', marginBottom: '4px' }}>My Jobs</h1>
        <p style={{ fontSize: '14px', color: '#64748B' }}>Track your active job and view past payouts.</p>
      </div>

      {/* Just Completed Banner */}
      {justCompleted && (
        <div
          className="flex items-center justify-between"
          style={{ background: '#DCFCE7', border: '1px solid #BBF7D0', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px' }}
        >
          <div className="flex items-center gap-4">
            <div className="flex items-center justify-center" style={{ width: '48px', height: '48px', background: '#22C55E', borderRadius: '50%', color: 'white' }}>
              <CheckCircle size={24} />
            </div>
            <div>
              <h3 style={{ fontWeight: 700, color: '#14532D', fontSize: '18px' }}>Job Completed!</h3>
              <p style={{ color: '#166534', fontSize: '14px' }}>Payment of {formatPay(jobs[0]?.estimated_pay)} is now pending processing.</p>
            </div>
          </div>
        </div>
      )}

      {/* Active Job Card */}
      {activeJob && (
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '20px', overflow: 'hidden', marginBottom: '24px' }}>

          {/* Active Job Header */}
          <div
            className="flex items-center justify-between"
            style={{
              background: 'linear-gradient(135deg, #F3EEFF 0%, #EDE9FF 100%)',
              borderBottom: '1px solid #DDD6FE',
              padding: '20px 28px'
            }}
          >
            <div className="flex items-center gap-3">
              <span style={{ background: '#9D72FF', color: 'white', fontSize: '10px', fontWeight: 700, padding: '3px 10px', borderRadius: '9999px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Active Job
              </span>
              <span style={{ fontSize: '16px', fontWeight: 700, color: '#7C3AED' }}>{safe(activeJob.id)}</span>
            </div>
            <div className="text-right">
              <div style={{ fontSize: '11px', color: '#64748B', marginBottom: '2px' }}>Payout on completion</div>
              <div style={{ fontSize: '22px', fontWeight: 800, color: '#1A1A1E' }}>{formatPay(activeJob.estimated_pay)}</div>
            </div>
          </div>

          {/* Active Job Body — 2 columns */}
          <div style={{ padding: '28px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '28px' }}>

            {/* Left Column — Asset Details */}
            <div>
              <div style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em', marginBottom: '16px', textTransform: 'uppercase' }}>
                ASSET DETAILS
              </div>
              <div className="flex flex-col" style={{ gap: '12px' }}>
                {/* Type */}
                <div className="flex items-start gap-2.5">
                  <Package size={16} color="#9D72FF" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Type</div>
                    <div style={{ fontSize: '14px', color: '#1A1A1E', fontWeight: 600, textTransform: 'capitalize' }}>
                      {safe(activeJob.asset_type)}
                    </div>
                  </div>
                </div>
                {/* Asset ID */}
                <div className="flex items-start gap-2.5">
                  <FileText size={16} color="#9D72FF" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Asset ID</div>
                    <div style={{ fontSize: '14px', color: '#1A1A1E', fontWeight: 600 }}>
                      {safe(activeJob.asset_id)}
                    </div>
                  </div>
                </div>
                {/* Location */}
                <div className="flex items-start gap-2.5">
                  <MapPin size={16} color="#9D72FF" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600 }}>Location</div>
                    <div style={{ fontSize: '14px', color: '#1A1A1E', fontWeight: 600 }}>
                      {safe(activeJob.area)}
                    </div>
                  </div>
                </div>
                {/* Issue Description */}
                <div className="flex items-start gap-2.5">
                  <Wrench size={16} color="#9D72FF" style={{ marginTop: '2px', flexShrink: 0 }} />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: '12px', color: '#94A3B8', fontWeight: 600, marginBottom: '6px' }}>Issue</div>
                    <div style={{
                      background: '#FFF5F5',
                      border: '1px solid #FECACA',
                      borderRadius: '8px',
                      padding: '12px',
                      fontSize: '13px',
                      color: '#DC2626',
                      lineHeight: 1.6
                    }}>
                      {safe(activeJob.fault_description)}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Right Column — AI Briefing */}
            <div>
              <div className="flex items-center gap-2" style={{ marginBottom: '12px' }}>
                <span style={{ background: '#9D72FF', color: 'white', fontSize: '10px', fontWeight: 700, padding: '2px 8px', borderRadius: '4px' }}>AI</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#7C3AED', letterSpacing: '0.08em', textTransform: 'uppercase' }}>YOUR BRIEFING</span>
              </div>
              <div style={{
                background: '#FDFBFF',
                border: '1px solid #EDE9FF',
                borderRadius: '12px',
                padding: '16px',
                maxHeight: '200px',
                overflowY: 'auto'
              }}>
                {briefingLoading ? (
                  <div className="flex items-center gap-3" style={{ color: '#9D72FF', fontSize: '13px' }}>
                    <div className="flex gap-1">
                      <span className="animate-bounce" style={{ width: '6px', height: '6px', background: '#9D72FF', borderRadius: '50%', animationDelay: '0ms' }}></span>
                      <span className="animate-bounce" style={{ width: '6px', height: '6px', background: '#9D72FF', borderRadius: '50%', animationDelay: '150ms' }}></span>
                      <span className="animate-bounce" style={{ width: '6px', height: '6px', background: '#9D72FF', borderRadius: '50%', animationDelay: '300ms' }}></span>
                    </div>
                    <span style={{ fontWeight: 500 }}>Generating your briefing...</span>
                  </div>
                ) : briefingError ? (
                  <p style={{ color: '#DC2626', fontSize: '13px' }}>AI is temporarily unavailable.</p>
                ) : (
                  <MarkdownRenderer content={briefingText || activeJob.ai_briefing || 'No briefing available.'} />
                )}
              </div>
            </div>
          </div>

          {/* Job Lifecycle Stepper */}
          <div style={{ borderTop: '1px solid #F4F4F8', padding: '24px 28px' }}>
            <div className="flex items-center" style={{ width: '100%' }}>
              {steps.map((step, idx) => {
                const isCompleted = idx < currentStepIdx;
                const isCurrent = idx === currentStepIdx;
                const isFuture = idx > currentStepIdx;
                const Icon = step.icon;

                return (
                  <React.Fragment key={step.id}>
                    <div className="flex flex-col items-center" style={{ flexShrink: 0 }}>
                      <div
                        className="flex items-center justify-center"
                        style={{
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          background: isCompleted ? '#22C55E' : isCurrent ? '#9D72FF' : '#F9F9FB',
                          border: isFuture ? '2px solid #E8E8F0' : 'none',
                          color: (isCompleted || isCurrent) ? 'white' : '#94A3B8',
                          boxShadow: isCurrent ? '0 0 0 4px rgba(157,114,255,0.2)' : 'none',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {isCompleted ? <CheckCircle size={18} /> : <Icon size={18} />}
                      </div>
                      <span style={{
                        marginTop: '8px',
                        fontSize: '12px',
                        fontWeight: 600,
                        color: isCurrent ? '#9D72FF' : isCompleted ? '#16A34A' : '#94A3B8'
                      }}>
                        {step.label}
                      </span>
                    </div>
                    {/* Connector line */}
                    {idx < steps.length - 1 && (
                      <div style={{
                        flex: 1,
                        height: '3px',
                        borderRadius: '2px',
                        background: idx < currentStepIdx ? '#22C55E' : '#E8E8F0',
                        marginBottom: '24px'
                      }}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>

          {/* Status Update Button */}
          <div style={{ margin: '0 28px 24px' }}>
            {activeJob.status === 'assigned' && (
              <button
                onClick={() => updateStatus('en_route')}
                className="flex items-center justify-center gap-2.5 w-full transition-colors"
                style={{ background: '#3B82F6', color: 'white', borderRadius: '12px', padding: '15px', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#2563EB'}
                onMouseLeave={e => e.currentTarget.style.background = '#3B82F6'}
              >
                <Navigation size={18} /> I'm On My Way
              </button>
            )}
            {activeJob.status === 'en_route' && (
              <button
                onClick={() => updateStatus('in_progress')}
                className="flex items-center justify-center gap-2.5 w-full transition-colors"
                style={{ background: '#F59E0B', color: 'white', borderRadius: '12px', padding: '15px', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#D97706'}
                onMouseLeave={e => e.currentTarget.style.background = '#F59E0B'}
              >
                <Wrench size={18} /> Start Work
              </button>
            )}
            {activeJob.status === 'in_progress' && !showCompletionForm && (
              <button
                onClick={() => setShowCompletionForm(true)}
                className="flex items-center justify-center gap-2.5 w-full transition-colors"
                style={{ background: '#22C55E', color: 'white', borderRadius: '12px', padding: '15px', fontSize: '16px', fontWeight: 700, border: 'none', cursor: 'pointer' }}
                onMouseEnter={e => e.currentTarget.style.background = '#16A34A'}
                onMouseLeave={e => e.currentTarget.style.background = '#22C55E'}
              >
                <CheckCircle size={18} /> Mark Complete
              </button>
            )}

            {/* Completion Form */}
            {showCompletionForm && (
              <div className="flex flex-col gap-4" style={{ marginTop: '12px' }}>
                <h4 style={{ fontWeight: 700, color: '#1A1A1E', fontSize: '16px' }}>Complete Job Form</h4>
                <textarea
                  value={completionNotes}
                  onChange={e => setCompletionNotes(e.target.value)}
                  placeholder="Describe the work completed. Include any parts replaced or unexpected issues."
                  style={{
                    width: '100%', height: '120px', background: '#FFFFFF', border: '1px solid #E8E8F0',
                    borderRadius: '12px', padding: '14px', fontSize: '14px', color: '#1A1A1E',
                    resize: 'none', outline: 'none'
                  }}
                />
                <div
                  className="flex flex-col items-center justify-center cursor-pointer transition-colors"
                  style={{
                    border: '2px dashed #E8E8F0', background: 'white', borderRadius: '12px',
                    padding: '32px', color: '#64748B'
                  }}
                >
                  <Camera size={32} style={{ marginBottom: '8px' }} />
                  <span style={{ fontWeight: 500, fontSize: '14px' }}>Upload completion photos (optional)</span>
                  <span style={{ fontSize: '12px', marginTop: '4px' }}>Drag & drop or click to select</span>
                </div>
                <div className="flex gap-4">
                  <button
                    onClick={() => setShowCompletionForm(false)}
                    style={{
                      flex: 1, padding: '14px', background: 'white', border: '1px solid #E8E8F0',
                      borderRadius: '12px', fontWeight: 700, color: '#64748B', cursor: 'pointer', fontSize: '15px'
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => updateStatus('completed')}
                    className="flex items-center justify-center gap-2"
                    style={{
                      flex: 2, background: '#22C55E', color: 'white', borderRadius: '12px',
                      padding: '14px', fontWeight: 700, fontSize: '15px', border: 'none', cursor: 'pointer',
                      boxShadow: '0 4px 12px rgba(34,197,94,0.2)'
                    }}
                  >
                    <CheckCircle size={18} /> Submit Completion
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* No active job state */}
      {!loading && !activeJob && !justCompleted && (
        <div
          className="flex flex-col items-center justify-center"
          style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '20px', padding: '48px', marginBottom: '24px' }}
        >
          <div className="flex items-center justify-center" style={{ width: '64px', height: '64px', background: '#F3EEFF', borderRadius: '50%', marginBottom: '16px' }}>
            <CheckCircle2 size={28} color="#9D72FF" />
          </div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1E', marginBottom: '4px' }}>No active job</h3>
          <p style={{ fontSize: '14px', color: '#94A3B8' }}>Accept a job from the Job Board to get started</p>
        </div>
      )}

      {/* Past Jobs Section */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1E', marginBottom: '16px' }}>Past Jobs</h2>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{ background: '#F9F9FB', borderBottom: '1px solid #E8E8F0' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 160px 1fr 140px 120px 130px',
                padding: '0 20px',
                alignItems: 'center'
              }}
            >
              {['JOB ID', 'ASSET', 'AREA', 'DATE', 'PAY', 'STATUS'].map(h => (
                <span
                  key={h}
                  style={{
                    fontSize: '11px', fontWeight: 700, color: '#64748B',
                    textTransform: 'uppercase', letterSpacing: '0.08em', padding: '14px 0'
                  }}
                >
                  {h}
                </span>
              ))}
            </div>
          </div>

          {/* Table Body */}
          {pastJobs.length === 0 ? (
            <div className="flex items-center justify-center" style={{ padding: '48px', color: '#94A3B8', fontSize: '14px' }}>
              No completed jobs yet.
            </div>
          ) : (
            pastJobs.map(job => {
              const ac = ASSET_TYPE_CONFIG[job.asset_type] || ASSET_TYPE_CONFIG.road;
              const AssetIcon = ac.icon;

              return (
                <div
                  key={job.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 160px 1fr 140px 120px 130px',
                    padding: '0 20px',
                    alignItems: 'center',
                    height: '64px',
                    borderBottom: '1px solid #F4F4F8',
                    cursor: 'default'
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = '#FAFAFA'}
                  onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                >
                  {/* Job ID */}
                  <span style={{ background: '#EDE9FF', color: '#7C3AED', fontSize: '12px', fontWeight: 700, padding: '4px 10px', borderRadius: '6px', width: 'fit-content' }}>
                    {safe(job.id)}
                  </span>
                  {/* Asset */}
                  <div className="flex items-center gap-2">
                    <div className="flex items-center justify-center" style={{ width: '24px', height: '24px', borderRadius: '6px', background: ac.bg }}>
                      <AssetIcon size={12} color={ac.color} />
                    </div>
                    <span style={{ fontSize: '14px', color: '#1A1A1E', fontWeight: 500, textTransform: 'capitalize' }}>
                      {safe(job.asset_type)}
                    </span>
                  </div>
                  {/* Area */}
                  <span style={{ fontSize: '14px', color: '#1A1A1E' }}>{safe(job.area)}</span>
                  {/* Date */}
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    {job.completed_at ? new Date(job.completed_at).toLocaleDateString() : '—'}
                  </span>
                  {/* Pay */}
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#16A34A' }}>
                    {formatPay(job.estimated_pay)}
                  </span>
                  {/* Status */}
                  <span>
                    {['completed', 'paid'].includes(job.status) && (
                      <span style={{
                        background: '#DCFCE7', color: '#16A34A',
                        borderRadius: '9999px', padding: '4px 12px',
                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
                      }}>
                        Completed
                      </span>
                    )}
                    {job.status === 'payment_pending' && (
                      <span style={{
                        background: '#FEF3C7', color: '#D97706',
                        borderRadius: '9999px', padding: '4px 12px',
                        fontSize: '11px', fontWeight: 700, textTransform: 'uppercase'
                      }}>
                        Pending
                      </span>
                    )}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
