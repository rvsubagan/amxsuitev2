'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { signOut } from "next-auth/react";
import Hls from 'hls.js';
import SidebarNavigation from '@/components/SidebarNavigation';

export default function Home({ session }) {
  const router = useRouter();
  const [status, setStatus] = useState('');
  const [selectedStream, setSelectedStream] = useState(201);
  const [selectedDecoder, setSelectedDecoder] = useState('172.18.90.186');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [weather, setWeather] = useState({ temperature: 'Loading...', forecast: 'Loading...' });
  const [amxOnline, setAmxOnline] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [modalAction, setModalAction] = useState('');
  const [modalIptvNumber, setModalIptvNumber] = useState(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [rebootLoading, setRebootLoading] = useState(false);
  const [loadingStream, setLoadingStream] = useState(true); // <-- added
  const [audioLoading, setAudioLoading] = useState(null);
  const [activeAudio, setActiveAudio] = useState(null);
  const [updateIptvIp, setUpdateIptvIp] = useState('10.250.1.11');
  const [updateChannel, setUpdateChannel] = useState(1);
  const [updateLoading, setUpdateLoading] = useState(false);
  const [updateStatus, setUpdateStatus] = useState('');
  const [busy, setBusy] = useState(false);
  const videoRef = useRef(null);

  const handleLogout = () => {
    signOut({ callbackUrl: '/' });
  };

  const username = session?.user?.name || session?.user?.email || 'User';

  const audioMap = [
  101, 102, 105, 106,
  103, 104, 107, 108,
  109, 110, 113, 114,
  111, 112, 115, 116
];

  const switchStream = async () => {
  if (busy) return;
  setBusy(true);

  setStatus(`Switching decoder ${selectedDecoder} to stream ${selectedStream}...`);

  try {
    const res = await fetch('/api/switch2', {
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
      setStatus(`✅ Done! (Stream ${selectedStream})`);
    }

  } catch (err) {
    setStatus(`❌ Network error: ${err.message}`);
  } finally {
    setBusy(false); // ✅ ALWAYS re-enable
  }
};

  const iptvNumberToIp = (num) => {
    if (num >= 1 && num <= 17) {
      const base = 131;
      return `10.250.1.${base + (num - 1)}`;
    }
    return null;
  };

  const backend2Url = process.env.NEXT_PUBLIC_BACKEND2_URL || 'http://localhost:5001';

  const rebootSetTopBox = async (iptvNumber) => {
    const ip = iptvNumberToIp(iptvNumber);
    if (!ip) {
      setStatus(`❌ No IP mapping for IPTV ${iptvNumber}.`);
      return;
    }
    setRebootLoading(true);
    setStatus(`🔄 Sending reboot request to ${ip}...`);
    try {
      const res = await fetch(`${backend2Url}/reboot-stb`, {
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
      const res = await fetch('/api/portresetcc', {
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
/* Audio Select Handler */
const handleAudioSelect = async (streamNumber) => {
  setAudioLoading(streamNumber);
  setStatus(`🔊 Switching audio to stream ${streamNumber}...`);

  try {
    const res = await fetch('/api/switchAudioOnly', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        streamNumber,
        decoderIp: selectedDecoder
      }),
    });

    if (res.ok) {
      setActiveAudio(streamNumber);
      setStatus(`✅ Audio switched to ${streamNumber}`);
    } else {
      const data = await res.json();
      setStatus(`❌ ${data.error || 'Failed to switch audio'}`);
    }
  } catch (err) {
    setStatus(`❌ Network error: ${err.message}`);
  }

  setAudioLoading(null);
};

const CHANNEL_DESCRIPTIONS = {
  1: 'INCTV',
  2: 'NET-25',
  3: 'INC-RADIO',
  4: 'ALLTV',
  5: 'PTV',
  6: 'TV5',
  7: 'GMA-7',
  8: 'RPTV',
  9: 'GTV',
  10: 'IBC-13',
  11: 'A2Z',
  12: 'UNTV',
  13: 'DZRH NEWS TV',
  14: 'DWAN TV',
  15: 'DZMM TELERADYO',
  16: 'SMNI NEWS',
  17: 'BILYONARYO TV',
  18: 'DWIZ NEWS TV',
  19: 'GLOBAL NEWS',
  20: 'MSNBC',
  21: 'AFRICA NEWS',
  22: 'ANC',
  23: 'CNBC WORLD',
  24: 'FOX NEWS',
  25: 'CNN HD',
  26: 'BBC WORLD',
  27: 'NHK WORLD',
  28: 'EURONEWS',
  29: 'AL JAZEERA',
  30: 'RUSSIA TODAY',
  31: 'FRANCE 24 HD',
  32: 'ONE NEWS HD',
  33: 'INFO WARS',
  34: 'CGTN HD',
  35: 'CNA HD',
  36: 'PRESS TV',
  37: 'SKY NEWS',
  38: 'TRT WORLD HD',
  39: 'ARIRANG',
  40: 'REUTERS',
  41: 'BLOOMBERG TV',
  42: 'DW-TV',
  43: 'ABC AUSTRALIA',
  44: 'NEWSMAX',
  45: 'THE FIRST',
  46: 'TICKER NEWS',
  47: 'ABC NEWS LIVE',
  48: 'i24 NEWS',
  49: 'GB NEWS',
  50: 'BEK NEWS',
  51: 'CBSN',
  52: 'NBC NEWS NOW',
  53: 'FOX LIVE NOW',
  54: 'UN WEB TV',
  55: 'OAN',
  56: 'CHEDDAR NEWS',
  57: 'USA TODAY',
  58: 'REAL AMERICAS',
  59: 'CNET',
  60: 'SCRIPPS NEWS',
  61: 'FOX WEATHER',
  62: 'PBS WORLD',
  63: 'FREE SPEECH',
  64: 'NEWSMAX 2',
  65: 'REUTERS TV',
  66: 'TALK TV',
  67: 'CNBC WORLD',
  68: 'CITY NEWS CANADA',
  69: 'FOX BUSINESS PRIME',
  70: 'CBC NEWS',
  71: 'NEWS NATION',
  72: 'RTE NEWS',
  73: 'C-SPAN',
  74: 'C-SPAN 2',
  75: 'TVP WORLD',
  76: 'TVC NEWS',
  77: 'INDIA TODAY',
  78: 'CP24',
  79: 'THE HILL TV',
  80: 'WION',
  81: 'TYT',
  82: 'CAPETOWN TV',
  83: 'SABC NEWS',
  84: 'TAIWAN PLUS',
  85: 'VICE NEWS',
  86: 'SALEM NEWS',
  87: 'BLOOMBERG QUICKTAKE',
  88: 'ASIA ONE NEWS',
  89: 'OCEAN NEWS',
  90: 'DM NEWS',
  91: 'TVRI WORLD',
  92: 'ACCUWEATHER',
  201: 'ANIMAL PLANET',
  202: 'NAT. GEO. USA',
  203: 'NAT. GEO. WILD',
  204: 'BBC EARTH',
  205: 'DISCOVERY ASIA',
  206: 'WILD EARTH',
  207: 'DISCOVERY',
  208: 'SCI',
  209: 'HISTORY',
  210: 'HISTORY 2',
  211: 'HISTORY USA',
  212: 'SCIENTOLOGY NETWORK',
  213: 'HISTORY HIT',
  214: 'UNIDENTIFIED',
  215: 'SPACE SCIENCE TV',
  216: 'COSMIC FRONTIER',
  217: 'SCIENCE TV',
  218: 'ID',
  219: 'SKY NATURE',
  255: 'RT DOCUMENTARY',
  256: 'CGTN DOCUMENTARY',
  257: 'DATELINE',
  258: 'DISCOVERY HISTORY',
  259: 'DISCOVERY FAMILY',
  260: 'TRUE CRIME',
  261: 'LAW & CRIME',
  262: 'COURT TV',
  280: 'AFN',
  281: 'FOOD NETWORK',
  282: 'COOKING PANDA',
  283: 'TASTEMADE',
  284: 'BBC FOOD',
  285: 'GUSTO TV',
  286: 'COOKING CHANNEL',
  300: 'COMEDY CENTRAL',
  301: 'CATCHY COMEDY',
  302: 'COMEDY TV',
  303: 'AFV FAMILY',
  304: 'JUST FOR LAUGHS GAG',
  305: 'LAFF',
  320: 'TRVL',
  321: 'TRAVEL XP',
  322: 'DESTINATION AMERICA',
  323: 'GO2 TRAVEL',
  324: 'GO USA',
  325: 'HD TRAVEL',
  345: 'HBO FAMILY',
  346: 'CARTOON NETWORK',
  347: 'CARTOONITO',
  348: 'NICKTOONS',
  349: 'PBS KIDS',
  350: 'UNIVERSAL KIDS',
  351: 'DISNEY CHANNEL',
  352: 'DISNEY JR',
  353: 'DREAMWORKS',
  354: 'NICK',
  355: 'NICK JR',
  356: 'ZOOMOO',
  357: 'TOM & JERRY',
  358: 'KIDS ZONE',
  359: 'ABC KIDS',
  360: 'KNOWLEDGE CHANNEL',
  361: 'ABC ME',
  362: 'MOONBUG',
  363: 'KIDS FLIX',
  364: 'KIDDO+',
  380: 'NBA PHILS.',
  381: 'PBA RUSH',
  382: 'PREMIER SPORTS',
  383: 'TAP SPORTS',
  384: 'EUROSPORT',
  385: 'ONE SPORTS',
  386: 'SOLAR SPORTS',
  387: 'ESPN',
  388: 'TNT SPORTS',
  389: 'TOPTV',
  390: 'MECH+',
  410: 'RJTV',
  411: 'CHANNEL V',
  412: 'MTV 90S',
  413: 'MTV LIVE',
  414: 'MYX',
  415: 'QELLO CONCERT',
  416: 'CMC',

  450: 'HBO',
  451: 'HBO HITS',
  452: 'TAP ACTION FLIX',
  453: 'CINEMAX',
  454: 'HBO SIGNATURE',
  455: 'CINEMA WORLD',
  456: 'TAP MOVIES',
  457: 'WARNER TV',
  458: 'LOTUS MACAO',
  459: 'TVN MOVIES',
  460: 'HITS MOVIES',
  461: 'HITS',
  462: 'THRILL',
  463: 'PARAMOUNT',
  464: 'MOVIES',
  465: 'TVN',
  466: 'BIBLE MOVIES',
  467: 'HEART MOVIES',
  468: 'PBO',
  469: 'HEART OF ASIA',
  470: 'TMC',
  500: 'TLC',
  501: 'HGTV',
  502: 'BBC LIFESTYLE',
  503: 'LIFETIME ASIA',
  504: 'SYFY',
  505: 'AXN',
  506: 'CI',
  507: 'KIX',
  508: 'TAP TV',
  509: 'TAP EDGE',
  510: 'FIX & FOXI',
  511: 'HLN',
  512: 'ROCK ENT.',
  513: 'ROCK ACTION',
  514: 'FASHION TV',
  515: 'KBS WORLD',
  516: 'INSIGHT',
  517: 'OXYGIN',
  518: 'ION',
  519: 'ION MYSTERY',
  520: 'THE GRIO',
  521: 'TBD',
  522: 'COZI TV',
  523: 'FNX',
  524: 'KPIX+',
  525: 'ME TV BAY AREA',
  526: 'BOUNCE',
  528: 'STORY TV',
  529: 'AWE ENCORE',
  530: 'GRIT',
  531: 'MAGNOLIA NETWORK',
  532: 'LATV',
  533: 'USA NETWORK',
  534: 'FX',
  535: 'TBS',
  536: 'THE NEST',
  537: 'KTVU FOX 2',
  538: 'BLAZE',
  539: 'VICE TV',
  540: 'PBS KQED',
  541: 'PBS KQED+',
  542: 'NBC SNF',
  543: 'BUZZR',
  544: 'LX HOME',
  545: 'KRCB NCPM',
  546: 'ABC LOCALISH',
  547: 'FAVE TV',
  548: 'START TV',
  549: 'DABL',
  550: 'ION+',
  551: 'CREATE',
  552: 'BBC ONE',
  553: 'BBC TWO',
  554: 'BBC THREE',
  555: 'BBC FOUR',
  800: 'KAZAKH TV',
  801: 'FRANCE 24',
  802: 'TV5 MONDE',
  803: 'RAI ITALIA',
  804: 'TVE',
  805: 'TVK CAMBODIA',
  806: 'NHK PREMIUM',
  807: 'RTPI',
  808: 'CCTV 2',
  809: 'VATICAN MEDIA',
  810: 'PHOENIX INFO',
  811: 'PHOENIX HONGKONG',
  812: 'SKAI TV (GREECE)',
  813: 'INPLUS PAKISTAN',
  814: 'QATAR TV',
  815: 'TV TODAY',
  816: 'MUNCHEN TV (GERMAN)',
  817: 'CUBA VISION',
  818: 'DUBAI INTL',
  819: 'YTN',
  820: 'KBS KOREA',
  821: '360 RU (RUSSIA)',
  822: 'TV ASTA (POLAND)',
  850: 'ACQBN',
  851: 'MISSION',
  852: 'TRUTH CHANNEL',
  853: 'LIGHTS TV',
  854: 'TV MARIA',
  855: 'SBN',
  856: 'CTN',
  857: 'EWTN',
  858: 'DAYSTAR',
  859: 'TBN ASIA',
  860: 'ORAS NG HIMALA',

  900: 'CNN JAPAN',
  901: 'BBC WORLD JAPAN',
  902: 'NIKKEI CNBC',
  903: 'TBS NEWS',
  904: 'HISTORY JAPAN',
  905: 'DISCOVERY JAPAN',
  906: 'NAT GEO JAPAN',
  907: 'AXN MYSTERY',
  908: 'AXN JAPAN',
  909: 'FOX JAPAN',
  910: 'TBS 1',
  911: 'TBS 2',
  912: 'FUJI TV ONE',
  913: 'FUJI TV TWO',
  914: 'ENTERMEITELE',
  915: 'HOME DRAMA',
  916: 'SUPER DRAMA',
  917: 'TABI',
  918: 'MOVIE PLUS',
  919: 'NIHON EIGASENMON',
  920: 'JIDAIGEKI SENMON',
  921: 'WOWOW PLUS',
  922: 'THE CINEMA', 
  923: 'NECO',
  924: 'LALA',
  925: 'FAMILY GEKIJOU',
  926: 'J SPORTS 1',
  927: 'SKY A',
  928: 'NITELLE G+',
  929: 'TV ASAHI CH 1',
  930: 'TV ASAHI CH 2',
  931: 'KAYO POPS',
  932: 'SPACE SHOWER TV',
  933: 'MUSIC JAPAN',
  934: 'MTV JAPAN',
  935: 'KEIBA',
  936: 'ANIMAX JAPAN',
  937: 'CARTOON NETWORK JAPAN',
  938: 'KIDS STATION',
  939: 'CHANNEL GINGA',
  940: 'KBS WORLD JAPAN',
  941: 'NHK PREMIUM',
  942: 'DANCE CHANNEL',
  943: 'GAKI NO TSUKAI',
  944: 'SORA OTENKI',
  945: 'JSPORTS 3',
  946: 'NHK G TOKYO',
  947: 'MUSIC AIR',
  948: 'MONDO TV',
  949: 'SHOP TV',
  950: 'QVC',
  951: 'GSTV',
  1000: 'TEMPLE WORSHIP CH. 99',
  1001: 'TEMPLE WORSHIP CH. 250',
  1002: 'PMD TAGALOG WS',
  1003: 'PMD ENGLISH WS',
  1004: 'SPECIAL EVENT CH. 1',
  1005: 'SPECIAL EVENT CH. 2',
  1006: 'SPECIAL EVENT CH. 3',
  1007: 'SPECIAL EVENT CH. 4',
  1011: 'TEMPLO PERIMETER',
  1012: 'TEMPLO & OLD CEM PERIMETER',
  1013: 'CENTRAL VCO PERIMETER',
  1014: 'TEMPLO TOWER A',
  1015: 'CENTRAL PERIMETER GATE 1 & GATE 3',
  1016: 'CENTRAL PERIMETER PMD/HGM',
  1017: 'TIERRA BELLA TO MOTORPOOL EXTN.',
  1018: 'CENTRAL PERIMETER PAVILLION GATE 4',
  1019: 'TEMPLO CCTV',
  1020: 'CENTRAL PERIMETER',
  1021: 'SGM BLDG A',
  1022: 'SGM BLDG B',
  1023: 'SGM BLDG C',
  1024: 'PRIVATE AREA STN. 1',
  1025: 'BRGY. NEW ERA CCTV 1',
  1026: 'BRGY. NEW ERA CCTV 2',
  1027: 'BRGY. NEW ERA CCTV 3',
  1060: 'TEMPLE CENTER TRIBUNA',
  1061: 'TEMPLE LEFT WING',
  1062: 'TEMPLE RIGHT WING',
  1063: 'TEMPLE KAPULUNGAN',
  1064: 'SANCTUARY KAPULUNGAN',
  1065: 'TABERNACLE KAPULUNGAN',
  1066: 'BURLINGAME CCTV',
  1067: 'TORONTO CCTV',
  1068: 'SCARBOROUGH CCTV',
  1069: 'USWO-CCTV1',
  1070: 'USWO-CCTV2',
  1071: 'CALGARY CCTV',
  1072: 'WASHINGTON DC - USEO CCTV',
  1073: 'SAN FRANCISCO CA. CCTV',
  1074: 'PHILADELPHIA CCTV',
  1075: 'MARKHAM GRT CCTV',
  1076: 'JACKSONVILLE FL. CCTV',
  1077: 'HENDERSON NV. CCTV',
  1078: 'EVERETT WA. CCTV',
  1079: 'ANCHORAGE CCTV',
  1080: 'SURREY BC CANADA CCTV',
  1081: 'WASHINGTON DC CCTV',
  1082: 'EL CAJON CCTV',
  1200: 'ANAHEIM CH. 1',
  1201: 'ANAHEIM CH. 2',
  1202: 'BURLINGAME CH. 1',
  1203: 'BURLINGAME CH. 2',
  1204: 'TORONTO CH. 1',
  1205: 'TORONTO CH. 2',
  1206: 'EL CAJON CH. 1',
  1207: 'EL CAJON CH. 2',
  1208: 'ANCHORAGE CH. 1',
  1209: 'ANCHORAGE CH. 2',
  1210: 'JACKSONVILLE CH. 1',
  1211: 'JACKSONVILLE CH. 2',
  1212: 'WASHINGTON DC CH. 1',
  1213: 'WASHINGTON DC CH. 2',
  1214: 'PHILADELPHIA CH. 1',
  1215: 'PHILADELPHIA CH. 2',
  1216: 'EVERETT CH. 1',
  1217: 'EVERETT CH. 2',
  1218: 'HENDERSON NV CH. 1',
  1219: 'HENDERSON NV CH. 2',
  1220: 'SCARBOROUGH CH. 1',
  1221: 'SCARBOROUGH CH. 2',
  1222: 'CALGARY DWTN CH. 1',
  1223: 'CALGARY DWTN CH. 2',
  1224: 'SURREY BC CANADA CH. 1',
  1225: 'SURREY BC CANADA CH. 2',
  1226: 'MARKHAM GRT CH. 1',
  1227: 'MARKHAM GRT CH. 2',
  1228: 'SAN FRANCISCO CA. CH. 1',
  1229: 'SAN FRANCISCO CA. CH. 2',
  1230: 'REDWOOD CITY NWC',
  1231: 'WASHINGTON DC MAIN SANCTUARY',
};


  // News1 Preset
  const handleSendNews1 = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 25},
        {"ip": "10.250.1.132", "channel": 26},
        {"ip": "10.250.1.133", "channel": 27},
        {"ip": "10.250.1.134", "channel": 28},
        {"ip": "10.250.1.135", "channel": 24},
        {"ip": "10.250.1.136", "channel": 29},
        {"ip": "10.250.1.137", "channel": 30},
        {"ip": "10.250.1.138", "channel": 31},
        {"ip": "10.250.1.139", "channel": 33},
        {"ip": "10.250.1.140", "channel": 34},
        {"ip": "10.250.1.141", "channel": 35},
        {"ip": "10.250.1.142", "channel": 36},
        {"ip": "10.250.1.143", "channel": 37},
        {"ip": "10.250.1.144", "channel": 38},
        {"ip": "10.250.1.145", "channel": 23},
        {"ip": "10.250.1.146", "channel": 40}
      ]
    };

    try {
      setStatus("Sending NEWS 1 channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("NEWS 1 channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send NEWS 1: ${err.message}`);
    }
  };

  // NEWS 2 Preset
  const handleSendNews2 = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 2},
        {"ip": "10.250.1.132", "channel": 1},
        {"ip": "10.250.1.133", "channel": 3},
        {"ip": "10.250.1.134", "channel": 5},
        {"ip": "10.250.1.135", "channel": 13},
        {"ip": "10.250.1.136", "channel": 14},
        {"ip": "10.250.1.137", "channel": 15},
        {"ip": "10.250.1.138", "channel": 17},
        {"ip": "10.250.1.139", "channel": 18},
        {"ip": "10.250.1.140", "channel": 19},
        {"ip": "10.250.1.141", "channel": 22},
        {"ip": "10.250.1.142", "channel": 41},
        {"ip": "10.250.1.143", "channel": 20},
        {"ip": "10.250.1.144", "channel": 21},
        {"ip": "10.250.1.145", "channel": 42},
        {"ip": "10.250.1.146", "channel": 43}
      ]
    };

    try {
      setStatus("Sending NEWS 2 channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("NEWS 2 channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send NEWS 2: ${err.message}`);
    }
  };

  // NEWS 3 Preset
  const handleSendNews3 = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 44},
        {"ip": "10.250.1.132", "channel": 45},
        {"ip": "10.250.1.133", "channel": 46},
        {"ip": "10.250.1.134", "channel": 47},
        {"ip": "10.250.1.135", "channel": 48},
        {"ip": "10.250.1.136", "channel": 49},
        {"ip": "10.250.1.137", "channel": 50},
        {"ip": "10.250.1.138", "channel": 51},
        {"ip": "10.250.1.139", "channel": 52},
        {"ip": "10.250.1.140", "channel": 53},
        {"ip": "10.250.1.141", "channel": 54},
        {"ip": "10.250.1.142", "channel": 55},
        {"ip": "10.250.1.143", "channel": 56},
        {"ip": "10.250.1.144", "channel": 57},
        {"ip": "10.250.1.145", "channel": 58},
        {"ip": "10.250.1.146", "channel": 59}
      ]
    };

    try {
      setStatus("Sending NEWS 3 channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("NEWS 3 channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send NEWS 3: ${err.message}`);
    }
  };

  // E-Media Preset
  const handleSendEmedia = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 201},
        {"ip": "10.250.1.132", "channel": 202},
        {"ip": "10.250.1.133", "channel": 203},
        {"ip": "10.250.1.134", "channel": 204},
        {"ip": "10.250.1.135", "channel": 255},
        {"ip": "10.250.1.136", "channel": 256},
        {"ip": "10.250.1.137", "channel": 257},
        {"ip": "10.250.1.138", "channel": 258},
        {"ip": "10.250.1.139", "channel": 300},
        {"ip": "10.250.1.140", "channel": 301},
        {"ip": "10.250.1.141", "channel": 302},
        {"ip": "10.250.1.142", "channel": 303},
        {"ip": "10.250.1.143", "channel": 380},
        {"ip": "10.250.1.144", "channel": 381},
        {"ip": "10.250.1.145", "channel": 382},
        {"ip": "10.250.1.146", "channel": 383}
      ]
    };

    try {
      setStatus("Sending E-media channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("E-media channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send E-media: ${err.message}`);
    }
  };

  // Security Preset
  const handleSendSecurity = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 1011},
        {"ip": "10.250.1.132", "channel": 1012},
        {"ip": "10.250.1.133", "channel": 1013},
        {"ip": "10.250.1.134", "channel": 1014},
        {"ip": "10.250.1.135", "channel": 1015},
        {"ip": "10.250.1.136", "channel": 1016},
        {"ip": "10.250.1.137", "channel": 1017},
        {"ip": "10.250.1.138", "channel": 1018},
        {"ip": "10.250.1.139", "channel": 1020},
        {"ip": "10.250.1.140", "channel": 1024},
        {"ip": "10.250.1.141", "channel": 1061},
        {"ip": "10.250.1.142", "channel": 1062},
        {"ip": "10.250.1.143", "channel": 1060},
        {"ip": "10.250.1.144", "channel": 1063},
        {"ip": "10.250.1.145", "channel": 1064},
        {"ip": "10.250.1.146", "channel": 1065}
      ]
    };

    try {
      setStatus("Sending Security channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("Security channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send E-media: ${err.message}`);
    }
  };

  // WSM 1 Preset
  const handleSendWSM1 = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 1200},
        {"ip": "10.250.1.132", "channel": 1202},
        {"ip": "10.250.1.133", "channel": 1204},
        {"ip": "10.250.1.134", "channel": 1206},
        {"ip": "10.250.1.135", "channel": 1208},
        {"ip": "10.250.1.136", "channel": 1210},
        {"ip": "10.250.1.137", "channel": 1212},
        {"ip": "10.250.1.138", "channel": 1214},
        {"ip": "10.250.1.139", "channel": 1216},
        {"ip": "10.250.1.140", "channel": 1218},
        {"ip": "10.250.1.141", "channel": 1220},
        {"ip": "10.250.1.142", "channel": 1222},
        {"ip": "10.250.1.143", "channel": 1224},
        {"ip": "10.250.1.144", "channel": 1226},
        {"ip": "10.250.1.145", "channel": 1228},
        {"ip": "10.250.1.146", "channel": 1230}
      ]
    };

    try {
      setStatus("Sending WSM 1 channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("WSM 1 channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send WSM 1: ${err.message}`);
    }
  };
  
   // WSM 2 Preset
  const handleSendWSM2 = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 1201},
        {"ip": "10.250.1.132", "channel": 1203},
        {"ip": "10.250.1.133", "channel": 1205},
        {"ip": "10.250.1.134", "channel": 1207},
        {"ip": "10.250.1.135", "channel": 1209},
        {"ip": "10.250.1.136", "channel": 1211},
        {"ip": "10.250.1.137", "channel": 1213},
        {"ip": "10.250.1.138", "channel": 1215},
        {"ip": "10.250.1.139", "channel": 1217},
        {"ip": "10.250.1.140", "channel": 1219},
        {"ip": "10.250.1.141", "channel": 1221},
        {"ip": "10.250.1.142", "channel": 1223},
        {"ip": "10.250.1.143", "channel": 1225},
        {"ip": "10.250.1.144", "channel": 1227},
        {"ip": "10.250.1.145", "channel": 1229},
        {"ip": "10.250.1.146", "channel": 1231}
      ]
    };

    try {
      setStatus("Sending WSM 2 channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("WSM 2 channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send WSM 2: ${err.message}`);
    }
  };
 
   // WSM 3 Preset
  const handleSendWSM3 = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 1066},
        {"ip": "10.250.1.132", "channel": 1067},
        {"ip": "10.250.1.133", "channel": 1068},
        {"ip": "10.250.1.134", "channel": 1069},
        {"ip": "10.250.1.135", "channel": 1071},
        {"ip": "10.250.1.136", "channel": 1072},
        {"ip": "10.250.1.137", "channel": 1073},
        {"ip": "10.250.1.138", "channel": 1074},
        {"ip": "10.250.1.139", "channel": 1075},
        {"ip": "10.250.1.140", "channel": 1076},
        {"ip": "10.250.1.141", "channel": 1077},
        {"ip": "10.250.1.142", "channel": 1078},
        {"ip": "10.250.1.143", "channel": 1079},
        {"ip": "10.250.1.144", "channel": 1080},
        {"ip": "10.250.1.145", "channel": 1081},
        {"ip": "10.250.1.146", "channel": 1082}
      ]
    };

    try {
      setStatus("Sending WSM 2 channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("WSM 2 channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send WSM 2: ${err.message}`);
    }
  };

   // Movies Preset
  const handleSendMovies = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 450},
        {"ip": "10.250.1.132", "channel": 451},
        {"ip": "10.250.1.133", "channel": 452},
        {"ip": "10.250.1.134", "channel": 453},
        {"ip": "10.250.1.135", "channel": 454},
        {"ip": "10.250.1.136", "channel": 455},
        {"ip": "10.250.1.137", "channel": 456},
        {"ip": "10.250.1.138", "channel": 457},
        {"ip": "10.250.1.139", "channel": 458},
        {"ip": "10.250.1.140", "channel": 459},
        {"ip": "10.250.1.141", "channel": 460},
        {"ip": "10.250.1.142", "channel": 461},
        {"ip": "10.250.1.143", "channel": 462},
        {"ip": "10.250.1.144", "channel": 463},
        {"ip": "10.250.1.145", "channel": 464},
        {"ip": "10.250.1.146", "channel": 465}
      ]
    };

    try {
      setStatus("Sending Movies channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("Movies channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send Movies: ${err.message}`);
    }
  };

   // Kids Preset
  const handleSendKids = async () => {
    const payload = {
      "channels": [
        {"ip": "10.250.1.131", "channel": 345},
        {"ip": "10.250.1.132", "channel": 346},
        {"ip": "10.250.1.133", "channel": 347},
        {"ip": "10.250.1.134", "channel": 348},
        {"ip": "10.250.1.135", "channel": 349},
        {"ip": "10.250.1.136", "channel": 350},
        {"ip": "10.250.1.137", "channel": 351},
        {"ip": "10.250.1.138", "channel": 352},
        {"ip": "10.250.1.139", "channel": 353},
        {"ip": "10.250.1.140", "channel": 354},
        {"ip": "10.250.1.141", "channel": 355},
        {"ip": "10.250.1.142", "channel": 356},
        {"ip": "10.250.1.143", "channel": 357},
        {"ip": "10.250.1.144", "channel": 358},
        {"ip": "10.250.1.145", "channel": 359},
        {"ip": "10.250.1.146", "channel": 360}
      ]
    };

    try {
      setStatus("Sending Kids channel preset...");

      const res = await fetch(`${backend2Url}/send-channels`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Request failed");
      }

      setStatus("Kids channels sent successfully.");
    } catch (err) {
      setStatus(`Failed to send Kids: ${err.message}`);
    }
  };

  /* ✅ HANDLER FOR IPTV CHANNEL UPDATE */
  const handleUpdateIptvChannel = async () => {
    setUpdateLoading(true);
    setUpdateStatus('🔄 Updating IPTV channel...');

    try {
      const res = await fetch(`${backend2Url}/send-channels`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: [
            {
              ip: updateIptvIp,
              channel: Number(updateChannel),
            },
          ],
        }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || 'Request failed');
      }

      setUpdateStatus(`✅ IPTV (${updateIptvIp}) updated to channel ${updateChannel}`);
    } catch (err) {
      setUpdateStatus(`❌ Failed: ${err.message}`);
    } finally {
      setUpdateLoading(false);
    }
  };

  const formattedTime = currentTime.toLocaleTimeString();
  const formattedDate = currentTime.toLocaleDateString();

  const customLabels = {
    117: '1F DEVICE 1',
    118: 'NVIDIA SHIELD TV',
    119: 'CHROMECAST',
    120: 'APPLE TV',
    121: '1F PC',
    122: 'CCTV 2',
    123: 'CCTV',
    124: 'FIRE TV',
    125: 'CCTV 3B',
    126: 'RADIO PC',
    127: 'HIMAWARI 1',
    128: 'IPTV 17 (SINGLE)',
    129: '1F DEVICE 2',
    130: 'CCTV 3',
    132: 'HIMAWARI 2',
    136: 'MULTIVIEW 1',
    137: 'MULTIVIEW 2',
    138: 'MULTIVIEW 3',
    139: 'MULTIVIEW 4',
    140: 'MULTIVIEW 5',
    161: 'RADIO 1',
    162: 'RADIO 2',
    163: 'RADIO 3',
    164: 'RADIO 4',
    165: 'RADIO 5',
    166: 'CCTV 7 AXIS',
    167: 'CCTV 8',
    168: 'KALEIDESCAPE',
    169: 'CCTV 5',
    170: 'CCTV 6',
    171: 'MAG IPTV',
  };

  return (
    <div className="min-h-screen bg-base-100 flex" data-theme="dark">
      <SidebarNavigation sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />

      <div className="flex-1 p-6 md:p-10 overflow-x-auto">
        <div className="flex justify-between items-center mb-10">
          <h1 className="text-3xl font-bold text-primary">🖥️ CC AMX System</h1>
          <div className="flex flex-wrap gap-4 items-center text-sm font-mono text-base-content/70">
            {/* <button
              className={`inline-flex items-center gap-2 px-3 py-1 rounded-md font-semibold ${
                amxOnline ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
              } text-white`}
              onClick={() => setAmxOnline(!amxOnline)}
            >
              <span className={`w-3 h-3 rounded-full ${amxOnline ? 'bg-green-300' : 'bg-red-300'}`} />
              <span>{amxOnline ? 'Online' : 'Offline'}</span>
            </button>
            <div className="text-accent">
              <span className="font-semibold">Weather:</span> {weather.temperature} | {weather.forecast}
            </div> */}
            <div className="text-right">
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
        </div>

        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-[60%_40%] gap-10">
          <div className="space-y-8">
            <div className="w-full aspect-video bg-black rounded-lg relative border border-base-content/30 shadow-md overflow-hidden">
              <iframe
                src="http://172.18.61.53:1984/stream.html?src=cam1"
                className="w-full h-full rounded-lg"
                scrolling="no"
                allow="autoplay; fullscreen; camera; microphone"
                allowFullScreen
              />
            </div>

            {/* Video Routing Control Section */}    
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
                    <option value="172.18.90.186">DEC - Web Player</option>
                    <option value="172.18.92.188" disabled>DEC - Staging Decoder</option>
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
                    {Array.from({ length: 71 }, (_, i) => {
                      const streamNumber = 101 + i;
                      const excludedStreams = [
                        131, 133, 134, 135,
                        141, 142, 143, 144, 145, 146, 147, 148, 149, 150,
                        151, 152, 153, 154, 155, 156, 157, 158, 159, 160
                      ];

                      if (excludedStreams.includes(streamNumber)) return null;

                      const label = customLabels[streamNumber] || `IPTV ${i + 1}`;
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
            {/* End of Video Routing Control Section */}
          </div>

          <div className="max-h-[660px] overflow-y-auto space-y-4">

            {/* Audio Select Section */}
            <div className="card bg-base-200 shadow-md">
              <div className="card-body">
                <h2 className="text-lg font-semibold text-accent mb-4">
                  AUDIO SELECT
                </h2>

                <div className="grid grid-cols-4 gap-3">
                  {audioMap.map((streamNumber, index) => {
                    const buttonIndex = index + 1;

                    return (
                      <button
                        key={buttonIndex}
                        onClick={() => handleAudioSelect(streamNumber)}
                        disabled={audioLoading !== null}
                        className={`btn btn-sm 
                          ${activeAudio === streamNumber ? 'btn-success' : 'btn-info'}
                          ${audioLoading === streamNumber ? 'loading' : ''}
                        `}
                      >
                        {buttonIndex}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Channel Presets Section */}
            <div className="card bg-base-200 shadow-md">
              <div className="card-body">
                <h2 className="text-lg font-semibold text-accent mb-4">
                  CHANNEL PRESETS
                </h2>

                <div className="grid grid-cols-3 gap-3">
                  <button className="btn btn-sm btn-info" onClick={handleSendNews1}>NEWS 1</button>
                  <button className="btn btn-sm btn-success" onClick={handleSendNews2}>NEWS 2</button>
                  <button className="btn btn-sm btn-warning" onClick={handleSendNews3}>NEWS 3</button>

                  <button className="btn btn-sm btn-info" onClick={handleSendEmedia}>E-MEDIA</button>
                  <button className="btn btn-sm btn-success" onClick={handleSendSecurity}>SECURITY</button>
                  <button className="btn btn-sm btn-warning" onClick={handleSendWSM1}>WSM 1</button>

                  <button className="btn btn-sm btn-info" onClick={handleSendWSM2}>WSM 2</button>
                  <button className="btn btn-sm btn-success" onClick={handleSendWSM3}>WSM 3</button>
                  <button className="btn btn-sm btn-warning" onClick={handleSendMovies}>MOVIES</button>
                  <button className="btn btn-sm btn-info" onClick={handleSendKids}>KIDS</button>
                </div>
              </div>
            </div>
            <div className="card bg-base-200 shadow-md">
              <div className="card-body space-y-4">
                <h2 className="text-lg font-semibold text-accent">
                  IPTV CHANNEL CONTROL
                </h2>

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
                    {Array.from({ length: 17 }, (_, i) => {
                      const iptvNumber = i + 1;
                      const ip = `10.250.1.${131 + i}`;
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
                    {Array.from({ length: 1231 }, (_, i) => {
                      const channelNumber = i + 1;
                      const desc = CHANNEL_DESCRIPTIONS[channelNumber] || 'BLANK';
                      return (
                        <option key={channelNumber} value={channelNumber}>
                          Channel {channelNumber} - {desc}
                        </option>
                      );
                    })}
                  </select>
                </div>

                {/* Update Button */}
                <div className="card-actions mt-4">
                  <button
                    className="btn btn-primary w-full"
                    onClick={handleUpdateIptvChannel}
                    disabled={updateLoading}
                  >
                    {updateLoading ? 'Updating...' : 'Update Channel'}
                  </button>
                </div>

                {updateStatus && (
                  <div className="alert alert-info text-sm break-words">
                    <span>{updateStatus}</span>
                  </div>
                )}
              </div>
            </div>
            {/* IPTV Reboot Section */}
            {Array.from({ length: 17 }, (_, i) => {
              const streamNumber = 101 + i;
              const iptvNumber = i + 1;

              // Override streamNumber 117 to show as IPTV 17
              const label = streamNumber === 117 ? 'IPTV 17' : (customLabels[streamNumber] || `IPTV ${iptvNumber}`);

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
