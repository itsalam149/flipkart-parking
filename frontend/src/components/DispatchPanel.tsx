"use client";

import React, { useState } from 'react';
import { Navigation, Activity, ArrowRight, CheckCircle2 } from 'lucide-react';

export interface Hotspot {
  id: number;
  location_name: string;
  latitude: number;
  longitude: number;
  umis_score: number;
  parked_cars_count: number;
}

export default function DispatchPanel({ hotspots, isLoading }: { hotspots: Hotspot[], isLoading: boolean }) {
  const [simulated, setSimulated] = useState(false);

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center bg-[#090E17]">
        <div className="w-5 h-5 border-2 border-slate-700 border-t-slate-400 rounded-full animate-spin"></div>
      </div>
    );
  }

  if (hotspots.length === 0) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center bg-[#090E17]">
        <p className="text-slate-500 text-sm">No critical zones detected.</p>
      </div>
    );
  }

  // AI Recommendation Logic
  const topHotspots = [...hotspots].sort((a, b) => b.umis_score - a.umis_score).slice(0, 10);
  
  // Clean, realistic recovery metric maxing around ~40%
  const realisticRecovery = Math.min(topHotspots.length * 4 + 2, 42);
  const totalRecovery = simulated ? "0%" : `+${realisticRecovery}%`; 

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090E17]">
      
      <div className="p-6 pb-4">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-400">Tactical Deployment</h2>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded flex items-center gap-1.5 border border-emerald-500/20">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></span>
            LIVE
          </span>
        </div>
        
        {/* Recovery Metric Card */}
        <div className="rounded-xl p-4 border border-slate-800 bg-[#0B1120]">
          <div className="flex items-center gap-1.5 text-slate-400 mb-1.5 uppercase text-[10px] tracking-widest font-semibold">
            <Activity size={12} />
            Capacity Recovery
          </div>
          <div className="text-3xl font-bold text-slate-100 tracking-tight">
            {totalRecovery}
          </div>
        </div>
      </div>

      {/* Scrollable Unit List */}
      <div className="flex-1 overflow-y-auto px-6 pb-6 space-y-3 custom-scrollbar">
        {topHotspots.map((hotspot, index) => {
          const travelTime = Math.max(2, 18 - Math.floor(hotspot.umis_score / 10)); 
          const recovery = Math.min(Math.floor(hotspot.umis_score / 12), 8);

          return (
            <div 
              key={hotspot.id} 
              className="rounded-xl border border-slate-800 bg-[#0B1120] p-4 transition-colors hover:border-slate-700"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5 mb-0.5">
                    Team {String.fromCharCode(65 + index)} 
                  </h3>
                  <p className="text-[11px] text-slate-400 flex items-center gap-1">
                    <ArrowRight size={10} className="text-slate-500" /> 
                    {hotspot.location_name}
                  </p>
                </div>
                <div className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800/50 text-slate-400 border border-slate-700/50">
                  UMIS: {hotspot.umis_score.toFixed(1)}
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div className="rounded-lg p-2.5 bg-[#090E17] border border-slate-800">
                  <div className="flex items-center gap-1 text-slate-500 text-[9px] uppercase font-bold tracking-wider mb-1">
                    <Navigation size={10} /> Travel ETA
                  </div>
                  <span className="font-medium text-slate-300 text-xs">{travelTime} mins</span>
                </div>
                <div className="rounded-lg p-2.5 bg-[#090E17] border border-slate-800">
                  <div className="flex items-center gap-1 text-emerald-500 text-[9px] uppercase font-bold tracking-wider mb-1">
                    <Activity size={10} /> Impact
                  </div>
                  <span className="font-medium text-emerald-500 text-xs">+{recovery}% Flow</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      <div className="p-5 border-t border-slate-800 bg-[#090E17]">
        <button 
          onClick={() => setSimulated(!simulated)}
          className={`w-full py-3 px-4 rounded-lg text-sm font-medium flex items-center justify-center gap-2 transition-colors ${
            simulated 
              ? 'bg-slate-800 text-slate-300 hover:bg-slate-700' 
              : 'bg-emerald-600 hover:bg-emerald-500 text-white'
          }`}
        >
          {simulated ? 'Reset Scenario' : 'Execute Deployment'}
          {!simulated && <CheckCircle2 size={16} />}
        </button>
      </div>
    </div>
  );
}
