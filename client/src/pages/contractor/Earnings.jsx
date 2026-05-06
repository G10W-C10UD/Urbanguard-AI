// Earnings — contractor earnings dashboard with stats cards and breakdown table
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Info, TrendingUp, IndianRupee, CheckCircle2, Clock, Briefcase,
  Lightbulb, Construction, Droplets, Waves, Loader2
} from 'lucide-react';

const ASSET_TYPE_CONFIG = {
  streetlight: { icon: Lightbulb, bg: '#FEF3C7', color: '#D97706', label: 'Street Light' },
  road:        { icon: Construction, bg: '#DBEAFE', color: '#2563EB', label: 'Road' },
  waterpipe:   { icon: Droplets, bg: '#D1FAE5', color: '#059669', label: 'Water Pipe' },
  sewer:       { icon: Waves, bg: '#EDE9FE', color: '#7C3AED', label: 'Sewer' },
};

export default function Earnings() {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchEarnings = async () => {
      try {
        const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/my-jobs`);
        const completedJobs = (res.data.data || []).filter(j => ['completed', 'payment_pending', 'paid'].includes(j.status));
        setJobs(completedJobs);
      } catch (err) {
        console.error('Failed to fetch earnings:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchEarnings();
  }, []);

  const totalEarned = jobs.reduce((sum, j) => sum + (j.estimated_pay || 0), 0);
  const thisMonthEarned = jobs
    .filter(j => j.completed_at && new Date(j.completed_at).getMonth() === new Date().getMonth())
    .reduce((sum, j) => sum + (j.estimated_pay || 0), 0);
  const pendingPayment = jobs
    .filter(j => ['completed', 'payment_pending'].includes(j.status))
    .reduce((sum, j) => sum + (j.estimated_pay || 0), 0);
  const jobsCompleted = jobs.length;

  const formatPay = (val) => {
    if (val == null || val === '' || val === undefined) return '—';
    return `₹${Number(val).toLocaleString()}`;
  };

  const safe = (val, fallback = '—') => (val != null && val !== '' ? val : fallback);

  const getPaymentStatus = (status) => {
    if (status === 'paid') {
      return { label: 'PAID', bg: '#DCFCE7', color: '#16A34A', border: '#BBF7D0' };
    }
    if (status === 'payment_pending') {
      return { label: 'PROCESSING', bg: '#DBEAFE', color: '#2563EB', border: '#BFDBFE' };
    }
    // 'completed' = pending
    return { label: 'PENDING', bg: '#FEF3C7', color: '#D97706', border: '#FDE68A' };
  };

  return (
    <div style={{ background: '#F9F9FB', padding: '32px 40px' }}>
      {/* Page Header */}
      <div style={{ marginBottom: '16px' }}>
        <h1 style={{ fontSize: '24px', fontWeight: 800, color: '#1A1A1E', marginBottom: '4px' }}>Earnings Dashboard</h1>
        <p style={{ fontSize: '14px', color: '#64748B' }}>Track your payouts from Chennai Municipal Corporation.</p>
      </div>

      {/* Payment Info Banner */}
      <div
        className="flex items-center"
        style={{
          background: '#F3EEFF',
          border: '1px solid #DDD6FE',
          borderRadius: '12px',
          padding: '14px 20px',
          gap: '10px',
          marginBottom: '24px'
        }}
      >
        <Info size={16} color="#7C3AED" style={{ flexShrink: 0 }} />
        <span style={{ fontSize: '13px', color: '#7C3AED', fontWeight: 500 }}>
          Payments are processed by Chennai Municipal Corporation within 7 working days of job completion.
          Payouts are directly transferred to your registered bank account.
        </span>
      </div>

      {/* Stats Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', marginBottom: '24px' }}>
        {/* Total Earned */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '24px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DCFCE7' }}
          >
            <IndianRupee size={20} color="#16A34A" />
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', margin: '12px 0 6px', textTransform: 'uppercase' }}>
            TOTAL EARNED
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#16A34A' }}>
            {formatPay(totalEarned)}
          </div>
        </div>

        {/* This Month */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '24px' }}>
          <div className="flex items-center justify-between">
            <div
              className="flex items-center justify-center"
              style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#DBEAFE' }}
            >
              <TrendingUp size={20} color="#2563EB" />
            </div>
            {thisMonthEarned > 0 && (
              <span style={{ background: '#DCFCE7', color: '#16A34A', fontSize: '11px', fontWeight: 700, padding: '3px 8px', borderRadius: '6px' }}>
                +12%
              </span>
            )}
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', margin: '12px 0 6px', textTransform: 'uppercase' }}>
            THIS MONTH
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#2563EB' }}>
            {formatPay(thisMonthEarned)}
          </div>
        </div>

        {/* Pending Payment */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '24px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#FEF3C7' }}
          >
            <Clock size={20} color="#D97706" />
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', margin: '12px 0 6px', textTransform: 'uppercase' }}>
            PENDING PAYMENT
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#D97706' }}>
            {formatPay(pendingPayment)}
          </div>
        </div>

        {/* Jobs Done */}
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '24px' }}>
          <div
            className="flex items-center justify-center"
            style={{ width: '40px', height: '40px', borderRadius: '10px', background: '#F3EEFF' }}
          >
            <CheckCircle2 size={20} color="#9D72FF" />
          </div>
          <div style={{ fontSize: '11px', fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', margin: '12px 0 6px', textTransform: 'uppercase' }}>
            JOBS DONE
          </div>
          <div style={{ fontSize: '32px', fontWeight: 800, color: '#9D72FF' }}>
            {jobsCompleted}
          </div>
        </div>
      </div>

      {/* Earnings Breakdown Table */}
      <div>
        <h2 style={{ fontSize: '20px', fontWeight: 800, color: '#1A1A1E', marginBottom: '16px' }}>Earnings Breakdown</h2>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', overflow: 'hidden' }}>
          {/* Table Header */}
          <div style={{ background: '#F9F9FB', borderBottom: '1px solid #E8E8F0' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: '120px 150px 1fr 150px 120px 140px',
                padding: '0 20px',
                alignItems: 'center'
              }}
            >
              {['JOB ID', 'ASSET TYPE', 'AREA', 'COMPLETION DATE', 'AMOUNT', 'PAYMENT STATUS'].map(h => (
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
          {loading ? (
            <div className="flex items-center justify-center" style={{ padding: '48px' }}>
              <Loader2 size={24} color="#9D72FF" className="animate-spin" />
            </div>
          ) : jobs.length === 0 ? (
            <div className="flex flex-col items-center justify-center" style={{ padding: '64px', color: '#94A3B8' }}>
              <Briefcase size={40} color="#E8E8F0" style={{ marginBottom: '12px' }} />
              <span style={{ fontSize: '16px', fontWeight: 600 }}>No earnings yet</span>
              <span style={{ fontSize: '13px', marginTop: '4px' }}>Complete jobs to start earning</span>
            </div>
          ) : (
            jobs.map(job => {
              const ac = ASSET_TYPE_CONFIG[job.asset_type] || ASSET_TYPE_CONFIG.road;
              const AssetIcon = ac.icon;
              const ps = getPaymentStatus(job.status);

              return (
                <div
                  key={job.id}
                  style={{
                    display: 'grid',
                    gridTemplateColumns: '120px 150px 1fr 150px 120px 140px',
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
                  {/* Asset Type */}
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
                  {/* Completion Date */}
                  <span style={{ fontSize: '13px', color: '#64748B' }}>
                    {job.completed_at ? new Date(job.completed_at).toLocaleDateString() : '—'}
                  </span>
                  {/* Amount */}
                  <span style={{ fontSize: '15px', fontWeight: 700, color: '#16A34A' }}>
                    {formatPay(job.estimated_pay)}
                  </span>
                  {/* Payment Status */}
                  <span
                    style={{
                      background: ps.bg,
                      color: ps.color,
                      border: `1px solid ${ps.border}`,
                      borderRadius: '9999px',
                      padding: '4px 12px',
                      fontSize: '11px',
                      fontWeight: 700,
                      width: 'fit-content',
                      textTransform: 'uppercase'
                    }}
                  >
                    {ps.label}
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
