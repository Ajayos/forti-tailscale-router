import React, { useState, useEffect } from 'react';
import { Plus, Activity, Zap, Terminal, Server, Shield, Settings, Network, Smartphone, Laptop, Power, PowerOff, RefreshCw, Save } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import axios from 'axios';

const formatBytes = (bytes, decimals = 2) => {
  if (!+bytes) return '0 B';
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
};

export default function Dashboard({ data, history }) {
  const [activeTab, setActiveTab] = useState('system');
  const [config, setConfig] = useState({ fortiHost: '', fortiPort: '', fortiUser: '', fortiPass: '', fortiCert: '', tailscaleSubnets: '' });
  
  useEffect(() => {
    if (activeTab === 'config') {
      axios.get('/api/config').then(res => setConfig(res.data)).catch(() => {});
    }
  }, [activeTab]);

  const isVpnConnected = data?.vpn === 'Connected';
  const peerCount = data?.peers ? data?.peers.length : 0;

  const handleSaveConfig = async () => {
    try {
      await axios.post('/api/config', config);
      alert('Configuration saved & applied successfully.');
    } catch (e) {
      alert('Failed to save configuration.');
    }
  };

  const vpnAction = async (action) => {
    try {
      await axios.post(`/api/vpn/${action}`);
    } catch (e) {
      alert(`Failed to ${action} VPN.`);
    }
  };

  const getDeviceIcon = (name) => {
    const lower = name.toLowerCase();
    if (lower.includes('lap') || lower.includes('mac') || lower.includes('pc') || lower.includes('desk')) {
      return <Laptop className="w-8 h-8 text-white/80" />;
    }
    return <Smartphone className="w-8 h-8 text-white/80" />;
  };

  // Render content based on active tab
  const renderTabContent = () => {
    const [downVal, downUnit] = formatBytes(data?.traffic?.totalDownload || 0).split(' ');
    const [upVal, upUnit] = formatBytes(data?.traffic?.totalUpload || 0).split(' ');

    switch(activeTab) {
      case 'system':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="grid grid-cols-2 gap-6">
                <div className="bg-gradient-to-br from-emerald-500/20 to-teal-900/40 rounded-xl p-5 border border-emerald-500/30 shadow-[0_0_15px_rgba(16,185,129,0.1)] hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden group">
                   <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500"><Activity className="w-32 h-32 text-emerald-400" /></div>
                   <h4 className="text-emerald-400/80 text-xs uppercase font-bold tracking-wider mb-2 relative z-10 group-hover:text-emerald-400 transition-colors">Total Download</h4>
                   <span className="text-emerald-400 text-4xl font-black drop-shadow-md relative z-10">
                     {downVal} <span className="text-sm font-normal text-emerald-400/50">{downUnit}</span>
                   </span>
                </div>
                <div className="bg-gradient-to-br from-blue-500/20 to-indigo-900/40 rounded-xl p-5 border border-blue-500/30 shadow-[0_0_15px_rgba(59,130,246,0.1)] hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:scale-[1.02] transition-all duration-300 cursor-pointer relative overflow-hidden group">
                   <div className="absolute -right-4 -top-4 opacity-10 group-hover:opacity-20 group-hover:scale-110 transition-all duration-500"><Activity className="w-32 h-32 text-blue-400" /></div>
                   <h4 className="text-blue-400/80 text-xs uppercase font-bold tracking-wider mb-2 relative z-10 group-hover:text-blue-400 transition-colors">Total Upload</h4>
                   <span className="text-blue-400 text-4xl font-black drop-shadow-md relative z-10">
                     {upVal} <span className="text-sm font-normal text-blue-400/50">{upUnit}</span>
                   </span>
                </div>
             </div>
             
             {/* Combined Large Chart */}
             <div className="bg-black/30 backdrop-blur-md rounded-xl p-4 border border-white/5 hover:border-white/20 transition-all duration-300 flex flex-col shadow-inner h-64 group cursor-pointer">
                <h4 className="text-white/80 text-xs uppercase font-bold tracking-wider mb-2 flex justify-between group-hover:text-white transition-colors">
                  <span>Live System Traffic</span>
                  <div className="flex gap-4">
                    <span className="text-emerald-400 flex items-center gap-1"><div className="w-2 h-2 bg-emerald-400 rounded-full group-hover:animate-pulse"></div> Download</span>
                    <span className="text-blue-400 flex items-center gap-1"><div className="w-2 h-2 bg-blue-400 rounded-full group-hover:animate-pulse"></div> Upload</span>
                  </div>
                </h4>
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={history} margin={{ top: 10, right: 0, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDown" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorUp" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.6}/>
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                    <XAxis dataKey="time" stroke="rgba(255,255,255,0.2)" fontSize={9} tickMargin={8} />
                    <YAxis stroke="rgba(255,255,255,0.2)" fontSize={9} tickFormatter={(v) => formatBytes(v, 0)} width={60} />
                    <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '8px' }} formatter={(value) => formatBytes(value, 2) + '/s'} />
                    <Area type="monotone" dataKey="downloadRate" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorDown)" name="Download" />
                    <Area type="monotone" dataKey="uploadRate" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorUp)" name="Upload" />
                  </AreaChart>
                </ResponsiveContainer>
             </div>

             {/* Small Specific Charts */}
             <div className="grid grid-cols-2 gap-6 h-40">
                <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/5 hover:border-cyan-500/40 hover:shadow-[0_0_20px_rgba(6,182,212,0.2)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col shadow-inner relative overflow-hidden group">
                  <Network className="absolute right-2 top-2 w-12 h-12 text-cyan-500/10 group-hover:text-cyan-500/20 group-hover:scale-110 transition-all duration-500" />
                  <h4 className="text-cyan-400/80 text-xs uppercase font-bold tracking-wider mb-2 flex justify-between relative z-10 group-hover:text-cyan-400 transition-colors">
                    <span>Tailscale Interface</span>
                    <span className="text-cyan-400 font-bold">{formatBytes(data?.traffic?.downloadRate || 0, 1)}/s</span>
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorTs" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: '8px' }} formatter={(value) => formatBytes(value, 2) + '/s'} labelStyle={{ display: 'none' }} />
                      <Area type="monotone" dataKey="downloadRate" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorTs)" name="Rx" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
                
                <div className="bg-black/30 backdrop-blur-md rounded-xl p-3 border border-white/5 hover:border-rose-500/40 hover:shadow-[0_0_20px_rgba(244,63,94,0.2)] hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col shadow-inner relative overflow-hidden group">
                  <Shield className="absolute right-2 top-2 w-12 h-12 text-rose-500/10 group-hover:text-rose-500/20 group-hover:scale-110 transition-all duration-500" />
                  <h4 className="text-rose-400/80 text-xs uppercase font-bold tracking-wider mb-2 flex justify-between relative z-10 group-hover:text-rose-400 transition-colors">
                    <span>FortiClient VPN</span>
                    <span className="text-rose-400 font-bold">{formatBytes(data?.traffic?.uploadRate || 0, 1)}/s</span>
                  </h4>
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={history} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorVpn" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.5}/>
                          <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="time" hide />
                      <YAxis hide />
                      <Tooltip contentStyle={{ backgroundColor: 'rgba(15,23,42,0.9)', border: '1px solid rgba(244,63,94,0.3)', borderRadius: '8px' }} formatter={(value) => formatBytes(value, 2) + '/s'} labelStyle={{ display: 'none' }} />
                      <Area type="monotone" dataKey="uploadRate" stroke="#f43f5e" strokeWidth={2} fillOpacity={1} fill="url(#colorVpn)" name="Tx" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
             </div>
          </div>
        );
      case 'tailscale':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="flex justify-between items-center bg-cyan-900/20 p-4 rounded-xl border border-cyan-500/20">
               <div className="flex flex-col">
                 <span className="text-white font-bold text-lg">Tailscale Mesh Network</span>
                 <span className="text-cyan-400/80 text-xs font-semibold">{peerCount} Devices Connected</span>
               </div>
             </div>
             <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {data?.peers?.map(peer => (
                  <div key={peer.id} className="bg-white/5 hover:bg-white/10 hover:scale-[1.02] transition-all duration-300 border border-white/10 rounded-xl p-4 flex items-center gap-4 shadow-lg hover:shadow-cyan-500/20">
                    <div className="w-12 h-12 rounded-full bg-cyan-500/20 flex items-center justify-center border border-cyan-500/30">
                      {getDeviceIcon(peer.name)}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-white font-bold truncate">{peer.name}</span>
                      <span className="text-white/50 text-xs font-mono">{peer.ip}</span>
                      <div className="flex items-center gap-1 mt-1">
                        {peer.online ? (
                          <><div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]"></div><span className="text-emerald-400 text-[10px] font-bold">ONLINE</span></>
                        ) : (
                          <><div className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]"></div><span className="text-rose-400 text-[10px] font-bold">OFFLINE</span></>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
             </div>
          </div>
        );
      case 'forticlient':
        return (
          <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
             <div className="grid grid-cols-3 gap-6">
                
                {/* Status Panel */}
                <div className="col-span-2 bg-gradient-to-br from-slate-800/80 to-slate-900/80 rounded-xl p-6 border border-white/10 shadow-lg relative overflow-hidden flex flex-col justify-between min-h-[250px]">
                   <Shield className="absolute -right-10 -bottom-10 w-64 h-64 text-white/5 pointer-events-none" />
                   <div>
                     <h3 className="text-white/50 uppercase font-bold tracking-wider text-xs mb-1">VPN Gateway Status</h3>
                     <div className="flex items-center gap-3 mt-4">
                       <div className={`w-4 h-4 rounded-full ${isVpnConnected ? 'bg-emerald-400 shadow-[0_0_12px_#10b981]' : 'bg-rose-500 shadow-[0_0_12px_#f43f5e]'}`}></div>
                       <h2 className={`text-3xl font-black ${isVpnConnected ? 'text-emerald-400' : 'text-rose-400'}`}>{data?.vpn || 'Unknown'}</h2>
                     </div>
                     <p className="text-white/70 mt-4 text-sm max-w-[80%]">The FortiClient VPN establishes a secure tunnel to your corporate gateway, allowing Tailscale to route subnet traffic seamlessly.</p>
                   </div>
                   
                   {/* Controls */}
                   <div className="flex gap-3 mt-6 relative z-10">
                      <button onClick={() => vpnAction('start')} className="flex items-center gap-2 bg-emerald-500/20 hover:bg-emerald-500/40 border border-emerald-500/50 text-emerald-400 px-4 py-2 rounded-lg font-bold transition-all">
                        <Power className="w-4 h-4" /> Connect
                      </button>
                      <button onClick={() => vpnAction('stop')} className="flex items-center gap-2 bg-rose-500/20 hover:bg-rose-500/40 border border-rose-500/50 text-rose-400 px-4 py-2 rounded-lg font-bold transition-all">
                        <PowerOff className="w-4 h-4" /> Disconnect
                      </button>
                      <button onClick={() => vpnAction('restart')} className="flex items-center gap-2 bg-blue-500/20 hover:bg-blue-500/40 border border-blue-500/50 text-blue-400 px-4 py-2 rounded-lg font-bold transition-all">
                        <RefreshCw className="w-4 h-4" /> Restart
                      </button>
                   </div>
                </div>

                {/* Ping Monitor */}
                <div className="col-span-1 bg-black/30 backdrop-blur-xl rounded-xl p-6 border border-white/5 shadow-inner flex flex-col items-center justify-center text-center">
                   <Activity className="w-12 h-12 text-teal-400 mb-4 opacity-80" />
                   <h3 className="text-white/50 uppercase font-bold tracking-wider text-xs mb-2">Live Gateway Latency</h3>
                   <span className="text-5xl font-black text-white drop-shadow-md">
                     {data?.ping?.current >= 0 ? data.ping.current.toFixed(0) : '--'}
                     <span className="text-lg font-normal text-white/50 ml-1">ms</span>
                   </span>
                   {data?.ping?.current > 0 && (
                     <div className="mt-4 px-3 py-1 rounded-full bg-white/10 text-xs font-bold text-white/70 border border-white/20">
                       Avg: {data.ping.average.toFixed(1)} ms
                     </div>
                   )}
                </div>

             </div>
          </div>
        );
      case 'config':
        return (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-500 bg-black/20 rounded-xl border border-white/5 p-6">
             <div className="flex justify-between items-center mb-6">
                <h4 className="text-white font-bold text-xl flex items-center gap-2"><Settings className="w-6 h-6 text-blue-400" /> System Configuration</h4>
                <button onClick={handleSaveConfig} className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-5 py-2 rounded-xl font-bold shadow-[0_0_15px_rgba(37,99,235,0.5)] transition-all">
                  <Save className="w-4 h-4" /> Save & Apply
                </button>
             </div>
             
             <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <h5 className="text-blue-400 text-sm font-bold uppercase tracking-wider mb-2">FortiClient Settings</h5>
                  <div>
                    <label className="block text-white/70 text-xs font-bold mb-1">Gateway Host</label>
                    <input type="text" value={config.fortiHost} onChange={e => setConfig({...config, fortiHost: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all" placeholder="vpn.company.com" />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs font-bold mb-1">Port</label>
                    <input type="text" value={config.fortiPort} onChange={e => setConfig({...config, fortiPort: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all" placeholder="443" />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs font-bold mb-1">Username</label>
                    <input type="text" value={config.fortiUser} onChange={e => setConfig({...config, fortiUser: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all" />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs font-bold mb-1">Password</label>
                    <input type="password" value={config.fortiPass} onChange={e => setConfig({...config, fortiPass: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all" />
                  </div>
                </div>
                
                <div className="space-y-4">
                  <h5 className="text-cyan-400 text-sm font-bold uppercase tracking-wider mb-2">Advanced Settings</h5>
                  <div>
                    <label className="block text-white/70 text-xs font-bold mb-1">Trusted Certificate Hash (Optional)</label>
                    <input type="text" value={config.fortiCert} onChange={e => setConfig({...config, fortiCert: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all" placeholder="e.g. a1b2c3d4..." />
                  </div>
                  <div>
                    <label className="block text-white/70 text-xs font-bold mb-1">Tailscale Advertised Subnets</label>
                    <input type="text" value={config.tailscaleSubnets} onChange={e => setConfig({...config, tailscaleSubnets: e.target.value})} className="w-full bg-white/5 border border-white/10 rounded-lg px-4 py-2.5 text-white outline-none focus:border-blue-500 focus:bg-white/10 transition-all" placeholder="10.0.0.0/8, 192.168.1.0/24" />
                    <p className="text-white/40 text-[10px] mt-1">Comma-separated list of CIDR subnets to advertise to your Tailnet.</p>
                  </div>
                </div>
             </div>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="flex-1 flex flex-col items-center">
      
      {/* Massive Tabbed Control Panel */}
      <div className="w-full max-w-4xl bg-gradient-to-br from-indigo-950/70 via-slate-900/80 to-cyan-950/70 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_0_40px_rgba(0,0,0,0.5)] overflow-hidden mb-10 flex flex-col relative">
         {/* Decorative Glow */}
         <div className="absolute top-0 left-1/4 w-1/2 h-px bg-gradient-to-r from-transparent via-cyan-400 to-transparent opacity-50"></div>

         {/* Tab Headers */}
         <div className="flex border-b border-white/10 bg-black/40 overflow-x-auto backdrop-blur-md">
            <button 
              onClick={() => setActiveTab('system')} 
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all duration-300 ${activeTab === 'system' ? 'text-cyan-300 border-b-2 border-cyan-400 bg-gradient-to-t from-cyan-500/20 to-transparent shadow-[inset_0_-10px_20px_-10px_rgba(34,211,238,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Activity className="w-4 h-4" /> System Info
            </button>
            <button 
              onClick={() => setActiveTab('tailscale')} 
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all duration-300 ${activeTab === 'tailscale' ? 'text-cyan-300 border-b-2 border-cyan-400 bg-gradient-to-t from-cyan-500/20 to-transparent shadow-[inset_0_-10px_20px_-10px_rgba(34,211,238,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Network className="w-4 h-4" /> Tailscale Nodes
            </button>
            <button 
              onClick={() => setActiveTab('forticlient')} 
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all duration-300 ${activeTab === 'forticlient' ? 'text-cyan-300 border-b-2 border-cyan-400 bg-gradient-to-t from-cyan-500/20 to-transparent shadow-[inset_0_-10px_20px_-10px_rgba(34,211,238,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Shield className="w-4 h-4" /> FortiClient VPN
            </button>
            <button 
              onClick={() => setActiveTab('config')} 
              className={`flex items-center gap-2 px-6 py-4 text-sm font-bold transition-all duration-300 ml-auto border-l border-white/10 ${activeTab === 'config' ? 'text-blue-300 border-b-2 border-blue-400 bg-gradient-to-t from-blue-500/20 to-transparent shadow-[inset_0_-10px_20px_-10px_rgba(59,130,246,0.3)]' : 'text-white/50 hover:text-white hover:bg-white/5'}`}
            >
              <Settings className="w-4 h-4" /> Config
            </button>
         </div>

         {/* Tab Content */}
         <div className="p-6">
           {renderTabContent()}
         </div>
      </div>
      
    </div>
  );
}
