
"use client";

import { useState } from "react";
import { ScanText, ArrowLeft, Copy, Check, Loader2, Download, FileText, Share2 } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ToolContent from "@/components/ToolContent";
import { toolContentData } from "@/lib/tool-content-data";

export default function OCRTool() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressMsg, setProgressMsg] = useState("");
  const [extractedText, setExtractedText] = useState("");
  const [confidence, setConfidence] = useState(0);
  const [language, setLanguage] = useState("eng");
  const [copied, setCopied] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [outputFormat, setOutputFormat] = useState<"formatted" | "plain" | "json">("formatted");

  const languages = [
    { code: "eng", name: "English" },
    { code: "hin", name: "Hindi" },
    { code: "tam", name: "Tamil" },
    { code: "tel", name: "Telugu" },
    { code: "kan", name: "Kannada" },
    { code: "mal", name: "Malayalam" },
    { code: "ben", name: "Bengali" },
    { code: "mar", name: "Marathi" },
    { code: "guj", name: "Gujarati" },
    { code: "pan", name: "Punjabi" },
    { code: "urd", name: "Urdu" },
    { code: "eng+hin", name: "English + Hindi" },
  ];

  const handleFilesSelected = (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setExtractedText("");
    setProgress(0);
    setConfidence(0);
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const handleOCR = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setProgress(0);
    setExtractedText("");
    setProgressMsg("Loading OCR engine...");

    try {
      const Tesseract = await import("tesseract.js");

      const worker = await Tesseract.createWorker(language, undefined, {
        logger: (m: { status: string; progress: number }) => {
          setProgressMsg(m.status === "recognizing text" ? "Recognizing text..." : m.status);
          if (m.status === "recognizing text") {
            setProgress(Math.round(m.progress * 100));
          }
        },
      });

      const result = await worker.recognize(files[0]);

      // Process output with proper formatting based on block/paragraph structure
      const blocks = result.data.blocks || [];
      let formattedText = "";

      if (blocks.length > 0 && outputFormat === "formatted") {
        for (const block of blocks) {
          for (const para of block.paragraphs) {
            const lines = para.lines.map((line: { words: { text: string }[] }) =>
              line.words.map((w: { text: string }) => w.text).join(" ")
            );
            formattedText += lines.join("\n") + "\n\n";
          }
        }
      } else {
        formattedText = result.data.text;
      }

      setExtractedText(formattedText.trim());
      setConfidence(Math.round(result.data.confidence));
      await worker.terminate();
    } catch (error) {
      console.error("OCR Error:", error);
      alert("Error during OCR. Please try again with a clearer image.");
    } finally {
      setIsProcessing(false);
      setProgressMsg("");
    }
  };

  const getOutputText = () => {
    if (outputFormat === "json") {
      return JSON.stringify({ text: extractedText, confidence, language }, null, 2);
    }
    if (outputFormat === "plain") {
      return extractedText.replace(/\n\n+/g, "\n");
    }
    return extractedText;
  };

  const copyText = () => {
    navigator.clipboard.writeText(getOutputText());
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadText = (format: "txt" | "md") => {
    const content = getOutputText();
    const blob = new Blob([content], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ocr-output.${format}`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const shareText = async () => {
    const content = getOutputText();
    // Try Web Share API (works on mobile - share to WhatsApp, email, etc.)
    if (navigator.share) {
      try {
        await navigator.share({
          title: "OCR Extracted Text - FixMyFile",
          text: content,
        });
        return;
      } catch (e) {
        // User cancelled or API failed, fall back
        if ((e as Error).name === "AbortError") return;
      }
    }
    // Fallback: share as file
    if (navigator.share && navigator.canShare) {
      const file = new File([content], "ocr-output.txt", { type: "text/plain" });
      if (navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({ files: [file], title: "OCR Extracted Text" });
          return;
        } catch { /* fall through */ }
      }
    }
    // Final fallback: copy to clipboard
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    alert("Text copied to clipboard! You can paste it anywhere.");
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-700 flex items-center justify-center shadow-lg">
            <ScanText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Image to Text (OCR)</h1>
            <p className="text-[var(--muted-foreground)]">Extract formatted text from images — supports 10+ Indian languages</p>
          </div>
        </div>
      </div>

      <FileDropZone
        onFilesSelected={handleFilesSelected}
        accept="image/*"
        multiple={false}
        maxFiles={1}
        files={files}
        onRemoveFile={() => { setFiles([]); setExtractedText(""); if (previewUrl) URL.revokeObjectURL(previewUrl); setPreviewUrl(null); }}
      />

      {files.length > 0 && (
        <div className="mt-6 space-y-4">
          {/* Settings */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Recognition Language</label>
              <div className="flex flex-wrap gap-2">
                {languages.map((lang) => (
                  <button key={lang.code} onClick={() => setLanguage(lang.code)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${language === lang.code ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium mb-2">Output Format</label>
              <div className="flex gap-2">
                {([["formatted", "Formatted (paragraphs)"], ["plain", "Plain text"], ["json", "JSON"]] as const).map(([id, label]) => (
                  <button key={id} onClick={() => setOutputFormat(id)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${outputFormat === id ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"}`}>
                    {label}
                  </button>
                ))}
              </div>
            </div>

            {/* Preview */}
            {previewUrl && (
              <div className="rounded-xl overflow-hidden border border-[var(--border)] bg-[var(--muted)] flex justify-center">
                <img src={previewUrl} alt="Preview" className="max-w-full max-h-[250px] object-contain" />
              </div>
            )}

            {/* Process Button */}
            <button onClick={handleOCR} disabled={isProcessing}
              className={`w-full flex items-center justify-center gap-2 px-6 py-4 rounded-xl font-semibold transition-all ${isProcessing ? "bg-[var(--primary)] text-white opacity-80 cursor-wait" : "bg-gradient-to-r from-violet-600 to-indigo-700 text-white hover:shadow-lg hover:scale-[1.01] active:scale-95"}`}>
              {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />{progressMsg} {progress > 0 ? `${progress}%` : ""}</>) : (<><ScanText className="w-5 h-5" />Extract Text</>)}
            </button>

            {isProcessing && (
              <div className="w-full h-2 rounded-full bg-[var(--muted)] overflow-hidden">
                <div className="h-full bg-gradient-to-r from-violet-600 to-indigo-700 transition-all duration-300" style={{ width: `${progress}%` }} />
              </div>
            )}
          </div>

          {/* Results */}
          {extractedText && (
            <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-semibold">Extracted Text</h3>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${confidence > 80 ? "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400" : confidence > 60 ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400" : "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400"}`}>
                    {confidence}% confidence
                  </span>
                </div>
                <div className="flex gap-2">
                  <button onClick={copyText} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] hover:bg-[var(--accent)]">
                    {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />}
                    {copied ? "Copied!" : "Copy"}
                  </button>
                  <button onClick={() => downloadText("txt")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] hover:bg-[var(--accent)]">
                    <Download className="w-3 h-3" /> .txt
                  </button>
                  <button onClick={() => downloadText("md")} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] hover:bg-[var(--accent)]">
                    <FileText className="w-3 h-3" /> .md
                  </button>
                  <button onClick={shareText} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--primary)] text-white hover:opacity-90">
                    <Share2 className="w-3 h-3" /> Share
                  </button>
                </div>
              </div>
              <textarea value={getOutputText()} readOnly rows={16}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm resize-y font-mono whitespace-pre-wrap" />
              <div className="flex gap-4 mt-2 text-xs text-[var(--muted-foreground)]">
                <span>{extractedText.split(/\s+/).filter(Boolean).length} words</span>
                <span>{extractedText.length} characters</span>
                <span>{extractedText.split("\n").filter(Boolean).length} lines</span>
              </div>
            </div>
          )}
        </div>
      )}

      <div className="mt-8 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2">Tips for best results</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li>Use clear, high-resolution images (300 DPI or higher)</li>
          <li>Ensure text is horizontal and well-lit</li>
          <li>Select the correct language for better accuracy</li>
          <li>For mixed-language documents, use &quot;English + Hindi&quot; mode</li>
          <li>First run downloads the language model (~2-4 MB), subsequent runs are faster</li>
        </ul>
      </div>

      <ToolContent {...toolContentData.ocr} />
    </div>
  );
}
