"use client";

import { useState } from "react";
import { Presentation, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function PDFToPPT() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      // Convert each PDF page to an image, then package as a PPTX
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const JSZip = (await import("jszip")).default;
      const zip = new JSZip();

      // PPTX structure
      zip.file("[Content_Types].xml", generateContentTypes(pdf.numPages));
      zip.file("_rels/.rels", generateRels());
      zip.file("ppt/_rels/presentation.xml.rels", generatePresentationRels(pdf.numPages));
      zip.file("ppt/presentation.xml", generatePresentation(pdf.numPages));

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await (page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise);

        // Get image as JPEG
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/jpeg", 0.85);
        });
        const imgBuffer = await blob.arrayBuffer();
        zip.file(`ppt/media/image${i}.jpeg`, imgBuffer);
        zip.file(`ppt/slides/slide${i}.xml`, generateSlide(i));
        zip.file(`ppt/slides/_rels/slide${i}.xml.rels`, generateSlideRels(i));
      }

      const pptxBlob = await zip.generateAsync({ type: "blob", mimeType: "application/vnd.openxmlformats-officedocument.presentationml.presentation" });
      const url = URL.createObjectURL(pptxBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = files[0].name.replace(/\.pdf$/i, ".pptx");
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error converting PDF to PowerPoint.");
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
            <Presentation className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">PDF to PowerPoint</h1>
            <p className="text-[var(--muted-foreground)]">Convert PDF pages to PowerPoint slides</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to PowerPoint (.pptx)" />
          <p className="text-xs text-[var(--muted-foreground)]">Each PDF page becomes a slide with the page rendered as an image</p>
        </div>
      )}
    </div>
  );
}

// PPTX XML generators
function generateContentTypes(numSlides: number) {
  const slideTypes = Array.from({ length: numSlides }, (_, i) =>
    `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Default Extension="jpeg" ContentType="image/jpeg"/>
  <Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>
  ${slideTypes}
</Types>`;
}

function generateRels() {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="ppt/presentation.xml"/>
</Relationships>`;
}

function generatePresentationRels(numSlides: number) {
  const rels = Array.from({ length: numSlides }, (_, i) =>
    `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  ${rels}
</Relationships>`;
}

function generatePresentation(numSlides: number) {
  const slideList = Array.from({ length: numSlides }, (_, i) =>
    `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`
  ).join("\n");
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:presentation xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <p:sldIdLst>${slideList}</p:sldIdLst>
  <p:sldSz cx="12192000" cy="6858000"/>
</p:presentation>`;
}

function generateSlide(index: number) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<p:sld xmlns:p="http://schemas.openxmlformats.org/presentationml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships" xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">
  <p:cSld>
    <p:spTree>
      <p:nvGrpSpPr><p:cNvPr id="1" name=""/><p:cNvGrpSpPr/><p:nvPr/></p:nvGrpSpPr>
      <p:grpSpPr/>
      <p:pic>
        <p:nvPicPr><p:cNvPr id="2" name="Image ${index}"/><p:cNvPicPr/><p:nvPr/></p:nvPicPr>
        <p:blipFill><a:blip r:embed="rId1"/><a:stretch><a:fillRect/></a:stretch></p:blipFill>
        <p:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="12192000" cy="6858000"/></a:xfrm><a:prstGeom prst="rect"><a:avLst/></a:prstGeom></p:spPr>
      </p:pic>
    </p:spTree>
  </p:cSld>
</p:sld>`;
}

function generateSlideRels(index: number) {
  return `<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="../media/image${index}.jpeg"/>
</Relationships>`;
}
