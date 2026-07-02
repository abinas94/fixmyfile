"use client";

import { useState } from "react";
import { Stamp, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function ImageWatermark() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [text, setText] = useState("SAMPLE");
  const [fontSize, setFontSize] = useState(48);
  const [opacity, setOpacity] = useState(0.3);
  const [rotation, setRotation] = useState(-30);

  const handleProcess = async () => {
    if (!files.length || !text.trim()) return;
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

      // Apply tiled watermark
      ctx.globalAlpha = opacity;
      ctx.font = `bold ${fontSize}px Arial`;
      ctx.fillStyle = "#888888";
      ctx.textAlign = "center";

      const stepX = fontSize * text.length * 0.7;
      const stepY = fontSize * 3;

      for (let y = -canvas.height; y < canvas.height * 2; y += stepY) {
        for (let x = -canvas.width; x < canvas.width * 2; x += stepX) {
          ctx.save();
          ctx.translate(x, y);
          ctx.rotate((rotation * Math.PI) / 180);
          ctx.fillText(text, 0, 0);
          ctx.restore();
        }
      }

      ctx.globalAlpha = 1;
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), files[0].type || "image/png", 0.92);
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `watermarked-${files[0].name}`;
      a.click();
      URL.revokeObjectURL(a.href);
      setIsComplete(true);
    } catch (error) { console.error(error); alert("Error adding watermark."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-pink-400 to-rose-500 flex items-center justify-center shadow-lg">
            <Stamp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Watermark Image</h1>
            <p className="text-[var(--muted-foreground)]">Add tiled text watermark to images</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Watermark Text</label>
            <input type="text" value={text} onChange={(e) => setText(e.target.value)} className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Size: {fontSize}px</label>
            <input type="range" min={16} max={120} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Opacity: {Math.round(opacity * 100)}%</label>
            <input type="range" min={0.05} max={1} step={0.05} value={opacity} onChange={(e) => setOpacity(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Rotation: {rotation}°</label>
            <input type="range" min={-90} max={90} value={rotation} onChange={(e) => setRotation(Number(e.target.value))} className="w-full accent-[var(--primary)]" />
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleProcess} isProcessing={isProcessing} isComplete={isComplete} label="Add Watermark & Download" disabled={!text.trim()} />
        </div>
      )}
    </div>
  );
}
