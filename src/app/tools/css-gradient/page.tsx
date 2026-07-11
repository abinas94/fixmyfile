"use client";

import { useState } from "react";
import { Paintbrush, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function CSSGradient() {
  const [color1, setColor1] = useState("#6366f1");
  const [color2, setColor2] = useState("#ec4899");
  const [angle, setAngle] = useState(135);
  const [type, setType] = useState<"linear" | "radial">("linear");
  const [copied, setCopied] = useState(false);

  const gradientCSS = type === "linear"
    ? `linear-gradient(${angle}deg, ${color1}, ${color2})`
    : `radial-gradient(circle, ${color1}, ${color2})`;

  const fullCSS = `background: ${gradientCSS};`;

  const copyCSS = () => {
    navigator.clipboard.writeText(fullCSS);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const presets = [
    { c1: "#667eea", c2: "#764ba2", name: "Purple" },
    { c1: "#f97316", c2: "#ef4444", name: "Sunset" },
    { c1: "#06b6d4", c2: "#3b82f6", name: "Ocean" },
    { c1: "#10b981", c2: "#059669", name: "Green" },
    { c1: "#f43f5e", c2: "#ec4899", name: "Rose" },
    { c1: "#1e293b", c2: "#475569", name: "Slate" },
    { c1: "#fbbf24", c2: "#f97316", name: "Amber" },
    { c1: "#8b5cf6", c2: "#06b6d4", name: "Vibrant" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-500 to-violet-600 flex items-center justify-center shadow-lg">
            <Paintbrush className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">CSS Gradient Generator</h1>
            <p className="text-[var(--muted-foreground)]">Create beautiful CSS gradients with live preview</p>
          </div>
        </div>
      </div>

      {/* Preview */}
      <div className="w-full h-48 sm:h-64 rounded-2xl shadow-xl mb-6" style={{ background: gradientCSS }} />

      {/* Controls */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-xs font-medium mb-1 block">Type</label>
            <div className="flex gap-2">
              <button onClick={() => setType("linear")} className={`px-4 py-2 rounded-lg text-sm font-medium ${type === "linear" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>Linear</button>
              <button onClick={() => setType("radial")} className={`px-4 py-2 rounded-lg text-sm font-medium ${type === "radial" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>Radial</button>
            </div>
          </div>
          {type === "linear" && (
            <div>
              <label className="text-xs font-medium mb-1 block">Angle: {angle}°</label>
              <input
                type="range"
                min={0}
                max={360}
                value={angle}
                onChange={(e) => setAngle(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
            </div>
          )}
          <div>
            <label className="text-xs font-medium mb-1 block">Color 1</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
              <input type="text" value={color1} onChange={(e) => setColor1(e.target.value)} className="w-24 px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-mono" />
            </div>
          </div>
          <div>
            <label className="text-xs font-medium mb-1 block">Color 2</label>
            <div className="flex items-center gap-2">
              <input type="color" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-8 h-8 rounded cursor-pointer border-0" />
              <input type="text" value={color2} onChange={(e) => setColor2(e.target.value)} className="w-24 px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-xs font-mono" />
            </div>
          </div>
        </div>
      </div>

      {/* Presets */}
      <div className="mb-6">
        <p className="text-xs font-medium mb-2">Presets</p>
        <div className="flex flex-wrap gap-2">
          {presets.map((p, idx) => (
            <button
              key={idx}
              onClick={() => { setColor1(p.c1); setColor2(p.c2); }}
              className="w-10 h-10 rounded-lg shadow-md hover:scale-110 active:scale-95 transition-all"
              style={{ background: `linear-gradient(135deg, ${p.c1}, ${p.c2})` }}
              title={p.name}
            />
          ))}
        </div>
      </div>

      {/* CSS Output */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)] relative">
        <button onClick={copyCSS} className="absolute top-3 right-3 p-2 rounded-lg hover:bg-[var(--accent)]">
          {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
        </button>
        <p className="text-xs font-medium mb-2">CSS Code</p>
        <code className="text-sm font-mono block">{fullCSS}</code>
      </div>
    </div>
  );
}
