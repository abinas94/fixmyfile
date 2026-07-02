"use client";

import { useState } from "react";
import { Shield, Zap, Workflow, ArrowRight, FileText, ImageIcon, Calculator, Code2 } from "lucide-react";
import ToolCard from "@/components/ToolCard";
import { tools, categories } from "@/lib/tools-config";
import Link from "next/link";

export default function Home() {
  const [activeCategory, setActiveCategory] = useState("all");

  const filteredTools =
    activeCategory === "all"
      ? tools
      : tools.filter((tool) => tool.category === activeCategory);

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-50 via-white to-purple-50 dark:from-indigo-950/20 dark:via-[var(--background)] dark:to-purple-950/20" />
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-72 h-72 bg-indigo-300/20 dark:bg-indigo-500/10 rounded-full blur-3xl" />
          <div className="absolute bottom-20 right-1/4 w-96 h-96 bg-purple-300/20 dark:bg-purple-500/10 rounded-full blur-3xl" />
        </div>

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16 sm:pt-28 sm:pb-24">
          <div className="text-center max-w-4xl mx-auto">
            {/* Badge */}
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 mb-6">
              <Shield className="w-4 h-4 text-green-600" />
              <span className="text-sm font-medium text-green-700 dark:text-green-400">
                100% Free &bull; No Sign-up &bull; Files never leave your browser
              </span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight mb-6">
              Fix your files{" "}
              <span style={{ background: "linear-gradient(135deg, #f97316, #ef4444, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>in seconds</span>
            </h1>

            <p className="text-lg sm:text-xl text-[var(--muted-foreground)] max-w-2xl mx-auto mb-10">
              PDF, images, documents, OCR, calculators — 50+ tools that work instantly
              in your browser. No uploads. No sign-ups. No limits. Ever.
            </p>

            {/* Category highlights */}
            <div className="flex flex-wrap items-center justify-center gap-3 mb-12">
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                <FileText className="w-4 h-4 text-red-500" />
                <span className="text-sm font-medium">PDF Tools</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                <ImageIcon className="w-4 h-4 text-purple-500" />
                <span className="text-sm font-medium">Image Tools</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                <Workflow className="w-4 h-4 text-violet-500" />
                <span className="text-sm font-medium">OCR & Text Extract</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                <FileText className="w-4 h-4 text-orange-500" />
                <span className="text-sm font-medium">Documents & Text</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                <Calculator className="w-4 h-4 text-green-500" />
                <span className="text-sm font-medium">Calculators</span>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[var(--card)] border border-[var(--border)] shadow-sm">
                <Code2 className="w-4 h-4 text-blue-500" />
                <span className="text-sm font-medium">Dev Tools</span>
              </div>
            </div>

            {/* CTAs - Feature tools */}
            <div className="flex flex-wrap items-center justify-center gap-3">
              <Link
                href="/tools/bg-remover"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-rose-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-rose-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                Background Remover
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tools/doc-formatter"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-orange-500 via-red-500 to-pink-500 text-white font-semibold shadow-lg hover:shadow-red-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                Document Formatter
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tools/ocr"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-gradient-to-r from-violet-600 to-indigo-700 text-white font-semibold shadow-lg hover:shadow-violet-500/30 hover:scale-105 active:scale-95 transition-all"
              >
                OCR - Extract Text
                <ArrowRight className="w-4 h-4" />
              </Link>
              <Link
                href="/tools/pipeline"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border-2 border-[var(--border)] bg-[var(--card)] font-semibold hover:border-[var(--primary)] hover:scale-105 active:scale-95 transition-all"
              >
                Pipeline Builder
                <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Tools Grid */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2 scrollbar-hide">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-all ${
                activeCategory === cat.id
                  ? "bg-[var(--primary)] text-white shadow-lg shadow-indigo-500/20"
                  : "bg-[var(--muted)] text-[var(--muted-foreground)] hover:bg-[var(--accent)]"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>

        {/* Tool Count */}
        <p className="text-sm text-[var(--muted-foreground)] mb-6">
          Showing {filteredTools.length} tool{filteredTools.length !== 1 ? "s" : ""}
          {activeCategory !== "all" && (
            <button
              onClick={() => setActiveCategory("all")}
              className="ml-2 text-[var(--primary)] hover:underline"
            >
              Show all
            </button>
          )}
        </p>

        {/* Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
          {filteredTools.map((tool) => (
            <ToolCard key={tool.id} tool={tool} />
          ))}
        </div>
      </section>

      {/* How It Works */}
      <section className="bg-[var(--muted)] py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl font-bold text-center mb-4">
            How it works
          </h2>
          <p className="text-center text-[var(--muted-foreground)] mb-12 max-w-xl mx-auto">
            No accounts. No uploads. No waiting. Everything runs in your browser.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: "1",
                title: "Pick a tool",
                description:
                  "Choose from 30+ tools across PDFs, images, text, calculations, and development.",
              },
              {
                step: "2",
                title: "Use it instantly",
                description:
                  "Drop files, enter data, or paste text. Everything processes right in your browser.",
              },
              {
                step: "3",
                title: "Get results",
                description:
                  "Download your files or copy your results. No email, no signup, no limits.",
              },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white font-bold text-xl flex items-center justify-center mx-auto mb-4 shadow-lg">
                  {item.step}
                </div>
                <h3 className="text-lg font-semibold mb-2">{item.title}</h3>
                <p className="text-[var(--muted-foreground)]">
                  {item.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            <div>
              <p className="text-3xl font-bold gradient-text">30+</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Free Tools</p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text">0</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Files Uploaded</p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text">100%</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Client-Side</p>
            </div>
            <div>
              <p className="text-3xl font-bold gradient-text">0</p>
              <p className="text-sm text-[var(--muted-foreground)] mt-1">Sign-up Required</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
