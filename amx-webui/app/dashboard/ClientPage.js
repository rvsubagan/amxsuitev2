'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from "next-auth/react";
import SidebarNavigation from '@/components/SidebarNavigation';

export default function Home({session}) {  
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [monitorStats, setMonitorStats] = useState({
    monitors: [
      { name: 'AMX Encoder #1', status: 'online', uptime: 99.97 },
      { name: 'AMX Decoder #2', status: 'offline', uptime: 98.5 },
      { name: 'AMX Control Panel', status: 'online', uptime: 99.91 },
      { name: 'AMX Media Server', status: 'online', uptime: 97.25 },
    ],
    recentDowntimes: [
      { monitor: 'AMX Decoder #2', time: '2025-05-30 14:10', reason: 'Signal Loss' },
      { monitor: 'AMX Media Server', time: '2025-05-29 22:45', reason: 'Network Timeout' },
    ],
  });

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  // const handleLogout = async () => {
  //   // Call NextAuth signout endpoint and redirect after logout
  //   await fetch('/api/auth/signout', {
  //     method: 'POST',
  //     headers: { 'Content-Type': 'application/json' },
  //     body: JSON.stringify({ callbackUrl: '/' }),
  //   });
  //   router.push('/');  // redirect to home after logout
  // };

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const username = session?.user?.name || session?.user?.email || 'User';

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const totalMonitors = monitorStats.monitors.length;
  const onlineCount = monitorStats.monitors.filter((m) => m.status === 'online').length;
  const offlineCount = totalMonitors - onlineCount;

  return (
    <div className="min-h-screen bg-base-100 flex" data-theme="dark">
      <SidebarNavigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 p-6 md:p-10 overflow-x-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-4xl font-bold text-primary">🖥️ AMX Device Dashboard</h1>
          <div className="text-right text-lg font-mono text-base-content/70">
            {/* <div>{formattedDate}</div>
            <div>{formattedTime}</div> */}
            <div className="text-sm text-base-content/70 mt-1 flex items-center gap-3">
                <span>Welcome, {username}</span>
                <button
                  onClick={handleLogout}
                  className="btn btn-sm btn-outline btn-error"
                  title="Logout"
                >
                  Logout
                </button>
              </div>
          </div>
        </div>

        {/* Summary Card */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="rounded-2xl bg-base-200 p-6 border border-primary shadow-xl">
            <h2 className="text-xl font-bold mb-2 text-primary">Total AMX Devices</h2>
            <p className="text-3xl font-mono">{totalMonitors}</p>
          </div>
          <div className="rounded-2xl bg-base-200 p-6 border border-green-500 shadow-xl">
            <h2 className="text-xl font-bold mb-2 text-green-400">Online Devices</h2>
            <p className="text-3xl font-mono text-green-300">{onlineCount}</p>
          </div>
          <div className="rounded-2xl bg-base-200 p-6 border border-red-500 shadow-xl">
            <h2 className="text-xl font-bold mb-2 text-red-400">Offline Devices</h2>
            <p className="text-3xl font-mono text-red-300">{offlineCount}</p>
          </div>
        </div>

        {/* Devices List */}
        <div className="rounded-2xl bg-base-200 p-6 border border-base-content/10 shadow-xl mb-10">
          <h2 className="text-2xl font-bold mb-4 text-primary">🧭 AMX Device Status</h2>
          <div className="space-y-3 text-lg">
            {monitorStats.monitors.map((monitor, index) => (
              <div key={index} className="flex justify-between items-center px-4 py-2 bg-base-100 rounded-lg shadow-sm">
                <span className="font-semibold">{monitor.name}</span>
                <span
                  className={`text-sm font-bold px-3 py-1 rounded-full ${
                    monitor.status === 'online' ? 'bg-green-600 text-white' : 'bg-red-600 text-white'
                  }`}
                >
                  {monitor.status.toUpperCase()}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Uptime Percentages */}
        <div className="rounded-2xl bg-base-200 p-6 border border-base-content/10 shadow-xl mb-10">
          <h2 className="text-2xl font-bold mb-4 text-primary">📈 AMX Device Uptime</h2>
          <div className="space-y-2 text-lg">
            {monitorStats.monitors.map((monitor, index) => (
              <div key={index} className="flex justify-between px-4 py-2 bg-base-100 rounded-md shadow-sm">
                <span>{monitor.name}</span>
                <span className="font-mono text-accent">{monitor.uptime.toFixed(2)}%</span>
              </div>
            ))}
          </div>
        </div>

        {/* Recent Downtimes */}
        <div className="rounded-2xl bg-base-200 p-6 border border-red-500 shadow-xl">
          <h2 className="text-2xl font-bold mb-4 text-red-400">🛑 Recent AMX Downtimes</h2>
          {monitorStats.recentDowntimes.length === 0 ? (
            <p className="text-green-400">No recent downtimes</p>
          ) : (
            <ul className="space-y-2 text-lg">
              {monitorStats.recentDowntimes.map((event, index) => (
                <li key={index} className="flex justify-between bg-base-100 px-4 py-2 rounded-md shadow-sm">
                  <span>{event.time}</span>
                  <span>{event.monitor}</span>
                  <span className="text-red-400 font-semibold">{event.reason}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
{/* Device Status Mockup Section */}
<div className="rounded-2xl bg-base-200 p-6 mt-10 border border-base-content/10 shadow-xl">
  <h2 className="text-2xl font-bold mb-6 text-primary">🔌 Device Connectivity Overview</h2>
  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
    {[
      { name: 'Encoder 1', status: 'online' },
      { name: 'Encoder 2', status: 'online' },
      { name: 'Encoder 3', status: 'offline' },
      { name: 'Windowing Processor 1', status: 'online' },
      { name: 'Windowing Processor 2', status: 'offline' },
      { name: 'Windowing Processor 3', status: 'online' },
      { name: 'Controller 1', status: 'online' },
      { name: 'Controller 2', status: 'offline' },
      { name: 'Audio', status: 'online' },
    ].map((device, index) => {
      return (
        <div key={index} className="bg-base-100 p-4 rounded-xl shadow flex justify-between items-center border border-base-content/10">
          <div>
            <p className="text-lg font-semibold">{device.name}</p>
          </div>
          <div>
            <span
              className={`badge badge-lg ${
                device.status === 'online' ? 'badge-success' : 'badge-error'
              }`}
            >
              {device.status.toUpperCase()}
            </span>
          </div>
        </div>
      );
    })}
  </div>
</div>
        
      </div>
    </div>
  );
}
