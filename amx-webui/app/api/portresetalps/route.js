// app/api/portresetalps/route.js
import { NextResponse } from "next/server";

export async function POST(request) {
  try {
    const { iptvNumber } = await request.json();

    if (!iptvNumber || iptvNumber < 1 || iptvNumber > 28) {
      return NextResponse.json({ error: "Invalid IPTV number" }, { status: 400 });
    }

    // Compose your request payload
    const payload = {
      switch_name: "ALPS",
      port: iptvNumber,
    };

    // Send the POST request to the switch with Basic Auth
    const res = await fetch("http://172.18.99.35/api/toggle", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Basic ${Buffer.from("poe:poe123").toString("base64")}`,
      },
      body: JSON.stringify(payload),
    });

    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json({ error: `Switch returned error: ${text}` }, { status: res.status });
    }

    const data = await res.json().catch(() => ({}));
    return NextResponse.json({ success: true, message: `Port ${iptvNumber} reset successful.`, data });
  } catch (error) {
    console.error("Port reset error:", error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
