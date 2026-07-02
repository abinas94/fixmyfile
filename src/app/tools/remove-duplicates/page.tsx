"use client";

import { useState } from "react";
import { ListX, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function RemoveDuplicates() {
  const [text, setText] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState({ original: 0, unique: 0, removed: 0 });

  const removeDups = (keepOrder: boolean, trimLines: boolean, ignoreCase: boolean) => {
    const lines = text.split("\n");
    const original = lines.length;

    let processed = trimLines ? lines.map((l) => l.trim()) : [...lines];
    
    const seen = new Set<string>();
    const unique: string[] = [];
    
    for (const line of processed) {
      const key = ignoreCase ? line.toLowerCase() : line;
      if (!seen.has(key)) {
        seen.add(key);
        unique.push(line);
      }
    }

    const result = keepOrder ? unique : [...unique].sort();
    setOutput(result.join("\n"));
    setStats({ original, unique: unique.length, removed: original - unique.length });
  };

  const copyResult = () => {
    navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-rose-500 to-red-600 flex items-center justify-center shadow-lg">
            <ListX className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Remove Duplicate Lines</h1>
            <p className="text-[var(--muted-foreground)]">Remove duplicate lines from text</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input (one item per line)</label>
          <textarea value={text} onChange={(e) => setText(e.target.value)} rows={14}
            placeholder="Paste your list here, one item per line..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y" />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Output (duplicates removed)</label>
            {output && (
              <button onClick={copyResult} className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea value={output} readOnly rows={14}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--muted)] text-sm font-mono resize-y" />
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button onClick={() => removeDups(true, true, false)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90">
          Remove Duplicates (Keep Order)
        </button>
        <button onClick={() => removeDups(false, true, false)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]">
          Remove & Sort A-Z
        </button>
        <button onClick={() => removeDups(true, true, true)}
          className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]">
          Ignore Case
        </button>
      </div>

      {stats.removed > 0 && (
        <div className="mt-4 p-3 rounded-xl bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-sm text-green-700 dark:text-green-400">
          Removed <strong>{stats.removed}</strong> duplicate lines. {stats.original} → {stats.unique} lines.
        </div>
      )}
    </div>
  );
}
