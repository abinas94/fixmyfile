"use client";

import { useState } from "react";
import { RefreshCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

export default function ImageConvert() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [outputFormat, setOutputFormat] = useState<OutputFormat>("image/png");
  const [quality, setQuality] = useState(0.92);

  const formatExt: Record<OutputFormat, string> = {
    "image/png": ".png",
    "image/jpeg": ".jpg",
    "image/webp": ".webp",
  };

  const handleConvert = async () => {
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

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), outputFormat, quality);
      });

      const baseName = file.name.replace(/\.\w+$/, "");
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `${baseName}${formatExt[outputFormat]}`;
      a.click();
      URL.revokeObjectURL(a.href);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error converting image.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg">
            <RefreshCw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Convert Image</h1>
            <p className="text-[var(--muted-foreground)]">Convert between PNG, JPG, and WebP</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Output Format</label>
            <div className="flex gap-3">
              {([["image/png", "PNG"], ["image/jpeg", "JPG"], ["image/webp", "WebP"]] as const).map(([fmt, label]) => (
                <button key={fmt} onClick={() => { setOutputFormat(fmt); setIsComplete(false); }}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${outputFormat === fmt ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>
          {outputFormat !== "image/png" && (
            <div>
              <label className="block text-sm font-medium mb-2">Quality: {Math.round(quality * 100)}%</label>
              <input type="range" min={0.1} max={1} step={0.05} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[var(--primary)]" />
            </div>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert & Download" />
        </div>
      )}
    </div>
  );
}
