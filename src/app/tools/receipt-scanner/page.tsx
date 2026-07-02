"use client";

import { useState } from "react";
import { ReceiptText, ArrowLeft, Loader2, Copy, Check, Download } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";

interface ReceiptData {
  rawText: string;
  total: string | null;
  date: string | null;
  items: string[];
  amounts: string[];
  vendor: string | null;
  gst: string | null;
}

export default function ReceiptScanner() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [receipt, setReceipt] = useState<ReceiptData | null>(null);
  const [copied, setCopied] = useState(false);

  const extractReceiptData = (text: string): ReceiptData => {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);

    // Extract total (look for keywords like Total, Grand Total, Amount Due)
    const totalPatterns = [/(?:grand\s*)?total[\s:]*[₹$]?\s*([\d,]+\.?\d*)/i, /(?:amount\s*(?:due|payable))[\s:]*[₹$]?\s*([\d,]+\.?\d*)/i, /(?:net\s*amount)[\s:]*[₹$]?\s*([\d,]+\.?\d*)/i];
    let total: string | null = null;
    for (const pattern of totalPatterns) {
      const match = text.match(pattern);
      if (match) { total = `₹${match[1]}`; break; }
    }

    // Extract date
    const datePatterns = [/(\d{1,2}[\/\-.]\d{1,2}[\/\-.]\d{2,4})/, /(\d{1,2}\s*(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)\w*\s*\d{2,4})/i];
    let date: string | null = null;
    for (const pattern of datePatterns) {
      const match = text.match(pattern);
      if (match) { date = match[1]; break; }
    }

    // Extract amounts (numbers that look like prices)
    const amounts = (text.match(/[₹$]?\s*\d{1,3}(?:,\d{3})*(?:\.\d{2})?/g) || []).filter((a) => parseFloat(a.replace(/[₹$,\s]/g, "")) > 0);

    // Extract GST
    const gstMatch = text.match(/(?:GST|GSTIN|GST\s*No)[\s.:]*(\w+)/i);
    const gst = gstMatch ? gstMatch[1] : null;

    // Vendor (usually first non-empty line)
    const vendor = lines[0] || null;

    // Items (lines that have both text and a number)
    const items = lines.filter((line) => /[a-zA-Z]/.test(line) && /\d/.test(line) && line.length > 5 && !/total|subtotal|tax|gst|date|invoice/i.test(line)).slice(0, 20);

    return { rawText: text, total, date, items, amounts: amounts.slice(0, 15), vendor, gst };
  };

  const handleScan = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setReceipt(null);

    try {
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("eng");
      const result = await worker.recognize(files[0]);
      await worker.terminate();

      const data = extractReceiptData(result.data.text);
      setReceipt(data);
    } catch (error) {
      console.error(error);
      alert("Error scanning receipt.");
    } finally { setIsProcessing(false); }
  };

  const copyJSON = () => {
    if (!receipt) return;
    const json = JSON.stringify({ vendor: receipt.vendor, date: receipt.date, total: receipt.total, gst: receipt.gst, items: receipt.items }, null, 2);
    navigator.clipboard.writeText(json);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const downloadCSV = () => {
    if (!receipt) return;
    let csv = "Field,Value\n";
    csv += `Vendor,"${receipt.vendor || ""}"\n`;
    csv += `Date,"${receipt.date || ""}"\n`;
    csv += `Total,"${receipt.total || ""}"\n`;
    csv += `GST,"${receipt.gst || ""}"\n`;
    csv += "\nItems\n";
    receipt.items.forEach((item) => { csv += `"${item}"\n`; });
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "receipt-data.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg">
            <ReceiptText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Receipt Scanner</h1>
            <p className="text-[var(--muted-foreground)]">Extract amounts, dates, items from receipts and invoices</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setReceipt(null); }} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setReceipt(null); }} />

      {files.length > 0 && !receipt && (
        <div className="mt-6 flex justify-center">
          <button onClick={handleScan} disabled={isProcessing}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold ${isProcessing ? "bg-[var(--primary)] text-white opacity-80 cursor-wait" : "bg-gradient-to-r from-emerald-500 to-teal-600 text-white hover:shadow-lg active:scale-95"} transition-all`}>
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />Scanning receipt...</>) : (<><ReceiptText className="w-5 h-5" />Scan Receipt</>)}
          </button>
        </div>
      )}

      {receipt && (
        <div className="mt-6 space-y-4">
          {/* Structured Data */}
          <div className="p-5 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-semibold">Extracted Information</h3>
              <div className="flex gap-2">
                <button onClick={copyJSON} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] hover:bg-[var(--accent)]">
                  {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} {copied ? "Copied!" : "Copy JSON"}
                </button>
                <button onClick={downloadCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--primary)] text-white hover:opacity-90">
                  <Download className="w-3 h-3" /> CSV
                </button>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
              <div className="p-3 rounded-xl bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">Vendor</p>
                <p className="font-semibold text-sm truncate">{receipt.vendor || "—"}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">Date</p>
                <p className="font-semibold text-sm">{receipt.date || "—"}</p>
              </div>
              <div className="p-3 rounded-xl bg-green-50 dark:bg-green-900/20">
                <p className="text-xs text-green-600">Total</p>
                <p className="font-bold text-lg text-green-700 dark:text-green-400">{receipt.total || "—"}</p>
              </div>
              <div className="p-3 rounded-xl bg-[var(--muted)]">
                <p className="text-xs text-[var(--muted-foreground)]">GST No.</p>
                <p className="font-semibold text-sm truncate">{receipt.gst || "—"}</p>
              </div>
            </div>

            {receipt.items.length > 0 && (
              <div>
                <p className="text-sm font-medium mb-2">Line Items ({receipt.items.length})</p>
                <div className="space-y-1 max-h-[200px] overflow-y-auto">
                  {receipt.items.map((item, i) => (
                    <div key={i} className="px-3 py-2 rounded-lg bg-[var(--muted)] text-xs font-mono">{item}</div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Raw text */}
          <details className="p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
            <summary className="cursor-pointer text-sm font-medium">View raw extracted text</summary>
            <pre className="mt-3 text-xs text-[var(--muted-foreground)] whitespace-pre-wrap bg-[var(--muted)] p-3 rounded-lg max-h-[300px] overflow-y-auto">
              {receipt.rawText}
            </pre>
          </details>
        </div>
      )}
    </div>
  );
}
