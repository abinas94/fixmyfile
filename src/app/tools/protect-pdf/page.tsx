"use client";

import { useState } from "react";
import { Lock, ArrowLeft, Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import ServerNotice from "@/components/ServerNotice";

export default function ProtectPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [progress, setProgress] = useState("");

  const handleProtect = async () => {
    if (!files.length || !password) return;
    if (password !== confirmPassword) { alert("Passwords don't match"); return; }
    if (password.length < 4) { alert("Password must be at least 4 characters"); return; }

    setIsProcessing(true);
    setProgress("Encrypting PDF with AES-256...");
    try {
      const formData = new FormData();
      formData.append("file", files[0]);
      formData.append("password", password);

      const response = await fetch("/api/protect-pdf", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const err = await response.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "Protection failed");
      }

      setProgress("Downloading...");
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `protected-${files[0].name}`;
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
      setProgress("");
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Protection failed"));
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-600 to-red-700 flex items-center justify-center shadow-lg">
            <Lock className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Protect PDF</h1>
            <p className="text-[var(--muted-foreground)]">Encrypt with AES-256 password protection</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Set Password</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"} value={password}
                onChange={(e) => { setPassword(e.target.value); setIsComplete(false); }}
                placeholder="Enter a strong password"
                className="w-full px-4 py-3 pr-12 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <button onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-[var(--muted-foreground)]">
                {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-2">Confirm Password</label>
            <input
              type={showPassword ? "text" : "password"} value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Re-enter password"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
            />
            {confirmPassword && password !== confirmPassword && (
              <p className="text-xs text-red-500 mt-1">Passwords don&apos;t match</p>
            )}
          </div>

          <ServerNotice />

          <div className="flex flex-col items-center gap-3">
            <ProcessingButton onClick={handleProtect} isProcessing={isProcessing} isComplete={isComplete}
              label="Encrypt & Download" disabled={!password || password.length < 4 || password !== confirmPassword} />
            {progress && <p className="text-xs text-[var(--primary)] font-medium">{progress}</p>}
          </div>

          <div className="p-3 rounded-xl bg-[var(--muted)] text-xs text-[var(--muted-foreground)]">
            <p><strong>AES-256 encryption</strong> — the same standard used by banks and governments.</p>
            <p className="mt-1">Anyone opening this PDF will need to enter the password. Without it, the file cannot be read.</p>
          </div>
        </div>
      )}
    </div>
  );
}
