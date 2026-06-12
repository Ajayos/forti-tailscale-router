import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import Sidebar from './components/Sidebar';
import Dashboard from './pages/Dashboard';
import ConfigPage from './pages/ConfigPage';
import SystemPage from './pages/SystemPage';

const socket = io();

export default function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on('metrics', (metricsData) => {
      setData(metricsData);
      
      const now = new Date(metricsData.timestamp);
      const timeStr = now.getHours().toString().padStart(2, '0') + ':' + 
                      now.getMinutes().toString().padStart(2, '0') + ':' + 
                      now.getSeconds().toString().padStart(2, '0');
      
      setHistory(prev => {
        const next = [...prev, {
          time: timeStr,
          downloadRate: metricsData.traffic?.downloadRate || 0,
          uploadRate: metricsData.traffic?.uploadRate || 0,
          ping: metricsData.ping >= 0 ? metricsData.ping : 0
        }];
        if (next.length > 30) return next.slice(next.length - 30);
        return next;
      });
      
      setLoading(false);
    });

    return () => {
      socket.off('metrics');
    };
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex min-h-screen animated-bg bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-900/20 via-slate-950 to-slate-950 text-white font-sans overflow-hidden">
        <Sidebar />
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <Routes>
            <Route path="/dashboard" element={<Dashboard data={data} history={history} />} />
            <Route path="/config" element={<ConfigPage />} />
            <Route path="/system" element={<SystemPage data={data} uptimes={data.uptimes} />} />
            <Route path="*" element={<Navigate to="/dashboard" replace />} />
          </Routes>
        </main>
      </div>
    </BrowserRouter>
  );
}
