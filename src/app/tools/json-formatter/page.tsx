"use client";

import { useState } from "react";
import { Braces, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function JSONFormatter() {
  const [input, setInput] = useState('{"name":"John","age":30,"city":"Mumbai","skills":["JavaScript","Python","React"]}');
  const [output, setOutput] = useState("");
  const [error, setError] = useState("");
  const [copied, setCopied] = useState(false);
  const [indent, setIndent] = useState(2);

  const format = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed, null, indent));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const minify = () => {
    try {
      const parsed = JSON.parse(input);
      setOutput(JSON.stringify(parsed));
      setError("");
    } catch (e) {
      setError((e as Error).message);
      setOutput("");
    }
  };

  const copyOutput = () => {
    navigator.clipboard.writeText(output);
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-yellow-500 to-amber-600 flex items-center justify-center shadow-lg">
            <Braces className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">JSON Formatter</h1>
            <p className="text-[var(--muted-foreground)]">Format, validate, and minify JSON</p>
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <button onClick={format} className="px-4 py-2 rounded-xl bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">
          Format
        </button>
        <button onClick={minify} className="px-4 py-2 rounded-xl bg-[var(--muted)] text-[var(--muted-foreground)] text-sm font-medium hover:bg-[var(--accent)]">
          Minify
        </button>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--muted-foreground)]">Indent:</label>
          <select value={indent} onChange={(e) => setIndent(Number(e.target.value))}
            className="px-2 py-1 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm">
            <option value={2}>2 spaces</option>
            <option value={4}>4 spaces</option>
            <option value={1}>1 tab</option>
          </select>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium mb-2">Input</label>
          <textarea value={input} onChange={(e) => setInput(e.target.value)}
            rows={18}
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--background)] text-sm font-mono focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y"
            placeholder="Paste your JSON here..." />
        </div>
        <div>
          <div className="flex justify-between items-center mb-2">
            <label className="text-sm font-medium">Output</label>
            {output && (
              <button onClick={copyOutput} className="flex items-center gap-1 text-xs text-[var(--primary)] hover:underline">
                {copied ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                {copied ? "Copied!" : "Copy"}
              </button>
            )}
          </div>
          <textarea value={output || error} readOnly
            rows={18}
            className={`w-full px-4 py-3 rounded-xl border text-sm font-mono resize-y ${error ? "border-red-300 bg-red-50 dark:bg-red-900/10 text-red-600" : "border-[var(--border)] bg-[var(--muted)]"}`} />
        </div>
      </div>
    </div>
  );
}
