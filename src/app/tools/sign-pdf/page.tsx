
"use client";

import { useState, useRef } from "react";
import { PenTool, ArrowLeft, Eraser, Upload, Type } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { downloadBlob } from "@/lib/pdf-utils";
import { PDFDocument } from "pdf-lib";
import ToolContent from "@/components/ToolContent";
import { toolContentData } from "@/lib/tool-content-data";

type SignMode = "draw" | "upload" | "type";
type Position = "bottom-right" | "bottom-left" | "bottom-center" | "top-right" | "top-left";

export default function SignPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [signMode, setSignMode] = useState<SignMode>("draw");
  const [position, setPosition] = useState<Position>("bottom-right");
  const [typedName, setTypedName] = useState("");
  const [uploadedSig, setUploadedSig] = useState<string | null>(null);

  // Drawing state
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sigUploadRef = useRef<HTMLInputElement>(null);
  const lastPoint = useRef<{ x: number; y: number } | null>(null);

  // Fixed coordinate mapping
  const getCoords = (e: React.MouseEvent | React.TouchEvent) => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    let clientX: number, clientY: number;
    if ("touches" in e) { clientX = e.touches[0].clientX; clientY = e.touches[0].clientY; }
    else { clientX = e.clientX; clientY = e.clientY; }
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    return { x: (clientX - rect.left) * scaleX, y: (clientY - rect.top) * scaleY };
  };

  const startDrawing = (e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    const { x, y } = getCoords(e);
    lastPoint.current = { x, y };
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent | React.TouchEvent) => {
    if (!isDrawing) return;
    e.preventDefault();
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const { x, y } = getCoords(e);
    const last = lastPoint.current || { x, y };

    ctx.strokeStyle = "#1a1a2e";
    ctx.lineWidth = 3;
    ctx.lineCap = "round";
    ctx.lineJoin = "round";
    ctx.beginPath();
    ctx.moveTo(last.x, last.y);
    ctx.lineTo(x, y);
    ctx.stroke();

    lastPoint.current = { x, y };
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    lastPoint.current = null;
  };

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSigUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => { setUploadedSig(reader.result as string); setHasSignature(true); };
    reader.readAsDataURL(file);
  };

  // Get signature as PNG data
  const getSignatureData = async (): Promise<ArrayBuffer | null> => {
    if (signMode === "draw") {
      const canvas = canvasRef.current;
      if (!canvas) return null;
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));
      return blob.arrayBuffer();
    } else if (signMode === "upload" && uploadedSig) {
      const res = await fetch(uploadedSig);
      return res.arrayBuffer();
    } else if (signMode === "type" && typedName.trim()) {
      // Render typed name as image
      const canvas = document.createElement("canvas");
      canvas.width = 400; canvas.height = 100;
      const ctx = canvas.getContext("2d")!;
      ctx.font = "italic 48px 'Georgia', serif";
      ctx.fillStyle = "#1a1a2e";
      ctx.textBaseline = "middle";
      ctx.fillText(typedName, 10, 50);
      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/png"));
      return blob.arrayBuffer();
    }
    return null;
  };

  const handleSign = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const sigData = await getSignatureData();
      if (!sigData) { alert("No signature provided"); setIsProcessing(false); return; }

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pngImage = await pdf.embedPng(sigData);
      const pages = pdf.getPages();
      const lastPage = pages[pages.length - 1];
      const { width, height } = lastPage.getSize();

      // Scale signature to reasonable size
      const sigWidth = Math.min(150, width * 0.25);
      const sigHeight = (pngImage.height / pngImage.width) * sigWidth;

      // Position
      let x = 0, y = 0;
      const margin = 40;
      switch (position) {
        case "bottom-right": x = width - sigWidth - margin; y = margin; break;
        case "bottom-left": x = margin; y = margin; break;
        case "bottom-center": x = (width - sigWidth) / 2; y = margin; break;
        case "top-right": x = width - sigWidth - margin; y = height - sigHeight - margin; break;
        case "top-left": x = margin; y = height - sigHeight - margin; break;
      }

      lastPage.drawImage(pngImage, { x, y, width: sigWidth, height: sigHeight });

      const result = await pdf.save();
      downloadBlob(result, `signed-${files[0].name}`);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error signing PDF.");
    } finally { setIsProcessing(false); }
  };

  const isReady = signMode === "draw" ? hasSignature : signMode === "upload" ? !!uploadedSig : !!typedName.trim();

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <PenTool className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Sign PDF</h1>
            <p className="text-[var(--muted-foreground)]">Draw, type, or upload a signature</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
          {/* Signature mode */}
          <div>
            <label className="block text-sm font-medium mb-2">Signature method</label>
            <div className="flex gap-2 flex-wrap">
              <button onClick={() => setSignMode("draw")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${signMode === "draw" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                <PenTool className="w-4 h-4" /> Draw
              </button>
              <button onClick={() => setSignMode("upload")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${signMode === "upload" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                <Upload className="w-4 h-4" /> Upload Image
              </button>
              <button onClick={() => setSignMode("type")}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium ${signMode === "type" ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                <Type className="w-4 h-4" /> Type Name
              </button>
            </div>
          </div>

          {/* Draw mode */}
          {signMode === "draw" && (
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="text-sm font-medium">Draw your signature</label>
                <button onClick={clearCanvas} className="flex items-center gap-1 text-xs text-[var(--muted-foreground)] hover:text-red-500">
                  <Eraser className="w-3 h-3" /> Clear
                </button>
              </div>
              <canvas
                ref={canvasRef}
                width={600} height={180}
                onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
                onTouchStart={startDrawing} onTouchMove={draw} onTouchEnd={stopDrawing}
                className="w-full border-2 border-dashed border-[var(--border)] rounded-xl bg-white cursor-crosshair touch-none"
                style={{ height: "120px" }}
              />
            </div>
          )}

          {/* Upload mode */}
          {signMode === "upload" && (
            <div>
              <label className="text-sm font-medium block mb-2">Upload signature image (PNG/JPG)</label>
              {uploadedSig ? (
                <div className="flex items-center gap-3 p-3 rounded-xl border border-[var(--border)] bg-white">
                  <img src={uploadedSig} alt="Signature" className="h-12 object-contain" />
                  <button onClick={() => { setUploadedSig(null); setHasSignature(false); }} className="text-xs text-red-500 hover:underline">Remove</button>
                </div>
              ) : (
                <button onClick={() => sigUploadRef.current?.click()}
                  className="w-full p-6 rounded-xl border-2 border-dashed border-[var(--border)] hover:border-[var(--primary)] text-center text-sm text-[var(--muted-foreground)]">
                  Click to upload signature image (specimen signature, stamp, etc.)
                </button>
              )}
              <input ref={sigUploadRef} type="file" accept="image/*" onChange={handleSigUpload} className="hidden" />
              <p className="text-xs text-[var(--muted-foreground)] mt-2">Upload pre-signed signatures of principals, directors, or officers</p>
            </div>
          )}

          {/* Type mode */}
          {signMode === "type" && (
            <div>
              <label className="text-sm font-medium block mb-2">Type your name</label>
              <input type="text" value={typedName} onChange={(e) => { setTypedName(e.target.value); setHasSignature(!!e.target.value.trim()); }}
                placeholder="Your full name"
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
              {typedName && (
                <div className="mt-2 p-3 rounded-xl bg-white border border-[var(--border)]">
                  <p className="italic text-2xl font-serif text-gray-800">{typedName}</p>
                </div>
              )}
            </div>
          )}

          {/* Position selector */}
          <div>
            <label className="block text-sm font-medium mb-2">Signature position (on last page)</label>
            <div className="flex flex-wrap gap-2">
              {([
                ["bottom-right", "Bottom Right"],
                ["bottom-left", "Bottom Left"],
                ["bottom-center", "Bottom Center"],
                ["top-right", "Top Right"],
                ["top-left", "Top Left"],
              ] as const).map(([pos, label]) => (
                <button key={pos} onClick={() => setPosition(pos)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${position === pos ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Sign button */}
          <div className="flex justify-center">
            <ProcessingButton onClick={handleSign} isProcessing={isProcessing} isComplete={isComplete} label="Sign & Download" disabled={!isReady} />
          </div>
        </div>
      )}

      <ToolContent {...toolContentData.signPdf} />
    </div>
  );
}
