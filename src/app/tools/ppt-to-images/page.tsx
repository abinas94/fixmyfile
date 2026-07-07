"use client";

import { useState } from "react";
import { Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { convertFile, downloadBlob } from "@/lib/convert-api";
import ServerNotice from "@/components/ServerNotice";

export default function PPTToImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState("");

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      // Convert PPT to PDF first, then PDF to images (client-side)
      setProgress("Converting PPT to PDF...");
      const pdfBlob = await convertFile(files[0], "pptx", "pdf", setProgress);

      setProgress("Rendering slides as images...");
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await pdfBlob.arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Rendering slide ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await (page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise);

        const blob = await new Promise<Blob>((resolve) => { canvas.toBlob((b) => resolve(b!), "image/png"); });
        zip.file(`slide-${i}.png`, await blob.arrayBuffer());
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(zipBlob, files[0].name.replace(/\.pptx?$/i, "-slides.zip"));
      setIsComplete(true); setProgress("");
    } catch (error) { alert("Error: " + (error instanceof Error ? error.message : "Failed")); setProgress(""); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4"><ArrowLeft className="w-4 h-4" /> Back to tools</Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg"><ImageIcon className="w-6 h-6 text-white" /></div>
          <div><h1 className="text-2xl sm:text-3xl font-bold">PPT to Images</h1><p className="text-[var(--muted-foreground)]">Export PowerPoint slides as PNG images</p></div>
        </div>
      </div>
      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pptx,.ppt" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />
      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ServerNotice />
 <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to Images (ZIP)" />
          {progress && <p className="text-xs text-[var(--primary)] font-medium">{progress}</p>}
          <p className="text-xs text-[var(--muted-foreground)]">Full-quality PNG render of each slide with all graphics and formatting.</p>
        </div>
      )}
    </div>
  );
}
