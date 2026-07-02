"use client";

import { useState } from "react";
import { TextCursorInput, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const characters = text.length;
  const charactersNoSpace = text.replace(/\s/g, "").length;
  const sentences = text.trim() ? (text.match(/[.!?।]+/g) || []).length || (text.trim().length > 0 ? 1 : 0) : 0;
  const paragraphs = text.trim() ? text.split(/\n\s*\n/).filter(Boolean).length : 0;
  const lines = text.trim() ? text.split("\n").length : 0;
  const readingTime = Math.ceil(words / 200);
  const speakingTime = Math.ceil(words / 130);

  const copyText = () => {
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center shadow-lg">
            <TextCursorInput className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Word & Character Counter</h1>
            <p className="text-[var(--muted-foreground)]">Count words, characters, sentences, and reading time</p>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
        {[
          { label: "Words", value: words },
          { label: "Characters", value: characters },
          { label: "Without Spaces", value: charactersNoSpace },
          { label: "Sentences", value: sentences },
          { label: "Paragraphs", value: paragraphs },
          { label: "Lines", value: lines },
          { label: "Reading Time", value: `${readingTime} min` },
          { label: "Speaking Time", value: `${speakingTime} min` },
        ].map((s) => (
          <div key={s.label} className="p-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-center">
            <p className="text-2xl font-bold text-[var(--primary)]">{s.value}</p>
            <p className="text-xs text-[var(--muted-foreground)]">{s.label}</p>
          </div>
        ))}
      </div>

      <div className="relative">
        <textarea
          value={text} onChange={(e) => setText(e.target.value)}
          rows={14}
          placeholder="Start typing or paste your text here... Supports English, Hindi, and all Indian languages."
          className="w-full px-4 py-4 rounded-2xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] resize-y"
        />
        {text && (
          <button onClick={copyText} className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] transition-colors">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4 text-[var(--muted-foreground)]" />}
          </button>
        )}
      </div>
    </div>
  );
}
