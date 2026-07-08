"use client";

import { useState } from "react";
import { Unlock, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import ServerNotice from "@/components/ServerNotice";

export default function UnlockPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [password, setPassword] = useState("");
  const [progress, setProgress] = useState("");

  const handleUnlock = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress("Removing password protection...");
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("password", password);

      const response = await fetch("/api/unlock-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Unlock failed");
      }

      setProgress("Downloading...");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `unlocked-${files[0].name}`;
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
      setProgress("");
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Unlock failed. Check your password."));
      setProgress("");
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
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">PDF Password</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter the password to unlock this PDF"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
            <p className="text-xs text-[var(--muted-foreground)] mt-2">
              You must know the password. This tool removes it so the PDF opens freely afterward.
            </p>
          </div>

          <ServerNotice />

          <div className="flex flex-col items-center gap-3">
            <ProcessingButton onClick={handleUnlock} isProcessing={isProcessing} isComplete={isComplete}
              label="Unlock & Download" disabled={!password} />
            {progress && <p className="text-xs text-[var(--primary)] font-medium">{progress}</p>}
          </div>
        </div>
      )}
    </div>
  );
}
