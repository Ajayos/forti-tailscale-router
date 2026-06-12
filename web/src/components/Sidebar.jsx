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

      <div className={`fixed inset-y-4 left-4 z-40 w-64 aura-dock flex flex-col transition-transform duration-300 ease-in-out md:relative md:inset-0 md:translate-x-0 ${isOpen ? 'translate-x-0' : '-translate-x-[120%]'}`}>
        
        <div className="p-8 pb-4">
          <div className="flex flex-col items-center justify-center gap-3 mb-6">
            <img src="/logo.png" alt="Logo" className="w-16 h-16 object-contain drop-shadow-xl" />
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white tracking-tight drop-shadow-md">Gateway</h1>
              <p className="text-xs text-white/60 font-medium">VPN ROUTER</p>
            </div>
          </div>
        </div>

        <nav className="flex-1 px-4 space-y-3">
          {links.map(link => (
            <NavLink
              key={link.to}
              to={link.to}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) => 
                `flex items-center gap-4 px-5 py-4 rounded-2xl transition-all duration-300 ${
                  isActive 
                    ? 'bg-white/20 text-white shadow-[0_4px_15px_rgba(0,0,0,0.2)] scale-[1.02]' 
                    : 'text-white/60 hover:text-white hover:bg-white/10 hover:scale-100'
                }`
              }
            >
              <link.icon className="w-5 h-5" />
              <span className="font-semibold">{link.label}</span>
            </NavLink>
          ))}
          
          <div className="pt-6 mt-6 border-t border-white/10 mx-2">
             <div className="flex items-center gap-4 px-3 py-3 text-white/40">
               <Globe className="w-5 h-5" />
               <span className="font-semibold">Tailscale Node</span>
             </div>
          </div>
        </nav>

        <div className="p-6">
          <div className="bg-black/20 rounded-2xl p-4 text-center">
            <p className="text-xs font-bold text-white/50 tracking-wider">v2.0.0 (Aura Theme)</p>
          </div>
        </div>

      </div>
    </>
  );
}

