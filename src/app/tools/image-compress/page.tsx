"use client";

import { useState } from "react";
import { FileDown, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function ImageCompress() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [quality, setQuality] = useState(0.7);
  const [result, setResult] = useState<{ original: number; compressed: number } | null>(null);

  const handleCompress = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const file = files[0];
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });

      const canvas = document.createElement("canvas");
      canvas.width = img.width;
      canvas.height = img.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);

      // Compress as JPEG (best compression)
      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/jpeg", quality);
      });

      setResult({ original: file.size, compressed: blob.size });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `compressed-${file.name.replace(/\.\w+$/, ".jpg")}`;
      a.click();
      URL.revokeObjectURL(a.href);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error compressing image.");
    } finally { setIsProcessing(false); }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <FileDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Compress Image</h1>
            <p className="text-[var(--muted-foreground)]">Reduce image file size with quality control</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); setResult(null); }} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setResult(null); }} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <label className="block text-sm font-medium mb-2">Quality: {Math.round(quality * 100)}%</label>
          <input type="range" min={0.1} max={1} step={0.05} value={quality}
            onChange={(e) => { setQuality(Number(e.target.value)); setIsComplete(false); }}
            className="w-full accent-[var(--primary)]" />
          <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
            <span>Smaller file</span>
            <span>Better quality</span>
          </div>
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
    </div>
  );
}
