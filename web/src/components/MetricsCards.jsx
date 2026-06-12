import React from 'react';
import { Activity, Zap, Cpu, MemoryStick } from 'lucide-react';

export default function MetricsCards({ vpn, peers, ping, traffic }) {
  const isVpnConnected = vpn === 'Connected';

  const formatMem = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* VPN Status */}
      <div className="aura-widget-hoverable p-7 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="w-24 h-24 text-emerald-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-[1rem] bg-emerald-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(16,185,129,0.3)]">
              <Activity className="w-6 h-6 text-emerald-400" />
            </div>
            {isVpnConnected && <div className="w-4 h-4 rounded-full bg-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse" />}
          </div>
          <h2 className="text-white/70 font-semibold mb-1 text-sm uppercase tracking-wider">VPN Status</h2>
          <p className="text-3xl font-bold text-white drop-shadow-md">
            {isVpnConnected ? 'Connected' : (vpn || 'Unknown')}
          </p>
        </div>
        <p className="text-sm text-emerald-400 font-semibold mt-6 relative z-10">Secure Tunnel Active</p>
      </div>

      {/* Active Peers */}
      <div className="aura-widget-hoverable p-7 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Zap className="w-24 h-24 text-cyan-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-[1rem] bg-cyan-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(6,182,212,0.3)]">
              <Zap className="w-6 h-6 text-cyan-400" />
            </div>
            <div className="flex items-center gap-1">
               <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
               <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
               <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
            </div>
          </div>
          <h2 className="text-white/70 font-semibold mb-1 text-sm uppercase tracking-wider">Active Peers</h2>
          <p className="text-3xl font-bold text-white drop-shadow-md">
            {peers ? peers.length : 0} devices
          </p>
        </div>
        <p className="text-sm text-cyan-400 font-semibold mt-6 relative z-10">Routing Network</p>
      </div>

      {/* Ping */}
      <div className="aura-widget-hoverable p-7 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <Activity className="w-24 h-24 text-purple-400" />
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-[1rem] bg-purple-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(168,85,247,0.3)]">
              <Activity className="w-6 h-6 text-purple-400" />
            </div>
          </div>
          <h2 className="text-white/70 font-semibold mb-1 text-sm uppercase tracking-wider">Ping Latency</h2>
          <p className="text-3xl font-bold text-white flex items-baseline gap-1 drop-shadow-md">
            {ping?.current >= 0 ? ping.current.toFixed(1) : '--'}
            <span className="text-lg font-normal text-white/50">ms</span>
          </p>
        </div>
        <p className="text-sm text-purple-400 font-semibold mt-6 relative z-10">Avg: {ping?.average >= 0 ? ping.average.toFixed(1) : '--'} ms</p>
      </div>

      {/* Traffic */}
      <div className="aura-widget-hoverable p-7 flex flex-col justify-between relative overflow-hidden group">
        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-24 h-24 text-orange-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
        </div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="p-3 rounded-[1rem] bg-orange-500/20 backdrop-blur-md shadow-[0_0_20px_rgba(249,115,22,0.3)]">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-orange-400"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
            </div>
          </div>
          <h2 className="text-white/70 font-semibold mb-1 text-sm uppercase tracking-wider">Network Traffic</h2>
          <p className="text-xl font-bold text-white leading-tight drop-shadow-md">
            {traffic ? (traffic.downloadRate / 1024 / 1024).toFixed(1) : '0'} <span className="text-sm font-normal text-white/50">MB/s down</span><br/>
            {traffic ? (traffic.uploadRate / 1024 / 1024).toFixed(1) : '0'} <span className="text-sm font-normal text-white/50">MB/s up</span>
          </p>
        </div>
        <p className="text-sm text-orange-400 font-semibold mt-6 relative z-10">
          Total: {traffic ? (traffic.totalDownload / 1024 / 1024).toFixed(1) : '0'} MB ↓ / {traffic ? (traffic.totalUpload / 1024 / 1024).toFixed(1) : '0'} MB ↑
        </p>
      </div>

    </div>
  );
}

