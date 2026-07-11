"use client";

import { useState } from "react";
import { ArrowLeft, GitCompareArrows } from "lucide-react";
import Link from "next/link";

export default function TextDiff() {
  const [textA, setTextA] = useState("");
  const [textB, setTextB] = useState("");
  const [diff, setDiff] = useState<{ type: "same" | "added" | "removed"; line: string }[]>([]);

  const compare = () => {
    const linesA = textA.split("\n");
    const linesB = textB.split("\n");
    const result: { type: "same" | "added" | "removed"; line: string }[] = [];

    // Simple LCS-based diff
    const maxLen = Math.max(linesA.length, linesB.length);
    let i = 0, j = 0;

    while (i < linesA.length || j < linesB.length) {
      if (i < linesA.length && j < linesB.length && linesA[i] === linesB[j]) {
        result.push({ type: "same", line: linesA[i] });
        i++;
        j++;
      } else if (j < linesB.length && (i >= linesA.length || !linesA.slice(i).includes(linesB[j]))) {
        result.push({ type: "added", line: linesB[j] });
        j++;
      } else if (i < linesA.length) {
        result.push({ type: "removed", line: linesA[i] });
        i++;
      } else {
        break;
      }
    }

    setDiff(result);
  };

  const stats = {
    added: diff.filter((d) => d.type === "added").length,
    removed: diff.filter((d) => d.type === "removed").length,
    same: diff.filter((d) => d.type === "same").length,
  };

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-green-700 flex items-center justify-center shadow-lg">
            <GitCompareArrows className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Text Diff Checker</h1>
            <p className="text-[var(--muted-foreground)]">Compare two blocks of text and highlight differences</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <label className="text-sm font-medium mb-1 block">Original Text</label>
          <textarea
            value={textA}
            onChange={(e) => setTextA(e.target.value)}
            placeholder="Paste original text here..."
            className="w-full h-48 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Modified Text</label>
          <textarea
            value={textB}
            onChange={(e) => setTextB(e.target.value)}
            placeholder="Paste modified text here..."
            className="w-full h-48 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
        </div>
      </div>

      <div className="flex justify-center mb-6">
        <button
          onClick={compare}
          disabled={!textA && !textB}
          className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 disabled:opacity-50 transition-all"
        >
          Compare
        </button>
      </div>

      {/* Output */}
      {diff.length > 0 && (
        <>
          <div className="flex gap-4 justify-center mb-4 text-xs font-medium">
            <span className="px-2 py-1 rounded bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400">+{stats.added} added</span>
            <span className="px-2 py-1 rounded bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400">-{stats.removed} removed</span>
            <span className="px-2 py-1 rounded bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400">{stats.same} unchanged</span>
          </div>
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="max-h-96 overflow-y-auto font-mono text-sm">
              {diff.map((d, idx) => (
                <div
                  key={idx}
                  className={`px-4 py-1 border-b border-[var(--border)] last:border-0 ${
                    d.type === "added"
                      ? "bg-green-50 dark:bg-green-900/20 text-green-800 dark:text-green-300"
                      : d.type === "removed"
                      ? "bg-red-50 dark:bg-red-900/20 text-red-800 dark:text-red-300"
                      : ""
                  }`}
                >
                  <span className="inline-block w-6 text-xs opacity-50">
                    {d.type === "added" ? "+" : d.type === "removed" ? "-" : " "}
                  </span>
                  {d.line || " "}
                </div>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
