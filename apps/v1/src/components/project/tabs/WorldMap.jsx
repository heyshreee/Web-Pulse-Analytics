import React, { useMemo } from 'react';
import { MapContainer, TileLayer, CircleMarker, Tooltip } from 'react-leaflet';
import L from 'leaflet';

// Fix for default marker icons in React/Leaflet
import markerIcon2x from 'leaflet/dist/images/marker-icon-2x.png';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

const WorldMap = ({ activityData = [] }) => {
  // Filter actions that have valid coordinates
  const markers = useMemo(() => 
    activityData.filter(v => v.lat != null && v.lng != null),
    [activityData]
  );

  const mapCenter = [20, 0]; // Centered on the world
  const initialZoom = 2;

  return (
    <div className="relative w-full h-[500px] min-h-[500px] bg-black rounded-lg overflow-hidden map-container border border-line">
      
      {/* Live Badge */}
      <div className="absolute top-3 left-3 z-[1000] flex items-center gap-2 bg-surface/90 backdrop-blur-sm border border-line px-2.5 py-1 rounded text-xs font-mono pointer-events-none">
        <div className="relative flex h-1.5 w-1.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-1.5 w-1.5 bg-emerald-500"></span>
        </div>
        <span className="text-[11px] text-ink uppercase tracking-wider font-medium">Live Activity</span>
        <span className="text-[11px] text-ink-muted border-l border-line pl-2 tabular-nums">
          {markers.length} Regions
        </span>
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={initialZoom}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#000000' }}
        attributionControl={false}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          subdomains="abcd"
          maxZoom={20}
        />

        {markers.map((activity, i) => (
          <CircleMarker
            key={activity.id || i}
            center={[activity.lat, activity.lng]}
            radius={6}
            pathOptions={{
              fillColor: '#10b981',
              fillOpacity: 0.7,
              color: '#10b981',
              weight: 1.5,
              className: 'pulse-marker'
            }}
          >
            <Tooltip direction="top" offset={[0, -8]} opacity={1} permanent={false}>
              <div className="bg-surface border border-line rounded p-2 text-center shadow-lg font-mono">
                <p className="text-[10px] text-emerald-500 uppercase tracking-wider mb-0.5">Incoming Hit</p>
                <p className="text-xs text-ink font-medium mb-0.5">
                  {activity.ip}
                </p>
                <p className="text-[10px] text-ink-muted">
                  {activity.location || 'Unknown'}
                </p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <style jsx="true">{`
        .leaflet-container {
          background: #000000 !important;
        }
        .pulse-marker {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            stroke-width: 1.5;
            fill-opacity: 0.6;
          }
          50% {
            stroke-width: 4;
            fill-opacity: 0.9;
          }
          100% {
            stroke-width: 1.5;
            fill-opacity: 0.6;
          }
        }
        .leaflet-tooltip {
          background: transparent !important;
          border: none !important;
          box-shadow: none !important;
          padding: 0 !important;
        }
        .leaflet-tooltip-tip {
          display: none !important;
        }
      `}</style>
    </div>
  );
};

export default WorldMap;
