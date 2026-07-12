"use client";

import { useState, useRef, useEffect } from "react";
import { QrCode, ArrowLeft, Download } from "lucide-react";
import Link from "next/link";

export default function QRCodeGenerator() {
  const [text, setText] = useState("https://fixmyfile.vercel.app");
  const [size, setSize] = useState(256);
  const [fgColor, setFgColor] = useState("#000000");
  const [bgColor, setBgColor] = useState("#ffffff");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrReady, setQrReady] = useState(false);

  useEffect(() => {
    if (!text.trim()) { setQrReady(false); return; }
    generateQR();
  }, [text, size, fgColor, bgColor]);

  const generateQR = async () => {
    const canvas = canvasRef.current;
    if (!canvas || !text.trim()) return;

    try {
      const QRCode = (await import("qrcode")).default;
      await QRCode.toCanvas(canvas, text, {
        width: size,
        margin: 2,
        color: {
          dark: fgColor,
          light: bgColor,
        },
        errorCorrectionLevel: "M",
      });
      setQrReady(true);
    } catch (err) {
      console.error("QR generation error:", err);
      setQrReady(false);
    }
  };

  const downloadQR = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const a = document.createElement("a");
    a.download = "qr-code.png";
    a.href = canvas.toDataURL("image/png");
    a.click();
  };

  const presets = [
    { label: "URL", placeholder: "https://example.com" },
    { label: "Text", placeholder: "Your text here" },
    { label: "UPI", placeholder: "upi://pay?pa=name@bank&pn=Name&am=100" },
    { label: "WiFi", placeholder: "WIFI:T:WPA;S:NetworkName;P:Password;;" },
    { label: "Email", placeholder: "mailto:name@example.com" },
    { label: "Phone", placeholder: "tel:+919876543210" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-700 to-gray-900 flex items-center justify-center shadow-lg">
            <QrCode className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">QR Code Generator</h1>
            <p className="text-[var(--muted-foreground)]">Generate scannable QR codes for URLs, UPI, WiFi, and more</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Controls */}
        <div className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {presets.map((p) => (
              <button key={p.label} onClick={() => setText(p.placeholder)}
                className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)] transition-colors">
                {p.label}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Content</label>
            <textarea value={text} onChange={(e) => setText(e.target.value)} rows={4}
              placeholder="Enter URL, text, UPI link, or WiFi config..."
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y" />
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Size: {size}px</label>
            <input type="range" min={128} max={512} step={32} value={size} onChange={(e) => setSize(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Foreground</label>
              <div className="flex items-center gap-2">
                <input type="color" value={fgColor} onChange={(e) => setFgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--border)] cursor-pointer" />
                <input type="text" value={fgColor} onChange={(e) => setFgColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm font-mono" />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Background</label>
              <div className="flex items-center gap-2">
                <input type="color" value={bgColor} onChange={(e) => setBgColor(e.target.value)} className="w-10 h-10 rounded-lg border border-[var(--border)] cursor-pointer" />
                <input type="text" value={bgColor} onChange={(e) => setBgColor(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm font-mono" />
              </div>
            </div>
          </div>
        </div>

        {/* Preview */}
        <div className="flex flex-col items-center gap-4">
          <div className="p-6 rounded-2xl border border-[var(--border)] bg-white dark:bg-gray-900">
            <canvas ref={canvasRef} className="max-w-full" style={{ width: Math.min(size, 300), height: Math.min(size, 300) }} />
          </div>
          {qrReady && (
            <button onClick={downloadQR}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 hover:scale-105 active:scale-95 transition-all">
              <Download className="w-4 h-4" /> Download PNG
            </button>
          )}
          <p className="text-xs text-[var(--muted-foreground)] text-center">
            Uses proper Reed-Solomon error correction. QR codes scan reliably with any reader.
          </p>
        </div>
      </div>
    </div>
  );
}
