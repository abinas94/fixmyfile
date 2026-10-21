// Renders a JSON-LD structured data script. Server-rendered so crawlers see it.
export default function JsonLd({ data }: { data: object | object[] }) {
  return (
    <script
      type="application/ld+json"
      // Structured data is static, generated from our own config.
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}
