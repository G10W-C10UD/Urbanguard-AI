// Admin layout — fixed sidebar + main content area wrapper for all /admin/* routes
import { useState } from 'react';
import { MessageSquare } from 'lucide-react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import Sidebar from '../../components/common/Sidebar.jsx';
import AIChatPanel from '../../components/ai/ChatPanel.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import Assets from './Assets.jsx';
import AssetMap from './AssetMap.jsx';
import BinarySearch from './BinarySearch.jsx';
import Reports from './Reports.jsx';
import Complaints from './Complaints.jsx';
import ContractorJobs from './ContractorJobs.jsx';
import Settings from './Settings.jsx';

export default function AdminLayout() {
  const [chatOpen, setChatOpen] = useState(false);
  const location = useLocation();
  const isMapPage = location.pathname === '/admin/map';

  return (
    <div style={{ height: '100vh', background: '#F9F9FB', overflow: 'hidden' }}>
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <main style={{ marginLeft: '240px', padding: isMapPage ? '0' : '32px 40px', height: '100vh', overflowY: 'auto', overflowX: 'hidden', overscrollBehavior: 'contain', background: '#F9F9FB' }}>
        <Routes>
          <Route index element={<Navigate to="overview" replace />} />
          <Route path="overview" element={<AdminDashboard />} />
          <Route path="map" element={<AssetMap />} />
          <Route path="assets" element={<Assets />} />
          <Route path="binary-search" element={<BinarySearch />} />
          <Route path="complaints" element={<Complaints />} />
          <Route path="contractor-jobs" element={<ContractorJobs />} />
          <Route path="ai-reports" element={<Reports />} />
          <Route path="settings" element={<Settings />} />
        </Routes>
      </main>

      {/* Floating AI Assistant Button */}
      <button
        id="ai-assistant-btn"
        onClick={() => setChatOpen(!chatOpen)}
        style={{
          position: 'fixed', bottom: '28px', right: '28px', width: '56px', height: '56px', 
          borderRadius: '16px', background: '#9D72FF', boxShadow: '0 8px 24px rgba(157,114,255,0.4)', 
          display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', zIndex: 99,
          transition: 'all 0.2s', border: 'none',
        }}
        onMouseOver={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.boxShadow = '0 12px 32px rgba(157,114,255,0.5)'; }}
        onMouseOut={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.boxShadow = '0 8px 24px rgba(157,114,255,0.4)'; }}
        aria-label="Toggle AI Assistant"
      >
        <MessageSquare size={22} color="white" />
        <div style={{ position: 'absolute', top: '-4px', right: '-4px', width: '12px', height: '12px', background: '#EF4444', borderRadius: '50%', border: '2px solid white' }} />
      </button>

      {/* AI Chat Sliding Panel */}
      <AIChatPanel isOpen={chatOpen} onClose={() => setChatOpen(false)} />
    </div>
  );
}
