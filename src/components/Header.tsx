"use client";

import Link from "next/link";
import { useTheme } from "@/hooks/useTheme";
import { Sun, Moon, Menu, X } from "lucide-react";
import { useState } from "react";
import Logo from "./Logo";

export default function Header() {
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

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
