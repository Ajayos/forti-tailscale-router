import React from 'react';
import { HardDrive, Network, Globe } from 'lucide-react';

export default function SystemInfo({ routing, ips }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 p-6 rounded-2xl shadow-xl flex flex-col h-full">
      <h2 className="text-lg font-medium text-white flex items-center gap-2 mb-4">
        <HardDrive className="w-5 h-5 text-indigo-400" /> Server Identity & Routes
      </h2>
      
      <div className="grid grid-cols-2 gap-4 mb-4">
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Network className="w-3 h-3"/> Internal IP</p>
          <p className="font-mono text-sm text-cyan-400">{ips?.internal || 'Pending'}</p>
        </div>
        <div className="bg-white/5 p-3 rounded-xl border border-white/5">
          <p className="text-xs text-slate-500 mb-1 flex items-center gap-1"><Globe className="w-3 h-3"/> Public IP</p>
          <p className="font-mono text-sm text-fuchsia-400">{ips?.publicIp || 'Pending'}</p>
        </div>
      </div>

      <div className="flex-1 bg-black/40 rounded-xl p-4 overflow-auto border border-white/5 text-xs font-mono text-slate-400 leading-relaxed whitespace-pre-wrap max-h-[220px]">
        {routing?.routes || 'Loading routes...'}
      </div>
    </div>
  );
}
