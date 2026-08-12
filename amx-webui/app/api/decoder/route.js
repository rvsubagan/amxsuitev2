import { NextResponse } from "next/server"
import { getDecoderStatus } from "@/lib/snmp"
import { pingHost } from "@/lib/ping"

// IMPORTANT:
// This route performs live SNMP and ping checks.
// It must never be statically generated or cached.
export const dynamic = "force-dynamic"
export const revalidate = 0

export async function GET() {
  const ip = "172.18.90.186"

  const [pingResult, snmpResult] =
    await Promise.allSettled([
      pingHost(ip),
      getDecoderStatus(),
    ])

  const reachable =
    pingResult.status === "fulfilled"
      ? pingResult.value
      : false

  // SNMP succeeded
  if (snmpResult.status === "fulfilled") {
    return NextResponse.json(
      {
        ...snmpResult.value,
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