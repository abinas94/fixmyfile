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
      const pdfData = await imagesToPDF(files);
      downloadBlob(pdfData, "images-combined.pdf");
      setIsComplete(true);
    } catch (error) {
      console.error("Error converting images to PDF:", error);
      alert(
        "Error converting images. Please make sure all files are valid images (JPG, PNG)."
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
              Convert images (JPG, PNG, WebP) into a single PDF
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

      {/* Action */}
      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
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
        <h3 className="font-semibold mb-2">Supported formats</h3>
        <p className="text-sm text-[var(--muted-foreground)]">
          JPG/JPEG, PNG, and WebP images are supported. Each image becomes one
          page in the output PDF, sized to the image dimensions.
        </p>
      </div>
    </div>
  );
}
