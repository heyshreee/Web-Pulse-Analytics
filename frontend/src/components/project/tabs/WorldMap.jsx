import React, { useState, useMemo } from 'react';
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
    <div className="relative w-full h-[500px] min-h-[500px] bg-[#06080F] rounded-xl overflow-hidden map-container border border-[#1E293B]/50">
      
      {/* Live Badge */}
      <div className="absolute top-4 left-4 z-[1000] flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-md border border-[#1E293B] px-3 py-1.5 rounded-full shadow-lg pointer-events-none">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">Live Activity</span>
        <span className="text-[10px] text-slate-500 font-medium border-l border-[#1E293B] pl-2">
          {markers.length} Regions
        </span>
      </div>

      {/* Map Container */}
      <MapContainer
        center={mapCenter}
        zoom={initialZoom}
        zoomControl={false}
        scrollWheelZoom={true}
        style={{ width: '100%', height: '100%', background: '#06080F' }}
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
            radius={8}
            pathOptions={{
              fillColor: '#8B5CF6',
              fillOpacity: 0.6,
              color: '#A78BFA',
              weight: 2,
              className: 'pulse-marker'
            }}
          >
            <Tooltip direction="top" offset={[0, -10]} opacity={1} permanent={false}>
              <div className="bg-[#0F172A] border border-violet-500/30 rounded-lg p-2 text-center backdrop-blur-xl">
                <p className="text-[10px] text-violet-400 font-bold tracking-widest uppercase mb-1">Incoming Hit</p>
                <p className="text-sm text-white font-bold mb-0.5">
                  {activity.ip}
                </p>
                <p className="text-[10px] text-slate-400 font-medium">
                  {activity.location || 'Unknown'}
                </p>
              </div>
            </Tooltip>
          </CircleMarker>
        ))}
      </MapContainer>

      <style jsx="true">{`
        .leaflet-container {
          background: #06080F !important;
        }
        .pulse-marker {
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0% {
            stroke-width: 2;
            fill-opacity: 0.6;
          }
          50% {
            stroke-width: 6;
            fill-opacity: 0.9;
          }
          100% {
            stroke-width: 2;
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
