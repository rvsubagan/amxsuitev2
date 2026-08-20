// app/api/ping-devices/route.js

import net from 'net';

const devices = [
  { name: 'NX-3200', ip: '172.18.90.200' },
  { name: 'SC-N8002', ip: '172.18.90.182' },

  { name: 'Exterity STB 1', ip: '10.250.1.131' },
  { name: 'Exterity STB 2', ip: '10.250.1.132' },
  { name: 'Exterity STB 3', ip: '10.250.1.133' },
  { name: 'Exterity STB 4', ip: '10.250.1.134' },
  { name: 'Exterity STB 5', ip: '10.250.1.135' },
  { name: 'Exterity STB 6', ip: '10.250.1.136' },
  { name: 'Exterity STB 7', ip: '10.250.1.137' },
  { name: 'Exterity STB 8', ip: '10.250.1.138' },
  { name: 'Exterity STB 9', ip: '10.250.1.139' },
  { name: 'Exterity STB 10', ip: '10.250.1.140' },
  { name: 'Exterity STB 11', ip: '10.250.1.141' },
  { name: 'Exterity STB 12', ip: '10.250.1.142' },
  { name: 'Exterity STB 13', ip: '10.250.1.143' },
  { name: 'Exterity STB 14', ip: '10.250.1.144' },
  { name: 'Exterity STB 15', ip: '10.250.1.145' },
  { name: 'Exterity STB 16', ip: '10.250.1.146' },
  { name: 'Exterity STB 17', ip: '10.250.1.147' },

  { name: 'Audio Transceiver', ip: '172.18.90.114' },
  { name: 'Decoder Office Table', ip: '172.18.90.162' },
  { name: 'Decoder Theater', ip: '172.18.90.184' },
  { name: 'Decoder Family Hall', ip: '172.18.90.163' },
  { name: 'Decoder Master Bed', ip: '172.18.90.182' },
  { name: 'Decoder PrivOff', ip: '172.18.90.185' },
  { name: 'Decoder Private Office', ip: '172.18.90.181' },
  { name: 'Decoder Radio Room', ip: '172.18.90.183' },
  { name: 'Decoder Radio Room 2', ip: '172.18.90.164' },

  { name: 'Decoder Videowall 1', ip: '172.18.90.145' },
  { name: 'Decoder Videowall 2', ip: '172.18.90.146' },
  { name: 'Decoder Videowall 3', ip: '172.18.90.147' },
  { name: 'Decoder Videowall 4', ip: '172.18.90.148' },
  { name: 'Decoder Videowall 5', ip: '172.18.90.149' },
  { name: 'Decoder Videowall 6', ip: '172.18.90.150' },
  { name: 'Decoder Videowall 7', ip: '172.18.90.151' },
  { name: 'Decoder Videowall 8', ip: '172.18.90.152' },
  { name: 'Decoder Videowall 9', ip: '172.18.90.153' },
  { name: 'Decoder Videowall 10', ip: '172.18.90.154' },
  { name: 'Decoder Videowall 11', ip: '172.18.90.155' },
  { name: 'Decoder Videowall 12', ip: '172.18.90.156' },
  { name: 'Decoder Videowall 13', ip: '172.18.90.157' },
  { name: 'Decoder Videowall 14', ip: '172.18.90.158' },
  { name: 'Decoder Videowall 15', ip: '172.18.90.159' },
  { name: 'Decoder Videowall 16', ip: '172.18.90.160' },

  { name: 'Encoder IPTV 1', ip: '172.18.90.71' },
  { name: 'Encoder IPTV 2', ip: '172.18.90.72' },
  { name: 'Encoder IPTV 3', ip: '172.18.90.73' },
  { name: 'Encoder IPTV 4', ip: '172.18.90.74' },
  { name: 'Encoder IPTV 5', ip: '172.18.90.75' },
  { name: 'Encoder IPTV 6', ip: '172.18.90.76' },
  { name: 'Encoder IPTV 7', ip: '172.18.90.77' },
  { name: 'Encoder IPTV 8', ip: '172.18.90.78' },
  { name: 'Encoder IPTV 9', ip: '172.18.90.79' },
  { name: 'Encoder IPTV 10', ip: '172.18.90.80' },
  { name: 'Encoder IPTV 11', ip: '172.18.90.81' },
  { name: 'Encoder IPTV 12', ip: '172.18.90.82' },
  { name: 'Encoder IPTV 13', ip: '172.18.90.83' },
  { name: 'Encoder IPTV 14', ip: '172.18.90.84' },
  { name: 'Encoder IPTV 15', ip: '172.18.90.85' },
  { name: 'Encoder IPTV 16', ip: '172.18.90.86' },

  { name: 'Encoder 1F Device 1', ip: '172.18.90.131' },
  { name: 'Encoder Shield TV', ip: '172.18.90.132' },
  { name: 'Encoder Chromecast', ip: '172.18.90.133' },
  { name: 'Encoder Apple TV', ip: '172.18.90.134' },
  { name: 'Encoder 1F PC', ip: '172.18.90.135' },
  { name: 'Encoder CCTV 2', ip: '172.18.90.136' },
  { name: 'Encoder CCTV', ip: '172.18.90.137' },
  { name: 'Encoder Fire TV', ip: '172.18.90.138' },
  { name: 'Encoder CCTV 3B', ip: '172.18.90.139' },
  { name: 'Encoder Radio PC', ip: '172.18.90.140' },
  { name: 'Encoder Himawari 1', ip: '172.18.90.141' },
  { name: 'Encoder Himawari 2', ip: '172.18.90.142' },
  { name: 'Encoder 1F Device 2', ip: '172.18.90.143' },
  { name: 'Encoder CCTV 3', ip: '172.18.90.144' },

  { name: 'Encoder Radio 1', ip: '172.18.90.61' },
  { name: 'Encoder Radio 2', ip: '172.18.90.62' },
  { name: 'Encoder Radio 3', ip: '172.18.90.63' },
  { name: 'Encoder Radio 4', ip: '172.18.90.64' },
  { name: 'Encoder Radio 5', ip: '172.18.90.65' },
  { name: 'Encoder Kaleidescape', ip: '172.18.90.68' },
  { name: 'Encoder CCTV 5', ip: '172.18.90.69' },
  { name: 'Encoder CCTV 6', ip: '172.18.90.70' },
  { name: 'Encoder MAG IPTV', ip: '172.18.90.121' },

  { name: 'Windowing Processor 1', ip: '172.18.90.202' },
  { name: 'Windowing Processor 2', ip: '172.18.90.207' },
  { name: 'Windowing Processor 3', ip: '172.18.90.212' },
  { name: 'Windowing Processor 4', ip: '172.18.90.217' },
  { name: 'Windowing Processor 5', ip: '172.18.90.222' },
  { name: 'AMX Streamer', ip: '172.18.90.190' },
  { name: 'Web Player Decoder', ip: '172.18.90.186' }
];

