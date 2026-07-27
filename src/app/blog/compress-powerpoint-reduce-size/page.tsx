import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "How to Compress PowerPoint Files Online Free (2025) | FixMyFile",
  description: "Reduce PowerPoint file size online for free. Compress large PPT/PPTX presentations for email attachments. No software needed.",
};

export default function CompressPPTPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">How to Compress PowerPoint Files Online Free (2025)</h1>
      <p className="text-[var(--muted-foreground)] mb-8">July 22, 2026 • 4 min read</p>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-[var(--foreground)]">
        <p className="text-lg">PowerPoint presentations with high-res images, videos, or animations can easily grow to 50-200MB. Too large for email, slow to share. Here&apos;s how to compress them for free.</p>

        <h2 className="text-2xl font-bold mt-8">Why Are PPT Files So Large?</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>High-resolution images</strong> — phone photos (4-12MB each) quickly add up</li>
          <li><strong>Embedded videos</strong> — even short clips take massive space</li>
          <li><strong>Unused slide masters</strong> — leftover templates bloat the file</li>
          <li><strong>Copy-paste from web</strong> — images pasted from browser retain full resolution</li>
          <li><strong>Embedded fonts</strong> — custom fonts increase size significantly</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">How to Compress (Step-by-Step)</h2>
        <ol className="list-decimal list-inside space-y-3 pl-4">
          <li>Open <Link href="/tools/ppt-compress" className="text-[var(--primary)] underline">FixMyFile Compress PPT</Link></li>
          <li>Upload your .pptx file</li>
          <li>The tool compresses images and optimizes the file</li>
          <li>Download the smaller version</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">How Much Compression to Expect</h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="border-b border-[var(--border)]">
                <th className="text-left py-2 pr-4">Original Size</th>
                <th className="text-left py-2 pr-4">Typical Compressed Size</th>
                <th className="text-left py-2">Reduction</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4">10 MB</td><td className="py-2 pr-4">4-6 MB</td><td className="py-2">40-60%</td></tr>
              <tr className="border-b border-[var(--border)]"><td className="py-2 pr-4">50 MB</td><td className="py-2 pr-4">15-25 MB</td><td className="py-2">50-70%</td></tr>
              <tr><td className="py-2 pr-4">100 MB</td><td className="py-2 pr-4">30-50 MB</td><td className="py-2">50-70%</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-sm text-[var(--muted-foreground)]">Results vary based on image content. Text-heavy slides compress less.</p>

        <h2 className="text-2xl font-bold mt-8">Email Attachment Limits</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Gmail</strong> — 25 MB limit</li>
          <li><strong>Outlook</strong> — 20 MB limit</li>
          <li><strong>Yahoo Mail</strong> — 25 MB limit</li>
        </ul>
        <p>If your compressed file is still too large, consider converting to PDF first using our <Link href="/tools/ppt-to-pdf" className="text-[var(--primary)] underline">PPT to PDF tool</Link>.</p>

        <h2 className="text-2xl font-bold mt-8">Manual Tips to Reduce PPT Size</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Replace high-res photos with compressed versions</li>
          <li>Link videos instead of embedding them</li>
          <li>Delete unused slide layouts and masters</li>
          <li>Use JPEG instead of PNG for photos (PNG is better for screenshots/text)</li>
          <li>Crop images within PowerPoint (then &quot;Compress Pictures&quot;)</li>
        </ul>

        <div className="mt-10 p-6 rounded-2xl bg-[var(--muted)] border border-[var(--border)] text-center">
          <p className="font-semibold mb-2">Shrink your PPT for email — free, instant</p>
          <Link href="/tools/ppt-compress" className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90">
            Compress PowerPoint →
          </Link>
        </div>
      </div>
    </article>
  );
}
