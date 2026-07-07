"use client";

import { useState } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function PDFToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      // Extract text from PDF using pdf.js
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      // Extract text with size info for formatting
      const paragraphs: { text: string; fontSize: number; isPageBreak: boolean }[] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        let lastY: number | null = null;
        let currentLine = "";
        let currentSize = 12;

        for (const item of textContent.items) {
          if (!("str" in item)) continue;
          const textItem = item as { str: string; transform: number[]; height?: number };
          const y = Math.round(textItem.transform[5]);
          const size = Math.round(Math.abs(textItem.transform[3]) || 12);

          if (lastY !== null && Math.abs(y - lastY) > 5) {
            if (currentLine.trim()) paragraphs.push({ text: currentLine.trim(), fontSize: currentSize, isPageBreak: false });
            currentLine = textItem.str;
            currentSize = size;
          } else {
            currentLine += textItem.str;
            if (size > currentSize) currentSize = size;
          }
          lastY = y;
        }
        if (currentLine.trim()) paragraphs.push({ text: currentLine.trim(), fontSize: currentSize, isPageBreak: false });
        // Page break after each page
        if (i < pdf.numPages) paragraphs.push({ text: "", fontSize: 12, isPageBreak: true });
      }

      // Generate .docx file (docx = ZIP with XML)
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Content Types
      zip.file("[Content_Types].xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>
</Types>`);

      // Relationships
      zip.file("_rels/.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/>
</Relationships>`);

      zip.file("word/_rels/document.xml.rels",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
</Relationships>`);

      // Document body with formatted paragraphs
      const escapeXml = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

      const bodyParagraphs = paragraphs.map((p) => {
        if (p.isPageBreak) {
          return '<w:p><w:r><w:br w:type="page"/></w:r></w:p>';
        }
        if (!p.text) return '<w:p></w:p>';

        // Determine style based on font size
        const isHeading1 = p.fontSize >= 20;
        const isHeading2 = p.fontSize >= 16 && p.fontSize < 20;
        const isHeading3 = p.fontSize >= 13 && p.fontSize < 16;
        const wordSize = Math.round(p.fontSize * 2); // Word uses half-points

        let pPr = '<w:pPr><w:spacing w:after="120" w:line="276" w:lineRule="auto"/></w:pPr>';
        if (isHeading1) pPr = '<w:pPr><w:spacing w:before="360" w:after="120"/></w:pPr>';
        else if (isHeading2) pPr = '<w:pPr><w:spacing w:before="240" w:after="80"/></w:pPr>';
        else if (isHeading3) pPr = '<w:pPr><w:spacing w:before="200" w:after="60"/></w:pPr>';

        const bold = (isHeading1 || isHeading2 || isHeading3) ? '<w:b/>' : '';
        const rPr = '<w:rPr>' + bold + '<w:sz w:val="' + wordSize + '"/><w:szCs w:val="' + wordSize + '"/></w:rPr>';

        return '<w:p>' + pPr + '<w:r>' + rPr + '<w:t xml:space="preserve">' + escapeXml(p.text) + '</w:t></w:r></w:p>';
      }).join("\n");

      zip.file("word/document.xml",
        `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main">
  <w:body>
    ${bodyParagraphs}
  </w:body>
</w:document>`);

      const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = files[0].name.replace(/\.pdf$/i, ".docx");
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error converting PDF to Word. Make sure it's a valid PDF.");
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
            <h1 className="text-2xl sm:text-3xl font-bold">PDF to Word</h1>
            <p className="text-[var(--muted-foreground)]">Convert PDF to editable .docx Word document</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to Word (.docx)" />
          <p className="text-xs text-[var(--muted-foreground)]">Extracts text with paragraph structure and generates a .docx file</p>
        </div>
      )}
    </div>
  );
}
