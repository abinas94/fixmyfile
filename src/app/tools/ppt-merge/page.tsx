"use client";

import { useState } from "react";
import { Layers, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function PPTMerge() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleMerge = async () => {
    if (files.length < 2) return;
    setIsProcessing(true);
    try {
      const JSZip = (await import("jszip")).default;

      // Load first PPTX as base
      const baseBuffer = await files[0].arrayBuffer();
      const baseZip = await JSZip.loadAsync(baseBuffer);

      // Count existing slides in base
      const baseSlides = Object.keys(baseZip.files).filter((n) => n.match(/^ppt\/slides\/slide\d+\.xml$/));
      let slideCount = baseSlides.length;

      // For each additional file, copy slides and media
      for (let f = 1; f < files.length; f++) {
        const addBuffer = await files[f].arrayBuffer();
        const addZip = await JSZip.loadAsync(addBuffer);

        const addSlides = Object.keys(addZip.files).filter((n) => n.match(/^ppt\/slides\/slide\d+\.xml$/)).sort();

        for (let i = 0; i < addSlides.length; i++) {
          slideCount++;
          const slideContent = await addZip.file(addSlides[i])!.async("arraybuffer");
          baseZip.file(`ppt/slides/slide${slideCount}.xml`, slideContent);

          // Copy slide rels if exists
          const relPath = addSlides[i].replace("ppt/slides/", "ppt/slides/_rels/") + ".rels";
          if (addZip.files[relPath]) {
            const relContent = await addZip.file(relPath)!.async("string");
            baseZip.file(`ppt/slides/_rels/slide${slideCount}.xml.rels`, relContent);
          }
        }

        // Copy media files (with renaming to avoid conflicts)
        const mediaFiles = Object.keys(addZip.files).filter((n) => n.startsWith("ppt/media/"));
        for (const media of mediaFiles) {
          const mediaContent = await addZip.file(media)!.async("arraybuffer");
          const newName = media.replace("ppt/media/", `ppt/media/merged${f}_`);
          baseZip.file(newName, mediaContent);
        }
      }

      // Update presentation.xml to include all slides
      const presXml = await baseZip.file("ppt/presentation.xml")?.async("string");
      if (presXml) {
        // Simple: regenerate slide list
        const slideIds = Array.from({ length: slideCount }, (_, i) =>
          `<p:sldId id="${256 + i}" r:id="rId${i + 1}"/>`
        ).join("");
        const updated = presXml.replace(/<p:sldIdLst>[\s\S]*?<\/p:sldIdLst>/, `<p:sldIdLst>${slideIds}</p:sldIdLst>`);
        baseZip.file("ppt/presentation.xml", updated);
      }

      // Update presentation rels
      const slideRels = Array.from({ length: slideCount }, (_, i) =>
        `<Relationship Id="rId${i + 1}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/slide" Target="slides/slide${i + 1}.xml"/>`
      ).join("\n");
      baseZip.file("ppt/_rels/presentation.xml.rels",
        `<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">${slideRels}</Relationships>`);

      // Update content types
      const slideOverrides = Array.from({ length: slideCount }, (_, i) =>
        `<Override PartName="/ppt/slides/slide${i + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.slide+xml"/>`
      ).join("\n");
      baseZip.file("[Content_Types].xml",
        `<?xml version="1.0" encoding="UTF-8"?><Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types"><Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/><Default Extension="xml" ContentType="application/xml"/><Default Extension="jpeg" ContentType="image/jpeg"/><Default Extension="png" ContentType="image/png"/><Override PartName="/ppt/presentation.xml" ContentType="application/vnd.openxmlformats-officedocument.presentationml.presentation.main+xml"/>${slideOverrides}</Types>`);

      const blob = await baseZip.generateAsync({ type: "blob" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "merged-presentation.pptx";
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error merging presentations. Make sure all files are valid .pptx files.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-400 to-orange-500 flex items-center justify-center shadow-lg">
            <Layers className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Merge Presentations</h1>
            <p className="text-[var(--muted-foreground)]">Combine multiple PowerPoint files into one</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles((prev) => [...prev, ...f]); setIsComplete(false); }} accept=".pptx" multiple={true} maxFiles={20} files={files} onRemoveFile={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))} onReorderFiles={setFiles} />

      {files.length >= 2 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton onClick={handleMerge} isProcessing={isProcessing} isComplete={isComplete} label="Merge & Download" disabled={files.length < 2} />
          <p className="text-xs text-[var(--muted-foreground)]">Slides from all files will be combined in order</p>
        </div>
      )}
    </div>
  );
}
