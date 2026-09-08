'use client';

import React, { useEffect, useState } from 'react';
import { signOut } from "next-auth/react";
import SidebarNavigation from '@/components/SidebarNavigation';

export default function Home({ session }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [deviceStatuses1, setDeviceStatuses1] = useState([]);
  const [deviceStatuses2, setDeviceStatuses2] = useState([]);
  const [isLoading1, setIsLoading1] = useState(false);
  const [isLoading2, setIsLoading2] = useState(false);

  const username =
    session?.user?.name ||
    session?.user?.email ||
    'User';

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  useEffect(() => {
    const fetchStatuses1 = async () => {
      try {
        setIsLoading1(true);

        const res = await fetch('/api/ping-devices');
        const data = await res.json();

        setDeviceStatuses1(data);
      } catch (err) {
        console.error(
          'Error fetching CC device status:',
          err
        );
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
        console.error(
          'Error fetching Alps1 device status:',
          err
        );
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

  const DeviceSection = ({
    title,
    isLoading,
    devices
  }) => {
    const onlineCount = devices.filter(
      (device) => device.status === 'online'
    ).length;

    const offlineCount =
      devices.length - onlineCount;

    return (
      <section
        className="
          card
          bg-base-200
          border
          border-base-content/10
          shadow-md
        "
      >
        <div className="card-body p-3 md:p-4 gap-3">

          {/* SECTION HEADER */}
          <div
            className="
              flex
              flex-wrap
              items-center
              justify-between
              gap-2
            "
          >
            <div className="flex items-center gap-2 min-w-0">

              <h2
                className="
                  text-sm
                  md:text-base
                  font-bold
                  text-primary
                  truncate
                "
              >
                {title}
              </h2>

              {isLoading && (
                <span className="loading loading-spinner loading-xs text-primary" />
              )}

            </div>

            {/* SUMMARY */}
            <div className="flex items-center gap-1.5">

              <span className="badge badge-success badge-sm">
                {onlineCount} Online
              </span>

              <span className="badge badge-error badge-sm">
                {offlineCount} Offline
              </span>

            </div>
          </div>

          {/* DEVICE GRID */}
          <div
            className="
              grid
              grid-cols-1
              sm:grid-cols-2
              md:grid-cols-3
              xl:grid-cols-4
              2xl:grid-cols-5
              gap-2
            "
          >

            {devices.map((device, index) => {

              const isOnline =
                device.status === 'online';

              return (
                <div
                  key={index}
                  className="
                    bg-base-100
                    rounded-lg
                    border
                    border-base-content/10
                    px-3
                    py-2.5
                    flex
                    items-center
                    justify-between
                    gap-2
                    min-w-0
                  "
                >

                  <div className="min-w-0">

                    <p
                      className="
                        text-sm
                        font-semibold
                        truncate
                      "
                      title={device.name}
                    >
                      {device.name}
                    </p>

                  </div>

                  <span
                    className={`
                      badge
                      badge-sm
                      shrink-0
                      font-semibold
                      ${
                        isOnline
                          ? 'badge-success'
                          : 'badge-error'
                      }
                    `}
                  >
                    {isOnline ? 'ONLINE' : 'OFFLINE'}
                  </span>

                </div>
              );
            })}

            {!isLoading && devices.length === 0 && (
              <div
                className="
                  col-span-full
                  py-6
                  text-center
                  text-sm
                  text-base-content/50
                "
              >
                No devices found.
              </div>
            )}

          </div>

        </div>
      </section>
    );
  };

  return (
    <div
      className="
        h-dvh
        bg-base-100
        flex
        overflow-hidden
      "
      data-theme="dark"
    >

      <SidebarNavigation
        sidebarOpen={sidebarOpen}
        setSidebarOpen={setSidebarOpen}
      />

      {/* MAIN APPLICATION AREA */}
      <main
        className="
          flex-1
          min-w-0
          min-h-0
          flex
          flex-col
          overflow-hidden
        "
      >

        {/* COMPACT HEADER */}
        <header
          className="
            h-12
            shrink-0
            flex
            items-center
            justify-between
            px-3
            border-b
            border-base-content/10
          "
        >

          <h1
            className="
              text-lg
              md:text-xl
              font-bold
              text-primary
              truncate
            "
          >
            🖥️ AMX Device Dashboard
          </h1>

          <div className="flex items-center gap-3 text-sm">
            <button
              onClick={handleLogout}
              className="
                btn
                btn-xs
                md:btn-sm
                btn-outline
                btn-error
              "
            >
              Logout
            </button>

          </div>

        </header>

        {/* DASHBOARD */}
        <div
          className="
            flex-1
            min-h-0
            overflow-y-auto
            p-2
          "
        >

          <div className="space-y-2">

            <DeviceSection
              title="🔌 CC AMX Connectivity Overview"
              isLoading={isLoading1}
              devices={deviceStatuses1}
            />

            <DeviceSection
              title="🔌 Alps1 AMX Connectivity Overview"
              isLoading={isLoading2}
              devices={deviceStatuses2}
            />

          </div>

        </div>

      </main>
    </div>
  );
}