import React, { useState, useEffect, useRef } from 'react';
import { ComposableMap, Geographies, Geography, Marker } from 'react-simple-maps';
import worldData from '../../../assets/world-110m.json';

const WorldMap = ({ activityData = [] }) => {
  const [tooltip, setTooltip] = useState(null);
  const [rotation, setRotation] = useState(0);
  const requestRef = useRef();

  // Filter actions that have valid coordinates
  const markers = activityData.filter(v => v.lat != null && v.lng != null);

  useEffect(() => {
    let lastTime;
    const animate = (time) => {
      if (lastTime !== undefined) {
        setRotation(r => (r + 0.5) % 360);
      }
      lastTime = time;
      requestRef.current = requestAnimationFrame(animate);
    };
    requestRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(requestRef.current);
  }, []);

  const handleMouseEnter = (e, data) => {
    // Basic bounds calculation relative to nearest relative parent
    const rect = e.currentTarget.getBoundingClientRect();
    const parentRect = e.currentTarget.closest('.map-container').getBoundingClientRect();
    setTooltip({
      ...data,
      x: rect.left - parentRect.left + rect.width / 2,
      y: rect.top - parentRect.top
    });
  };

  return (
    <div className="relative w-full h-full min-h-[450px] bg-[#0B0D16] rounded-xl overflow-hidden map-container flex items-center justify-center">
      
      {tooltip && (
        <div 
          className="pointer-events-none absolute z-50 bg-[#1E222D]/95 border border-[#2D333D] shadow-[0_10px_40px_rgba(0,0,0,0.8)] rounded-lg p-3 text-center"
          style={{ 
            left: tooltip.x, 
            top: tooltip.y, 
            transform: 'translate(-50%, -120%)' 
          }}
        >
          <div className="flex justify-center mb-1">
            <div className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping shadow-[0_0_8px_#60a5fa]"></div>
          </div>
          <p className="text-xs text-white font-bold tracking-wider mb-0.5">
            {tooltip.ip}
          </p>
          <p className="text-[10px] text-slate-400 font-medium">
            {tooltip.location || 'Unknown'}
          </p>
        </div>
      )}

      {/* Background glow behind globe */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[350px] h-[350px] bg-blue-500/5 rounded-full blur-[80px] pointer-events-none"></div>

      <ComposableMap
        projection="geoOrthographic"
        projectionConfig={{ scale: 220, rotate: [-rotation, 0, 0] }}
        width={800}
        height={450}
        style={{ width: '100%', height: '100%' }}
      >
        <Geographies geography={worldData}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#1A1D24"
                stroke="#2D333D"
                strokeWidth={0.5}
                style={{
                  default: { outline: 'none' },
                  hover: { outline: 'none', fill: '#202530' },
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
              <circle r={8} fill="#3B82F6" opacity={0.3} className="animate-ping" />
              <circle r={3} fill="#3B82F6" stroke="#fff" strokeWidth={1} />
            </Marker>
          );
        })}
      </ComposableMap>
    </div>
  );
};

export default WorldMap;
