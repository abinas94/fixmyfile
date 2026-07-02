"use client";

import { useState } from "react";
import { RotateCw, ArrowLeft, FlipHorizontal, FlipVertical } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function ImageRotate() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [flipH, setFlipH] = useState(false);
  const [flipV, setFlipV] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsComplete(false);
    setRotation(0); setFlipH(false); setFlipV(false);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(newFiles[0]));
  };

  const handleProcess = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const img = new window.Image();
      const url = URL.createObjectURL(files[0]);
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });
      URL.revokeObjectURL(url);

      const isRotated90 = rotation === 90 || rotation === 270;
      const canvas = document.createElement("canvas");
      canvas.width = isRotated90 ? img.height : img.width;
      canvas.height = isRotated90 ? img.width : img.height;
      const ctx = canvas.getContext("2d")!;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((rotation * Math.PI) / 180);
      ctx.scale(flipH ? -1 : 1, flipV ? -1 : 1);
      ctx.drawImage(img, -img.width / 2, -img.height / 2);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), files[0].type || "image/png", 0.95);
      });
      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `rotated-${files[0].name}`;
      a.click();
      URL.revokeObjectURL(a.href);
      setIsComplete(true);
    } catch (error) { console.error(error); alert("Error."); }
    finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <RotateCw className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Rotate & Flip Image</h1>
            <p className="text-[var(--muted-foreground)]">Rotate or flip images in any direction</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setPreviewUrl(null); }} />

      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="flex flex-wrap gap-2 mb-4">
            <button onClick={() => setRotation((r) => (r + 90) % 360)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm bg-[var(--muted)] hover:bg-[var(--accent)]">
              <RotateCw className="w-4 h-4" /> Rotate 90° Right
            </button>
            <button onClick={() => setRotation((r) => (r + 270) % 360)} className="flex items-center gap-1 px-3 py-2 rounded-xl text-sm bg-[var(--muted)] hover:bg-[var(--accent)]">
              <RotateCw className="w-4 h-4 scale-x-[-1]" /> Rotate 90° Left
            </button>
            <button onClick={() => setFlipH(!flipH)} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm ${flipH ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>
              <FlipHorizontal className="w-4 h-4" /> Flip Horizontal
            </button>
            <button onClick={() => setFlipV(!flipV)} className={`flex items-center gap-1 px-3 py-2 rounded-xl text-sm ${flipV ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)]"}`}>
              <FlipVertical className="w-4 h-4" /> Flip Vertical
            </button>
          </div>
          {previewUrl && (
            <div className="flex justify-center p-4 bg-[var(--muted)] rounded-xl">
              <img src={previewUrl} alt="Preview" className="max-h-[250px] object-contain transition-transform"
                style={{ transform: `rotate(${rotation}deg) scaleX(${flipH ? -1 : 1}) scaleY(${flipV ? -1 : 1})` }} />
            </div>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleProcess} isProcessing={isProcessing} isComplete={isComplete} label="Apply & Download" />
        </div>
      )}
    </div>
  );
}
