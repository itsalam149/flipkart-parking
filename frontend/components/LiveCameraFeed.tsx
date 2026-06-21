/* eslint-disable @next/next/no-img-element */
"use client";

import React, { useState } from 'react';
import { Camera, Radio, Maximize2, Minimize2, Crosshair } from 'lucide-react';

export default function LiveCameraFeed() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeCamera, setActiveCamera] = useState(1);

  const getCameraName = () => {
    if (activeCamera === 1) return "OUTER RING ROAD";
    if (activeCamera === 2) return "METRO STATION GATE";
    if (activeCamera === 3) return "TECH PARK EXIT";
    return "";
  };

  return (
    <div className={`absolute bottom-6 right-6 z-50 rounded-xl border-2 border-slate-700/60 bg-[#090E17]/95 shadow-[0_20px_50px_rgba(0,0,0,0.8)] backdrop-blur-xl overflow-hidden transition-all duration-500 group ${isExpanded ? 'w-[800px] hover:border-emerald-500/50' : 'w-[450px] hover:scale-[1.02] hover:border-blue-500/50'}`}>
      
      {/* Dynamic Glowing Border effect */}
      <div className="absolute inset-0 border-2 border-transparent group-hover:border-white/10 rounded-xl pointer-events-none transition-colors"></div>

      {/* HUD Header */}
      <div className="px-4 py-3 border-b border-slate-700/80 bg-gradient-to-r from-[#0B1120]/90 to-[#090E17]/90 flex justify-between items-center relative">
        <div className="absolute left-0 top-0 w-1 h-full bg-emerald-500"></div>
        <div className="flex items-center gap-3">
          <Camera size={16} className="text-emerald-500" />
          <span className="text-xs font-bold uppercase tracking-[0.2em] text-slate-200">
            Node_{String(activeCamera).padStart(2, '0')}
          </span>
        </div>

        {/* Camera Switcher Buttons */}
        <div className="flex gap-1 bg-[#090E17] p-1 rounded-md border border-slate-700">
            <button onClick={() => setActiveCamera(1)} className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeCamera === 1 ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>CAM 1</button>
            <button onClick={() => setActiveCamera(2)} className={`px-2 py-0.5 text-[9px] font-bold rounded flex gap-1 items-center ${activeCamera === 2 ? 'bg-rose-600 text-white' : 'text-rose-400 hover:text-rose-300'}`}>
              <span className="w-1.5 h-1.5 bg-rose-300 rounded-full animate-ping"></span> CAM 2
            </button>
            <button onClick={() => setActiveCamera(3)} className={`px-2 py-0.5 text-[9px] font-bold rounded ${activeCamera === 3 ? 'bg-emerald-500 text-white' : 'text-slate-400 hover:text-white'}`}>CAM 3</button>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/30 shadow-[0_0_10px_rgba(244,63,94,0.2)]">
            <Radio size={10} className="text-rose-500 animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Rec</span>
          </div>
          <button 
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-slate-400 hover:text-white transition-colors"
          >
            {isExpanded ? <Minimize2 size={16} /> : <Maximize2 size={16} />}
          </button>
        </div>
      </div>

      {/* Video Stream Container */}
      <div className="relative bg-black w-full overflow-hidden" style={{ aspectRatio: isExpanded ? '16/7' : '16/9' }}>
        {/* Four corner HUD crosshairs */}
        <div className="absolute top-2 left-2 w-4 h-4 border-t-2 border-l-2 border-emerald-500/50 pointer-events-none z-10"></div>
        <div className="absolute top-2 right-2 w-4 h-4 border-t-2 border-r-2 border-emerald-500/50 pointer-events-none z-10"></div>
        <div className="absolute bottom-2 left-2 w-4 h-4 border-b-2 border-l-2 border-emerald-500/50 pointer-events-none z-10"></div>
        <div className="absolute bottom-2 right-2 w-4 h-4 border-b-2 border-r-2 border-emerald-500/50 pointer-events-none z-10"></div>

        {/* Center Crosshair slightly visible */}
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-10 opacity-20">
          <Crosshair size={48} strokeWidth={1} className="text-emerald-500" />
        </div>

        {/* The img tag natively decodes the multipart MJPEG stream from FastAPI */}
        <img 
          key={activeCamera} // Force rerender of image when camera changes
          src={`http://localhost:8000/api/stream/video/${activeCamera}`} 
          alt={`Live Camera Feed ${activeCamera}`}
          className="w-full h-full object-cover"
        />
        
        {/* Improved Scanline Overlay Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(rgba(18,16,16,0)_50%,rgba(0,0,0,0.25)_50%),linear-gradient(90deg,rgba(255,0,0,0.06),rgba(0,255,0,0.02),rgba(0,0,255,0.06))] bg-[length:100%_4px,3px_100%] z-20"></div>
      </div>
      
      {/* HUD Footer */}
      <div className="px-4 py-2 bg-[#0B1120] flex justify-between items-center text-[10px] font-mono tracking-widest border-t border-slate-800">
        <div className="flex gap-4 text-slate-500 uppercase">
          <span>{getCameraName()}</span>
        </div>
        <span className="text-emerald-500 font-bold bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 shadow-[0_0_5px_rgba(16,185,129,0.2)]">UPLINK ACTIVE</span>
      </div>
      
    </div>
  );
}
