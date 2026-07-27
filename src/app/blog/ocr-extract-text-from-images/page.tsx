import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "OCR: How to Extract Text from Images Online Free (2025) | FixMyFile",
  description: "Extract text from images and photos using free OCR. Supports English, Hindi, and 100+ languages. Runs locally in your browser — no upload needed.",
};

export default function OCRPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">OCR: How to Extract Text from Images Online Free (2025)</h1>
      <p className="text-[var(--muted-foreground)] mb-8">July 22, 2026 • 5 min read</p>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-[var(--foreground)]">
        <p className="text-lg">OCR (Optical Character Recognition) converts text in images, screenshots, or photos into selectable, copyable, editable text. Here&apos;s how to use it for free — without uploading your files anywhere.</p>

        <h2 className="text-2xl font-bold mt-8">What Is OCR?</h2>
        <p>OCR technology reads text from images the same way humans do — it recognizes letters, words, and paragraphs from pixels. Modern OCR can handle:</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Printed text (books, receipts, documents)</li>
          <li>Screenshots (from apps, websites, chats)</li>
          <li>Photos of whiteboards or signs</li>
          <li>Scanned documents</li>
          <li>Multiple languages (100+ supported)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">How to Extract Text (Step-by-Step)</h2>
        <ol className="list-decimal list-inside space-y-3 pl-4">
          <li>Open <Link href="/tools/ocr" className="text-[var(--primary)] underline">FixMyFile OCR Tool</Link></li>
          <li>Drop an image (JPG, PNG, WebP, or screenshot)</li>
          <li>Select language(s) for better accuracy</li>
          <li>Wait for processing (runs in your browser using Tesseract.js)</li>
          <li>Copy the extracted text or download as .txt</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">Supported Languages</h2>
        <p>FixMyFile OCR supports <strong>100+ languages</strong> including:</p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li>English, Hindi, Tamil, Telugu, Bengali, Marathi, Gujarati</li>
          <li>Spanish, French, German, Italian, Portuguese</li>
          <li>Chinese (Simplified/Traditional), Japanese, Korean</li>
          <li>Arabic, Russian, Thai, Vietnamese</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Tips for Better OCR Accuracy</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Good lighting</strong> — well-lit, evenly exposed images work best</li>
          <li><strong>High resolution</strong> — at least 300 DPI for printed documents</li>
          <li><strong>Straight alignment</strong> — rotated or skewed text reduces accuracy</li>
          <li><strong>Clean background</strong> — plain white backgrounds beat textured ones</li>
          <li><strong>Clear fonts</strong> — standard printed fonts &gt; handwriting or decorative fonts</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Use Cases</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Digitize receipts</strong> — extract amounts for expense tracking</li>
          <li><strong>Copy text from screenshots</strong> — faster than retyping</li>
          <li><strong>Convert scanned PDFs</strong> — make them searchable (use <Link href="/tools/pdf-ocr" className="text-[var(--primary)] underline">PDF OCR</Link>)</li>
          <li><strong>Extract data from tables</strong> — use <Link href="/tools/table-ocr" className="text-[var(--primary)] underline">Table Extractor</Link> for structured data</li>
          <li><strong>Process multiple images</strong> — use <Link href="/tools/batch-ocr" className="text-[var(--primary)] underline">Batch OCR</Link> for bulk extraction</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">How Is This Different from Other OCR Tools?</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>100% local processing</strong> — your images never leave your browser</li>
          <li><strong>No daily limits</strong> — process as many images as you want</li>
          <li><strong>No sign-up</strong> — use immediately</li>
          <li><strong>Powered by Tesseract.js</strong> — the same engine used by Google Books</li>
        </ul>

        <div className="mt-10 p-6 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-center">
          <p className="font-semibold mb-2">Extract text from any image — free, private</p>
          <Link href="/tools/ocr" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90">
            Try OCR Tool →
          </Link>
        </div>
      </div>
    </article>
  );
}
