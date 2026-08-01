import type { Metadata } from "next";
import Link from "next/link";
import { Shield, Zap, Globe, Heart, Code2, Users } from "lucide-react";

export const metadata: Metadata = {
  title: "About FixMyFile - Free Online File Tools | Privacy First",
  description: "FixMyFile is a free, privacy-first suite of 63+ online tools for PDFs, images, documents, and more. Most tools process files locally in your browser.",
};

export default function AboutPage() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">About FixMyFile</h1>
      <p className="text-lg text-[var(--muted-foreground)] mb-10">
        Free, privacy-first file tools that work instantly in your browser.
      </p>

      <div className="space-y-10 text-sm leading-relaxed text-[var(--foreground)]">
        {/* Mission */}
        <section>
          <h2 className="text-xl font-bold mb-3">Our Mission</h2>
          <p className="text-[var(--muted-foreground)]">
            File tools should be free, fast, and private. You should not need to create an account, install software, or upload sensitive documents to a stranger&apos;s server just to merge two PDFs or compress an image.
          </p>
          <p className="text-[var(--muted-foreground)] mt-3">
            FixMyFile was built to solve this problem. We provide 63+ tools that handle PDFs, images, documents, OCR, calculations, and developer utilities — most running entirely in your browser with zero file uploads.
          </p>
        </section>

        {/* Values */}
        <section>
          <h2 className="text-xl font-bold mb-4">What Makes Us Different</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-2">
                <Shield className="w-5 h-5 text-green-500" />
                <h3 className="font-semibold">Privacy First</h3>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">55+ tools process files locally in your browser. Your documents never leave your device. For the few tools that need server processing, files are deleted immediately after.</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-5 h-5 text-yellow-500" />
                <h3 className="font-semibold">Instant Results</h3>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">No waiting for uploads or downloads. Local processing means results appear in milliseconds, not minutes. Works even on slow internet connections.</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-2">
                <Globe className="w-5 h-5 text-blue-500" />
                <h3 className="font-semibold">100% Free</h3>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">No premium tiers, no daily limits, no &quot;free trial&quot; tricks. Every tool is free forever. We sustain the site through non-intrusive advertising.</p>
            </div>
            <div className="p-4 rounded-xl border border-[var(--border)] bg-[var(--card)]">
              <div className="flex items-center gap-2 mb-2">
                <Heart className="w-5 h-5 text-red-500" />
                <h3 className="font-semibold">No Sign-Up</h3>
              </div>
              <p className="text-xs text-[var(--muted-foreground)]">Use any tool immediately without creating an account, verifying an email, or handing over personal information. Just open and use.</p>
            </div>
          </div>
        </section>

        {/* Tools overview */}
        <section>
          <h2 className="text-xl font-bold mb-3">What We Offer</h2>
          <div className="space-y-3 text-[var(--muted-foreground)]">
            <p><strong className="text-[var(--foreground)]">PDF Tools (20+)</strong> — Merge, split, compress, rotate, watermark, sign, protect, unlock, convert to/from Word, Excel, PowerPoint, and more.</p>
            <p><strong className="text-[var(--foreground)]">Image Tools (10+)</strong> — Background remover, resize, crop, compress, convert formats, passport photo maker, watermark, and AI enhancement.</p>
            <p><strong className="text-[var(--foreground)]">OCR & Text Extraction (5+)</strong> — Extract text from images and scanned PDFs. Supports 100+ languages. Batch processing and table extraction available.</p>
            <p><strong className="text-[var(--foreground)]">Document Tools (12+)</strong> — Word/PPT to PDF conversion, document formatting, text utilities, find & replace, and more.</p>
            <p><strong className="text-[var(--foreground)]">Calculators (3)</strong> — EMI, GST, and SIP calculators tailored for Indian users.</p>
            <p><strong className="text-[var(--foreground)]">Developer Tools (12+)</strong> — JSON formatter, regex tester, hash generator, QR code tools, color picker, and more.</p>
          </div>
        </section>

        {/* Tech */}
        <section>
          <h2 className="text-xl font-bold mb-3">Built With Modern Technology</h2>
          <div className="flex items-start gap-3 text-[var(--muted-foreground)]">
            <Code2 className="w-5 h-5 text-purple-500 flex-shrink-0 mt-0.5" />
            <p>FixMyFile is built with Next.js, React, and modern browser APIs. We use pdf-lib for PDF processing, Tesseract.js for OCR, and advanced image processing libraries — all running in your browser without plugins or downloads. The site is a Progressive Web App (PWA) that can be installed on your device and works offline.</p>
          </div>
        </section>

        {/* Community */}
        <section>
          <h2 className="text-xl font-bold mb-3">For Everyone</h2>
          <div className="flex items-start gap-3 text-[var(--muted-foreground)]">
            <Users className="w-5 h-5 text-indigo-500 flex-shrink-0 mt-0.5" />
            <p>Whether you&apos;re a student submitting assignments, a professional sharing contracts, a developer debugging code, or anyone who just needs to fix a file — FixMyFile is built for you. No technical knowledge required.</p>
          </div>
        </section>

        {/* CTA */}
        <div className="p-6 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-center">
          <p className="font-semibold mb-2">Have feedback or found a bug?</p>
          <Link href="/contact" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90">
            Contact Us →
          </Link>
        </div>
      </div>
    </article>
  );
}
