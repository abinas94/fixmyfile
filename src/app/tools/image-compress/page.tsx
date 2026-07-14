
"use client";

import { useState, useRef, useCallback } from "react";
import { FileDown, ArrowLeft, Download, Trash2, Image as ImageIcon } from "lucide-react";
import Link from "next/link";
import ToolContent from "@/components/ToolContent";
import { toolContentData } from "@/lib/tool-content-data";

interface ProcessedImage {
  id: string;
  originalFile: File;
  originalSize: number;
  originalUrl: string;
  compressedBlob: Blob | null;
  compressedSize: number;
  compressedUrl: string;
  outputFormat: string;
  reduction: number;
  status: "pending" | "processing" | "done" | "error";
  error?: string;
}

const OUTPUT_FORMATS = [
  { value: "same", label: "Same as input" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/png", label: "PNG" },
  { value: "image/webp", label: "WebP" },
  { value: "image/avif", label: "AVIF" },
  { value: "svg-optimize", label: "SVG (optimize)" },
];

export default function ImageCompress() {
  const [images, setImages] = useState<ProcessedImage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [quality, setQuality] = useState(0.75);
  const [outputFormat, setOutputFormat] = useState("same");
  const [compareIdx, setCompareIdx] = useState<number | null>(null);
  const [sliderPos, setSliderPos] = useState(50);
  const sliderRef = useRef<HTMLDivElement>(null);

  const handleFiles = useCallback(async (fileList: FileList | File[]) => {
    const files = Array.from(fileList);
    const newImages: ProcessedImage[] = [];

    for (const file of files) {
      // Handle zip files
      if (file.name.endsWith(".zip")) {
        const JSZip = (await import("jszip")).default;
        const zip = await JSZip.loadAsync(await file.arrayBuffer());
        for (const [name, entry] of Object.entries(zip.files)) {
          if (entry.dir) continue;
          const ext = name.split(".").pop()?.toLowerCase() || "";
          if (["jpg", "jpeg", "png", "webp", "avif", "heic", "heif", "svg", "gif", "bmp", "tiff", "tif"].includes(ext)) {
            const blob = await entry.async("blob");
            const imgFile = new File([blob], name, { type: getMimeType(ext) });
            newImages.push(createImageEntry(imgFile));
          }
        }
      } else {
        newImages.push(createImageEntry(file));
      }
    }

    setImages((prev) => [...prev, ...newImages]);
  }, []);

  const createImageEntry = (file: File): ProcessedImage => ({
    id: Math.random().toString(36).slice(2),
    originalFile: file,
    originalSize: file.size,
    originalUrl: URL.createObjectURL(file),
    compressedBlob: null,
    compressedSize: 0,
    compressedUrl: "",
    outputFormat: "",
    reduction: 0,
    status: "pending",
  });

  const processAll = async () => {
    setIsProcessing(true);
    const updated = [...images];

    for (let i = 0; i < updated.length; i++) {
      if (updated[i].status === "done") continue;
      updated[i].status = "processing";
      setImages([...updated]);

      try {
        const result = await compressImage(updated[i].originalFile, quality, outputFormat);
        updated[i].compressedBlob = result.blob;
        updated[i].compressedSize = result.blob.size;
        updated[i].compressedUrl = URL.createObjectURL(result.blob);
        updated[i].outputFormat = result.format;
        updated[i].reduction = Math.max(0, Math.round(((updated[i].originalSize - result.blob.size) / updated[i].originalSize) * 100));
        updated[i].status = "done";
      } catch (err: any) {
        updated[i].status = "error";
        updated[i].error = err.message || "Failed";
      }
      setImages([...updated]);
    }

    setIsProcessing(false);
  };

  const downloadAll = async () => {
    const doneImages = images.filter((img) => img.status === "done" && img.compressedBlob);
    if (doneImages.length === 1) {
      const img = doneImages[0];
      const ext = getExtFromMime(img.outputFormat);
      const a = document.createElement("a");
      a.href = img.compressedUrl;
      a.download = img.originalFile.name.replace(/\.\w+$/, `.${ext}`);
      a.click();
      return;
    }

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const img of doneImages) {
      const ext = getExtFromMime(img.outputFormat);
      const name = img.originalFile.name.replace(/\.\w+$/, `.${ext}`);
      zip.file(name, img.compressedBlob!);
    }
    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "compressed-images.zip";
    a.click();
  };

  const removeImage = (id: string) => {
    setImages((prev) => prev.filter((img) => img.id !== id));
    if (compareIdx !== null) setCompareIdx(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files);
  };

  const handleSliderMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!sliderRef.current) return;
    const rect = sliderRef.current.getBoundingClientRect();
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const pos = Math.max(0, Math.min(100, ((clientX - rect.left) / rect.width) * 100));
    setSliderPos(pos);
  };

  const totalOriginal = images.reduce((s, i) => s + i.originalSize, 0);
  const totalCompressed = images.filter((i) => i.status === "done").reduce((s, i) => s + i.compressedSize, 0);
  const doneCount = images.filter((i) => i.status === "done").length;

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <FileDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Image Compressor</h1>
            <p className="text-[var(--muted-foreground)]">Compress & convert images — JPEG, PNG, WebP, AVIF, HEIC, SVG</p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => e.preventDefault()}
        className="border-2 border-dashed border-[var(--border)] rounded-2xl p-8 text-center hover:border-[var(--primary)] transition-colors cursor-pointer"
        onClick={() => document.getElementById("file-input")?.click()}
      >
        <ImageIcon className="w-10 h-10 mx-auto mb-3 text-[var(--muted-foreground)]" />
        <p className="text-sm font-medium mb-1">Drop images, folders, or a .zip file</p>
        <p className="text-xs text-[var(--muted-foreground)]">
          Supports: JPEG, PNG, WebP, AVIF, HEIC/HEIF, SVG, GIF, BMP, TIFF
        </p>
        <input
          id="file-input"
          type="file"
          accept="image/*,.heic,.heif,.svg,.avif,.webp,.zip"
          multiple
          className="hidden"
          onChange={(e) => e.target.files && handleFiles(e.target.files)}
        />
      </div>

      {/* Settings */}
      {images.length > 0 && (
        <div className="mt-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs font-medium mb-2 block">Quality: {Math.round(quality * 100)}%</label>
              <input
                type="range" min={0.1} max={1} step={0.05} value={quality}
                onChange={(e) => setQuality(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <div className="flex justify-between text-[10px] text-[var(--muted-foreground)] mt-1">
                <span>Smallest file</span>
                <span>Best quality</span>
              </div>
            </div>
            <div>
              <label className="text-xs font-medium mb-2 block">Output Format</label>
              <select
                value={outputFormat}
                onChange={(e) => setOutputFormat(e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm"
              >
                {OUTPUT_FORMATS.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-2 justify-center">
            <button
              onClick={processAll}
              disabled={isProcessing}
              className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
            >
              {isProcessing ? "Compressing..." : `Compress ${images.length} image${images.length > 1 ? "s" : ""}`}
            </button>
            {doneCount > 0 && (
              <button
                onClick={downloadAll}
                className="px-6 py-2.5 rounded-xl bg-green-600 text-white font-semibold hover:opacity-90 flex items-center gap-2"
              >
                <Download className="w-4 h-4" />
                Download {doneCount > 1 ? "All (.zip)" : ""}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Stats */}
      {doneCount > 0 && (
        <div className="mt-4 p-4 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex justify-between items-center">
            <div className="text-sm">
              <p><span className="font-medium">Original:</span> {formatSize(totalOriginal)}</p>
              <p><span className="font-medium">Compressed:</span> {formatSize(totalCompressed)}</p>
            </div>
            <div className="text-right">
              <p className="text-3xl font-bold text-green-600">
                {totalOriginal > 0 ? Math.max(0, Math.round(((totalOriginal - totalCompressed) / totalOriginal) * 100)) : 0}%
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">total saved</p>
            </div>
          </div>
        </div>
      )}

      {/* Image List */}
      {images.length > 0 && (
        <div className="mt-6 space-y-2">
          {images.map((img, idx) => (
            <div key={img.id} className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <img src={img.originalUrl} alt="" className="w-10 h-10 rounded object-cover flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className="text-xs font-medium truncate">{img.originalFile.name}</p>
                <p className="text-[10px] text-[var(--muted-foreground)]">
                  {formatSize(img.originalSize)}
                  {img.status === "done" && ` → ${formatSize(img.compressedSize)} (-${img.reduction}%)`}
                  {img.status === "processing" && " — compressing..."}
                  {img.status === "error" && ` — Error: ${img.error}`}
                </p>
              </div>
              {img.status === "done" && (
                <button
                  onClick={() => setCompareIdx(compareIdx === idx ? null : idx)}
                  className="px-2 py-1 rounded text-[10px] font-medium bg-[var(--muted)] hover:bg-[var(--accent)]"
                >
                  Compare
                </button>
              )}
              <button onClick={() => removeImage(img.id)} className="p-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                <Trash2 className="w-3.5 h-3.5 text-red-500" />
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Before/After Slider */}
      {compareIdx !== null && images[compareIdx]?.status === "done" && (
        <div className="mt-6 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-xs font-medium mb-3 text-center">Before / After Comparison</p>
          <div
            ref={sliderRef}
            className="relative w-full aspect-video rounded-lg overflow-hidden cursor-col-resize select-none"
            onMouseMove={handleSliderMove}
            onTouchMove={handleSliderMove}
          >
            {/* After (compressed) - full width background */}
            <img src={images[compareIdx].compressedUrl} alt="After" className="absolute inset-0 w-full h-full object-contain bg-gray-100 dark:bg-gray-900" />
            {/* Before (original) - clipped */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
              <img src={images[compareIdx].originalUrl} alt="Before" className="w-full h-full object-contain bg-gray-100 dark:bg-gray-900" style={{ width: `${(100 / sliderPos) * 100}%`, maxWidth: "none" }} />
            </div>
            {/* Slider line */}
            <div className="absolute top-0 bottom-0 w-0.5 bg-white shadow-lg" style={{ left: `${sliderPos}%` }}>
              <div className="absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-8 h-8 rounded-full bg-white shadow-lg flex items-center justify-center">
                <span className="text-[10px] font-bold text-gray-600">⟷</span>
              </div>
            </div>
            {/* Labels */}
            <div className="absolute top-2 left-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">Original</div>
            <div className="absolute top-2 right-2 px-2 py-0.5 rounded bg-black/60 text-white text-[10px]">Compressed</div>
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          100% local — images never leave your device. Supports JPEG, PNG (with transparency), WebP, AVIF, HEIC/HEIF, SVG, GIF, BMP, TIFF.
          SVGs are optimized using SVGO. HEIC files are decoded locally.
        </p>
      </div>

      <ToolContent {...toolContentData.imageCompress} />
    </div>
  );
}

// ============================================================
// Core compression logic
// ============================================================

async function compressImage(file: File, quality: number, targetFormat: string): Promise<{ blob: Blob; format: string }> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "";
  const isSvg = ext === "svg" || file.type === "image/svg+xml";
  const isHeic = ext === "heic" || ext === "heif" || file.type === "image/heic" || file.type === "image/heif";

  // SVG optimization
  if (isSvg && (targetFormat === "same" || targetFormat === "svg-optimize")) {
    return optimizeSvg(file);
  }

  // SVG to raster conversion
  if (isSvg && targetFormat !== "same" && targetFormat !== "svg-optimize") {
    return svgToRaster(file, quality, targetFormat);
  }

  // Decode HEIC first
  let imgSource: Blob = file;
  if (isHeic) {
    const heic2any = (await import("heic2any")).default;
    const converted = await heic2any({ blob: file, toType: "image/png", quality: 1 });
    imgSource = Array.isArray(converted) ? converted[0] : converted;
  }

  // Determine output format
  let outMime: string;
  if (targetFormat === "same") {
    if (isHeic) outMime = "image/jpeg"; // HEIC can't be output by canvas
    else if (file.type === "image/png") outMime = "image/png";
    else if (file.type === "image/webp") outMime = "image/webp";
    else if (file.type === "image/avif") outMime = "image/avif";
    else outMime = "image/jpeg";
  } else if (targetFormat === "svg-optimize") {
    outMime = "image/png"; // If non-SVG file but SVG format selected, output PNG
  } else {
    outMime = targetFormat;
  }

  // Load image
  const img = new window.Image();
  const url = URL.createObjectURL(imgSource);
  await new Promise<void>((resolve, reject) => {
    img.onload = () => resolve();
    img.onerror = () => reject(new Error("Failed to load image"));
    img.src = url;
  });
  URL.revokeObjectURL(url);

  // Draw to canvas
  const canvas = document.createElement("canvas");
  canvas.width = img.naturalWidth;
  canvas.height = img.naturalHeight;
  const ctx = canvas.getContext("2d")!;

  // For PNG/WebP with transparency, don't fill white background
  if (outMime === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0);

  // Compress
  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => {
        if (b) resolve(b);
        else reject(new Error(`Browser doesn't support ${outMime} encoding`));
      },
      outMime,
      outMime === "image/png" ? undefined : quality
    );
  });

  return { blob, format: outMime };
}

async function optimizeSvg(file: File): Promise<{ blob: Blob; format: string }> {
  const text = await file.text();
  // Use svgo/browser which doesn't require Node.js fs
  const { optimize } = await import("svgo/browser");
  const result = optimize(text, {
    multipass: true,
    plugins: [
      "preset-default",
    ],
  });
  const blob = new Blob([result.data], { type: "image/svg+xml" });
  return { blob, format: "image/svg+xml" };
}

async function svgToRaster(file: File, quality: number, targetFormat: string): Promise<{ blob: Blob; format: string }> {
  const text = await file.text();
  const img = new window.Image();
  const svgBlob = new Blob([text], { type: "image/svg+xml" });
  const url = URL.createObjectURL(svgBlob);

  await new Promise<void>((resolve) => {
    img.onload = () => resolve();
    img.src = url;
  });
  URL.revokeObjectURL(url);

  // Supersample at 2x for sharp edges
  const scale = 2;
  const canvas = document.createElement("canvas");
  canvas.width = (img.naturalWidth || 800) * scale;
  canvas.height = (img.naturalHeight || 600) * scale;
  const ctx = canvas.getContext("2d")!;

  if (targetFormat === "image/jpeg") {
    ctx.fillStyle = "#FFFFFF";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }
  ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

  const blob = await new Promise<Blob>((resolve, reject) => {
    canvas.toBlob(
      (b) => b ? resolve(b) : reject(new Error("Rasterization failed")),
      targetFormat,
      targetFormat === "image/png" ? undefined : quality
    );
  });

  return { blob, format: targetFormat };
}

// ============================================================
// Helpers
// ============================================================

function getMimeType(ext: string): string {
  const map: Record<string, string> = {
    jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png", webp: "image/webp",
    avif: "image/avif", heic: "image/heic", heif: "image/heif", svg: "image/svg+xml",
    gif: "image/gif", bmp: "image/bmp", tiff: "image/tiff", tif: "image/tiff",
  };
  return map[ext] || "image/png";
}

function getExtFromMime(mime: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp",
    "image/avif": "avif", "image/svg+xml": "svg", "image/gif": "gif",
  };
  return map[mime] || "jpg";
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
