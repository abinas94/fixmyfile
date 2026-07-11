"use client";

import { useState } from "react";
import { KeyRound, ArrowLeft, Copy, Check, RefreshCw } from "lucide-react";
import Link from "next/link";

function generatePassword(length: number, options: { uppercase: boolean; lowercase: boolean; numbers: boolean; symbols: boolean }): string {
  let chars = "";
  if (options.uppercase) chars += "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  if (options.lowercase) chars += "abcdefghijklmnopqrstuvwxyz";
  if (options.numbers) chars += "0123456789";
  if (options.symbols) chars += "!@#$%^&*()_+-=[]{}|;:,.<>?";
  if (!chars) chars = "abcdefghijklmnopqrstuvwxyz";

  const array = new Uint32Array(length);
  crypto.getRandomValues(array);
  return Array.from(array, (v) => chars[v % chars.length]).join("");
}

function getStrength(password: string): { label: string; color: string; percent: number } {
  let score = 0;
  if (password.length >= 8) score++;
  if (password.length >= 12) score++;
  if (password.length >= 16) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;

  if (score <= 2) return { label: "Weak", color: "bg-red-500", percent: 25 };
  if (score <= 4) return { label: "Fair", color: "bg-yellow-500", percent: 50 };
  if (score <= 5) return { label: "Good", color: "bg-blue-500", percent: 75 };
  return { label: "Strong", color: "bg-green-500", percent: 100 };
}

export default function PasswordGenerator() {
  const [length, setLength] = useState(16);
  const [options, setOptions] = useState({ uppercase: true, lowercase: true, numbers: true, symbols: true });
  const [password, setPassword] = useState("");
  const [copied, setCopied] = useState(false);

  const generate = () => {
    setPassword(generatePassword(length, options));
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(password);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const strength = password ? getStrength(password) : null;

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="mb-8">
        <Link href="/" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-4">
          <ArrowLeft className="w-4 h-4" /> Back to tools
        </Link>
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-red-500 to-rose-700 flex items-center justify-center shadow-lg">
            <KeyRound className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold">Password Generator</h1>
            <p className="text-[var(--muted-foreground)]">Generate secure random passwords</p>
          </div>
        </div>
      </div>

      {/* Password Display */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-4">
        <div className="flex items-center gap-2">
          <input
            readOnly
            value={password}
            placeholder="Click Generate..."
            className="flex-1 text-lg font-mono bg-transparent border-none outline-none"
          />
          <button onClick={generate} className="p-2 rounded-lg hover:bg-[var(--accent)]" title="Regenerate">
            <RefreshCw className="w-5 h-5" />
          </button>
          <button onClick={copyToClipboard} disabled={!password} className="p-2 rounded-lg hover:bg-[var(--accent)]" title="Copy">
            {copied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
          </button>
        </div>
        {strength && (
          <div className="mt-3">
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-medium">Strength: {strength.label}</span>
              <span className="text-xs text-[var(--muted-foreground)]">{password.length} chars</span>
            </div>
            <div className="w-full h-2 rounded-full bg-[var(--muted)]">
              <div className={`h-full rounded-full ${strength.color} transition-all`} style={{ width: `${strength.percent}%` }} />
            </div>
          </div>
        )}
      </div>

      {/* Options */}
      <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] mb-6">
        <div className="mb-4">
          <label className="text-sm font-medium mb-2 block">Length: {length}</label>
          <input
            type="range"
            min={4}
            max={64}
            value={length}
            onChange={(e) => setLength(Number(e.target.value))}
            className="w-full accent-[var(--primary)]"
          />
          <div className="flex justify-between text-xs text-[var(--muted-foreground)]">
            <span>4</span><span>64</span>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[
            { key: "uppercase", label: "Uppercase (A-Z)" },
            { key: "lowercase", label: "Lowercase (a-z)" },
            { key: "numbers", label: "Numbers (0-9)" },
            { key: "symbols", label: "Symbols (!@#$)" },
          ].map((opt) => (
            <label key={opt.key} className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={options[opt.key as keyof typeof options]}
                onChange={(e) => setOptions({ ...options, [opt.key]: e.target.checked })}
                className="w-4 h-4 accent-[var(--primary)]"
              />
              <span className="text-sm">{opt.label}</span>
            </label>
          ))}
        </div>
      </div>

      <div className="flex justify-center">
        <button onClick={generate} className="px-8 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold text-lg hover:opacity-90 shadow-lg">
          Generate Password
        </button>
      </div>
    </div>
  );
}
