"use client";

import { useState } from "react";
import { FileSearch, ArrowLeft, Copy, Check, Loader2, Download } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";

export default function PDFOCRTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [extractedText, setExtractedText] = useState("");
  const [language, setLanguage] = useState("eng");
  const [copied, setCopied] = useState(false);

  const languages = [
    { code: "eng", name: "English" },
    { code: "hin", name: "Hindi" },
    { code: "eng+hin", name: "English + Hindi" },
    { code: "tam", name: "Tamil" },
    { code: "tel", name: "Telugu" },
    { code: "ben", name: "Bengali" },
    { code: "mar", name: "Marathi" },
  ];

  const handleOCR = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress(0);
    setExtractedText("");

    try {
      // Render PDF pages to images first
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
      const numPages = pdf.numPages;
      setTotalPages(numPages);

      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker(language);

      let fullText = "";

      for (let i = 1; i <= numPages; i++) {
        setCurrentPage(i);
        setProgress(Math.round(((i - 1) / numPages) * 100));

        // Render page to canvas
        const page = await pdf.getPage(i);
        const viewport = page.getViewport({ scale: 2 });
        const canvas = document.createElement("canvas");
        canvas.width = viewport.width;
        canvas.height = viewport.height;
        const ctx = canvas.getContext("2d")!;
        await (page.render({ canvasContext: ctx, viewport, canvas } as unknown as Parameters<typeof page.render>[0]).promise);

        // OCR the rendered image
        const blob = await new Promise<Blob>((resolve) => {
          canvas.toBlob((b) => resolve(b!), "image/png");
        });

        const result = await worker.recognize(blob);

        fullText += `--- Page ${i} ---\n\n`;

        // Format with paragraph detection
        const blocks = result.data.blocks || [];
        if (blocks.length > 0) {
          for (const block of blocks) {
            for (const para of block.paragraphs) {
              const lines = para.lines.map((line: { words: { text: string }[] }) =>
                line.words.map((w: { text: string }) => w.text).join(" ")
              );
              fullText += lines.join("\n") + "\n\n";
            }
          }
        } else {
          fullText += result.data.text + "\n\n";
        }
      }

      await worker.terminate();
      setExtractedText(fullText.trim());
      setProgress(100);
    } catch (error) {
      console.error("PDF OCR Error:", error);
      alert("Error during PDF OCR. Make sure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  const copyText = () => { navigator.clipboard.writeText(extractedText); setCopied(true); setTimeout(() => setCopied(false), 2000); };
  const downloadText = () => {
    const blob = new Blob([extractedText], { type: "text/plain" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = `${files[0]?.name || "pdf"}-ocr.txt`; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <FileSearch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">PDF OCR</h1>
            <p className="text-[var(--muted-foreground)]">Extract text from scanned PDF documents page by page</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setExtractedText(""); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setExtractedText(""); }} />

      {files.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <div className="flex flex-wrap gap-2">
              {languages.map((lang) => (
                <button key={lang.code} onClick={() => setLanguage(lang.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${language === lang.code ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
                  {lang.name}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleOCR} disabled={isProcessing}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold ${isProcessing ? "bg-[var(--primary)] text-white opacity-80 cursor-wait" : "bg-gradient-to-r from-indigo-500 to-violet-600 text-white hover:shadow-lg hover:scale-[1.01] active:scale-95"} transition-all`}>
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />Processing page {currentPage}/{totalPages}... {progress}%</>) : (<><FileSearch className="w-5 h-5" />Extract Text from PDF</>)}
          </button>

          {isProcessing && (
            <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-violet-600 transition-all duration-300" style={{ width: `${progress}%` }} />
            </div>
          )}
        </div>
      )}

      {extractedText && (
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <div className="flex justify-between items-center mb-3">
            <h3 className="font-semibold">Extracted Text ({totalPages} pages)</h3>
            <div className="flex gap-2">
              <button onClick={copyText} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] hover:bg-[var(--accent)]">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} {copied ? "Copied!" : "Copy All"}
              </button>
              <button onClick={downloadText} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--primary)] text-white hover:opacity-90">
                <Download className="w-3 h-3" /> Download .txt
              </button>
            </div>
          </div>
          <textarea value={extractedText} readOnly rows={20}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm resize-y font-mono whitespace-pre-wrap" />
        </div>
      )}
    </div>
  );
}
