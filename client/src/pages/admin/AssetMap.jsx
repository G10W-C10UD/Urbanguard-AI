// AssetMap — full-screen interactive Leaflet map showing all 100 Chennai infrastructure assets
import { useState, useEffect, useMemo, useCallback } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import MarkerClusterGroup from 'react-leaflet-cluster';
import L from 'leaflet';
import axios from 'axios';
import MapStatsPanel from '../../components/map/MapStatsPanel.jsx';
import MapControls from '../../components/map/MapControls.jsx';
import AssetDetailPanel from '../../components/map/AssetDetailPanel.jsx';
import AssetPopupContent from '../../components/map/AssetPopup.jsx';
import { useAssets } from '../../context/AssetContext.jsx';

// Fix default Leaflet marker icon bug in React/Vite
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const MAP_CENTER = [13.0827, 80.2707];
const MAP_ZOOM = 12;
const LIGHT_TILE = 'https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png';

// ─── Status colours ───
const STATUS_COLORS = {
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
  under_repair: '#3B82F6',
};

// ─── Type SVG inner icons ───
function getTypeIcon(type, color) {
  switch (type) {
    case 'streetlight':
      return `<path d="M16 6a6 6 0 0 0-12 0c0 2.2 1.2 4 3 5v3h6v-3c1.8-1 3-2.8 3-5z" fill="${color}" opacity="0.9"/>
              <rect x="12" y="22" width="8" height="2" rx="1" fill="${color}" opacity="0.7"/>`;
    case 'road':
      return `<rect x="6" y="8" width="20" height="16" rx="2" fill="${color}" opacity="0.9"/>
              <rect x="14.5" y="10" width="3" height="4" rx="1" fill="#FFF" opacity="0.5"/>
              <rect x="14.5" y="17" width="3" height="4" rx="1" fill="#FFF" opacity="0.5"/>`;
    case 'waterpipe':
      return `<path d="M16 6 C16 6 8 16 8 20a8 8 0 0 0 16 0c0-4-8-14-8-14z" fill="${color}" opacity="0.9"/>`;
    case 'sewer':
      return `<circle cx="16" cy="16" r="9" fill="${color}" opacity="0.9"/>
              <circle cx="16" cy="16" r="5" fill="#FFF" opacity="0.3"/>
              <circle cx="16" cy="16" r="2.5" fill="${color}" opacity="0.7"/>`;
    default:
      return `<circle cx="16" cy="16" r="8" fill="${color}" opacity="0.9"/>`;
  }
}

// ─── Create custom DivIcon ───
function createCustomIcon(status, type) {
  const color = STATUS_COLORS[status] || '#94A3B8';
  const size = 32;
  const isCritical = status === 'critical';

  const pulseRing = isCritical
    ? `<div style="position:absolute;top:50%;left:50%;width:${size}px;height:${size}px;transform:translate(-50%,-50%);border-radius:50%;border:2px solid ${color};animation:marker-pulse-ring 1.5s ease-out infinite;pointer-events:none;"></div>`
    : '';

  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" width="${size}" height="${size}">
    <circle cx="16" cy="16" r="14" fill="#FFFFFF" stroke="${color}" stroke-width="2"/>
    <g transform="scale(0.7) translate(7, 7)">${getTypeIcon(type, color)}</g>
  </svg>`;

  return L.divIcon({
    html: `<div style="position:relative;width:${size}px;height:${size}px;">
      ${pulseRing}
      <div style="position:relative;z-index:2;">${svg}</div>
    </div>`,
    className: 'custom-asset-marker',
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2 + 4)],
  });
}

// ─── Cluster icon creator ───
function createClusterIcon(cluster) {
  const count = cluster.getChildCount();
  return L.divIcon({
    html: `<div style="
      width:42px;height:42px;
      background:#FFFFFF;
      border:2px solid #9D72FF;
      border-radius:50%;
      display:flex;align-items:center;justify-content:center;
      font-family:'Plus Jakarta Sans',sans-serif;
      font-weight:700;font-size:14px;color:#1A1A1E;
      box-shadow:0 2px 8px rgba(157,114,255,0.25);
    ">${count}</div>`,
    className: 'custom-cluster-icon',
    iconSize: [42, 42],
    iconAnchor: [21, 21],
  });
}

