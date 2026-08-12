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

        {/* Decoder Card */}
        <div className="card border border-base-300 bg-base-100 shadow-xl">

          <div className="card-body">

            {/* Card Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">

              <div>

                <div className="flex items-center gap-3">

                  <h2 className="text-xl font-bold">
                    PRIVOFF AMX DECODER
                  </h2>

                  {loading && (
                    <span className="loading loading-spinner loading-sm" />
                  )}

                </div>

{/*                 <p className="mt-1 font-mono text-sm text-base-content/60">
                  {decoder?.ip || "172.18.90.186"}
                </p> */}

              </div>

              {/* Ping Status */}
              {!loading && decoder && (
                isUp ? (
                  <div className="badge badge-success gap-2 px-4 py-4 text-sm font-bold">
                    <span className="status status-success" />
                    UP
                  </div>
                ) : (
                  <div className="badge badge-error gap-2 px-4 py-4 text-sm font-bold">
                    <span className="status status-error" />
                    DOWN
                  </div>
                )
              )}

            </div>

            <div className="divider" />

            {/* Information */}
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">

              {/* Stream */}
              <div className="rounded-xl border border-base-300 bg-base-200 p-5">

                <div className="text-sm font-medium text-base-content/60">
                  Video Source
                </div>

                <div className="mt-2 text-3xl font-bold">
                  {streamLabel}
                </div>

{/*                 {streamNumber !== null &&
                  streamNumber !== undefined && (
                    <div className="mt-1 text-sm text-base-content/50">
                      Stream Video {streamNumber}
                    </div>
                  )} */}

              </div>
              {/* Stream Audio */}
              <div className="rounded-xl border border-base-300 bg-base-200 p-5">

                <div className="text-sm font-medium text-base-content/60">
                  Audio Source
                </div>

                <div className="mt-2 text-3xl font-bold">
                  {streamAudioLabel}
                </div>

{/*                 {streamAudioNumber !== null &&
                  streamAudioNumber !== undefined && (
                    <div className="mt-1 text-sm text-base-content/50">
                      Stream Audio {streamAudioNumber}
                    </div>
                  )} */}

              </div>

              {/* Multicast */}
              <div className="rounded-xl border border-base-300 bg-base-200 p-5">

                <div className="text-sm font-medium text-base-content/60">
                  Video Network Stream
                </div>

                <div className="mt-3 flex flex-wrap items-center gap-2">

                  {multicast && (
                    multicastIsValid ? (
                      <span className="badge badge-success gap-1">
                        <span className="status status-success" />
                        ACTIVE
                      </span>
                    ) : (
                      <span className="badge badge-error gap-1">
                        <span className="status status-error" />
                        INACTIVE
                      </span>
                    )
                  )}

                </div>
              </div>

              {/* HDMI */}
              <div className="rounded-xl border border-base-300 bg-base-200 p-5">

                <div className="text-sm font-medium text-base-content/60">
                  HDMI
                </div>

                <div className="mt-3">

                  {decoder?.hdmi === "connected" ? (
                    <span className="badge badge-success badge-lg gap-2">
                      <span className="status status-success" />
                      connected
                    </span>
                  ) : (
                    <span className="badge badge-error badge-lg">
                      {decoder?.hdmi || "--"}
                    </span>
                  )}

                </div>

              </div>

              {/* Video Packet Drops */}
              <div className="rounded-xl border border-base-300 bg-base-200 p-5">

                <div className="text-sm font-medium text-base-content/60">
                  Video Packet Drops / sec
                </div>

                <div
                  className={`mt-2 text-3xl font-bold ${
                    videoDrop > 0
                      ? "text-warning"
                      : "text-success"
                  }`}
                >
                  {videoDrop ?? "--"}
                </div>

              </div>

              {/* Video Frame Drops */}
              <div className="rounded-xl border border-base-300 bg-base-200 p-5">

                <div className="text-sm font-medium text-base-content/60">
                  Video Frame Drops / sec
                </div>

                <div
                  className={`mt-2 text-3xl font-bold ${
                    frameDrop > 0
                      ? "text-warning"
                      : "text-success"
                  }`}
                >
                  {frameDrop ?? "--"}
                </div>

              </div>

            </div>

            <div className="divider" />

            {/* Footer */}
            <div className="flex flex-col gap-2 text-sm text-base-content/50 sm:flex-row sm:items-center sm:justify-between">

              <div>
                Update interval: <strong>5 seconds</strong>
              </div>

              <div>
                {lastUpdated ? (
                  <>
                    Last updated:{" "}
                    <strong>
                      {lastUpdated.toLocaleTimeString()}
                    </strong>
                  </>
                ) : (
                  "Waiting for data..."
                )}
              </div>

            </div>

          </div>
        </div>
        
      </div>
    </div>
  );
}