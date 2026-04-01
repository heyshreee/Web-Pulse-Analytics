import React, { useState, useEffect, useRef, useMemo } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import worldData from '../../../assets/world-110m.json';

const WorldMap = ({ activityData = [] }) => {
  const [tooltip, setTooltip] = useState(null);
  const [rotation, setRotation] = useState(0);
  const requestRef = useRef();

  // Filter actions that have valid coordinates
  const markers = useMemo(() => 
    activityData.filter(v => v.lat != null && v.lng != null),
    [activityData]
  );

  useEffect(() => {
    let lastTime;
    const animate = (time) => {
      if (lastTime !== undefined) {
        setRotation(r => (r + 0.3) % 360);
      }
      lastTime = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleMouseEnter = (e, data) => {
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.closest('.map-container').getBoundingClientRect();
    setTooltip({
      ...data,
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top
    });
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-[#06080F] rounded-xl overflow-hidden map-container flex items-center justify-center border border-[#1E293B]/50">
      
      {/* Live Badge */}
      <div className="absolute top-4 left-4 z-20 flex items-center gap-2 bg-[#0F172A]/80 backdrop-blur-md border border-[#1E293B] px-3 py-1.5 rounded-full shadow-lg">
        <div className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
        </div>
        <span className="text-[10px] uppercase font-bold text-slate-300 tracking-widest">Live Activity</span>
        <span className="text-[10px] text-slate-500 font-medium border-l border-[#1E293B] pl-2">
          {markers.length} Regions
        </span>
      </div>

      {tooltip && (
        <div 
          className="pointer-events-none absolute z-50 bg-[#0F172A]/95 border border-blue-500/30 shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-lg p-3 text-center backdrop-blur-xl"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y, 
            transform: 'translate(-50%, -120%)' 
          }}
        >
          <p className="text-[10px] text-blue-400 font-bold tracking-widest uppercase mb-1">Incoming Hit</p>
          <p className="text-sm text-white font-bold mb-0.5">
            {tooltip.ip}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {tooltip.location || 'Unknown'}
          </p>
        </div>
      )}

      {/* Background glow behind globe */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px] pointer-events-none"></div>

      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ scale: 220, rotate: [-rotation, 0, 0] }}
        width={800}
        height={450}
        style={{ width: '100%', height: '100%', cursor: 'grab' }}
      >
        <Geographies geography={worldData}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#111827"
                stroke="#1F2937"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none', fill: '#1F2937' },
                  pressed: { outline: 'none' },
                }}
              />
            ))
          }
        </Geographies>

        {markers.map((activity, i) => {
          // Hide markers on the back side of the spinning globe
          let diff = (activity.lng - (-rotation)) % 360;
          if (diff < -180) diff += 360;
          if (diff > 180) diff -= 360;
          const isVisible = Math.abs(diff) < 90;

          if (!isVisible) return null;

          return (
            <Marker 
              key={activity.id || i}
              coordinates={[activity.lng, activity.lat]}
              onMouseEnter={(e) => handleMouseEnter(e, activity)}
              onMouseLeave={() => setTooltip(null)}
            >
              <defs>
                <radialGradient id={`glow-${i}`} cx="50%" cy="50%" r="50%" fx="50%" fy="50%">
                  <stop offset="0%" stopColor="#3B82F6" stopOpacity="0.8" />
                  <stop offset="100%" stopColor="#3B82F6" stopOpacity="0" />
                </radialGradient>
              </defs>
              <circle r={12} fill={`url(#glow-${i})`} className="animate-pulse" />
              <circle r={4} fill="#60A5FA" stroke="#fff" strokeWidth={1.5} className="drop-shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
            </Marker>
          );
        })}
      </ComposableMap>

      {/* Decorative compass/grid lines could go here */}
    </div>
  );
};

export default WorldMap;
