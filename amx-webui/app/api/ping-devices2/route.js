// app/api/ping-devices2/route.js

import { exec } from 'child_process';
import { NextResponse } from 'next/server';

const devices = [
  { name: 'NX-4200', ip: '172.18.92.100' },
  { name: 'SC-N8002', ip: '172.18.92.101' },
  { name: 'Exterity STB 1', ip: '10.250.1.31' },
  { name: 'Exterity STB 2', ip: '10.250.1.32' },
  { name: 'Exterity STB 3', ip: '10.250.1.33' },
  { name: 'Exterity STB 4', ip: '10.250.1.34' },
  { name: 'Exterity STB 5', ip: '10.250.1.35' },
  { name: 'Exterity STB 6', ip: '10.250.1.36' },
  { name: 'Exterity STB 7', ip: '10.250.1.37' },
  { name: 'Exterity STB 8', ip: '10.250.1.38' },
  { name: 'Exterity STB 9', ip: '10.250.1.39' },
  { name: 'Exterity STB 10', ip: '10.250.1.40' },
  { name: 'Exterity STB 11', ip: '10.250.1.41' },
  { name: 'Exterity STB 12', ip: '10.250.1.42' },
  { name: 'Exterity STB 13', ip: '10.250.1.43' },
  { name: 'Exterity STB 14', ip: '10.250.1.44' },
  { name: 'Exterity STB 15', ip: '10.250.1.45' },
  { name: 'Exterity STB 16', ip: '10.250.1.46' },
  { name: 'Exterity STB 17', ip: '10.250.1.47' },
  { name: 'Exterity STB 18', ip: '10.250.1.48' },
  { name: 'Exterity STB 19', ip: '10.250.1.49' },
  { name: 'Exterity STB 20', ip: '10.250.1.50' },
  { name: 'Exterity STB 21', ip: '10.250.1.51' },
  { name: 'Exterity STB 22', ip: '10.250.1.52' },
  { name: 'Exterity STB 23', ip: '10.250.1.53' },
  { name: 'Exterity STB 24', ip: '10.250.1.54' },
  { name: 'Exterity STB 25', ip: '10.250.1.55' },
  { name: 'Exterity STB 26', ip: '10.250.1.56' },
  { name: 'Exterity STB 27', ip: '10.250.1.57' },
  { name: 'Exterity STB 28', ip: '10.250.1.58' },
  { name: 'Multiviewer', ip: '172.18.92.142' },
  { name: 'Audio Transceiver', ip: '172.18.92.96' },
  { name: 'Decoder Theater', ip: '172.18.92.85' },
  { name: 'Decoder Mini Office', ip: '172.18.92.86' },
  { name: 'Decoder Led Wall', ip: '172.18.92.81' },
  { name: 'Decoder Stream Deck 1', ip: '172.18.92.94' },
  { name: 'Decoder Stream Deck 2', ip: '172.18.92.95' },
  { name: 'Decoder Table', ip: '172.18.92.82' },
  { name: 'Decoder Conference', ip: '172.18.92.83' },
  { name: 'Encoder IPTV 1', ip: '172.18.92.41' },
  { name: 'Encoder IPTV 2', ip: '172.18.92.42' },
  { name: 'Encoder IPTV 3', ip: '172.18.92.43' },
  { name: 'Encoder IPTV 4', ip: '172.18.92.44' },
  { name: 'Encoder IPTV 5', ip: '172.18.92.45' },
  { name: 'Encoder IPTV 6', ip: '172.18.92.46' },
  { name: 'Encoder IPTV 7', ip: '172.18.92.47' },
  { name: 'Encoder IPTV 8', ip: '172.18.92.48' },
  { name: 'Encoder IPTV 9', ip: '172.18.92.49' },
  { name: 'Encoder IPTV 10', ip: '172.18.92.50' },
  { name: 'Encoder IPTV 11', ip: '172.18.92.51' },
  { name: 'Encoder IPTV 12', ip: '172.18.92.52' },
  { name: 'Encoder IPTV 13', ip: '172.18.92.53' },
  { name: 'Encoder IPTV 14', ip: '172.18.92.54' },
  { name: 'Encoder IPTV 15', ip: '172.18.92.55' },
  { name: 'Encoder IPTV 16', ip: '172.18.92.56' },
  { name: 'Encoder IPTV 17', ip: '172.18.92.57' },
  { name: 'Encoder IPTV 18', ip: '172.18.92.58' },
  { name: 'Encoder IPTV 19', ip: '172.18.92.59' },
  { name: 'Encoder IPTV 20', ip: '172.18.92.60' },
  { name: 'Encoder IPTV 21', ip: '172.18.92.61' },
  { name: 'Encoder IPTV 22', ip: '172.18.92.62' },
  { name: 'Encoder IPTV 23', ip: '172.18.92.63' },
  { name: 'Encoder IPTV 24', ip: '172.18.92.64' },
  { name: 'Encoder IPTV 25', ip: '172.18.92.65' },
  { name: 'Encoder IPTV 26', ip: '172.18.92.66' },
  { name: 'Encoder IPTV 27', ip: '172.18.92.67' },
  { name: 'Encoder IPTV 28', ip: '172.18.92.68' },
  { name: 'Encoder Fire TV', ip: '172.18.92.69' },
  { name: 'Encoder PC', ip: '172.18.92.70' },
  { name: 'Encoder CCTV 2', ip: '172.18.92.71' },
  { name: 'Encoder Apple TV', ip: '172.18.92.72' },
  { name: 'Encoder CCTV', ip: '172.18.92.73' },
  { name: 'Encoder Shield', ip: '172.18.92.74' },
  { name: 'Encoder Chromecast', ip: '172.18.92.75' },
  { name: 'Encoder Himawari 1', ip: '172.18.92.76' },
  { name: 'Encoder Plex', ip: '172.18.92.77' },
  { name: 'Encoder Roku', ip: '172.18.92.78' },
  { name: 'Encoder Himawari 2', ip: '172.18.92.79' },
  { name: 'Encoder Kaleidescape', ip: '172.18.92.80' },
  { name: 'Encoder IPTV Preview', ip: '172.18.92.99' },
  { name: 'Windowing Processor 1', ip: '172.18.92.102' },
  { name: 'Windowing Processor 2', ip: '172.18.92.107' },
  { name: 'Windowing Processor 3', ip: '172.18.92.112' },
  { name: 'Windowing Processor 4', ip: '172.18.92.117' },
  { name: 'Windowing Processor 5', ip: '172.18.92.122' },
  { name: 'Windowing Processor 6', ip: '172.18.92.127' },
  { name: 'Windowing Processor 7', ip: '172.18.92.132' },
  { name: 'Windowing Processor 8', ip: '172.18.92.137' },
  { name: 'Windowing Processor 9', ip: '172.18.92.142' },
];

async function ping(ip) {
  return new Promise((resolve) => {
    exec(`ping -c 1 -W 1 ${ip}`, (error) => {
      resolve(!error); // true if online, false if error
    });
  });
}

export async function GET() {
  const results = await Promise.all(
    devices.map(async (device) => {
      const isOnline = await ping(device.ip);
      return {
        name: device.name,
        status: isOnline ? 'online' : 'offline',
      };
    })
  );

  return NextResponse.json(results);
}
