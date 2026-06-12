import React from 'react';
import axios from 'axios';
import { Play, Square } from 'lucide-react';
import MetricsCards from '../components/MetricsCards';
import SystemGraphs from '../components/SystemGraphs';
import PeerTable from '../components/PeerTable';

export default function Dashboard({ data, history }) {
  const startVpn = async () => {
    try {
      await axios.post('/api/vpn/start');
      alert('VPN Start initiated.');
    } catch (e) {}
  };

  const stopVpn = async () => {
    try {
      await axios.post('/api/vpn/stop');
      alert('VPN Stopped.');
    } catch (e) {}
  };

  const isStopped = data?.vpn === 'Stopped manually';

  return (
    <div className="max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-400 mt-1">Real-time metrics and routing status.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          {isStopped ? (
            <button 
              onClick={startVpn}
              className="px-4 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-emerald-500/20 active:scale-95"
            >
              <Play className="w-4 h-4 fill-emerald-400" /> Start VPN
            </button>
          ) : (
            <button 
              onClick={stopVpn}
              className="px-4 py-2 bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-lg transition-all flex items-center gap-2 font-medium shadow-lg hover:shadow-rose-500/20 active:scale-95"
            >
              <Square className="w-4 h-4 fill-rose-400" /> Stop VPN
            </button>
          )}
        </div>
      </header>

      <MetricsCards vpn={data?.vpn} ping={data?.ping} health={data?.health} instances={data?.instances} />
      <SystemGraphs history={history} />
      <PeerTable peers={data?.peers} />
    </div>
  );
}
