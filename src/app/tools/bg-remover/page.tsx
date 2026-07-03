"use client";

import { useState, useRef } from "react";
import { Eraser, ArrowLeft, Download, Loader2, Undo2, MousePointer2 } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";

type Mode = "draw-keep" | "draw-remove" | "auto";

export default function BackgroundRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [tolerance, setTolerance] = useState(25);
  const [mode, setMode] = useState<Mode>("draw-keep");
  const [imageLoaded, setImageLoaded] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const [points, setPoints] = useState<{ x: number; y: number }[]>([]);

  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const imgRef = useRef<HTMLImageElement | null>(null);
  const imgDimensions = useRef({ w: 0, h: 0, displayW: 0, displayH: 0 });

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setResultUrl(null);
    setPoints([]);
    setImageLoaded(false);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    const url = URL.createObjectURL(newFiles[0]);
    setOriginalUrl(url);

    const img = new window.Image();
    img.onload = () => {
      imgRef.current = img;
      imgDimensions.current.w = img.width;
      imgDimensions.current.h = img.height;
      setImageLoaded(true);
      initDrawCanvas(img);
    };
    img.src = url;
  };

  const initDrawCanvas = (img: HTMLImageElement) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    // Set canvas to match display size
    const maxW = Math.min(600, window.innerWidth - 48);
    const ratio = img.height / img.width;
    const displayW = maxW;
    const displayH = Math.round(maxW * ratio);
    canvas.width = displayW;
    canvas.height = displayH;
    imgDimensions.current.displayW = displayW;
    imgDimensions.current.displayH = displayH;

    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(img, 0, 0, displayW, displayH);
  };

  const getCanvasCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    // Scale from displayed CSS size to canvas internal resolution
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY,
    };
  };

  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Brush size scales with image resolution so it looks consistent
  const getBrush = () => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return 24;
    return Math.max(16, Math.round(canvas.width / 25));
  };

  const startDraw = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setIsDrawing(true);
    const { x, y } = getCanvasCoords(e);
    lastPoint.current = { x, y };
    setPoints((prev) => [...prev, { x, y }]);
    drawMark(x, y, x, y);
  };

  const moveDraw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const { x, y } = getCanvasCoords(e);
    const last = lastPoint.current || { x, y };
    setPoints((prev) => [...prev, { x, y }]);
    drawMark(last.x, last.y, x, y);
    lastPoint.current = { x, y };
  };

  const stopDraw = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  // Draw a continuous line from last point to current point
  const drawMark = (x1: number, y1: number, x2: number, y2: number) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const brush = getBrush();
    ctx.strokeStyle = mode === "draw-keep" ? "rgba(0, 200, 100, 0.5)" : "rgba(255, 50, 50, 0.5)";
    ctx.lineWidth = brush;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  };

  const resetDrawing = () => {
    setPoints([]);
    setResultUrl(null);
    if (imgRef.current) initDrawCanvas(imgRef.current);
  };

  const handleRemove = async () => {
    if (!files.length || !imgRef.current) return;
    setIsProcessing(true);
    try {
      const img = imgRef.current;
      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const data = imageData.data;
      const width = canvas.width;
      const height = canvas.height;

      if (mode === "draw-keep" && points.length > 5) {
        // User drew on areas to KEEP — remove everything else
        // Scale points from display canvas to actual image coordinates
        const scaleX = width / imgDimensions.current.displayW;
        const scaleY = height / imgDimensions.current.displayH;

        // Create mask: pixels near drawn points = keep, others = remove
        const keepMask = new Uint8Array(width * height);
        const brush = getBrush();
        const scaledBrush = Math.round((brush / 2) * scaleX);

        for (const pt of points) {
          // points are in canvas resolution; convert to image resolution
          const cx = Math.round(pt.x * scaleX);
          const cy = Math.round(pt.y * scaleY);
          for (let dy = -scaledBrush; dy <= scaledBrush; dy++) {
            for (let dx = -scaledBrush; dx <= scaledBrush; dx++) {
              if (dx * dx + dy * dy <= scaledBrush * scaledBrush) {
                const px = cx + dx;
                const py = cy + dy;
                if (px >= 0 && px < width && py >= 0 && py < height) {
                  keepMask[py * width + px] = 1;
                }
              }
            }
          }
        }

        // Expand the keep zone using flood-fill from marked pixels
        // Fill connected similar-colored pixels outward from the marked area
        const tol = tolerance * 4;
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        // Seed: all marked pixels
        for (let i = 0; i < keepMask.length; i++) {
          if (keepMask[i]) { queue.push(i); visited[i] = 1; }
        }

        // BFS: expand from marked region, keeping similar pixels
        let qi = 0;
        while (qi < queue.length) {
          const pixelIdx = queue[qi++];
          const px = pixelIdx % width;
          const py = Math.floor(pixelIdx / width);
          const i = pixelIdx * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];

          const neighbors = [
            px > 0 ? pixelIdx - 1 : -1,
            px < width - 1 ? pixelIdx + 1 : -1,
            py > 0 ? pixelIdx - width : -1,
            py < height - 1 ? pixelIdx + width : -1,
          ];

          for (const ni of neighbors) {
            if (ni < 0 || visited[ni]) continue;
            const nIdx = ni * 4;
            const diff = Math.sqrt((r - data[nIdx]) ** 2 + (g - data[nIdx + 1]) ** 2 + (b - data[nIdx + 2]) ** 2);
            if (diff < tol) {
              visited[ni] = 1;
              queue.push(ni);
            }
          }
        }

        // Remove non-visited pixels (background)
        for (let i = 0; i < width * height; i++) {
          if (!visited[i]) {
            // Check if edge pixel for smooth blending
            const px = i % width;
            const py = Math.floor(i / width);
            let nearEdge = false;
            for (let d = 1; d <= 3; d++) {
              if ((px - d >= 0 && visited[i - d]) || (px + d < width && visited[i + d]) ||
                  (py - d >= 0 && visited[i - d * width]) || (py + d < height && visited[i + d * width])) {
                nearEdge = true; break;
              }
            }
            data[i * 4 + 3] = nearEdge ? 100 : 0;
          }
        }

      } else if (mode === "draw-remove" && points.length > 5) {
        // User drew on areas to REMOVE — flood-fill from those points
        const scaleX = width / imgDimensions.current.displayW;
        const scaleY = height / imgDimensions.current.displayH;
        const tol = tolerance * 3.5;
        const visited = new Uint8Array(width * height);
        const queue: number[] = [];

        // Seed from drawn points (small area around each)
        const seedRadius = Math.max(2, Math.round(getBrush() / 2 * scaleX * 0.5));
        for (const pt of points) {
          const cx = Math.round(pt.x * scaleX);
          const cy = Math.round(pt.y * scaleY);
          for (let dy = -seedRadius; dy <= seedRadius; dy++) {
            for (let dx = -seedRadius; dx <= seedRadius; dx++) {
              const px = cx + dx, py = cy + dy;
              if (px >= 0 && px < width && py >= 0 && py < height) {
                const idx = py * width + px;
                if (!visited[idx]) { visited[idx] = 1; queue.push(idx); }
              }
            }
          }
        }

        // BFS flood-fill from marked background points
        let qi = 0;
        while (qi < queue.length) {
          const pixelIdx = queue[qi++];
          const px = pixelIdx % width;
          const py = Math.floor(pixelIdx / width);
          const i = pixelIdx * 4;
          const r = data[i], g = data[i + 1], b = data[i + 2];

          const neighbors = [
            px > 0 ? pixelIdx - 1 : -1,
            px < width - 1 ? pixelIdx + 1 : -1,
            py > 0 ? pixelIdx - width : -1,
            py < height - 1 ? pixelIdx + width : -1,
          ];

          for (const ni of neighbors) {
            if (ni < 0 || visited[ni]) continue;
            const nIdx = ni * 4;
            const diff = Math.sqrt((r - data[nIdx]) ** 2 + (g - data[nIdx + 1]) ** 2 + (b - data[nIdx + 2]) ** 2);
            if (diff < tol) {
              visited[ni] = 1;
              queue.push(ni);
            }
          }
        }

        // Remove visited pixels
        for (let i = 0; i < width * height; i++) {
          if (visited[i]) {
            const px = i % width;
            const py = Math.floor(i / width);
            let nearEdge = false;
            for (let d = 1; d <= 2; d++) {
              if ((px - d >= 0 && !visited[i - d]) || (px + d < width && !visited[i + d]) ||
                  (py - d >= 0 && !visited[i - d * width]) || (py + d < height && !visited[i + d * width])) {
                nearEdge = true; break;
              }
            }
            data[i * 4 + 3] = nearEdge ? 80 : 0;
          }
        }

      } else {
        // Auto mode fallback: simple white/light background removal
        const tol = tolerance * 3;
        for (let i = 0; i < data.length; i += 4) {
          const r = data[i], g = data[i + 1], b = data[i + 2];
          const brightness = (r + g + b) / 3;
          const distFromWhite = Math.sqrt((255 - r) ** 2 + (255 - g) ** 2 + (255 - b) ** 2);
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
            <p className="text-[var(--muted-foreground)]">Draw on the subject to keep, then remove background</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept="image/*" multiple={false} maxFiles={1} files={files}
        onRemoveFile={() => { setFiles([]); setResultUrl(null); setOriginalUrl(null); setPoints([]); setImageLoaded(false); }} />

      {imageLoaded && !resultUrl && (
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          {/* Mode selection */}
          <div>
            <label className="block text-sm font-medium mb-2">How to select</label>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => { setMode("draw-keep"); resetDrawing(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "draw-keep" ? "bg-green-500 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                <MousePointer2 className="w-4 h-4" /> Draw on subject (KEEP)
              </button>
              <button onClick={() => { setMode("draw-remove"); resetDrawing(); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "draw-remove" ? "bg-red-500 text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                <Eraser className="w-4 h-4" /> Draw on background (REMOVE)
              </button>
              <button onClick={() => { setMode("auto"); resetDrawing(); }}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${mode === "auto" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                Auto (white BG only)
              </button>
            </div>
          </div>

          {/* Instructions */}
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 text-xs text-blue-700 dark:text-blue-300">
            {mode === "draw-keep" && "Draw/scribble over the person/object you want to KEEP. Don't need to be precise — just mark the general area. The tool will detect edges automatically."}
            {mode === "draw-remove" && "Draw/scribble on the BACKGROUND you want to remove. Mark different parts of the background if it has multiple colors."}
            {mode === "auto" && "Auto mode removes white/light backgrounds. For colored backgrounds, use the Draw modes instead."}
          </div>

          {/* Tolerance */}
          <div>
            <label className="block text-xs font-medium mb-1">Tolerance: {tolerance} {tolerance < 20 ? "(precise edges)" : tolerance > 45 ? "(aggressive)" : "(balanced)"}</label>
            <input type="range" min={5} max={60} value={tolerance} onChange={(e) => setTolerance(Number(e.target.value))}
              className="w-full accent-[var(--primary)]" />
            <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
              <span>Precise</span><span>Removes more</span>
            </div>
          </div>

          {/* Drawing canvas */}
          {mode !== "auto" && (
            <div className="relative">
              <canvas
                ref={drawCanvasRef}
                onMouseDown={startDraw} onMouseMove={moveDraw} onMouseUp={stopDraw} onMouseLeave={stopDraw}
                onTouchStart={startDraw} onTouchMove={moveDraw} onTouchEnd={stopDraw}
                className="w-full rounded-xl border border-[var(--border)] cursor-crosshair touch-none"
                style={{ maxHeight: "450px" }}
              />
              {points.length > 0 && (
                <button onClick={resetDrawing}
                  className="absolute top-2 right-2 flex items-center gap-1 px-3 py-1.5 rounded-lg bg-white/90 dark:bg-black/70 text-xs font-medium shadow">
                  <Undo2 className="w-3 h-3" /> Reset
                </button>
              )}
            </div>
          )}

          {/* Process button */}
          <button onClick={handleRemove} disabled={isProcessing || (mode !== "auto" && points.length < 5)}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${isProcessing ? "bg-[var(--primary)] text-white opacity-80 cursor-wait" : (mode !== "auto" && points.length < 5) ? "bg-[var(--muted)] text-[var(--muted-foreground)] cursor-not-allowed" : "bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:shadow-lg hover:scale-[1.01] active:scale-95"}`}>
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />Processing...</>) : (<><Eraser className="w-5 h-5" />Remove Background</>)}
          </button>
        </div>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="mt-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-[var(--muted-foreground)]">Original</div>
              {originalUrl && <img src={originalUrl} alt="Original" className="w-full object-contain max-h-[300px]" />}
            </div>
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-[var(--muted-foreground)]">Background Removed</div>
              <div className="bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/></svg>')] bg-repeat">
                <img src={resultUrl} alt="Result" className="w-full object-contain max-h-[300px]" />
              </div>
            </div>
          </div>
          <div className="flex justify-center gap-3">
            <button onClick={downloadResult}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button onClick={() => { setResultUrl(null); resetDrawing(); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--border)] font-semibold hover:border-[var(--primary)] transition-all">
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2">How to use</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li><strong>Draw on subject (KEEP):</strong> Scribble over the person/object. The tool expands your selection to include similar-colored connected pixels.</li>
          <li><strong>Draw on background (REMOVE):</strong> Mark different areas of the background. Good for complex/multi-colored backgrounds.</li>
          <li><strong>Auto:</strong> Only works on white/light backgrounds (ID photos, documents).</li>
          <li>Lower tolerance = more precise edges. Higher = removes more aggressively.</li>
          <li>You don&apos;t need to be precise — just roughly mark the areas.</li>
        </ul>
      </div>
    </div>
  );
}
