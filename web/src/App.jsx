import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import AosWidgets from './components/AosWidgets';
import Dashboard from './pages/Dashboard';

const socket = io();

export default function App() {
  const [data, setData] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    socket.on('metrics', (metricsData) => {
      setData(metricsData);
      
      const now = new Date(metricsData.timestamp);
      const timeStr = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      
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
    return () => socket.off('metrics');
  }, []);

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-slate-950">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="flex flex-col min-h-screen aura-wallpaper font-sans overflow-hidden relative">
        <main className="flex-1 flex flex-col md:flex-row px-4 md:px-8 py-4 md:py-6 gap-6 md:gap-10 overflow-y-auto mt-4">
          <AosWidgets data={data} />
          
          <div className="flex-1">
             <Routes>
                <Route path="/dashboard" element={<Dashboard data={data} history={history} />} />
                <Route path="*" element={<Navigate to="/dashboard" replace />} />
             </Routes>
          </div>
        </main>
      </div>
    </BrowserRouter>
  );
}


