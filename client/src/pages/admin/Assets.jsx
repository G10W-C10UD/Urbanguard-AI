import { useState, useMemo, useEffect } from 'react';
import Breadcrumb from '../../components/common/Breadcrumb.jsx';
import { useAssets } from '../../context/AssetContext.jsx';
import AssetDetailPanel from '../../components/map/AssetDetailPanel.jsx';

import NLSearchBar from '../../components/ai/NLSearchBar.jsx';

/* ─── Icons ─── */
const iconClass = "w-5 h-5";

const icons = {
  streetlight: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
    </svg>
  ),
  road: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 21h16.5M4.5 3h15M5.25 3v18m13.5-18v18M9 6.75h1.5m-1.5 3h1.5m-1.5 3h1.5m3-6H15m-1.5 3H15m-1.5 3H15M9 21v-3.375c0-.621.504-1.125 1.125-1.125h3.75c.621 0 1.125.504 1.125 1.125V21" />
    </svg>
  ),
  waterpipe: (
    <svg className={iconClass} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 2.25c-2.25 3-6 5.25-6 9a6 6 0 1012 0c0-3.75-3.75-6-6-9z" />
    </svg>
  ),
  sewer: (
    <svg className={iconClass} fill="none" viewBox="0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 9.563C9 9.252 9.252 9 9.563 9h4.874c.311 0 .563.252.563.563v4.874c0 .311-.252.563-.563.563H9.564A.562.562 0 019 14.437V9.564z" />
    </svg>
  ),
};

const statusConfig = {
  healthy: { label: 'Healthy', bg: '#DCFCE7', color: '#16A34A' },
  warning: { label: 'Warning', bg: '#FEF3C7', color: '#D97706' },
  critical: { label: 'Critical', bg: '#FEE2E2', color: '#DC2626' },
  repair: { label: 'Under Repair', bg: '#DBEAFE', color: '#2563EB' },
};

const statusHealthBar = {
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
  repair: '#3B82F6',
};

