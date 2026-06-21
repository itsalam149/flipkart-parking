/* eslint-disable @next/next/no-img-element */
"use client";

import React from 'react';
import { Camera, Radio } from 'lucide-react';

export default function LiveCameraFeed() {
  return (
    <div className="absolute bottom-8 right-8 z-50 w-[420px] rounded-2xl border border-slate-700/60 bg-[#090E17]/90 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl overflow-hidden transform transition-all duration-500 hover:scale-[1.02]">
      
      {/* HUD Header */}
      <div className="px-4 py-3 border-b border-slate-700/50 bg-[#0B1120]/80 flex justify-between items-center">
        <div className="flex items-center gap-2">
          <Camera size={16} className="text-slate-400" />
          <span className="text-xs font-semibold uppercase tracking-widest text-slate-300">Live Node 01</span>
        </div>
        <div className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-rose-500/10 border border-rose-500/20">
          <Radio size={10} className="text-rose-500 animate-pulse" />
          <span className="text-[10px] font-bold uppercase tracking-wider text-rose-500">Rec</span>
        </div>
      </div>

      {/* Video Stream Container */}
      <div className="relative aspect-video bg-black w-full overflow-hidden">
        {/* The img tag natively decodes the multipart MJPEG stream from FastAPI */}
        <img 
          src="http://localhost:8000/api/stream/video" 
          alt="Live Camera Feed"
          className="w-full h-full object-cover"
        />
        
        {/* Scanline Overlay Effect */}
        <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_bottom,rgba(255,255,255,0),rgba(255,255,255,0)_50%,rgba(0,0,0,0.1)_50%,rgba(0,0,0,0.1))] bg-[length:100%_4px]"></div>
      </div>
      
      {/* HUD Footer */}
      <div className="px-4 py-2.5 bg-[#0B1120]/90 flex justify-between items-center text-[10px] font-mono tracking-widest text-slate-500">
        <span>OUTER RING ROAD</span>
        <span className="text-emerald-500">ONLINE</span>
      </div>
      
    </div>
  );
}
