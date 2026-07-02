"use client";

import { useState } from "react";
import { Table, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function PDFToExcel() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [preview, setPreview] = useState<string[][]>([]);

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const pdfjsLib = await import("pdfjs-dist");
      pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.mjs`;

      const arrayBuffer = await files[0].arrayBuffer();
      const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

      const allRows: string[][] = [];

      for (let i = 1; i <= pdf.numPages; i++) {
        const page = await pdf.getPage(i);
        const textContent = await page.getTextContent();

        // Group text items by Y position (rows)
        const rowMap = new Map<number, { x: number; text: string }[]>();

        for (const item of textContent.items) {
          if (!("str" in item) || !(item as { str: string }).str.trim()) continue;
          const textItem = item as { str: string; transform: number[]; width: number };
          const y = Math.round(textItem.transform[5]);
          const x = Math.round(textItem.transform[4]);

          if (!rowMap.has(y)) rowMap.set(y, []);
          rowMap.get(y)!.push({ x, text: textItem.str.trim() });
        }

        // Sort rows by Y (descending = top to bottom) and cells by X
        const sortedYs = [...rowMap.keys()].sort((a, b) => b - a);

        for (const y of sortedYs) {
          const cells = rowMap.get(y)!.sort((a, b) => a.x - b.x);
          
          // Detect columns by X-position gaps
          const row: string[] = [];
          let currentCell = cells[0]?.text || "";
          let lastX = cells[0]?.x || 0;

          for (let j = 1; j < cells.length; j++) {
            const gap = cells[j].x - lastX;
            if (gap > 30) {
              row.push(currentCell);
              currentCell = cells[j].text;
            } else {
              currentCell += " " + cells[j].text;
            }
            lastX = cells[j].x;
          }
          if (currentCell) row.push(currentCell);
          if (row.length > 0) allRows.push(row);
        }
      }

      setPreview(allRows.slice(0, 10));

      // Generate CSV
      const maxCols = Math.max(...allRows.map((r) => r.length));
      const csvLines = allRows.map((row) => {
        const padded = [...row, ...Array(maxCols - row.length).fill("")];
        return padded.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",");
      });
      const csv = csvLines.join("\n");

      const blob = new Blob(["\ufeff" + csv], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = files[0].name.replace(/\.pdf$/i, ".csv");
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error converting PDF to Excel/CSV.");
    } finally { setIsProcessing(false); }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-600 to-emerald-700 flex items-center justify-center shadow-lg">
            <Table className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">PDF to Excel</h1>
            <p className="text-[var(--muted-foreground)]">Extract tables from PDF and export as CSV (opens in Excel)</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); setPreview([]); }} accept=".pdf" multiple={false} maxFiles={1} files={files} onRemoveFile={() => { setFiles([]); setPreview([]); }} />

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to CSV (Excel)" />
          <p className="text-xs text-[var(--muted-foreground)]">Detects table structure by text positions and exports as CSV</p>
        </div>
      )}

      {preview.length > 0 && (
        <div className="mt-6 p-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] overflow-x-auto">
          <h3 className="text-sm font-semibold mb-2">Preview (first 10 rows)</h3>
          <table className="w-full text-xs border-collapse">
            <tbody>
              {preview.map((row, i) => (
                <tr key={i} className={i === 0 ? "bg-[var(--muted)] font-semibold" : ""}>
                  {row.map((cell, j) => (
                    <td key={j} className="border border-[var(--border)] px-2 py-1 whitespace-nowrap">{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
