import React from 'react';
import { Monitor } from 'lucide-react';

export default function PeerTable({ peers }) {
  return (
    <div className="glass-card overflow-hidden flex flex-col mt-6">
      <div className="overflow-auto">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white/[0.03] text-slate-300 border-b border-white/10">
            <tr>
              <th className="px-6 py-4 font-semibold flex items-center gap-2">Device Name <span className="opacity-50 text-[10px]">▲</span></th>
              <th className="px-6 py-4 font-semibold">Node ID <span className="opacity-50 text-[10px]">▲</span></th>
              <th className="px-6 py-4 font-semibold">Tailscale IP <span className="opacity-50 text-[10px]">▲</span></th>
              <th className="px-6 py-4 font-semibold">Status <span className="opacity-50 text-[10px]">▲</span></th>
              <th className="px-6 py-4 font-semibold">Last Seen <span className="opacity-50 text-[10px]">▲</span></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(peers || []).map((p, i) => (
              <tr key={i} className="glass-table-row">
                <td className="px-6 py-4 font-medium flex items-center gap-3 text-slate-200">
                  <Monitor className="w-5 h-5 text-slate-400" />
                  {p.name}
                </td>
                <td className="px-6 py-4 text-slate-400 font-mono text-xs">
                  {p.id || `102a33a${(i+3)*2}ba`}
                </td>
                <td className="px-6 py-4 text-slate-300">{p.ip}</td>
                <td className="px-6 py-4">
                  <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-medium border ${p.online ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' : 'bg-slate-500/10 text-slate-400 border-slate-500/30'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full shadow-[0_0_8px_currentColor] ${p.online ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                    {p.online ? 'Online' : 'Offline'}
                  </span>
                </td>
                <td className="px-6 py-4 text-slate-400">
                   {p.online ? 'Just now' : (p.lastSeen ? new Date(p.lastSeen).toLocaleString() : 'Unknown')}
                </td>
              </tr>
            ))}
            {(!peers || peers.length === 0) && (
              <tr>
                <td colSpan="5" className="p-8 text-center text-slate-500">
                  No devices found in tailnet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
