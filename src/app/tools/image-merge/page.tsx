"use client";

import { useState, useEffect } from "react";
import { Images, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import ToolContent from "@/components/ToolContent";
import { toolContentData } from "@/lib/tool-content-data";

type Layout = "horizontal" | "vertical" | "grid";

export default function ImageMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [layout, setLayout] = useState<Layout>("horizontal");
  const [gap, setGap] = useState(10);
  const [bg, setBg] = useState("#ffffff");
  const [transparent, setTransparent] = useState(false);
  const [cols, setCols] = useState(2);
  const [format, setFormat] = useState<"image/png" | "image/jpeg">("image/png");
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  useEffect(() => {
    return () => { if (previewUrl) URL.revokeObjectURL(previewUrl); };
  }, [previewUrl]);

  const loadImage = (file: File) =>
    new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => { URL.revokeObjectURL(url); resolve(img); };
      img.onerror = (e) => { URL.revokeObjectURL(url); reject(e); };
      img.src = url;
    });

  const handleMerge = async () => {
    if (files.length < 2) { alert("Add at least 2 images to merge."); return; }
    setIsProcessing(true);
    try {
      const imgs = await Promise.all(files.map(loadImage));

      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d")!;

      if (layout === "horizontal") {
        // Match all heights to the smallest height, keep aspect ratio
        const h = Math.min(...imgs.map((i) => i.height));
        const scaled = imgs.map((i) => ({ img: i, w: Math.round(i.width * (h / i.height)), h }));
        canvas.width = scaled.reduce((s, x) => s + x.w, 0) + gap * (imgs.length - 1);
        canvas.height = h;
        paintBg(ctx, canvas);
        let x = 0;
        for (const s of scaled) { ctx.drawImage(s.img, x, 0, s.w, s.h); x += s.w + gap; }
      } else if (layout === "vertical") {
        // Match all widths to the smallest width, keep aspect ratio
        const w = Math.min(...imgs.map((i) => i.width));
        const scaled = imgs.map((i) => ({ img: i, w, h: Math.round(i.height * (w / i.width)) }));
        canvas.width = w;
        canvas.height = scaled.reduce((s, x) => s + x.h, 0) + gap * (imgs.length - 1);
        paintBg(ctx, canvas);
        let y = 0;
        for (const s of scaled) { ctx.drawImage(s.img, 0, y, s.w, s.h); y += s.h + gap; }
      } else {
        // Grid: uniform cells sized to the largest image, centered inside each cell
        const c = Math.max(1, Math.min(cols, imgs.length));
        const rows = Math.ceil(imgs.length / c);
        const cellW = Math.max(...imgs.map((i) => i.width));
        const cellH = Math.max(...imgs.map((i) => i.height));
        canvas.width = cellW * c + gap * (c - 1);
        canvas.height = cellH * rows + gap * (rows - 1);
        paintBg(ctx, canvas);
        imgs.forEach((img, i) => {
          const col = i % c;
          const row = Math.floor(i / c);
          const scale = Math.min(cellW / img.width, cellH / img.height);
          const dw = img.width * scale;
          const dh = img.height * scale;
          const cx = col * (cellW + gap) + (cellW - dw) / 2;
          const cy = row * (cellH + gap) + (cellH - dh) / 2;
          ctx.drawImage(img, cx, cy, dw, dh);
        });
      }

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), format, 0.95)
      );
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      setPreviewUrl(URL.createObjectURL(blob));
      setIsComplete(true);
    } catch (e) {
      console.error(e);
      alert("Error merging images.");
    } finally {
      setIsProcessing(false);
    }
  };

  const paintBg = (ctx: CanvasRenderingContext2D, canvas: HTMLCanvasElement) => {
    const useTransparent = transparent && format === "image/png";
    if (!useTransparent) {
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, canvas.width, canvas.height);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Images className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Merge Images</h1>
            <p className="text-[var(--muted-foreground)]">Combine multiple images into one — side by side, stacked, or in a grid</p>
          </div>
        </div>
      </div>

      <FileDropZone
        onFilesSelected={(f) => { setFiles((prev) => [...prev, ...f]); setIsComplete(false); }}
        accept="image/*"
        multiple={true}
        maxFiles={30}
        files={files}
        onRemoveFile={(i) => { setFiles((prev) => prev.filter((_, idx) => idx !== i)); setIsComplete(false); }}
        onReorderFiles={(f) => { setFiles(f); setIsComplete(false); }}
      />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Layout</label>
            <div className="grid grid-cols-3 gap-2">
              {([
                { id: "horizontal", label: "Side by side" },
                { id: "vertical", label: "Stacked" },
                { id: "grid", label: "Grid" },
              ] as { id: Layout; label: string }[]).map((l) => (
                <button key={l.id} onClick={() => { setLayout(l.id); setIsComplete(false); }}
                  className={`px-3 py-2 rounded-xl text-sm border transition-all ${layout === l.id ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20 font-semibold" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                  {l.label}
                </button>
              ))}
            </div>
          </div>

          {layout === "grid" && (
            <div>
              <label className="block text-sm font-medium mb-2">Columns: {cols}</label>
              <input type="range" min={1} max={6} value={cols}
                onChange={(e) => { setCols(Number(e.target.value)); setIsComplete(false); }}
                className="w-full" />
            </div>
          )}

          <div>
            <label className="block text-sm font-medium mb-2">Spacing between images: {gap}px</label>
            <input type="range" min={0} max={80} value={gap}
              onChange={(e) => { setGap(Number(e.target.value)); setIsComplete(false); }}
              className="w-full" />
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Output format</label>
              <div className="flex gap-2">
                {([
                  { id: "image/png", label: "PNG" },
                  { id: "image/jpeg", label: "JPG" },
                ] as { id: "image/png" | "image/jpeg"; label: string }[]).map((f) => (
                  <button key={f.id} onClick={() => { setFormat(f.id); setIsComplete(false); }}
                    className={`px-4 py-2 rounded-xl text-sm border transition-all ${format === f.id ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20 font-semibold" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {!(transparent && format === "image/png") && (
              <div>
                <label className="block text-sm font-medium mb-2">Background</label>
                <input type="color" value={bg} onChange={(e) => { setBg(e.target.value); setIsComplete(false); }}
                  className="w-14 h-10 rounded-lg border border-[var(--border)] cursor-pointer bg-transparent" />
              </div>
            )}
          </div>

          {format === "image/png" && (
            <label className="flex items-center gap-3 p-3 rounded-xl bg-[var(--muted)] border border-[var(--border)] cursor-pointer">
              <input type="checkbox" checked={transparent} onChange={(e) => { setTransparent(e.target.checked); setIsComplete(false); }} className="rounded" />
              <div>
                <span className="text-sm font-medium">Transparent background</span>
                <p className="text-xs text-[var(--muted-foreground)]">Keeps gaps and empty grid cells transparent (PNG only).</p>
              </div>
            </label>
          )}

          <p className="text-xs text-[var(--muted-foreground)]">
            {files.length} image{files.length === 1 ? "" : "s"} added. Drag thumbnails above to reorder. Add at least 2 to merge.
          </p>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleMerge} isProcessing={isProcessing} isComplete={isComplete} label="Merge Images" />
        </div>
      )}

      {previewUrl && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="w-full max-w-2xl rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-center text-[var(--muted-foreground)]">
              Merged preview
            </div>
            <img src={previewUrl} alt="Merged image preview" className="w-full object-contain bg-[var(--muted)]" />
          </div>
          <button onClick={() => {
            const a = document.createElement("a");
            a.href = previewUrl;
            a.download = "merged-image." + (format === "image/png" ? "png" : "jpg");
            a.click();
          }}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-fuchsia-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
            Download
          </button>
        </div>
      )}

      <ToolContent {...toolContentData.imageMerge} />
    </div>
  );
}
