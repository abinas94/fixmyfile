"use client";

import { useState, useRef, useEffect } from "react";
import { ScanLine, ArrowLeft, Camera, Upload, Copy, Check, ExternalLink } from "lucide-react";
import Link from "next/link";

export default function QRScanner() {
  const [result, setResult] = useState<string | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const startCamera = async () => {
    setError(null);
    setResult(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      setIsScanning(true);

      // Start scanning frames
      scanIntervalRef.current = setInterval(() => {
        scanFrame();
      }, 300);
    } catch (err) {
      setError("Camera access denied. Please allow camera permission and try again.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (scanIntervalRef.current) {
      clearInterval(scanIntervalRef.current);
      scanIntervalRef.current = null;
    }
    setIsScanning(false);
  };

  const scanFrame = async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || !canvas || video.readyState !== 4) return;

    const ctx = canvas.getContext("2d")!;
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    ctx.drawImage(video, 0, 0);

    try {
      // Use BarcodeDetector API (available in Chrome/Edge)
      if ("BarcodeDetector" in window) {
        const detector = new (window as any).BarcodeDetector({ formats: ["qr_code", "ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "data_matrix"] });
        const barcodes = await detector.detect(canvas);
        if (barcodes.length > 0) {
          setResult(barcodes[0].rawValue);
          stopCamera();
          return;
        }
      }
    } catch { /* BarcodeDetector not supported, continue scanning */ }
  };

  const scanFromFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    setResult(null);

    const img = new window.Image();
    const url = URL.createObjectURL(file);
    img.onload = async () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      try {
        if ("BarcodeDetector" in window) {
          const detector = new (window as any).BarcodeDetector({ formats: ["qr_code", "ean_13", "ean_8", "code_128", "code_39", "upc_a", "upc_e", "data_matrix"] });
          const barcodes = await detector.detect(canvas);
          if (barcodes.length > 0) {
            setResult(barcodes[0].rawValue);
            return;
          }
        }
        setError("No QR code or barcode detected in this image. Try a clearer image.");
      } catch {
        setError("QR scanning not supported in this browser. Try Chrome or Edge.");
      }
    };
    img.src = url;
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  const copyResult = () => {
    if (!result) return;
    navigator.clipboard.writeText(result);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isURL = (text: string) => /^https?:\/\//i.test(text);
  const isUPI = (text: string) => /^upi:\/\//i.test(text);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">QR & Barcode Scanner</h1>
            <p className="text-[var(--muted-foreground)]">Scan QR codes, UPI codes, and barcodes using your camera</p>
          </div>
        </div>
      </div>

      {/* Scanner area */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
        {!isScanning && !result && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <button onClick={startCamera}
              className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all">
              <Camera className="w-10 h-10 text-[var(--primary)]" />
              <div className="text-center">
                <p className="font-semibold">Scan with Camera</p>
                <p className="text-xs text-[var(--muted-foreground)]">Point at any QR code or barcode</p>
              </div>
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-3 p-8 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all">
              <Upload className="w-10 h-10 text-[var(--primary)]" />
              <div className="text-center">
                <p className="font-semibold">Upload Image</p>
                <p className="text-xs text-[var(--muted-foreground)]">Scan QR from a screenshot or photo</p>
              </div>
            </button>
            <input ref={fileInputRef} type="file" accept="image/*" onChange={scanFromFile} className="hidden" />
          </div>
        )}

        {isScanning && (
          <div className="relative">
            <video ref={videoRef} className="w-full rounded-xl" playsInline muted />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="w-48 h-48 border-2 border-[var(--primary)] rounded-2xl animate-pulse" />
            </div>
            <button onClick={stopCamera}
              className="mt-4 w-full py-3 rounded-xl bg-red-500 text-white font-semibold hover:bg-red-600 transition-colors">
              Stop Scanning
            </button>
            <p className="text-center text-sm text-[var(--muted-foreground)] mt-2">Point camera at a QR code or barcode</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-700 dark:text-red-400 text-sm">
            {error}
          </div>
        )}
      </div>

      {/* Result */}
      {result && (
        <div className="mt-6 p-6 rounded-2xl border border-green-200 dark:border-green-800 bg-green-50 dark:bg-green-900/10">
          <h3 className="font-semibold text-green-800 dark:text-green-300 mb-3">Scanned Result</h3>
          <div className="p-4 rounded-xl bg-white dark:bg-[var(--card)] border border-[var(--border)] break-all text-sm font-mono">
            {result}
          </div>
          <div className="flex flex-wrap gap-2 mt-4">
            <button onClick={copyResult}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">
              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              {copied ? "Copied!" : "Copy"}
            </button>
            {isURL(result) && (
              <a href={result} target="_blank" rel="noopener noreferrer"
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-blue-500 text-white text-sm font-medium hover:opacity-90">
                <ExternalLink className="w-4 h-4" /> Open Link
              </a>
            )}
            {isUPI(result) && (
              <a href={result}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white text-sm font-medium hover:opacity-90">
                Open in UPI App
              </a>
            )}
            <button onClick={() => { setResult(null); startCamera(); }}
              className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--border)] text-sm font-medium hover:bg-[var(--accent)]">
              Scan Another
            </button>
          </div>
          {isUPI(result) && (
            <p className="mt-3 text-xs text-[var(--muted-foreground)]">UPI payment link detected — tap to open in Google Pay, PhonePe, or Paytm</p>
          )}
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      {/* Supported formats */}
      <div className="mt-8 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2">Supported formats</h3>
        <div className="flex flex-wrap gap-2">
          {["QR Code", "UPI QR", "Barcode (EAN-13)", "Barcode (EAN-8)", "Code 128", "Code 39", "UPC-A", "UPC-E", "Data Matrix"].map((fmt) => (
            <span key={fmt} className="px-2 py-1 rounded-lg bg-[var(--card)] border border-[var(--border)] text-xs">{fmt}</span>
          ))}
        </div>
        <p className="text-xs text-[var(--muted-foreground)] mt-3">Works best in Chrome and Edge. Camera scanning requires HTTPS.</p>
      </div>
    </div>
  );
}
