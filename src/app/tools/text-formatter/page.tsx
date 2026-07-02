"use client";

import { useState } from "react";
import { AlignLeft, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function TextFormatter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const format = (type: string) => {
    switch (type) {
      case "trim-lines": setText(text.split("\n").map((l) => l.trim()).join("\n")); break;
      case "remove-empty": setText(text.split("\n").filter((l) => l.trim()).join("\n")); break;
      case "remove-extra-spaces": setText(text.replace(/  +/g, " ")); break;
      case "add-line-numbers": setText(text.split("\n").map((l, i) => `${i + 1}. ${l}`).join("\n")); break;
      case "sort-asc": setText(text.split("\n").sort((a, b) => a.localeCompare(b)).join("\n")); break;
      case "sort-desc": setText(text.split("\n").sort((a, b) => b.localeCompare(a)).join("\n")); break;
      case "reverse-lines": setText(text.split("\n").reverse().join("\n")); break;
      case "reverse-text": setText(text.split("").reverse().join("")); break;
      case "remove-html": setText(text.replace(/<[^>]*>/g, "")); break;
      case "encode-html": setText(text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")); break;
      case "single-space": setText(text.replace(/\n{2,}/g, "\n")); break;
      case "double-space": setText(text.split("\n").join("\n\n")); break;
    }
  };

  const copyResult = () => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const operations = [
    { id: "trim-lines", label: "Trim Lines" },
    { id: "remove-empty", label: "Remove Empty Lines" },
    { id: "remove-extra-spaces", label: "Remove Extra Spaces" },
    { id: "single-space", label: "Single Space Lines" },
    { id: "double-space", label: "Double Space Lines" },
    { id: "add-line-numbers", label: "Add Line Numbers" },
    { id: "sort-asc", label: "Sort A → Z" },
    { id: "sort-desc", label: "Sort Z → A" },
    { id: "reverse-lines", label: "Reverse Lines" },
    { id: "reverse-text", label: "Reverse Text" },
    { id: "remove-html", label: "Strip HTML Tags" },
    { id: "encode-html", label: "Encode HTML" },
  ];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg">
            <AlignLeft className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Text Formatter</h1>
            <p className="text-[var(--muted-foreground)]">Format, clean, and transform text</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        {operations.map((op) => (
          <button key={op.id} onClick={() => format(op.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary)] hover:text-white transition-all">
            {op.label}
          </button>
        ))}
      </div>

      <div className="relative">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={16}
          placeholder="Paste your text here and click any operation above..."
          className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y" />
        {text && (
          <button onClick={copyResult} className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)]">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--muted-foreground)]" />}
          </button>
        )}
      </div>
      <p className="text-xs text-[var(--muted-foreground)] mt-2">
        {text.split("\n").length} lines • {text.length} characters
      </p>
    </div>
  );
}
