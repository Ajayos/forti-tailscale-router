import React from 'react';
import { Monitor } from 'lucide-react';

export default function PeerTable({ peers }) {
  return (
    <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl shadow-xl overflow-hidden flex flex-col h-full">
      <div className="p-6 border-b border-white/5 flex items-center justify-between">
        <h2 className="text-lg font-medium text-white flex items-center gap-2">
          <Monitor className="w-5 h-5 text-indigo-400" /> Connected Devices ({peers?.length || 0})
        </h2>
      </div>
      <div className="overflow-auto max-h-[350px]">
        <table className="w-full text-left text-sm whitespace-nowrap">
          <thead className="bg-white/5 text-slate-400 sticky top-0 backdrop-blur-md">
            <tr>
              <th className="p-4 font-medium">Hostname</th>
              <th className="p-4 font-medium">IP Address</th>
              <th className="p-4 font-medium text-right">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {(peers || []).map((p, i) => (
              <tr key={i} className="hover:bg-white/[0.02] transition-colors">
                <td className="p-4 font-medium text-slate-200">{p.name}</td>
                <td className="p-4 font-mono text-slate-400">{p.ip}</td>
                <td className="p-4 text-right">
                  <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium ${p.online ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'}`}>
                    <span className={`w-1.5 h-1.5 rounded-full ${p.online ? 'bg-emerald-400' : 'bg-slate-400'}`}></span>
                    {p.online ? 'Online' : 'Offline'}
                  </span>
                </td>
              </tr>
            ))}
            {(!peers || peers.length === 0) && (
              <tr>
                <td colSpan="3" className="p-8 text-center text-slate-500">
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
