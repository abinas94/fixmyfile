"use client";

import { useState, useRef } from "react";
import { Eraser, ArrowLeft, Download, Loader2 } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";

export default function BackgroundRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(30);
  const [mode, setMode] = useState<"auto" | "color">("auto");
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setResultUrl(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(URL.createObjectURL(newFiles[0]));
  };

  const handleRemove = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const img = new window.Image();
      const url = URL.createObjectURL(files[0]);
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });
      URL.revokeObjectURL(url);

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;

      if (mode === "auto") {
        // Auto mode: detect background from corners and flood-fill remove
        // Sample background color from corners
        const corners = [
          0, // top-left
          (canvas.width - 1) * 4, // top-right
          (canvas.height - 1) * canvas.width * 4, // bottom-left
          ((canvas.height - 1) * canvas.width + (canvas.width - 1)) * 4, // bottom-right
        ];

        let bgR = 0, bgG = 0, bgB = 0;
        for (const idx of corners) {
          bgR += data[idx];
          bgG += data[idx + 1];
          bgB += data[idx + 2];
        }
        bgR = Math.round(bgR / 4);
        bgG = Math.round(bgG / 4);
        bgB = Math.round(bgB / 4);

        // Remove pixels similar to background color
        const tol = tolerance;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const diff = Math.sqrt(
            Math.pow(r - bgR, 2) + Math.pow(g - bgG, 2) + Math.pow(b - bgB, 2)
          );
          if (diff < tol * 2.5) {
            // Make transparent with edge softening
            const alpha = Math.min(255, Math.max(0, (diff - tol) * (255 / tol)));
            data[i + 3] = Math.round(alpha);
          }
        }

        // Edge refinement: smooth alpha along edges
        const width = canvas.width;
        const height = canvas.height;
        for (let y = 1; y < height - 1; y++) {
          for (let x = 1; x < width - 1; x++) {
            const idx = (y * width + x) * 4;
            if (data[idx + 3] > 0 && data[idx + 3] < 255) {
              // Average with neighbors for smoother edges
              let sum = 0, count = 0;
              for (let dy = -1; dy <= 1; dy++) {
                for (let dx = -1; dx <= 1; dx++) {
                  const ni = ((y + dy) * width + (x + dx)) * 4;
                  sum += data[ni + 3];
                  count++;
                }
              }
              data[idx + 3] = Math.round(sum / count);
            }
          }
        }
      } else {
        // Color mode: remove white/light backgrounds (most common use case)
        const tol = tolerance * 3;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          // Distance from white
          const distFromWhite = Math.sqrt(
            Math.pow(255 - r, 2) + Math.pow(255 - g, 2) + Math.pow(255 - b, 2)
          );
          if (distFromWhite < tol) {
            const alpha = Math.min(255, Math.max(0, (distFromWhite / tol) * 255));
            data[i + 3] = Math.round(alpha);
          }
        }
      }

      ctx.putImageData(imageData, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
    } catch (error) {
      console.error(error);
      alert("Error removing background.");
    } finally { setIsProcessing(false); }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `no-bg-${files[0]?.name?.replace(/\.\w+$/, ".png") || "image.png"}`;
    a.click();
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Eraser className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Background Remover</h1>
            <p className="text-[var(--muted-foreground)]">Remove image background instantly — no sign-up needed</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept="image/*" multiple={false} maxFiles={1} files={files}
        onRemoveFile={() => { setFiles([]); setResultUrl(null); setOriginalUrl(null); }} />

      {files.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          {/* Mode */}
          <div>
            <label className="block text-sm font-medium mb-2">Mode</label>
            <div className="flex gap-2">
              <button onClick={() => setMode("auto")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "auto" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                Auto Detect (corners)
              </button>
              <button onClick={() => setMode("color")}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "color" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                Remove White/Light BG
              </button>
            </div>
          </div>

          {/* Tolerance */}
          <div>
            <label className="block text-sm font-medium mb-2">Tolerance: {tolerance}</label>
            <input type="range" min={5} max={80} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>Precise (less removal)</span><span>Aggressive (more removal)</span>
            </div>
          </div>

          {/* Process button */}
          <button onClick={handleRemove} disabled={isProcessing}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${isProcessing ? "bg-[var(--primary)] text-white opacity-80 cursor-wait" : "bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:shadow-lg hover:scale-[1.01] active:scale-95"}`}>
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />Removing background...</>) : (<><Eraser className="w-5 h-5" />Remove Background</>)}
          </button>
        </div>
      )}

      {/* Result comparison */}
      {resultUrl && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Original */}
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-[var(--muted-foreground)]">Original</div>
              {originalUrl && <img src={originalUrl} alt="Original" className="w-full object-contain max-h-[300px]" />}
            </div>
            {/* Result */}
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-[var(--muted-foreground)]">Background Removed</div>
              <div className="bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/></svg>')] bg-repeat">
                <img src={resultUrl} alt="Result" className="w-full object-contain max-h-[300px]" />
              </div>
            </div>
          </div>

          <div className="flex justify-center gap-3">
            <button onClick={downloadResult}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all">
              <Download className="w-4 h-4" /> Download PNG (transparent)
            </button>
            <button onClick={handleRemove}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--border)] font-semibold hover:border-[var(--primary)] transition-all">
              Retry with different settings
            </button>
          </div>
        </div>
      )}

      <canvas ref={canvasRef} className="hidden" />

      <div className="mt-10 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2">Tips for best results</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li>Works best with solid or near-solid color backgrounds</li>
          <li>Use &quot;Auto Detect&quot; for photos with uniform backgrounds</li>
          <li>Use &quot;Remove White/Light BG&quot; for scanned documents or logos</li>
          <li>Increase tolerance if background is not fully removed</li>
          <li>Decrease tolerance if subject edges are being cut</li>
          <li>Output is always PNG with transparent background</li>
        </ul>
      </div>
    </div>
  );
}
