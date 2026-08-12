'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from "next-auth/react";
import SidebarNavigation from '@/components/SidebarNavigation';

export default function Home({ session }) {
  const router = useRouter();
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const [deviceStatuses1, setDeviceStatuses1] = useState([]);
  const [deviceStatuses2, setDeviceStatuses2] = useState([]);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();
  const username = session?.user?.name || session?.user?.email || 'User';

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    const clock = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(clock);
  }, []);

  useEffect(() => {
    const fetchStatuses1 = async () => {
      try {
        setIsLoading1(true);
        const res = await fetch('/api/ping-devices');
        const data = await res.json();
        setDeviceStatuses1(data);
      } catch (err) {
        console.error('Error fetching CC device status:', err);
      } finally {
        setIsLoading1(false);
      }
    };

    const fetchStatuses2 = async () => {
      try {
        setIsLoading2(true);
        const res = await fetch('/api/ping-devices2');
        const data = await res.json();
        setDeviceStatuses2(data);
      } catch (err) {
        console.error('Error fetching Alps1 device status:', err);
      } finally {
        setIsLoading2(false);
      }
    };

    fetchStatuses1();
    fetchStatuses2();

    const interval = setInterval(() => {
      fetchStatuses1();
      fetchStatuses2();
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const DeviceSection = ({ title, isLoading, devices }) => (
    <div className="rounded-2xl bg-base-200 p-6 mt-10 border border-base-content/10 shadow-xl">
      <div className="flex items-center gap-3 mb-6">
        <h2 className="text-2xl font-bold text-primary">{title}</h2>
        {isLoading && (
          <span className="w-5 h-5 border-2 border-primary border-t-transparent rounded-full animate-spin"></span>
        )}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {devices.map((device, index) => (
          <div
            key={index}
            className="bg-base-100 p-4 rounded-xl shadow flex justify-between items-center border border-base-content/10"
          >
            <p className="text-lg font-semibold">{device.name}</p>
            <span
              className={`badge badge-lg ${
                device.status === 'online' ? 'badge-success' : 'badge-error'
              }`}
            >
              {device.status.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

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
            <div className="text-sm mt-1 flex items-center gap-3">
              <span>Welcome, {username}</span>
              <button
                onClick={handleLogout}
                className="btn btn-sm btn-outline btn-error"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Section 1 */}
        <DeviceSection
          title="🔌 CC AMX Connectivity Overview"
          isLoading={isLoading1}
          devices={deviceStatuses1}
        />

        {/* Section 2 */}
        <DeviceSection
          title="🔌 Alps1 AMX Connectivity Overview"
          isLoading={isLoading2}
          devices={deviceStatuses2}
        />
      </div>
    </div>
  );
}
