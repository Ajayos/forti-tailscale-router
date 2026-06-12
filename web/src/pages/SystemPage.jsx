import React from 'react';
import SystemInfo from '../components/SystemInfo';
import { Cpu, MemoryStick, Server, Box } from 'lucide-react';

export default function SystemPage({ data }) {
  if (!data) return null;
  const h = data.health;
  
  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-6">System Information</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <p className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Server className="w-4 h-4"/> OS Info</p>
            <p className="text-white font-medium">{h?.osInfo}</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <p className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Cpu className="w-4 h-4"/> CPU Cores</p>
            <p className="text-white font-medium">{h?.cores}</p>
          </div>
          <div className="bg-slate-900/50 p-4 rounded-xl border border-white/5">
            <p className="text-slate-400 text-sm mb-1 flex items-center gap-2"><Box className="w-4 h-4"/> Container Uptime</p>
            <p className="text-white font-medium">{h?.uptime ? (h.uptime / 3600).toFixed(1) + ' Hours' : '-'}</p>
          </div>
        </div>

        <SystemInfo routing={data.routing} ips={data.ips} />

      </div>

    </div>
  );
}
