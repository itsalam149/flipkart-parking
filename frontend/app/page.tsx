/* eslint-disable */
"use client";

import React, { useEffect, useState } from 'react';
import Map from '@/components/Map';
import DispatchPanel from '@/components/DispatchPanel';
import LiveCameraFeed from '@/components/LiveCameraFeed';
import AnalyticsChart from '@/components/AnalyticsChart';
import { ShieldAlert, Users, MapPin, Database, Activity } from 'lucide-react';

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

  // Calculate average UMIS for the chart
  const averageUmis = hotspots.length > 0 
    ? hotspots.reduce((acc: any, curr: any) => acc + curr.umis_score, 0) / hotspots.length 
    : 0;

  return (
    <main className="flex h-screen w-screen bg-[#020617] overflow-hidden text-slate-200">
      
      {/* LEFT SIDEBAR - COMMAND HUB */}
      <div className="w-[420px] flex flex-col z-10 bg-[#090E17] border-r border-slate-700/60 shadow-xl">
        
        {/* Header section */}
        <div className="p-6 border-b border-slate-700/60 bg-gradient-to-br from-[#090E17] to-[#0f172a] relative overflow-hidden">
          {/* Subtle top glow */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500 via-blue-500 to-emerald-500 opacity-80"></div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                <ShieldAlert className="text-emerald-500" size={24} />
              </div>
              <div>
                <h1 className="text-xl font-black tracking-tighter text-slate-100 flex items-center gap-1.5">
                  ParkOptima <span className="text-emerald-500 font-normal opacity-80">AI</span>
                </h1>
                <p className="text-[9px] text-slate-400 font-mono tracking-[0.2em] uppercase mt-0.5">Command Copilot</p>
              </div>
            </div>
            
            <div className="flex gap-2">
              <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-800/50 border border-slate-700/50 text-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <Database size={14} />
              </div>
              <div className="flex items-center justify-center w-8 h-8 rounded bg-slate-800/50 border border-slate-700/50 text-blue-500 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                <Activity size={14} />
              </div>
            </div>
          </div>
        </div>

        {/* Fleet Status Section */}
        <div className="p-4 flex gap-3 border-b border-slate-800/60 bg-[#0B1120]">
          <div className="flex-1 bg-[#090E17] rounded-xl p-3 border border-slate-800/80 shadow-inner">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Fleet Units</span>
              <Users size={12} className="text-blue-400" />
            </div>
            <p className="text-xl font-black text-white tracking-tighter">12 / 15</p>
            <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
              <div className="bg-blue-500 h-full w-[80%] rounded-full shadow-[0_0_10px_#3b82f6]"></div>
            </div>
          </div>
          
          <div className="flex-1 bg-[#090E17] rounded-xl p-3 border border-slate-800/80 shadow-inner">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[9px] font-bold uppercase tracking-widest text-slate-500">Critical Zones</span>
              <MapPin size={12} className="text-rose-400" />
            </div>
            <p className="text-xl font-black text-white tracking-tighter">{hotspots.length}</p>
            <div className="w-full bg-slate-800 h-1 mt-2 rounded-full overflow-hidden">
              <div className="bg-rose-500 h-full w-[40%] rounded-full shadow-[0_0_10px_#f43f5e]"></div>
            </div>
          </div>
        </div>

        {/* Analytics Chart Panel */}
        <div className="p-4 border-b border-slate-800/60 bg-[#090E17] h-40">
          <AnalyticsChart currentScore={averageUmis} />
        </div>

        {/* AI Deployment Plan Component */}
        <DispatchPanel hotspots={hotspots} isLoading={isLoading} />
      </div>

      {/* RIGHT SIDE - DIGITAL TWIN MAP */}
      <div className="flex-1 relative bg-black">
        <Map hotspots={hotspots} />
        <LiveCameraFeed />
        
        {/* Subtle vignette over the map for cinematic feel */}
        <div className="absolute inset-0 pointer-events-none shadow-[inset_0_0_100px_rgba(0,0,0,0.8)]"></div>
      </div>
      
    </main>
  );
}
