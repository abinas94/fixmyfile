"use client";

import { useState } from "react";
import { FileText, ArrowLeft, Info } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import ServerNotice from "@/components/ServerNotice";
import { convertFile, downloadBlob } from "@/lib/convert-api";

export default function PDFToPPT() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [progress, setProgress] = useState("");
  const [usedFallback, setUsedFallback] = useState(false);

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress("Converting PDF to editable PowerPoint...");
    setUsedFallback(false);

    try {
      // Try server-side conversion first (produces editable text/shapes)
      const blob = await convertFile(files[0], "pdf", "pptx", setProgress);
      const filename = files[0].name.replace(/\.pdf$/i, ".pptx");
      downloadBlob(blob, filename);
      setIsComplete(true);
      setProgress("");
    } catch (error) {
      console.warn("Server conversion failed, falling back to client-side:", error);
      // Fallback: client-side image-based conversion
      try {
        setProgress("Server busy — using local conversion (image-based slides)...");
        await clientSideConvert();
        setUsedFallback(true);
        setIsComplete(true);
        setProgress("");
      } catch (fallbackError) {
        console.error(fallbackError);
        alert("Conversion failed. Please try again later.");
        setProgress("");
      }
    } finally {
      setIsProcessing(false);
    }
  };

  const clientSideConvert = async () => {
    setProgress("Loading PDF...");
    const pdfjsLib = await import("pdfjs-dist");
    pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

    const arrayBuffer = await files[0].arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;

    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();

    // PPTX structure
    zip.file("[Content_Types].xml", buildContentTypes(numPages));
    zip.file("_rels/.rels", buildRootRels());
    zip.file("ppt/presentation.xml", buildPresentation(numPages));
    zip.file("ppt/_rels/presentation.xml.rels", buildPresentationRels(numPages));

    for (let i = 1; i <= numPages; i++) {
      setProgress(`Rendering slide ${i}/${numPages}...`);
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale: 3 });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      const ctx = canvas.getContext("2d")!;
      await (page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise);

      const blob = await new Promise<Blob>((r) => canvas.toBlob((b) => r(b!), "image/jpeg", 0.92));
      zip.file(`ppt/media/image${i}.jpeg`, await blob.arrayBuffer());
      zip.file(`ppt/slides/slide${i}.xml`, buildSlide(i));
      zip.file(`ppt/slides/_rels/slide${i}.xml.rels`, buildSlideRels(i));
    }

    setProgress("Creating PowerPoint...");
    const pptxBlob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });

    const url = URL.createObjectURL(pptxBlob);
    const a = document.createElement("a");
    a.href = url;
    a.download = files[0].name.replace(/\.pdf$/i, ".pptx");
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-600 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">PDF to PowerPoint</h1>
            <p className="text-[var(--muted-foreground)]">Convert PDF to editable PowerPoint slides</p>
          </div>
        </div>
      </div>

      <ServerNotice />

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); setUsedFallback(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setUsedFallback(false); }} />

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to PowerPoint (.pptx)" />
          {progress && <p className="text-xs text-[var(--primary)] font-medium">{progress}</p>}
          
          {usedFallback && (
            <div className="flex items-start gap-2 p-3 rounded-lg bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 max-w-md">
              <Info className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" />
              <p className="text-xs text-amber-700 dark:text-amber-300">
                Server was busy — used local conversion. Slides are high-quality images (not editable text). Try again later for editable output.
              </p>
            </div>
          )}

          <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 max-w-md">
            <p className="text-xs text-blue-700 dark:text-blue-300 text-center">
              <strong>How it works:</strong> Uses CloudConvert&apos;s Apryse engine to produce editable slides with real text, shapes, and formatting. If the server is unavailable, falls back to high-quality image-based slides.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

// PPTX XML builders (fallback)
function buildContentTypes(n: number) {
  const slides = Array.from({ length: n }, (_, i) => `<Override PartName="/ppt/slides/slide${i+1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>${slides}</Types>`;
}

function buildRootRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/></Relationships>`;
}

function buildPresentation(n: number) {
  const slideList = Array.from({ length: n }, (_, i) => `<p:sldId id="${256+i}" r:id="rId${i+1}"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"><p:sldIdLst>${slideList}</p:sldIdLst><p:sldSz cx="12192000" cy="6858000"/></p:presentation>`;
}

function buildPresentationRels(n: number) {
  const rels = Array.from({ length: n }, (_, i) => `<Relationship Id="rId${i+1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i+1}.xml"/>`).join("");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${rels}</Relationships>`;
}

function buildSlide(i: number) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"><p:cSld><p:spTree><p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr><p:grpSpPr/><p:pic><p:nvPicPr><p:cNvPr id="2" name="Slide ${i}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr><p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill><p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr></p:pic></p:spTree></p:cSld></p:sld>`;
}

function buildSlideRels(i: number) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"><Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${i}.jpeg"/></Relationships>`;
}
