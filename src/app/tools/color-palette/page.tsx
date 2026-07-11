"use client";

import { useState } from "react";
import { Palette, ArrowLeft, Copy, Check, RefreshCw } from "lucide-react";
import Link from "next/link";

function hexToHSL(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;
  const max = Math.max(r, g, b), min = Math.min(r, g, b);
  let h = 0, s = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
    else if (max === g) h = ((b - r) / d + 2) / 6;
    else h = ((r - g) / d + 4) / 6;
  }
  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  h = ((h % 360) + 360) % 360;
  s = Math.max(0, Math.min(100, s)) / 100;
  l = Math.max(0, Math.min(100, l)) / 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

function generatePalette(baseHex: string, type: string): string[] {
  const [h, s, l] = hexToHSL(baseHex);
  switch (type) {
    case "complementary":
      return [baseHex, hslToHex(h + 180, s, l)];
    case "analogous":
      return [hslToHex(h - 30, s, l), baseHex, hslToHex(h + 30, s, l)];
    case "triadic":
      return [baseHex, hslToHex(h + 120, s, l), hslToHex(h + 240, s, l)];
    case "tetradic":
      return [baseHex, hslToHex(h + 90, s, l), hslToHex(h + 180, s, l), hslToHex(h + 270, s, l)];
    case "shades":
      return [hslToHex(h, s, 90), hslToHex(h, s, 70), hslToHex(h, s, 50), hslToHex(h, s, 30), hslToHex(h, s, 10)];
    case "monochromatic":
      return [hslToHex(h, s, 20), hslToHex(h, s, 35), baseHex, hslToHex(h, s, 65), hslToHex(h, s, 80)];
    default:
      return [baseHex];
  }
}

export default function ColorPaletteGenerator() {
  const [baseColor, setBaseColor] = useState("#6366f1");
  const [paletteType, setPaletteType] = useState("monochromatic");
  const [copied, setCopied] = useState<string | null>(null);

  const palette = generatePalette(baseColor, paletteType);

  const copyColor = (color: string) => {
    navigator.clipboard.writeText(color);
    setCopied(color);
    setTimeout(() => setCopied(null), 1500);
  };

  const randomColor = () => {
    const hex = "#" + Math.floor(Math.random() * 16777215).toString(16).padStart(6, "0");
    setBaseColor(hex);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-400 to-purple-600 flex items-center justify-center shadow-lg">
            <Palette className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Color Palette Generator</h1>
            <p className="text-[var(--muted-foreground)]">Generate harmonious color palettes from any base color</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <input
              type="color"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-10 h-10 rounded-lg cursor-pointer border-0"
            />
            <input
              type="text"
              value={baseColor}
              onChange={(e) => setBaseColor(e.target.value)}
              className="w-24 px-2 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm font-mono"
            />
            <button onClick={randomColor} className="p-2 rounded-lg hover:bg-[var(--accent)]" title="Random color">
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
          <div className="flex flex-wrap gap-1">
            {["monochromatic", "analogous", "complementary", "triadic", "tetradic", "shades"].map((type) => (
              <button
                key={type}
                onClick={() => setPaletteType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                  paletteType === type ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                }`}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Palette Display */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3 mb-6">
        {palette.map((color, idx) => (
          <button
            key={idx}
            onClick={() => copyColor(color)}
            className="group relative aspect-square rounded-2xl shadow-lg hover:scale-105 active:scale-95 transition-all overflow-hidden"
            style={{ backgroundColor: color }}
          >
            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/20">
              {copied === color ? <Check className="w-6 h-6 text-white" /> : <Copy className="w-6 h-6 text-white" />}
            </div>
            <span className="absolute bottom-2 left-1/2 -translate-x-1/2 text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/90 text-gray-900">
              {color.toUpperCase()}
            </span>
          </button>
        ))}
      </div>

      {/* CSS Export */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
        <p className="text-xs font-medium mb-2">CSS Variables</p>
        <code className="text-xs font-mono text-[var(--muted-foreground)] block whitespace-pre">
          {palette.map((c, i) => `--color-${i + 1}: ${c};`).join("\n")}
        </code>
      </div>
    </div>
  );
}
