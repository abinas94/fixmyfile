"use client";

import { useState } from "react";
import { RotateCw, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { rotatePDF, downloadBlob } from "@/lib/pdf-utils";

export default function RotatePDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [rotation, setRotation] = useState(90);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsComplete(false);
  };

  const handleRemoveFile = () => {
    setFiles([]);
    setIsComplete(false);
  };

  const handleRotate = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const rotated = await rotatePDF(files[0], rotation);
      downloadBlob(rotated, `rotated-${files[0].name}`);
      setIsComplete(true);
    } catch (error) {
      console.error("Error rotating PDF:", error);
      alert("Error rotating PDF. Please make sure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const rotationOptions = [
    { value: 90, label: "90° Right", icon: "↻" },
    { value: 180, label: "180°", icon: "↕" },
    { value: 270, label: "90° Left", icon: "↺" },
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-teal-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <RotateCw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Rotate PDF</h1>
            <p className="text-[var(--muted-foreground)]">
              Rotate all pages in your PDF
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

      {/* Rotation Options */}
      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <h3 className="font-semibold mb-4">Rotation</h3>
          <div className="grid grid-cols-3 gap-3">
            {rotationOptions.map((opt) => (
              <button
                key={opt.value}
                onClick={() => {
                  setRotation(opt.value);
                  setIsComplete(false);
                }}
                className={`p-4 rounded-xl border text-center transition-all ${
                  rotation === opt.value
                    ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20"
                    : "border-[var(--border)] hover:border-[var(--primary)]"
                }`}
              >
                <span className="text-2xl block mb-1">{opt.icon}</span>
                <span className="text-sm font-medium">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Action */}
      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton
            onClick={handleRotate}
            isProcessing={isProcessing}
            isComplete={isComplete}
            label="Rotate & Download"
          />
        </div>
      )}
    </div>
  );
}
