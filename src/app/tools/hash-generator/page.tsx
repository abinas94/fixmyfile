"use client";

import { useState } from "react";
import { ShieldCheck, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

async function hash(text: string, algorithm: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

export default function HashGenerator() {
  const [input, setInput] = useState("");
  const [hashes, setHashes] = useState<{ name: string; value: string }[]>([]);
  const [copied, setCopied] = useState<string | null>(null);

  const generateHashes = async () => {
    if (!input) return;
    const results = await Promise.all([
      hash(input, "SHA-1").then((v) => ({ name: "SHA-1", value: v })),
      hash(input, "SHA-256").then((v) => ({ name: "SHA-256", value: v })),
      hash(input, "SHA-384").then((v) => ({ name: "SHA-384", value: v })),
      hash(input, "SHA-512").then((v) => ({ name: "SHA-512", value: v })),
    ]);
    setHashes(results);
  };

  const copyHash = (value: string, name: string) => {
    navigator.clipboard.writeText(value);
    setCopied(name);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-800 flex items-center justify-center shadow-lg">
            <ShieldCheck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Hash Generator</h1>
            <p className="text-[var(--muted-foreground)]">Generate SHA-1, SHA-256, SHA-384, SHA-512 hashes</p>
          </div>
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Enter text to hash..."
        className="w-full h-32 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] mb-4"
      />

      <div className="flex justify-center mb-6">
        <button onClick={generateHashes} disabled={!input} className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 disabled:opacity-50">
          Generate Hashes
        </button>
      </div>

      {hashes.length > 0 && (
        <div className="space-y-3">
          {hashes.map((h) => (
            <div key={h.name} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-semibold text-[var(--primary)]">{h.name}</span>
                <button onClick={() => copyHash(h.value, h.name)} className="p-1 rounded hover:bg-[var(--accent)]">
                  {copied === h.name ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5 text-[var(--muted-foreground)]" />}
                </button>
              </div>
              <p className="text-xs font-mono break-all text-[var(--muted-foreground)]">{h.value}</p>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8 p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          Hashes are computed locally using the Web Crypto API. Your text is never sent to any server.
        </p>
      </div>
    </div>
  );
}
