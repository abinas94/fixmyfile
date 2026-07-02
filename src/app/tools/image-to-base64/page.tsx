"use client";

import { useState } from "react";
import { Binary, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";

export default function ImageToBase64() {
  const [files, setFiles] = useState<File[]>([]);
  const [output, setOutput] = useState("");
  const [dataUri, setDataUri] = useState("");
  const [copied, setCopied] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setDataUri(result);
      setOutput(result.split(",")[1] || "");
    };
    reader.readAsDataURL(file);
  };

  const copyValue = (val: string, label: string) => {
    navigator.clipboard.writeText(val);
    setCopied(label);
    setTimeout(() => setCopied(null), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-500 to-gray-700 flex items-center justify-center shadow-lg">
            <Binary className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Image to Base64</h1>
            <p className="text-[var(--muted-foreground)]">Convert any image to Base64 encoded string</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setOutput(""); setDataUri(""); }} />

      {output && (
        <div className="mt-6 space-y-4">
          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Data URI (use in HTML/CSS)</label>
              <button onClick={() => copyValue(dataUri, "uri")} className="flex items-center gap-1 text-xs text-[var(--primary)]">
                {copied === "uri" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === "uri" ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea value={dataUri} readOnly rows={3} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-xs font-mono resize-y" />
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">Raw Base64 String</label>
              <button onClick={() => copyValue(output, "raw")} className="flex items-center gap-1 text-xs text-[var(--primary)]">
                {copied === "raw" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === "raw" ? "Copied!" : "Copy"}
              </button>
            </div>
            <textarea value={output} readOnly rows={4} className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-xs font-mono resize-y" />
          </div>

          <div className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium">HTML img tag</label>
              <button onClick={() => copyValue(`<img src="${dataUri}" alt="image" />`, "html")} className="flex items-center gap-1 text-xs text-[var(--primary)]">
                {copied === "html" ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied === "html" ? "Copied!" : "Copy"}
              </button>
            </div>
            <code className="block text-xs bg-[var(--muted)] p-2 rounded-lg font-mono break-all">
              {`<img src="${dataUri.substring(0, 60)}..." alt="image" />`}
            </code>
          </div>

          <p className="text-xs text-[var(--muted-foreground)]">
            String length: {output.length.toLocaleString()} characters ({(output.length * 0.75 / 1024).toFixed(1)} KB)
          </p>
        </div>
      )}
    </div>
  );
}
