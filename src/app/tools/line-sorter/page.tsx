"use client";

import { useState } from "react";
import { ArrowUpDown, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function LineSorter() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const sort = (type: "alpha" | "alpha-desc" | "numeric" | "length" | "random" | "reverse") => {
    const lines = input.split("\n").filter((l) => l.trim());
    let sorted: string[];

    switch (type) {
      case "alpha":
        sorted = [...lines].sort((a, b) => a.localeCompare(b));
        break;
      case "alpha-desc":
        sorted = [...lines].sort((a, b) => b.localeCompare(a));
        break;
      case "numeric":
        sorted = [...lines].sort((a, b) => {
          const numA = parseFloat(a.replace(/[^0-9.-]/g, "")) || 0;
          const numB = parseFloat(b.replace(/[^0-9.-]/g, "")) || 0;
          return numA - numB;
        });
        break;
      case "length":
        sorted = [...lines].sort((a, b) => a.length - b.length);
        break;
      case "random":
        sorted = [...lines].sort(() => Math.random() - 0.5);
        break;
      case "reverse":
        sorted = [...lines].reverse();
        break;
      default:
        sorted = lines;
    }
    setOutput(sorted.join("\n"));
  };

  const copyOutput = () => {
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <ArrowUpDown className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Line Sorter</h1>
            <p className="text-[var(--muted-foreground)]">Sort lines alphabetically, numerically, by length, or randomly</p>
          </div>
        </div>
      </div>

      {/* Input */}
      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Paste your text here (one item per line)..."
        className="w-full h-40 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] mb-4"
      />

      {/* Sort Buttons */}
      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button onClick={() => sort("alpha")} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">A → Z</button>
        <button onClick={() => sort("alpha-desc")} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">Z → A</button>
        <button onClick={() => sort("numeric")} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">Numeric</button>
        <button onClick={() => sort("length")} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">By Length</button>
        <button onClick={() => sort("random")} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">Shuffle</button>
        <button onClick={() => sort("reverse")} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">Reverse</button>
      </div>

      {/* Output */}
      {output && (
        <div className="relative">
          <button onClick={copyOutput} className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] z-10">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <textarea
            readOnly
            value={output}
            className="w-full h-40 p-4 pr-12 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono resize-none focus:outline-none"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-2 text-center">
            {output.split("\n").length} lines
          </p>
        </div>
      )}
    </div>
  );
}
