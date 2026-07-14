"use client";

import { useState } from "react";
import { Scissors, ArrowLeft } from "lucide-react";
import Link from "next/link";
import FileDropZone from "@/components/FileDropZone";
import ProcessingButton from "@/components/ProcessingButton";
import {
  splitPDF,
  splitPDFIntoPages,
  getPDFPageCount,
  downloadBlob,
  downloadAsZip,
} from "@/lib/pdf-utils";
import ToolContent from "@/components/ToolContent";
import { toolContentData } from "@/lib/tool-content-data";

type SplitMode = "all" | "range";

export default function SplitPDF() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isComplete, setIsComplete] = useState(false);
  const [splitMode, setSplitMode] = useState<SplitMode>("all");
  const [rangeInput, setRangeInput] = useState("");
  const [pageCount, setPageCount] = useState<number | null>(null);

  const handleFilesSelected = async (newFiles: File[]) => {
    const file = newFiles[0];
    setFiles([file]);
    setIsComplete(false);
    try {
      const count = await getPDFPageCount(file);
      setPageCount(count);
    } catch {
      setPageCount(null);
    }
  };

  const handleRemoveFile = () => {
    setFiles([]);
    setPageCount(null);
    setIsComplete(false);
  };

  const parseRanges = (input: string): { start: number; end: number }[] => {
    return input
      .split(",")
      .map((part) => part.trim())
      .filter(Boolean)
      .map((part) => {
        if (part.includes("-")) {
          const [start, end] = part.split("-").map(Number);
          return { start, end };
        }
        const page = Number(part);
        return { start: page, end: page };
      })
      .filter((r) => !isNaN(r.start) && !isNaN(r.end));
  };

  const handleSplit = async () => {
    if (files.length === 0) return;
    setIsProcessing(true);
    try {
      if (splitMode === "all") {
        const results = await splitPDFIntoPages(files[0]);
        if (results.length === 1) {
          downloadBlob(results[0], "page-1.pdf");
        } else {
          await downloadAsZip(
            results.map((data, i) => ({
              data,
              name: `page-${i + 1}.pdf`,
            }))
          );
        }
      } else {
        const ranges = parseRanges(rangeInput);
        if (ranges.length === 0) {
          alert("Please enter valid page ranges (e.g., 1-3, 5, 7-10)");
          setIsProcessing(false);
          return;
        }
        const results = await splitPDF(files[0], ranges);
        if (results.length === 1) {
          downloadBlob(results[0], "split.pdf");
        } else {
          await downloadAsZip(
            results.map((data, i) => ({
              data,
              name: `split-${i + 1}.pdf`,
            }))
          );
        }
      }
      setIsComplete(true);
    } catch (error) {
      console.error("Error splitting PDF:", error);
      alert("Error splitting PDF. Please make sure the file is a valid PDF.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/"
          className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors mb-4"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Scissors className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Split PDF</h1>
            <p className="text-[var(--muted-foreground)]">
              Extract pages or split into multiple files
            </p>
          </div>
        </div>
      </div>

      {/* Drop Zone */}
      <FileDropZone
        onFilesSelected={handleFilesSelected}
        accept=".pdf"
        multiple={false}
        maxFiles={1}
        files={files}
        onRemoveFile={handleRemoveFile}
      />

      {/* Options */}
      {files.length > 0 && pageCount && (
        <div className="mt-6 p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)]">
          <p className="text-sm mb-4 font-medium">
            📄 Document has <strong className="text-[var(--primary)]">{pageCount}</strong> page{pageCount > 1 ? "s" : ""}
          </p>

          <div className="flex gap-4 mb-4">
            <button
              onClick={() => setSplitMode("all")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                splitMode === "all"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              Split all pages
            </button>
            <button
              onClick={() => setSplitMode("range")}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                splitMode === "range"
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              Custom ranges
            </button>
          </div>

          {splitMode === "range" && (
            <div>
              <label className="block text-sm font-medium mb-2">
                Page ranges (total: {pageCount} pages)
              </label>
              <input
                type="text"
                value={rangeInput}
                onChange={(e) => setRangeInput(e.target.value)}
                placeholder={`e.g., 1-${Math.min(3, pageCount)}, ${Math.min(5, pageCount)}, ${Math.min(7, pageCount)}-${pageCount}`}
                className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
              />
              <div className="flex flex-wrap gap-2 mt-2">
                <button onClick={() => setRangeInput(`1-${pageCount}`)} className="text-xs px-2 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)]">All (1-{pageCount})</button>
                <button onClick={() => setRangeInput(`1-${Math.ceil(pageCount / 2)}, ${Math.ceil(pageCount / 2) + 1}-${pageCount}`)} className="text-xs px-2 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)]">Split in half</button>
                <button onClick={() => setRangeInput("1")} className="text-xs px-2 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)]">First page only</button>
                <button onClick={() => setRangeInput(String(pageCount))} className="text-xs px-2 py-1 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)]">Last page only</button>
              </div>
              <p className="text-xs text-[var(--muted-foreground)] mt-2">
                Separate ranges with commas. Each range creates a separate PDF.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Action */}
      {files.length > 0 && (
        <div className="mt-8 flex justify-center">
          <ProcessingButton
            onClick={handleSplit}
            isProcessing={isProcessing}
            isComplete={isComplete}
            label="Split & Download"
          />
        </div>
      )}

      <ToolContent {...toolContentData.split} />
    </div>
  );
}
