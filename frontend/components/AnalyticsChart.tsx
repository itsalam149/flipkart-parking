"use client";

import React, { useEffect, useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import { Activity } from 'lucide-react';

interface AnalyticsChartProps {
  currentScore: number;
}

export default function AnalyticsChart({ currentScore }: AnalyticsChartProps) {
  const [data, setData] = useState<{ time: string; umis: number }[]>([]);

  useEffect(() => {
    const now = new Date();
    const timeStr = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')}`;
    
    setData(prevData => {
      const newData = [...prevData, { time: timeStr, umis: currentScore }];
      // Keep last 15 data points
      if (newData.length > 15) {
        return newData.slice(newData.length - 15);
      }
      return newData;
    });
  }, [currentScore]);

  return (
    <div className="w-full h-full flex flex-col">
      <div className="flex items-center gap-2 mb-2 px-1">
        <Activity size={14} className="text-blue-400" />
        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">System Activity</span>
      </div>
      
      <div className="flex-1 w-full min-h-[120px]">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 0, left: -25, bottom: 0 }}>
            <defs>
              <linearGradient id="colorUmis" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
            <XAxis 
              dataKey="time" 
              stroke="#475569" 
              fontSize={10} 
              tickMargin={5}
              minTickGap={20}
            />
            <YAxis 
              stroke="#475569" 
              fontSize={10} 
              domain={[0, 100]} 
              tickCount={5}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#0f172a', 
                borderColor: '#1e293b',
                borderRadius: '8px',
                fontSize: '12px'
              }}
              itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
            />
            <Area 
              type="monotone" 
              dataKey="umis" 
              stroke="#3b82f6" 
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorUmis)" 
              isAnimationActive={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
