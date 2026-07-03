"use client";

import { useState } from "react";
import { Sparkles, ArrowLeft, Download, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";

export default function ImageUpscaler() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState("");
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
  const [newSize, setNewSize] = useState({ w: 0, h: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setResultUrl(null);
    setResultBlob(null);
    if (originalUrl) URL.revokeObjectURL(originalUrl);
    setOriginalUrl(URL.createObjectURL(newFiles[0]));
  };

  const handleUpscale = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress("Loading AI model...");
    try {
      const Upscaler = (await import("upscaler")).default;
      const upscaler = new Upscaler();

      setProgress("Enhancing image (this may take 10-30 seconds)...");

      // Load image
      const img = new window.Image();
      const url = URL.createObjectURL(files[0]);
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });
      URL.revokeObjectURL(url);

      setOriginalSize({ w: img.width, h: img.height });

      // Upscale with AI
      const upscaledSrc = await upscaler.upscale(img, {
        patchSize: 64,
        padding: 2,
        progress: (p: number) => {
          setProgress(`Enhancing... ${Math.round(p * 100)}%`);
        },
      });

      // Convert result to blob
      const resultImg = new window.Image();
      await new Promise((resolve) => { resultImg.onload = resolve; resultImg.src = upscaledSrc; });

      setNewSize({ w: resultImg.width, h: resultImg.height });

      const canvas = document.createElement("canvas");
      canvas.width = resultImg.width;
      canvas.height = resultImg.height;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(resultImg, 0, 0);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultBlob(blob);
      setProgress("");

      // Cleanup
      upscaler.dispose();
    } catch (error) {
      console.error(error);
      alert("Error upscaling image. Try a smaller image or refresh the page.");
      setProgress("");
    } finally { setIsProcessing(false); }
  };

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `upscaled-${files[0]?.name?.replace(/\.\w+$/, ".png") || "image.png"}`;
    a.click();
  };

  const shareResult = async () => {
    if (!resultBlob) return;
    const file = new File([resultBlob], "upscaled-image.png", { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "AI Upscaled Image" });
    } else { downloadResult(); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-500 flex items-center justify-center shadow-lg">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">AI Image Upscaler</h1>
            <p className="text-[var(--muted-foreground)]">Enhance resolution & clarity using AI — no face modification</p>
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

      {/* Process */}
      {files.length > 0 && !resultUrl && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <button onClick={handleUpscale} disabled={isProcessing}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${isProcessing ? "bg-amber-500 text-white opacity-80 cursor-wait" : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95"}`}>
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />{progress}</>) : (<><Sparkles className="w-5 h-5" />Enhance Image (AI 2x)</>)}
          </button>
          {!isProcessing && (
            <p className="text-xs text-[var(--muted-foreground)] text-center max-w-md">
              Increases resolution 2x using AI neural network. Does NOT modify faces or add fake details — only enhances what&apos;s already there.
            </p>
          )}
        </div>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="mt-8 space-y-6">
          {/* Size comparison */}
          <div className="flex justify-center gap-4 text-sm">
            <div className="px-4 py-2 rounded-xl bg-[var(--muted)]">
              <span className="text-[var(--muted-foreground)]">Before:</span> <strong>{originalSize.w}x{originalSize.h}</strong>
            </div>
            <div className="px-4 py-2 rounded-xl bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400">
              <span>After:</span> <strong>{newSize.w}x{newSize.h}</strong> ({Math.round(newSize.w / originalSize.w)}x)
            </div>
          </div>

          {/* Before/After */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-center text-[var(--muted-foreground)]">Original (low-res)</div>
              {originalUrl && <img src={originalUrl} alt="Original" className="w-full object-contain max-h-[350px] image-pixelated" />}
            </div>
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-center text-green-600 dark:text-green-400">AI Enhanced (2x)</div>
              <img src={resultUrl} alt="Upscaled" className="w-full object-contain max-h-[350px]" />
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3 flex-wrap">
            <button onClick={downloadResult}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
              <Download className="w-4 h-4" /> Download Enhanced
            </button>
            <button onClick={shareResult}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
              <Share2 className="w-4 h-4" /> Share
            </button>
            <button onClick={() => { setResultUrl(null); setResultBlob(null); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--border)] font-semibold hover:border-[var(--primary)] transition-all">
              Try Another
            </button>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-10 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)] max-w-2xl mx-auto">
        <h3 className="font-semibold mb-2 text-center">About AI Upscaling</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li>Increases image resolution 2x using a neural network</li>
          <li>Does NOT modify, alter, or generate faces — only sharpens existing pixels</li>
          <li>Best for: blurry photos, small screenshots, low-res form photos</li>
          <li>First use downloads model (~2MB), subsequent uses are faster</li>
          <li>100% private — image never leaves your device</li>
          <li>Works best on images under 1000x1000px (larger images take longer)</li>
        </ul>
      </div>
    </div>
  );
}
