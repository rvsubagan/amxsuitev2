// app/api/decoder/route.js

import { NextResponse } from "next/server"

import { getDecoderStatus } from "@/lib/snmp"
import { checkTcp } from "@/lib/tcp"

// IMPORTANT:
// This route performs live SNMP and TCP checks.
// It must never be statically generated or cached.

export const dynamic = "force-dynamic"

export const revalidate = 0

export async function GET() {
  const ip = "172.18.90.186"
  const port = 50002

  const [tcpResult, snmpResult] = await Promise.allSettled([
    checkTcp(ip, port, 2000),
    getDecoderStatus(),
  ])

  const reachable =
    tcpResult.status === "fulfilled"
      ? tcpResult.value
      : false

  // SNMP succeeded
  if (snmpResult.status === "fulfilled") {
    return NextResponse.json(
      {
        ...snmpResult.value,

        ip,
        port,

        status: reachable ? "UP" : "DOWN",
      },
      {
        headers: {
          "Cache-Control":
            "no-store, no-cache, must-revalidate, proxy-revalidate",
        },
      }
    )
  }

  // SNMP failed
  return NextResponse.json(
    {
      ip,
      port,
      stream: null,
      streamAudio: null,
      hdmi: "disconnected",
      multicast: "-",
      videoDrop: null,
      frameDrop: null,
      status: reachable ? "UP" : "DOWN",
    },
    {
      headers: {
        "Cache-Control":
          "no-store, no-cache, must-revalidate, proxy-revalidate",
      },
    }
  )
}