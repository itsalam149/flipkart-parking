/* eslint-disable */
"use client";

import React, { useEffect, useState } from 'react';
import Map from '@/components/Map';
import DispatchPanel from '@/components/DispatchPanel';
import LiveCameraFeed from '@/components/LiveCameraFeed';
import { ShieldAlert, Users, MapPin } from 'lucide-react';

export default function CommandCenter() {
  const [hotspots, setHotspots] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchHotspots = async () => {
    try {
      const res = await fetch('http://localhost:8000/api/hotspots');
      const data = await res.json();
      setHotspots(data);
    } catch (err) {
      console.error("Error fetching hotspots:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchHotspots();
    const interval = setInterval(fetchHotspots, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <main className="flex h-screen w-screen bg-[#020617] overflow-hidden text-slate-200">
      
      {/* LEFT SIDEBAR - COMMAND HUB */}
      <div className="w-[400px] flex flex-col z-10 bg-[#090E17] border-r border-slate-800/60 shadow-2xl">
        
        {/* Header section */}
        <div className="p-6 border-b border-slate-800/60">
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-emerald-500" size={28} />
            <div>
              <h1 className="text-xl font-bold tracking-tight text-slate-100">
                ParkOptima <span className="text-emerald-500 font-normal">AI</span>
              </h1>
              <p className="text-[10px] text-slate-500 font-mono tracking-widest uppercase mt-0.5">Command Copilot</p>
            </div>
          </div>
        </div>

        {/* Fleet Status Section */}
        <div className="p-5 flex gap-3 border-b border-slate-800/60 bg-[#0B1120]">
          <div className="flex-1 bg-slate-900/80 rounded-xl p-3.5 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1.5">
              <Users size={14} className="text-blue-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Fleet Units</span>
            </div>
            <p className="text-2xl font-bold text-white">10</p>
          </div>
          <div className="flex-1 bg-slate-900/80 rounded-xl p-3.5 border border-slate-800">
            <div className="flex items-center gap-2 text-slate-400 mb-1.5">
              <MapPin size={14} className="text-rose-400" />
              <span className="text-[10px] font-semibold uppercase tracking-wider">Critical Zones</span>
            </div>
            <p className="text-2xl font-bold text-white">{hotspots.length}</p>
          </div>
        </div>

        {/* AI Deployment Plan Component */}
        <DispatchPanel hotspots={hotspots} isLoading={isLoading} />
      </div>

      {/* RIGHT SIDE - DIGITAL TWIN MAP */}
      <div className="flex-1 relative">
        <Map hotspots={hotspots} />
        <LiveCameraFeed />
      </div>
      
    </main>
  );
}
