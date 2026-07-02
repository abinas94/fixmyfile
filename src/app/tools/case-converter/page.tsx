"use client";

import { useState } from "react";
import { CaseSensitive, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function CaseConverter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const convert = (type: string) => {
    switch (type) {
      case "upper": setText(text.toUpperCase()); break;
      case "lower": setText(text.toLowerCase()); break;
      case "title": setText(text.replace(/\w\S*/g, (t) => t.charAt(0).toUpperCase() + t.substring(1).toLowerCase())); break;
      case "sentence": setText(text.toLowerCase().replace(/(^\s*\w|[.!?]\s+\w)/g, (c) => c.toUpperCase())); break;
      case "toggle": setText(text.split("").map((c) => c === c.toUpperCase() ? c.toLowerCase() : c.toUpperCase()).join("")); break;
      case "camel": setText(text.toLowerCase().replace(/[^a-zA-Z0-9]+(.)/g, (_, c) => c.toUpperCase())); break;
      case "snake": setText(text.toLowerCase().replace(/\s+/g, "_").replace(/[^a-zA-Z0-9_]/g, "")); break;
      case "kebab": setText(text.toLowerCase().replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")); break;
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(text);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <CaseSensitive className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Case Converter</h1>
            <p className="text-[var(--muted-foreground)]">Convert text between different cases instantly</p>
          </div>
        </div>
      </div>

      <textarea
        value={text} onChange={(e) => setText(e.target.value)} rows={8}
        placeholder="Type or paste your text here..."
        className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y"
      />

      <div className="mt-4 flex flex-wrap gap-2">
        {[
          { id: "upper", label: "UPPERCASE" },
          { id: "lower", label: "lowercase" },
          { id: "title", label: "Title Case" },
          { id: "sentence", label: "Sentence case" },
          { id: "toggle", label: "tOGGLE cASE" },
          { id: "camel", label: "camelCase" },
          { id: "snake", label: "snake_case" },
          { id: "kebab", label: "kebab-case" },
        ].map((btn) => (
          <button key={btn.id} onClick={() => convert(btn.id)}
            className="px-4 py-2 rounded-xl text-sm font-medium bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--primary)] hover:text-white transition-all">
            {btn.label}
          </button>
        ))}
      </div>

      {text && (
        <div className="mt-4 flex justify-end">
          <button onClick={copyToClipboard}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium bg-[var(--primary)] text-white hover:opacity-90">
            {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied ? "Copied!" : "Copy Text"}
          </button>
        </div>
      )}
    </div>
  );
}
