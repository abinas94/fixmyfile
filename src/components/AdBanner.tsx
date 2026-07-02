"use client";

import { useEffect, useRef } from "react";

interface AdBannerProps {
  type: "leaderboard" | "rectangle" | "mobile" | "native";
}

export default function AdBanner({ type }: AdBannerProps) {
  const adRef = useRef<HTMLDivElement>(null);
  const loaded = useRef(false);

  useEffect(() => {
    if (loaded.current || !adRef.current) return;
    loaded.current = true;

    let key = "";
    let height = 0;
    let width = 0;

    switch (type) {
      case "leaderboard": // 728x90 - top/bottom of pages (desktop)
        key = "76fc21356c3065a8af9968db3469e2a5";
        height = 90; width = 728;
        break;
      case "rectangle": // 300x250 - sidebar/between content
        key = "25abf8a8c4555602ed9321929110409a";
        height = 250; width = 300;
        break;
      case "mobile": // 320x50 - mobile banner
        key = "8fb3a6faec3ab3f5c132341710d329da";
        height = 50; width = 320;
        break;
      case "native": // native ad
        key = "cd6d3c92109acde2d973db4e2cf9a0d9";
        height = 60; width = 468;
        break;
    }

    const container = adRef.current;

    // Set options
    const optScript = document.createElement("script");
    optScript.textContent = `atOptions = { 'key': '${key}', 'format': 'iframe', 'height': ${height}, 'width': ${width}, 'params': {} };`;
    container.appendChild(optScript);

    // Load ad
    const adScript = document.createElement("script");
    adScript.src = `https://www.highperformanceformat.com/${key}/invoke.js`;
    adScript.async = true;
    container.appendChild(adScript);
  }, [type]);

  return (
    <div ref={adRef} className="flex justify-center my-4 overflow-hidden" />
  );
}
