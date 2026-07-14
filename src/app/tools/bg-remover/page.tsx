
"use client";

import { useState, useRef } from "react";
import { Eraser, ArrowLeft, Download, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ToolContent from "@/components/ToolContent";
import { toolContentData } from "@/lib/tool-content-data";

export default function BackgroundRemover() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setResultUrl(null);
    setResultBlob(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(URL.createObjectURL(newFiles[0]));
  };

  const handleRemove = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress("Loading AI model (first time ~30s, then instant)...");
    try {
      const { removeBackground } = await import("@imgly/background-removal");

      setProgress("Analyzing image...");

      const blob = await removeBackground(files[0], {
        progress: (key: string, current: number, total: number) => {
          if (key === "compute:inference") {
            setProgress(`Removing background... ${Math.round((current / total) * 100)}%`);
          } else if (key === "fetch:model") {
            setProgress(`Downloading AI model... ${Math.round((current / total) * 100)}%`);
          }
        },
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultBlob(blob);
      setProgress("");
    } catch (error) {
      console.error(error);
      alert("Error removing background. Please try with a different image or refresh the page.");
      setProgress("");
    } finally { setIsProcessing(false); }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `no-bg-${files[0]?.name?.replace(/\.\w+$/, ".png") || "image.png"}`;
    a.click();
  };

  const shareResult = async () => {
    if (!resultBlob) return;
    const file = new File([resultBlob], "background-removed.png", { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Background Removed" });
    } else {
      downloadResult();
    }
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
            <p className="text-[var(--muted-foreground)]">AI-powered — works on any photo, any background</p>
          </div>
        </div>
      </div>

      {/* Upload */}
      <div className="flex justify-center">
        <div className="w-full max-w-2xl">
          <FileDropZone onFilesSelected={handleFilesSelected} accept="image/*" multiple={false} maxFiles={1} files={files}
            onRemoveFile={() => { setFiles([]); setResultUrl(null); setOriginalUrl(null); setResultBlob(null); }} />
        </div>
      </div>

      {/* Process button */}
      {files.length > 0 && !resultUrl && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <button onClick={handleRemove} disabled={isProcessing}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${isProcessing ? "bg-[var(--primary)] text-white opacity-80 cursor-wait" : "bg-gradient-to-r from-rose-500 to-purple-600 text-white hover:shadow-lg hover:shadow-rose-500/30 hover:scale-105 active:scale-95"}`}>
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />{progress || "Processing..."}</>) : (<><Eraser className="w-5 h-5" />Remove Background (AI)</>)}
          </button>
          {!isProcessing && (
            <p className="text-xs text-[var(--muted-foreground)] text-center">
              Uses AI neural network — works on any background (gradients, nature, studio, complex scenes)
            </p>
          )}
          {isProcessing && progress && (
            <p className="text-xs text-[var(--primary)] text-center font-medium">{progress}</p>
          )}
        </div>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="mt-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            {/* Original */}
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-center text-[var(--muted-foreground)]">Original</div>
              {originalUrl && <img src={originalUrl} alt="Original" className="w-full object-contain max-h-[350px]" />}
            </div>
            {/* Result */}
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-center text-[var(--muted-foreground)]">Background Removed</div>
              <div className="bg-[url('data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 width=%2220%22 height=%2220%22><rect width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/><rect x=%2210%22 y=%2210%22 width=%2210%22 height=%2210%22 fill=%22%23f0f0f0%22/></svg>')] bg-repeat">
                <img src={resultUrl} alt="Result" className="w-full object-contain max-h-[350px]" />
              </div>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={downloadResult}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
              <Download className="w-4 h-4" /> Download PNG
            </button>
            <button onClick={shareResult}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={() => { setResultUrl(null); setResultBlob(null); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--border)] font-semibold hover:border-[var(--primary)] transition-all">
              Try Another Photo
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-10 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)] max-w-2xl mx-auto">
        <h3 className="font-semibold mb-2 text-center">How it works</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li>Uses AI neural network (same tech as remove.bg) running in your browser</li>
          <li>Works on any background — gradients, nature, complex scenes, colored walls</li>
          <li>Detects people, objects, animals automatically</li>
          <li>First use downloads the model (~5MB) — subsequent uses are instant</li>
          <li>100% private — your photo never leaves your device</li>
          <li>Output is PNG with transparent background</li>
        </ul>
      </div>

      <ToolContent {...toolContentData.bgRemover} />
    </div>
  );
}
