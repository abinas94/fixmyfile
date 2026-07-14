import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "How to Scan Documents to PDF With Your Phone (Free, No App Download)",
  description: "Turn your phone camera into a document scanner. Scan papers, receipts, and documents to clean PDFs with edge detection and enhancement. No app installation needed.",
};

export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">How to Scan Documents to PDF With Your Phone (Free, No App)</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-8">Published: July 11, 2026 • 4 min read</p>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6 text-[var(--foreground)]">
        <p className="text-lg text-[var(--muted-foreground)]">
          You don&apos;t need Adobe Scan, CamScanner, or any app to scan documents to PDF. Your phone&apos;s browser is all you need. Here&apos;s how to turn physical papers into clean, professional PDFs in under 30 seconds.
        </p>

        <h2 className="text-2xl font-bold mt-8">Why Not Just Take a Photo?</h2>
        <p>A photo of a document is not a scan. It has:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li>Perspective distortion (document appears as a trapezoid, not a rectangle)</li>
          <li>Uneven lighting and shadows</li>
          <li>Low contrast text that&apos;s hard to read</li>
          <li>Background clutter (desk, fingers, etc.)</li>
          <li>Huge file size (8-15MB per photo vs 200KB for a scan)</li>
        </ul>
        <p>A proper scan corrects perspective, enhances contrast, removes background, and produces a clean, compact PDF page.</p>

        <h2 className="text-2xl font-bold mt-8">How to Scan with FixMyFile (Step-by-Step)</h2>
        <ol className="list-decimal pl-6 space-y-3">
          <li>
            <strong>Open the scanner</strong> — Go to <Link href="/tools/scan-to-pdf" className="text-[var(--primary)] hover:underline">fixmyfile.vercel.app/tools/scan-to-pdf</Link> on your phone
          </li>
          <li>
            <strong>Allow camera access</strong> — The tool uses your rear camera at maximum resolution (up to 4K)
          </li>
          <li>
            <strong>Capture your document</strong> — Hold your phone above the document and tap the capture button. Try to keep the document flat and well-lit.
          </li>
          <li>
            <strong>Adjust edges</strong> — Four draggable corner handles appear. Drag them to exactly match the document corners. This corrects perspective distortion.
          </li>
          <li>
            <strong>Apply enhancement</strong> — Choose a filter:
            <ul className="list-disc pl-6 mt-1 space-y-1">
              <li><strong>Original</strong> — keeps the photo as-is</li>
              <li><strong>Grayscale</strong> — removes color, good for text documents</li>
              <li><strong>Black &amp; White</strong> — high contrast, smallest file size, best for printed text</li>
              <li><strong>Enhanced</strong> — auto-adjusts contrast and sharpness</li>
            </ul>
          </li>
          <li>
            <strong>Add more pages</strong> — Scan additional pages to create a multi-page document
          </li>
          <li>
            <strong>Reorder if needed</strong> — Drag pages to rearrange them
          </li>
          <li>
            <strong>Export as PDF</strong> — Download a clean, properly sized PDF (A4 format)
          </li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">Pro Tips for Better Scans</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Lighting matters most</strong> — scan near a window or under even lighting. Avoid harsh shadows from overhead lights.</li>
          <li><strong>Dark background helps</strong> — place your document on a dark surface so edges are easier to detect.</li>
          <li><strong>Hold steady</strong> — keep your phone parallel to the document, not at an angle.</li>
          <li><strong>Use B&amp;W for text</strong> — Black &amp; White filter produces the sharpest, most readable text and smallest file size.</li>
          <li><strong>Enable OCR</strong> — toggle OCR before exporting to make your PDF searchable (you can select and copy text).</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">How It Works Technically</h2>
        <p>The scanner uses several techniques to produce clean output:</p>
        <ul className="list-disc pl-6 space-y-1">
          <li><strong>Perspective warp</strong> — bilinear interpolation maps the trapezoid-shaped capture to a perfect rectangle</li>
          <li><strong>Resolution upscaling</strong> — outputs at 300 DPI (2480x3508 pixels for A4) regardless of input size</li>
          <li><strong>Adaptive enhancement</strong> — adjusts contrast and applies sharpening for crisp text</li>
          <li><strong>PDF embedding</strong> — each page is embedded as a full-resolution image in the PDF using pdf-lib</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">FixMyFile vs Adobe Scan vs CamScanner</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-[var(--border)] text-sm">
            <thead>
              <tr className="bg-[var(--muted)]">
                <th className="border border-[var(--border)] p-2 text-left">Feature</th>
                <th className="border border-[var(--border)] p-2 text-left">FixMyFile</th>
                <th className="border border-[var(--border)] p-2 text-left">Adobe Scan</th>
                <th className="border border-[var(--border)] p-2 text-left">CamScanner</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-[var(--border)] p-2">Price</td><td className="border border-[var(--border)] p-2 font-medium">Free</td><td className="border border-[var(--border)] p-2">$9.99/mo</td><td className="border border-[var(--border)] p-2">Free (with ads)</td></tr>
              <tr><td className="border border-[var(--border)] p-2">App download</td><td className="border border-[var(--border)] p-2 font-medium">No (web-based)</td><td className="border border-[var(--border)] p-2">Yes</td><td className="border border-[var(--border)] p-2">Yes</td></tr>
              <tr><td className="border border-[var(--border)] p-2">Privacy</td><td className="border border-[var(--border)] p-2 font-medium">100% local</td><td className="border border-[var(--border)] p-2">Uploads to Adobe cloud</td><td className="border border-[var(--border)] p-2">Uploads to server</td></tr>
              <tr><td className="border border-[var(--border)] p-2">OCR</td><td className="border border-[var(--border)] p-2">Yes (optional)</td><td className="border border-[var(--border)] p-2">Yes</td><td className="border border-[var(--border)] p-2">Yes (paid)</td></tr>
              <tr><td className="border border-[var(--border)] p-2">Multi-page</td><td className="border border-[var(--border)] p-2">Yes</td><td className="border border-[var(--border)] p-2">Yes</td><td className="border border-[var(--border)] p-2">Yes</td></tr>
              <tr><td className="border border-[var(--border)] p-2">Watermark</td><td className="border border-[var(--border)] p-2 font-medium">None</td><td className="border border-[var(--border)] p-2">None</td><td className="border border-[var(--border)] p-2">Yes (free tier)</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mt-8">When to Use This</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>Scanning receipts for expense claims</li>
          <li>Digitizing paper documents for filing</li>
          <li>Creating PDF copies of contracts or certificates</li>
          <li>Scanning ID documents for applications</li>
          <li>Archiving handwritten notes</li>
        </ul>

        <div className="mt-8 p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
          <p className="font-semibold">Try it now:</p>
          <p className="text-sm mt-1">
            <Link href="/tools/scan-to-pdf" className="text-[var(--primary)] hover:underline font-medium">Scan to PDF →</Link>
            {" "}— Open on your phone, point at a document, and get a clean PDF in seconds.
          </p>
        </div>
      </div>
    </article>
  );
}
