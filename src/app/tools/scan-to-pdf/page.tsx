"use client";

import { useState, useRef, useCallback } from "react";
import { ScanLine, ArrowLeft, Camera, Trash2, RotateCw, Download, Plus } from "lucide-react";
import Link from "next/link";
import ProcessingButton from "@/components/ProcessingButton";

export default function ScanToPDF() {
  const [scannedPages, setScannedPages] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [useCamera, setUseCamera] = useState(false);
  const [enhanceContrast, setEnhanceContrast] = useState(true);
  const [grayscale, setGrayscale] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  const processImage = useCallback(async (file: File): Promise<string> => {
    return new Promise((resolve) => {
      const img = new window.Image();
      const url = URL.createObjectURL(file);
      img.onload = () => {
        URL.revokeObjectURL(url);

        const canvas = document.createElement("canvas");
        // Scale to A4 proportions (max 2480x3508 at 300 DPI)
        const maxWidth = 2480;
        const maxHeight = 3508;
        let w = img.width;
        let h = img.height;

        if (w > maxWidth) { h = (maxWidth / w) * h; w = maxWidth; }
        if (h > maxHeight) { w = (maxHeight / h) * w; h = maxHeight; }

        canvas.width = Math.round(w);
        canvas.height = Math.round(h);
        const ctx = canvas.getContext("2d")!;

        // Draw original
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

        // Apply scanner-like enhancement
        if (enhanceContrast || grayscale) {
          const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
          const data = imageData.data;

          for (let i = 0; i < data.length; i += 4) {
            let r = data[i], g = data[i + 1], b = data[i + 2];

            if (grayscale) {
              const gray = 0.299 * r + 0.587 * g + 0.114 * b;
              r = g = b = gray;
            }

            if (enhanceContrast) {
              // Increase contrast — makes text darker, background whiter
              const factor = 1.5; // contrast factor
              r = Math.min(255, Math.max(0, factor * (r - 128) + 128));
              g = Math.min(255, Math.max(0, factor * (g - 128) + 128));
              b = Math.min(255, Math.max(0, factor * (b - 128) + 128));

              // Threshold: push near-white to pure white (clean background)
              if (r > 180 && g > 180 && b > 180) {
                r = g = b = 255;
              }
              // Push near-black to darker (cleaner text)
              if (r < 80 && g < 80 && b < 80) {
                r = Math.max(0, r - 30);
                g = Math.max(0, g - 30);
                b = Math.max(0, b - 30);
              }
            }

            data[i] = r;
            data[i + 1] = g;
            data[i + 2] = b;
          }

          ctx.putImageData(imageData, 0, 0);
        }

        resolve(canvas.toDataURL("image/jpeg", 0.85));
      };
      img.src = url;
    });
  }, [enhanceContrast, grayscale]);

  const handleFilesSelected = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (!files.length) return;

    const processed: string[] = [];
    for (const file of files) {
      const dataUrl = await processImage(file);
      processed.push(dataUrl);
    }
    setScannedPages((prev) => [...prev, ...processed]);
    setIsComplete(false);
    if (fileInputRef.current) fileInputRef.current.value = "";
    if (cameraInputRef.current) cameraInputRef.current.value = "";
  };

  const removePage = (index: number) => {
    setScannedPages((prev) => prev.filter((_, i) => i !== index));
  };

  const rotatePage = async (index: number) => {
    const img = new window.Image();
    img.src = scannedPages[index];
    await new Promise((resolve) => { img.onload = resolve; });

    const canvas = document.createElement("canvas");
    canvas.width = img.height;
    canvas.height = img.width;
    const ctx = canvas.getContext("2d")!;
    ctx.translate(canvas.width / 2, canvas.height / 2);
    ctx.rotate(Math.PI / 2);
    ctx.drawImage(img, -img.width / 2, -img.height / 2);

    const updated = [...scannedPages];
    updated[index] = canvas.toDataURL("image/jpeg", 0.85);
    setScannedPages(updated);
  };

  const generatePDF = async () => {
    if (scannedPages.length === 0) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();

      for (const pageDataUrl of scannedPages) {
        // Convert data URL to bytes
        const base64 = pageDataUrl.split(",")[1];
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));

        // Embed as JPEG
        const image = await pdf.embedJpg(bytes);

        // Create A4 page and fit image
        const a4Width = 595.28;
        const a4Height = 841.89;
        const page = pdf.addPage([a4Width, a4Height]);

        // Scale image to fit A4 with margins
        const margin = 20;
        const maxW = a4Width - margin * 2;
        const maxH = a4Height - margin * 2;
        const scale = Math.min(maxW / image.width, maxH / image.height);
        const drawWidth = image.width * scale;
        const drawHeight = image.height * scale;

        // Center on page
        const x = (a4Width - drawWidth) / 2;
        const y = (a4Height - drawHeight) / 2;

        page.drawImage(image, { x, y, width: drawWidth, height: drawHeight });
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `scanned-document-${Date.now()}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error generating PDF.");
    } finally { setIsProcessing(false); }
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
            <p className="text-[var(--muted-foreground)]">Use your camera to scan documents into a clean PDF</p>
          </div>
        </div>
      </div>

      {/* Capture Options */}
      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {/* Camera capture (mobile) */}
          <button onClick={() => cameraInputRef.current?.click()}
            className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all">
            <Camera className="w-6 h-6 text-[var(--primary)]" />
            <div className="text-left">
              <p className="font-semibold text-sm">Scan with Camera</p>
              <p className="text-xs text-[var(--muted-foreground)]">Take photo of document</p>
            </div>
          </button>
          <input ref={cameraInputRef} type="file" accept="image/*" capture="environment" onChange={handleFilesSelected} className="hidden" />

          {/* File upload */}
          <button onClick={() => fileInputRef.current?.click()}
            className="flex items-center justify-center gap-3 p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all">
            <Plus className="w-6 h-6 text-[var(--primary)]" />
            <div className="text-left">
              <p className="font-semibold text-sm">Upload Images</p>
              <p className="text-xs text-[var(--muted-foreground)]">Select existing photos</p>
            </div>
          </button>
          <input ref={fileInputRef} type="file" accept="image/*" multiple onChange={handleFilesSelected} className="hidden" />
        </div>

        {/* Enhancement options */}
        <div className="flex flex-wrap gap-4 pt-2">
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={enhanceContrast} onChange={(e) => setEnhanceContrast(e.target.checked)} className="rounded" />
            Auto-enhance (sharper text, whiter background)
          </label>
          <label className="flex items-center gap-2 text-sm cursor-pointer">
            <input type="checkbox" checked={grayscale} onChange={(e) => setGrayscale(e.target.checked)} className="rounded" />
            Black & white scan
          </label>
        </div>
      </div>

      {/* Scanned Pages Preview */}
      {scannedPages.length > 0 && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">{scannedPages.length} page{scannedPages.length > 1 ? "s" : ""} scanned</h3>
            <button onClick={() => cameraInputRef.current?.click()}
              className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline">
              <Plus className="w-4 h-4" /> Add more
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {scannedPages.map((page, index) => (
              <div key={index} className="relative group rounded-xl border border-[var(--border)] overflow-hidden bg-white">
                <img src={page} alt={`Page ${index + 1}`} className="w-full aspect-[3/4] object-cover" />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-2 opacity-0 group-hover:opacity-100">
                  <button onClick={() => rotatePage(index)} className="p-2 rounded-lg bg-white/90 hover:bg-white" title="Rotate">
                    <RotateCw className="w-4 h-4" />
                  </button>
                  <button onClick={() => removePage(index)} className="p-2 rounded-lg bg-white/90 hover:bg-white text-red-500" title="Remove">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
                <div className="absolute bottom-1 right-1 bg-black/60 text-white text-[10px] px-1.5 py-0.5 rounded">
                  {index + 1}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Generate PDF */}
      {scannedPages.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={generatePDF} isProcessing={isProcessing} isComplete={isComplete} label="Create PDF" />
        </div>
      )}

      {/* Info */}
      <div className="mt-10 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2">How it works</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li>Use your phone camera to photograph documents, receipts, notes</li>
          <li>Auto-enhance makes text sharper and background whiter (like a real scanner)</li>
          <li>Add multiple pages, reorder or rotate as needed</li>
          <li>Generates a proper A4-sized PDF with all pages</li>
          <li>Works 100% offline — nothing uploaded anywhere</li>
          <li>Perfect for scanning assignments, ID cards, bills, notes</li>
        </ul>
      </div>
    </div>
  );
}
