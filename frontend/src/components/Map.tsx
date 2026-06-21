"use client";

import React, { useState } from 'react';
import Map, { Marker, Popup } from 'react-map-gl/maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import { AlertCircle } from 'lucide-react';

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
    longitude: 77.5946, // Bangalore coordinates
    latitude: 12.9716,
    zoom: 13,
    pitch: 45, // Angled for a "command center" 3D feel
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
        {hotspots.map((hotspot) => (
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
            <div className="relative group cursor-pointer hover:scale-110 transition-transform duration-300">
              {/* Massive Pulse effect for high UMIS */}
              {hotspot.umis_score > 85 && (
                <div className="absolute -inset-4 bg-rose-500 rounded-full opacity-20 animate-ping"></div>
              )}
              {hotspot.umis_score > 80 && (
                <div className="absolute -inset-2 bg-rose-500 rounded-full opacity-40 animate-ping" style={{ animationDelay: '0.5s' }}></div>
              )}
              
              <div className={`p-2.5 rounded-full shadow-[0_10px_25px_rgba(0,0,0,0.5)] border-2 backdrop-blur-md ${
                hotspot.umis_score > 80 
                  ? 'bg-rose-500/90 text-white border-rose-300/50 shadow-[0_0_15px_rgba(244,63,94,0.6)]' 
                  : 'bg-amber-500/90 text-white border-amber-300/50'
                }`}
              >
                <AlertCircle size={18} strokeWidth={2.5} />
              </div>
            </div>
          </Marker>
        ))}

        {selectedHotspot && (
          <Popup
            longitude={selectedHotspot.longitude}
            latitude={selectedHotspot.latitude}
            anchor="bottom"
            offset={30}
            onClose={() => setSelectedHotspot(null)}
            closeButton={false}
            className="command-center-popup z-50"
          >
            <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl text-slate-200 w-64">
              <h3 className="font-bold text-lg mb-1">{selectedHotspot.location_name}</h3>
              <div className="flex justify-between items-center mb-3 pb-3 border-b border-slate-700">
                <span className="text-xs text-slate-400">UMIS Score</span>
                <span className="font-bold text-rose-400 text-lg">{selectedHotspot.umis_score}</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-800 p-2 rounded">
                  <span className="block text-slate-400 mb-1">Parked Cars</span>
                  <span className="font-semibold text-sm">{selectedHotspot.parked_cars_count}</span>
                </div>
                <div className="bg-slate-800 p-2 rounded">
                  <span className="block text-slate-400 mb-1">Lane Status</span>
                  <span className="font-semibold text-rose-400 text-sm">Blocked</span>
                </div>
              </div>
            </div>
          </Popup>
        )}
      </Map>
    </div>
  );
}
