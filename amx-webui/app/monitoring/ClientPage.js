"use client"

import { useEffect, useState } from "react"
import { signOut } from "next-auth/react";
import SidebarNavigation from '@/components/SidebarNavigation';


const VALID_MULTICAST_ADDRESSES = [
  "239.255.37.101",
  "239.255.37.102",
  "239.255.37.103",
  "239.255.37.104",
  "239.255.37.105",
  "239.255.37.106",
  "239.255.37.107",
  "239.255.37.108",
  "239.255.37.109",
  "239.255.37.110",
  "239.255.37.111",
  "239.255.37.112",
  "239.255.37.113",
  "239.255.37.114",
  "239.255.37.115",
  "239.255.37.116",
  "239.255.37.117",
  "239.255.37.118",
  "239.255.37.119",
  "239.255.37.120",
  "239.255.37.121",
  "239.255.37.122",
  "239.255.37.123",
  "239.255.37.124",
  "239.255.37.125",
  "239.255.37.126",
  "239.255.37.127",
  "239.255.37.128",
  "239.255.37.129",
  "239.255.37.130",
  "239.255.37.132",
  "239.255.37.136",
  "239.255.37.137",
  "239.255.37.138",
  "239.255.37.139",
  "239.255.37.140",
  "239.255.37.161",
  "239.255.37.162",
  "239.255.37.163",
  "239.255.37.164",
  "239.255.37.165",
  "239.255.37.166",
  "239.255.37.167",
  "239.255.37.168",
  "239.255.37.169",
  "239.255.37.170",
  "239.255.37.171",
]

const STREAM_LABELS = {
  101: "IPTV 1",
  102: "IPTV 2",
  103: "IPTV 3",
  104: "IPTV 4",
  105: "IPTV 5",
  106: "IPTV 6",
  107: "IPTV 7",
  108: "IPTV 8",
  109: "IPTV 9",
  110: "IPTV 10",
  111: "IPTV 11",
  112: "IPTV 12",
  113: "IPTV 13",
  114: "IPTV 14",
  115: "IPTV 15",
  116: "IPTV 16",

  117: "1F DEVICE 1",
  118: "SHIELD TV",
  119: "CHROMECAST",
  120: "APPLE TV",
  121: "1F PC",
  122: "CCTV 2",
  123: "CCTV",
  124: "FIRETV",
  125: "CCTV 3B",
  126: "RADIO PC",
  127: "HIMAWARI 1",
  128: "IPTV 17",
  129: "1F DEVICE 2",
  130: "CCTV 3",

  132: "HIMAWARI 2",

  136: "QUAD",
  137: "WP 2",
  138: "WP 3",
  139: "WP 4",
  140: "MULTIVIEW",

  161: "RADIO 1",
  162: "RADIO 2",
  163: "RADIO 3",
  164: "RADIO 4",
  165: "RADIO 5",
  166: "CCTV 7 AXIS",
  167: "CCTV 8",
  168: "KALEIDESCAPE",
  169: "CCTV 5",
  170: "CCTV 6",
  171: "MAG IPTV",
}

