import type { Metadata } from "next";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWARegister from "@/components/PWARegister";
import InstallBanner from "@/components/InstallBanner";
import { Analytics } from "@vercel/analytics/react";

export const metadata: Metadata = {
  metadataBase: new URL("https://fixmyfile.co.in"),
  alternates: {
    canonical: "/",
  },
  title: "FixMyFile - Free Online File Tools | PDF, Image, OCR, Documents",
  description:
    "Free online tools to fix, convert, and edit your files instantly. PDF merge, split, compress. Image editor, background remover, OCR text extraction. All processing in your browser — no uploads, no sign-up, 100% private.",
  openGraph: {
    type: "website",
    url: "https://fixmyfile.co.in",
    siteName: "FixMyFile",
    title: "FixMyFile - Free Online File Tools | PDF, Image, OCR, Documents",
    description:
      "55+ free browser-based tools for PDFs, images, documents and OCR. No uploads, no sign-up, 100% private.",
  },
  twitter: {
    card: "summary_large_image",
    title: "FixMyFile - Free Online File Tools",
    description:
      "55+ free browser-based tools for PDFs, images, documents and OCR. No uploads, no sign-up.",
  },
  keywords: [
    "PDF tools online free",
    "merge PDF",
    "compress PDF",
    "OCR online",
    "image to text",
    "remove background",
    "document formatter",
    "image compress",
    "pdf to word",
    "free online tools",
    "no upload PDF tools",
    "browser based tools",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([
              {
                "@context": "https://schema.org",
                "@type": "Organization",
                name: "FixMyFile",
                url: "https://fixmyfile.co.in",
                logo: "https://fixmyfile.co.in/icons/icon-192.svg",
                description:
                  "Free browser-based tools for PDFs, images, OCR, documents and Indian form uploads. No uploads, no sign-up.",
              },
              {
                "@context": "https://schema.org",
                "@type": "WebSite",
                name: "FixMyFile",
                url: "https://fixmyfile.co.in",
                potentialAction: {
                  "@type": "SearchAction",
                  target: {
                    "@type": "EntryPoint",
                    urlTemplate: "https://fixmyfile.co.in/?q={search_term_string}",
                  },
                  "query-input": "required name=search_term_string",
                },
              },
            ]),
          }}
        />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-2820111631429604" crossOrigin="anonymous"></script>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#6366f1" />
        <link rel="apple-touch-icon" href="/icons/icon-192.svg" />
      </head>
      <body className="min-h-screen flex flex-col">
        <Analytics />
        <PWARegister />
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
        <InstallBanner />
      </body>
    </html>
  );
}
