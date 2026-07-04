"use client";

import { useState } from "react";
import { Sparkles, ArrowLeft, Download, Loader2, Share2 } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";

export default function ImageUpscaler() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [resultUrl, setResultUrl] = useState<string | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string | null>(null);
  const [originalSize, setOriginalSize] = useState({ w: 0, h: 0 });
  const [newSize, setNewSize] = useState({ w: 0, h: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const [scale, setScale] = useState(2);
  const [sharpen, setSharpen] = useState(true);

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
    try {
      const img = new window.Image();
      const url = URL.createObjectURL(files[0]);
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });
      URL.revokeObjectURL(url);

      setOriginalSize({ w: img.width, h: img.height });

      const targetW = Math.round(img.width * scale);
      const targetH = Math.round(img.height * scale);
      setNewSize({ w: targetW, h: targetH });

      // High-quality upscaling using multi-pass approach
      const canvas = document.createElement("canvas");
      canvas.width = targetW;
      canvas.height = targetH;
      const ctx = canvas.getContext("2d")!;

      // Step 1: Smooth upscale (bicubic interpolation via browser)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";
      ctx.drawImage(img, 0, 0, targetW, targetH);

      // Step 2: Apply sharpening filter (unsharp mask)
      if (sharpen) {
        const imageData = ctx.getImageData(0, 0, targetW, targetH);
        const sharpened = applySharpenFilter(imageData, targetW, targetH);
        ctx.putImageData(sharpened, 0, 0);
      }

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), "image/png");
      });

      if (resultUrl) URL.revokeObjectURL(resultUrl);
      setResultUrl(URL.createObjectURL(blob));
      setResultBlob(blob);
    } catch (error) {
      console.error(error);
      alert("Error enhancing image.");
    } finally { setIsProcessing(false); }
  };

  // Unsharp mask sharpening — enhances edges and details
  function applySharpenFilter(imageData: ImageData, width: number, height: number): ImageData {
    const data = imageData.data;
    const output = new Uint8ClampedArray(data.length);

    // Sharpen kernel: enhances edges without creating artifacts
    // Center = 5, sides = -1 (standard unsharp mask)
    const amount = 0.6; // Sharpening strength (0.3 = subtle, 1.0 = strong)

    for (let y = 1; y < height - 1; y++) {
      for (let x = 1; x < width - 1; x++) {
        const idx = (y * width + x) * 4;
        for (let c = 0; c < 3; c++) { // R, G, B channels
          const center = data[idx + c];
          const top = data[((y - 1) * width + x) * 4 + c];
          const bottom = data[((y + 1) * width + x) * 4 + c];
          const left = data[(y * width + (x - 1)) * 4 + c];
          const right = data[(y * width + (x + 1)) * 4 + c];

          // Unsharp mask: original + amount * (original - blurred)
          const blurred = (top + bottom + left + right) / 4;
          const sharpened = center + amount * (center - blurred);
          output[idx + c] = Math.min(255, Math.max(0, Math.round(sharpened)));
        }
        output[idx + 3] = data[idx + 3]; // Alpha unchanged
      }
    }

    // Copy border pixels unchanged
    for (let x = 0; x < width; x++) {
      const topIdx = x * 4;
      const bottomIdx = ((height - 1) * width + x) * 4;
      for (let c = 0; c < 4; c++) { output[topIdx + c] = data[topIdx + c]; output[bottomIdx + c] = data[bottomIdx + c]; }
    }
    for (let y = 0; y < height; y++) {
      const leftIdx = (y * width) * 4;
      const rightIdx = (y * width + (width - 1)) * 4;
      for (let c = 0; c < 4; c++) { output[leftIdx + c] = data[leftIdx + c]; output[rightIdx + c] = data[rightIdx + c]; }
    }

    return new ImageData(output, width, height);
  }

  const downloadResult = () => {
    if (!resultUrl) return;
    const a = document.createElement("a");
    a.href = resultUrl;
    a.download = `enhanced-${files[0]?.name?.replace(/\.\w+$/, ".png") || "image.png"}`;
    a.click();
  };

  const shareResult = async () => {
    if (!resultBlob) return;
    const file = new File([resultBlob], "enhanced-image.png", { type: "image/png" });
    if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
      await navigator.share({ files: [file], title: "Enhanced Image" });
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
            <h1 className="text-2xl sm:text-3xl font-bold">Image Enhancer</h1>
            <p className="text-[var(--muted-foreground)]">Upscale resolution + sharpen blurry images</p>
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

      {/* Settings + Process */}
      {files.length > 0 && !resultUrl && (
        <div className="mt-6 flex flex-col items-center gap-4 max-w-md mx-auto">
          <div className="w-full p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Upscale: {scale}x ({originalSize.w ? `${originalSize.w}→${originalSize.w * scale}px` : ""})</label>
              <div className="flex gap-2">
                {[2, 3, 4].map((s) => (
                  <button key={s} onClick={() => setScale(s)}
                    className={`flex-1 py-2 rounded-xl text-sm font-medium ${scale === s ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                    {s}x
                  </button>
                ))}
              </div>
            </div>
            <label className="flex items-center gap-3 cursor-pointer">
              <input type="checkbox" checked={sharpen} onChange={(e) => setSharpen(e.target.checked)} className="rounded" />
              <div>
                <span className="text-sm font-medium">Sharpen edges</span>
                <p className="text-xs text-[var(--muted-foreground)]">Enhances text and edge clarity</p>
              </div>
            </label>
          </div>

          <button onClick={handleUpscale} disabled={isProcessing}
            className={`flex items-center justify-center gap-2 px-8 py-4 rounded-xl font-semibold transition-all ${isProcessing ? "bg-amber-500 text-white opacity-80 cursor-wait" : "bg-gradient-to-r from-amber-500 to-yellow-500 text-white hover:shadow-lg hover:shadow-amber-500/30 hover:scale-105 active:scale-95"}`}>
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />Enhancing...</>) : (<><Sparkles className="w-5 h-5" />Enhance Image</>)}
          </button>
          <p className="text-xs text-[var(--muted-foreground)] text-center">
            Processes instantly — no heavy AI model, no freezing
          </p>
        </div>
      )}

      {/* Result */}
      {resultUrl && (
        <div className="mt-8 space-y-6">
          <div className="flex justify-center gap-4 text-sm">
            <div className="px-4 py-2 rounded-xl bg-[var(--muted)]">
              <span className="text-[var(--muted-foreground)]">Before:</span> <strong>{originalSize.w}x{originalSize.h}</strong>
            </div>
            <div className="px-4 py-2 rounded-xl border-2 border-green-500 text-green-700 dark:text-green-400">
              <span>After:</span> <strong>{newSize.w}x{newSize.h}</strong> ({scale}x)
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-3xl mx-auto">
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-center text-[var(--muted-foreground)]">Original</div>
              {originalUrl && <img src={originalUrl} alt="Original" className="w-full object-contain max-h-[350px]" style={{ imageRendering: "pixelated" }} />}
            </div>
            <div className="rounded-2xl border border-[var(--border)] overflow-hidden">
              <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-center text-green-600 dark:text-green-400">Enhanced ({scale}x)</div>
              <img src={resultUrl} alt="Enhanced" className="w-full object-contain max-h-[350px]" />
            </div>
          </div>

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
              Try Again
            </button>
          </div>
        </div>
      )}

      <div className="mt-10 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)] max-w-2xl mx-auto">
        <h3 className="font-semibold mb-2 text-center">How it works</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li>Upscales image resolution 2x, 3x, or 4x using high-quality interpolation</li>
          <li>Applies unsharp mask sharpening to enhance edges and text</li>
          <li>Does NOT modify faces or add fake details — only enhances existing pixels</li>
          <li>Processes instantly — no heavy downloads, no browser freezing</li>
          <li>Best for: blurry photos, small screenshots, low-res form uploads</li>
          <li>100% private — image never leaves your device</li>
        </ul>
      </div>
    </div>
  );
}
