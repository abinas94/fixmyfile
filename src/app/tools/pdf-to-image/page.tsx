"use client";

import { useState } from "react";
import { Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function PDFToImage() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [format, setFormat] = useState<"png" | "jpeg">("png");
  const [scale, setScale] = useState(2);

  const handleFilesSelected = (newFiles: File[]) => {
    setFiles([newFiles[0]]);
    setIsComplete(false);
  };

  const handleRemoveFile = () => {
    setFiles([]);
    setIsComplete(false);
  };

  const handleConvert = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      for (let i = 1; i <= numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale });
        const canvas = document.createElement("canvas");
        const context = canvas.getContext("2d")!;
        canvas.height = viewport.height;
        canvas.width = viewport.width;

        await page.render({ canvasContext: context, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise;

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob(
            (blob) => resolve(blob!),
            format === "png" ? "image/png" : "image/jpeg",
            0.92
          );
        });

        const arrayBuf = await blob.arrayBuffer();
        zip.file(
          `page-${i}.${format}`,
          arrayBuf
        );
      }

      const zipBlob = await zip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${files[0].name.replace(".pdf", "")}-images.zip`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);

      setIsComplete(true);
    } catch (error) {
      console.error("Error converting PDF to images:", error);
      alert("Error converting PDF. Please make sure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 flex items-center justify-center shadow-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">PDF to Image</h1>
            <p className="text-[var(--muted-foreground)]">
              Convert each PDF page to a PNG or JPG image
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

      {/* Options */}
      {files.length > 0 && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {/* Format */}
            <div>
              <h3 className="font-semibold mb-3">Format</h3>
              <div className="flex gap-3">
                <button
                  onClick={() => setFormat("png")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    format === "png"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  PNG
                </button>
                <button
                  onClick={() => setFormat("jpeg")}
                  className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                    format === "jpeg"
                      ? "bg-[var(--primary)] text-white"
                      : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
                  }`}
                >
                  JPG
                </button>
              </div>
            </div>

            {/* Quality */}
            <div>
              <h3 className="font-semibold mb-3">
                Resolution ({scale}x)
              </h3>
              <input
                type="range"
                min="1"
                max="4"
                step="0.5"
                value={scale}
                onChange={(e) => setScale(Number(e.target.value))}
                className="w-full accent-[var(--primary)]"
              />
              <div className="flex justify-between text-xs text-[var(--muted-foreground)] mt-1">
                <span>Low (fast)</span>
                <span>High (slow)</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Action */}
      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton
            onClick={handleConvert}
            isProcessing={isProcessing}
            isComplete={isComplete}
            label="Convert & Download"
          />
        </div>
      )}
    </div>
  );
}
