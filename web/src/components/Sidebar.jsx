import React, { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Settings, Server, Menu, X, Globe } from 'lucide-react';

export default function Sidebar() {
  const [isOpen, setIsOpen] = useState(false);

  const links = [
    { to: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/config', icon: Settings, label: 'Configuration' },
    { to: '/system', icon: Server, label: 'System Info' },
  ];

  return (
    <>
      <button 
        className="md:hidden fixed top-4 right-4 z-50 p-2 bg-slate-800 rounded-lg shadow-xl"
        onClick={() => setIsOpen(!isOpen)}
      >
        {isOpen ? <X className="w-6 h-6"/> : <Menu className="w-6 h-6"/>}
      </button>

      <div className={`fixed inset-y-0 left-0 z-40 w-64 bg-slate-900/80 backdrop-blur-xl border-r border-white/10 transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        
        <div className="p-6 border-b border-white/10 flex items-center gap-3">
          <Globe className="w-8 h-8 text-indigo-400" />
          <h1 className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-indigo-400 to-cyan-400 tracking-tight">
            Gateway
          </h1>
        </div>

        <nav className="p-4 space-y-2">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => `flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${isActive ? 'bg-indigo-500/20 text-indigo-300 shadow-lg border border-indigo-500/20' : 'text-slate-400 hover:bg-white/5 hover:text-slate-200'}`}
            >
              <link.icon className="w-5 h-5" />
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="absolute bottom-0 w-full p-6 border-t border-white/10">
          <p className="text-xs text-slate-500 text-center">Forti-Tailscale Router<br/>v2.0.0</p>
        </div>

      </div>
    </>
  );
}
