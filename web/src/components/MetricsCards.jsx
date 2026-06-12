import React from 'react';
import { Activity, Zap, Cpu, MemoryStick } from 'lucide-react';

export default function MetricsCards({ vpn, ping, health, instances }) {
  const isVpnConnected = vpn === 'Connected';

  const formatMem = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* VPN Status */}
      <div className="glow-card-green p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className={`p-2 rounded-xl border ${isVpnConnected ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400'}`}>
              <Activity className="w-6 h-6" />
            </div>
            {isVpnConnected && <div className="w-6 h-6 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30 shadow-[0_0_10px_rgba(16,185,129,0.5)]"><div className="w-3 h-3 bg-emerald-400 rounded-full" /></div>}
          </div>
          <h2 className="text-slate-300 font-medium mb-1">VPN Status</h2>
          <p className={`text-3xl font-bold ${isVpnConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
            {isVpnConnected ? 'Connected' : (vpn || 'Unknown')}
          </p>
        </div>
        <p className="text-sm text-emerald-500/70 mt-6 font-medium">Active</p>
      </div>

      {/* Active Peers */}
      <div className="glow-card-cyan p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-cyan-500/10 border border-cyan-500/30 text-cyan-400">
              <Zap className="w-6 h-6" />
            </div>
            <div className="flex items-center gap-1">
               <div className="w-2 h-2 rounded-full bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
               <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
               <div className="w-2 h-2 rounded-full bg-cyan-400/50" />
            </div>
          </div>
          <h2 className="text-slate-300 font-medium mb-1">Active Peers</h2>
          <p className="text-3xl font-bold text-cyan-400">
            {peers ? peers.length : 0} devices
          </p>
        </div>
        <p className="text-sm text-cyan-500/70 mt-6 font-medium">Active</p>
      </div>

      {/* Ping */}
      <div className="glow-card-purple p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-purple-500/10 border border-purple-500/30 text-purple-400">
              <Activity className="w-6 h-6" />
            </div>
            <div className="opacity-50 text-purple-400"><Activity className="w-10 h-6" strokeWidth={1}/></div>
          </div>
          <h2 className="text-slate-300 font-medium mb-1">Ping Latency</h2>
          <p className="text-3xl font-bold text-purple-400 flex items-baseline gap-1">
            {ping?.current >= 0 ? ping.current.toFixed(1) : '--'}
            <span className="text-lg font-normal text-purple-400/70">ms</span>
          </p>
        </div>
        <p className="text-sm text-purple-500/70 mt-6 font-medium">Avg: {ping?.average >= 0 ? ping.average.toFixed(1) : '--'} ms</p>
      </div>

      {/* Traffic */}
      <div className="glow-card-orange p-6 rounded-2xl flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-4">
            <div className="p-2 rounded-xl bg-orange-500/10 border border-orange-500/30 text-orange-400">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 16 4 4 4-4"/><path d="M7 20V4"/><path d="m21 8-4-4-4 4"/><path d="M17 4v16"/></svg>
            </div>
            <div className="opacity-50 text-orange-400"><Activity className="w-10 h-6" strokeWidth={1}/></div>
          </div>
          <h2 className="text-slate-300 font-medium mb-1">Network Traffic</h2>
          <p className="text-xl font-bold text-orange-400 leading-tight">
            {traffic ? (traffic.downloadRate / 1024 / 1024).toFixed(1) : '0'} MB/s down,<br/>
            {traffic ? (traffic.uploadRate / 1024 / 1024).toFixed(1) : '0'} MB/s up
          </p>
        </div>
        <p className="text-sm text-orange-500/70 mt-6 font-medium">
          Total: {traffic ? (traffic.totalDownload / 1024 / 1024).toFixed(1) : '0'} MB ↓ / {traffic ? (traffic.totalUpload / 1024 / 1024).toFixed(1) : '0'} MB ↑
        </p>
      </div>

    </div>
  );
}
