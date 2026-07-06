"use client";

import { useState, useRef, useCallback } from "react";
import { ScanLine, ArrowLeft, Camera, Trash2, RotateCw, Download, Plus, Share2, Move } from "lucide-react";
import Link from "next/link";
import ProcessingButton from "@/components/ProcessingButton";

interface ScannedPage {
  original: string; // original image data URL
  processed: string; // processed (corrected + enhanced)
}

interface Corner {
  x: number;
  y: number;
}

export default function ScanToPDF() {
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);

  // Edge editing state
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [corners, setCorners] = useState<Corner[]>([]);
  const [draggingCorner, setDraggingCorner] = useState<number | null>(null);
  const [imgDisplaySize, setImgDisplaySize] = useState({ w: 0, h: 0 });
  const [imgNaturalSize, setImgNaturalSize] = useState({ w: 0, h: 0 });

  const [enhanceContrast, setEnhanceContrast] = useState(true);
  const [grayscale, setGrayscale] = useState(true);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLDivElement>(null);

  // When user takes/uploads a photo — go to edge editor
  const handleImageCaptured = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const url = URL.createObjectURL(file);

    const img = new window.Image();
    img.onload = () => {
      setImgNaturalSize({ w: img.width, h: img.height });
      // Auto-detect edges: place corners slightly inward (10% margin)
      const margin = 0.1;
      setCorners([
        { x: margin, y: margin },           // top-left
        { x: 1 - margin, y: margin },       // top-right
        { x: 1 - margin, y: 1 - margin },   // bottom-right
        { x: margin, y: 1 - margin },       // bottom-left
      ]);
      setEditingImage(url);
    };
    img.src = url;
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  // Corner dragging
  const handleCornerStart = (index: number, e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setDraggingCorner(index);
  };

  const handlePointerMove = useCallback((e: React.MouseEvent | React.TouchEvent) => {
    if (draggingCorner === null || !editorRef.current) return;
    e.preventDefault();
    const rect = editorRef.current.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = e.clientX; clientY = e.clientY; }

    const x = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
    const y = Math.max(0, Math.min(1, (clientY - rect.top) / rect.height));

    setCorners((prev) => {
      const updated = [...prev];
      updated[draggingCorner] = { x, y };
      return updated;
    });
  }, [draggingCorner]);

  const handlePointerEnd = () => setDraggingCorner(null);

  // Process: perspective correct + enhance
  const processAndAdd = async () => {
    if (!editingImage) return;
    setIsProcessing(true);
    try {
      const img = new window.Image();
      await new Promise((resolve) => { img.onload = resolve; img.src = editingImage; });

      // Source corners in actual pixel coordinates
      const src = corners.map((c) => ({ x: c.x * img.width, y: c.y * img.height }));

      // Destination: A4 proportions
      const destW = 2480;
      const destH = 3508;

      const canvas = document.createElement("canvas");
      canvas.width = destW;
      canvas.height = destH;
      const ctx = canvas.getContext("2d")!;

      // Perspective transform using bilinear interpolation
      // Map each destination pixel back to source
      const srcQuad = [src[0], src[1], src[2], src[3]]; // TL, TR, BR, BL

      for (let dy = 0; dy < destH; dy++) {
        for (let dx = 0; dx < destW; dx++) {
          const u = dx / destW;
          const v = dy / destH;

          // Bilinear interpolation of source coordinates
          const topX = srcQuad[0].x + (srcQuad[1].x - srcQuad[0].x) * u;
          const topY = srcQuad[0].y + (srcQuad[1].y - srcQuad[0].y) * u;
          const botX = srcQuad[3].x + (srcQuad[2].x - srcQuad[3].x) * u;
          const botY = srcQuad[3].y + (srcQuad[2].y - srcQuad[3].y) * u;
          const sx = topX + (botX - topX) * v;
          const sy = topY + (botY - topY) * v;

          // Draw 1x1 pixel from source
          ctx.drawImage(img, sx, sy, 1, 1, dx, dy, 1, 1);
        }
      }

      // Enhance: contrast + optional grayscale
      if (enhanceContrast || grayscale) {
        const imageData = ctx.getImageData(0, 0, destW, destH);
        const data = imageData.data;
        for (let i = 0; i < data.length; i += 4) {
          let r = data[i], g = data[i + 1], b = data[i + 2];
          if (grayscale) { const gray = 0.299 * r + 0.587 * g + 0.114 * b; r = g = b = gray; }
          if (enhanceContrast) {
            const factor = 1.6;
            r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
            g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
            b = Math.min(255, Math.max(0, factor * (b - 128) + 128));
            if (r > 200 && g > 200 && b > 200) { r = g = b = 255; }
            if (r < 60 && g < 60 && b < 60) { r = Math.max(0, r - 20); g = Math.max(0, g - 20); b = Math.max(0, b - 20); }
          }
          data[i] = r; data[i + 1] = g; data[i + 2] = b;
        }
        ctx.putImageData(imageData, 0, 0);
      }

      const processed = canvas.toDataURL("image/jpeg", 0.85);
      setPages((prev) => [...prev, { original: editingImage, processed }]);
      setEditingImage(null);
      setIsComplete(false);
    } catch (error) {
      console.error(error);
      alert("Error processing image.");
    } finally { setIsProcessing(false); }
  };

  const removePage = (index: number) => setPages((prev) => prev.filter((_, i) => i !== index));

  const generatePDF = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();

      for (const page of pages) {
        const base64 = page.processed.split(",")[1];
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const image = await pdf.embedJpg(bytes);
        const pdfPage = pdf.addPage([595.28, 841.89]); // A4
        pdfPage.drawImage(image, { x: 0, y: 0, width: 595.28, height: 841.89 });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      setPdfBlob(blob);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = "scanned-document.pdf"; a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) { console.error(error); alert("Error generating PDF."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-slate-900 flex items-center justify-center shadow-lg">
            <ScanLine className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Scan to PDF</h1>
            <p className="text-[var(--muted-foreground)]">Scan documents — adjust edges, auto-enhance, create PDF</p>
          </div>
        </div>
      </div>

      {/* Edge Editor */}
      {editingImage && (
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2"><Move className="w-4 h-4" /> Adjust document edges</h3>
            <p className="text-xs text-[var(--muted-foreground)]">Drag corners to match document borders</p>
          </div>

          {/* Image with draggable corners */}
          <div
            ref={editorRef}
            className="relative mx-auto max-w-md touch-none select-none"
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerEnd}
            onMouseLeave={handlePointerEnd}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerEnd}
          >
            <img
              src={editingImage}
              alt="Captured"
              className="w-full rounded-xl"
              onLoad={(e) => { const t = e.target as HTMLImageElement; setImgDisplaySize({ w: t.clientWidth, h: t.clientHeight }); }}
            />
            {/* Corner overlay lines */}
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points={corners.map((c) => `${c.x * 100},${c.y * 100}`).join(" ")}
                fill="rgba(99, 102, 241, 0.15)"
                stroke="#6366f1"
                strokeWidth="0.5"
              />
            </svg>
            {/* Draggable corner handles */}
            {corners.map((corner, i) => (
              <div
                key={i}
                onMouseDown={(e) => handleCornerStart(i, e)}
                onTouchStart={(e) => handleCornerStart(i, e)}
                className="absolute w-6 h-6 bg-[var(--primary)] border-2 border-white rounded-full cursor-grab active:cursor-grabbing shadow-lg -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${corner.x * 100}%`, top: `${corner.y * 100}%` }}
              />
            ))}
          </div>

          {/* Enhancement options */}
          <div className="flex flex-wrap gap-4">
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={enhanceContrast} onChange={(e) => setEnhanceContrast(e.target.checked)} className="rounded" />
              Auto-enhance (sharper text)
            </label>
            <label className="flex items-center gap-2 text-sm cursor-pointer">
              <input type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)} className="rounded" />
              Black & white
            </label>
          </div>

          {/* Actions */}
          <div className="flex justify-center gap-3">
            <button onClick={processAndAdd} disabled={isProcessing}
              className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 disabled:opacity-50">
              {isProcessing ? "Processing..." : "Add Page"}
            </button>
            <button onClick={() => setEditingImage(null)}
              className="px-6 py-3 rounded-xl border border-[var(--border)] font-semibold hover:bg-[var(--accent)]">
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Capture buttons (show when not editing) */}
      {!editingImage && (
        <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button onClick={() => cameraInputRef.current?.click()}
              className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all">
              <Camera className="w-6 h-6 text-[var(--primary)]" />
              <div className="text-left">
                <p className="font-semibold text-sm">Scan with Camera</p>
                <p className="text-xs text-[var(--muted-foreground)]">Take photo of document</p>
              </div>
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all">
              <Plus className="w-6 h-6 text-[var(--primary)]" />
              <div className="text-left">
                <p className="font-semibold text-sm">Upload Image</p>
                <p className="text-xs text-[var(--muted-foreground)]">Select existing photo</p>
              </div>
            </button>
          </div>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleImageCaptured} className="hidden" />
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleImageCaptured} className="hidden" />
        </div>
      )}

      {/* Scanned Pages */}
      {pages.length > 0 && !editingImage && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">{pages.length} page{pages.length > 1 ? "s" : ""} scanned</h3>
            <button onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline">
              <Plus className="w-4 h-4" /> Add more
            </button>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {pages.map((page, index) => (
              <div key={index} className="relative group rounded-xl border border-[var(--border)] overflow-hidden bg-white">
                <img src={page.processed} alt={`Page ${index + 1}`} className="w-full aspect-[3/4] object-cover" />
                <button onClick={() => removePage(index)}
                  className="absolute top-2 right-2 p-1.5 rounded-lg bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity">
                  <Trash2 className="w-3 h-3" />
                </button>
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate PDF */}
      {pages.length > 0 && !editingImage && (
        <div className="mt-8 flex flex-col items-center gap-4">
          <ProcessingButton onClick={generatePDF} isProcessing={isProcessing} isComplete={isComplete} label="Create PDF" />
          {pdfBlob && (
            <div className="flex gap-3">
              <button onClick={async () => {
                const file = new File([pdfBlob], "scanned-document.pdf", { type: "application/pdf" });
                if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                  await navigator.share({ files: [file], title: "Scanned Document" });
                }
              }}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-semibold hover:scale-105 active:scale-95 transition-all">
                <Share2 className="w-4 h-4" /> Share
              </button>
            </div>
          )}
        </div>
      )}

      {/* Info */}
      <div className="mt-10 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2 text-center">How it works</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li>Take photo or upload → drag corners to match document edges</li>
          <li>Perspective correction straightens tilted documents</li>
          <li>Auto-enhance makes text sharp and background white</li>
          <li>Add multiple pages, then create a single PDF</li>
          <li>Works 100% offline — nothing uploaded anywhere</li>
        </ul>
      </div>
    </div>
  );
}
