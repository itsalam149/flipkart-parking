"use client";

import React, { useState } from 'react';
import { Navigation, Activity, ArrowRight, ShieldAlert, Send, Filter, CheckCircle2, AlertTriangle, Car } from 'lucide-react';

export interface Hotspot {
  id: number;
  location_name: string;
  latitude: number;
  longitude: number;
  umis_score: number;
  parked_cars_count: number;
}

export default function DispatchPanel({ hotspots, isLoading }: { hotspots: Hotspot[], isLoading: boolean }) {
  const [filter, setFilter] = useState<'all' | 'critical' | 'moderate'>('all');
  const [dispatchedIds, setDispatchedIds] = useState<Set<number>>(new Set());

  if (isLoading) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center bg-[#090E17]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-2 border-emerald-500/30 border-t-emerald-500 rounded-full animate-spin"></div>
          <span className="text-xs uppercase tracking-widest text-emerald-500/50 font-semibold animate-pulse">Initializing Comm Link...</span>
        </div>
      </div>
    );
  }

  if (hotspots.length === 0) {
    return (
      <div className="flex-1 p-6 flex items-center justify-center bg-[#090E17]">
        <div className="flex flex-col items-center gap-3 opacity-50">
          <CheckCircle2 size={32} className="text-emerald-500" />
          <p className="text-slate-400 text-sm font-medium tracking-wide">All Sectors Clear</p>
        </div>
      </div>
    );
  }

  // Filter Logic
  const filteredHotspots = [...hotspots].filter(h => {
    if (filter === 'critical') return h.umis_score >= 85;
    if (filter === 'moderate') return h.umis_score >= 70 && h.umis_score < 85;
    return true;
  }).sort((a, b) => b.umis_score - a.umis_score).slice(0, 15);

  const handleDispatch = (id: number) => {
    setDispatchedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id); // Cancel dispatch
      } else {
        newSet.add(id); // Dispatch
      }
      return newSet;
    });
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden bg-[#090E17]">
      
      {/* Header & Filters */}
      <div className="p-5 border-b border-slate-800/60 bg-[#0B1120]/50 backdrop-blur-md sticky top-0 z-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xs font-bold uppercase tracking-widest text-slate-300 flex items-center gap-2">
            <ShieldAlert size={14} className="text-emerald-500" /> Tactical Deployment
          </h2>
          <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-500 text-[10px] font-bold rounded flex items-center gap-1.5 border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
            <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-pulse"></span>
            LIVE
          </span>
        </div>
        
        <div className="flex bg-[#090E17] p-1 rounded-lg border border-slate-800">
          <button onClick={() => setFilter('all')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${filter === 'all' ? 'bg-slate-800 text-white shadow-md' : 'text-slate-500 hover:text-slate-300'}`}>All</button>
          <button onClick={() => setFilter('critical')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all flex items-center justify-center gap-1.5 ${filter === 'critical' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.1)]' : 'text-slate-500 hover:text-rose-400/70'}`}>
            <AlertTriangle size={10} /> Critical
          </button>
          <button onClick={() => setFilter('moderate')} className={`flex-1 py-1.5 text-[10px] font-bold uppercase tracking-wider rounded-md transition-all ${filter === 'moderate' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' : 'text-slate-500 hover:text-amber-400/70'}`}>Mod</button>
        </div>
      </div>

      {/* Scrollable Unit List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
        {filteredHotspots.length === 0 ? (
          <div className="text-center py-10 text-slate-500 text-xs tracking-wider">No targets matching criteria.</div>
        ) : (
          filteredHotspots.map((hotspot) => {
            const isCritical = hotspot.umis_score >= 85;
            const isDispatched = dispatchedIds.has(hotspot.id);
            const travelTime = Math.max(2, 18 - Math.floor(hotspot.umis_score / 10)); 

            return (
              <div 
                key={hotspot.id} 
                className={`group relative rounded-xl border transition-all duration-300 overflow-hidden ${
                  isDispatched 
                    ? 'border-emerald-500/50 bg-[#061B14] shadow-[0_0_15px_rgba(16,185,129,0.1)]' 
                    : isCritical 
                      ? 'border-rose-900/50 bg-gradient-to-br from-[#1c0f13] to-[#0B1120] hover:border-rose-500/50' 
                      : 'border-slate-800 bg-[#0B1120] hover:border-slate-700'
                }`}
              >
                {/* Background glow effect on hover */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>

                <div className="p-4 relative z-10">
                  <div className="flex justify-between items-start mb-3">
                    <div>
                      <h3 className={`font-bold text-sm flex items-center gap-2 mb-1 ${isDispatched ? 'text-emerald-400' : 'text-slate-200'}`}>
                        {hotspot.location_name}
                      </h3>
                      <div className="flex items-center gap-3 text-[10px] font-medium tracking-wider text-slate-400 uppercase">
                        <span className="flex items-center gap-1.5"><Car size={10} className={isCritical ? 'text-rose-400' : 'text-slate-500'}/> {hotspot.parked_cars_count} Violators</span>
                        {isDispatched && <span className="text-emerald-500 flex items-center gap-1"><Navigation size={10}/> ETA {travelTime}m</span>}
                      </div>
                    </div>
                    
                    {/* UMIS Badge */}
                    <div className={`px-2.5 py-1 rounded-md text-[11px] font-bold border backdrop-blur-sm shadow-lg ${
                      isCritical && !isDispatched ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse' : 
                      isDispatched ? 'bg-emerald-500/10 text-emerald-500 border-emerald-500/30' :
                      'bg-slate-800/50 text-amber-400 border-amber-500/30'
                    }`}>
                      UMIS {hotspot.umis_score.toFixed(1)}
                    </div>
                  </div>

                  {/* Action Bar */}
                  <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-end">
                    <button 
                      onClick={() => handleDispatch(hotspot.id)}
                      className={`px-4 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                        isDispatched 
                          ? 'bg-emerald-500/20 text-emerald-400 hover:bg-emerald-500/30 border border-emerald-500/30' 
                          : isCritical
                            ? 'bg-rose-600 hover:bg-rose-500 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                            : 'bg-blue-600 hover:bg-blue-500 text-white'
                      }`}
                    >
                      {isDispatched ? (
                        <>Unit En Route <CheckCircle2 size={12} /></>
                      ) : (
                        <>Dispatch Unit <Send size={12} /></>
                      )}
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

    </div>
  );
}
