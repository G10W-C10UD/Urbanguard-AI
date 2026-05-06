// MapMarkers — renders asset markers with custom SVG icons, manual clustering via leaflet.markercluster
import { useEffect, useRef, useMemo } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet.markercluster';
import 'leaflet.markercluster/dist/MarkerCluster.css';
import 'leaflet.markercluster/dist/MarkerCluster.Default.css';
import AssetPopup from './AssetPopup.jsx';

// ─── Status colours ───
const STATUS_COLORS = {
  healthy: '#22C55E',
  warning: '#F59E0B',
  critical: '#EF4444',
  under_repair: '#3B82F6',
};

// ─── Type SVG paths ───
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

// ─── Create custom DivIcon with SVG ───
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

// ─── Build popup HTML ───
function buildPopupHTML(asset) {
  const statusColor = STATUS_COLORS[asset.status] || '#94A3B8';
  const statusLabel = (asset.status || '').replace('_', ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const healthScore = asset.health_score ?? 75;
  const reading = asset.iot_sensor_reading ?? asset.expected;
  const expected = asset.expected ?? 100;
  const barColor = healthScore > 70 ? '#22C55E' : healthScore > 40 ? '#F59E0B' : '#EF4444';
  const showDispatch = asset.status === 'warning' || asset.status === 'critical';

  return `<div style="width:280px;background:#FFFFFF;border:1px solid #E8E8F0;border-radius:12px;padding:20px;font-family:'Plus Jakarta Sans',sans-serif;box-shadow:0 4px 16px rgba(0,0,0,0.08);">
    <div style="display:flex;align-items:center;gap:10px;margin-bottom:8px;">
      <span style="color:#9D72FF;font-size:13px;font-weight:700;letter-spacing:0.04em;">${asset.id}</span>
      <span style="font-size:10px;font-weight:700;padding:3px 10px;border-radius:20px;background:${statusColor}15;color:${statusColor};border:1px solid ${statusColor}30;letter-spacing:0.04em;text-transform:uppercase;">${statusLabel}</span>
    </div>
    <div style="font-size:20px;color:#1A1A1E;line-height:1.2;margin-bottom:4px;letter-spacing:-0.02em;font-weight:800;">${asset.name}</div>
    <div style="font-size:13px;color:#64748B;margin-bottom:14px;">${asset.area}</div>
    <div style="height:1px;background:#E8E8F0;margin-bottom:14px;"></div>
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:6px;">
        <span style="color:#64748B;font-size:12px;font-weight:500;">Health Score</span>
        <span style="color:#1A1A1E;font-size:14px;font-weight:700;">${healthScore}%</span>
      </div>
      <div style="width:100%;height:4px;background:#F4F4F8;border-radius:2px;overflow:hidden;">
        <div style="width:${healthScore}%;height:100%;background:${barColor};border-radius:2px;"></div>
      </div>
    </div>
    <div style="margin-bottom:12px;">
      <div style="display:flex;justify-content:space-between;align-items:center;">
        <span style="color:#64748B;font-size:12px;font-weight:500;">IoT Reading</span>
        <span style="font-size:13px;">
          <span style="color:#1A1A1E;font-weight:700;">${typeof reading === 'number' ? reading.toFixed(1) : reading}</span>
          <span style="color:#94A3B8;margin-left:4px;">/ ${expected} ${asset.unit || ''}</span>
        </span>
      </div>
    </div>
    <div style="color:#94A3B8;font-size:11px;margin-bottom:16px;">Last maintained: ${asset.last_maintained || 'N/A'}</div>
    <div style="display:flex;gap:8px;">
      <button data-asset-id="${asset.id}" data-action="view-details" style="flex:1;padding:10px 0;font-size:13px;font-weight:600;border-radius:8px;border:1px solid #E8E8F0;background:#FFFFFF;color:#1A1A1E;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;">View Details</button>
      ${showDispatch ? `<button data-asset-id="${asset.id}" data-action="dispatch-job" style="flex:1;padding:10px 0;font-size:13px;font-weight:600;border-radius:8px;border:none;background:#9D72FF;color:#FFFFFF;cursor:pointer;font-family:'Plus Jakarta Sans',sans-serif;">Dispatch Job</button>` : ''}
    </div>
  </div>`;
}

export default function MapMarkers({ assets, zoom, onMarkerClick, selectedAsset, onClosePopup, onViewDetails }) {
  const map = useMap();
  const clusterGroupRef = useRef(null);
  const markersRef = useRef({});

  useEffect(() => {
    if (!map) return;

    if (clusterGroupRef.current) {
      map.removeLayer(clusterGroupRef.current);
    }

    const clusterGroup = L.markerClusterGroup({
      chunkedLoading: true,
      iconCreateFunction: createClusterIcon,
      disableClusteringAtZoom: 12,
      spiderfyOnMaxZoom: true,
      showCoverageOnHover: false,
      maxClusterRadius: 60,
    });

    const newMarkers = {};

    assets.forEach((asset) => {
      const icon = createCustomIcon(asset.status, asset.type);
      const marker = L.marker([parseFloat(asset.lat), parseFloat(asset.lng)], { icon });

      const popupContent = buildPopupHTML(asset);
      marker.bindPopup(popupContent, {
        className: 'custom-asset-popup',
        maxWidth: 280,
        minWidth: 280,
        closeButton: false,
        autoPan: true,
        offset: [0, -4],
      });

      marker.on('popupopen', () => {
        const popupEl = marker.getPopup().getElement();
        if (!popupEl) return;

        const viewBtn = popupEl.querySelector('[data-action="view-details"]');
        if (viewBtn) {
          viewBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            map.closePopup();
            onViewDetails(asset);
          });
        }

        const dispatchBtn = popupEl.querySelector('[data-action="dispatch-job"]');
        if (dispatchBtn) {
          dispatchBtn.addEventListener('click', (e) => {
            e.stopPropagation();
          });
        }
      });

      clusterGroup.addLayer(marker);
      newMarkers[asset.id] = marker;
    });

    map.addLayer(clusterGroup);
    clusterGroupRef.current = clusterGroup;
    markersRef.current = newMarkers;

    return () => {
      if (clusterGroupRef.current) {
        map.removeLayer(clusterGroupRef.current);
      }
    };
  }, [map, assets, onViewDetails]);

  return null;
}
