"use client";

import { useState } from "react";
import { Hash, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { downloadBlob } from "@/lib/pdf-utils";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";

type Position = "bottom-center" | "bottom-right" | "bottom-left" | "top-center" | "top-right" | "top-left";

export default function PageNumbers() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [position, setPosition] = useState<Position>("bottom-center");
  const [startNumber, setStartNumber] = useState(1);
  const [fontSize, setFontSize] = useState(12);

  const handleProcess = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const pages = pdf.getPages();

      pages.forEach((page, i) => {
        const { width, height } = page.getSize();
        const pageNum = `${startNumber + i}`;
        const textWidth = font.widthOfTextAtSize(pageNum, fontSize);

        let x = 0, y = 0;
        switch (position) {
          case "bottom-center": x = (width - textWidth) / 2; y = 30; break;
          case "bottom-left": x = 40; y = 30; break;
          case "bottom-right": x = width - textWidth - 40; y = 30; break;
          case "top-center": x = (width - textWidth) / 2; y = height - 40; break;
          case "top-left": x = 40; y = height - 40; break;
          case "top-right": x = width - textWidth - 40; y = height - 40; break;
        }

        page.drawText(pageNum, { x, y, size: fontSize, font, color: rgb(0.2, 0.2, 0.2) });
      });

      const result = await pdf.save();
      downloadBlob(result, `numbered-${files[0].name}`);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error adding page numbers.");
    } finally { setIsProcessing(false); }
  };

  const positions: { value: Position; label: string }[] = [
    { value: "bottom-center", label: "Bottom Center" },
    { value: "bottom-left", label: "Bottom Left" },
    { value: "bottom-right", label: "Bottom Right" },
    { value: "top-center", label: "Top Center" },
    { value: "top-left", label: "Top Left" },
    { value: "top-right", label: "Top Right" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg">
            <Hash className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Add Page Numbers</h1>
            <p className="text-[var(--muted-foreground)]">Insert page numbers on every page</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-5">
          <div>
            <label className="block text-sm font-medium mb-2">Position</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {positions.map((p) => (
                <button key={p.value} onClick={() => setPosition(p.value)}
                  className={`px-3 py-2 rounded-xl text-xs font-medium transition-all ${position === p.value ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
                  {p.label}
                </button>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Start from</label>
              <input type="number" min={1} value={startNumber} onChange={(e) => setStartNumber(Number(e.target.value))}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Font Size: {fontSize}px</label>
              <input type="range" min={8} max={24} value={fontSize} onChange={(e) => setFontSize(Number(e.target.value))} className="w-full accent-[var(--primary)] mt-2" />
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleProcess} isProcessing={isProcessing} isComplete={isComplete} label="Add Numbers & Download" />
        </div>
      )}
    </div>
  );
}
