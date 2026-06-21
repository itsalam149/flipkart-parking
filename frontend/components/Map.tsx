"use client";

import React, { useState } from 'react';
import Map, { Marker, Popup, NavigationControl, FullscreenControl } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AlertCircle, Navigation, ShieldAlert, Users, Zap, Crosshair } from 'lucide-react';

export interface Hotspot {
  id: number;
  location_name: string;
  latitude: number;
  longitude: number;
  umis_score: number;
  parked_cars_count: number;
}

export default function MapComponent({ hotspots }: { hotspots: Hotspot[] }) {
  const [viewState, setViewState] = useState({
    longitude: 77.5946,
    latitude: 12.9716,
    zoom: 13.5,
    pitch: 55, // Enhanced command center 3D feel
    bearing: -15, // Slight angle for cinematic feel
  });

  const [selectedHotspot, setSelectedHotspot] = useState<Hotspot | null>(null);

  return (
    <div className="absolute inset-0">
      <Map
        {...viewState}
        onMove={evt => setViewState(evt.viewState)}
        mapStyle="https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json"
        style={{ width: '100%', height: '100%' }}
      >
        <NavigationControl position="top-right" showCompass={false} />
        <FullscreenControl position="top-right" />

        {hotspots.map((hotspot) => {
          const isCritical = hotspot.umis_score > 85;
          return (
            <Marker
              key={hotspot.id}
              longitude={hotspot.longitude}
              latitude={hotspot.latitude}
              anchor="bottom"
              onClick={e => {
                e.originalEvent.stopPropagation();
                setSelectedHotspot(hotspot);
              }}
            >
              <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-200">
                <div className={`p-2 rounded-lg flex items-center justify-center relative overflow-hidden ${
                  isCritical 
                    ? 'bg-gradient-to-br from-rose-600 to-rose-900 text-white shadow-[0_0_15px_rgba(244,63,94,0.8)] border border-rose-400' 
                    : 'bg-gradient-to-br from-amber-500 to-amber-700 text-white shadow-lg border border-amber-300/50'
                  }`}
                >
                  {/* Glossy overlay */}
                  <div className="absolute inset-0 bg-white/10 w-full h-1/2 rounded-t-lg pointer-events-none"></div>
                  {isCritical ? <Zap size={16} fill="currentColor" /> : <AlertCircle size={16} strokeWidth={2.5} />}
                </div>

                {/* Always-on label for criticals (Optional visual flair) */}
                {isCritical && !selectedHotspot && (
                  <div className="absolute top-full mt-2 left-1/2 -translate-x-1/2 whitespace-nowrap bg-rose-950/80 border border-rose-500/30 text-rose-300 text-[9px] font-bold uppercase px-1.5 py-0.5 rounded backdrop-blur-sm pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {hotspot.umis_score.toFixed(1)} UMIS
                  </div>
                )}
              </div>
            </Marker>
          );
        })}

        {selectedHotspot && (
          <Popup
            longitude={selectedHotspot.longitude}
            latitude={selectedHotspot.latitude}
            anchor="bottom"
            offset={40}
            onClose={() => setSelectedHotspot(null)}
            closeButton={false}
            className="command-center-popup z-50"
          >
            <div className="bg-[#0B1120]/95 backdrop-blur-xl border border-slate-700/80 p-5 rounded-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] text-slate-200 w-72 overflow-hidden relative group">
              {/* Animated scanning line inside popup */}
              <div className="absolute top-0 left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-blue-500 to-transparent opacity-50 shadow-[0_0_10px_#3b82f6] group-hover:animate-scan"></div>
              
              <div className="flex items-start gap-3 mb-4">
                <div className={`p-2.5 rounded-xl border ${selectedHotspot.umis_score > 85 ? 'bg-rose-500/10 border-rose-500/30 text-rose-500' : 'bg-amber-500/10 border-amber-500/30 text-amber-500'}`}>
                  <ShieldAlert size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-base leading-tight tracking-wide mb-0.5">{selectedHotspot.location_name}</h3>
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 font-mono">
                    <Crosshair size={12} className="text-slate-500" />
                    {selectedHotspot.latitude.toFixed(4)}, {selectedHotspot.longitude.toFixed(4)}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs mb-4">
                <div className="bg-[#090E17] border border-slate-800 p-3 rounded-xl flex flex-col justify-center items-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-rose-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500 mb-1">UMIS Level</span>
                  <span className={`font-black text-2xl tracking-tighter ${selectedHotspot.umis_score > 85 ? 'text-rose-400' : 'text-amber-400'}`}>
                    {selectedHotspot.umis_score.toFixed(1)}
                  </span>
                </div>
                
                <div className="bg-[#090E17] border border-slate-800 p-3 rounded-xl flex flex-col justify-between gap-2">
                  <div className="flex items-center justify-between w-full">
                    <span className="text-[9px] uppercase font-bold tracking-widest text-slate-500">Violators</span>
                    <Users size={12} className="text-blue-400" />
                  </div>
                  <span className="font-bold text-lg">{selectedHotspot.parked_cars_count}</span>
                </div>
              </div>

              <button className="w-full py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-[0_0_15px_rgba(37,99,235,0.4)]">
                <Navigation size={14} /> Assign Unit
              </button>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
