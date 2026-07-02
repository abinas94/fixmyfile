"use client";

import { useState } from "react";
import { Minimize2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { compressPDF, downloadBlob } from "@/lib/pdf-utils";

export default function CompressPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [quality, setQuality] = useState<"low" | "medium" | "high">("medium");
  const [result, setResult] = useState<{
    originalSize: number;
    newSize: number;
  } | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsComplete(false);
    setResult(null);
  };

  const handleRemoveFile = () => {
    setFiles([]);
    setIsComplete(false);
    setResult(null);
  };

  const handleCompress = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const originalSize = files[0].size;
      const compressed = await compressPDF(files[0], quality);
      const newSize = compressed.length;
      setResult({ originalSize, newSize });
      downloadBlob(compressed, `compressed-${files[0].name}`);
      setIsComplete(true);
    } catch (error) {
      console.error("Error compressing PDF:", error);
      alert("Error compressing PDF. Please make sure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const formatSize = (bytes: number) => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  const qualityOptions = [
    {
      value: "high" as const,
      label: "Maximum Compression",
      description: "Smallest file size, lower quality",
    },
    {
      value: "medium" as const,
      label: "Balanced",
      description: "Good balance between size and quality",
    },
    {
      value: "low" as const,
      label: "Minimum Compression",
      description: "Best quality, larger file size",
    },
  ];

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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 flex items-center justify-center shadow-lg">
            <Minimize2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Compress PDF</h1>
            <p className="text-[var(--muted-foreground)]">
              Reduce file size while maintaining quality
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <FileDropZone
        onFilesSelected={handleFilesSelected}
        accept=".pdf"
        multiple={false}
        maxFiles={1}
        files={files}
        onRemoveFile={handleRemoveFile}
      />

      {/* Quality Options */}
      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <h3 className="font-semibold mb-4">Compression Level</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {qualityOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setQuality(opt.value);
                  setIsComplete(false);
                }}
                className={`p-4 rounded-xl border text-left transition-all ${
                  quality === opt.value
                    ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20"
                    : "border-[var(--border)] hover:border-[var(--primary)]"
                }`}
              >
                <p className="font-medium text-sm">{opt.label}</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-1">
                  {opt.description}
                </p>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Result */}
      {result && (
        <div className="mt-6 p-6 rounded-2xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Original: {formatSize(result.originalSize)}
              </p>
              <p className="text-sm font-medium text-green-800 dark:text-green-300">
                Compressed: {formatSize(result.newSize)}
              </p>
            </div>
            <div className="text-right">
              <p className="text-2xl font-bold text-green-600">
                {Math.max(
                  0,
                  Math.round(
                    ((result.originalSize - result.newSize) /
                      result.originalSize) *
                      100
                  )
                )}
                %
              </p>
              <p className="text-xs text-green-700 dark:text-green-400">
                size reduced
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton
            onClick={handleCompress}
            isProcessing={isProcessing}
            isComplete={isComplete}
            label="Compress & Download"
          />
        </div>
      )}
    </div>
  );
}
