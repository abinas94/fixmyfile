"use client";

import { useState } from "react";
import { Palette, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function ColorPicker() {
  const [color, setColor] = useState("#6366f1");
  const [copied, setCopied] = useState<string | null>(null);

  const hexToRgb = (hex: string) => {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? { r: parseInt(result[1], 16), g: parseInt(result[2], 16), b: parseInt(result[3], 16) } : { r: 0, g: 0, b: 0 };
  };

  const rgbToHsl = (r: number, g: number, b: number) => {
    r /= 255; g /= 255; b /= 255;
    const max = Math.max(r, g, b), min = Math.min(r, g, b);
    let h = 0, s = 0;
    const l = (max + min) / 2;
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      switch (max) {
        case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
        case g: h = ((b - r) / d + 2) / 6; break;
        case b: h = ((r - g) / d + 4) / 6; break;
      }
    }
    return { h: Math.round(h * 360), s: Math.round(s * 100), l: Math.round(l * 100) };
  };

  const rgb = hexToRgb(color);
  const hsl = rgbToHsl(rgb.r, rgb.g, rgb.b);

  const formats = [
    { label: "HEX", value: color.toUpperCase() },
    { label: "RGB", value: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})` },
    { label: "HSL", value: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)` },
    { label: "CSS var", value: `--color: ${color};` },
    { label: "Tailwind", value: `[${color}]` },
  ];

  const copyValue = (val: string) => {
    navigator.clipboard.writeText(val);
    setCopied(val);
    setTimeout(() => setCopied(null), 1500);
  };

  // Generate shades
  const shades = Array.from({ length: 9 }, (_, i) => {
    const factor = (i + 1) / 10;
    const r = Math.round(rgb.r * factor);
    const g = Math.round(rgb.g * factor);
    const b = Math.round(rgb.b * factor);
    return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
  });

  // Generate complementary palette
  const complementary = `#${(255 - rgb.r).toString(16).padStart(2, "0")}${(255 - rgb.g).toString(16).padStart(2, "0")}${(255 - rgb.b).toString(16).padStart(2, "0")}`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-pink-500 flex items-center justify-center shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Color Picker</h1>
            <p className="text-[var(--muted-foreground)]">Pick colors, convert formats, generate palettes</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Picker */}
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div className="flex items-center gap-4">
            <input type="color" value={color} onChange={(e) => setColor(e.target.value)}
              className="w-20 h-20 rounded-xl border-2 border-[var(--border)] cursor-pointer" />
            <div className="flex-1">
              <input type="text" value={color} onChange={(e) => setColor(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-lg font-mono font-bold focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
            </div>
          </div>

          {/* Color preview */}
          <div className="h-24 rounded-xl shadow-inner" style={{ backgroundColor: color }} />

          {/* Formats */}
          <div className="space-y-2">
            {formats.map((f) => (
              <div key={f.label} className="flex items-center justify-between p-2 rounded-lg bg-[var(--muted)]">
                <span className="text-xs font-medium text-[var(--muted-foreground)] w-16">{f.label}</span>
                <span className="text-sm font-mono flex-1">{f.value}</span>
                <button onClick={() => copyValue(f.value)} className="p-1.5 rounded-lg hover:bg-[var(--accent)]">
                  {copied === f.value ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3 text-[var(--muted-foreground)]" />}
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Palettes */}
        <div className="space-y-4">
          {/* Shades */}
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <h3 className="text-sm font-semibold mb-3">Shades</h3>
            <div className="flex gap-1 rounded-xl overflow-hidden">
              {shades.map((shade, i) => (
                <button key={i} onClick={() => { setColor(shade); }} title={shade}
                  className="flex-1 h-12 hover:scale-110 transition-transform cursor-pointer"
                  style={{ backgroundColor: shade }} />
              ))}
            </div>
          </div>

          {/* Complementary */}
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <h3 className="text-sm font-semibold mb-3">Complementary</h3>
            <div className="flex gap-2 rounded-xl overflow-hidden">
              <button onClick={() => setColor(color)} className="flex-1 h-16 rounded-xl" style={{ backgroundColor: color }} />
              <button onClick={() => setColor(complementary)} className="flex-1 h-16 rounded-xl" style={{ backgroundColor: complementary }} />
            </div>
            <p className="text-xs text-[var(--muted-foreground)] mt-2 font-mono text-center">{color} / {complementary}</p>
          </div>

          {/* Contrast check */}
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <h3 className="text-sm font-semibold mb-3">Contrast Preview</h3>
            <div className="space-y-2">
              <div className="p-3 rounded-lg text-center font-medium" style={{ backgroundColor: color, color: "#ffffff" }}>
                White text on your color
              </div>
              <div className="p-3 rounded-lg text-center font-medium" style={{ backgroundColor: color, color: "#000000" }}>
                Black text on your color
              </div>
              <div className="p-3 rounded-lg text-center font-medium border border-[var(--border)]" style={{ color: color }}>
                Your color as text
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
