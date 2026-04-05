import React, { useRef, useEffect, useMemo, useState } from 'react';
import Globe from 'react-globe.gl';

const GlobalGlobe = ({ activityData = [] }) => {
  const globeRef = useRef();
  const [countries, setCountries] = useState({ features: [] });

  useEffect(() => {
    // Load GeoJSON for continents
    fetch('https://unpkg.com/world-atlas/countries-110m.json')
      .then(res => res.json())
      .then(data => {
        // Simple conversion if needed, but react-globe can handle some formats
        // For simplicity, let's use a standard low-res country dataset
        fetch('https://raw.githubusercontent.com/vasturiano/react-globe.gl/master/example/datasets/ne_110m_admin_0_countries.geojson')
          .then(res => res.json())
          .then(setCountries);
      });
  }, []);

  // Process data for the globe
  // We want to show "pulses" for recent activity
  const pointsData = useMemo(() => {
    return (activityData || []).filter(v => v.lat != null && v.lng != null).map(v => ({
      lat: v.lat,
      lng: v.lng,
      size: 0.1,
      color: '#3B82F6',
      label: v.location || 'Unknown'
    }));
  }, [activityData]);

  // Rings data for the "pulse" effect
  const ringsData = useMemo(() => {
    return (activityData || []).filter(v => v.lat != null && v.lng != null).map(v => ({
      lat: v.lat,
      lng: v.lng,
      color: '#60A5FA',
      maxR: 5,
      propagationSpeed: 2,
      repeatPeriod: 1000
    }));
  }, [activityData]);

  useEffect(() => {
    if (globeRef.current) {
      // Auto-rotate
      globeRef.current.controls().autoRotate = true;
      globeRef.current.controls().autoRotateSpeed = 0.5;
      
      // Initial position
      globeRef.current.pointOfView({ lat: 20, lng: 0, altitude: 2.5 });
    }
  }, []);

  return (
    <div className="w-full h-full min-h-[400px] relative cursor-grab active:cursor-grabbing">
      <Globe
        ref={globeRef}
        backgroundColor="rgba(0,0,0,0)"
        showAtmosphere={true}
        atmosphereColor="#3B82F6"
        atmosphereAltitude={0.25}
        
        // Water Color (Globe base)
        globeColor="#06080F" 
        
        // Land Color (Polygons)
        polygonsData={countries.features}
        polygonCapColor={() => 'rgba(59, 130, 246, 0.15)'}
        polygonSideColor={() => 'rgba(255, 255, 255, 0.05)'}
        polygonStrokeColor={() => '#1E293B'}
        polygonAltitude={0.01}
        
        pointsData={pointsData}
        pointColor="color"
        pointAltitude={0.1}
        pointRadius={0.4}
        
        ringsData={ringsData}
        ringColor={() => "#60A5FA"}
        ringMaxRadius="maxR"
        ringPropagationSpeed="propagationSpeed"
        ringRepeatPeriod="repeatPeriod"

        // Premium HTML Labels
        htmlElementsData={pointsData}
        htmlElement={d => {
          const el = document.createElement('div');
          el.innerHTML = `
            <div class="flex flex-col items-center group pointer-events-none">
              <div class="bg-slate-950/90 backdrop-blur-md border border-blue-500/30 px-2 py-1 rounded text-[10px] font-bold text-white whitespace-nowrap shadow-[0_0_15px_rgba(59,130,246,0.3)] animate-in fade-in zoom-in duration-300">
                ${d.label}
              </div>
              <div class="w-px h-4 bg-gradient-to-b from-blue-500/50 to-transparent"></div>
            </div>
          `;
          return el;
        }}
        htmlAltitude={0.15}

        width={window.innerWidth > 1024 ? 800 : window.innerWidth * 0.9}
        height={500}
      />
      
      {/* Attribution/Overlay */}
      <div className="absolute bottom-6 left-6 z-10 pointer-events-none appearance-none">
        <div className="flex items-center gap-3 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-slate-200 dark:border-slate-800/50 px-5 py-2.5 rounded-2xl shadow-[0_8px_30px_rgb(0,0,0,0.12)] dark:shadow-blue-900/10 transition-all duration-300">
          <div className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.8)]"></span>
          </div>
          <span className="text-[10px] uppercase font-black text-slate-900 dark:text-white tracking-[0.2em]">Global Real-time Pulse Feed</span>
        </div>
      </div>
    </div>
  );
};

export default GlobalGlobe;
