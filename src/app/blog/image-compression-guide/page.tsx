import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export const metadata = {
  title: "Image Compression Guide: JPEG vs PNG vs WebP vs AVIF — Which Format to Use (2025)",
  description: "Complete guide to image compression formats. Learn when to use JPEG, PNG, WebP, or AVIF for the smallest file size with best quality. Free online image compressor included.",
};

export default function BlogPost() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <Link href="/blog" className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6">
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">Image Compression Guide: JPEG vs PNG vs WebP vs AVIF</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-8">Published: July 11, 2026 • 6 min read</p>

      <div className="prose prose-sm sm:prose-base dark:prose-invert max-w-none space-y-6 text-[var(--foreground)]">
        <p className="text-lg text-[var(--muted-foreground)]">
          Choosing the right image format can reduce your file size by 50-90% without visible quality loss. This guide explains when to use each format and how to compress images effectively.
        </p>

        <h2 className="text-2xl font-bold mt-8">Quick Decision Chart</h2>
        <ul className="list-disc pl-6 space-y-2">
          <li><strong>Photo with no transparency?</strong> → JPEG (or WebP for 30% smaller)</li>
          <li><strong>Image with transparency?</strong> → PNG (or WebP for smaller with transparency)</li>
          <li><strong>Web use, modern browsers?</strong> → WebP (best size-to-quality ratio)</li>
          <li><strong>Maximum compression, bleeding edge?</strong> → AVIF (50% smaller than JPEG)</li>
          <li><strong>Logo, icon, illustration?</strong> → SVG (vector, scales to any size)</li>
          <li><strong>Screenshot of text?</strong> → PNG (lossless preserves sharp text edges)</li>
        </ul>

        <h2 className="text-2xl font-bold mt-8">Format Comparison</h2>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-[var(--border)] text-sm">
            <thead>
              <tr className="bg-[var(--muted)]">
                <th className="border border-[var(--border)] p-2 text-left">Format</th>
                <th className="border border-[var(--border)] p-2 text-left">Type</th>
                <th className="border border-[var(--border)] p-2 text-left">Transparency</th>
                <th className="border border-[var(--border)] p-2 text-left">Best For</th>
                <th className="border border-[var(--border)] p-2 text-left">Browser Support</th>
              </tr>
            </thead>
            <tbody>
              <tr><td className="border border-[var(--border)] p-2 font-medium">JPEG</td><td className="border border-[var(--border)] p-2">Lossy</td><td className="border border-[var(--border)] p-2">No</td><td className="border border-[var(--border)] p-2">Photos</td><td className="border border-[var(--border)] p-2">100%</td></tr>
              <tr><td className="border border-[var(--border)] p-2 font-medium">PNG</td><td className="border border-[var(--border)] p-2">Lossless</td><td className="border border-[var(--border)] p-2">Yes</td><td className="border border-[var(--border)] p-2">Screenshots, logos</td><td className="border border-[var(--border)] p-2">100%</td></tr>
              <tr><td className="border border-[var(--border)] p-2 font-medium">WebP</td><td className="border border-[var(--border)] p-2">Both</td><td className="border border-[var(--border)] p-2">Yes</td><td className="border border-[var(--border)] p-2">Web images</td><td className="border border-[var(--border)] p-2">97%</td></tr>
              <tr><td className="border border-[var(--border)] p-2 font-medium">AVIF</td><td className="border border-[var(--border)] p-2">Both</td><td className="border border-[var(--border)] p-2">Yes</td><td className="border border-[var(--border)] p-2">Maximum compression</td><td className="border border-[var(--border)] p-2">92%</td></tr>
              <tr><td className="border border-[var(--border)] p-2 font-medium">SVG</td><td className="border border-[var(--border)] p-2">Vector</td><td className="border border-[var(--border)] p-2">Yes</td><td className="border border-[var(--border)] p-2">Icons, logos, illustrations</td><td className="border border-[var(--border)] p-2">100%</td></tr>
              <tr><td className="border border-[var(--border)] p-2 font-medium">HEIC</td><td className="border border-[var(--border)] p-2">Lossy</td><td className="border border-[var(--border)] p-2">No</td><td className="border border-[var(--border)] p-2">iPhone photos</td><td className="border border-[var(--border)] p-2">Safari only</td></tr>
            </tbody>
          </table>
        </div>

        <h2 className="text-2xl font-bold mt-8">JPEG — The Universal Photo Format</h2>
        <p>JPEG uses lossy compression that discards details the human eye can barely perceive. At quality 80-85%, most photos look identical to the original while being 10-20x smaller than raw image data.</p>
        <p><strong>When to use:</strong> Photographs, complex images with gradients, any image without transparency.</p>
        <p><strong>When NOT to use:</strong> Text, screenshots, logos, images needing transparency.</p>
        <p><strong>Tip:</strong> Quality 75-85% is the sweet spot. Below 60%, artifacts become visible.</p>

        <h2 className="text-2xl font-bold mt-8">PNG — Lossless Quality, Larger Files</h2>
        <p>PNG uses lossless compression — no quality is lost, ever. This makes it perfect for images with text, sharp edges, and transparency. The trade-off is larger file sizes compared to JPEG.</p>
        <p><strong>When to use:</strong> Screenshots, images with text, logos on transparent backgrounds, UI elements.</p>
        <p><strong>Optimization tip:</strong> PNG-8 (256 colors) is much smaller than PNG-24 (millions of colors). If your image has few colors (icons, simple graphics), PNG-8 can be 80% smaller.</p>

        <h2 className="text-2xl font-bold mt-8">WebP — The Modern Standard</h2>
        <p>Developed by Google, WebP offers 25-35% smaller files than JPEG at equivalent quality, and it supports transparency (unlike JPEG). It&apos;s now supported by 97% of browsers.</p>
        <p><strong>When to use:</strong> All web images. It&apos;s the best all-around format for websites.</p>
        <p><strong>Tip:</strong> If your image would be JPEG, convert to WebP for free size savings. If it would be PNG with transparency, WebP with lossless mode is usually smaller.</p>

        <h2 className="text-2xl font-bold mt-8">AVIF — Maximum Compression (Newer)</h2>
        <p>AVIF is the newest format, offering 50% smaller files than JPEG and 20% smaller than WebP. It&apos;s based on the AV1 video codec. Browser support is now at 92% (Chrome, Firefox, Safari 16+, Edge).</p>
        <p><strong>When to use:</strong> When you need maximum compression and can accept slightly slower encoding. Great for large image galleries and bandwidth-sensitive applications.</p>
        <p><strong>Limitation:</strong> Encoding is slower than JPEG/WebP. Some older browsers don&apos;t support it.</p>

        <h2 className="text-2xl font-bold mt-8">SVG — Scalable Vector Graphics</h2>
        <p>SVG is fundamentally different — it&apos;s code (XML) that describes shapes, not pixels. This means it scales to any size without quality loss and is often tiny in file size for simple graphics.</p>
        <p><strong>When to use:</strong> Logos, icons, illustrations, charts, anything that&apos;s not a photograph.</p>
        <p><strong>Optimization:</strong> Tools like SVGO can reduce SVG file size by 40-60% by removing unnecessary metadata, comments, and simplifying paths. Our <Link href="/tools/image-compress" className="text-[var(--primary)] hover:underline">Image Compressor</Link> includes SVGO optimization.</p>

        <h2 className="text-2xl font-bold mt-8">HEIC — iPhone&apos;s Default Format</h2>
        <p>HEIC (High Efficiency Image Container) is Apple&apos;s default photo format since iPhone 7. It&apos;s ~50% smaller than JPEG but not widely supported outside Apple devices.</p>
        <p><strong>Problem:</strong> Windows, Android, and most websites can&apos;t open HEIC files directly.</p>
        <p><strong>Solution:</strong> Convert HEIC to JPEG or WebP using our <Link href="/tools/image-compress" className="text-[var(--primary)] hover:underline">Image Compressor</Link> — it decodes HEIC locally in your browser.</p>

        <h2 className="text-2xl font-bold mt-8">How to Compress Images on FixMyFile</h2>
        <ol className="list-decimal pl-6 space-y-2">
          <li>Go to <Link href="/tools/image-compress" className="text-[var(--primary)] hover:underline">Image Compressor</Link></li>
          <li>Drop your images (supports all formats above, plus ZIP batches)</li>
          <li>Adjust quality slider (lower = smaller, higher = better)</li>
          <li>Optionally convert to a different format (e.g., PNG → WebP)</li>
          <li>Click Compress — compare before/after with the slider</li>
          <li>Download all as ZIP</li>
        </ol>

        <h2 className="text-2xl font-bold mt-8">Key Takeaways</h2>
        <ul className="list-disc pl-6 space-y-1">
          <li>For photos: use WebP (or JPEG for maximum compatibility)</li>
          <li>For transparency: use WebP or PNG</li>
          <li>For maximum compression: use AVIF</li>
          <li>For vectors/logos: use SVG</li>
          <li>Quality 75-85% is the sweet spot for lossy formats</li>
          <li>Always compress images before uploading to websites — page speed directly affects SEO ranking</li>
        </ul>

        <div className="mt-8 p-4 rounded-xl bg-[var(--primary)]/10 border border-[var(--primary)]/20">
          <p className="font-semibold">Compress your images now:</p>
          <p className="text-sm mt-1">
            <Link href="/tools/image-compress" className="text-[var(--primary)] hover:underline font-medium">Image Compressor →</Link>
            {" "}— JPEG, PNG, WebP, AVIF, HEIC, SVG. 100% free, 100% local, no limits.
          </p>
        </div>
      </div>
    </article>
  );
}
