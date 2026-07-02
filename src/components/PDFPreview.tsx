"use client";

import { useEffect, useRef, useState } from "react";
import { ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

interface PDFPreviewProps {
  file: File | null;
  className?: string;
}

export default function PDFPreview({ file, className = "" }: PDFPreviewProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [scale, setScale] = useState(1.2);
  const [isLoading, setIsLoading] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pdfDocRef = useRef<any>(null);

  useEffect(() => {
    if (!file) {
      setTotalPages(0);
      setCurrentPage(1);
      pdfDocRef.current = null;
      return;
    }

    const loadPDF = async () => {
      setIsLoading(true);
      try {
        const pdfjsLib = await import("pdfjs-dist");
        pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        pdfDocRef.current = pdf;
        setTotalPages(pdf.numPages);
        setCurrentPage(1);
        await renderPage(pdf, 1, scale);
      } catch (error) {
        console.error("Error loading PDF preview:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadPDF();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [file]);

  useEffect(() => {
    if (pdfDocRef.current) {
      renderPage(pdfDocRef.current, currentPage, scale);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentPage, scale]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const renderPage = async (pdf: any, pageNum: number, pageScale: number) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: pageScale });
    const context = canvas.getContext("2d")!;

    canvas.height = viewport.height;
    canvas.width = viewport.width;

    await page.render({
      canvasContext: context,
      viewport,
      canvas,
    } as unknown as Parameters<typeof page.render>[0]).promise;
  };

  if (!file) return null;

  return (
    <div
      className={`rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-hidden ${className}`}
    >
      {/* Controls */}
      <div className="flex items-center justify-between p-3 border-b border-[var(--border)] bg-[var(--muted)]">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage <= 1}
            className="p-1.5 rounded-lg hover:bg-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Previous page"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm font-medium min-w-[80px] text-center">
            {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage >= totalPages}
            className="p-1.5 rounded-lg hover:bg-[var(--accent)] disabled:opacity-30 disabled:cursor-not-allowed"
            aria-label="Next page"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setScale((s) => Math.max(0.5, s - 0.2))}
            className="p-1.5 rounded-lg hover:bg-[var(--accent)]"
            aria-label="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs font-medium min-w-[40px] text-center">
            {Math.round(scale * 100)}%
          </span>
          <button
            onClick={() => setScale((s) => Math.min(3, s + 0.2))}
            className="p-1.5 rounded-lg hover:bg-[var(--accent)]"
            aria-label="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Canvas */}
      <div className="relative overflow-auto max-h-[500px] flex items-center justify-center bg-gray-100 dark:bg-gray-900 p-4">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center bg-[var(--background)]/50 z-10">
            <div className="w-8 h-8 border-3 border-[var(--primary)] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <canvas ref={canvasRef} className="shadow-lg rounded max-w-full" />
      </div>
    </div>
  );
}
