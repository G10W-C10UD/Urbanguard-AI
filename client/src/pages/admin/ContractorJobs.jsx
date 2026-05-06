import React, { useState, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb.jsx';
import axios from 'axios';
import { useSocket } from '../../hooks/useSocket.js';
import { Search, Filter, Briefcase, Plus, X, Activity, User, MapPin, Zap, CheckCircle2, UserCheck, Wrench, CheckCircle, IndianRupee, Lightbulb, Route, Droplets, CircleDot } from 'lucide-react';
import MarkdownRenderer from '../../components/ai/MarkdownRenderer.jsx';
import assets from '../../data/assets.js';

export default function ContractorJobs() {
  const { on } = useSocket('admin', null);
  
  const [jobs, setJobs] = useState([]);
  const [stats, setStats] = useState({
    total: 0, by_status: {}, by_asset_type: {}, completed_today: 0, total_pay_disbursed: 0
  });
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [statusFilter, setStatusFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [searchQuery, setSearchQuery] = useState('');

  // Modals / Panels
  const [selectedJob, setSelectedJob] = useState(null);
  const [isDispatchModalOpen, setIsDispatchModalOpen] = useState(false);

  const fetchJobs = async () => {
    try {
      const queryParams = new URLSearchParams();
      if (statusFilter) queryParams.append('status', statusFilter);
      if (typeFilter) queryParams.append('asset_type', typeFilter);
      if (searchQuery) queryParams.append('search', searchQuery);

      const [jobsRes, statsRes] = await Promise.all([
        axios.get(`${import.meta.env.VITE_API_URL}/api/jobs?${queryParams.toString()}`),
        axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/stats`)
      ]);
      setJobs(jobsRes.data.data || []);
      setStats(statsRes.data.data || {});
    } catch (err) {
      console.error('Failed to fetch jobs/stats:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();

    const unbindUpdate = on('job_status_update', () => {
      fetchJobs();
    });

    return () => {
      unbindUpdate();
    };
  }, [statusFilter, typeFilter, searchQuery, on]);

  const getStatusBadge = (status) => {
    const styles = {
      open: 'bg-[#EDE9FF] text-[#7C3AED] border border-[#DDD6FE]',
      assigned: 'bg-[#DBEAFE] text-[#2563EB] border border-[#BFDBFE]',
      en_route: 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]',
      in_progress: 'bg-[#FEF3C7] text-[#D97706] border border-[#FDE68A]',
      completed: 'bg-[#DCFCE7] text-[#16A34A] border border-[#BBF7D0]',
      payment_pending: 'bg-[#FEF3C7] text-[#B45309] border border-[#FDE68A]',
      paid: 'bg-[#F3EEFF] text-[#7E22CE] border border-[#DDD6FE]'
    };
    return <span style={{ minWidth: 110, width: 110, height: 26 }} className={`inline-flex items-center justify-center rounded-full text-[11px] font-bold uppercase tracking-[0.04em] ${styles[status] || 'bg-gray-100 text-gray-800'}`}>{status.replace('_', ' ')}</span>;
  };

  const getAssetIcon = (type) => {
    const map = {
      streetlight: { icon: <Lightbulb size={14} />, color: '#CA8A04', bg: '#FEF9C3' },
      road: { icon: <Route size={14} />, color: '#2563EB', bg: '#DBEAFE' },
      waterpipe: { icon: <Droplets size={14} />, color: '#0891B2', bg: '#CFFAFE' },
      sewer: { icon: <CircleDot size={14} />, color: '#7C3AED', bg: '#F3E8FF' },
    };
    return map[type] || map.streetlight;
  };

  const getAssetName = (assetId) => {
    const asset = assets.find(a => a.id === assetId);
    return asset ? asset.name : assetId;
  };

  const DispatchModal = () => {
    const [formData, setFormData] = useState({
      asset_id: '', asset_type: 'streetlight', area: '', fault_description: '', severity: 'moderate'
    });
    const [submitting, setSubmitting] = useState(false);

    // Auto-fill test logic (simplified for mockup)
    const handleAssetChange = (e) => {
      const id = e.target.value;
      const type = id.startsWith('SL') ? 'streetlight' : id.startsWith('RD') ? 'road' : id.startsWith('WP') ? 'waterpipe' : 'sewer';
      setFormData({ ...formData, asset_id: id, asset_type: type, area: 'Test Area' });
    };

    const handleDispatch = async (e) => {
      e.preventDefault();
      setSubmitting(true);
      try {
        await axios.post(`${import.meta.env.VITE_API_URL}/api/jobs`, formData);
        setIsDispatchModalOpen(false);
        fetchJobs();
      } catch (err) {
        alert(err.response?.data?.error || 'Failed to dispatch job');
      } finally {
        setSubmitting(false);
      }
    };

    if (!isDispatchModalOpen) return null;

    return (
      <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-2xl relative">
          <button onClick={() => setIsDispatchModalOpen(false)} className="absolute top-4 right-4 text-[#64748B] hover:text-bg">
            <X size={20} />
          </button>
          <h2 className="font-display font-bold text-2xl text-bg mb-6">Dispatch New Job</h2>
          
          <form onSubmit={handleDispatch} className="space-y-4">
            <div>
              <label className="block font-body text-sm font-bold text-[#374151] mb-1">Asset ID</label>
              <input required value={formData.asset_id} onChange={handleAssetChange} placeholder="e.g. SL-001" className="w-full border border-[#E8E8F0] rounded-lg px-4 py-2 font-body text-bg focus:border-[#E8372A] focus:outline-none" />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block font-body text-sm font-bold text-[#374151] mb-1">Severity</label>
                <select value={formData.severity} onChange={e => setFormData({ ...formData, severity: e.target.value })} className="w-full border border-[#E8E8F0] rounded-lg px-4 py-2 font-body text-bg focus:border-[#E8372A] focus:outline-none">
                  <option value="minor">Minor</option>
                  <option value="moderate">Moderate</option>
                  <option value="severe">Severe</option>
                  <option value="critical">Critical</option>
                </select>
              </div>
              <div>
                <label className="block font-body text-sm font-bold text-[#374151] mb-1">Area</label>
                <input required value={formData.area} onChange={e => setFormData({ ...formData, area: e.target.value })} className="w-full border border-[#E8E8F0] rounded-lg px-4 py-2 font-body text-bg focus:border-[#E8372A] focus:outline-none" />
              </div>
            </div>

            <div>
              <label className="block font-body text-sm font-bold text-[#374151] mb-1">Fault Description</label>
              <textarea required value={formData.fault_description} onChange={e => setFormData({ ...formData, fault_description: e.target.value })} rows={3} className="w-full border border-[#E8E8F0] rounded-lg px-4 py-2 font-body text-bg focus:border-[#E8372A] focus:outline-none"></textarea>
            </div>

            <button type="submit" disabled={submitting} className="w-full bg-[#E8372A] text-white rounded-full py-3 font-body font-bold mt-4 hover:bg-[#C62D21] transition-colors disabled:opacity-50">
              {submitting ? 'Dispatching...' : 'Dispatch to All Contractors'}
            </button>
          </form>
        </div>
      </div>
    );
  };

  const JobDetailPanel = () => {
    if (!selectedJob) return null;

    return (
      <div className="fixed inset-y-0 right-0 w-[500px] bg-white shadow-[-10px_0_30px_rgba(0,0,0,0.1)] z-40 border-l border-[#E8E8F0] flex flex-col animate-in slide-in-from-right-full duration-300">
        <div className="p-6 border-b border-[#E8E8F0] flex items-center justify-between">
          <div>
            <h2 className="font-display font-bold text-xl text-bg flex items-center gap-2">
              {selectedJob.id}
            </h2>
            <div className="mt-2">{getStatusBadge(selectedJob.status)}</div>
          </div>
          <button onClick={() => setSelectedJob(null)} className="p-2 hover:bg-[#F9F9FB] rounded-full text-[#64748B] transition-colors">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 flex-1 overflow-y-auto">
          {/* Details */}
          <div className="space-y-6">
            <div className="bg-[#F9F9FB] rounded-xl p-4 border border-[#E8E8F0]">
              <div className="flex items-center gap-2 text-[#64748B] mb-2 text-sm font-bold uppercase tracking-wider">
                <MapPin size={16} /> Asset Details
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-xs text-[#64748B]">Asset ID</span>
                  <p className="font-mono font-bold text-bg">{selectedJob.asset_id}</p>
                </div>
                <div>
                  <span className="text-xs text-[#64748B]">Type</span>
                  <p className="font-body font-bold text-bg capitalize">{selectedJob.asset_type}</p>
                </div>
                <div className="col-span-2">
                  <span className="text-xs text-[#64748B]">Location</span>
                  <p className="font-body font-bold text-bg">{selectedJob.area}</p>
                </div>
              </div>
            </div>

            <div className="bg-[#F9F9FB] rounded-xl p-4 border border-[#E8E8F0]">
              <div className="flex items-center gap-2 text-[#64748B] mb-2 text-sm font-bold uppercase tracking-wider">
                <User size={16} /> Contractor Info
              </div>
              {selectedJob.contractor_name ? (
                <div>
                  <p className="font-body font-bold text-bg">{selectedJob.contractor_name}</p>
                  <p className="text-sm text-[#64748B]">Accepted: {new Date(selectedJob.accepted_at).toLocaleString()}</p>
                </div>
              ) : (
                <p className="text-[#64748B] font-body text-sm italic">Unassigned (Open for bids)</p>
              )}
            </div>

            <div className="bg-[#F9F9FB] rounded-xl p-4 border border-[#E8E8F0]">
              <div className="flex items-center gap-2 text-[#64748B] mb-2 text-sm font-bold uppercase tracking-wider">
                <Zap size={16} /> Issue Description
              </div>
              <p className="font-body text-[#374151] text-sm leading-relaxed">
                {selectedJob.fault_description}
              </p>
            </div>

            <div className="bg-[#F9F9FB] rounded-xl p-4 border border-[#E8E8F0]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[#64748B] text-sm font-bold uppercase tracking-wider">
                  <Briefcase size={16} /> Total Pay
                </div>
                <span className="font-display font-extrabold text-2xl text-bg">₹{selectedJob.estimated_pay}</span>
              </div>
            </div>

            {selectedJob.status === 'completed' && selectedJob.completion_notes && (
              <div className="bg-[#E6F4EA] rounded-xl p-4 border border-[#A7E1BB]">
                <div className="flex items-center gap-2 text-green-800 mb-2 text-sm font-bold uppercase tracking-wider">
                  <CheckCircle2 size={16} /> Completion Notes
                </div>
                <p className="font-body text-green-900 text-sm leading-relaxed">
                  {selectedJob.completion_notes}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-7xl mx-auto">
      <Breadcrumb page="Contractor Jobs" />
      {/* Page Header */}
      <div className="flex items-center justify-between" style={{ marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 800, color: '#1A1A1E', letterSpacing: '-0.02em' }} className="font-display">Contractor Jobs</h1>
          <p style={{ fontSize: 14, color: '#64748B', marginTop: 4 }} className="font-body">Manage dispatched repair jobs and contractor assignments.</p>
        </div>
        <button 
          onClick={() => setIsDispatchModalOpen(true)}
          style={{ background: '#9D72FF', borderRadius: 10, padding: '11px 20px', fontSize: 14, fontWeight: 600, boxShadow: '0 4px 12px rgba(157,114,255,0.3)' }}
          className="text-white font-body flex items-center gap-2 hover:opacity-90 transition-opacity"
        >
          <Plus size={16} />
          Dispatch New Job
        </button>
      </div>

      {/* Stats Row */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 24 }}>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ background: '#EDE9FF', color: '#7C3AED', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Briefcase size={18} /></div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }} className="font-body">OPEN</span>
          <div className="flex items-center gap-2">
            <span style={{ fontSize: 36, fontWeight: 800, color: '#7C3AED', lineHeight: 1 }} className="font-display">{stats.by_status?.open || 0}</span>
            <span className="animate-pulse" style={{ width: 8, height: 8, borderRadius: '50%', background: '#7C3AED', display: 'inline-block' }} />
          </div>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ background: '#DBEAFE', color: '#2563EB', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><UserCheck size={18} /></div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }} className="font-body">ASSIGNED</span>
          <span style={{ fontSize: 36, fontWeight: 800, color: '#2563EB', lineHeight: 1 }} className="font-display">{stats.by_status?.assigned || 0}</span>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ background: '#FEF3C7', color: '#D97706', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><Wrench size={18} /></div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }} className="font-body">IN PROGRESS</span>
          <span style={{ fontSize: 36, fontWeight: 800, color: '#D97706', lineHeight: 1 }} className="font-display">{stats.by_status?.in_progress || 0}</span>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ background: '#DCFCE7', color: '#16A34A', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><CheckCircle size={18} /></div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }} className="font-body">COMPLETED TODAY</span>
          <span style={{ fontSize: 36, fontWeight: 800, color: '#16A34A', lineHeight: 1 }} className="font-display">{stats.completed_today}</span>
        </div>
        <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: 14, padding: '20px 24px', display: 'flex', flexDirection: 'column', gap: 4 }}>
          <div style={{ background: '#F3EEFF', color: '#9D72FF', width: 36, height: 36, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 12 }}><IndianRupee size={18} /></div>
          <span style={{ fontSize: 11, fontWeight: 700, color: '#64748B', letterSpacing: '0.08em', textTransform: 'uppercase' }} className="font-body">TOTAL PAY DISBURSED</span>
          <span style={{ fontSize: 28, fontWeight: 800, color: '#9D72FF', lineHeight: 1 }} className="font-display">₹{(stats.total_pay_disbursed || 0).toLocaleString('en-IN')}</span>
        </div>
      </div>

      {/* Filter Bar */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: 12, padding: '14px 20px', marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center' }}>
        <div className="flex-1 relative">
          <Search size={18} className="absolute top-1/2 -translate-y-1/2 text-[#64748B]" style={{ left: 14 }} />
          <input 
            type="text" 
            placeholder="Search by Job ID or Area..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{ flex: 1, background: '#F9F9FB', border: '1.5px solid #E8E8F0', borderRadius: 8, padding: '10px 16px 10px 40px', fontSize: 14, color: '#1A1A1E', width: '100%', outline: 'none' }}
            className="font-body focus:!border-[#9D72FF]"
          />
        </div>
        <select 
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          style={{ background: '#F9F9FB', border: '1.5px solid #E8E8F0', borderRadius: 8, padding: '10px 14px', fontSize: 14, minWidth: 140, outline: 'none' }}
          className="font-body focus:!border-[#9D72FF]"
        >
          <option value="">All Statuses</option>
          <option value="open">Open</option>
          <option value="assigned">Assigned</option>
          <option value="en_route">En Route</option>
          <option value="in_progress">In Progress</option>
          <option value="completed">Completed</option>
        </select>
        <select 
          value={typeFilter}
          onChange={(e) => setTypeFilter(e.target.value)}
          style={{ background: '#F9F9FB', border: '1.5px solid #E8E8F0', borderRadius: 8, padding: '10px 14px', fontSize: 14, minWidth: 140, outline: 'none' }}
          className="font-body focus:!border-[#9D72FF]"
        >
          <option value="">All Assets</option>
          <option value="streetlight">Street Light</option>
          <option value="road">Road</option>
          <option value="waterpipe">Water Pipe</option>
          <option value="sewer">Sewer</option>
        </select>
      </div>

      {/* Results Count */}
      {!loading && <p style={{ fontSize: 13, color: '#64748B', marginBottom: 12 }} className="font-body">Showing <strong style={{ color: '#1A1A1E' }}>{jobs.length}</strong> jobs</p>}

      {/* Jobs Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: 16, overflow: 'hidden' }}>
        {loading ? (
          <div className="p-12 flex justify-center"><Activity className="animate-spin" size={32} style={{ color: '#9D72FF' }} /></div>
        ) : jobs.length === 0 ? (
          <div style={{ padding: '64px 20px', textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
            <Briefcase size={40} color="#E8E8F0" />
            <p style={{ color: '#94A3B8', fontSize: 16, fontWeight: 600 }} className="font-body">No jobs found</p>
            <p style={{ color: '#94A3B8', fontSize: 13 }} className="font-body">Try adjusting your filters</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left" style={{ borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#F9F9FB', borderBottom: '2px solid #E8E8F0' }}>
                  <th style={{ width: 130, fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px' }} className="font-body">Job ID</th>
                  <th style={{ width: 200, fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px' }} className="font-body">Asset</th>
                  <th style={{ width: 140, fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px' }} className="font-body">Area</th>
                  <th style={{ width: 110, fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px' }} className="font-body">Severity</th>
                  <th style={{ width: 160, fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px' }} className="font-body">Contractor</th>
                  <th style={{ width: 130, fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px' }} className="font-body">Status</th>
                  <th style={{ width: 120, fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px' }} className="font-body">Pay</th>
                  <th style={{ width: 100, fontSize: 11, fontWeight: 700, color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.1em', padding: '14px 20px' }} className="font-body">Action</th>
                </tr>
              </thead>
              <tbody className="font-body">
                {jobs.map((job) => {
                  const assetIcon = getAssetIcon(job.asset_type);
                  const assetName = getAssetName(job.asset_id);
                  const initials = job.contractor_name ? job.contractor_name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2) : '';
                  const rowBorder = job.severity === 'critical' ? '3px solid #DC2626' : job.severity === 'severe' ? '3px solid #F59E0B' : 'none';
                  return (
                  <tr key={job.id} style={{ height: 72, borderBottom: '1px solid #F4F4F8', borderLeft: rowBorder, verticalAlign: 'middle', cursor: 'pointer', transition: 'background 0.15s' }} onMouseEnter={e => e.currentTarget.style.background='#FAFAFA'} onMouseLeave={e => e.currentTarget.style.background='transparent'}>
                    <td style={{ padding: '0 20px' }}>
                      <span style={{ background: '#EDE9FF', color: '#7C3AED', fontSize: 12, fontWeight: 700, padding: '5px 10px', borderRadius: 6, fontFamily: "'Plus Jakarta Sans', sans-serif", display: 'inline-block' }}>{job.id}</span>
                    </td>
                    <td style={{ padding: '0 20px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 26, height: 26, borderRadius: 6, background: assetIcon.bg, color: assetIcon.color, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{assetIcon.icon}</div>
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                          <span style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1E' }}>{job.asset_id}</span>
                          <span style={{ fontSize: 12, color: '#64748B' }}>{assetName}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '0 20px', fontSize: 14, fontWeight: 500, color: '#1A1A1E' }}>{job.area}</td>
                    <td style={{ padding: '0 20px' }}>
                      <span style={{ minWidth: 90, width: 90, height: 24, display: 'inline-flex', alignItems: 'center', justifyContent: 'center', borderRadius: 9999, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.04em', ...(job.severity === 'critical' ? { background: '#FEE2E2', color: '#DC2626', border: '1px solid #FECACA' } : { background: '#FEF3C7', color: '#D97706', border: '1px solid #FDE68A' }) }}>
                        {job.severity}
                      </span>
                    </td>
                    <td style={{ padding: '0 20px' }}>
                      {job.contractor_name ? (
                        <div style={{ display: 'flex', alignItems: 'center' }}>
                          <div style={{ width: 28, height: 28, borderRadius: '50%', background: '#9D72FF', color: 'white', fontSize: 11, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{initials}</div>
                          <span style={{ fontSize: 13, fontWeight: 500, color: '#1A1A1E', marginLeft: 8 }}>{job.contractor_name}</span>
                        </div>
                      ) : (
                        <span style={{ color: '#94A3B8', fontSize: 13, fontStyle: 'italic' }}>Awaiting contractor</span>
                      )}
                    </td>
                    <td style={{ padding: '0 20px' }}>{getStatusBadge(job.status)}</td>
                    <td style={{ padding: '0 20px' }}>
                      {job.estimated_pay ? (
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1E' }}>₹{Number(job.estimated_pay).toLocaleString('en-IN')}</span>
                      ) : (
                        <span style={{ color: '#94A3B8' }}>—</span>
                      )}
                    </td>
                    <td style={{ padding: '0 20px' }}>
                      <button 
                        onClick={() => setSelectedJob(job)}
                        style={{ background: '#F9F9FB', border: '1.5px solid #E8E8F0', borderRadius: 8, padding: '7px 14px', fontSize: 13, fontWeight: 600, color: '#64748B', cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
                        onMouseEnter={e => { e.currentTarget.style.background='#EDE9FF'; e.currentTarget.style.borderColor='#9D72FF'; e.currentTarget.style.color='#9D72FF'; }}
                        onMouseLeave={e => { e.currentTarget.style.background='#F9F9FB'; e.currentTarget.style.borderColor='#E8E8F0'; e.currentTarget.style.color='#64748B'; }}
                        className="font-body"
                      >
                        View Details
                      </button>
                    </td>
                  </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <DispatchModal />
      <JobDetailPanel />
      
      {/* Overlay for panel */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/20 z-30 transition-opacity" onClick={() => setSelectedJob(null)}></div>
      )}
    </div>
  );
}
