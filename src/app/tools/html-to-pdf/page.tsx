"use client";

import { useState } from "react";
import { Globe, ArrowLeft } from "lucide-react";
import Link from "next/link";
import ProcessingButton from "@/components/ProcessingButton";

export default function HTMLToPDF() {
  const [htmlContent, setHtmlContent] = useState(`<!DOCTYPE html>
<html>
<head>
  <style>
    body { font-family: Arial, sans-serif; padding: 40px; }
    h1 { color: #333; }
    p { line-height: 1.6; color: #555; }
  </style>
</head>
<body>
  <h1>Hello, World!</h1>
  <p>This is a sample HTML document that will be converted to PDF.</p>
  <p>Edit this content or paste your own HTML.</p>
</body>
</html>`);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConvert = async () => {
    setIsProcessing(true);
    try {
      // Use the browser's print functionality to generate PDF
      const printWindow = window.open("", "_blank");
      if (!printWindow) {
        alert("Please allow popups to generate the PDF.");
        setIsProcessing(false);
        return;
      }
      printWindow.document.write(htmlContent);
      printWindow.document.close();
      
      // Give it time to render
      setTimeout(() => {
        printWindow.print();
        printWindow.close();
        setIsComplete(true);
        setIsProcessing(false);
      }, 500);
    } catch (error) {
      console.error(error);
      alert("Error converting HTML to PDF.");
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Globe className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">HTML to PDF</h1>
            <p className="text-[var(--muted-foreground)]">Convert HTML code to a PDF document</p>
          </div>
        </div>
      </div>

      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">HTML Code</label>
          <textarea
            value={htmlContent}
            onChange={(e) => { setHtmlContent(e.target.value); setIsComplete(false); }}
            rows={16}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y"
            placeholder="Paste your HTML here..."
          />
        </div>

        {/* Preview */}
        <div>
          <label className="block text-sm font-medium mb-2">Preview</label>
          <div className="rounded-xl border border-[var(--border)] bg-white overflow-hidden max-h-[300px] overflow-y-auto">
            <iframe
              srcDoc={htmlContent}
              className="w-full h-[300px] border-0"
              sandbox="allow-same-origin"
              title="HTML Preview"
            />
          </div>
        </div>
      </div>

      <div className="mt-8 flex justify-center">
        <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to PDF" disabled={!htmlContent.trim()} />
      </div>
      <p className="text-xs text-center text-[var(--muted-foreground)] mt-3">
        Uses your browser&apos;s print dialog. Select &quot;Save as PDF&quot; as the destination.
      </p>
    </div>
  );
}
