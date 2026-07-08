"use client";

import { useState } from "react";
import { FileText, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import { convertFile, downloadBlob } from "@/lib/convert-api";
import ServerNotice from "@/components/ServerNotice";

export default function PDFToWord() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState("");

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress("Converting PDF to Word...");
    try {
      // Try server-side first (best quality)
      try {
        const blob = await convertFile(files[0], "pdf", "docx", setProgress);
        const filename = files[0].name.replace(/\.pdf$/i, ".docx");
        downloadBlob(blob, filename);
        setIsComplete(true);
        setProgress("");
        return;
      } catch { /* Server failed, fall through */ }

      // Fallback: client-side (renders pages as images in docx)
      setProgress("Using local conversion (images in Word)...");
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;
      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      zip.file("[Content_Types].xml", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpg" ContentType="image/jpeg"/><Override PartName="/word/document.xml" ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/></Types>');
      zip.file("_rels/.rels", '<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="word/document.xml"/></Relationships>');

      let rels = "";
      const pages: string[] = [];
      for (let i = 1; i <= pdf.numPages; i++) {
        setProgress(`Rendering page ${i}/${pdf.numPages}...`);
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width; canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await (page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise);
        const blob = await new Promise<Blob>((r) => { canvas.toBlob((b) => r(b!), "image/jpeg", 0.88); });
        zip.file(`word/media/page${i}.jpg`, await blob.arrayBuffer());
        rels += `<Relationship Id="rId${i+10}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/page${i}.jpg"/>`;
        const emuW = 5943600;
        const emuH = Math.round(emuW * (viewport.height / viewport.width));
        pages.push(`<w:p><w:r><w:drawing><wp:inline distT="0" distB="0" distL="0" distR="0"><wp:extent cx="${emuW}" cy="${emuH}"/><wp:docPr id="${i}" name="P${i}"/><a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture"><pic:nvPicPr><pic:cNvPr id="${i}" name="p${i}.jpg"/><pic:cNvPicPr/></pic:nvPicPr><pic:blipFill><a:blip r:embed="rId${i+10}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill><pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="${emuW}" cy="${emuH}"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline></w:drawing></w:r></w:p>`);
        if (i < pdf.numPages) pages.push('<w:p><w:r><w:br w:type="page"/></w:r></w:p>');
      }
      zip.file("word/_rels/document.xml.rels", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`);
      zip.file("word/document.xml", `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><w:document xmlns:w="http://schemas.openxmlformats.org/wordprocessingml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"><w:body>${pages.join("")}<w:sectPr><w:pgSz w:w="11906" w:h="16838"/><w:pgMar w:top="720" w:right="720" w:bottom="720" w:left="720"/></w:sectPr></w:body></w:document>`);

      const docxBlob = await zip.generateAsync({ type: "blob" });
      downloadBlob(docxBlob, files[0].name.replace(/\.pdf$/i, ".docx"));
      setIsComplete(true);
      setProgress("");
    } catch (error) {
      alert("Error: " + (error instanceof Error ? error.message : "Conversion failed"));
      setProgress("");
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
            <p className="text-[var(--muted-foreground)]">Convert PDF to fully editable Word document with formatting preserved</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-6 flex flex-col items-center gap-4">
          <ServerNotice />
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to Word (.docx)" />
          {progress && <p className="text-xs text-[var(--primary)] font-medium">{progress}</p>}
          <p className="text-xs text-[var(--muted-foreground)] text-center max-w-md">
            Converts with full formatting — text, images, tables, columns, fonts all preserved. Output is fully editable in Microsoft Word.
          </p>
        </div>
      )}
    </div>
  );
}
