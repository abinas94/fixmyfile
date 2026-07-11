"use client";

import { useState, useMemo } from "react";
import { Code2, ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function RegexTester() {
  const [pattern, setPattern] = useState("");
  const [flags, setFlags] = useState("g");
  const [testString, setTestString] = useState("");

  const results = useMemo(() => {
    if (!pattern || !testString) return { matches: [], error: null };
    try {
      const regex = new RegExp(pattern, flags);
      const matches: { match: string; index: number; groups: string[] }[] = [];
      let m;

      if (flags.includes("g")) {
        while ((m = regex.exec(testString)) !== null) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
          if (m[0] === "") regex.lastIndex++; // prevent infinite loop
        }
      } else {
        m = regex.exec(testString);
        if (m) {
          matches.push({ match: m[0], index: m.index, groups: m.slice(1) });
        }
      }
      return { matches, error: null };
    } catch (e: any) {
      return { matches: [], error: e.message };
    }
  }, [pattern, flags, testString]);

  // Highlight matches in test string
  const highlightedText = useMemo(() => {
    if (!pattern || !testString || results.error) return null;
    try {
      const regex = new RegExp(pattern, flags.includes("g") ? flags : flags + "g");
      const parts: { text: string; isMatch: boolean }[] = [];
      let lastIndex = 0;
      let m;

      while ((m = regex.exec(testString)) !== null) {
        if (m.index > lastIndex) {
          parts.push({ text: testString.slice(lastIndex, m.index), isMatch: false });
        }
        parts.push({ text: m[0], isMatch: true });
        lastIndex = m.index + m[0].length;
        if (m[0] === "") { regex.lastIndex++; lastIndex++; }
      }
      if (lastIndex < testString.length) {
        parts.push({ text: testString.slice(lastIndex), isMatch: false });
      }
      return parts;
    } catch {
      return null;
    }
  }, [pattern, flags, testString, results.error]);

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-600 to-indigo-700 flex items-center justify-center shadow-lg">
            <Code2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Regex Tester</h1>
            <p className="text-[var(--muted-foreground)]">Test regular expressions with live matching and capture groups</p>
          </div>
        </div>
      </div>

      {/* Pattern Input */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-4">
        <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Regular Expression</label>
        <div className="flex items-center gap-2">
          <span className="text-lg text-[var(--muted-foreground)] font-mono">/</span>
          <input
            type="text"
            value={pattern}
            onChange={(e) => setPattern(e.target.value)}
            placeholder="Enter regex pattern..."
            className="flex-1 px-2 py-2 bg-transparent text-sm font-mono border-none outline-none"
          />
          <span className="text-lg text-[var(--muted-foreground)] font-mono">/</span>
          <input
            type="text"
            value={flags}
            onChange={(e) => setFlags(e.target.value)}
            className="w-12 px-2 py-2 bg-transparent text-sm font-mono border-none outline-none text-[var(--primary)]"
            placeholder="gi"
          />
        </div>
        {results.error && (
          <p className="text-xs text-red-500 mt-2">{results.error}</p>
        )}
      </div>

      {/* Flags */}
      <div className="flex flex-wrap gap-2 mb-4">
        {[
          { flag: "g", label: "Global" },
          { flag: "i", label: "Case insensitive" },
          { flag: "m", label: "Multiline" },
          { flag: "s", label: "Dot all" },
        ].map((f) => (
          <button
            key={f.flag}
            onClick={() => {
              setFlags(flags.includes(f.flag) ? flags.replace(f.flag, "") : flags + f.flag);
            }}
            className={`px-3 py-1 rounded-lg text-xs font-medium transition-all ${
              flags.includes(f.flag) ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
            }`}
          >
            {f.flag} — {f.label}
          </button>
        ))}
      </div>

      {/* Test String */}
      <div className="mb-4">
        <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Test String</label>
        <textarea
          value={testString}
          onChange={(e) => setTestString(e.target.value)}
          placeholder="Enter text to test against..."
          className="w-full h-32 p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {/* Highlighted Result */}
      {highlightedText && highlightedText.length > 0 && (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-4">
          <label className="text-xs font-medium text-[var(--muted-foreground)] mb-2 block">Match Highlighting</label>
          <div className="font-mono text-sm whitespace-pre-wrap break-all">
            {highlightedText.map((part, idx) => (
              <span key={idx} className={part.isMatch ? "bg-yellow-200 dark:bg-yellow-800 text-yellow-900 dark:text-yellow-100 px-0.5 rounded" : ""}>
                {part.text}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Match Results */}
      {results.matches.length > 0 && (
        <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--muted)]">
          <p className="text-xs font-medium mb-2">{results.matches.length} match{results.matches.length > 1 ? "es" : ""} found</p>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {results.matches.map((m, idx) => (
              <div key={idx} className="text-xs font-mono bg-[var(--card)] p-2 rounded-lg">
                <span className="text-[var(--primary)]">Match {idx + 1}:</span>{" "}
                <span className="font-semibold">&quot;{m.match}&quot;</span>{" "}
                <span className="text-[var(--muted-foreground)]">at index {m.index}</span>
                {m.groups.length > 0 && (
                  <div className="mt-1 text-[var(--muted-foreground)]">
                    Groups: {m.groups.map((g, i) => <span key={i} className="mr-2">${i + 1}=&quot;{g}&quot;</span>)}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
