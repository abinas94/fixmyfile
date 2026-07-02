"use client";

import { useState } from "react";
import { Image as ImageIcon, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function PPTToImages() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const file = files[0];
      const arrayBuffer = await file.arrayBuffer();
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(arrayBuffer);

      // Find slide images embedded in pptx
      const slideFiles = Object.keys(zip.files).filter(
        (name) => name.match(/^ppt\/slides\/slide\d+\.xml$/)
      ).sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
        return numA - numB;
      });

      // Render each slide as an image by extracting text and drawing on canvas
      const outputZip = new JSZip();

      for (let i = 0; i < slideFiles.length; i++) {
        const xml = await zip.file(slideFiles[i])?.async("string");
        if (!xml) continue;
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "text/xml");
        const textElements = doc.getElementsByTagName("a:t");
        const texts: string[] = [];
        for (let j = 0; j < textElements.length; j++) {
          const t = textElements[j].textContent?.trim();
          if (t) texts.push(t);
        }

        // Create canvas image for this slide
        const canvas = document.createElement("canvas");
        canvas.width = 1920;
        canvas.height = 1080;
        const ctx = canvas.getContext("2d")!;

        // Background
        ctx.fillStyle = "#ffffff";
        ctx.fillRect(0, 0, 1920, 1080);

        // Draw text content
        let yPos = 120;
        for (let j = 0; j < texts.length; j++) {
          const isTitle = j === 0;
          ctx.font = isTitle ? "bold 56px Arial" : "32px Arial";
          ctx.fillStyle = "#1a1a2e";
          
          // Word wrap
          const maxWidth = 1680;
          const words = texts[j].split(" ");
          let line = "";
          for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (ctx.measureText(test).width > maxWidth && line) {
              ctx.fillText(line, 120, yPos);
              yPos += isTitle ? 70 : 48;
              line = word;
            } else {
              line = test;
            }
          }
          if (line) {
            ctx.fillText(line, 120, yPos);
            yPos += isTitle ? 90 : 56;
          }
        }

        // Slide number
        ctx.font = "20px Arial";
        ctx.fillStyle = "#999";
        ctx.fillText(`Slide ${i + 1}`, 1800, 1050);

        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png");
        });
        outputZip.file(`slide-${i + 1}.png`, await blob.arrayBuffer());
      }

      const zipBlob = await outputZip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(zipBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${file.name.replace(/\.pptx?$/i, "")}-slides.zip`;
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error converting PPT to images. Make sure it's a valid .pptx file.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 to-amber-500 flex items-center justify-center shadow-lg">
            <ImageIcon className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">PPT to Images</h1>
            <p className="text-[var(--muted-foreground)]">Export PowerPoint slides as PNG images</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pptx,.ppt" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to Images" />
          <p className="text-xs text-[var(--muted-foreground)]">Creates a 1920x1080 PNG for each slide with text content</p>
        </div>
      )}
    </div>
  );
}
