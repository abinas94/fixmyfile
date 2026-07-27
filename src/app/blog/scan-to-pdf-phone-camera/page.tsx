import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Scan Documents to PDF With Phone Camera Free (2025) | FixMyFile",
  description: "Use your phone camera as a document scanner. Create clean, professional PDFs from paper documents with auto-enhancement. Free, no app download needed.",
};

export default function ScanToPDFPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Scan Documents to PDF With Your Phone Camera — Free, No App Needed (2025)</h1>
      <p className="text-[var(--muted-foreground)] mb-8">July 22, 2026 • 4 min read</p>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-[var(--foreground)]">
        <p className="text-lg">No scanner? No problem. Your phone camera can produce professional document scans with automatic enhancement, edge detection, and PDF export — all from a free web tool.</p>

        <h2 className="text-2xl font-bold mt-8">What Can You Scan?</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Paper documents</strong> — letters, forms, applications</li>
          <li><strong>Receipts</strong> — for expense reports and reimbursements</li>
          <li><strong>ID cards</strong> — Aadhaar, PAN, passport copies</li>
          <li><strong>Notes</strong> — handwritten notes from meetings or classes</li>
          <li><strong>Certificates</strong> — degrees, marksheets, achievement certificates</li>
          <li><strong>Book pages</strong> — for reference or digitization</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">How to Scan (Step-by-Step)</h2>
        <ol className="list-decimal list-inside space-y-3 pl-4">
          <li>Open <Link href="/tools/scan-to-pdf" className="text-[var(--primary)] underline">FixMyFile Scan to PDF</Link> on your phone</li>
          <li>Tap the camera button to capture a photo (or upload existing photo)</li>
          <li>The tool auto-enhances: improves contrast, sharpens text, whitens background</li>
          <li>Add more pages if scanning a multi-page document</li>
          <li>Download as a clean, professional PDF</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">Auto-Enhancement Features</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Contrast boost</strong> — makes text darker and background whiter</li>
          <li><strong>Shadow removal</strong> — removes page curl and finger shadows</li>
          <li><strong>Sharpening</strong> — crisper text edges for better readability</li>
          <li><strong>Grayscale option</strong> — convert to B&W for smaller file size</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Tips for Better Scans</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Good lighting</strong> — natural daylight or even overhead light (avoid shadows)</li>
          <li><strong>Flat surface</strong> — place document on a flat, contrasting background</li>
          <li><strong>Steady hands</strong> — hold phone directly above, parallel to the document</li>
          <li><strong>Fill the frame</strong> — get as close as possible while keeping all edges visible</li>
          <li><strong>Dark background</strong> — use a dark desk/surface so white paper edges are clear</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Why Not Just Use a Scanner App?</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 pr-4">Feature</th>
                <th className="text-center py-2 px-2">FixMyFile</th>
                <th className="text-center py-2 px-2">Typical Scanner Apps</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4">Free (no watermark)</td><td className="text-center">✅</td><td className="text-center">❌ (watermark on free tier)</td></tr>
              <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4">No app install</td><td className="text-center">✅ (web-based)</td><td className="text-center">❌ (requires download)</td></tr>
              <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4">No account</td><td className="text-center">✅</td><td className="text-center">❌</td></tr>
              <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4">Privacy</td><td className="text-center">✅ Local processing</td><td className="text-center">⚠️ Uploads to server</td></tr>
              <tr><td className="py-2 pr-4">Multi-page PDF</td><td className="text-center">✅</td><td className="text-center">✅</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mt-8">After Scanning: Next Steps</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Need the text?</strong> — run <Link href="/tools/ocr" className="text-[var(--primary)] underline">OCR</Link> to extract editable text</li>
          <li><strong>File too large?</strong> — <Link href="/tools/compress" className="text-[var(--primary)] underline">Compress the PDF</Link></li>
          <li><strong>Multiple documents?</strong> — <Link href="/tools/merge" className="text-[var(--primary)] underline">Merge into one PDF</Link></li>
        </ul>

        <div className="mt-10 p-6 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-center">
          <p className="font-semibold mb-2">Turn your camera into a scanner — free, instant</p>
          <Link href="/tools/scan-to-pdf" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90">
            Scan to PDF →
          </Link>
        </div>
      </div>
    </article>
  );
}
