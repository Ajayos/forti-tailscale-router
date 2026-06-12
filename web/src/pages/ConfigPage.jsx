import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Save } from 'lucide-react';

export default function ConfigPage() {
  const [config, setConfig] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    axios.get('/api/config').then(r => setConfig(r.data));
  }, []);

  const handleChange = (e) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await axios.post('/api/config', config);
      alert('Configuration saved! VPN will automatically restart to apply changes.');
    } catch(e) {
      alert('Failed to save configuration.');
    }
    setSaving(false);
  };

  if (!config) return <div>Loading...</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500">
      <div className="p-6 bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl shadow-2xl">
        <h2 className="text-2xl font-bold text-white mb-2">Configuration</h2>
        <p className="text-slate-400 mb-8">Update VPN credentials, Tailscale arguments, and ping targets. Settings are saved persistently.</p>
        
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">FortiGate Host</label>
              <input type="text" name="fortiHost" value={config.fortiHost} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required/>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Port</label>
              <input type="text" name="fortiPort" value={config.fortiPort} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required/>
            </div>
            
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Username</label>
              <input type="text" name="fortiUser" value={config.fortiUser} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required/>
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-300">Password</label>
              <input type="password" name="fortiPass" value={config.fortiPass} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" required/>
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Trusted Cert (Optional)</label>
              <input type="text" name="fortiCert" value={config.fortiCert} onChange={handleChange} className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2 border-t border-white/10 pt-6 mt-2">
              <label className="text-sm font-medium text-slate-300">Tailscale Subnets (comma separated)</label>
              <input type="text" name="tailscaleSubnets" value={config.tailscaleSubnets} onChange={handleChange} placeholder="10.0.0.0/8, 192.168.1.0/24" className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
            </div>

            <div className="space-y-2 md:col-span-2">
              <label className="text-sm font-medium text-slate-300">Ping Monitor Target</label>
              <input type="text" name="pingTarget" value={config.pingTarget} onChange={handleChange} placeholder="8.8.8.8" className="w-full bg-slate-900 border border-white/10 rounded-xl p-3 text-white focus:ring-2 focus:ring-indigo-500 outline-none transition-all" />
              <p className="text-xs text-slate-500">The IP address to actively ping to verify VPN health.</p>
            </div>

          </div>

          <div className="pt-4 flex justify-end">
            <button disabled={saving} type="submit" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl transition-all flex items-center gap-2 font-medium shadow-lg shadow-indigo-600/20 active:scale-95 disabled:opacity-50">
              <Save className="w-5 h-5"/> {saving ? 'Saving...' : 'Save Configuration'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
