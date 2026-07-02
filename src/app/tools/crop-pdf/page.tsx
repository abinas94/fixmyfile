"use client";

import { useState } from "react";
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
  const [margins, setMargins] = useState({ top: 20, bottom: 20, left: 20, right: 20 });

  const handleCrop = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer);
      const pages = pdf.getPages();

      for (const page of pages) {
        const { width, height } = page.getSize();
        page.setCropBox(
          margins.left,
          margins.bottom,
          width - margins.left - margins.right,
          height - margins.top - margins.bottom
        );
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
            <p className="text-[var(--muted-foreground)]">Crop page margins and whitespace</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <h3 className="font-semibold mb-4">Margins to crop (points)</h3>
          <div className="grid grid-cols-2 gap-4">
            {(["top", "bottom", "left", "right"] as const).map((side) => (
              <div key={side}>
                <label className="block text-sm font-medium mb-1 capitalize">{side}</label>
                <input type="number" min={0} max={200} value={margins[side]}
                  onChange={(e) => setMargins({ ...margins, [side]: Number(e.target.value) })}
                  className="w-full px-4 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
              </div>
            ))}
          </div>
          {/* Visual preview */}
          <div className="mt-4 flex justify-center">
            <div className="relative w-32 h-44 border-2 border-[var(--border)] rounded bg-white dark:bg-gray-800">
              <div className="absolute bg-red-100 dark:bg-red-900/30" style={{ top: 0, left: 0, right: 0, height: `${(margins.top / 200) * 100}%` }} />
              <div className="absolute bg-red-100 dark:bg-red-900/30" style={{ bottom: 0, left: 0, right: 0, height: `${(margins.bottom / 200) * 100}%` }} />
              <div className="absolute bg-red-100 dark:bg-red-900/30" style={{ top: 0, left: 0, bottom: 0, width: `${(margins.left / 200) * 100}%` }} />
              <div className="absolute bg-red-100 dark:bg-red-900/30" style={{ top: 0, right: 0, bottom: 0, width: `${(margins.right / 200) * 100}%` }} />
              <span className="absolute inset-0 flex items-center justify-center text-[8px] text-[var(--muted-foreground)]">Keep Area</span>
            </div>
          </div>
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleCrop} isProcessing={isProcessing} isComplete={isComplete} label="Crop & Download" />
        </div>
      )}
    </div>
  );
}
