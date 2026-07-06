import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog - FixMyFile | Free Online File Tools Tips & Guides",
  description: "Tips, guides, and tutorials on using free online tools for PDFs, images, OCR, and documents. No uploads, works in your browser.",
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
