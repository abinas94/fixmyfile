"use client";

import { useState } from "react";
import { Minimize2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import ToolContent from "@/components/ToolContent";
import { toolContentData } from "@/lib/tool-content-data";

export default function PPTCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [quality, setQuality] = useState(0.6);
  const [maxDimension, setMaxDimension] = useState(1920);
  const [result, setResult] = useState<{ original: number; compressed: number } | null>(null);

  const handleCompress = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const file = files[0];
      const originalSize = file.size;
      const arrayBuffer = await file.arrayBuffer();
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Compress images inside the pptx (they're in ppt/media/)
      const mediaFiles = Object.keys(zip.files).filter((name) => name.startsWith("ppt/media/"));

      for (const mediaFile of mediaFiles) {
        const ext = mediaFile.split(".").pop()?.toLowerCase();
        if (ext === "png" || ext === "jpg" || ext === "jpeg") {
          const imgData = await zip.file(mediaFile)!.async("arraybuffer");

          // Decode the embedded image
          const blob = new Blob([imgData]);
          const bitmap = await createImageBitmap(blob);

          // Downscale oversized images — the single biggest source of PPT bloat.
          // Slides display at ~1920px wide at most; images larger than that are wasted data.
          let targetW = bitmap.width;
          let targetH = bitmap.height;
          if (maxDimension > 0 && Math.max(bitmap.width, bitmap.height) > maxDimension) {
            const scale = maxDimension / Math.max(bitmap.width, bitmap.height);
            targetW = Math.round(bitmap.width * scale);
            targetH = Math.round(bitmap.height * scale);
          }

          const canvas = document.createElement("canvas");
          canvas.width = targetW;
          canvas.height = targetH;
          const ctx = canvas.getContext("2d")!;
          // White matte so transparent PNGs don't turn black when re-encoded as JPEG
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetW, targetH);
          ctx.drawImage(bitmap, 0, 0, targetW, targetH);
          bitmap.close();

          const compressedBlob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/jpeg", quality);
          });

          const compressedBuffer = await compressedBlob.arrayBuffer();
          // Only replace if the result is actually smaller
          if (compressedBuffer.byteLength < imgData.byteLength) {
            zip.file(mediaFile, compressedBuffer);
          }
        }
      }

      // Re-package with maximum compression
      const compressedBlob = await zip.generateAsync({ 
        type: "blob", 
        compression: "DEFLATE", 
        compressionOptions: { level: 9 } 
      });

      setResult({ original: originalSize, compressed: compressedBlob.size });

      const url = URL.createObjectURL(compressedBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `compressed-${file.name}`;
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error compressing PPT. Make sure it's a valid .pptx file.");
    } finally { setIsProcessing(false); }
  };

  const formatSize = (bytes: number) => bytes < 1024 * 1024 ? `${(bytes / 1024).toFixed(1)} KB` : `${(bytes / (1024 * 1024)).toFixed(2)} MB`;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-600 to-red-600 flex items-center justify-center shadow-lg">
            <Minimize2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Compress PPT</h1>
            <p className="text-[var(--muted-foreground)]">Reduce PowerPoint (PPTX) file size online free — shrink image-heavy presentations for email</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); setResult(null); }} accept=".pptx" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setResult(null); }} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <label className="block text-sm font-medium mb-2">Image Quality: {Math.round(quality * 100)}%</label>
          <input type="range" min={0.2} max={0.95} step={0.05} value={quality}
            onChange={(e) => { setQuality(Number(e.target.value)); setIsComplete(false); }}
            className="w-full accent-[var(--primary)]" />
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
            <span>Smaller file</span><span>Better quality</span>
          </div>

          <label className="block text-sm font-medium mb-2 mt-5">Max image resolution</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {[
              { v: 1280, label: "720p — smallest" },
              { v: 1920, label: "1080p — balanced" },
              { v: 2560, label: "1440p — sharp" },
              { v: 0, label: "Keep original" },
            ].map((opt) => (
              <button key={opt.v} onClick={() => { setMaxDimension(opt.v); setIsComplete(false); }}
                className={`px-2 py-2 rounded-xl text-xs border transition-all ${maxDimension === opt.v ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20 font-semibold" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                {opt.label}
              </button>
            ))}
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            Shrinking oversized images is usually where the biggest size savings come from. 1080p is plenty for on-screen slides and most projectors.
          </p>
        </div>
      )}

      {result && (
        <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex justify-between items-center">
            <div>
              <p className="text-sm text-green-800 dark:text-green-300">Original: {formatSize(result.original)}</p>
              <p className="text-sm text-green-800 dark:text-green-300">Compressed: {formatSize(result.compressed)}</p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">{Math.max(0, Math.round(((result.original - result.compressed) / result.original) * 100))}%</p>
              <p className="text-xs text-green-700 dark:text-green-400">reduced</p>
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleCompress} isProcessing={isProcessing} isComplete={isComplete} label="Compress & Download" />
        </div>
      )}
    
      <ToolContent {...toolContentData.pptCompress} />
    </div>
  );
}
