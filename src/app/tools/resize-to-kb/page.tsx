"use client";

import { useState, useEffect } from "react";
import { Gauge, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import ToolContent from "@/components/ToolContent";
import { toolContentData } from "@/lib/tool-content-data";

const PRESETS = [10, 20, 50, 100, 200, 500];

type Result = { blob: Blob; url: string; kb: number; width: number; height: number; quality: number } | null;

export default function ResizeToKB() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [targetKb, setTargetKb] = useState(50);
  const [format, setFormat] = useState<"image/jpeg" | "image/webp">("image/jpeg");
  const [allowResize, setAllowResize] = useState(true);
  const [result, setResult] = useState<Result>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    return () => { if (result?.url) URL.revokeObjectURL(result.url); };
  }, [result]);

  const loadImage = (file: File) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });

  const encode = (canvas: HTMLCanvasElement, q: number): Promise<Blob> =>
    new Promise((resolve, reject) =>
      canvas.toBlob((b) => (b ? resolve(b) : reject(new Error("encode failed"))), format, q)
    );

  const drawAt = (img: HTMLImageElement, scale: number) => {
    const canvas = document.createElement("canvas");
    canvas.width = Math.max(1, Math.round(img.width * scale));
    canvas.height = Math.max(1, Math.round(img.height * scale));
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas;
  };

  const handleResize = async () => {
    if (!files.length) return;
    const targetBytes = targetKb * 1024;
    setIsProcessing(true);
    setMessage("");
    setResult(null);
    try {
      const img = await loadImage(files[0]);

      // Try progressively smaller scales until one can hit the target.
      const scales = allowResize ? [1, 0.85, 0.7, 0.55, 0.4, 0.3, 0.2] : [1];
      let best: { blob: Blob; q: number; canvas: HTMLCanvasElement } | null = null;

      for (const scale of scales) {
        const canvas = drawAt(img, scale);

        // Binary search JPEG/WebP quality for the largest blob that fits.
        let lo = 0.05, hi = 0.95, fit: Blob | null = null, fitQ = 0;
        for (let i = 0; i < 8; i++) {
          const q = (lo + hi) / 2;
          const blob = await encode(canvas, q);
          if (blob.size <= targetBytes) { fit = blob; fitQ = q; lo = q; }
          else { hi = q; }
        }

        if (fit) {
          // Found a fit at this scale; keep the best (largest-under-target) and stop.
          best = { blob: fit, q: fitQ, canvas };
          break;
        }

        // Even lowest quality at this scale didn't fit — remember smallest attempt,
        // then try a smaller scale.
        const minBlob = await encode(canvas, 0.05);
        if (!best || minBlob.size < best.blob.size) best = { blob: minBlob, q: 0.05, canvas };
      }

      if (!best) throw new Error("Could not encode image");

      const kb = best.blob.size / 1024;
      const url = URL.createObjectURL(best.blob);
      setResult({ blob: best.blob, url, kb, width: best.canvas.width, height: best.canvas.height, quality: best.q });

      if (best.blob.size > targetBytes) {
        setMessage(`Smallest achievable is ${kb.toFixed(1)} KB. Try enabling resize or a smaller image to reach ${targetKb} KB.`);
      } else {
        setMessage(`Done — ${kb.toFixed(1)} KB (under your ${targetKb} KB limit).`);
      }
      setIsComplete(true);
    } catch (e) {
      console.error(e);
      alert("Error resizing image.");
    } finally {
      setIsProcessing(false);
    }
  };

  const ext = format === "image/webp" ? "webp" : "jpg";

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg">
            <Gauge className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Resize Image to KB</h1>
            <p className="text-[var(--muted-foreground)]">Compress a photo or signature to an exact size (20KB, 50KB, 100KB) for form uploads</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); setResult(null); setMessage(""); }} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setResult(null); setMessage(""); }} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Target size (KB)</label>
            <div className="flex flex-wrap gap-2 mb-3">
              {PRESETS.map((kb) => (
                <button key={kb} onClick={() => { setTargetKb(kb); setIsComplete(false); }}
                  className={`px-4 py-2 rounded-xl text-sm border transition-all ${targetKb === kb ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20 font-semibold" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                  {kb} KB
                </button>
              ))}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-xs text-[var(--muted-foreground)]">Custom:</span>
              <input type="number" min={1} max={5000} value={targetKb}
                onChange={(e) => { setTargetKb(Math.max(1, Number(e.target.value) || 1)); setIsComplete(false); }}
                className="w-28 px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm" />
              <span className="text-xs text-[var(--muted-foreground)]">KB</span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Output format</label>
              <div className="flex gap-2">
                {([
                  { id: "image/jpeg", label: "JPG" },
                  { id: "image/webp", label: "WebP (smaller)" },
                ] as { id: "image/jpeg" | "image/webp"; label: string }[]).map((f) => (
                  <button key={f.id} onClick={() => { setFormat(f.id); setIsComplete(false); }}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all ${format === f.id ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20 font-semibold" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] cursor-pointer">
            <input type="checkbox" checked={allowResize} onChange={(e) => { setAllowResize(e.target.checked); setIsComplete(false); }} className="rounded" />
            <div>
              <span className="text-sm font-medium">Reduce dimensions if needed</span>
              <p className="text-xs text-[var(--muted-foreground)]">Shrinks width/height when quality alone can&apos;t reach the target. Turn off to keep original dimensions.</p>
            </div>
          </label>

          <div className="flex flex-col items-center gap-3">
            <ProcessingButton onClick={handleResize} isProcessing={isProcessing} isComplete={isComplete} label={`Resize to ${targetKb} KB`} />
            {message && <p className="text-xs text-center text-[var(--muted-foreground)]">{message}</p>}
          </div>
        </div>
      )}

      {result && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-center text-[var(--muted-foreground)]">
              {result.kb.toFixed(1)} KB · {result.width}×{result.height}px · quality {Math.round(result.quality * 100)}%
            </div>
            <img src={result.url} alt="Resized image preview" className="w-full object-contain bg-[var(--muted)]" />
          </div>
          <button onClick={() => {
            const a = document.createElement("a");
            a.href = result.url;
            a.download = `resized-${targetKb}kb.${ext}`;
            a.click();
          }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-green-700 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
            Download
          </button>
        </div>
      )}

      <ToolContent {...toolContentData.resizeToKb} />
    </div>
  );
}
