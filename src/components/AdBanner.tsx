"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  type: "leaderboard" | "rectangle" | "standard" | "mobile";
}

const adConfig = {
  leaderboard: { key: "76fc21356c3065a8af9968db3469e2a5", width: 728, height: 90 },
  rectangle: { key: "25abf8a8c4555602ed9321929110409a", width: 300, height: 250 },
  standard: { key: "cd6d3c92109acde2d973db4e2cf9a0d9", width: 468, height: 60 },
  mobile: { key: "8fb3a6faec3ab3f5c132341710d329da", width: 320, height: 50 },
};

export default function AdBanner({ type }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !adRef.current) return;
    loaded.current = true;

    const config = adConfig[type];
    const container = adRef.current;

    const optScript = document.createElement("script");
    optScript.textContent = `atOptions = { 'key': '${config.key}', 'format': 'iframe', 'height': ${config.height}, 'width': ${config.width}, 'params': {} };`;
    container.appendChild(optScript);

    const adScript = document.createElement("script");
    adScript.src = `https://www.highperformanceformat.com/${config.key}/invoke.js`;
    adScript.async = true;
    container.appendChild(adScript);
  }, [type]);

  return (
    <div
      ref={adRef}
      className="flex justify-center my-4 overflow-hidden"
      style={{ minHeight: adConfig[type].height, maxWidth: adConfig[type].width, margin: "0 auto" }}
    />
  );
}
