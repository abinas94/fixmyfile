import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import ToolCard from "@/components/ToolCard";
import JsonLd from "@/components/JsonLd";
import { tools } from "@/lib/tools-config";
import { categoryContent, getCategoryContent } from "@/lib/category-content";

export function generateStaticParams() {
  return categoryContent.map((c) => ({ slug: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const c = getCategoryContent(slug);
  if (!c) return {};
  return {
    title: c.title,
    description: c.description,
    alternates: { canonical: `/category/${c.slug}` },
    openGraph: {
      type: "website",
      url: `https://fixmyfile.co.in/category/${c.slug}`,
      title: c.title,
      description: c.description,
    },
  };
}

export default async function CategoryHub({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const c = getCategoryContent(slug);
  if (!c) notFound();

  const categoryTools = tools.filter((t) => t.category === c.category);

  const breadcrumb = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      { "@type": "ListItem", position: 1, name: "Home", item: "https://fixmyfile.co.in" },
      {
        "@type": "ListItem",
        position: 2,
        name: c.name,
        item: `https://fixmyfile.co.in/category/${c.slug}`,
      },
    ],
  };
  const itemList = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: c.heading,
    itemListElement: categoryTools.map((t, i) => ({
      "@type": "ListItem",
      position: i + 1,
      name: t.name,
      url: `https://fixmyfile.co.in${t.href}`,
    })),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={[breadcrumb, itemList]} />
      <nav className="flex items-center gap-1 text-sm text-[var(--muted-foreground)] mb-4">
        <Link href="/" className="hover:text-[var(--foreground)]">Home</Link>
        <span>/</span>
        <span className="text-[var(--foreground)]">{c.name}</span>
      </nav>

      <h1 className="text-3xl sm:text-4xl font-bold mb-4">{c.heading}</h1>
      <p className="text-[var(--muted-foreground)] max-w-3xl leading-relaxed mb-8">
        {c.intro}
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {categoryTools.map((tool) => (
          <ToolCard key={tool.id} tool={tool} />
        ))}
      </div>

      {c.slug === "form-upload-tools" && (
        <section className="mt-12">
          <h2 className="text-2xl font-bold mb-4">Guides for form uploads</h2>
          <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {[
              { href: "/blog/resize-photo-to-20kb-50kb-100kb", label: "Resize a photo to 20KB, 50KB or 100KB" },
              { href: "/blog/passport-size-photo-requirements-india", label: "Passport size photo requirements in India" },
              { href: "/blog/resize-signature-for-online-application-forms", label: "Prepare your signature for online forms" },
              { href: "/blog/photo-signature-upload-errors-and-fixes", label: "9 upload errors and how to fix them" },
              { href: "/blog/compress-pdf-for-form-upload", label: "Compress a PDF for form upload" },
            ].map((g) => (
              <li key={g.href}>
                <Link
                  href={g.href}
                  className="block p-4 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm font-medium hover:border-[var(--primary)] transition-colors"
                >
                  {g.label}
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}

      <p className="text-sm text-[var(--muted-foreground)] mt-10">
        {categoryTools.length} free {c.name.toLowerCase()} — all private, with most running entirely in your browser.{" "}
        <Link href="/" className="text-[var(--primary)] hover:underline">
          Browse all FixMyFile tools
        </Link>
        .
      </p>
    </div>
  );
}
