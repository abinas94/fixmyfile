"use client";

import { useState } from "react";
import { Undo2, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

export default function TextReverser() {
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const reverse = (mode: "char" | "word" | "line") => {
    switch (mode) {
      case "char":
        setOutput([...input].reverse().join(""));
        break;
      case "word":
        setOutput(input.split(/(\s+)/).reverse().join(""));
        break;
      case "line":
        setOutput(input.split("\n").reverse().join("\n"));
        break;
    }
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center shadow-lg">
            <Undo2 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Text Reverser</h1>
            <p className="text-[var(--muted-foreground)]">Reverse text by character, word, or line</p>
          </div>
        </div>
      </div>

      <textarea
        value={input}
        onChange={(e) => setInput(e.target.value)}
        placeholder="Type or paste text here..."
        className="w-full h-36 p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-[var(--ring)] mb-4"
      />

      <div className="flex flex-wrap gap-2 justify-center mb-6">
        <button onClick={() => reverse("char")} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">Reverse Characters</button>
        <button onClick={() => reverse("word")} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">Reverse Words</button>
        <button onClick={() => reverse("line")} className="px-4 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-medium hover:opacity-90">Reverse Lines</button>
      </div>

      {output && (
        <div className="relative">
          <button onClick={copyOutput} className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] z-10">
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <textarea
            readOnly
            value={output}
            className="w-full h-36 p-4 pr-12 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-mono resize-none focus:outline-none"
          />
        </div>
      )}
    </div>
  );
}