export default function Home({session}) {
  const [decoder, setDecoder] = useState(null)
  const [loading, setLoading] = useState(true)
  const [lastUpdated, setLastUpdated] = useState(null)
  const [currentTime, setCurrentTime] = useState(new Date());
  const [sidebarOpen, setSidebarOpen] = useState(true);

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const username = session?.user?.name || session?.user?.email || 'User';


  async function fetchDecoder() {
    try {
      const response = await fetch("/api/decoder", {
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error("Failed to fetch decoder status")
      }

      const data = await response.json()

      setDecoder(data)
      setLastUpdated(new Date())
    } catch (error) {
      console.error("Failed to fetch decoder:", error)

      setDecoder((current) => ({
        ...(current || {}),
        ip: "172.18.90.186",
        status: "DOWN",
      }))
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDecoder()

    const interval = setInterval(fetchDecoder, 5000)

    return () => clearInterval(interval)
  }, [])

  const isUp = decoder?.status === "UP"

  const multicast = decoder?.multicast || null

  const multicastIsValid =
    multicast !== null &&
    VALID_MULTICAST_ADDRESSES.includes(multicast)

  const videoDrop = decoder?.videoDrop ?? null
  const frameDrop = decoder?.frameDrop ?? null

  // Content Source / Stream
  const streamNumber = decoder?.stream

  const streamLabel =
    streamNumber !== null &&
    streamNumber !== undefined
      ? STREAM_LABELS[streamNumber] || `Stream ${streamNumber}`
      : "--"

  // Stream Audio
  const streamAudioNumber = decoder?.streamAudio

  const streamAudioLabel =
    streamAudioNumber !== null &&
    streamAudioNumber !== undefined
      ? STREAM_LABELS[streamAudioNumber] ||
        `Stream ${streamAudioNumber}`
      : "--"

 return (
  <div
    className="h-dvh bg-base-100 flex overflow-hidden"
    data-theme="dark"
  >
    <SidebarNavigation
      sidebarOpen={sidebarOpen}
      setSidebarOpen={setSidebarOpen}
    />

    {/* MAIN APPLICATION AREA */}
    <main className="flex-1 min-w-0 min-h-0 flex flex-col overflow-hidden">

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
        <h1 className="text-lg md:text-xl font-bold text-primary truncate">
          🖥️ AMX Device Dashboard
        </h1>

        <div className="flex items-center gap-3 text-sm">
          <span className="hidden sm:inline text-base-content/70">
            Welcome, {username}
          </span>

          <button
            onClick={handleLogout}
            className="btn btn-xs md:btn-sm btn-outline btn-error"
            title="Logout"
          >
            Logout
          </button>
        </div>
      </header>

      {/* DASHBOARD CONTENT */}
      <div className="flex-1 min-h-0 overflow-y-auto p-2">

        <div className="w-full">

          {/* DECODER CARD */}
          <section className="card bg-base-200 shadow-md border border-base-content/10">

            <div className="card-body p-3 md:p-4 gap-3">

              {/* ================================= */}
              {/* DEVICE HEADER                    */}
              {/* ================================= */}
              <div className="flex items-center justify-between gap-3">

                <div className="min-w-0">

                  <div className="flex items-center gap-2">

                    <h2 className="text-base md:text-lg font-bold truncate">
                      PRIVOFF AMX DECODER
                    </h2>

                    {loading && (
                      <span className="loading loading-spinner loading-xs" />
                    )}

                  </div>

                  <div className="text-xs text-base-content/50 mt-0.5">
                    AMX SVSI Decoder
                  </div>

                </div>

                {/* DEVICE STATUS */}
                {!loading && decoder && (
                  isUp ? (
                    <div className="badge badge-success gap-1 px-3 py-3 text-xs font-bold shrink-0">
                      <span className="status status-success" />
                      UP
                    </div>
                  ) : (
                    <div className="badge badge-error gap-1 px-3 py-3 text-xs font-bold shrink-0">
                      <span className="status status-error" />
                      DOWN
                    </div>
                  )
                )}

              </div>

              {/* ================================= */}
              {/* STATUS GRID                      */}
              {/* ================================= */}
              <div
                className="
                  grid
                  grid-cols-1
                  sm:grid-cols-2
                  xl:grid-cols-3
                  gap-2
                "
              >

                {/* VIDEO SOURCE */}
                <div
                  className="
                    rounded-lg
                    border
                    border-base-content/10
                    bg-base-100
                    p-3
                  "
                >

                  <div className="text-xs font-medium text-base-content/50">
                    Video Source
                  </div>

                  <div className="mt-1 text-xl md:text-2xl font-bold truncate">
                    {streamLabel}
                  </div>

                </div>

                {/* AUDIO SOURCE */}
                <div
                  className="
                    rounded-lg
                    border
                    border-base-content/10
                    bg-base-100
                    p-3
                  "
                >

                  <div className="text-xs font-medium text-base-content/50">
                    Audio Source
                  </div>

                  <div className="mt-1 text-xl md:text-2xl font-bold truncate">
                    {streamAudioLabel}
                  </div>

                </div>

                {/* NETWORK STREAM */}
                <div
                  className="
                    rounded-lg
                    border
                    border-base-content/10
                    bg-base-100
                    p-3
                  "
                >

                  <div className="text-xs font-medium text-base-content/50">
                    Video Network Stream
                  </div>

                  <div className="mt-2">

                    {!multicast && (
                      <span className="badge badge-ghost badge-sm">
                        --
                      </span>
                    )}

                    {multicast && (
                      multicastIsValid ? (
                        <span className="badge badge-success badge-sm gap-1">
                          <span className="status status-success" />
                          ACTIVE
                        </span>
                      ) : (
                        <span className="badge badge-error badge-sm gap-1">
                          <span className="status status-error" />
                          INACTIVE
                        </span>
                      )
                    )}

                  </div>

                  {multicast && (
                    <div className="mt-1 text-xs font-mono text-base-content/50 truncate">
                      {multicast}
                    </div>
                  )}

                </div>

                {/* HDMI */}
                <div
                  className="
                    rounded-lg
                    border
                    border-base-content/10
                    bg-base-100
                    p-3
                  "
                >

                  <div className="text-xs font-medium text-base-content/50">
                    HDMI
                  </div>

                  <div className="mt-2">

                    {decoder?.hdmi === "connected" ? (
                      <span className="badge badge-success badge-sm gap-1">
                        <span className="status status-success" />
                        CONNECTED
                      </span>
                    ) : (
                      <span className="badge badge-error badge-sm">
                        {decoder?.hdmi || "--"}
                      </span>
                    )}

                  </div>

                </div>

                {/* VIDEO PACKET DROPS */}
                <div
                  className="
                    rounded-lg
                    border
                    border-base-content/10
                    bg-base-100
                    p-3
                  "
                >

                  <div className="text-xs font-medium text-base-content/50">
                    Video Packet Drops / sec
                  </div>

                  <div
                    className={`
                      mt-1
                      text-xl
                      md:text-2xl
                      font-bold
                      ${
                        videoDrop > 0
                          ? "text-warning"
                          : "text-success"
                      }
                    `}
                  >
                    {videoDrop ?? "--"}
                  </div>

                </div>

                {/* VIDEO FRAME DROPS */}
                <div
                  className="
                    rounded-lg
                    border
                    border-base-content/10
                    bg-base-100
                    p-3
                  "
                >

                  <div className="text-xs font-medium text-base-content/50">
                    Video Frame Drops / sec
                  </div>

                  <div
                    className={`
                      mt-1
                      text-xl
                      md:text-2xl
                      font-bold
                      ${
                        frameDrop > 0
                          ? "text-warning"
                          : "text-success"
                      }
                    `}
                  >
                    {frameDrop ?? "--"}
                  </div>

                </div>

              </div>

              {/* ================================= */}
              {/* FOOTER                           */}
              {/* ================================= */}
              <div
                className="
                  flex
                  flex-col
                  sm:flex-row
                  sm:items-center
                  sm:justify-between
                  gap-1
                  pt-2
                  border-t
                  border-base-content/10
                  text-xs
                  text-base-content/50
                "
              >

                <div>
                  Update interval:
                  <span className="font-semibold text-base-content/70">
                    {" "}5 seconds
                  </span>
                </div>

                <div>
                  {lastUpdated ? (
                    <>
                      Last updated:{" "}
                      <span className="font-semibold text-base-content/70">
                        {lastUpdated.toLocaleTimeString()}
                      </span>
                    </>
                  ) : (
                    "Waiting for data..."
                  )}
                </div>

              </div>

            </div>
          </section>

        </div>
      </div>

    </main>
  </div>
);
}