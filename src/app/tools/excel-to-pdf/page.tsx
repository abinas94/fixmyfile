"use client";

import { useState } from "react";
import { Table, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";

export default function ExcelToPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);

  const handleConvert = async () => {
    if (!files.length) return;
    setIsProcessing(true);
    try {
      const file = files[0];
      let rows: string[][] = [];

      if (file.name.endsWith(".csv")) {
        // Parse CSV
        const text = await file.text();
        rows = text.split("\n").map((line) => {
          // Simple CSV parse (handles quotes)
          const cells: string[] = [];
          let current = "";
          let inQuotes = false;
          for (const char of line) {
            if (char === '"') { inQuotes = !inQuotes; }
            else if (char === "," && !inQuotes) { cells.push(current.trim()); current = ""; }
            else { current += char; }
          }
          cells.push(current.trim());
          return cells;
        }).filter((r) => r.some((c) => c));
      } else {
        // Parse .xlsx (ZIP with XML)
        const JSZip = (await import("jszip")).default;
        const arrayBuffer = await file.arrayBuffer();
        const zip = await JSZip.loadAsync(arrayBuffer);

        // Read shared strings
        const sharedStringsXml = await zip.file("xl/sharedStrings.xml")?.async("string");
        const sharedStrings: string[] = [];
        if (sharedStringsXml) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(sharedStringsXml, "text/xml");
          const siElements = doc.getElementsByTagName("si");
          for (let i = 0; i < siElements.length; i++) {
            const tElements = siElements[i].getElementsByTagName("t");
            let text = "";
            for (let j = 0; j < tElements.length; j++) text += tElements[j].textContent || "";
            sharedStrings.push(text);
          }
        }

        // Read first sheet
        const sheetXml = await zip.file("xl/worksheets/sheet1.xml")?.async("string");
        if (sheetXml) {
          const parser = new DOMParser();
          const doc = parser.parseFromString(sheetXml, "text/xml");
          const rowElements = doc.getElementsByTagName("row");
          for (let i = 0; i < rowElements.length; i++) {
            const cells = rowElements[i].getElementsByTagName("c");
            const row: string[] = [];
            for (let j = 0; j < cells.length; j++) {
              const type = cells[j].getAttribute("t");
              const vElement = cells[j].getElementsByTagName("v")[0];
              const value = vElement?.textContent || "";
              if (type === "s") {
                row.push(sharedStrings[parseInt(value)] || "");
              } else {
                row.push(value);
              }
            }
            rows.push(row);
          }
        }
      }

      if (rows.length === 0) throw new Error("No data found");

      // Generate PDF with table
      const { PDFDocument, StandardFonts, rgb } = await import("pdf-lib");
      const pdf = await PDFDocument.create();
      const font = await pdf.embedFont(StandardFonts.Helvetica);
      const boldFont = await pdf.embedFont(StandardFonts.HelveticaBold);

      const fontSize = 9;
      const cellPadding = 5;
      const rowHeight = fontSize + cellPadding * 2;
      const pageWidth = 842; // A4 landscape
      const pageHeight = 595;
      const margin = 40;
      const maxCols = Math.max(...rows.map((r) => r.length));
      const colWidth = (pageWidth - margin * 2) / maxCols;

      let page = pdf.addPage([pageWidth, pageHeight]);
      let yPos = pageHeight - margin;

      for (let i = 0; i < rows.length; i++) {
        if (yPos < margin + rowHeight) {
          page = pdf.addPage([pageWidth, pageHeight]);
          yPos = pageHeight - margin;
        }

        const row = rows[i];
        const isHeader = i === 0;

        // Draw row background
        if (isHeader) {
          page.drawRectangle({ x: margin, y: yPos - rowHeight, width: pageWidth - margin * 2, height: rowHeight, color: rgb(0.93, 0.93, 0.97) });
        }

        // Draw cells
        for (let j = 0; j < maxCols; j++) {
          const cellText = (row[j] || "").substring(0, 30); // Truncate long text
          const x = margin + j * colWidth + cellPadding;
          const y = yPos - rowHeight + cellPadding;
          page.drawText(cellText, { x, y, size: fontSize, font: isHeader ? boldFont : font, color: rgb(0.1, 0.1, 0.1) });

          // Cell border
          page.drawRectangle({ x: margin + j * colWidth, y: yPos - rowHeight, width: colWidth, height: rowHeight, borderColor: rgb(0.8, 0.8, 0.8), borderWidth: 0.5, color: undefined });
        }

        yPos -= rowHeight;
      }

      const result = await pdf.save();
      const blob = new Blob([result as unknown as BlobPart], { type: "application/pdf" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = file.name.replace(/\.(xlsx|csv)$/i, ".pdf");
      a.click();
      URL.revokeObjectURL(url);
      setIsComplete(true);
    } catch (error) {
      console.error(error);
      alert("Error converting Excel/CSV to PDF.");
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
            <h1 className="text-2xl sm:text-3xl font-bold">Excel to PDF</h1>
            <p className="text-[var(--muted-foreground)]">Convert Excel (.xlsx) or CSV files to PDF tables</p>
          </div>
        </div>
      </div>

      <FileDropZone onFilesSelected={(f) => { setFiles([f[0]]); setIsComplete(false); }} accept=".xlsx,.xls,.csv" multiple={false} maxFiles={1} files={files} onRemoveFile={() => setFiles([])} />

      {files.length > 0 && (
        <div className="mt-8 flex flex-col items-center gap-3">
          <ProcessingButton onClick={handleConvert} isProcessing={isProcessing} isComplete={isComplete} label="Convert to PDF" />
          <p className="text-xs text-[var(--muted-foreground)]">Renders spreadsheet data as a formatted table in PDF</p>
        </div>
      )}
    </div>
  );
}
