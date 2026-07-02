"use client";

import { useState, useRef } from "react";
import { PenTool, ArrowLeft, Eraser } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { downloadBlob } from "@/lib/pdf-utils";
import { PDFDocument } from "pdf-lib";

export default function SignPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [hasSignature, setHasSignature] = useState(false);

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
    setIsDrawing(true);
    setHasSignature(true);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = "round";
    ctx.strokeStyle = "#1a1a2e";
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const handleSign = async () => {
    if (!files.length || !canvasRef.current) return;
    setIsProcessing(true);
    try {
      const canvas = canvasRef.current;
      const pngBlob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((blob) => resolve(blob!), "image/png");
      });
      const pngBuffer = await pngBlob.arrayBuffer();

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pngImage = await pdf.embedPng(pngBuffer);
      const pages = pdf.getPages();
      const lastPage = pages[pages.length - 1];
      const { width } = lastPage.getSize();

      const sigWidth = 150;
      const sigHeight = (pngImage.height / pngImage.width) * sigWidth;

      lastPage.drawImage(pngImage, {
        x: width - sigWidth - 50,
        y: 60,
        width: sigWidth,
        height: sigHeight,
      });

      const result = await pdf.save();
      downloadBlob(result, `signed-${files[0].name}`);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error signing PDF.");
    } finally { setIsProcessing(false); }
  };

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
            <p className="text-[var(--muted-foreground)]">Draw your signature and place it on a PDF</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">Draw your signature</h3>
            <button onClick={clearCanvas} className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-red-500">
              <Eraser className="w-4 h-4" /> Clear
            </button>
          </div>
          <canvas
            ref={canvasRef}
            width={500} height={150}
            onMouseDown={startDrawing} onMouseMove={draw} onMouseUp={stopDrawing} onMouseLeave={stopDrawing}
            className="w-full border-2 border-dashed border-[var(--border)] rounded-xl bg-white cursor-crosshair touch-none"
            style={{ maxHeight: "150px" }}
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-2">Signature will be placed on the bottom-right of the last page</p>
        </div>
      )}

      {files.length > 0 && hasSignature && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleSign} isProcessing={isProcessing} isComplete={isComplete} label="Sign & Download" />
        </div>
      )}
    </div>
  );
}
