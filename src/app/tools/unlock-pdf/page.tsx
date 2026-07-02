"use client";

import { useState } from "react";
import { Unlock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { downloadBlob } from "@/lib/pdf-utils";

export default function UnlockPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [password, setPassword] = useState("");

  const handleUnlock = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const { PDFDocument } = await import("pdf-lib");
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await PDFDocument.load(arrayBuffer, {
        ignoreEncryption: true,
      });
      
      // Re-save without encryption
      const result = await pdf.save();
      downloadBlob(result, `unlocked-${files[0].name}`);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error unlocking PDF. The password may be incorrect or the encryption is not supported client-side.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center shadow-lg">
            <Unlock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Unlock PDF</h1>
            <p className="text-[var(--muted-foreground)]">Remove password protection from a PDF</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <label className="block text-sm font-medium mb-2">PDF Password (if required)</label>
          <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter PDF password (leave blank if owner-restricted only)"
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleUnlock} isProcessing={isProcessing} isComplete={isComplete} label="Unlock & Download" />
        </div>
      )}
    </div>
  );
}