/* ─── Assets Page Component ─── */
export default function Assets() {
  const { assets: ctxAssets, iotReadings } = useAssets();
  const [activeTab, setActiveTab] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('All Statuses');
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'asc' });
  const [detailAsset, setDetailAsset] = useState(null);
  
  // AI NL Search filters
  const [aiFilters, setAIFilters] = useState({ type: '', status: '', area: '', deviation_above: null, health_score_below: null });

  // Pagination
  const [currentPage, setCurrentPage] = useState(1);
  const rowsPerPage = 25;

  const tabs = ['All', 'Street Lights', 'Roads', 'Water Pipelines', 'Sewers'];
  const tabTypeMap = {
    'All': null,
    'Street Lights': 'streetlight',
    'Roads': 'road',
    'Water Pipelines': 'waterpipe',
    'Sewers': 'sewer'
  };

  const statusLabelToKey = {
    'Healthy': 'healthy',
    'Warning': 'warning',
    'Critical': 'critical',
    'Under Repair': 'repair',
    'Under_repair': 'repair',
    'repaired': 'repair'
  };

  const handleAIFilterChange = (filters) => {
    setAIFilters(filters);
    
    // Automatically switch the type tab to 'All'
    setActiveTab('All');
    
    // Update the status dropdown UI to reflect the filtered status visually
    if (filters.status) {
      const lowerReqStatus = filters.status.toLowerCase();
      if (lowerReqStatus === 'warning') setStatusFilter('Warning');
      else if (lowerReqStatus === 'critical') setStatusFilter('Critical');
      else if (lowerReqStatus === 'healthy') setStatusFilter('Healthy');
      else if (lowerReqStatus === 'repair' || lowerReqStatus === 'under_repair') setStatusFilter('Under Repair');
    } else {
      setStatusFilter('All Statuses');
    }
  };

  const enrichedAssets = useMemo(() => {
    if (!ctxAssets) return [];
    return ctxAssets.map(a => {
      const reading = iotReadings[a.id];
      return {
        ...a,
        healthScore: a.healthScore ?? 100,
        iotReading: reading ? reading.actual : '-',
        unit: reading ? reading.unit : a.unit,
        deviation: reading ? reading.deviation : 0,
        lastMaintained: 'Recently'
      };
    });
  }, [ctxAssets, iotReadings]);

  // Filter Data
  const filteredAssets = useMemo(() => {
    return enrichedAssets.filter(asset => {
      let uiTypeMatch = activeTab === 'All' || asset.type === tabTypeMap[activeTab];
      let uiStatusMatch = statusFilter === 'All Statuses' || asset.status === statusLabelToKey[statusFilter];
      
      const q = searchQuery.toLowerCase();
      let uiSearchMatch = !q || 
        asset.id.toLowerCase().includes(q) || 
        asset.name.toLowerCase().includes(q) || 
        asset.area.toLowerCase().includes(q);

      let aiTypeMatch = !aiFilters.type || asset.type.toLowerCase() === aiFilters.type.toLowerCase();
      let aiStatusMatch = !aiFilters.status || asset.status.toLowerCase() === aiFilters.status.toLowerCase();
      let aiAreaMatch = !aiFilters.area || asset.area.toLowerCase().includes(aiFilters.area.toLowerCase());
      let aiDeviationMatch = aiFilters.deviation_above == null || Math.abs(asset.deviation) >= aiFilters.deviation_above;
      let aiHealthMatch = aiFilters.health_score_below == null || asset.healthScore <= aiFilters.health_score_below;

      return uiTypeMatch && uiStatusMatch && uiSearchMatch && aiTypeMatch && aiStatusMatch && aiAreaMatch && aiDeviationMatch && aiHealthMatch;
    }).sort((a, b) => {
      if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
      if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
      return 0;
    });
  }, [activeTab, searchQuery, statusFilter, sortConfig, aiFilters, enrichedAssets]);

  const totalPages = Math.ceil(filteredAssets.length / rowsPerPage);
  const currentAssets = filteredAssets.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, searchQuery, statusFilter, aiFilters]);

  const handleSort = (key) => {
    setSortConfig(prev => ({
      key,
      direction: prev.key === key && prev.direction === 'asc' ? 'desc' : 'asc'
    }));
  };

  return (
    <div>
      <Breadcrumb page="Assets" />
      {/* Page Header */}
      <div style={{ marginBottom: '32px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <h1 className="font-body" style={{ fontSize: '28px', fontWeight: 800, color: '#1A1A1E', letterSpacing: '-0.02em' }}>Assets · Live Data</h1>
          <span className="w-3 h-3 rounded-full bg-[#22C55E] animate-pulse" />
        </div>
        <p className="font-body" style={{ fontSize: '14px', color: '#64748B', marginTop: '4px' }}>Unified view of all infrastructure assets across Chennai.</p>
      </div>

      <NLSearchBar onFilterChange={handleAIFilterChange} resultCount={filteredAssets.length} />

      {/* Top Controls Toolbar */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center" style={{ marginBottom: '24px' }}>
        
        {/* Tabs */}
        <div className="flex overflow-x-auto max-w-full" style={{ gap: '8px' }}>
          {tabs.map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className="font-body whitespace-nowrap transition-colors"
              style={{
                padding: '12px 24px',
                fontSize: '15px',
                fontWeight: 600,
                color: activeTab === tab ? '#9D72FF' : '#94A3B8',
                borderBottom: activeTab === tab ? '3px solid #9D72FF' : '3px solid transparent',
              }}
            >
              {tab}
            </button>
          ))}
        </div>

        <div className="flex flex-col sm:flex-row gap-4 w-full xl:w-auto" style={{ marginTop: '16px', marginBottom: '16px' }}>
          {/* Search */}
          <div className="relative w-full sm:w-64">
            <svg style={{ left: '20px' }} className="w-4 h-4 absolute top-1/2 -translate-y-1/2" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2} color="#94A3B8">
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
            </svg>
            <input 
              type="text" 
              placeholder="Search ID, Name or Area..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full font-body focus:outline-none transition-colors"
              style={{
                height: '48px',
                fontSize: '15px',
                padding: '0 20px',
                paddingLeft: '44px',
                background: '#F9F9FB',
                border: '1.5px solid #E8E8F0',
                borderRadius: '8px',
                color: '#1A1A1E',
              }}
              onFocus={e => { e.target.style.borderColor = '#9D72FF'; e.target.style.boxShadow = '0 0 0 3px rgba(157,114,255,0.1)'; }}
              onBlur={e => { e.target.style.borderColor = '#E8E8F0'; e.target.style.boxShadow = 'none'; }}
            />
          </div>

          {/* Status Dropdown */}
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full sm:w-48 font-body focus:outline-none transition-colors appearance-none cursor-pointer"
            style={{
              height: '48px',
              fontSize: '14px',
              padding: '0 20px',
              background: '#F9F9FB',
              border: '1.5px solid #E8E8F0',
              borderRadius: '8px',
              color: '#1A1A1E',
            }}
          >
            <option value="All Statuses">All Statuses</option>
            <option value="Healthy">Healthy</option>
            <option value="Warning">Warning</option>
            <option value="Critical">Critical</option>
            <option value="Under Repair">Under Repair</option>
          </select>
        </div>
      </div>

      {/* Asset Data Table */}
      <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '12px', overflow: 'hidden' }}>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left border-collapse">
            <thead>
              <tr style={{ height: '56px', background: '#F9F9FB', borderBottom: '1px solid #E8E8F0' }}>
                {['ID', 'Type', 'Name/Area', 'Status', 'Health Score', 'IoT Reading', 'Deviation', 'Last Maintained', 'Action'].map(col => (
                  <th 
                    key={col} 
                    className="font-body cursor-pointer transition-colors text-left"
                    style={{
                      padding: '14px 20px',
                      fontSize: '11px',
                      letterSpacing: '0.08em',
                      color: '#64748B',
                      fontWeight: 700,
                      textTransform: 'uppercase'
                    }}
                    onClick={() => {
                      const mapping = {
                        'ID': 'id', 'Type': 'type', 'Name/Area': 'name', 'Status': 'status',
                        'Health Score': 'healthScore', 'IoT Reading': 'iotReading',
                        'Deviation': 'deviation', 'Last Maintained': 'lastMaintained', 'Action': 'id'
                      };
                      handleSort(mapping[col]);
                    }}
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      {sortConfig.key === col.toLowerCase() && (
                        <svg className={`w-3 h-3 transition-transform ${sortConfig.direction === 'desc' ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                        </svg>
                      )}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {currentAssets.map(asset => {
                const conf = statusConfig[asset.status];
                
                let borderLeft = 'none';
                if (asset.status === 'critical') borderLeft = '3px solid #EF4444';
                if (asset.status === 'warning') borderLeft = '3px solid #F59E0B';
                
                return (
                  <tr key={asset.id} className="transition-colors" style={{ height: '68px', borderBottom: '1px solid #F4F4F8', borderLeft }} onMouseOver={e => e.currentTarget.style.background = '#FAFAFA'} onMouseOut={e => e.currentTarget.style.background = 'transparent'}>
                    {/* ID */}
                    <td style={{ padding: '0 20px' }}>
                      <span className="font-body" style={{ fontSize: '13px', fontWeight: 700, color: '#9D72FF' }}>{asset.id}</span>
                    </td>

                    {/* Type Icon */}
                    <td style={{ padding: '0 20px' }}>
                      <div style={{ width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#F3EEFF', borderRadius: '8px', color: '#9D72FF' }}>
                        {icons[asset.type]}
                      </div>
                    </td>

                    {/* Name/Area */}
                    <td style={{ padding: '0 20px' }}>
                      <div className="font-body" style={{ fontSize: '14px', fontWeight: 600, color: '#1A1A1E' }}>{asset.name}</div>
                      <div className="font-body" style={{ fontSize: '12px', color: '#64748B', marginTop: '2px' }}>{asset.area}</div>
                    </td>

                    {/* Status Badge */}
                    <td style={{ padding: '0 20px' }} className="whitespace-nowrap">
                      <span className="inline-flex items-center font-body" style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '9999px', fontWeight: 600, background: conf.bg, color: conf.color }}>
                        {conf.label}
                      </span>
                    </td>

                    {/* Health Score */}
                    <td style={{ padding: '0 20px' }} className="whitespace-nowrap w-32">
                      <div className="flex items-center">
                        <span className="font-body" style={{ fontSize: '16px', fontWeight: 700, color: '#1A1A1E', marginRight: '12px' }}>{asset.healthScore}</span>
                        <div style={{ height: '6px', width: '80px', borderRadius: '3px', background: '#F4F4F8', overflow: 'hidden' }}>
                          <div 
                            style={{ height: '100%', width: `${asset.healthScore}%`, background: statusHealthBar[asset.status] }}
                          />
                        </div>
                      </div>
                    </td>

                    {/* IoT Reading */}
                    <td style={{ padding: '0 20px' }} className="whitespace-nowrap font-body">
                      {asset.status === 'repair' ? (
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#94A3B8' }}>Offline</span>
                      ) : (
                        <span style={{ fontSize: '15px', fontWeight: 600, color: '#1A1A1E' }}>{asset.iotReading} <span style={{ fontSize: '12px', color: '#64748B', fontWeight: 400 }}>{asset.unit}</span></span>
                      )}
                    </td>

                    {/* Deviation */}
                    <td style={{ padding: '0 20px' }} className="whitespace-nowrap font-body">
                      {asset.status === 'repair' ? (
                        <span style={{ fontSize: '14px', fontWeight: 700, color: '#94A3B8' }}>-</span>
                      ) : (
                        <span style={{ fontSize: '14px', fontWeight: 700, color: conf.color }}>
                          -{asset.deviation}%
                        </span>
                      )}
                    </td>

                    {/* Last Maintained */}
                    <td style={{ padding: '0 20px' }} className="whitespace-nowrap font-body">
                      <span style={{ fontSize: '13px', color: '#64748B' }}>{asset.lastMaintained}</span>
                    </td>

                    {/* Action */}
                    <td style={{ padding: '0 20px' }} className="whitespace-nowrap text-right">
                      <div className="flex items-center justify-end" style={{ gap: '8px' }}>
                        <button 
                          onClick={() => setDetailAsset(asset)}
                          className="font-body transition-colors" 
                          style={{ fontSize: '13px', padding: '7px 14px', border: '1px solid #E8E8F0', borderRadius: '6px', color: '#64748B', background: '#F9F9FB', fontWeight: 500 }} 
                          onMouseOver={e => e.currentTarget.style.borderColor = '#9D72FF'} 
                          onMouseOut={e => e.currentTarget.style.borderColor = '#E8E8F0'}
                        >
                          Details
                        </button>
                        {(asset.status === 'warning' || asset.status === 'critical') && (
                          <button className="transition-colors font-body" style={{ fontSize: '13px', padding: '7px 14px', background: '#9D72FF', color: 'white', borderRadius: '6px', fontWeight: 600, border: 'none', cursor: 'pointer' }} onMouseOver={e => e.currentTarget.style.backgroundColor = '#8B5CF6'} onMouseOut={e => e.currentTarget.style.backgroundColor = '#9D72FF'}>
                            Dispatch Job
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}

              {currentAssets.length === 0 && (
                <tr>
                  <td colSpan="9" style={{ padding: '0 20px', height: '72px' }} className="text-center font-body text-sm" color="#64748B">
                    No assets found matching your filters.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center w-full" style={{ marginTop: '24px', height: '64px' }}>
          <div className="flex gap-2">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className="font-body transition-colors flex items-center justify-center font-medium"
                style={{
                  width: '40px',
                  height: '40px',
                  borderRadius: '8px',
                  fontSize: '14px',
                  background: currentPage === page ? '#9D72FF' : '#FFFFFF',
                  color: currentPage === page ? '#FFFFFF' : '#64748B',
                  border: currentPage === page ? 'none' : '1px solid #E8E8F0'
                }}
                onMouseOver={e => {
                  if (currentPage !== page) e.currentTarget.style.background = '#F3EEFF';
                }}
                onMouseOut={e => {
                  if (currentPage !== page) e.currentTarget.style.background = '#FFFFFF';
                }}
              >
                {page}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Asset Detail side panel */}
      <AssetDetailPanel asset={detailAsset} onClose={() => setDetailAsset(null)} />
    </div>
  );
}
