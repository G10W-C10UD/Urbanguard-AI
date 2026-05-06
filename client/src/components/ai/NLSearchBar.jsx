import { useState } from 'react';
import { AlertTriangle, Lightbulb, Wrench, HeartPulse, Search, X } from 'lucide-react';

const DEMO_CHIPS = [
  {
    label: 'Show all critical assets',
    icon: AlertTriangle,
    filters: { type: null, status: 'critical', area: null, deviation_above: null, health_score_below: null },
    description: 'All assets with critical status'
  },
  {
    label: 'All street lights',
    icon: Lightbulb,
    filters: { type: 'streetlight', status: null, area: null, deviation_above: null, health_score_below: null },
    description: 'Showing all 25 street lights'
  },
  {
    label: 'Assets needing repair',
    icon: Wrench,
    filters: { type: null, status: null, area: null, deviation_above: 20, health_score_below: null },
    description: 'Assets with deviation above 20%'
  },
  {
    label: 'Low health score assets',
    icon: HeartPulse,
    filters: { type: null, status: null, area: null, deviation_above: null, health_score_below: 50 },
    description: 'Assets with health score below 50'
  }
];

export default function NLSearchBar({ onFilterChange, resultCount }) {
  const [query, setQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeFilterDesc, setActiveFilterDesc] = useState('');

  const handleSearch = async (e, forcedQuery = null) => {
    if (e) e.preventDefault();
    const txt = forcedQuery || query;
    if (!txt.trim() || loading) return;

    setLoading(true);
    try {
      const token = localStorage.getItem('urbanguard_token');
      const res = await fetch('/api/ai/search', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ query: txt })
      });
      const data = await res.json();
      if (data.success && data.data) {
        onFilterChange({
          type: data.data.type === 'all' ? '' : data.data.type || '',
          status: data.data.status === 'all' ? '' : data.data.status || '',
          area: data.data.area === 'all' ? '' : data.data.area || '',
          deviation_above: data.data.deviation_above || null,
          health_score_below: data.data.health_score_below || null
        });
        setActiveFilterDesc(data.data.description);
        
        if (forcedQuery) setQuery(forcedQuery);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const clearFilter = () => {
    setQuery('');
    setActiveFilterDesc('');
    onFilterChange({ type: '', status: '', area: '', deviation_above: null, health_score_below: null });
  };

  const handleChipClick = (chip) => {
    setQuery(chip.label);
    setActiveFilterDesc(chip.description);
    onFilterChange({
      type: chip.filters.type || '',
      status: chip.filters.status || '',
      area: chip.filters.area || '',
      deviation_above: chip.filters.deviation_above || null,
      health_score_below: chip.filters.health_score_below || null
    });
  };

  return (
    <div style={{ background: '#FFFFFF', border: '1px solid #E8E8F0', borderRadius: '16px', padding: '20px 24px', marginBottom: '24px', boxShadow: '0 1px 3px rgba(0,0,0,0.06)' }}>
      <style>{`
        .search-input-hover::placeholder { color: #94A3B8; }
        .search-input-hover:focus {
          border-color: #9D72FF !important;
          outline: none !important;
          box-shadow: 0 0 0 3px rgba(157,114,255,0.08) !important;
        }
        .search-btn-hover:hover:not(:disabled) {
          background: #8B5CF6 !important;
        }
        .search-btn-hover:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }
        .chip-hover {
           background: #F9F9FB;
           border: 1.5px solid #E8E8F0;
           color: #64748B;
        }
        .chip-hover:hover {
           background: #F3EEFF !important;
           border-color: #9D72FF !important;
           color: #9D72FF !important;
        }
        .chip-hover:hover .chip-icon {
           color: #9D72FF !important;
        }
        .chip-active {
           background: #F3EEFF !important;
           border-color: #9D72FF !important;
           color: #9D72FF !important;
           font-weight: 600 !important;
        }
        .chip-active .chip-icon {
           color: #9D72FF !important;
        }
        .x-btn-hover:hover {
           color: #EF4444 !important;
        }
      `}</style>
      <form onSubmit={handleSearch} style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
        <div style={{ position: 'relative', flex: 1 }}>
          <Search style={{ position: 'absolute', left: '16px', top: '16px', color: '#94A3B8', width: '16px', height: '16px' }} />
          <input
            type="text"
            value={query}
            onChange={e => setQuery(e.target.value)}
            disabled={loading}
            placeholder='Ask anything... e.g. "Show critical water pipes in North Chennai"'
            className="search-input-hover font-body"
            style={{ width: '100%', background: '#F9F9FB', border: '1.5px solid #E8E8F0', borderRadius: '10px', padding: '13px 16px 13px 44px', fontSize: '14px', color: '#1A1A1E', height: '48px', transition: 'all 0.15s' }}
          />
        </div>
        <button
          type="submit"
          disabled={loading || !query.trim()}
          className="search-btn-hover font-body transition-colors"
          style={{ height: '48px', padding: '0 24px', background: '#9D72FF', color: 'white', borderRadius: '10px', fontSize: '14px', fontWeight: 600, whiteSpace: 'nowrap', boxShadow: '0 4px 12px rgba(157,114,255,0.25)', border: 'none', cursor: loading || !query.trim() ? 'not-allowed' : 'pointer' }}
        >
          {loading ? 'Searching...' : 'Search'}
        </button>
      </form>

      <div style={{ fontSize: '11px', fontWeight: 600, color: '#94A3B8', letterSpacing: '0.08em', textTransform: 'uppercase', marginBottom: '10px' }} className="font-body">
        QUICK FILTERS
      </div>

      <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
        {DEMO_CHIPS.map((chip, idx) => {
          const Icon = chip.icon;
          const isActive = activeFilterDesc === chip.description;
          return (
            <button
              type="button"
              key={idx}
              onClick={() => handleChipClick(chip)}
              className={`font-body transition-colors ${isActive ? 'chip-active' : 'chip-hover'}`}
              style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '9px 16px', borderRadius: '9999px', fontSize: '13px', fontWeight: isActive ? 600 : 500, cursor: 'pointer', whiteSpace: 'nowrap', transition: 'all 0.15s' }}
            >
              <Icon className="chip-icon transition-colors" style={{ width: '14px', height: '14px', color: isActive ? '#9D72FF' : '#94A3B8' }} />
              {chip.label}
            </button>
          );
        })}
      </div>

      {activeFilterDesc && (
        <div style={{ marginTop: '12px', paddingTop: '12px', borderTop: '1px solid #F4F4F8', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span className="font-body" style={{ fontSize: '11px', fontWeight: 700, color: '#94A3B8', letterSpacing: '0.08em' }}>ACTIVE:</span>
          <div className="font-body" style={{ display: 'flex', alignItems: 'center', gap: '6px', background: '#F3EEFF', border: '1px solid #EDE9FF', borderRadius: '9999px', padding: '5px 12px', fontSize: '13px', fontWeight: 500, color: '#9D72FF' }}>
            {activeFilterDesc}
            <X onClick={clearFilter} className="x-btn-hover transition-colors" style={{ width: '14px', height: '14px', color: '#9D72FF', cursor: 'pointer', marginLeft: '2px' }} />
          </div>
          {resultCount !== undefined && (
             <div className="font-body" style={{ fontSize: '13px', color: '#64748B', marginLeft: 'auto' }}>
               Showing {resultCount} results
             </div>
          )}
        </div>
      )}
    </div>
  );
}
