"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Crop, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function ImageCrop() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });

  // Crop box as percentages (0-1) from each edge
  const [crop, setCrop] = useState({ left: 0.1, top: 0.1, right: 0.1, bottom: 0.1 });
  const [dragging, setDragging] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsComplete(false);
    setCrop({ left: 0.1, top: 0.1, right: 0.1, bottom: 0.1 });
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    const url = URL.createObjectURL(newFiles[0]);
    setPreviewUrl(url);
    const img = new window.Image();
    img.onload = () => setImgSize({ w: img.width, h: img.height });
    img.src = url;
  };

  // Drag handlers
  const handleMouseDown = (edge: string, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDragging(edge);
  };

  const handleMove = useCallback((clientX: number, clientY: number) => {
    if (!dragging || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    setCrop((prev) => {
      const updated = { ...prev };
      if (dragging === "left") updated.left = Math.min(x, 1 - prev.right - 0.05);
      if (dragging === "right") updated.right = Math.min(1 - x, 1 - prev.left - 0.05);
      if (dragging === "top") updated.top = Math.min(y, 1 - prev.bottom - 0.05);
      if (dragging === "bottom") updated.bottom = Math.min(1 - y, 1 - prev.top - 0.05);
      // Corner drags
      if (dragging === "tl") { updated.left = Math.min(x, 1 - prev.right - 0.05); updated.top = Math.min(y, 1 - prev.bottom - 0.05); }
      if (dragging === "tr") { updated.right = Math.min(1 - x, 1 - prev.left - 0.05); updated.top = Math.min(y, 1 - prev.bottom - 0.05); }
      if (dragging === "bl") { updated.left = Math.min(x, 1 - prev.right - 0.05); updated.bottom = Math.min(1 - y, 1 - prev.top - 0.05); }
      if (dragging === "br") { updated.right = Math.min(1 - x, 1 - prev.left - 0.05); updated.bottom = Math.min(1 - y, 1 - prev.top - 0.05); }
      return updated;
    });
  }, [dragging]);

  useEffect(() => {
    const onMouseMove = (e: MouseEvent) => handleMove(e.clientX, e.clientY);
    const onTouchMove = (e: TouchEvent) => { if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY); };
    const onEnd = () => setDragging(null);

    if (dragging) {
      window.addEventListener("mousemove", onMouseMove);
      window.addEventListener("mouseup", onEnd);
      window.addEventListener("touchmove", onTouchMove);
      window.addEventListener("touchend", onEnd);
      return () => {
        window.removeEventListener("mousemove", onMouseMove);
        window.removeEventListener("mouseup", onEnd);
        window.removeEventListener("touchmove", onTouchMove);
        window.removeEventListener("touchend", onEnd);
      };
    }
  }, [dragging, handleMove]);

  const handleCrop = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const img = new window.Image();
      const url = URL.createObjectURL(files[0]);
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });
      URL.revokeObjectURL(url);

      const sx = Math.round(img.width * crop.left);
      const sy = Math.round(img.height * crop.top);
      const sw = Math.round(img.width * (1 - crop.left - crop.right));
      const sh = Math.round(img.height * (1 - crop.top - crop.bottom));

      const canvas = document.createElement("canvas");
      canvas.width = sw;
      canvas.height = sh;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), files[0].type || "image/png", 0.95);
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cropped-${files[0].name}`;
      a.click();
      URL.revokeObjectURL(a.href);
      setIsComplete(true);
    } catch { alert("Error cropping image."); }
    finally { setIsProcessing(false); }
  };

  const cropW = Math.round(imgSize.w * (1 - crop.left - crop.right));
  const cropH = Math.round(imgSize.h * (1 - crop.top - crop.bottom));

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Crop className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Crop Image</h1>
            <p className="text-[var(--muted-foreground)]">Drag edges or corners to crop</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept="image/*" multiple={false} maxFiles={1} files={files}
        onRemoveFile={() => { setFiles([]); setPreviewUrl(null); }} />

      {previewUrl && (
        <div className="mt-6 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm font-medium mb-3 text-center">Drag edges or corners to select crop area</p>

          {/* Crop editor */}
          <div ref={containerRef} className="relative mx-auto select-none" style={{ maxWidth: "600px" }}>
            <img src={previewUrl} alt="Preview" className="w-full rounded-lg" />

            {/* Dark overlay outside crop area */}
            <div className="absolute inset-0 pointer-events-none">
              <div className="absolute left-0 right-0 top-0 bg-black/50" style={{ height: `${crop.top * 100}%` }} />
              <div className="absolute left-0 right-0 bottom-0 bg-black/50" style={{ height: `${crop.bottom * 100}%` }} />
              <div className="absolute left-0 bg-black/50" style={{ top: `${crop.top * 100}%`, bottom: `${crop.bottom * 100}%`, width: `${crop.left * 100}%` }} />
              <div className="absolute right-0 bg-black/50" style={{ top: `${crop.top * 100}%`, bottom: `${crop.bottom * 100}%`, width: `${crop.right * 100}%` }} />
              {/* Border around crop area */}
              <div className="absolute border-2 border-white/80" style={{ left: `${crop.left * 100}%`, top: `${crop.top * 100}%`, right: `${crop.right * 100}%`, bottom: `${crop.bottom * 100}%` }} />
              {/* Grid lines (rule of thirds) */}
              <div className="absolute border-l border-white/30" style={{ left: `${crop.left * 100 + (100 - crop.left * 100 - crop.right * 100) / 3}%`, top: `${crop.top * 100}%`, bottom: `${crop.bottom * 100}%` }} />
              <div className="absolute border-l border-white/30" style={{ left: `${crop.left * 100 + (100 - crop.left * 100 - crop.right * 100) * 2 / 3}%`, top: `${crop.top * 100}%`, bottom: `${crop.bottom * 100}%` }} />
              <div className="absolute border-t border-white/30" style={{ top: `${crop.top * 100 + (100 - crop.top * 100 - crop.bottom * 100) / 3}%`, left: `${crop.left * 100}%`, right: `${crop.right * 100}%` }} />
              <div className="absolute border-t border-white/30" style={{ top: `${crop.top * 100 + (100 - crop.top * 100 - crop.bottom * 100) * 2 / 3}%`, left: `${crop.left * 100}%`, right: `${crop.right * 100}%` }} />
            </div>

            {/* Edge handles */}
            <div onMouseDown={(e) => handleMouseDown("top", e)} onTouchStart={(e) => handleMouseDown("top", e)}
              className="absolute left-1/2 -translate-x-1/2 h-4 w-12 cursor-ns-resize z-10 flex items-center justify-center" style={{ top: `calc(${crop.top * 100}% - 8px)` }}>
              <div className="w-8 h-1.5 bg-white rounded-full shadow" />
            </div>
            <div onMouseDown={(e) => handleMouseDown("bottom", e)} onTouchStart={(e) => handleMouseDown("bottom", e)}
              className="absolute left-1/2 -translate-x-1/2 h-4 w-12 cursor-ns-resize z-10 flex items-center justify-center" style={{ bottom: `calc(${crop.bottom * 100}% - 8px)` }}>
              <div className="w-8 h-1.5 bg-white rounded-full shadow" />
            </div>
            <div onMouseDown={(e) => handleMouseDown("left", e)} onTouchStart={(e) => handleMouseDown("left", e)}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-12 cursor-ew-resize z-10 flex items-center justify-center" style={{ left: `calc(${crop.left * 100}% - 8px)` }}>
              <div className="h-8 w-1.5 bg-white rounded-full shadow" />
            </div>
            <div onMouseDown={(e) => handleMouseDown("right", e)} onTouchStart={(e) => handleMouseDown("right", e)}
              className="absolute top-1/2 -translate-y-1/2 w-4 h-12 cursor-ew-resize z-10 flex items-center justify-center" style={{ right: `calc(${crop.right * 100}% - 8px)` }}>
              <div className="h-8 w-1.5 bg-white rounded-full shadow" />
            </div>

            {/* Corner handles */}
            <div onMouseDown={(e) => handleMouseDown("tl", e)} onTouchStart={(e) => handleMouseDown("tl", e)}
              className="absolute w-5 h-5 bg-white rounded-full shadow-lg cursor-nwse-resize z-20 -translate-x-1/2 -translate-y-1/2"
              style={{ left: `${crop.left * 100}%`, top: `${crop.top * 100}%` }} />
            <div onMouseDown={(e) => handleMouseDown("tr", e)} onTouchStart={(e) => handleMouseDown("tr", e)}
              className="absolute w-5 h-5 bg-white rounded-full shadow-lg cursor-nesw-resize z-20 translate-x-1/2 -translate-y-1/2"
              style={{ right: `${crop.right * 100}%`, top: `${crop.top * 100}%` }} />
            <div onMouseDown={(e) => handleMouseDown("bl", e)} onTouchStart={(e) => handleMouseDown("bl", e)}
              className="absolute w-5 h-5 bg-white rounded-full shadow-lg cursor-nesw-resize z-20 -translate-x-1/2 translate-y-1/2"
              style={{ left: `${crop.left * 100}%`, bottom: `${crop.bottom * 100}%` }} />
            <div onMouseDown={(e) => handleMouseDown("br", e)} onTouchStart={(e) => handleMouseDown("br", e)}
              className="absolute w-5 h-5 bg-white rounded-full shadow-lg cursor-nwse-resize z-20 translate-x-1/2 translate-y-1/2"
              style={{ right: `${crop.right * 100}%`, bottom: `${crop.bottom * 100}%` }} />
          </div>

          {/* Info + presets */}
          <div className="flex justify-center gap-4 mt-4 text-xs text-[var(--muted-foreground)]">
            <span>Output: {cropW} × {cropH} px</span>
          </div>
          <div className="flex justify-center gap-2 mt-3 flex-wrap">
            <button onClick={() => setCrop({ left: 0, top: 0, right: 0, bottom: 0 })} className="px-3 py-1 rounded-lg text-xs bg-[var(--muted)] hover:bg-[var(--accent)]">Full image</button>
            <button onClick={() => { const s = Math.min(imgSize.w, imgSize.h); const lx = (imgSize.w - s) / 2 / imgSize.w; const ly = (imgSize.h - s) / 2 / imgSize.h; setCrop({ left: lx, top: ly, right: lx, bottom: ly }); }} className="px-3 py-1 rounded-lg text-xs bg-[var(--muted)] hover:bg-[var(--accent)]">Square (1:1)</button>
            <button onClick={() => { const targetRatio = 16/9; const currentRatio = imgSize.w / imgSize.h; if (currentRatio > targetRatio) { const w = imgSize.h * targetRatio; const margin = (imgSize.w - w) / 2 / imgSize.w; setCrop({ left: margin, top: 0, right: margin, bottom: 0 }); } else { const h = imgSize.w / targetRatio; const margin = (imgSize.h - h) / 2 / imgSize.h; setCrop({ left: 0, top: margin, right: 0, bottom: margin }); } }} className="px-3 py-1 rounded-lg text-xs bg-[var(--muted)] hover:bg-[var(--accent)]">16:9</button>
            <button onClick={() => { const targetRatio = 4/3; const currentRatio = imgSize.w / imgSize.h; if (currentRatio > targetRatio) { const w = imgSize.h * targetRatio; const margin = (imgSize.w - w) / 2 / imgSize.w; setCrop({ left: margin, top: 0, right: margin, bottom: 0 }); } else { const h = imgSize.w / targetRatio; const margin = (imgSize.h - h) / 2 / imgSize.h; setCrop({ left: 0, top: margin, right: 0, bottom: margin }); } }} className="px-3 py-1 rounded-lg text-xs bg-[var(--muted)] hover:bg-[var(--accent)]">4:3</button>
            <button onClick={() => { const targetRatio = 3/4; const currentRatio = imgSize.w / imgSize.h; if (currentRatio > targetRatio) { const w = imgSize.h * targetRatio; const margin = (imgSize.w - w) / 2 / imgSize.w; setCrop({ left: margin, top: 0, right: margin, bottom: 0 }); } else { const h = imgSize.w / targetRatio; const margin = (imgSize.h - h) / 2 / imgSize.h; setCrop({ left: 0, top: margin, right: 0, bottom: margin }); } }} className="px-3 py-1 rounded-lg text-xs bg-[var(--muted)] hover:bg-[var(--accent)]">3:4 (Portrait)</button>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 flex justify-center">
          <ProcessingButton onClick={handleCrop} isProcessing={isProcessing} isComplete={isComplete} label="Crop & Download" />
        </div>
      )}
    </div>
  );
}
