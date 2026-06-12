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
    <div className="max-w-3xl mx-auto space-y-6">
      <h2 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-purple-400 mb-8">Gateway Configuration</h2>
      
      <div className="glass-card p-8">
        <form onSubmit={handleSave} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-indigo-300 mb-2">FortiGate Host</label>
              <input type="text" className="input-glass" value={config.fortiHost} onChange={e => setConfig({...config, fortiHost: e.target.value})} placeholder="vpn.company.com" />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-300 mb-2">Port</label>
              <input type="text" className="input-glass" value={config.fortiPort} onChange={e => setConfig({...config, fortiPort: e.target.value})} placeholder="443" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-indigo-300 mb-2">Username</label>
              <input type="text" className="input-glass" value={config.fortiUser} onChange={e => setConfig({...config, fortiUser: e.target.value})} />
            </div>
            <div>
              <label className="block text-sm font-medium text-indigo-300 mb-2">Password</label>
              <input type="password" className="input-glass" value={config.fortiPass} onChange={e => setConfig({...config, fortiPass: e.target.value})} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-indigo-300 mb-2">Trusted Certificate (Optional)</label>
            <input type="text" className="input-glass" value={config.fortiCert} onChange={e => setConfig({...config, fortiCert: e.target.value})} placeholder="e.g. abcdef123456..." />
          </div>

          <div className="pt-4 border-t border-white/10">
            <label className="block text-sm font-medium text-purple-300 mb-2">Tailscale Subnets</label>
            <input type="text" className="input-glass" value={config.tailscaleSubnets} onChange={e => setConfig({...config, tailscaleSubnets: e.target.value})} placeholder="10.0.0.0/8, 192.168.1.0/24" />
            <p className="text-xs text-slate-400 mt-2">Comma separated list of physical subnets to expose to your Tailnet.</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-purple-300 mb-2">Ping Monitor Target</label>
            <input type="text" className="input-glass" value={config.pingTarget} onChange={e => setConfig({...config, pingTarget: e.target.value})} placeholder="10.0.0.1" />
            <p className="text-xs text-slate-400 mt-2">Internal IP address to continuously ping to verify VPN health.</p>
          </div>

          <div className="pt-6">
            <button type="submit" disabled={saving} className="btn-primary w-full flex justify-center items-center gap-2">
              {saving ? 'Saving & Restarting VPN...' : 'Save Configuration & Apply'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
