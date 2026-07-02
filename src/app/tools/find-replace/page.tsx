"use client";

import { useState } from "react";
import { Search, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function FindReplace() {
  const [text, setText] = useState("");
  const [find, setFind] = useState("");
  const [replace, setReplace] = useState("");
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [useRegex, setUseRegex] = useState(false);
  const [copied, setCopied] = useState(false);

  const matchCount = (() => {
    if (!find || !text) return 0;
    try {
      const flags = caseSensitive ? "g" : "gi";
      const pattern = useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      return (text.match(pattern) || []).length;
    } catch { return 0; }
  })();

  const handleReplace = () => {
    if (!find) return;
    try {
      const flags = caseSensitive ? "g" : "gi";
      const pattern = useRegex ? new RegExp(find, flags) : new RegExp(find.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"), flags);
      setText(text.replace(pattern, replace));
    } catch { /* invalid regex */ }
  };

  const copyResult = () => {
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-sky-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Search className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Find & Replace</h1>
            <p className="text-[var(--muted-foreground)]">Bulk find and replace text patterns</p>
          </div>
        </div>
      </div>

      <div className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] space-y-4 mb-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Find</label>
            <input type="text" value={find} onChange={(e) => setFind(e.target.value)}
              placeholder="Text to find..."
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Replace with</label>
            <input type="text" value={replace} onChange={(e) => setReplace(e.target.value)}
              placeholder="Replacement text..."
              className="w-full px-4 py-2.5 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]" />
          </div>
        </div>

        <div className="flex items-center gap-4">
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={caseSensitive} onChange={(e) => setCaseSensitive(e.target.checked)} className="rounded" />
            Case sensitive
          </label>
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={useRegex} onChange={(e) => setUseRegex(e.target.checked)} className="rounded" />
            Use Regex
          </label>
          {find && <span className="text-sm text-[var(--primary)] font-medium">{matchCount} match{matchCount !== 1 ? "es" : ""} found</span>}
        </div>

        <button onClick={handleReplace} disabled={!find || matchCount === 0}
          className="px-6 py-2.5 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
          Replace All ({matchCount})
        </button>
      </div>

      <div className="relative">
        <textarea value={text} onChange={(e) => setText(e.target.value)} rows={12}
          placeholder="Paste your text here..."
          className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y font-mono" />
        {text && (
          <button onClick={copyResult} className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)]">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--muted-foreground)]" />}
          </button>
        )}
      </div>
    </div>
  );
}
