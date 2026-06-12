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
      
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center p-6 glass-card">
        <div>
          <h2 className="text-2xl font-bold text-white tracking-tight">Dashboard</h2>
          <p className="text-slate-400 mt-1">Real-time metrics and routing status.</p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-4">
          <button 
            onClick={async () => { await axios.post('/api/vpn/restart'); alert('VPN Restarting...'); }}
            className="btn-restart"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8"/><path d="M3 3v5h5"/><path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16"/><path d="M16 21v-5h5"/></svg>
            Restart VPN
          </button>
        </div>
      </header>

      <MetricsCards vpn={data?.vpn} peers={data?.peers} ping={data?.ping} traffic={data?.traffic} />
      <SystemGraphs history={history} />
      <PeerTable peers={data?.peers} />
    </div>
  );
}
