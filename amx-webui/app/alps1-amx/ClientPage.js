'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from "next-auth/react";
import SidebarNavigation from '@/components/SidebarNavigation';

export default function Home({ session }) {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [selectedStream, setSelectedStream] = useState(201);
  const [selectedDecoder, setSelectedDecoder] = useState('172.18.92.95');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temperature: 'Loading...', forecast: 'Loading...' });
  const [amxOnline, setAmxOnline] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [modalIptvNumber, setModalIptvNumber] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rebootLoading, setRebootLoading] = useState(false);
  const [isVideoLoading, setIsVideoLoading] = useState(true); // ✅ NEW
  const [busy, setBusy] = useState(false);
  const videoRef = useRef(null);
  const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:5000';
  const [updateIptvIp, setUpdateIptvIp] = useState('10.250.1.31');
  const [updateChannel, setUpdateChannel] = useState('1');

  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const username = session?.user?.name || session?.user?.email || 'User';

  const switchStream = async () => {
  if (busy) return;
  setBusy(true);

  setStatus(`Switching decoder ${selectedDecoder} to stream ${selectedStream}...`);

  try {
    const res = await fetch('/api/switch', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamNumber: selectedStream,
        decoderIp: selectedDecoder
      }),
    });

    const data = await res.json();

    if (res.ok) {
      setStatus(`✅ Switched decoder ${selectedDecoder} to stream ${selectedStream}`);
    } else {
      setStatus(`⚠️ Command sent, but controller did not respond`);
    }

  } catch (err) {
    setStatus(`❌ Network error: ${err.message}`);
  } finally {
    setBusy(false); // ✅ ALWAYS re-enable
  }
};

  const iptvNumberToIp = (num) => {
    if (num >= 1 && num <= 28) {
      const base = 31;
      return `10.250.1.${base + (num - 1)}`;
    }
    return null;
  };

  const rebootSetTopBox = async (iptvNumber) => {
    const ip = iptvNumberToIp(iptvNumber);
    if (!ip) {
      setStatus(`❌ No IP mapping for IPTV ${iptvNumber}.`);
      return;
    }
    setRebootLoading(true);
    setStatus(`🔄 Sending reboot request to ${ip}...`);
    try {
      const res = await fetch(`${backend2Url}/api/reboot`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ip }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`✅ Successfully rebooted ${ip} (IPTV ${iptvNumber}).`);
      } else {
        setStatus(`❌ Reboot failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setStatus(`❌ Network Error: ${err.message}`);
    } finally {
      setRebootLoading(false);
    }
  };

  const openConfirmation = (action, iptvNumber) => {
    setModalAction(action);
    setModalIptvNumber(iptvNumber);
    setShowModal(true);
  };

const handleConfirmAction = async () => {
  setShowModal(false);

  if (modalAction === 'Reboot' && modalIptvNumber >= 1 && modalIptvNumber <= 28) {
    rebootSetTopBox(modalIptvNumber);
  } 
  else if (modalAction === 'Port Reset' && modalIptvNumber >= 1 && modalIptvNumber <= 28) {
    try {
      setStatus(`🔄 Sending port reset for IPTV ${modalIptvNumber}...`);
      const res = await fetch('/api/portresetalps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ iptvNumber: modalIptvNumber }),
      });
      const data = await res.json();
      if (res.ok) {
        setStatus(`✅ Port ${modalIptvNumber} reset successfully.`);
      } else {
        setStatus(`❌ Port reset failed: ${data.error || 'Unknown error'}`);
      }
    } catch (err) {
      setStatus(`❌ Network error: ${err.message}`);
    }
  } 
  else {
    setStatus(`⚠️ Action ${modalAction} is not supported for IPTV ${modalIptvNumber}.`);
  }
};

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  const customLabels = {
    229: 'ENC - FIRETV',
    230: 'ENC - PC',
    231: 'ENC - CCTV 2',
    232: 'ENC - APPLE TV',
    233: 'ENC - CCTV',
    234: 'ENC - SHIELD',
    235: 'ENC - CHROMECAST',
    236: 'ENC - HIMAWARI 1',
    237: 'ENC - PLEX',
    238: 'ENC - ROKU',
    239: 'ENC - HIMAWARI 2',
    240: 'ENC - KALEIDESCAPE',
    241: 'MULTIVIEW 1',
    242: 'MULTIVIEW 2',
    243: 'MULTIVIEW 3',
    244: 'MULTIVIEW 4',
    245: 'MULTIVIEW 5',
    246: 'MULTIVIEW 6',
    247: 'MULTIVIEW 7',
    248: 'MULTIVIEW 8',
    249: 'MULTIVIEW 9',
  };

// Vitec Channel and Stream URI mapping
const CHANNELS = [
  {
    id: 6,
    name: "GTV",
    streamUri: "udp://225.1.1.6:1234"
  },
  {
    id: 10,
    name: "DZRH NEWS TV",
    streamUri: "udp://225.1.1.10:1234"
  },
  {
    id: 11,
    name: "GLOBAL NEWS",
    streamUri: "udp://225.1.1.11:1234"
  },
  {
    id: 12,
    name: "MSNBC",
    streamUri: "udp://225.1.1.12:1234"
  },
  {
    id: 13,
    name: "AFRICA NEWS",
    streamUri: "udp://225.1.1.13:1234"
  },
  {
    id: 14,
    name: "ANC",
    streamUri: "udp://225.1.1.14:1234"
  },
  {
    id: 15,
    name: "CNBC WORLD",
    streamUri: "udp://225.1.1.15:1234"
  },
{
    id: 16,
    name: "FOX NEWS",
    streamUri: "udp://225.1.1.16:1234"
  },
  {
    id: 17,
    name: "CNN HD",
    streamUri: "udp://225.1.1.17:1234"
  },
  {
    id: 18,
    name: "BBC WORLD",
    streamUri: "udp://225.1.1.18:1234"
  },
  {
    id: 19,
    name: "NHK WORLD",
    streamUri: "udp://225.1.1.19:1234"
  },
  {
    id: 20,
    name: "EURONEWS",
    streamUri: "udp://225.1.1.20:1234"
  },
  {
    id: 21,
    name: "AL JAZEERA",
    streamUri: "udp://225.1.1.21:1234"
  },
{
    id: 22,
    name: "RUSSIA TODAY",
    streamUri: "udp://225.1.1.22:1234"
  },
  {
    id: 23,
    name: "FRANCE 24",
    streamUri: "udp://225.1.1.23:1234"
  },
  {
    id: 24,
    name: "ONE NEWS",
    streamUri: "udp://225.1.1.24:1234"
  },
  {
    id: 25,
    name: "VOA",
    streamUri: "udp://225.1.1.25:1234"
  },
  {
    id: 26,
    name: "CGTN",
    streamUri: "udp://225.1.1.26:1234"
  },
  {
    id: 27,
    name: "CNA",
    streamUri: "udp://225.1.1.27:1234"
  },
{
    id: 28,
    name: "PRESS TV",
    streamUri: "udp://225.1.1.28:1234"
  },
  {
    id: 29,
    name: "SKY NEWS",
    streamUri: "udp://225.1.1.29:1234"
  },
  {
    id: 30,
    name: "TRT WORLD",
    streamUri: "udp://225.1.1.30:1234"
  },
  {
    id: 31,
    name: "ARIRANG",
    streamUri: "udp://225.1.1.31:1234"
  },
  {
    id: 32,
    name: "REUTERS",
    streamUri: "udp://225.1.1.32:1234"
  },
  {
    id: 33,
    name: "BLOOMBERG",
    streamUri: "udp://225.1.1.33:1234"
  },
{
    id: 34,
    name: "DWTV",
    streamUri: "udp://225.1.1.34:1234"
  },
  {
    id: 35,
    name: "ABC AUSTRALIA",
    streamUri: "udp://225.1.1.40:1234"
  },
  {
    id: 97,
    name: "INCTV",
    streamUri: "udp://224.1.1.3:1234"
  },
  {
    id: 98,
    name: "NET25",
    streamUri: "udp://224.1.1.4:1234"
  },
  {
    id: 99,
    name: "TEMPLO WS",
    streamUri: "udp://239.1.1.90:12344"
  },
  {
    id: 100,
    name: "INCRADIO",
    streamUri: "udp://239.1.1.34:1234"
  },
{
    id: 101,
    name: "NEWSMAX",
    streamUri: "udp://239.1.1.101:1235"
  },
  {
    id: 102,
    name: "THE FIRST",
    streamUri: "udp://239.1.1.102:1235"
  },
  {
    id: 103,
    name: "TICKER NEWS",
    streamUri: "udp://239.1.1.103:1235"
  },
  {
    id: 104,
    name: "ABC NEWS LIVE",
    streamUri: "udp://239.1.1.104:1235"
  },
  {
    id: 105,
    name: "i24 NEWS",
    streamUri: "udp://239.1.1.105:1235"
  },
  {
    id: 106,
    name: "GB NEWS",
    streamUri: "udp://239.1.1.106:1235"
  },
{
    id: 107,
    name: "BEK TV",
    streamUri: "udp://239.1.1.107:1235"
  },
  {
    id: 108,
    name: "REAL AMERICA",
    streamUri: "udp://239.1.1.108:1235"
  },
  {
    id: 109,
    name: "CBSN",
    streamUri: "udp://239.1.1.109:1235"
  },
  {
    id: 110,
    name: "SMNI NEWS",
    streamUri: "udp://239.1.1.110:1235"
  },
  {
    id: 111,
    name: "PBS KQED",
    streamUri: "udp://239.1.1.111:1235"
  },
   {
    id: 112,
    name: "RADYO BANDIDO",
    streamUri: "udp://239.1.1.112:1235"
  }, 
   {
    id: 113,
    name: "DZMM TELERADYO",
    streamUri: "udp://239.1.1.113:1235"
  },
   {
    id: 114,
    name: "NBC NEWS NOW",
    streamUri: "udp://239.1.1.114:1235"
  },
   {
    id: 115,
    name: "FOX LIVE NOW",
    streamUri: "udp://239.1.1.115:1235"
  },
   {
    id: 116,
    name: "UN WEB TV",
    streamUri: "udp://239.1.1.116:1235"
  },
   {
    id: 117,
    name: "OAN",
    streamUri: "udp://239.1.1.117:1235"
  },
   {
    id: 118,
    name: "INDIA TODAY",
    streamUri: "udp://239.1.1.118:1235"
  },
   {
    id: 119,
    name: "SCRIPPS NEWS",
    streamUri: "udp://239.1.1.119:1235"
  },
   {
    id: 120,
    name: "SPECIAL EVENT 1",
    streamUri: "udp://239.1.1.113:1234"
  },
   {
    id: 121,
    name: "SPECIAL EVENT 2",
    streamUri: "udp://239.1.1.114:1234"
  },
   {
    id: 122,
    name: "SPECIAL EVENT 3",
    streamUri: "udp://239.1.1.115:1234"
  },
   {
    id: 123,
    name: "SPECIAL EVENT 4",
    streamUri: "udp://239.1.1.116:1234"
  },
  {
    id: 155,
    name: "FOX WEATHER",
    streamUri: "udp://239.1.1.155:1234"
  },
   {
    id: 157,
    name: "CHEDDAR NEWS",
    streamUri: "udp://239.1.1.157:1234"
  },
  {
    id: 171,
    name: "PBS WORLD",
    streamUri: "udp://239.1.1.171:1234"
  },
  {
    id: 172,
    name: "ABC7",
    streamUri: "udp://239.1.1.172:1234"
  },
  {
    id: 177,
    name: "REUTERS TV",
    streamUri: "udp://239.1.1.177:1234"
  },
  {
    id: 184,
    name: "KPIX CBS NEWS",
    streamUri: "udp://239.1.1.184:1234"
  },
  {
    id: 204,
    name: "NEWS NATIONS",
    streamUri: "udp://239.1.1.204:1234"
  },
  {
    id: 218,
    name: "C-SPAN",
    streamUri: "udp://239.1.1.218:1234"
  },
  {
    id: 219,
    name: "CNBC",
    streamUri: "udp://239.1.1.219:1234"
  },
  {
    id: 221,
    name: "FOX BUSINESS",
    streamUri: "udp://239.1.1.221:1234"
  },
  {
    id: 222,
    name: "WASHINGTON POST",
    streamUri: "udp://239.1.1.222:1234"
  },
  {
    id: 250,
    name: "TEMPLO WORSHIP SERVICE",
    streamUri: "udp://239.1.1.250:1234"
  },
  {
    id: 251,
    name: "PMD TAGALOG WS",
    streamUri: "udp://234.1.2.1:1234"
  },
  {
    id: 252,
    name: "PMD ENGLISH WS",
    streamUri: "udp://234.1.2.2:1234"
  },
  {
    id: 301,
    name: "TEMPLO PERIMETER",
    streamUri: "udp://225.1.1.1:5001"
  },
  {
    id: 302,
    name: "TEMPLO & OLD CEM PERIMETER",
    streamUri: "udp://225.1.1.2:5001"
  },
  {
    id: 303,
    name: "CENTRAL VCO PERIMETER",
    streamUri: "udp://225.1.1.3:5001"
  },
  {
    id: 304,
    name: "TEMPLO TOWER A",
    streamUri: "udp://225.1.1.4:5001"
  },
  {
    id: 305,
    name: "CENTRAL PERIMETER GATE 1 & GATE 3",
    streamUri: "udp://225.1.1.5:5001"
  },
  {
    id: 306,
    name: "CENTRAL PERIMETER PMD/HGM",
    streamUri: "udp://225.1.1.6:5001"
  },
  {
    id: 307,
    name: "TIERRA BELLA TO MOTORPOOL EXTN",
    streamUri: "udp://225.1.1.7:5001"
  },
  {
    id: 308,
    name: "CENTRAL PERIMETER PAVILLON GATE 4",
    streamUri: "udp://225.1.1.8:5001"
  },
  {
    id: 309,
    name: "TEMPLO CCTV",
    streamUri: "udp://225.1.1.9:5001"
  },
  {
    id: 310,
    name: "CENTRAL PERIMETER",
    streamUri: "udp://225.1.1.10:5001"
  },
  {
    id: 311,
    name: "SGM BLDG A",
    streamUri: "udp://225.1.1.11:5001"
  },
  {
    id: 312,
    name: "SGM BLDG B",
    streamUri: "udp://225.1.1.12:5001"
  },
  {
    id: 313,
    name: "SGM BLDG C",
    streamUri: "udp://225.1.1.13:5001"
  },
  {
    id: 314,
    name: "PRIVATE AREA STN 1",
    streamUri: "udp://225.1.1.14:5001"
  },
  {
    id: 315,
    name: "BRGY NEW ERA CCTV 1",
    streamUri: "udp://225.1.1.15:5001"
  },
  {
    id: 316,
    name: "BRGY NEW ERA CCTV 2",
    streamUri: "udp://225.1.1.16:5001"
  },
  {
    id: 330,
    name: "BURLINGAME CCTV",
    streamUri: "udp://225.1.1.17:5001"
  },
  {
    id: 331,
    name: "TORONTO CCTV",
    streamUri: "udp://225.1.1.18:5001"
  },
  {
    id: 332,
    name: "SCARBOROUGH CCTV",
    streamUri: "udp://225.1.1.19:5001"
  },
  {
    id: 333,
    name: "USWO-CCTV1",
    streamUri: "udp://225.1.1.20:5001"
  },
  {
    id: 334,
    name: "USWO-CCTV2",
    streamUri: "udp://225.1.1.21:5001"
  },
  {
    id: 335,
    name: "CALGARY CCTV",
    streamUri: "udp://225.1.1.22:5001"
  },
  {
    id: 336,
    name: "WASHINGTON DC - USEO CCTV",
    streamUri: "udp://225.1.1.23:5001"
  },
  {
    id: 337,
    name: "SAN FRANCISCO CCTV",
    streamUri: "udp://225.1.1.24:5001"
  },
  {
    id: 338,
    name: "PHILADELPHIA CCTV",
    streamUri: "udp://225.1.1.25:5001"
  },
  {
    id: 339,
    name: "MARKHAM GRT CCTV",
    streamUri: "udp://225.1.1.26:5001"
  },
  {
    id: 340,
    name: "JACKSONVILLE CCTV",
    streamUri: "udp://225.1.1.27:5001"
  },
  {
    id: 341,
    name: "HENDERSON CCTV",
    streamUri: "udp://225.1.1.28:5001"
  },
  {
    id: 342,
    name: "EVERETT CCTV",
    streamUri: "udp://225.1.1.29:5001"
  },
  {
    id: 343,
    name: "ANCHORAGE CCTV",
    streamUri: "udp://225.1.1.30:5001"
  },
  {
    id: 344,
    name: "TEMPLO TRIBUNA",
    streamUri: "udp://225.1.1.31:5001"
  },
  {
    id: 345,
    name: "TEMPLO LEFT WING",
    streamUri: "udp://225.1.1.32:5001"
  },
  {
    id: 346,
    name: "TEMPLO RIGHT WING",
    streamUri: "udp://225.1.1.33:5001"
  },
  {
    id: 347,
    name: "TEMPLO KAPULUNGAN",
    streamUri: "udp://225.1.1.34:5001"
  },
  {
    id: 348,
    name: "SANTUARYO KAPULUNGAN",
    streamUri: "udp://225.1.1.35:5001"
  },
  {
    id: 349,
    name: "TABERNAKULO KAPULUNGAN",
    streamUri: "udp://225.1.1.36:5001"
  },
  {
    id: 350,
    name: "ANAHEIM CH. 1",
    streamUri: "udp://225.1.1.1:6001"
  },
  {
    id: 351,
    name: "ANAHEIM CH. 2",
    streamUri: "udp://225.1.1.2:6001"
  },
  {
    id: 352,
    name: "BURLINGAME CH. 1",
    streamUri: "udp://225.1.1.3:6001"
  },
  {
    id: 353,
    name: "BURLINGAME CH. 2",
    streamUri: "udp://225.1.1.4:6001"
  },
  {
    id: 354,
    name: "TORONTO CH. 1",
    streamUri: "udp://225.1.1.5:6001"
  },
  {
    id: 355,
    name: "TORONTO CH. 2",
    streamUri: "udp://225.1.1.6:6001"
  },
  {
    id: 356,
    name: "EL CAJON CH. 1",
    streamUri: "udp://225.1.1.7:6001"
  },
  {
    id: 357,
    name: "EL CAJON CH. 2",
    streamUri: "udp://225.1.1.8:6001"
  },
  {
    id: 358,
    name: "ANCHORAGE CH. 1",
    streamUri: "udp://225.1.1.9:6001"
  },
  {
    id: 359,
    name: "ANCHORAGE CH. 2",
    streamUri: "udp://225.1.1.10:6001"
  },
  {
    id: 360,
    name: "JACKSONVILLE CH. 1",
    streamUri: "udp://225.1.1.11:6001"
  },
  {
    id: 361,
    name: "JACKSONVILLE CH. 2",
    streamUri: "udp://225.1.1.12:6001"
  },
  {
    id: 362,
    name: "WASHINGTON DC CH. 1",
    streamUri: "udp://225.1.1.13:6001"
  },
  {
    id: 363,
    name: "WASHINGTON DC CH. 2",
    streamUri: "udp://225.1.1.14:6001"
  },
  {
    id: 364,
    name: "PHILADELPHIA CH. 1",
    streamUri: "udp://225.1.1.15:6001"
  },
  {
    id: 365,
    name: "PHILADELPHIA CH. 2",
    streamUri: "udp://225.1.1.16:6001"
  },
  {
    id: 366,
    name: "EVERETT CH. 1",
    streamUri: "udp://225.1.1.17:6001"
  },
  {
    id: 367,
    name: "EVERETT CH. 2",
    streamUri: "udp://225.1.1.18:6001"
  },
  {
    id: 368,
    name: "HENDERSON, NV CH. 1",
    streamUri: "udp://225.1.1.19:6001"
  },
  {
    id: 369,
    name: "HENDERSON, NV CH. 2",
    streamUri: "udp://225.1.1.20:6001"
  },
  {
    id: 370,
    name: "SCARBOROUGH CH. 1",
    streamUri: "udp://225.1.1.21:6001"
  },
  {
    id: 371,
    name: "SCARBOROUGH CH. 2",
    streamUri: "udp://225.1.1.22:6001"
  },
  {
    id: 373,
    name: "CALGARY-DWTN CH. 2",
    streamUri: "udp://225.1.1.24:6001"
  },
  {
    id: 374,
    name: "SURREY, BC, CANADA CH. 1",
    streamUri: "udp://225.1.1.25:6001"
  },
  {
    id: 375,
    name: "SURREY, BC, CANADA CH. 2",
    streamUri: "udp://225.1.1.26:6001"
  },
  {
    id: 376,
    name: "MARKHAM GRT CH. 1",
    streamUri: "udp://225.1.1.27:6001"
  },
  {
    id: 377,
    name: "MARKHAM GRT CH. 2",
    streamUri: "udp://225.1.1.28:6001"
  },
  {
    id: 378,
    name: "SAN FRANCISCO CA. CH. 1",
    streamUri: "udp://225.1.1.29:6001"
  },
  {
    id: 379,
    name: "SAN FRANCISCO CA. CH. 2",
    streamUri: "udp://225.1.1.30:6001"
  },
];
const backend2Url = process.env.NEXT_PUBLIC_BACKEND2_URL || 'http://localhost:5001';


// Vitec Change Channel Handler
const handleUpdateIptvChannel2 = async () => {
  setUpdateLoading(true);
  setUpdateStatus('🔄 Updating IPTV channel...');

  try {
    const selectedChannel = CHANNELS.find(
      c => c.id === Number(updateChannel)
    );

    const res = await fetch(`${backend2Url}/send-channels2`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ip: updateIptvIp,
        streamUri: selectedChannel.streamUri,
      }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.error || 'Request failed');
    }

    setUpdateStatus(
      `✅ IPTV (${updateIptvIp}) updated to ${selectedChannel.name}`
    );
  } catch (err) {
    setUpdateStatus(`❌ Failed: ${err.message}`);
  } finally {
    setUpdateLoading(false);
  }
};


  return (
    <div className="min-h-screen bg-base-100 flex" data-theme="dark">
      <SidebarNavigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 p-6 md:p-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-primary">🖥️ Alps1 AMX System</h1>
          <div className="flex flex-wrap gap-4 items-center text-sm font-mono text-base-content/70">
            <div className="text-right">
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
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-10">
          <div className="space-y-8">
            <div className="w-full aspect-video bg-black rounded-lg relative border border-base-content/30 shadow-md overflow-hidden">
              <iframe
                src="http://172.18.61.53:1984/stream.html?src=cam2"
                className="w-full h-full rounded-lg"
                scrolling="no"
                allow="autoplay; fullscreen; camera; microphone"
                allowFullScreen
              />
            </div>

            {/* Stream Switcher */}
            <div className="card bg-base-200 shadow-2xl">
              <div className="card-body space-y-4">
                <h2 className="card-title text-lg text-accent">VIDEO ROUTING CONTROL</h2>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Destination</span>
                  </label>
                  <select
                    className="select select-bordered"
                    value={selectedDecoder}
                    onChange={(e) => setSelectedDecoder(e.target.value)}
                  >
                    <option value="172.18.92.95">DEC - Web Player</option>
                    <option value="172.18.92.152" disabled>DEC - Staging Decoder</option>
                  </select>
                </div>

                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Sources</span>
                  </label>
                  <select
                    className="select select-accent select-bordered"
                    value={selectedStream}
                    onChange={(e) => setSelectedStream(parseInt(e.target.value))}
                  >
                    {Array.from({ length: 49 }, (_, i) => {
                      const streamNumber = 201 + i;
                      const label = customLabels[streamNumber] || `ENC - IPTV ${i + 1}`;
                      return (
                        <option key={i} value={streamNumber}>{label}</option>
                      );
                    })}
                  </select>
                </div>

                <div className="card-actions mt-4">
                  <button className="btn btn-primary w-full" disabled={busy} onClick={switchStream}>
                    Set Stream
                  </button>
                </div>

                {status && (
                  <div className="alert alert-info mt-4 text-sm break-words">
                    <span>{status}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* IPTV Reboot Section */}
          <div className="max-h-[660px] overflow-y-auto space-y-4">
            {Array.from({ length: 28 }, (_, i) => {
              const iptvNumber = i + 1;
              const label = `IPTV ${iptvNumber}`;
              return (
                <div key={iptvNumber} className="card bg-base-200 shadow-md">
                  <div className="card-body flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <h3 className="text-lg font-semibold text-accent">{label}</h3>
                    <div className="flex gap-3">
                      <button
                        disabled={rebootLoading && modalIptvNumber === iptvNumber}
                        className="btn btn-sm btn-warning"
                        onClick={() => openConfirmation('Reboot', iptvNumber)}
                      >
                        {rebootLoading && modalIptvNumber === iptvNumber ? 'Rebooting...' : 'Reboot'}
                      </button>
                      <button className="btn btn-sm btn-error" onClick={() => openConfirmation('Port Reset', iptvNumber)}>
                        Port Reset
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
            <div className="card bg-base-200 shadow-md">
              <div className="card-body">
                <h2 className="text-lg font-semibold text-accent mb-4">
                  CHANNEL PRESETS
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  <button className="btn btn-sm btn-info">Preset 1</button>
                  <button className="btn btn-sm btn-success">Preset 2</button>
                  <button className="btn btn-sm btn-warning">Preset 3</button>
                </div>
              </div>
            </div>

            <div className="card bg-base-200 shadow-md">
              <div className="card-body space-y-4">
                <h2 className="text-lg font-semibold text-accent">IPTV CHANNEL CONTROL</h2>

                {/* IPTV Select */}
                {/* IPTV Select */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Select IPTV</span>
                  </label>

                  <select
                    className="select select-bordered"
                    value={updateIptvIp}
                    onChange={(e) => setUpdateIptvIp(e.target.value)}
                  >
                    {Array.from({ length: 28 }, (_, i) => {
                      const iptvNumber = i + 1;
                      const ip = `10.250.1.${31 + i}`;

                      return (
                        <option key={iptvNumber} value={ip}>
                          IPTV {iptvNumber} ({ip})
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Channel Select */}
                <div className="form-control">
                  <label className="label">
                    <span className="label-text">Select Channel</span>
                  </label>

                  <select
                    className="select select-bordered"
                    value={updateChannel}
                    onChange={(e) => setUpdateChannel(e.target.value)}
                  >
                    {CHANNELS.map((channel) => (
                      <option
                        key={channel.id}
                        value={channel.id}
                      >
                        Channel {channel.id} - {channel.name}
                      </option>
                    ))}
                  </select>
                </div>

              <button
                className="btn btn-primary w-full"
                onClick={handleUpdateIptvChannel2}
                disabled={updateLoading}
              >
                {updateLoading ? 'Updating...' : 'Update Channel'}
              </button>
              </div>
            </div>
          </div>
        </div>

        {showModal && (
          <dialog className="modal modal-open">
            <div className="modal-box">
              <h3 className="font-bold text-lg">Confirm {modalAction}</h3>
              <p className="py-4">
                Are you sure you want to <span className="font-bold">{modalAction}</span> IPTV{' '}
                <span className="text-accent">{modalIptvNumber}</span>?
              </p>
              <div className="modal-action">
                <button className="btn btn-error" onClick={handleConfirmAction}>
                  Yes
                </button>
                <button className="btn" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
              </div>
            </div>
          </dialog>
        )}
      </div>
    </div>
  );
}
