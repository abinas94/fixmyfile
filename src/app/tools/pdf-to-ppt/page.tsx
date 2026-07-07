"use client";

import { useState } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { convertFile, downloadBlob } from "@/lib/convert-api";
import ServerNotice from "@/components/ServerNotice";

export default function PDFToPPT() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState("");

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const blob = await convertFile(files[0], "pdf", "pptx", setProgress);
      downloadBlob(blob, files[0].name.replace(/\.pdf$/i, ".pptx"));
      setIsComplete(true); setProgress("");
    } catch (error) { alert("Error: " + (error instanceof Error ? error.message : "Failed")); setProgress(""); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4"><ArrowLeft className="w-4 h-4" /> Back to tools</Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg"><FileText className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl sm:text-3xl font-bold">PDF to PowerPoint</h1><p className="text-[var(--muted-foreground)]">Convert PDF to editable PowerPoint slides</p></div>
        </div>
      </div>
      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />
      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ServerNotice />
 <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to PowerPoint (.pptx)" />
          {progress && <p className="text-xs text-[var(--primary)] font-medium">{progress}</p>}
          <p className="text-xs text-[var(--muted-foreground)]">Each PDF page becomes an editable slide with text and images.</p>
        </div>
      )}
    </div>
  );
}
