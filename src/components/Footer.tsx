import Link from "next/link";
import { FileText, Shield, Zap, Globe } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-[var(--border)] bg-[var(--muted)]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Features strip */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
              <Shield className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">Privacy First</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                Files processed in your browser
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center">
              <Zap className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">Lightning Fast</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                No upload wait times
              </p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-purple-100 dark:bg-purple-900/30 flex items-center justify-center">
              <Globe className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm font-semibold">100% Free</p>
              <p className="text-xs text-[var(--muted-foreground)]">
                No sign-up required
              </p>
            </div>
          </div>
        </div>

        {/* Tool category hubs — internal linking for SEO */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-2 mb-10 pb-8 border-b border-[var(--border)]">
          <Link href="/category/pdf-tools" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">PDF Tools</Link>
          <Link href="/category/image-tools" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Image Tools</Link>
          <Link href="/category/form-upload-tools" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Form Upload Tools</Link>
          <Link href="/category/ocr-tools" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">OCR &amp; Text</Link>
          <Link href="/category/document-tools" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Document Tools</Link>
          <Link href="/category/calculators" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Calculators</Link>
          <Link href="/category/developer-tools" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Developer Tools</Link>
          <Link href="/blog" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">Blog &amp; Guides</Link>
        </div>

        {/* Bottom */}
        <div className="flex flex-col sm:flex-row items-center justify-between pt-8 border-t border-[var(--border)]">
          <div className="flex items-center gap-2 mb-4 sm:mb-0">
            <div className="w-7 h-7 rounded-md bg-gradient-to-br from-orange-500 via-red-500 to-pink-500 flex items-center justify-center">
              <FileText className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold">
              <span className="text-[var(--foreground)]">FixMy</span>
              <span style={{ background: "linear-gradient(135deg, #f97316, #ef4444, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent" }}>File</span>
            </span>
          </div>
          <div className="flex items-center gap-4 mb-4 sm:mb-0">
            <Link href="/about" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              About
            </Link>
            <Link href="/blog" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Blog
            </Link>
            <Link href="/contact" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Contact Us
            </Link>
            <Link href="/privacy" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Privacy Policy
            </Link>
            <Link href="/terms" className="text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors">
              Terms
            </Link>
          </div>
          <p className="text-sm text-[var(--muted-foreground)]">
            Built with privacy in mind. Your files never leave your device.
          </p>
        </div>

        {/* LaunchBuff badge */}
        <div className="flex justify-center pt-8">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <a href="https://launchbuff.com/products/fixmyfile-erx1t0" target="_blank" rel="noopener noreferrer" title="Featured on LaunchBuff">
            <img src="https://launchbuff.com/badge-featured-dark.svg" alt="Featured on LaunchBuff" width="256" height="80" />
          </a>
        </div>
      </div>
    </footer>
  );
}
