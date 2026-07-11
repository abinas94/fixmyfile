"use client";

import { useState, useEffect } from "react";
import { Globe, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

interface IPInfo {
  ip: string;
  city?: string;
  region?: string;
  country?: string;
  loc?: string;
  org?: string;
  timezone?: string;
  postal?: string;
}

export default function IPLookup() {
  const [ipInfo, setIpInfo] = useState<IPInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch("https://ipinfo.io/json")
      .then((r) => r.json())
      .then((data) => {
        setIpInfo(data);
        setLoading(false);
      })
      .catch(() => {
        // Fallback
        fetch("https://api.ipify.org?format=json")
          .then((r) => r.json())
          .then((data) => {
            setIpInfo({ ip: data.ip });
            setLoading(false);
          })
          .catch(() => setLoading(false));
      });
  }, []);

  const copyIP = () => {
    if (ipInfo?.ip) {
      navigator.clipboard.writeText(ipInfo.ip);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">What&apos;s My IP</h1>
            <p className="text-[var(--muted-foreground)]">View your public IP address and network information</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : ipInfo ? (
        <div className="space-y-4">
          {/* IP Address - Hero */}
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-center">
            <p className="text-xs text-[var(--muted-foreground)] mb-2">Your Public IP Address</p>
            <div className="flex items-center justify-center gap-3">
              <p className="text-3xl sm:text-4xl font-mono font-bold text-[var(--primary)]">{ipInfo.ip}</p>
              <button onClick={copyIP} className="p-2 rounded-lg hover:bg-[var(--accent)]">
                {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5 text-[var(--muted-foreground)]" />}
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { label: "City", value: ipInfo.city },
              { label: "Region", value: ipInfo.region },
              { label: "Country", value: ipInfo.country },
              { label: "Postal Code", value: ipInfo.postal },
              { label: "Location", value: ipInfo.loc },
              { label: "Timezone", value: ipInfo.timezone },
              { label: "ISP / Organization", value: ipInfo.org },
            ]
              .filter((item) => item.value)
              .map((item) => (
                <div key={item.label} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
                  <p className="text-xs text-[var(--muted-foreground)]">{item.label}</p>
                  <p className="text-sm font-medium mt-0.5">{item.value}</p>
                </div>
              ))}
          </div>

          {/* Screen/Browser Info */}
          <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
            <p className="text-xs font-medium mb-2">Browser & Device Info</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div><span className="text-[var(--muted-foreground)]">Screen:</span> {typeof window !== "undefined" ? `${screen.width}×${screen.height}` : ""}</div>
              <div><span className="text-[var(--muted-foreground)]">Window:</span> {typeof window !== "undefined" ? `${window.innerWidth}×${window.innerHeight}` : ""}</div>
              <div><span className="text-[var(--muted-foreground)]">Language:</span> {typeof navigator !== "undefined" ? navigator.language : ""}</div>
              <div><span className="text-[var(--muted-foreground)]">Platform:</span> {typeof navigator !== "undefined" ? navigator.platform : ""}</div>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-center text-[var(--muted-foreground)]">Unable to fetch IP information.</p>
      )}
    </div>
  );
}
