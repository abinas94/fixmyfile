"use client";

import { useState } from "react";
import { FileImage, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { imagesToPDF, downloadBlob } from "@/lib/pdf-utils";

export default function ImageToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [pageSize, setPageSize] = useState<"fit" | "original">("fit");

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

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfData = await imagesToPDF(files, { fitToPage: pageSize === "fit" });
      downloadBlob(pdfData, "images-combined.pdf");
      setIsComplete(true);
    } catch (error) {
      console.error("Error converting images to PDF:", error);
      alert(
        "Error converting images. Please make sure all files are valid images (JPG, PNG, WebP)."
      );
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-violet-600 flex items-center justify-center shadow-lg">
            <FileImage className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Image to PDF</h1>
            <p className="text-[var(--muted-foreground)]">
              Convert images (JPG, PNG, WebP) into a single PDF — full quality, no compression
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <FileDropZone
        onFilesSelected={handleFilesSelected}
        accept="image/*"
        multiple={true}
        maxFiles={50}
        files={files}
        onRemoveFile={handleRemoveFile}
        onReorderFiles={handleReorderFiles}
      />

      {/* Options */}
      {files.length > 0 && (
        <div className="mt-6 p-4 rounded-xl bg-[var(--card)] border border-[var(--border)]">
          <h3 className="text-sm font-semibold mb-3">Page Size</h3>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setPageSize("fit")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pageSize === "fit"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              Fit to A4 (recommended)
            </button>
            <button
              onClick={() => setPageSize("original")}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                pageSize === "original"
                  ? "bg-[var(--primary)] text-white shadow-md"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              Original Size (1px = 1pt)
            </button>
          </div>
          <p className="text-xs text-[var(--muted-foreground)] mt-2">
            {pageSize === "fit"
              ? "Images are scaled to fit A4 pages (auto landscape/portrait). Full resolution is preserved in the PDF."
              : "Each page is sized exactly to the image pixel dimensions. Best for printing at exact size."}
          </p>
        </div>
      )}

      {/* Action */}
      {files.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-3">
          <ProcessingButton
            onClick={handleConvert}
            isProcessing={isProcessing}
            isComplete={isComplete}
            label="Convert to PDF & Download"
          />
          <p className="text-xs text-[var(--muted-foreground)]">
            Images will appear in the PDF in the order shown above
          </p>
        </div>
      )}

      {/* Info */}
      <div className="mt-12 p-6 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2">Zero quality loss</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          JPG and PNG images are embedded directly into the PDF at their original quality — no re-encoding or compression.
          WebP images are converted to maximum-quality JPEG before embedding. Everything runs in your browser.
        </p>
      </div>
    </div>
  );
}
