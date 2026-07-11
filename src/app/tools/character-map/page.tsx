"use client";

import { useState } from "react";
import { Type, ArrowLeft, Copy, Check } from "lucide-react";
import Link from "next/link";

const CATEGORIES = [
  {
    name: "Arrows",
    chars: "← → ↑ ↓ ↔ ↕ ⇐ ⇒ ⇑ ⇓ ⇔ ⇕ ➜ ➤ ➔ ► ◄ ▲ ▼ ↗ ↘ ↙ ↖ ↩ ↪ ⟵ ⟶ ⟷ ⟸ ⟹ ⟺",
  },
  {
    name: "Math",
    chars: "± × ÷ = ≠ ≈ ≡ < > ≤ ≥ ∞ √ ∑ ∏ ∫ ∂ ∇ ∈ ∉ ∋ ∅ ∩ ∪ ⊂ ⊃ ⊆ ⊇ ⊕ ⊗ ° ‰ ‱",
  },
  {
    name: "Currency",
    chars: "$ € £ ¥ ₹ ₽ ₩ ₿ ¢ ₫ ₴ ₸ ₺ ₼ ₾ ₡ ₣ ₤ ₥ ₦ ₧ ₨ ₪ ₭ ₮ ₯ ₰ ₱ ₲ ₳",
  },
  {
    name: "Punctuation",
    chars: "\u2026 \u2014 \u2013 \u00B7 \u2022 \u2023 \u203B \u2020 \u2021 \u00A7 \u00B6 \u00A9 \u00AE \u2122 \u00B0 \u00B9 \u00B2 \u00B3 \u2074 \u2075 \u2076 \u2077 \u2078 \u2079 \u2070 \u00AB \u00BB \u2039 \u203A \u201E \u201C \u201D \u2018 \u2019",
  },
  {
    name: "Greek",
    chars: "α β γ δ ε ζ η θ ι κ λ μ ν ξ ο π ρ σ τ υ φ χ ψ ω Α Β Γ Δ Ε Ζ Η Θ Ι Κ Λ Μ",
  },
  {
    name: "Shapes",
    chars: "■ □ ▪ ▫ ▬ ▮ ▯ ▰ ▱ ● ○ ◉ ◎ ◌ ◍ ◐ ◑ ◒ ◓ ◔ ◕ ◖ ◗ ★ ☆ ✦ ✧ ❖ ◆ ◇ ◈ ♦ ♠ ♣ ♥",
  },
  {
    name: "Checkmarks & Crosses",
    chars: "✓ ✔ ✗ ✘ ☑ ☒ ☐ ✕ ⊘ ⊗ ⊖ ⊕ ⊙ ⊚ ⊛ ○ ● ◉ ◎",
  },
  {
    name: "Music & Misc",
    chars: "♩ ♪ ♫ ♬ ♭ ♮ ♯ ⌘ ⌥ ⌫ ⏎ ⏏ ☀ ☁ ☂ ☃ ☄ ★ ☆ ☎ ☏ ✉ ✈ ✂ ✄ ☮ ☯ ☢ ☣ ⚠ ⚡ ⚙",
  },
  {
    name: "Emojis",
    chars: "😀 😂 🥰 😎 🤔 👍 👎 ❤️ 🔥 ⭐ 🎉 💡 🚀 ✅ ❌ ⚡ 🎯 💯 🏆 🌟 📌 📎 🔗 🔍 📝 🗂️ 📁 🖥️ ⌨️ 🖱️",
  },
  {
    name: "Box Drawing",
    chars: "─ │ ┌ ┐ └ ┘ ├ ┤ ┬ ┴ ┼ ═ ║ ╔ ╗ ╚ ╝ ╠ ╣ ╦ ╩ ╬ ╭ ╮ ╯ ╰ ╱ ╲ ╳",
  },
  {
    name: "Fractions",
    chars: "½ ⅓ ⅔ ¼ ¾ ⅕ ⅖ ⅗ ⅘ ⅙ ⅚ ⅛ ⅜ ⅝ ⅞ ⅐ ⅑ ⅒",
  },
  {
    name: "Latin Extended",
    chars: "à á â ã ä å æ ç è é ê ë ì í î ï ð ñ ò ó ô õ ö ø ù ú û ü ý þ ÿ ß",
  },
];

export default function CharacterMap() {
  const [copied, setCopied] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState("Arrows");
  const [searchQuery, setSearchQuery] = useState("");

  const copyChar = (char: string) => {
    navigator.clipboard.writeText(char);
    setCopied(char);
    setTimeout(() => setCopied(null), 1500);
  };

  const activeChars = CATEGORIES.find((c) => c.name === activeCategory);
  const chars = activeChars ? activeChars.chars.split(" ").filter(Boolean) : [];

  const filteredChars = searchQuery
    ? CATEGORIES.flatMap((c) => c.chars.split(" ").filter(Boolean))
    : chars;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Type className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Character Map</h1>
            <p className="text-[var(--muted-foreground)]">Find and copy special characters, symbols, arrows, and emojis</p>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Search all characters..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
        />
      </div>

      {/* Category Tabs */}
      {!searchQuery && (
        <div className="flex flex-wrap gap-2 mb-6">
          {CATEGORIES.map((cat) => (
            <button
              key={cat.name}
              onClick={() => setActiveCategory(cat.name)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                activeCategory === cat.name
                  ? "bg-[var(--primary)] text-white"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      )}

      {/* Character Grid */}
      <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 lg:grid-cols-12 gap-2">
        {filteredChars.map((char, idx) => (
          <button
            key={`${char}-${idx}`}
            onClick={() => copyChar(char)}
            className="relative aspect-square flex items-center justify-center text-xl sm:text-2xl rounded-lg border border-[var(--border)] bg-[var(--card)] hover:bg-[var(--accent)] hover:scale-110 active:scale-95 transition-all cursor-pointer"
            title={`Click to copy: ${char} (U+${char.codePointAt(0)?.toString(16).toUpperCase().padStart(4, "0")})`}
          >
            {copied === char ? (
              <Check className="w-4 h-4 text-green-500" />
            ) : (
              char
            )}
          </button>
        ))}
      </div>

      {/* Copied notification */}
      {copied && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 px-4 py-2 rounded-lg bg-green-600 text-white text-sm font-medium shadow-xl animate-[slideUp_0.2s_ease-out] z-50 flex items-center gap-2">
          <Copy className="w-3.5 h-3.5" />
          Copied &ldquo;{copied}&rdquo; to clipboard
        </div>
      )}

      <div className="mt-8 p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
        <p className="text-xs text-[var(--muted-foreground)] text-center">
          Click any character to copy it to your clipboard. Hover for Unicode code point.
        </p>
      </div>
    </div>
  );
}
