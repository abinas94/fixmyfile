"use client";

import { useState, useEffect } from "react";
import { Clock, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function TimestampConverter() {
  const [timestamp, setTimestamp] = useState("");
  const [dateStr, setDateStr] = useState("");
  const [now, setNow] = useState(Math.floor(Date.now() / 1000));
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => setNow(Math.floor(Date.now() / 1000)), 1000);
    return () => clearInterval(interval);
  }, []);

  const timestampToDate = () => {
    const ts = Number(timestamp);
    if (isNaN(ts)) return;
    // Auto-detect seconds vs milliseconds
    const ms = ts > 9999999999 ? ts : ts * 1000;
    const d = new Date(ms);
    setDateStr(d.toISOString());
  };

  const dateToTimestamp = () => {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return;
    setTimestamp(String(Math.floor(d.getTime() / 1000)));
  };

  const copy = (text: string, id: string) => {
    navigator.clipboard.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const currentDate = new Date(now * 1000);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-lg">
            <Clock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Timestamp Converter</h1>
            <p className="text-[var(--muted-foreground)]">Convert Unix timestamps to dates and vice versa</p>
          </div>
        </div>
      </div>

      {/* Current Time */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-6 text-center">
        <p className="text-xs text-[var(--muted-foreground)] mb-1">Current Unix Timestamp</p>
        <div className="flex items-center justify-center gap-2">
          <p className="text-3xl font-mono font-bold text-[var(--primary)]">{now}</p>
          <button onClick={() => copy(String(now), "now")} className="p-1.5 rounded-lg hover:bg-[var(--accent)]">
            {copied === "now" ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--muted-foreground)]" />}
          </button>
        </div>
        <p className="text-sm text-[var(--muted-foreground)] mt-1">
          {currentDate.toLocaleString()} ({Intl.DateTimeFormat().resolvedOptions().timeZone})
        </p>
      </div>

      {/* Converters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Timestamp → Date */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h3 className="text-sm font-semibold mb-3">Timestamp → Date</h3>
          <input
            type="text"
            value={timestamp}
            onChange={(e) => setTimestamp(e.target.value)}
            placeholder="e.g. 1720000000"
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm font-mono mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <button onClick={timestampToDate} className="w-full py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">
            Convert to Date
          </button>
        </div>

        {/* Date → Timestamp */}
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <h3 className="text-sm font-semibold mb-3">Date → Timestamp</h3>
          <input
            type="datetime-local"
            value={dateStr ? dateStr.slice(0, 16) : ""}
            onChange={(e) => setDateStr(e.target.value)}
            className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <button onClick={dateToTimestamp} className="w-full py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">
            Convert to Timestamp
          </button>
        </div>
      </div>

      {/* Result */}
      {dateStr && timestamp && (
        <div className="mt-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Unix (seconds):</span>
              <p className="font-mono font-medium">{timestamp}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Unix (milliseconds):</span>
              <p className="font-mono font-medium">{Number(timestamp) * 1000}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">ISO 8601:</span>
              <p className="font-mono font-medium">{new Date(Number(timestamp) * 1000).toISOString()}</p>
            </div>
            <div>
              <span className="text-xs text-[var(--muted-foreground)]">Local:</span>
              <p className="font-mono font-medium">{new Date(Number(timestamp) * 1000).toLocaleString()}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
