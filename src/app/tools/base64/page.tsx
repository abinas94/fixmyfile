"use client";

import { useState } from "react";
import { Binary, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function Base64Tool() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [mode, setMode] = useState<"encode" | "decode">("encode");
  const [copied, setCopied] = useState(false);

  const process = () => {
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(input))));
      } else {
        setOutput(decodeURIComponent(escape(atob(input))));
      }
    } catch {
      setOutput("Error: Invalid input for " + mode + " operation");
    }
  };

  const handleInputChange = (val: string) => {
    setInput(val);
    // Auto-process
    try {
      if (mode === "encode") {
        setOutput(btoa(unescape(encodeURIComponent(val))));
      } else {
        setOutput(decodeURIComponent(escape(atob(val))));
      }
    } catch {
      setOutput("");
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-600 to-gray-800 flex items-center justify-center shadow-lg">
            <Binary className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Base64 Encode/Decode</h1>
            <p className="text-[var(--muted-foreground)]">Encode or decode Base64 strings</p>
          </div>
        </div>
      </div>

      <div className="flex gap-2 mb-4">
        <button onClick={() => { setMode("encode"); setInput(""); setOutput(""); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${mode === "encode" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
          Encode
        </button>
        <button onClick={() => { setMode("decode"); setInput(""); setOutput(""); }}
          className={`px-4 py-2 rounded-xl text-sm font-medium ${mode === "decode" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
          Decode
        </button>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">{mode === "encode" ? "Plain Text" : "Base64 String"}</label>
          <textarea value={input} onChange={(e) => handleInputChange(e.target.value)} rows={6}
            placeholder={mode === "encode" ? "Enter text to encode..." : "Paste Base64 to decode..."}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y" />
        </div>

        <button onClick={process} className="px-6 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">
          {mode === "encode" ? "Encode →" : "Decode →"}
        </button>

        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">{mode === "encode" ? "Base64 Output" : "Decoded Text"}</label>
            {output && (
              <button onClick={copyOutput} className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea value={output} readOnly rows={6}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm font-mono resize-y" />
        </div>
      </div>
    </div>
  );
}
