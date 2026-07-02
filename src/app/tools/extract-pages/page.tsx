"use client";

import { useState } from "react";
import { FileOutput, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { splitPDF, getPDFPageCount, downloadBlob, downloadAsZip } from "@/lib/pdf-utils";

export default function ExtractPages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pageCount, setPageCount] = useState<number | null>(null);
  const [pagesInput, setPagesInput] = useState("");

  const handleFilesSelected = async (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsComplete(false);
    try {
      const count = await getPDFPageCount(newFiles[0]);
      setPageCount(count);
    } catch { setPageCount(null); }
  };

  const handleExtract = async () => {
    if (!files.length || !pagesInput.trim()) return;
    setIsProcessing(true);
    try {
      const ranges = pagesInput.split(",").map((p) => p.trim()).filter(Boolean).map((p) => {
        if (p.includes("-")) {
          const [s, e] = p.split("-").map(Number);
          return { start: s, end: e };
        }
        return { start: Number(p), end: Number(p) };
      });
      const results = await splitPDF(files[0], ranges);
      if (results.length === 1) {
        downloadBlob(results[0], "extracted.pdf");
      } else {
        await downloadAsZip(results.map((d, i) => ({ data: d, name: `extracted-${i + 1}.pdf` })));
      }
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error extracting pages. Check your input.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-500 to-yellow-600 flex items-center justify-center shadow-lg">
            <FileOutput className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Extract Pages</h1>
            <p className="text-[var(--muted-foreground)]">Extract specific pages from a PDF</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setPageCount(null); }} />

      {files.length > 0 && pageCount && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)] mb-3">
            Document has <strong>{pageCount}</strong> pages
          </p>
          <label className="block text-sm font-medium mb-2">Pages to extract</label>
          <input
            type="text" value={pagesInput} onChange={(e) => setPagesInput(e.target.value)}
            placeholder="e.g., 1, 3-5, 8, 10-12"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-2">Separate pages with commas. Use dashes for ranges.</p>
        </div>
      )}

      {files.length > 0 && pagesInput.trim() && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleExtract} isProcessing={isProcessing} isComplete={isComplete} label="Extract & Download" />
        </div>
      )}
    </div>
  );
}
