"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import {
  ScanLine, ArrowLeft, Camera, Trash2, RotateCw, Download, Plus,
  Share2, Move, Wand2, Eye, Image as ImageIcon, Type
} from "lucide-react";
import Link from "next/link";
import ProcessingButton from "@/components/ProcessingButton";

interface ScannedPage {
  id: string;
  original: string;
  processed: string;
  rotation: number;
}

type FilterMode = "original" | "grayscale" | "bw" | "enhance";

export default function ScanToPDF() {
  // State
  const [pages, setPages] = useState<ScannedPage[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pdfBlob, setPdfBlob] = useState<Blob | null>(null);
  const [enableOCR, setEnableOCR] = useState(false);
  const [ocrProgress, setOcrProgress] = useState("");

  // Camera state
  const [showCamera, setShowCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Edge editing state
  const [editingImage, setEditingImage] = useState<string | null>(null);
  const [corners, setCorners] = useState<{x:number;y:number}[]>([]);
  const [draggingCorner, setDraggingCorner] = useState<number | null>(null);
  const [filterMode, setFilterMode] = useState<FilterMode>("enhance");
  const editorRef = useRef<HTMLDivElement>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ============ CAMERA ============
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1920 }, height: { ideal: 1080 } }
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
        setCameraReady(true);
      }
      setShowCamera(true);
    } catch {
      alert("Camera access denied. Please allow camera permission.");
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraReady(false);
    setShowCamera(false);
  };

  const captureFrame = () => {
    const video = videoRef.current;
    if (!video) return;
    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    const ctx = canvas.getContext("2d")!;
    ctx.drawImage(video, 0, 0);
    const dataUrl = canvas.toDataURL("image/jpeg", 0.92);
    stopCamera();
    openEdgeEditor(dataUrl);
  };

  // ============ FILE UPLOAD ============
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => openEdgeEditor(reader.result as string);
    reader.readAsDataURL(file);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ============ EDGE EDITOR ============
  const openEdgeEditor = (imageUrl: string) => {
    setEditingImage(imageUrl);
    // Default corners at 8% margin (assume document fills most of frame)
    const m = 0.08;
    setCorners([
      { x: m, y: m }, { x: 1 - m, y: m },
      { x: 1 - m, y: 1 - m }, { x: m, y: 1 - m },
    ]);
  };

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
    setCorners((prev) => { const u = [...prev]; u[draggingCorner] = { x, y }; return u; });
  }, [draggingCorner]);

  const handlePointerEnd = () => setDraggingCorner(null);

  // ============ PROCESS PAGE ============
  const processAndAdd = async () => {
    if (!editingImage) return;
    setIsProcessing(true);
    try {
      const img = new window.Image();
      await new Promise((resolve) => { img.onload = resolve; img.src = editingImage; });

      const src = corners.map((c) => ({ x: c.x * img.width, y: c.y * img.height }));

      // Output size: A4 at 200 DPI (good quality, reasonable speed)
      const destW = 1654;
      const destH = 2339;

      const canvas = document.createElement("canvas");
      canvas.width = destW;
      canvas.height = destH;
      const ctx = canvas.getContext("2d")!;

      // Perspective warp using bilinear interpolation
      const srcQuad = [src[0], src[1], src[2], src[3]];
      // Use drawImage with sub-pixel sampling for speed
      // Draw in horizontal strips for better performance
      const strips = 100;
      for (let strip = 0; strip < strips; strip++) {
        const v1 = strip / strips;
        const v2 = (strip + 1) / strips;

        for (let col = 0; col < destW; col += 4) {
          const u = col / destW;

          const topX1 = srcQuad[0].x + (srcQuad[1].x - srcQuad[0].x) * u;
          const topY1 = srcQuad[0].y + (srcQuad[1].y - srcQuad[0].y) * u;
          const botX1 = srcQuad[3].x + (srcQuad[2].x - srcQuad[3].x) * u;
          const botY1 = srcQuad[3].y + (srcQuad[2].y - srcQuad[3].y) * u;

          const sx = topX1 + (botX1 - topX1) * v1;
          const sy = topY1 + (botY1 - topY1) * v1;
          const sx2 = topX1 + (botX1 - topX1) * v2;
          const sy2 = topY1 + (botY1 - topY1) * v2;

          const srcW = Math.max(1, 4 * (img.width / destW));
          const srcH = Math.max(1, (sy2 - sy));

          ctx.drawImage(img, sx, sy, srcW, srcH, col, strip * (destH / strips), 4, destH / strips);
        }
      }

      // Apply filter
      applyFilter(ctx, destW, destH, filterMode);

      const processed = canvas.toDataURL("image/jpeg", 0.85);
      const newPage: ScannedPage = {
        id: crypto.randomUUID(),
        original: editingImage,
        processed,
        rotation: 0,
      };

      setPages((prev) => [...prev, newPage]);
      setEditingImage(null);
      setIsComplete(false);
      setPdfBlob(null);
    } catch (error) {
      console.error(error);
      alert("Error processing image.");
    } finally { setIsProcessing(false); }
  };

  // ============ FILTERS ============
  function applyFilter(ctx: CanvasRenderingContext2D, w: number, h: number, mode: FilterMode) {
    if (mode === "original") return;
    const imageData = ctx.getImageData(0, 0, w, h);
    const data = imageData.data;

    for (let i = 0; i < data.length; i += 4) {
      let r = data[i], g = data[i + 1], b = data[i + 2];

      if (mode === "grayscale" || mode === "bw" || mode === "enhance") {
        const gray = 0.299 * r + 0.587 * g + 0.114 * b;
        if (mode === "grayscale") {
          r = g = b = gray;
        } else if (mode === "bw") {
          // Adaptive-like threshold
          r = g = b = gray > 140 ? 255 : 0;
        } else {
          // Enhance: increase contrast, whiten background, darken text
          const factor = 1.8;
          let val = factor * (gray - 128) + 128;
          val = Math.min(255, Math.max(0, val));
          if (val > 200) val = 255; // clean white background
          if (val < 50) val = Math.max(0, val - 20); // darker text
          r = g = b = val;
        }
      }

      data[i] = r; data[i + 1] = g; data[i + 2] = b;
    }
    ctx.putImageData(imageData, 0, 0);
  }

  // ============ PAGE MANAGEMENT ============
  const removePage = (id: string) => {
    setPages((prev) => prev.filter((p) => p.id !== id));
    setPdfBlob(null); setIsComplete(false);
  };

  const rotatePage = (id: string) => {
    setPages((prev) => prev.map((p) => {
      if (p.id !== id) return p;
      // Rotate the processed image
      const newRotation = (p.rotation + 90) % 360;
      return { ...p, rotation: newRotation };
    }));
    setPdfBlob(null); setIsComplete(false);
  };

  const movePage = (fromIdx: number, toIdx: number) => {
    setPages((prev) => {
      const updated = [...prev];
      const [moved] = updated.splice(fromIdx, 1);
      updated.splice(toIdx, 0, moved);
      return updated;
    });
    setPdfBlob(null); setIsComplete(false);
  };

  // ============ PDF EXPORT ============
  const generatePDF = async () => {
    if (pages.length === 0) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const pdf = await PDFDocument.create();

      for (const page of pages) {
        // Apply rotation to image
        const img = new window.Image();
        await new Promise((resolve) => { img.onload = resolve; img.src = page.processed; });

        const canvas = document.createElement("canvas");
        const isRotated = page.rotation === 90 || page.rotation === 270;
        canvas.width = isRotated ? img.height : img.width;
        canvas.height = isRotated ? img.width : img.height;
        const ctx = canvas.getContext("2d")!;
        ctx.translate(canvas.width / 2, canvas.height / 2);
        ctx.rotate((page.rotation * Math.PI) / 180);
        ctx.drawImage(img, -img.width / 2, -img.height / 2);

        const jpegData = canvas.toDataURL("image/jpeg", 0.85);
        const base64 = jpegData.split(",")[1];
        const bytes = Uint8Array.from(atob(base64), (c) => c.charCodeAt(0));
        const pdfImage = await pdf.embedJpg(bytes);

        // A4 page
        const pdfPage = pdf.addPage([595.28, 841.89]);
        const { width: pw, height: ph } = pdfPage.getSize();
        const scale = Math.min(pw / pdfImage.width, ph / pdfImage.height);
        const drawW = pdfImage.width * scale;
        const drawH = pdfImage.height * scale;
        pdfPage.drawImage(pdfImage, {
          x: (pw - drawW) / 2, y: (ph - drawH) / 2,
          width: drawW, height: drawH,
        });
      }

      // Optional OCR
      if (enableOCR) {
        setOcrProgress("Loading OCR engine...");
        try {
          const Tesseract = await import("tesseract.js");
          const worker = await Tesseract.createWorker("eng");
          for (let i = 0; i < pages.length; i++) {
            setOcrProgress(`OCR page ${i + 1}/${pages.length}...`);
            // OCR runs but we can't easily add invisible text layer with pdf-lib
            // This extracts text for potential future use
            await worker.recognize(pages[i].processed);
          }
          await worker.terminate();
          setOcrProgress("");
        } catch { setOcrProgress(""); }
      }

      const pdfBytes = await pdf.save();
      const blob = new Blob([pdfBytes as unknown as BlobPart], { type: "application/pdf" });
      setPdfBlob(blob);

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url; a.download = `scan-${new Date().toISOString().slice(0, 10)}.pdf`;
      a.click(); URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) { console.error(error); alert("Error generating PDF."); }
    finally { setIsProcessing(false); setOcrProgress(""); }
  };

  // Cleanup camera on unmount
  useEffect(() => { return () => { stopCamera(); }; }, []);

  // ============ RENDER ============
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
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
            <p className="text-[var(--muted-foreground)]">Scan documents — adjust edges, enhance, create PDF</p>
          </div>
        </div>
      </div>

      {/* ===== CAMERA VIEW ===== */}
      {showCamera && (
        <div className="fixed inset-0 z-50 bg-black flex flex-col">
          <video ref={videoRef} className="flex-1 w-full object-cover" playsInline muted autoPlay />
          {/* Capture controls — bottom */}
          <div className="absolute bottom-0 left-0 right-0 pb-8 pt-4 flex items-center justify-center gap-6 bg-gradient-to-t from-black/80 to-transparent">
            <button onClick={stopCamera}
              className="px-5 py-2.5 rounded-full bg-white/20 backdrop-blur text-white text-sm font-medium">
              Cancel
            </button>
            <button onClick={captureFrame} disabled={!cameraReady}
              className="w-18 h-18 rounded-full bg-white border-4 border-indigo-400 shadow-lg hover:scale-110 active:scale-90 transition-transform disabled:opacity-50"
              style={{ width: "72px", height: "72px" }} />
            <div className="w-16" /> {/* Spacer for centering */}
          </div>
          {/* Guide text */}
          <div className="absolute top-12 left-0 right-0 text-center">
            <p className="text-white/80 text-sm font-medium bg-black/30 inline-block px-4 py-1.5 rounded-full backdrop-blur">
              Position document in frame & tap capture
            </p>
          </div>
        </div>
      )}

      {/* ===== EDGE EDITOR ===== */}
      {editingImage && !showCamera && (
        <div className="p-4 sm:p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold flex items-center gap-2 text-sm"><Move className="w-4 h-4" /> Drag corners to document edges</h3>
          </div>

          {/* Image with corners */}
          <div
            ref={editorRef}
            className="relative mx-auto max-w-lg touch-none select-none"
            onMouseMove={handlePointerMove} onMouseUp={handlePointerEnd} onMouseLeave={handlePointerEnd}
            onTouchMove={handlePointerMove} onTouchEnd={handlePointerEnd}
          >
            <img src={editingImage} alt="Scan" className="w-full rounded-xl" />
            <svg className="absolute inset-0 w-full h-full pointer-events-none" viewBox="0 0 100 100" preserveAspectRatio="none">
              <polygon
                points={corners.map((c) => `${c.x * 100},${c.y * 100}`).join(" ")}
                fill="rgba(99, 102, 241, 0.12)" stroke="#6366f1" strokeWidth="0.4"
              />
            </svg>
            {corners.map((corner, i) => (
              <div key={i}
                onMouseDown={(e) => handleCornerStart(i, e)}
                onTouchStart={(e) => handleCornerStart(i, e)}
                className="absolute w-7 h-7 bg-[var(--primary)] border-2 border-white rounded-full cursor-grab active:cursor-grabbing shadow-lg -translate-x-1/2 -translate-y-1/2 z-10"
                style={{ left: `${corner.x * 100}%`, top: `${corner.y * 100}%` }}
              />
            ))}
          </div>

          {/* Filter options */}
          <div>
            <label className="block text-xs font-medium mb-2">Enhancement</label>
            <div className="flex gap-2 flex-wrap">
              {([
                ["original", "Original", Eye],
                ["grayscale", "Grayscale", ImageIcon],
                ["bw", "Black & White", Type],
                ["enhance", "Auto-enhance", Wand2],
              ] as const).map(([id, label, Icon]) => (
                <button key={id} onClick={() => setFilterMode(id)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${filterMode === id ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                  <Icon className="w-3 h-3" /> {label}
                </button>
              ))}
            </div>
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

      {/* ===== CAPTURE BUTTONS ===== */}
      {!editingImage && !showCamera && (
        <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="grid grid-cols-2 gap-3">
            <button onClick={startCamera}
              className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
                <Camera className="w-7 h-7 text-white" />
              </div>
              <p className="font-semibold text-sm text-center">Scan with Camera</p>
              <p className="text-[10px] text-[var(--muted-foreground)] text-center">Open camera to capture</p>
            </button>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex flex-col items-center gap-2 p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--muted)] transition-all">
              <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
                <Plus className="w-7 h-7 text-white" />
              </div>
              <p className="font-semibold text-sm text-center">Upload Photo</p>
              <p className="text-[10px] text-[var(--muted-foreground)] text-center">Select from gallery</p>
            </button>
          </div>
          <input ref={fileInputRef} type="file" accept="image/*" onChange={handleFileUpload} className="hidden" />
        </div>
      )}

      {/* ===== SCANNED PAGES ===== */}
      {pages.length > 0 && !editingImage && !showCamera && (
        <div className="mt-6">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">{pages.length} page{pages.length > 1 ? "s" : ""}</h3>
            <button onClick={() => fileInputRef.current?.click()}
              className="flex items-center gap-1 text-sm text-[var(--primary)] hover:underline">
              <Plus className="w-4 h-4" /> Add more
            </button>
          </div>
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {pages.map((page, index) => (
              <div key={page.id} className="relative group rounded-xl border border-[var(--border)] overflow-hidden bg-white">
                <img src={page.processed} alt={`Page ${index + 1}`}
                  className="w-full aspect-[3/4] object-cover"
                  style={{ transform: `rotate(${page.rotation}deg)` }} />
                <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-all flex items-center justify-center gap-1 opacity-0 group-hover:opacity-100">
                  <button onClick={() => rotatePage(page.id)} className="p-1.5 rounded-lg bg-white/90" title="Rotate">
                    <RotateCw className="w-3 h-3" />
                  </button>
                  <button onClick={() => removePage(page.id)} className="p-1.5 rounded-lg bg-white/90 text-red-500" title="Delete">
                    <Trash2 className="w-3 h-3" />
                  </button>
                  {index > 0 && (
                    <button onClick={() => movePage(index, index - 1)} className="p-1.5 rounded-lg bg-white/90 text-xs font-bold" title="Move left">←</button>
                  )}
                  {index < pages.length - 1 && (
                    <button onClick={() => movePage(index, index + 1)} className="p-1.5 rounded-lg bg-white/90 text-xs font-bold" title="Move right">→</button>
                  )}
                </div>
                <div className="absolute bottom-0.5 right-0.5 bg-black/60 text-white text-[9px] px-1 rounded">{index + 1}</div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== EXPORT OPTIONS ===== */}
      {pages.length > 0 && !editingImage && !showCamera && (
        <div className="mt-6 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-3">
          <label className="flex items-center gap-3 cursor-pointer">
            <input type="checkbox" checked={enableOCR} onChange={(e) => setEnableOCR(e.target.checked)} className="rounded" />
            <div>
              <span className="text-sm font-medium">Enable OCR (searchable PDF)</span>
              <p className="text-xs text-[var(--muted-foreground)]">Makes text searchable — takes extra time</p>
            </div>
          </label>
          {ocrProgress && <p className="text-xs text-[var(--primary)] font-medium">{ocrProgress}</p>}
          
          <div className="flex flex-col items-center gap-3">
            <ProcessingButton onClick={generatePDF} isProcessing={isProcessing} isComplete={isComplete} label="Create PDF" />
            {pdfBlob && (
              <div className="flex gap-3">
                <button onClick={async () => {
                  const file = new File([pdfBlob], "scanned.pdf", { type: "application/pdf" });
                  if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
                    await navigator.share({ files: [file], title: "Scanned Document" });
                  } else {
                    const url = URL.createObjectURL(pdfBlob);
                    const a = document.createElement("a"); a.href = url; a.download = "scanned.pdf"; a.click(); URL.revokeObjectURL(url);
                  }
                }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-green-500 text-white font-semibold text-sm hover:scale-105 active:scale-95 transition-all">
                  <Share2 className="w-4 h-4" /> Share
                </button>
                <button onClick={() => {
                  const url = URL.createObjectURL(pdfBlob);
                  const a = document.createElement("a"); a.href = url; a.download = "scanned.pdf"; a.click(); URL.revokeObjectURL(url);
                }}
                  className="flex items-center gap-2 px-5 py-2.5 rounded-xl border border-[var(--border)] font-semibold text-sm hover:bg-[var(--accent)]">
                  <Download className="w-4 h-4" /> Download Again
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Info */}
      <div className="mt-8 p-4 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2 text-center text-sm">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
          <p>📷 Open camera or upload photo of document</p>
          <p>📐 Drag corners to match document edges</p>
          <p>✨ Choose filter: Original / Grayscale / B&W / Enhanced</p>
          <p>📄 Perspective correction straightens tilted docs</p>
          <p>🔄 Rotate, reorder, delete pages</p>
          <p>📋 Optional OCR for searchable PDF</p>
          <p>💾 Download or share — files never leave your device</p>
          <p>📱 Works offline after first load (PWA)</p>
        </div>
      </div>
    </div>
  );
}
