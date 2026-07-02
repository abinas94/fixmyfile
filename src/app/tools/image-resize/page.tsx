"use client";

import { useState } from "react";
import { Scaling, ArrowLeft, Lock, Unlock } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function ImageResize() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [width, setWidth] = useState(800);
  const [height, setHeight] = useState(600);
  const [lockAspect, setLockAspect] = useState(true);
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
  const [mode, setMode] = useState<"pixels" | "percent">("pixels");
  const [percent, setPercent] = useState(50);

  const handleFilesSelected = (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setIsComplete(false);
    const img = new window.Image();
    img.onload = () => {
      setOriginalSize({ w: img.width, h: img.height });
      setWidth(img.width);
      setHeight(img.height);
    };
    img.src = URL.createObjectURL(file);
  };

  const handleWidthChange = (val: number) => {
    setWidth(val);
    if (lockAspect && originalSize.w > 0) {
      setHeight(Math.round((val / originalSize.w) * originalSize.h));
    }
  };

  const handleHeightChange = (val: number) => {
    setHeight(val);
    if (lockAspect && originalSize.h > 0) {
      setWidth(Math.round((val / originalSize.h) * originalSize.w));
    }
  };

  const handleResize = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const img = new window.Image();
      const url = URL.createObjectURL(files[0]);
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });

      let targetW = width, targetH = height;
      if (mode === "percent") {
        targetW = Math.round(img.width * percent / 100);
        targetH = Math.round(img.height * percent / 100);
      }

      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0, targetW, targetH);
      URL.revokeObjectURL(url);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), files[0].type || "image/png", 0.92);
      });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `resized-${files[0].name}`;
      a.click();
      URL.revokeObjectURL(a.href);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error resizing image.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-fuchsia-500 to-pink-600 flex items-center justify-center shadow-lg">
            <Scaling className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Resize Image</h1>
            <p className="text-[var(--muted-foreground)]">Resize to exact dimensions or percentage</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)] mb-4">
            Original: {originalSize.w} x {originalSize.h}px
          </p>
          <div className="flex gap-3 mb-4">
            <button onClick={() => setMode("pixels")}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${mode === "pixels" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
              By Pixels
            </button>
            <button onClick={() => setMode("percent")}
              className={`px-4 py-2 rounded-xl text-sm font-medium ${mode === "percent" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
              By Percentage
            </button>
          </div>

          {mode === "pixels" ? (
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Width (px)</label>
                <input type="number" min={1} value={width} onChange={(e) => handleWidthChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
              </div>
              <button onClick={() => setLockAspect(!lockAspect)} className="mt-5 p-2 rounded-lg hover:bg-[var(--accent)]">
                {lockAspect ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </button>
              <div className="flex-1">
                <label className="block text-xs font-medium mb-1">Height (px)</label>
                <input type="number" min={1} value={height} onChange={(e) => handleHeightChange(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
              </div>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium mb-2">Scale: {percent}%</label>
              <input type="range" min={10} max={200} value={percent} onChange={(e) => setPercent(Number(e.target.value))}
                className="w-full accent-[var(--primary)]" />
              <p className="text-xs text-[var(--muted-foreground)] mt-1">
                Output: {Math.round(originalSize.w * percent / 100)} x {Math.round(originalSize.h * percent / 100)}px
              </p>
            </div>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleResize} isProcessing={isProcessing} isComplete={isComplete} label="Resize & Download" />
        </div>
      )}
    </div>
  );
}
