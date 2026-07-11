"use client";

import { useState } from "react";
import { FileText, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

const LOREM_WORDS = "lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore et dolore magna aliqua ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim id est laborum".split(" ");

function generateWords(count: number): string {
  const words: string[] = [];
  for (let i = 0; i < count; i++) {
    words.push(LOREM_WORDS[i % LOREM_WORDS.length]);
  }
  words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
  return words.join(" ") + ".";
}

function generateSentences(count: number): string {
  const sentences: string[] = [];
  for (let i = 0; i < count; i++) {
    const wordCount = 8 + Math.floor(Math.random() * 12);
    const startIdx = Math.floor(Math.random() * LOREM_WORDS.length);
    const words: string[] = [];
    for (let j = 0; j < wordCount; j++) {
      words.push(LOREM_WORDS[(startIdx + j) % LOREM_WORDS.length]);
    }
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);
    sentences.push(words.join(" ") + ".");
  }
  return sentences.join(" ");
}

function generateParagraphs(count: number): string {
  const paragraphs: string[] = [];
  for (let i = 0; i < count; i++) {
    const sentenceCount = 4 + Math.floor(Math.random() * 4);
    paragraphs.push(generateSentences(sentenceCount));
  }
  return paragraphs.join("\n\n");
}

export default function LoremIpsum() {
  const [mode, setMode] = useState<"paragraphs" | "sentences" | "words">("paragraphs");
  const [count, setCount] = useState(3);
  const [output, setOutput] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    switch (mode) {
      case "paragraphs":
        setOutput(generateParagraphs(count));
        break;
      case "sentences":
        setOutput(generateSentences(count));
        break;
      case "words":
        setOutput(generateWords(count));
        break;
    }
  };

  const copyToClipboard = () => {
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
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-gray-500 to-slate-700 flex items-center justify-center shadow-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Lorem Ipsum Generator</h1>
            <p className="text-[var(--muted-foreground)]">Generate placeholder text for designs and mockups</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 rounded-xl bg-[var(--card)] border border-[var(--border)] mb-6">
        <div className="flex flex-wrap items-center gap-4">
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Type</label>
            <div className="flex gap-1">
              {(["paragraphs", "sentences", "words"] as const).map((m) => (
                <button
                  key={m}
                  onClick={() => setMode(m)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-all ${
                    mode === m ? "bg-[var(--primary)] text-white" : "bg-[var(--muted)] text-[var(--muted-foreground)]"
                  }`}
                >
                  {m}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="text-xs font-medium text-[var(--muted-foreground)] mb-1 block">Count</label>
            <input
              type="number"
              min={1}
              max={100}
              value={count}
              onChange={(e) => setCount(Math.max(1, Math.min(100, Number(e.target.value))))}
              className="w-20 px-3 py-1.5 rounded-lg border border-[var(--border)] bg-[var(--background)] text-sm"
            />
          </div>
          <button
            onClick={generate}
            className="px-5 py-2 rounded-lg bg-[var(--primary)] text-white text-sm font-semibold hover:opacity-90 mt-auto"
          >
            Generate
          </button>
        </div>
      </div>

      {/* Output */}
      {output && (
        <div className="relative">
          <button
            onClick={copyToClipboard}
            className="absolute top-3 right-3 p-2 rounded-lg bg-[var(--muted)] hover:bg-[var(--accent)] transition-colors z-10"
            title="Copy to clipboard"
          >
            {copied ? <Check className="w-4 h-4 text-green-500" /> : <Copy className="w-4 h-4" />}
          </button>
          <textarea
            readOnly
            value={output}
            className="w-full h-80 p-4 pr-12 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm leading-relaxed resize-none focus:outline-none"
          />
          <p className="text-xs text-[var(--muted-foreground)] mt-2 text-center">
            {output.split(/\s+/).length} words • {output.length} characters
          </p>
        </div>
      )}
    </div>
  );
}
