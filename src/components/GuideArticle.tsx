import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import JsonLd from "@/components/JsonLd";

type RelatedLink = { href: string; label: string };

export default function GuideArticle({
  slug,
  title,
  description,
  published,
  isoDate,
  readTime,
  related,
  children,
}: {
  slug: string;
  title: string;
  description: string;
  published: string;
  isoDate: string;
  readTime: string;
  related: RelatedLink[];
  children: React.ReactNode;
}) {
  const url = `https://fixmyfile.co.in/blog/${slug}`;
  const schema = [
    {
      "@context": "https://schema.org",
      "@type": "Article",
      headline: title,
      description,
      datePublished: isoDate,
      dateModified: isoDate,
      mainEntityOfPage: url,
      author: { "@type": "Organization", name: "FixMyFile", url: "https://fixmyfile.co.in" },
      publisher: {
        "@type": "Organization",
        name: "FixMyFile",
        logo: { "@type": "ImageObject", url: "https://fixmyfile.co.in/icons/icon-192.svg" },
      },
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Home", item: "https://fixmyfile.co.in" },
        { "@type": "ListItem", position: 2, name: "Blog", item: "https://fixmyfile.co.in/blog" },
        { "@type": "ListItem", position: 3, name: title, item: url },
      ],
    },
  ];

  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <JsonLd data={schema} />
      <Link
        href="/blog"
        className="inline-flex items-center gap-1 text-sm text-[var(--muted-foreground)] hover:text-[var(--foreground)] mb-6"
      >
        <ArrowLeft className="w-4 h-4" /> Back to Blog
      </Link>
      <h1 className="text-3xl sm:text-4xl font-bold mb-4">{title}</h1>
      <p className="text-sm text-[var(--muted-foreground)] mb-8">
        Published: {published} • {readTime}
      </p>
      <div className="max-w-none space-y-5 text-[var(--foreground)] leading-relaxed [&_h2]:text-2xl [&_h2]:font-bold [&_h2]:mt-10 [&_h3]:text-lg [&_h3]:font-semibold [&_h3]:mt-6 [&_ul]:list-disc [&_ul]:pl-6 [&_ul]:space-y-2 [&_ol]:list-decimal [&_ol]:pl-6 [&_ol]:space-y-2 [&_a]:text-[var(--primary)] [&_a]:underline">
        {children}
      </div>

      <aside className="mt-12 p-5 rounded-2xl border border-[var(--border)] bg-[var(--muted)]">
        <h2 className="text-lg font-bold mb-3">Free tools mentioned in this guide</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {related.map((r) => (
            <li key={r.href}>
              <Link href={r.href} className="text-sm text-[var(--primary)] hover:underline">
                {r.label} →
              </Link>
            </li>
          ))}
        </ul>
        <p className="text-xs text-[var(--muted-foreground)] mt-4">
          All of these run in your browser, so your photos and documents are not uploaded. See all form tools in{" "}
          <Link href="/category/form-upload-tools" className="underline">
            Form Upload Tools
          </Link>
          .
        </p>
      </aside>
    </article>
  );
}
