"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

const posts = [
  {
    slug: "how-to-convert-pdf-to-word-free",
    title: "How to Convert PDF to Word Free Without Losing Formatting (2025)",
    description: "Step-by-step guide to converting PDF files to editable Word documents while preserving tables, images, and fonts. Free, no signup required.",
    date: "July 11, 2026",
    readTime: "5 min read",
  },
  {
    slug: "scan-documents-to-pdf-phone",
    title: "How to Scan Documents to PDF With Your Phone (Free, No App)",
    description: "Turn your phone camera into a document scanner. Scan papers, receipts, and documents to clean PDFs with edge detection and enhancement.",
    date: "July 11, 2026",
    readTime: "4 min read",
  },
  {
    slug: "image-compression-guide",
    title: "Image Compression Guide: JPEG vs PNG vs WebP vs AVIF (2025)",
    description: "Complete guide to image formats. Learn when to use each for the smallest file size with best quality.",
    date: "July 11, 2026",
    readTime: "6 min read",
  },
  {
    slug: "compress-pdf-without-uploading",
    title: "How to Compress PDF Without Uploading Files (2025)",
    description: "Learn how to reduce PDF file size for free without uploading your documents to any server. 100% private, works in your browser.",
    date: "July 3, 2025",
    readTime: "3 min read",
  },
  {
    slug: "remove-background-free",
    title: "Remove Image Background for Free — No Photoshop, No Sign-Up",
    description: "Step-by-step guide to removing backgrounds from any image using AI, directly in your browser. Free, no watermark, instant download.",
    date: "July 3, 2025",
    readTime: "4 min read",
  },
  {
    slug: "best-free-pdf-tools-2025",
    title: "5 Best Free Online PDF Tools That Work Without Sign-Up (2025)",
    description: "A comparison of free PDF tools that respect your privacy. No account needed, no file uploads — everything processes locally.",
    date: "July 3, 2025",
    readTime: "5 min read",
  },
];

export default function Blog() {
  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="text-center mb-12">
        <h1 className="text-3xl sm:text-4xl font-bold mb-3">Blog</h1>
        <p className="text-[var(--muted-foreground)]">Tips, guides, and tutorials for working with files online</p>
      </div>

      <div className="space-y-6">
        {posts.map((post) => (
          <Link key={post.slug} href={`/blog/${post.slug}`} className="block group">
            <article className="p-6 rounded-2xl border border-[var(--border)] bg-[var(--card)] hover:shadow-lg hover:border-[var(--primary)]/30 transition-all">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center flex-shrink-0 mt-1">
                  <FileText className="w-5 h-5 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-lg sm:text-xl font-bold group-hover:text-[var(--primary)] transition-colors">{post.title}</h2>
                  <p className="text-sm text-[var(--muted-foreground)] mt-1">{post.description}</p>
                  <div className="flex items-center gap-3 mt-3 text-xs text-[var(--muted-foreground)]">
                    <span>{post.date}</span>
                    <span>•</span>
                    <span>{post.readTime}</span>
                  </div>
                </div>
                <ArrowRight className="w-5 h-5 text-[var(--muted-foreground)] group-hover:text-[var(--primary)] transition-colors flex-shrink-0 mt-2" />
              </div>
            </article>
          </Link>
        ))}
      </div>
    </div>
  );
}
