import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Server, Menu, X, Globe } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: "/", icon: LayoutDashboard, label: "Default Dashboard" },
    { to: "/config", icon: Settings, label: "Config Edit" },
    { to: "/system", icon: Server, label: "Server Info" }
  ];

  return (
    <>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 bg-slate-900 rounded-lg text-white"
      >
        {isOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 glass-panel border-r border-white/5 flex flex-col transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-6">
          <div className="flex items-center gap-3 mb-2">
            <img src="/logo.png" alt="Logo" className="w-8 h-8 object-contain" />
            <h1 className="text-xl font-bold text-white tracking-tight">Gateway</h1>
          </div>
          <p className="text-xs text-slate-400 pl-11">VPN connectivity</p>
        </div>

        <nav className="flex-1 px-4 space-y-2 mt-4">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                  isActive 
                    ? 'bg-gradient-to-r from-indigo-500/20 to-purple-500/20 text-white border border-indigo-500/30 shadow-[0_0_15px_rgba(99,102,241,0.2)]' 
                    : 'text-slate-400 hover:text-white hover:bg-white/5'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span className="font-medium">{link.label}</span>
            </NavLink>
          ))}
          <div className="pt-4 mt-4 border-t border-white/5">
             <div className="flex items-center gap-3 px-4 py-3 text-slate-400 opacity-50">
               <Globe className="w-5 h-5" />
               <span className="font-medium">Tailscale Info</span>
             </div>
             <p className="text-[10px] text-slate-500 px-4 mt-1">Managed via Dashboard</p>
          </div>
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
          <p className="text-xs text-slate-500 text-center">Forti-Tailscale Router<br/>v2.0.0</p>
        </div>

      </div>
    </>
  );
}
