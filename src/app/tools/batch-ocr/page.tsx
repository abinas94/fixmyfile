"use client";

import { useState } from "react";
import { FolderSearch, ArrowLeft, Loader2, Download } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";

interface OCRResult { fileName: string; text: string; confidence: number; }

export default function BatchOCR() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentFile, setCurrentFile] = useState(0);
  const [results, setResults] = useState<OCRResult[]>([]);
  const [language, setLanguage] = useState("eng");

  const handleBatchOCR = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setResults([]);

    try {
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker(language);
      const batchResults: OCRResult[] = [];

      for (let i = 0; i < files.length; i++) {
        setCurrentFile(i + 1);
        const result = await worker.recognize(files[i]);

        // Format text with paragraphs
        let text = "";
        const blocks = result.data.blocks || [];
        if (blocks.length > 0) {
          for (const block of blocks) {
            for (const para of block.paragraphs) {
              const lines = para.lines.map((line: { words: { text: string }[] }) =>
                line.words.map((w: { text: string }) => w.text).join(" ")
              );
              text += lines.join("\n") + "\n\n";
            }
          }
        } else {
          text = result.data.text;
        }

        batchResults.push({
          fileName: files[i].name,
          text: text.trim(),
          confidence: Math.round(result.data.confidence),
        });
      }

      await worker.terminate();
      setResults(batchResults);
    } catch (error) {
      console.error("Batch OCR Error:", error);
      alert("Error during batch OCR processing.");
    } finally {
      setIsProcessing(false);
    }
  };

  const downloadAll = async () => {
    const JSZip = (await import("jszip")).default;
    const zip = new JSZip();
    for (const r of results) {
      zip.file(`${r.fileName.replace(/\.\w+$/, "")}.txt`, r.text);
    }
    // Also add a combined file
    const combined = results.map((r) => `=== ${r.fileName} (${r.confidence}% confidence) ===\n\n${r.text}`).join("\n\n---\n\n");
    zip.file("_combined_output.txt", combined);

    const blob = await zip.generateAsync({ type: "blob" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "batch-ocr-results.zip";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <FolderSearch className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Batch OCR</h1>
            <p className="text-[var(--muted-foreground)]">Process multiple images at once and download all text files</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles((prev) => [...prev, ...f]); setResults([]); }} accept="image/*" multiple={true} maxFiles={20} files={files}
        onRemoveFile={(i) => setFiles((prev) => prev.filter((_, idx) => idx !== i))}
        onReorderFiles={setFiles} />

      {files.length > 0 && (
        <div className="mt-6 p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">Language</label>
            <div className="flex flex-wrap gap-2">
              {[{ code: "eng", name: "English" }, { code: "hin", name: "Hindi" }, { code: "eng+hin", name: "Eng + Hindi" }, { code: "tam", name: "Tamil" }, { code: "tel", name: "Telugu" }].map((l) => (
                <button key={l.code} onClick={() => setLanguage(l.code)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium ${language === l.code ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"}`}>
                  {l.name}
                </button>
              ))}
            </div>
          </div>

          <button onClick={handleBatchOCR} disabled={isProcessing}
            className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold ${isProcessing ? "bg-[var(--primary)] text-white opacity-80 cursor-wait" : "bg-gradient-to-r from-purple-500 to-indigo-600 text-white hover:shadow-lg active:scale-95"} transition-all`}>
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />Processing {currentFile}/{files.length}...</>) : (<><FolderSearch className="w-5 h-5" />Process All {files.length} Images</>)}
          </button>

          {isProcessing && (
            <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden">
              <div className="h-full bg-gradient-to-r from-purple-500 to-indigo-600 transition-all" style={{ width: `${(currentFile / files.length) * 100}%` }} />
            </div>
          )}
        </div>
      )}

      {results.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">Results ({results.length} files processed)</h3>
            <button onClick={downloadAll} className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">
              <Download className="w-4 h-4" /> Download All (.zip)
            </button>
          </div>

          {results.map((r, i) => (
            <div key={i} className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm font-medium">{r.fileName}</span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${r.confidence > 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400"}`}>
                  {r.confidence}%
                </span>
              </div>
              <pre className="text-xs text-[var(--muted-foreground)] bg-[var(--muted)] p-3 rounded-lg overflow-x-auto max-h-[120px] overflow-y-auto whitespace-pre-wrap">
                {r.text.slice(0, 500)}{r.text.length > 500 ? "..." : ""}
              </pre>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
