// ContractorDashboard — layout shell with navbar, stats bar, and tab outlet
import React, { useEffect, useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext.jsx';
import { useSocket } from '../../hooks/useSocket.js';
import { Briefcase, ClipboardList, IndianRupee, LogOut, Shield } from 'lucide-react';
import axios from 'axios';

export default function ContractorDashboard() {
  const { user, logout } = useAuth();
  const { on, socket } = useSocket('contractor', user?.id);
  const navigate = useNavigate();

  const [stats, setStats] = useState({
    availableJobs: 0,
    activeJobId: null,
    completedMonth: 0,
    totalEarnings: 0
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const [availableRes, myJobsRes] = await Promise.all([
          axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/available`),
          axios.get(`${import.meta.env.VITE_API_URL}/api/jobs/my-jobs`)
        ]);
        
        const availableCount = availableRes.data.data.length;
        const myJobs = myJobsRes.data.data;
        const activeJob = myJobs.find(j => ['assigned', 'en_route', 'in_progress'].includes(j.status));
        
        const completedThisMonth = myJobs.filter(j => 
          ['completed', 'payment_pending', 'paid'].includes(j.status) && 
          new Date(j.completed_at).getMonth() === new Date().getMonth()
        ).length;

        const earnings = myJobs.reduce((sum, j) => {
          if (['completed', 'payment_pending', 'paid'].includes(j.status)) {
            return sum + (j.estimated_pay || 0);
          }
          return sum;
        }, 0);

        setStats({
          availableJobs: availableCount,
          activeJobId: activeJob?.id || null,
          completedMonth: completedThisMonth,
          totalEarnings: earnings
        });
      } catch (err) {
        console.error('Failed to fetch contractor stats:', err);
      }
    };
    
    fetchStats();

    const unbindNewJob = on('new_job', () => {
      setStats(prev => ({ ...prev, availableJobs: prev.availableJobs + 1 }));
    });
    
    const unbindJobTaken = on('job_taken', () => {
      setStats(prev => ({ ...prev, availableJobs: Math.max(0, prev.availableJobs - 1) }));
    });

    return () => {
      unbindNewJob();
      unbindJobTaken();
    };
  }, [on]);

  const tabClass = ({ isActive }) =>
    `flex items-center gap-1.5 px-5 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-colors ${
      isActive ? 'bg-[#F3EEFF] text-[#9D72FF]' : 'text-[#64748B] hover:text-[#1A1A1E]'
    }`;

  return (
    <div className="min-h-screen bg-[#F9F9FB]">
      {/* Top Navbar */}
      <nav
        className="bg-white sticky top-0 z-50 flex items-center justify-between"
        style={{ borderBottom: '1px solid #E8E8F0', height: '64px', padding: '0 40px' }}
      >
        {/* Left — Logo */}
        <div className="flex items-center gap-1.5">
          <Shield size={20} className="text-[#9D72FF]" />
          <span style={{ fontWeight: 800, color: '#1A1A1E', fontSize: '18px' }}>Urban</span>
          <span style={{ fontWeight: 800, color: '#9D72FF', fontSize: '18px' }}>Guard-AI</span>
        </div>

        {/* Center — Tab Navigation */}
        <div className="flex items-center gap-1">
          <NavLink to="/contractor/jobs" className={tabClass}>
            <Briefcase size={15} />
            Job Board
          </NavLink>
          <NavLink to="/contractor/my-jobs" className={tabClass}>
            <ClipboardList size={15} />
            My Jobs
          </NavLink>
          <NavLink to="/contractor/earnings" className={tabClass}>
            <IndianRupee size={15} />
            Earnings
          </NavLink>
        </div>

        {/* Right — User + Online + Logout */}
        <div className="flex items-center gap-4">
          <span style={{ fontWeight: 600, color: '#1A1A1E', fontSize: '14px' }}>
            {user?.name || user?.username || '—'}
          </span>
          <div
            className="flex items-center gap-1.5"
            style={{
              background: '#DCFCE7',
              color: '#16A34A',
              borderRadius: '9999px',
              padding: '4px 12px',
              fontSize: '12px',
              fontWeight: 600
            }}
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#16A34A] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#16A34A]"></span>
            </span>
            Online
          </div>
          <button
            onClick={logout}
            className="text-[#64748B] hover:text-[#1A1A1E] transition-colors"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </nav>

      {/* Stats Bar */}
      <div
        className="bg-white flex items-center"
        style={{ borderBottom: '1px solid #E8E8F0', padding: '12px 40px', gap: '40px' }}
      >
        {/* Available Jobs */}
        <div className="flex flex-col" style={{ gap: '2px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Available Jobs
          </span>
          <div className="flex items-center gap-2">
            {stats.availableJobs > 0 && (
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#9D72FF] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-[#9D72FF]"></span>
              </span>
            )}
            <span style={{ fontSize: '18px', fontWeight: 800, color: '#9D72FF' }}>
              {stats.availableJobs}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: '#E8E8F0' }}></div>

        {/* Active Job */}
        <div className="flex flex-col" style={{ gap: '2px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Active Job
          </span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1E' }}>
            {stats.activeJobId || '—'}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: '#E8E8F0' }}></div>

        {/* Completed This Month */}
        <div className="flex flex-col" style={{ gap: '2px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Completed This Month
          </span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#1A1A1E' }}>
            {stats.completedMonth}
          </span>
        </div>

        {/* Divider */}
        <div style={{ width: '1px', height: '32px', background: '#E8E8F0' }}></div>

        {/* Total Earnings */}
        <div className="flex flex-col" style={{ gap: '2px' }}>
          <span style={{ fontSize: '10px', fontWeight: 700, color: '#94A3B8', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
            Total Earnings
          </span>
          <span style={{ fontSize: '18px', fontWeight: 800, color: '#16A34A' }}>
            ₹{stats.totalEarnings.toLocaleString()}
          </span>
        </div>
      </div>

      {/* Main Content — remove max-width wrapper so children control their own padding */}
      <Outlet />
    </div>
  );
}
