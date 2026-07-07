"use client";

import { useState } from "react";
import { FileText, ArrowLeft, Loader2 } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function PDFToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState("");
  const [mode, setMode] = useState<"visual" | "text">("visual");

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress("Loading PDF...");
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;

      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // Standard .docx structure
      zip.file("[Content_Types].xml", generateContentTypes(numPages, mode));
      zip.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');
      zip.file("word/_rels/document.xml.rels", generateDocRels(numPages, mode));

      const pageElements: string[] = [];

      for (let i = 1; i <= numPages; i++) {
        setProgress(`Processing page ${i}/${numPages}...`);
        const page = await pdf.getPage(i);

        if (mode === "visual") {
          // Render page as high-quality image — preserves ALL formatting, images, tables
          const scale = 2; // 2x for good quality
          const viewport = page.getViewport({ scale });
          const canvas = document.createElement("canvas");
          canvas.width = viewport.width;
          canvas.height = viewport.height;
          const ctx = canvas.getContext("2d")!;
          await (page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise);

          // Convert to JPEG
          const blob = await new Promise<Blob>((resolve) => {
            canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.90);
          });
          const imgBuffer = await blob.arrayBuffer();
          zip.file(`word/media/page${i}.jpg`, imgBuffer);

          // Calculate dimensions in EMU (English Metric Units) for A4 fit
          const pageWidthEMU = 5943600; // ~6.25 inches (A4 with margins)
          const aspectRatio = viewport.height / viewport.width;
          const imgHeightEMU = Math.round(pageWidthEMU * aspectRatio);

          // Each page = image in docx
          pageElements.push(`
            <w:p>
              <w:pPr><w:spacing w:after="0"/></w:pPr>
              <w:r>
                <w:drawing>
                  <wp:inline distT="0" distB="0" distL="0" distR="0">
                    <wp:extent cx="${pageWidthEMU}" cy="${imgHeightEMU}"/>
                    <wp:docPr id="${i}" name="Page ${i}"/>
                    <a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
                      <a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
                        <pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">
                          <pic:nvPicPr>
                            <pic:cNvPr id="${i}" name="page${i}.jpg"/>
                            <pic:cNvPicPr/>
                          </pic:nvPicPr>
                          <pic:blipFill>
                            <a:blip r:embed="rId${i + 10}"/>
                            <a:stretch><a:fillRect/></a:stretch>
                          </pic:blipFill>
                          <pic:spPr>
                            <a:xfrm>
                              <a:off x="0" y="0"/>
                              <a:ext cx="${pageWidthEMU}" cy="${imgHeightEMU}"/>
                            </a:xfrm>
                            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
                          </pic:spPr>
                        </pic:pic>
                      </a:graphicData>
                    </a:graphic>
                  </wp:inline>
                </w:drawing>
              </w:r>
            </w:p>`);

          // Page break after each page (except last)
          if (i < numPages) {
            pageElements.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
          }

        } else {
          // Text mode: extract text with formatting
          const textContent = await page.getTextContent();
          let lastY: number | null = null;
          let currentLine = "";
          let currentSize = 12;

          for (const item of textContent.items) {
            if (!("str" in item)) continue;
            const textItem = item as { str: string; transform: number[] };
            const y = Math.round(textItem.transform[5]);
            const size = Math.round(Math.abs(textItem.transform[3]) || 12);

            if (lastY !== null && Math.abs(y - lastY) > 5) {
              if (currentLine.trim()) {
                const escaped = escapeXml(currentLine.trim());
                const wordSize = Math.round(currentSize * 2);
                const isBold = currentSize >= 14;
                const bold = isBold ? "<w:b/>" : "";
                pageElements.push(`<w:p><w:pPr><w:spacing w:after="80" w:line="276" w:lineRule="auto"/></w:pPr><w:r><w:rPr>${bold}<w:sz w:val="${wordSize}"/><w:szCs w:val="${wordSize}"/></w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`);
              }
              currentLine = textItem.str;
              currentSize = size;
            } else {
              currentLine += textItem.str;
              if (size > currentSize) currentSize = size;
            }
            lastY = y;
          }
          if (currentLine.trim()) {
            const escaped = escapeXml(currentLine.trim());
            const wordSize = Math.round(currentSize * 2);
            pageElements.push(`<w:p><w:r><w:rPr><w:sz w:val="${wordSize}"/><w:szCs w:val="${wordSize}"/></w:rPr><w:t xml:space="preserve">${escaped}</w:t></w:r></w:p>`);
          }
          if (i < numPages) {
            pageElements.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
          }
        }
      }

      // Main document XML
      zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">
  <w:body>
    ${pageElements.join("\n")}
    <w:sectPr>
      <w:pgSz w:w="11906" w:h="16838"/>
      <w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/>
    </w:sectPr>
  </w:body>
</w:document>`);

      setProgress("Creating Word document...");
      const blob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.wordprocessingml.document" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = files[0].name.replace(/\.pdf$/i, ".docx");
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
      setProgress("");
    } catch (error) {
      console.error(error);
      alert("Error converting PDF to Word. Please try a different file.");
      setProgress("");
    } finally { setIsProcessing(false); }
  };

  function escapeXml(s: string) { return s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;"); }

  function generateContentTypes(numPages: number, mode: string) {
    let imageTypes = "";
    if (mode === "visual") {
      imageTypes = '<Default Extension="jpg" ContentType="image/jpeg"/>';
    }
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/>${imageTypes}<Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>`;
  }

  function generateDocRels(numPages: number, mode: string) {
    let rels = "";
    if (mode === "visual") {
      for (let i = 1; i <= numPages; i++) {
        rels += `<Relationship Id="rId${i + 10}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/page${i}.jpg"/>`;
      }
    }
    return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
  }

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
            <p className="text-[var(--muted-foreground)]">Convert PDF to editable Word document with full formatting</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Conversion Mode</label>
            <div className="flex gap-2">
              <button onClick={() => setMode("visual")}
                className={`flex-1 p-3 rounded-xl text-sm font-medium border-2 transition-all text-left ${mode === "visual" ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                <p className="font-semibold">Visual (Recommended)</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Preserves exact layout — images, tables, fonts, columns. Each page rendered as image in Word.</p>
              </button>
              <button onClick={() => setMode("text")}
                className={`flex-1 p-3 rounded-xl text-sm font-medium border-2 transition-all text-left ${mode === "text" ? "border-[var(--primary)] bg-indigo-50 dark:bg-indigo-950/20" : "border-[var(--border)] hover:border-[var(--primary)]"}`}>
                <p className="font-semibold">Editable Text</p>
                <p className="text-xs text-[var(--muted-foreground)] mt-0.5">Extracts text with heading sizes. Images not preserved. Fully editable.</p>
              </button>
            </div>
          </div>

          <div className="flex flex-col items-center gap-2">
            <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to Word (.docx)" />
            {progress && <p className="text-xs text-[var(--primary)] font-medium">{progress}</p>}
          </div>
        </div>
      )}

      <div className="mt-8 p-4 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2 text-sm text-center">How it works</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[var(--muted-foreground)]">
          <p><strong>Visual mode:</strong> Renders each PDF page as a high-quality image inside the Word doc. Preserves ALL formatting — images, tables, headers, footers, colors, everything.</p>
          <p><strong>Text mode:</strong> Extracts raw text with font sizes. Headings detected automatically. Fully editable but images/tables are lost.</p>
        </div>
      </div>
    </div>
  );
}
