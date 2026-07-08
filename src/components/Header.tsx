"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Menu, X, Download } from "lucide-react";
import { useState, useEffect } from "react";
import Logo from "./Logo";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [canInstall, setCanInstall] = useState(false);

  useEffect(() => {
    // Don't show if already installed
    if (window.matchMedia("(display-mode: standalone)").matches) return;

    const handler = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setCanInstall(true);
    };

    window.addEventListener("beforeinstallprompt", handler);

    // For iOS/Safari — show install button with instructions
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    if (isIOS || isSafari) {
      setCanInstall(true);
    }

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      await deferredPrompt.userChoice;
      setDeferredPrompt(null);
      setCanInstall(false);
    } else {
      alert("To install:\n\n• Android Chrome: Tap ⋮ menu → 'Install app'\n• iPhone Safari: Tap Share → 'Add to Home Screen'\n• Desktop Chrome: Click ⊕ in address bar");
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="group">
            <Logo size="default" />
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            <Link
              href="/"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              All Tools
            </Link>
            <Link
              href="/blog"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Blog
            </Link>
            <Link
              href="/tools/pipeline"
              className="text-sm font-medium text-[var(--muted-foreground)] hover:text-[var(--foreground)] transition-colors"
            >
              Pipeline
            </Link>
            {canInstall && (
              <button
                onClick={handleInstall}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white text-sm font-semibold shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                Install App
              </button>
            )}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-lg hover:bg-[var(--accent)] transition-colors"
              aria-label="Toggle theme"
            >
              {theme === "light" ? (
                <Moon className="w-5 h-5" />
              ) : (
                <Sun className="w-5 h-5" />
              )}
            </button>
          </nav>

          {/* Mobile menu button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-[var(--accent)]"
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-5 h-5" />
            ) : (
              <Menu className="w-5 h-5" />
            )}
          </button>
        </div>

        {/* Mobile Nav */}
        {mobileMenuOpen && (
          <div className="md:hidden pb-4 border-t border-[var(--border)] pt-4">
            <nav className="flex flex-col gap-3">
              <Link
                href="/"
                className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-[var(--accent)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                All Tools
              </Link>
              <Link
                href="/tools/pipeline"
                className="text-sm font-medium px-3 py-2 rounded-lg hover:bg-[var(--accent)]"
                onClick={() => setMobileMenuOpen(false)}
              >
                Pipeline
              </Link>
              {canInstall && (
                <button
                  onClick={() => { handleInstall(); setMobileMenuOpen(false); }}
                  className="flex items-center gap-2 text-sm font-semibold px-3 py-2.5 rounded-lg bg-gradient-to-r from-orange-500 to-pink-500 text-white shadow-md w-full text-left"
                >
                  <Download className="w-4 h-4" />
                  Install App
                </button>
              )}
              <button
                onClick={toggleTheme}
                className="flex items-center gap-2 text-sm font-medium px-3 py-2 rounded-lg hover:bg-[var(--accent)] w-full text-left"
              >
                {theme === "light" ? (
                  <Moon className="w-4 h-4" />
                ) : (
                  <Sun className="w-4 h-4" />
                )}
                {theme === "light" ? "Dark Mode" : "Light Mode"}
              </button>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
