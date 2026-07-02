"use client";

import { useState } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function PPTToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const file = files[0];
      // Read .pptx (ZIP with XML slides)
      const arrayBuffer = await file.arrayBuffer();
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Find all slides
      const slideFiles = Object.keys(zip.files).filter(
        (name) => name.match(/^ppt\/slides\/slide\d+\.xml$/)
      ).sort((a, b) => {
        const numA = parseInt(a.match(/slide(\d+)/)?.[1] || "0");
        const numB = parseInt(b.match(/slide(\d+)/)?.[1] || "0");
        return numA - numB;
      });
      
      // Extract text from each slide
      const slides: string[][] = [];
      for (const slideFile of slideFiles) {
        const xml = await zip.file(slideFile)?.async("string");
        if (!xml) continue;
        const parser = new DOMParser();
        const doc = parser.parseFromString(xml, "text/xml");
        const textElements = doc.getElementsByTagName("a:t");
        const slideTexts: string[] = [];
        for (let i = 0; i < textElements.length; i++) {
          const t = textElements[i].textContent?.trim();
          if (t) slideTexts.push(t);
        }
        slides.push(slideTexts);
      }
      
      // Generate PDF - one page per slide
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      
      for (let i = 0; i < slides.length; i++) {
        const page = pdf.addPage([960, 540]); // 16:9 aspect ratio
        const { width, height } = page.getSize();
        
        // Light background
        page.drawRectangle({ x: 0, y: 0, width, height, color: rgb(0.98, 0.98, 1) });
        
        // Slide number
        page.drawText(`Slide ${i + 1}`, { x: width - 80, y: 15, size: 9, font, color: rgb(0.6, 0.6, 0.6) });
        
        // Slide content
        let yPos = height - 60;
        const texts = slides[i];
        
        for (let j = 0; j < texts.length; j++) {
          const text = texts[j];
          const isTitle = j === 0 || (text.length < 50 && j < 2);
          const size = isTitle ? 22 : 13;
          const usedFont = isTitle ? boldFont : font;
          
          // Word wrap
          const maxWidth = width - 120;
          const words = text.split(" ");
          let line = "";
          
          for (const word of words) {
            const test = line ? `${line} ${word}` : word;
            if (usedFont.widthOfTextAtSize(test, size) > maxWidth && line) {
              page.drawText(line, { x: 60, y: yPos, size, font: usedFont, color: rgb(0.15, 0.15, 0.15) });
              yPos -= size * 1.5;
              line = word;
            } else {
              line = test;
            }
          }
          if (line) {
            page.drawText(line, { x: 60, y: yPos, size, font: usedFont, color: rgb(0.15, 0.15, 0.15) });
            yPos -= size * (isTitle ? 2.2 : 1.6);
          }
          
          if (yPos < 40) break;
        }
      }
      
      const result = await pdf.save();
      const blob = new Blob([result as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.pptx?$/i, ".pdf");
      a.click();
      URL.revokeObjectURL(url);
      
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error converting PPT file. Make sure it's a valid .pptx file.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">PPT to PDF</h1>
            <p className="text-[var(--muted-foreground)]">Convert PowerPoint presentations to PDF</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pptx,.ppt" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to PDF" />
          <p className="text-xs text-[var(--muted-foreground)]">Extracts slide text content and creates a formatted PDF (one page per slide)</p>
        </div>
      )}
    </div>
  );
}