/**
 * Determine TCP port based on IP address.
 *
 * 172.18.90.x -> TCP 50002
 * 10.250.1.x  -> TCP 80
 */
function getPort(ip) {
  if (ip.startsWith('172.18.90.')) {
    return 80;
  }

  if (ip.startsWith('10.250.1.')) {
    return 80;
  }

  return 50002;
}

/**
 * Check whether a TCP port is reachable.
 */
function checkTcp(ip, port, timeout = 2000) {
  return new Promise((resolve) => {
    const socket = new net.Socket();

    let finished = false;

    const finish = (online) => {
      if (finished) return;

      finished = true;
      socket.destroy();
      resolve(online);
    };

    socket.setTimeout(timeout);

    socket.once('connect', () => {
      finish(true);
    });

    socket.once('timeout', () => {
      finish(false);
    });

    socket.once('error', () => {
      finish(false);
    });

    socket.connect(port, ip);
  });
}

/**
 * Check one device.
 */
async function checkDevice(device) {
  const port = getPort(device.ip);

  const isOnline = await checkTcp(device.ip, port);

  return {
    ...device,
    port,
    status: isOnline ? 'online' : 'offline',
  };
}

/**
 * Process devices with limited concurrency.
 *
 * This prevents opening 100+ TCP connections simultaneously.
 */
async function checkDevicesWithConcurrency(devices, concurrency = 10) {
  const results = new Array(devices.length);

  let nextIndex = 0;

  async function worker() {
    while (true) {
      const index = nextIndex++;

      if (index >= devices.length) {
        return;
      }

      results[index] = await checkDevice(devices[index]);
    }
  }

  const workers = Array.from(
    { length: Math.min(concurrency, devices.length) },
    () => worker()
  );

  await Promise.all(workers);

  return results;
}

export async function GET() {
  const results = await checkDevicesWithConcurrency(devices, 10);

  return Response.json(results);
}