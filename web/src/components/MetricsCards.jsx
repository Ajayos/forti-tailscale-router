import React from 'react';
import { Activity, Zap, Cpu, MemoryStick } from 'lucide-react';

export default function MetricsCards({ vpn, ping, health, instances }) {
  const isVpnConnected = vpn === 'Connected';

  const formatMem = (bytes) => (bytes / (1024 * 1024 * 1024)).toFixed(1) + ' GB';

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      
      {/* VPN Status */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-xl hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className={`p-2 rounded-lg ${isVpnConnected ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
            <Activity className="w-5 h-5" />
          </div>
          <h2 className="text-slate-300 font-medium">VPN Status</h2>
        </div>
        <p className={`text-2xl font-bold ${isVpnConnected ? 'text-emerald-400' : 'text-rose-400'}`}>
          {vpn || 'Unknown'}
        </p>
        <p className="text-xs text-slate-500 mt-1">{instances || 0} Active Instances</p>
      </div>

      {/* Ping */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-xl hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-fuchsia-500/20 text-fuchsia-400">
            <Zap className="w-5 h-5" />
          </div>
          <h2 className="text-slate-300 font-medium">Ping Latency</h2>
        </div>
        <p className="text-2xl font-bold text-white flex items-end gap-1">
          {ping && ping >= 0 ? ping.toFixed(1) : '--'}
          <span className="text-sm font-normal text-slate-400 mb-1">ms</span>
        </p>
      </div>

      {/* CPU */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-xl hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400">
            <Cpu className="w-5 h-5" />
          </div>
          <h2 className="text-slate-300 font-medium">CPU Load (1m)</h2>
        </div>
        <p className="text-2xl font-bold text-white flex items-end gap-1">
          {health?.cpuLoad ? health.cpuLoad[0].toFixed(2) : '--'}
        </p>
        <p className="text-xs text-slate-500 mt-1">{health?.cores || '-'} Cores Available</p>
      </div>

      {/* Memory */}
      <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-xl hover:bg-white/10 transition-colors">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400">
            <MemoryStick className="w-5 h-5" />
          </div>
          <h2 className="text-slate-300 font-medium">Memory Free</h2>
        </div>
        <p className="text-2xl font-bold text-white flex items-end gap-1">
          {health?.freeMem ? formatMem(health.freeMem) : '--'}
        </p>
        <p className="text-xs text-slate-500 mt-1">/ {health?.totalMem ? formatMem(health.totalMem) : '--'} Total</p>
      </div>

    </div>
  );
}
