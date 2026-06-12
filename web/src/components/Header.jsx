import React from 'react';
import { Globe, Power } from 'lucide-react';

export default function Header({ restartVpn }) {
  return (
    <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
      <div>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight flex items-center gap-3">
          <Globe className="text-indigo-400 w-8 h-8" />
          Forti-Tailscale Gateway
        </h1>
        <p className="text-slate-400 mt-1">Secure unified routing for your tailnet.</p>
      </div>
      <div className="mt-4 md:mt-0 flex gap-4">
        <button 
          onClick={restartVpn}
          className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-indigo-500/20 active:scale-95"
        >
          <Power className="w-4 h-4" /> Restart VPN
        </button>
      </div>
    </header>
  );
}