// ─── Memoized icon cache ───
const iconCache = {};
function getIcon(status, type) {
  const key = `${status}-${type}`;
  if (!iconCache[key]) {
    iconCache[key] = createCustomIcon(status, type);
  }
  return iconCache[key];
}

export default function AssetMap() {
  const { assets, isLoading: loading } = useAssets();
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [detailAsset, setDetailAsset] = useState(null);

  const filteredAssets = useMemo(() => {
    return assets.filter((a) => {
      const typeMatch = typeFilter === 'all' || a.type === typeFilter;
      const statusMatch = statusFilter === 'all' || a.status === statusFilter;
      return typeMatch && statusMatch;
    });
  }, [assets, typeFilter, statusFilter]);

  const statusCounts = useMemo(() => {
    const counts = { healthy: 0, warning: 0, critical: 0, under_repair: 0 };
    assets.forEach((a) => {
      if (counts[a.status] !== undefined) counts[a.status]++;
    });
    return counts;
  }, [assets]);

  const handleViewDetails = useCallback((asset) => {
    setDetailAsset(asset);
  }, []);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100vh' }}>
      {/* Controls bar */}
      <MapControls
        typeFilter={typeFilter}
        statusFilter={statusFilter}
        onTypeChange={setTypeFilter}
        onStatusChange={setStatusFilter}
        assetCount={filteredAssets.length}
      />

      {/* Map container */}
      <div style={{ position: 'relative', width: '100%', height: 'calc(100% - 56px)' }}>
        {loading && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              zIndex: 1000,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: 'rgba(249,249,251,0.9)',
            }}
          >
            <div style={{ textAlign: 'center' }}>
              <div
                className="animate-spin"
                style={{
                  width: 40,
                  height: 40,
                  border: '3px solid #E8E8F0',
                  borderTopColor: '#9D72FF',
                  borderRadius: '50%',
                  margin: '0 auto 16px',
                }}
              />
              <span className="font-body" style={{ color: '#64748B', fontSize: 12, letterSpacing: '0.08em', fontWeight: 600 }}>
                LOADING ASSET MAP...
              </span>
            </div>
          </div>
        )}

        <MapContainer
          center={MAP_CENTER}
          zoom={MAP_ZOOM}
          style={{ width: '100%', height: '100%' }}
          zoomControl={false}
        >
          <TileLayer
            url={LIGHT_TILE}
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
          />
          <MarkerClusterGroup
            chunkedLoading
            iconCreateFunction={createClusterIcon}
            disableClusteringAtZoom={12}
            spiderfyOnMaxZoom={true}
            showCoverageOnHover={false}
            maxClusterRadius={60}
          >
            {filteredAssets.map((asset) => (
              <Marker
                key={asset.id}
                position={[parseFloat(asset.lat), parseFloat(asset.lng)]}
                icon={getIcon(asset.status, asset.type)}
              >
                <Popup
                  className="custom-asset-popup"
                  maxWidth={280}
                  minWidth={280}
                  closeButton={false}
                  autoPan={true}
                  offset={[0, -4]}
                >
                  <AssetPopupContent
                    asset={asset}
                    onClose={() => {}}
                    onViewDetails={handleViewDetails}
                  />
                </Popup>
              </Marker>
            ))}
          </MarkerClusterGroup>
        </MapContainer>

        {/* Live stats overlay */}
        <MapStatsPanel counts={statusCounts} />
      </div>

      {/* Asset Detail side panel */}
      <AssetDetailPanel asset={detailAsset} onClose={() => setDetailAsset(null)} />
    </div>
  );
}

// File end
