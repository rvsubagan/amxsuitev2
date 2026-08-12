'use client';
import React, { useEffect, useRef } from 'react';
import Hls from 'hls.js';

export default function Player({ url }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let hls;

    if (Hls.isSupported()) {
      hls = new Hls();
      hls.loadSource(url);
      hls.attachMedia(videoRef.current);
    } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
      videoRef.current.src = url;
    }

    return () => {
      if (hls) hls.destroy();
    };
  }, [url]);

  return (
    <video
      ref={videoRef}
      controls
      autoPlay
      muted
      className="rounded-lg w-full max-h-[480px]"
    />
  );
}
