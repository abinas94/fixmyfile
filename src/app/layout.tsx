import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "FixMyFile - Free Online File Tools | PDF, Image, OCR, Documents",
  description:
    "Free online tools to fix, convert, and edit your files. PDF tools, image editor, OCR text extraction, document formatter, calculators — all in your browser. No uploads, no sign-up.",
  keywords: [
    "fix my file",
    "PDF tools",
    "merge PDF",
    "compress PDF",
    "OCR",
    "image to text",
    "document formatter",
    "image compress",
    "word to PDF",
    "free online tools",
    "EMI calculator",
    "passport photo maker",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="google-site-verification" content="hgjtr6W6nfiR-2ioKed_mlxNyWl_RjgACA_2nOADDpo" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2820111631429604" crossOrigin="anonymous"></script>
      </head>
      <body className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
