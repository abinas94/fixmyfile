"use client";

import { useState, useEffect } from "react";
import { Download, X } from "lucide-react";

export default function InstallBanner() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showBanner, setShowBanner] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    // Check if already dismissed this session
    if (sessionStorage.getItem("pwa-dismissed")) return;

    // Check if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setShowBanner(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // Fallback: show banner after 3 seconds even without the event (for iOS/unsupported)
    const timeout = setTimeout(() => {
      if (!deferredPrompt) {
        // Check if iOS
        const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
        if (isIOS) setShowBanner(true);
      }
    }, 3000);

    return () => {
      window.removeEventListener("beforeinstallprompt", handler);
      clearTimeout(timeout);
    };
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const result = await deferredPrompt.userChoice;
      if (result.outcome === "accepted") {
        setShowBanner(false);
      }
      setDeferredPrompt(null);
    } else {
      // iOS or browser that doesn't support beforeinstallprompt
      alert("To install:\n\n• Android Chrome: Tap ⋮ menu → 'Install app'\n• iPhone Safari: Tap Share → 'Add to Home Screen'\n• Desktop Chrome: Click ⊕ in address bar");
    }
  };

  const handleDismiss = () => {
    setShowBanner(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-dismissed", "1");
  };

  if (!showBanner || dismissed) return null;

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 animate-[slideUp_0.3s_ease-out] sm:left-auto sm:right-4 sm:max-w-sm">
      <div className="flex items-center gap-3 p-4 rounded-2xl bg-[var(--card)] border border-[var(--border)] shadow-2xl shadow-black/10">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center flex-shrink-0">
          <Download className="w-5 h-5 text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold">Install FixMyFile</p>
          <p className="text-xs text-[var(--muted-foreground)]">Use as app — works offline, no browser bar</p>
        </div>
        <button onClick={handleInstall}
          className="px-3 py-1.5 rounded-lg bg-[var(--primary)] text-white text-xs font-semibold hover:opacity-90 flex-shrink-0">
          Install
        </button>
        <button onClick={handleDismiss} className="p-1 text-[var(--muted-foreground)] hover:text-[var(--foreground)]">
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}
