"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Crop, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { downloadBlob } from "@/lib/pdf-utils";
import { PDFDocument } from "pdf-lib";

export default function CropPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [pageSize, setPageSize] = useState({ w: 0, h: 0 }); // PDF page size in points
  const [displaySize, setDisplaySize] = useState({ w: 0, h: 0 }); // displayed image size

  // Crop box as percentages (0-1)
  const [cropBox, setCropBox] = useState({ left: 0.05, top: 0.05, right: 0.05, bottom: 0.05 });
  const [dragging, setDragging] = useState<string | null>(null);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const previewRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  // Load PDF and render first page as preview
  const handleFilesSelected = async (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setIsComplete(false);
    setCropBox({ left: 0.05, top: 0.05, right: 0.05, bottom: 0.05 });

    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await file.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const page = await pdf.getPage(1);
      const viewport = page.getViewport({ scale: 1.5 });

      setPageSize({ w: viewport.width / 1.5, h: viewport.height / 1.5 }); // original points

      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await (page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise);

      if (previewUrl) URL.revokeObjectURL(previewUrl);
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));
      setPreviewUrl(URL.createObjectURL(blob));
    } catch {
      setPreviewUrl(null);
    }
  };

  // Handle drag on crop edges
  const handleMouseDown = (edge: string, e: React.MouseEvent) => {
    e.preventDefault();
    setDragging(edge);
    setDragStart({ x: e.clientX, y: e.clientY });
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!dragging || !previewRef.current) return;
    const rect = previewRef.current.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width;
    const y = (e.clientY - rect.top) / rect.height;

    setCropBox((prev) => {
      const updated = { ...prev };
      if (dragging === "left") updated.left = Math.max(0, Math.min(0.45, x));
      if (dragging === "right") updated.right = Math.max(0, Math.min(0.45, 1 - x));
      if (dragging === "top") updated.top = Math.max(0, Math.min(0.45, y));
      if (dragging === "bottom") updated.bottom = Math.max(0, Math.min(0.45, 1 - y));
      return updated;
    });
  }, [dragging]);

  const handleMouseUp = useCallback(() => setDragging(null), []);

  useEffect(() => {
    if (dragging) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      return () => { window.removeEventListener("mousemove", handleMouseMove); window.removeEventListener("mouseup", handleMouseUp); };
    }
  }, [dragging, handleMouseMove, handleMouseUp]);

  // Touch support
  const handleTouchStart = (edge: string, e: React.TouchEvent) => {
    e.preventDefault();
    setDragging(edge);
  };

  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (!dragging || !previewRef.current) return;
      const rect = previewRef.current.getBoundingClientRect();
      const touch = e.touches[0];
      const x = (touch.clientX - rect.left) / rect.width;
      const y = (touch.clientY - rect.top) / rect.height;

      setCropBox((prev) => {
        const updated = { ...prev };
        if (dragging === "left") updated.left = Math.max(0, Math.min(0.45, x));
        if (dragging === "right") updated.right = Math.max(0, Math.min(0.45, 1 - x));
        if (dragging === "top") updated.top = Math.max(0, Math.min(0.45, y));
        if (dragging === "bottom") updated.bottom = Math.max(0, Math.min(0.45, 1 - y));
        return updated;
      });
    };
    const handleTouchEnd = () => setDragging(null);

    if (dragging) {
      window.addEventListener("touchmove", handleTouchMove);
      window.addEventListener("touchend", handleTouchEnd);
      return () => { window.removeEventListener("touchmove", handleTouchMove); window.removeEventListener("touchend", handleTouchEnd); };
    }
  }, [dragging]);

  const handleCrop = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        // Convert percentages to PDF points
        const left = width * cropBox.left;
        const bottom = height * cropBox.bottom;
        const cropWidth = width * (1 - cropBox.left - cropBox.right);
        const cropHeight = height * (1 - cropBox.top - cropBox.bottom);

        page.setCropBox(left, bottom, cropWidth, cropHeight);
      }

      const result = await pdf.save();
      downloadBlob(result, `cropped-${files[0].name}`);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error cropping PDF.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-lime-500 to-green-600 flex items-center justify-center shadow-lg">
            <Crop className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Crop PDF</h1>
            <p className="text-[var(--muted-foreground)]">Drag edges to crop — removes margins from all pages</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setPreviewUrl(null); }} />

      {/* Visual Crop Editor */}
      {previewUrl && (
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm font-medium mb-3 text-center">Drag the blue edges inward to set crop area</p>

          <div ref={previewRef} className="relative mx-auto select-none" style={{ maxWidth: "500px" }}>
            {/* PDF preview image */}
            <img ref={imgRef} src={previewUrl} alt="PDF Preview" className="w-full rounded-lg" />

            {/* Dark overlay for cropped areas */}
            <div className="absolute inset-0 pointer-events-none">
              {/* Top crop */}
              <div className="absolute left-0 right-0 top-0 bg-black/40" style={{ height: `${cropBox.top * 100}%` }} />
              {/* Bottom crop */}
              <div className="absolute left-0 right-0 bottom-0 bg-black/40" style={{ height: `${cropBox.bottom * 100}%` }} />
              {/* Left crop */}
              <div className="absolute left-0 bg-black/40" style={{ top: `${cropBox.top * 100}%`, bottom: `${cropBox.bottom * 100}%`, width: `${cropBox.left * 100}%` }} />
              {/* Right crop */}
              <div className="absolute right-0 bg-black/40" style={{ top: `${cropBox.top * 100}%`, bottom: `${cropBox.bottom * 100}%`, width: `${cropBox.right * 100}%` }} />
            </div>

            {/* Draggable edge handles */}
            {/* Top edge */}
            <div
              onMouseDown={(e) => handleMouseDown("top", e)}
              onTouchStart={(e) => handleTouchStart("top", e)}
              className="absolute left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center z-10"
              style={{ top: `calc(${cropBox.top * 100}% - 6px)` }}
            >
              <div className="w-16 h-1.5 bg-blue-500 rounded-full" />
            </div>
            {/* Bottom edge */}
            <div
              onMouseDown={(e) => handleMouseDown("bottom", e)}
              onTouchStart={(e) => handleTouchStart("bottom", e)}
              className="absolute left-0 right-0 h-3 cursor-ns-resize flex items-center justify-center z-10"
              style={{ bottom: `calc(${cropBox.bottom * 100}% - 6px)` }}
            >
              <div className="w-16 h-1.5 bg-blue-500 rounded-full" />
            </div>
            {/* Left edge */}
            <div
              onMouseDown={(e) => handleMouseDown("left", e)}
              onTouchStart={(e) => handleTouchStart("left", e)}
              className="absolute top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center z-10"
              style={{ left: `calc(${cropBox.left * 100}% - 6px)` }}
            >
              <div className="h-16 w-1.5 bg-blue-500 rounded-full" />
            </div>
            {/* Right edge */}
            <div
              onMouseDown={(e) => handleMouseDown("right", e)}
              onTouchStart={(e) => handleTouchStart("right", e)}
              className="absolute top-0 bottom-0 w-3 cursor-ew-resize flex items-center justify-center z-10"
              style={{ right: `calc(${cropBox.right * 100}% - 6px)` }}
            >
              <div className="h-16 w-1.5 bg-blue-500 rounded-full" />
            </div>
          </div>

          {/* Crop info */}
          <div className="flex justify-center gap-4 mt-4 text-xs text-[var(--muted-foreground)]">
            <span>Left: {Math.round(cropBox.left * 100)}%</span>
            <span>Right: {Math.round(cropBox.right * 100)}%</span>
            <span>Top: {Math.round(cropBox.top * 100)}%</span>
            <span>Bottom: {Math.round(cropBox.bottom * 100)}%</span>
          </div>

          {/* Quick presets */}
          <div className="flex justify-center gap-2 mt-3">
            <button onClick={() => setCropBox({ left: 0, top: 0, right: 0, bottom: 0 })} className="px-3 py-1 rounded-lg text-xs bg-[var(--muted)] hover:bg-[var(--accent)]">No crop</button>
            <button onClick={() => setCropBox({ left: 0.05, top: 0.05, right: 0.05, bottom: 0.05 })} className="px-3 py-1 rounded-lg text-xs bg-[var(--muted)] hover:bg-[var(--accent)]">Trim margins (5%)</button>
            <button onClick={() => setCropBox({ left: 0.1, top: 0.1, right: 0.1, bottom: 0.1 })} className="px-3 py-1 rounded-lg text-xs bg-[var(--muted)] hover:bg-[var(--accent)]">Heavy crop (10%)</button>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-6 flex justify-center">
          <ProcessingButton onClick={handleCrop} isProcessing={isProcessing} isComplete={isComplete} label="Crop & Download" />
        </div>
      )}

      <div className="mt-8 p-4 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-center">
        <p className="text-xs text-[var(--muted-foreground)]">Crop is applied to ALL pages. The dark overlay shows what will be removed.</p>
      </div>
    </div>
  );
}
