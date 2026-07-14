
"use client";

import { useState } from "react";
import { Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { mergePDFs, downloadBlob } from "@/lib/pdf-utils";
import ToolContent from "@/components/ToolContent";
import { toolContentData } from "@/lib/tool-content-data";

export default function MergePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles((prev) => [...prev, ...newFiles]);
    setIsComplete(false);
  };

  const handleRemoveFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
    setIsComplete(false);
  };

  const handleReorderFiles = (reorderedFiles: File[]) => {
    setFiles(reorderedFiles);
  };

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const merged = await mergePDFs(files);
      downloadBlob(merged, "merged.pdf");
      setIsComplete(true);
    } catch (error) {
      console.error("Error merging PDFs:", error);
      alert("Error merging PDFs. Please make sure all files are valid PDFs.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 flex items-center justify-center shadow-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Merge PDF</h1>
            <p className="text-[var(--muted-foreground)]">
              Combine multiple PDF files into a single document
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <FileDropZone
        onFilesSelected={handleFilesSelected}
        accept=".pdf"
        multiple={true}
        maxFiles={50}
        files={files}
        onRemoveFile={handleRemoveFile}
        onReorderFiles={handleReorderFiles}
      />

      {/* Action */}
      {files.length >= 2 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton
            onClick={handleMerge}
            isProcessing={isProcessing}
            isComplete={isComplete}
            label="Merge & Download"
            disabled={files.length < 2}
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Files will be merged in the order shown above
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-12 p-6 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2">How to merge PDF files</h3>
        <ol className="list-decimal list-inside text-sm text-[var(--muted-foreground)] space-y-1">
          <li>Select two or more PDF files by dropping them above or clicking to browse.</li>
          <li>Drag files to reorder them as needed.</li>
          <li>Click &quot;Merge & Download&quot; to combine them into one PDF.</li>
          <li>Your merged PDF will download automatically.</li>
        </ol>
      </div>

      <ToolContent {...toolContentData.merge} />
    </div>
  );
}
