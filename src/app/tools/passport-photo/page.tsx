"use client";

import { useState } from "react";
import { UserSquare2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

type PhotoSize = { name: string; w: number; h: number; dpi: number };

const sizes: PhotoSize[] = [
  { name: "Indian Passport (3.5x4.5 cm)", w: 413, h: 531, dpi: 300 },
  { name: "Indian Visa (2x2 inch)", w: 600, h: 600, dpi: 300 },
  { name: "Aadhaar Card (3.5x4.5 cm)", w: 413, h: 531, dpi: 300 },
  { name: "PAN Card (2.5x2.5 cm)", w: 295, h: 295, dpi: 300 },
  { name: "Stamp Size (2x2.5 cm)", w: 236, h: 295, dpi: 300 },
  { name: "US Visa (2x2 inch)", w: 600, h: 600, dpi: 300 },
];

type PaperSize = { name: string; w: number; h: number };

const paperSizes: PaperSize[] = [
  { name: "A4 (21 × 29.7 cm)", w: 2480, h: 3508 },
  { name: "A5 (14.8 × 21 cm)", w: 1748, h: 2480 },
  { name: "A3 (29.7 × 42 cm)", w: 3508, h: 4960 },
  { name: "4×6 inch (Photo paper)", w: 1200, h: 1800 },
  { name: "5×7 inch", w: 1500, h: 2100 },
  { name: "Letter (8.5 × 11 in)", w: 2550, h: 3300 },
];

export default function PassportPhoto() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [selectedSize, setSelectedSize] = useState(0);
  const [selectedPaper, setSelectedPaper] = useState(0);
  const [enhance, setEnhance] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [photoCount, setPhotoCount] = useState(0);

  const handleGenerate = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const file = files[0];
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });
      URL.revokeObjectURL(url);

      const size = sizes[selectedSize];
      // Create a single photo at the right size
      const photoCanvas = document.createElement("canvas");
      photoCanvas.width = size.w;
      photoCanvas.height = size.h;
      const pCtx = photoCanvas.getContext("2d")!;
      
      // Center-crop the image to fit
      const scale = Math.max(size.w / img.width, size.h / img.height);
      const sw = size.w / scale;
      const sh = size.h / scale;
      const sx = (img.width - sw) / 2;
      const sy = (img.height - sh) / 2;
      pCtx.drawImage(img, sx, sy, sw, sh, 0, 0, size.w, size.h);

      // AI Enhance if selected (sharpen without changing face)
      let finalPhotoCanvas = photoCanvas;
      if (enhance) {
        try {
          const enhancedCanvas = document.createElement("canvas");
          enhancedCanvas.width = size.w;
          enhancedCanvas.height = size.h;
          const eCtx = enhancedCanvas.getContext("2d")!;
          eCtx.drawImage(photoCanvas, 0, 0);
          
          // Apply sharpening filter
          const imageData = eCtx.getImageData(0, 0, size.w, size.h);
          const data = imageData.data;
          const output = new Uint8ClampedArray(data.length);
          const amount = 0.7;
          for (let y = 1; y < size.h - 1; y++) {
            for (let x = 1; x < size.w - 1; x++) {
              const idx = (y * size.w + x) * 4;
              for (let c = 0; c < 3; c++) {
                const center = data[idx + c];
                const neighbors = (data[((y-1)*size.w+x)*4+c] + data[((y+1)*size.w+x)*4+c] + data[(y*size.w+(x-1))*4+c] + data[(y*size.w+(x+1))*4+c]) / 4;
                output[idx + c] = Math.min(255, Math.max(0, Math.round(center + amount * (center - neighbors))));
              }
              output[idx + 3] = data[idx + 3];
            }
          }
          // Copy borders
          for (let x = 0; x < size.w; x++) { for (let c = 0; c < 4; c++) { output[x*4+c] = data[x*4+c]; output[((size.h-1)*size.w+x)*4+c] = data[((size.h-1)*size.w+x)*4+c]; } }
          for (let y = 0; y < size.h; y++) { for (let c = 0; c < 4; c++) { output[(y*size.w)*4+c] = data[(y*size.w)*4+c]; output[(y*size.w+(size.w-1))*4+c] = data[(y*size.w+(size.w-1))*4+c]; } }
          eCtx.putImageData(new ImageData(output, size.w, size.h), 0, 0);
          finalPhotoCanvas = enhancedCanvas;
        } catch (e) { console.warn("Enhance failed, using original", e); }
      }

      // Create sheet — auto-fill entire page with maximum copies
      const paper = paperSizes[selectedPaper];
      const sheetW = paper.w;
      const sheetH = paper.h;
      const padding = 20;
      const cols = Math.floor((sheetW - padding) / (size.w + padding));
      const rows = Math.floor((sheetH - padding) / (size.h + padding));
      const totalCopies = cols * rows;

      const sheetCanvas = document.createElement("canvas");
      sheetCanvas.width = sheetW;
      sheetCanvas.height = sheetH;
      const ctx = sheetCanvas.getContext("2d")!;
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, sheetW, sheetH);

      // Center the grid on the page
      const gridWidth = cols * size.w + (cols - 1) * padding;
      const gridHeight = rows * size.h + (rows - 1) * padding;
      const offsetX = Math.round((sheetW - gridWidth) / 2);
      const offsetY = Math.round((sheetH - gridHeight) / 2);

      for (let i = 0; i < totalCopies; i++) {
        const col = i % cols;
        const row = Math.floor(i / cols);
        const x = offsetX + col * (size.w + padding);
        const y = offsetY + row * (size.h + padding);
        ctx.drawImage(finalPhotoCanvas, x, y);
        // Light cut lines
        ctx.strokeStyle = "#cccccc";
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, size.w, size.h);
      }

      const blob = await new Promise<Blob>((resolve) => {
        sheetCanvas.toBlob((b) => resolve(b!), "image/jpeg", 0.95);
      });

      // Show preview instead of auto-download
      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const sheetUrl = URL.createObjectURL(blob);
      setPreviewUrl(sheetUrl);
      setPhotoCount(totalCopies);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error generating passport photos.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
            <UserSquare2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Passport Photo Maker</h1>
            <p className="text-[var(--muted-foreground)]">Create passport-size photos (Indian standards)</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Photo Size</label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {sizes.map((s, i) => (
                <button key={i} onClick={() => { setSelectedSize(i); setIsComplete(false); }}
                  className={`text-left px-4 py-3 rounded-xl text-sm border transition-all ${selectedSize === i ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                  <span className="font-medium">{s.name}</span>
                  <span className="block text-xs text-[var(--muted-foreground)]">{s.w}x{s.h}px at {s.dpi} DPI</span>
                </button>
              ))}
            </div>
          </div>
          <label className="flex items-center gap-3 p-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 cursor-pointer">
            <input type="checkbox" checked={enhance} onChange={(e) => setEnhance(e.target.checked)} className="rounded" />
            <div>
              <span className="text-sm font-medium">AI Enhance quality</span>
              <p className="text-xs text-[var(--muted-foreground)]">Sharpens blurry photos (takes 10-20s extra). Does not modify face.</p>
            </div>
          </label>
          <div>
            <label className="block text-sm font-medium mb-2">Paper Size</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {paperSizes.map((p, i) => (
                <button key={i} onClick={() => { setSelectedPaper(i); setIsComplete(false); }}
                  className={`text-left px-3 py-2 rounded-xl text-xs border transition-all ${selectedPaper === i ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20 font-semibold" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                  {p.name}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <ProcessingButton onClick={handleGenerate} isProcessing={isProcessing} isComplete={isComplete} label="Generate Photos" />
        </div>
      )}

      {/* Preview */}
      {previewUrl && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <div className="w-full max-w-md rounded-2xl border border-[var(--border)] overflow-hidden shadow-lg">
            <div className="px-3 py-2 bg-[var(--muted)] text-xs font-medium text-center text-[var(--muted-foreground)]">
              Preview — {photoCount} photos on {paperSizes[selectedPaper].name.split(" ")[0]} paper
            </div>
            <img src={previewUrl} alt="Passport photo sheet preview" className="w-full object-contain" />
          </div>
          <div className="flex gap-3 flex-wrap justify-center">
            <button onClick={() => {
              const a = document.createElement("a");
              a.href = previewUrl;
              a.download = "passport-photos-" + sizes[selectedSize].name.replace(/\s/g, "-") + "-" + paperSizes[selectedPaper].name.split(" ")[0] + ".jpg";
              a.click();
            }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-blue-600 to-blue-800 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
              Download
            </button>
            <button onClick={async () => {
              if (!previewUrl) return;
              const response = await fetch(previewUrl);
              const blob = await response.blob();
              const file = new File([blob], "passport-photos.jpg", { type: "image/jpeg" });
              if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                navigator.share({ files: [file], title: "Passport Photos" });
              }
            }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl bg-green-500 text-white font-semibold shadow-lg hover:scale-105 active:scale-95 transition-all">
              Share
            </button>
            <button onClick={() => { setPreviewUrl(null); setIsComplete(false); }}
              className="flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--border)] font-semibold hover:border-[var(--primary)] transition-all">
              Regenerate
            </button>
          </div>
        </div>
      )}

      <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
        Generates a printable sheet with maximum passport photos. Print at 100% scale for correct dimensions.
      </p>
    </div>
  );
}
