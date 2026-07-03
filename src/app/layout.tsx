import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWARegister from "@/components/PWARegister";
import InstallBanner from "@/components/InstallBanner";

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
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-screen flex flex-col">
        <PWARegister />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <InstallBanner />
      </body>
    </html>
  );
}
