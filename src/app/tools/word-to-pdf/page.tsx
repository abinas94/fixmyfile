"use client";

import { useState } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function WordToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const file = files[0];
      // Read .docx content - docx files are ZIP archives with XML
      const arrayBuffer = await file.arrayBuffer();
      const JSZip = (await import("jszip")).default;
      const zip = await JSZip.loadAsync(arrayBuffer);
      
      // Extract text from document.xml
      const docXml = await zip.file("word/document.xml")?.async("string");
      if (!docXml) throw new Error("Invalid .docx file");
      
      // Parse text content from XML
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(docXml, "text/xml");
      const paragraphs: string[] = [];
      
      const pElements = xmlDoc.getElementsByTagName("w:p");
      for (let i = 0; i < pElements.length; i++) {
        const textNodes = pElements[i].getElementsByTagName("w:t");
        let paraText = "";
        for (let j = 0; j < textNodes.length; j++) {
          paraText += textNodes[j].textContent || "";
        }
        paragraphs.push(paraText);
      }
      
      // Generate PDF from extracted text
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);
      
      const fontSize = 11;
      const lineHeight = fontSize * 1.5;
      const margin = 50;
      const pageWidth = 595; // A4
      const pageHeight = 842;
      const maxWidth = pageWidth - margin * 2;
      
      let page = pdf.addPage([pageWidth, pageHeight]);
      let yPos = pageHeight - margin;
      
      for (const para of paragraphs) {
        if (!para.trim()) {
          yPos -= lineHeight * 0.5;
          continue;
        }
        
        // Word wrap
        const words = para.split(" ");
        let currentLine = "";
        
        for (const word of words) {
          const testLine = currentLine ? `${currentLine} ${word}` : word;
          const testWidth = font.widthOfTextAtSize(testLine, fontSize);
          
          if (testWidth > maxWidth && currentLine) {
            if (yPos < margin + lineHeight) {
              page = pdf.addPage([pageWidth, pageHeight]);
              yPos = pageHeight - margin;
            }
            page.drawText(currentLine, { x: margin, y: yPos, size: fontSize, font, color: rgb(0.1, 0.1, 0.1) });
            yPos -= lineHeight;
            currentLine = word;
          } else {
            currentLine = testLine;
          }
        }
        
        if (currentLine) {
          if (yPos < margin + lineHeight) {
            page = pdf.addPage([pageWidth, pageHeight]);
            yPos = pageHeight - margin;
          }
          // Use bold for short paragraphs (likely headings)
          const isHeading = para.length < 60 && paragraphs.indexOf(para) < 5;
          page.drawText(currentLine, { 
            x: margin, y: yPos, 
            size: isHeading ? fontSize + 3 : fontSize, 
            font: isHeading ? boldFont : font, 
            color: rgb(0.1, 0.1, 0.1) 
          });
          yPos -= lineHeight;
        }
        
        yPos -= lineHeight * 0.3; // Paragraph spacing
      }
      
      const result = await pdf.save();
      const blob = new Blob([result as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.docx?$/i, ".pdf");
      a.click();
      URL.revokeObjectURL(url);
      
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error converting Word file. Make sure it's a valid .docx file.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Word to PDF</h1>
            <p className="text-[var(--muted-foreground)]">Convert .docx Word documents to PDF</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".docx,.doc" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to PDF" />
          <p className="text-xs text-[var(--muted-foreground)]">Extracts text and formatting from .docx and generates a clean PDF</p>
        </div>
      )}
    </div>
  );
}
