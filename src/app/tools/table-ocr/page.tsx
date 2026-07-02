"use client";

import { useState } from "react";
import { Table, ArrowLeft, Loader2, Download, Copy, Check } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";

export default function TableOCR() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [tableData, setTableData] = useState<string[][]>([]);
  const [rawText, setRawText] = useState("");
  const [copied, setCopied] = useState(false);

  const handleExtract = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    setTableData([]);

    try {
      const Tesseract = await import("tesseract.js");
      const worker = await Tesseract.createWorker("eng");
      const result = await worker.recognize(files[0]);
      await worker.terminate();

      const text = result.data.text;
      setRawText(text);

      // Parse table structure from OCR output
      // Strategy: split lines, then detect columns by consistent spacing or tab/pipe characters
      const lines = text.split("\n").filter((l) => l.trim());
      const rows: string[][] = [];

      for (const line of lines) {
        let cells: string[];
        
        // Try splitting by | (pipe) first (common in tables)
        if (line.includes("|")) {
          cells = line.split("|").map((c) => c.trim()).filter(Boolean);
        }
        // Try splitting by tabs
        else if (line.includes("\t")) {
          cells = line.split("\t").map((c) => c.trim()).filter(Boolean);
        }
        // Try splitting by 2+ consecutive spaces (column alignment)
        else if (line.match(/\s{2,}/)) {
          cells = line.split(/\s{2,}/).map((c) => c.trim()).filter(Boolean);
        }
        // Single column
        else {
          cells = [line.trim()];
        }

        if (cells.length > 0) {
          rows.push(cells);
        }
      }

      // Normalize column count (pad shorter rows)
      const maxCols = Math.max(...rows.map((r) => r.length));
      const normalized = rows.map((r) => {
        while (r.length < maxCols) r.push("");
        return r;
      });

      setTableData(normalized);
    } catch (error) {
      console.error(error);
      alert("Error extracting table data.");
    } finally { setIsProcessing(false); }
  };

  const downloadCSV = () => {
    const csv = tableData.map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
    a.download = "extracted-table.csv"; a.click(); URL.revokeObjectURL(a.href);
  };

  const copyCSV = () => {
    const csv = tableData.map((row) => row.join("\t")).join("\n");
    navigator.clipboard.writeText(csv);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-sky-600 flex items-center justify-center shadow-lg">
            <Table className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Table Extractor</h1>
            <p className="text-[var(--muted-foreground)]">Extract tables from images and export as CSV</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setTableData([]); }} accept="image/*" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setTableData([]); }} />

      {files.length > 0 && tableData.length === 0 && (
        <div className="mt-6 flex justify-center">
          <button onClick={handleExtract} disabled={isProcessing}
            className={`flex items-center gap-2 px-8 py-4 rounded-xl font-semibold ${isProcessing ? "bg-[var(--primary)] text-white opacity-80 cursor-wait" : "bg-gradient-to-r from-blue-500 to-sky-600 text-white hover:shadow-lg active:scale-95"} transition-all`}>
            {isProcessing ? (<><Loader2 className="w-5 h-5 animate-spin" />Extracting table...</>) : (<><Table className="w-5 h-5" />Extract Table</>)}
          </button>
        </div>
      )}

      {tableData.length > 0 && (
        <div className="mt-6 space-y-4">
          <div className="flex justify-between items-center">
            <h3 className="font-semibold">{tableData.length} rows × {tableData[0]?.length || 0} columns</h3>
            <div className="flex gap-2">
              <button onClick={copyCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] hover:bg-[var(--accent)]">
                {copied ? <Check className="w-3 h-3 text-green-500" /> : <Copy className="w-3 h-3" />} {copied ? "Copied!" : "Copy (Tab-separated)"}
              </button>
              <button onClick={downloadCSV} className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--primary)] text-white hover:opacity-90">
                <Download className="w-3 h-3" /> Download CSV
              </button>
            </div>
          </div>

          {/* Table Preview */}
          <div className="overflow-x-auto rounded-xl border border-[var(--border)]">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-[var(--muted)]">
                  {tableData[0]?.map((cell, i) => (
                    <th key={i} className="px-3 py-2 text-left font-medium border-b border-[var(--border)]">{cell || `Col ${i + 1}`}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {tableData.slice(1).map((row, i) => (
                  <tr key={i} className="border-b border-[var(--border)] hover:bg-[var(--muted)]/50">
                    {row.map((cell, j) => (
                      <td key={j} className="px-3 py-2">{cell}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Raw text fallback */}
          <details className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
            <summary className="cursor-pointer text-sm font-medium">View raw OCR text</summary>
            <pre className="mt-3 text-xs whitespace-pre-wrap bg-[var(--muted)] p-3 rounded-lg max-h-[200px] overflow-y-auto">{rawText}</pre>
          </details>
        </div>
      )}

      <div className="mt-8 p-5 rounded-2xl bg-[var(--muted)] border border-[var(--border)]">
        <h3 className="font-semibold mb-2">Tips for best table extraction</h3>
        <ul className="text-sm text-[var(--muted-foreground)] space-y-1 list-disc list-inside">
          <li>Clear borders between cells improve detection accuracy</li>
          <li>Ensure the image is straight (not rotated/skewed)</li>
          <li>High contrast between text and background helps</li>
          <li>The output can be pasted directly into Excel or Google Sheets</li>
        </ul>
      </div>
    </div>
  );
}
