import React from 'react';
import SystemInfo from '../components/SystemInfo';
import { Cpu, MemoryStick, Server, Box } from 'lucide-react';
import { Cpu, Server, Activity, Globe, Database } from 'lucide-react';

export default function SystemPage({ data, uptimes }) {
  if (!data) return null;
  const { health, ips, routing } = data;

  const formatUptime = (seconds) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h`;
  };
  
  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-8">System Info</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Server className="w-5 h-5 text-indigo-400" />
            <h3 className="font-semibold text-white">OS Release</h3>
          </div>
          <p className="text-slate-300 font-mono text-sm break-words">{health?.osInfo || 'Loading...'}</p>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Cpu className="w-5 h-5 text-purple-400" />
            <h3 className="font-semibold text-white">Hardware</h3>
          </div>
          <p className="text-slate-300 text-sm">Cores Available: <span className="font-mono text-white">{health?.cores || '?'}</span></p>
          <p className="text-slate-300 text-sm">Total RAM: <span className="font-mono text-white">{health?.totalMem ? (health.totalMem / 1024 / 1024 / 1024).toFixed(2) : '?'} GB</span></p>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-2">
            <Activity className="w-5 h-5 text-emerald-400" />
            <h3 className="font-semibold text-white">Uptimes</h3>
          </div>
          <div className="space-y-1 mt-2 text-sm text-slate-300">
            <div className="flex justify-between"><span>Host System:</span> <span className="font-mono text-white">{formatUptime(uptimes?.system || health?.uptime || 0)}</span></div>
            <div className="flex justify-between"><span>Node Server:</span> <span className="font-mono text-white">{formatUptime(uptimes?.server || 0)}</span></div>
            <div className="flex justify-between"><span>FortiGate VPN:</span> <span className="font-mono text-emerald-400">{formatUptime(uptimes?.vpn || 0)}</span></div>
            <div className="flex justify-between"><span>Tailscale Exit:</span> <span className="font-mono text-cyan-400">{formatUptime(uptimes?.tailscale || 0)}</span></div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Globe className="w-5 h-5 text-blue-400" />
            <h3 className="font-semibold text-white">Network Interfaces</h3>
          </div>
          <div className="space-y-4 text-sm">
            <div>
              <p className="text-slate-400">Tailscale IP (Internal)</p>
              <p className="font-mono text-white bg-black/30 px-3 py-2 rounded mt-1 border border-white/5">{ips?.internal || 'Unavailable'}</p>
            </div>
            <div>
              <p className="text-slate-400">Public IP (External)</p>
              <p className="font-mono text-white bg-black/30 px-3 py-2 rounded mt-1 border border-white/5">{ips?.publicIp || 'Unavailable'}</p>
            </div>
          </div>
        </div>
        
        <div className="glass-card p-6">
          <div className="flex items-center gap-3 mb-4">
            <Database className="w-5 h-5 text-rose-400" />
            <h3 className="font-semibold text-white">Native Routing Table</h3>
          </div>
          <div className="bg-black/30 rounded-xl p-4 overflow-x-auto border border-white/5 h-48 overflow-y-auto">
            <pre className="text-xs text-slate-300 font-mono leading-relaxed">
              {routing?.routes || 'Loading routing tables...'}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
