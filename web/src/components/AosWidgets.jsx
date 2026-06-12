import React, { useState, useEffect } from 'react';
import { Settings, Network } from 'lucide-react';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default function AosWidgets({ data }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true });
  const formatDate = (d) => d.toLocaleDateString([], { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });

  const cpuPercent = data?.health?.cpu || Math.floor(Math.random() * 10 + 5); 
  const ramPercent = data?.health?.ram || Math.floor(Math.random() * 20 + 30);

  const [rxVal, rxUnit] = formatBytes(data?.traffic?.downloadRate || 0).split(' ');
  const [txVal, txUnit] = formatBytes(data?.traffic?.uploadRate || 0).split(' ');

  return (
    <div className="w-full md:w-72 flex flex-col gap-6 shrink-0">
      
      {/* Time Widget */}
      <div className="aos-panel p-6 flex flex-col justify-center border-l-4 border-l-white bg-gradient-to-br from-indigo-600/90 to-purple-800/90 shadow-[0_0_20px_rgba(79,70,229,0.3)]">
        <h1 className="text-4xl font-bold text-white tracking-tight drop-shadow-md">{formatTime(time)}</h1>
        <p className="text-sm text-white/80 mt-2 font-medium">{formatDate(time)}</p>
      </div>

      {/* System Status */}
      <div className="aos-panel p-5 relative overflow-hidden bg-gradient-to-br from-rose-600/90 to-orange-700/90 shadow-[0_0_20px_rgba(225,29,72,0.3)]">
        <div className="absolute -right-4 -bottom-4 opacity-10 scale-150"><Settings className="w-32 h-32 text-white" /></div>
        <div className="flex justify-between items-center mb-4 text-white relative z-10">
          <h2 className="text-sm font-semibold tracking-wide uppercase">System</h2>
        </div>
        <div className="flex justify-around items-center relative z-10">
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-[3px] border-white/80 flex items-center justify-center bg-black/20 shadow-inner">
              <span className="text-lg font-bold text-white drop-shadow-sm">{cpuPercent}%</span>
            </div>
            <span className="text-xs text-white/80 mt-2 font-bold uppercase tracking-wider">CPU</span>
          </div>
          <div className="flex flex-col items-center">
            <div className="w-16 h-16 rounded-full border-[3px] border-white/80 flex items-center justify-center bg-black/20 shadow-inner">
              <span className="text-lg font-bold text-white drop-shadow-sm">{ramPercent}%</span>
            </div>
            <span className="text-xs text-white/80 mt-2 font-bold uppercase tracking-wider">RAM</span>
          </div>
        </div>
      </div>

      {/* Network Widget (Redesigned with Tailscale Details) */}
      <div className="aos-panel p-5 bg-gradient-to-br from-cyan-700/90 to-blue-900/90 relative overflow-hidden shadow-[0_0_20px_rgba(8,145,178,0.3)]">
        <svg viewBox="0 0 100 100" fill="currentColor" className="absolute right-0 top-0 w-48 h-48 text-white/10 transform translate-x-12 -translate-y-12 pointer-events-none">
           <path d="M50 0a50 50 0 1 0 50 50A50 50 0 0 0 50 0ZM30 65a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm0-15a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm0-15a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm20 30a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm0-15a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm0-15a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm20 30a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm0-15a5 5 0 1 1 5-5 5 5 0 0 1-5 5Zm0-15a5 5 0 1 1 5-5 5 5 0 0 1-5 5Z" />
        </svg>

        <div className="flex justify-between items-center mb-4 text-white relative z-10">
          <h2 className="text-sm font-bold tracking-wide flex items-center gap-2 uppercase">
             Tailscale Options
          </h2>
          <span className="text-[10px] uppercase font-bold text-white bg-white/20 px-2 py-0.5 rounded-full border border-white/30 shadow-sm">Active</span>
        </div>
        
        <div className="flex flex-col gap-3 relative z-10">
          <div className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
             <div className="flex flex-col">
               <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Interface Rx</span>
               <span className="text-emerald-400 font-bold text-lg flex items-center gap-1">↓ {rxVal} <span className="text-[10px] font-normal">{rxUnit}/s</span></span>
             </div>
          </div>
          <div className="flex justify-between items-center bg-black/20 rounded-lg p-3 border border-white/5 cursor-pointer hover:bg-white/5 transition-colors">
             <div className="flex flex-col">
               <span className="text-[10px] text-white/50 uppercase font-bold tracking-wider">Interface Tx</span>
               <span className="text-blue-400 font-bold text-lg flex items-center gap-1">↑ {txVal} <span className="text-[10px] font-normal">{txUnit}/s</span></span>
             </div>
          </div>
          <div className="mt-2 w-full pt-3 border-t border-white/10 flex justify-between items-center">
             <span className="text-xs text-white/70">Routing Nodes</span>
             <span className="text-xs font-bold text-white bg-white/10 px-2 py-0.5 rounded">{data?.peers?.length || 0} Devices</span>
          </div>
        </div>
      </div>

    </div>
  );
}

