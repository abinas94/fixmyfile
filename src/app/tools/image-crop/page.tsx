"use client";

import { useState } from "react";
import { Crop, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function ImageCrop() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [cropX, setCropX] = useState(0);
  const [cropY, setCropY] = useState(0);
  const [cropW, setCropW] = useState(500);
  const [cropH, setCropH] = useState(500);
  const [imgSize, setImgSize] = useState({ w: 0, h: 0 });
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFilesSelected = (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setIsComplete(false);
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    const img = new window.Image();
    img.onload = () => {
      setImgSize({ w: img.width, h: img.height });
      setCropW(img.width);
      setCropH(img.height);
    };
    img.src = url;
  };

  const handleCrop = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const img = new window.Image();
      const url = URL.createObjectURL(files[0]);
      await new Promise((resolve) => { img.onload = resolve; img.src = url; });

      const canvas = document.createElement("canvas");
      canvas.width = cropW;
      canvas.height = cropH;
      const ctx = canvas.getContext("2d")!;
      ctx.drawImage(img, cropX, cropY, cropW, cropH, 0, 0, cropW, cropH);
      URL.revokeObjectURL(url);

      const blob = await new Promise<Blob>((resolve) => {
        canvas.toBlob((b) => resolve(b!), files[0].type || "image/png", 0.95);
      });

      const a = document.createElement("a");
      a.href = URL.createObjectURL(blob);
      a.download = `cropped-${files[0].name}`;
      a.click();
      URL.revokeObjectURL(a.href);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error cropping image.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <Crop className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Crop Image</h1>
            <p className="text-[var(--muted-foreground)]">Crop images to custom dimensions</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={handleFilesSelected} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setPreviewUrl(null); }} />

      {files.length > 0 && imgSize.w > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm text-[var(--muted-foreground)] mb-4">Image size: {imgSize.w} x {imgSize.h}px</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
            <div>
              <label className="block text-xs font-medium mb-1">X offset</label>
              <input type="number" min={0} max={imgSize.w} value={cropX} onChange={(e) => setCropX(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Y offset</label>
              <input type="number" min={0} max={imgSize.h} value={cropY} onChange={(e) => setCropY(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Width</label>
              <input type="number" min={1} max={imgSize.w - cropX} value={cropW} onChange={(e) => setCropW(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">Height</label>
              <input type="number" min={1} max={imgSize.h - cropY} value={cropH} onChange={(e) => setCropH(Number(e.target.value))}
                className="w-full px-3 py-2 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm" />
            </div>
          </div>
          {previewUrl && (
            <div className="relative inline-block max-w-full overflow-hidden rounded-xl border border-[var(--border)]">
              <img src={previewUrl} alt="Preview" className="max-w-full max-h-[300px] object-contain" />
            </div>
          )}
        </div>
      )}

      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton onClick={handleCrop} isProcessing={isProcessing} isComplete={isComplete} label="Crop & Download" />
        </div>
      )}
    </div>
  );
}
