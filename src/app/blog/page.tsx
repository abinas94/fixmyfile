"use client";

import Link from "next/link";
import { ArrowRight, FileText } from "lucide-react";

const posts = [
  {
    slug: "protect-pdf-with-password",
    title: "How to Protect PDF with Password Online Free (2025)",
    description: "Add AES-256 encryption to your PDF files in seconds. Secure confidential documents before sharing via email or cloud storage.",
    date: "July 22, 2026",
    readTime: "4 min read",
  },
  {
    slug: "unlock-pdf-remove-password",
    title: "How to Unlock PDF & Remove Password Online Free (2025)",
    description: "Remove password protection from PDFs you own. Unlock editing, printing, and copying restrictions instantly.",
    date: "July 22, 2026",
    readTime: "3 min read",
  },
  {
    slug: "convert-pdf-to-excel-free",
    title: "How to Convert PDF to Excel Online Free (2025)",
    description: "Extract tables and data from PDF files into editable Excel spreadsheets. Perfect for bank statements, invoices, and reports.",
    date: "July 22, 2026",
    readTime: "4 min read",
  },
  {
    slug: "convert-pdf-to-powerpoint",
    title: "How to Convert PDF to PowerPoint Online Free (2025)",
    description: "Turn PDF documents into editable PowerPoint slides. Reuse content in presentations without recreating from scratch.",
    date: "July 22, 2026",
    readTime: "4 min read",
  },
  {
    slug: "convert-word-to-pdf-free",
    title: "How to Convert Word to PDF Online Free (2025)",
    description: "Convert .docx documents to PDF with perfect formatting. Ideal for resumes, reports, contracts, and assignments.",
    date: "July 22, 2026",
    readTime: "3 min read",
  },
  {
    slug: "compress-powerpoint-reduce-size",
    title: "How to Compress PowerPoint Files Online Free (2025)",
    description: "Reduce large PPT/PPTX file sizes for email. Compress images and optimize presentations without losing quality.",
    date: "July 22, 2026",
    readTime: "4 min read",
  },
  {
    slug: "convert-ppt-to-pdf-free",
    title: "How to Convert PowerPoint to PDF Online Free (2025)",
    description: "Convert PPT slides to PDF for universal sharing. Preserve layouts, fonts, and images perfectly.",
    date: "July 22, 2026",
    readTime: "3 min read",
  },
  {
    slug: "merge-pdf-files-online",
    title: "How to Merge PDF Files Online Free Without Uploading (2025)",
    description: "Combine multiple PDFs into one document. 100% private — files never leave your browser. No sign-up, no limits.",
    date: "July 22, 2026",
    readTime: "4 min read",
  },
  {
    slug: "ocr-extract-text-from-images",
    title: "OCR: How to Extract Text from Images Online Free (2025)",
    description: "Extract text from photos, screenshots, and scanned documents using free OCR. Supports 100+ languages, runs locally.",
    date: "July 22, 2026",
    readTime: "5 min read",
  },
  {
    slug: "scan-to-pdf-phone-camera",
    title: "Scan Documents to PDF With Phone Camera — Free, No App (2025)",
    description: "Use your phone camera as a document scanner. Create clean PDFs with auto-enhancement. No app download needed.",
    date: "July 22, 2026",
    readTime: "4 min read",
  },
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
