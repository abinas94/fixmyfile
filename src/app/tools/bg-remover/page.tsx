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
        // FLOOD-FILL FROM EDGES — handles gradients, complex backgrounds
        // Start from all border pixels and fill inward as long as color difference between
        // neighboring pixels is within tolerance (this follows gradients naturally)
        const width = canvas.width;
        const height = canvas.height;
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];
        const tol = tolerance * 3.5;

        // Seed the queue with all border pixels
        for (let x = 0; x < width; x++) {
          queue.push(x); // top row
          queue.push((height - 1) * width + x); // bottom row
        }
        for (let y = 0; y < height; y++) {
          queue.push(y * width); // left column
          queue.push(y * width + (width - 1)); // right column
        }

        // Mark border pixels as background
        for (const idx of queue) visited[idx] = 1;

        // BFS flood-fill: expand from edges, marking background pixels
        let qi = 0;
        while (qi < queue.length) {
          const pixelIdx = queue[qi++];
          const px = pixelIdx % width;
          const py = Math.floor(pixelIdx / width);
          const i = pixelIdx * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];

          // Check 4 neighbors
          const neighbors = [
            px > 0 ? pixelIdx - 1 : -1,
            px < width - 1 ? pixelIdx + 1 : -1,
            py > 0 ? pixelIdx - width : -1,
            py < height - 1 ? pixelIdx + width : -1,
          ];

          for (const ni of neighbors) {
            if (ni < 0 || visited[ni]) continue;
            const nIdx = ni * 4;
            const nr = data[nIdx], ng = data[nIdx + 1], nb = data[nIdx + 2];

            // Compare with current pixel (follows gradients) AND with initial corner color
            const diffNeighbor = Math.sqrt((r - nr) ** 2 + (g - ng) ** 2 + (b - nb) ** 2);

            if (diffNeighbor < tol) {
              visited[ni] = 1;
              queue.push(ni);
            }
          }
        }

        // Apply: visited pixels become transparent with edge softening
        for (let idx = 0; idx < width * height; idx++) {
          const i = idx * 4;
          if (visited[idx]) {
            // Check if this is an edge pixel (has non-visited neighbor)
            const px = idx % width;
            const py = Math.floor(idx / width);
            let isEdge = false;
            const edgeNeighbors = [
              px > 0 ? idx - 1 : -1, px < width - 1 ? idx + 1 : -1,
              py > 0 ? idx - width : -1, py < height - 1 ? idx + width : -1,
            ];
            for (const ni of edgeNeighbors) {
              if (ni >= 0 && !visited[ni]) { isEdge = true; break; }
            }
            // Edge pixels: semi-transparent for smooth blending
            data[i + 3] = isEdge ? 80 : 0;
          }
        }

        // Second pass: smooth edges
        const alphaData = new Uint8Array(width * height);
        for (let i = 0; i < width * height; i++) alphaData[i] = data[i * 4 + 3];
        for (let y = 2; y < height - 2; y++) {
          for (let x = 2; x < width - 2; x++) {
            const idx = y * width + x;
            if (alphaData[idx] > 0 && alphaData[idx] < 255) {
              let sum = 0;
              for (let dy = -2; dy <= 2; dy++) {
                for (let dx = -2; dx <= 2; dx++) {
                  sum += alphaData[(y + dy) * width + (x + dx)];
                }
              }
              data[idx * 4 + 3] = Math.round(sum / 25);
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
