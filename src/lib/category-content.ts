// SEO content for category hub pages. Keyed by the category id used in tools-config.
export type CategoryContent = {
  slug: string;
  category: string; // matches ToolConfig.category
  name: string;
  title: string; // <title>
  description: string; // meta description
  heading: string;
  intro: string;
};

export const categoryContent: CategoryContent[] = [
  {
    slug: "pdf-tools",
    category: "pdf",
    name: "PDF Tools",
    title: "Free PDF Tools Online - Merge, Split, Compress, Convert | FixMyFile",
    description:
      "Free online PDF tools that work in your browser. Merge, split, compress, rotate, sign, protect and convert PDFs to Word, Excel, images and more. No uploads, no sign-up.",
    heading: "Free PDF Tools",
    intro:
      "Everything you need to work with PDF files, free and in your browser. Merge several PDFs into one, split a large file into pages, compress a PDF for email or a portal upload, rotate or crop pages, add page numbers or a watermark, sign documents, protect or unlock with a password, and convert between PDF and Word, Excel, PowerPoint or images. Most tools run entirely on your device, so your documents are never uploaded to a server.",
  },
  {
    slug: "image-tools",
    category: "image",
    name: "Image Tools",
    title: "Free Image Tools Online - Resize, Compress, Convert, Crop | FixMyFile",
    description:
      "Free browser-based image tools. Resize to an exact KB size for form uploads, compress, crop, convert PNG/JPG/WebP, remove backgrounds, make passport photos and merge images. No uploads.",
    heading: "Free Image Tools",
    intro:
      "Edit and optimize images without installing anything. Resize a photo or signature to an exact file size like 20KB, 50KB or 100KB for exam and government form uploads, compress images, crop and rotate, convert between PNG, JPG and WebP, remove backgrounds, make passport-size photos, and merge pictures into one. Everything runs locally in your browser, so your images stay private.",
  },
  {
    slug: "form-upload-tools",
    category: "image",
    name: "Form Upload Tools",
    title: "Photo & Signature Resize for Form Uploads - 20KB, 50KB, 100KB | FixMyFile",
    description:
      "Resize photos and signatures to exact KB limits for exam, job, passport and government portal uploads. Make passport photos, compress PDFs for forms. Free, private, no upload.",
    heading: "Form Upload Tools (India)",
    intro:
      "Indian exam, banking, passport and government portals demand photos and signatures within exact size limits — often 20KB to 100KB for a photo and 10KB to 50KB for a signature. These free tools hit those limits precisely: resize an image to a target KB size, crop a passport-size photo, shrink a signature, and compress a PDF small enough to upload. All processing happens in your browser, so your documents never leave your device.",
  },
  {
    slug: "ocr-tools",
    category: "ocr",
    name: "OCR & Text Extraction",
    title: "Free OCR Online - Extract Text from Images & PDFs | FixMyFile",
    description:
      "Free OCR tools to extract text from images, scanned PDFs, receipts and tables. Supports 50+ languages. Runs in your browser — no uploads, no sign-up.",
    heading: "OCR & Text Extraction",
    intro:
      "Turn pictures and scanned documents into editable text. Extract text from images and scanned PDFs in over 50 languages, batch-process many images at once, pull data from receipts, and convert tables in images into spreadsheet-ready CSV. The OCR runs in your browser, so your files are processed on your device.",
  },
  {
    slug: "document-tools",
    category: "documents",
    name: "Documents & Text",
    title: "Free Document & Text Tools Online | FixMyFile",
    description:
      "Free document and text tools: format documents, convert Word and PowerPoint, count words, change case, find and replace, compare text and remove duplicates. Browser-based, no upload.",
    heading: "Document & Text Tools",
    intro:
      "Clean up and convert documents and text without software. Format documents to APA, IEEE or corporate styles, convert Word and PowerPoint to PDF and back, count words and characters, change case, find and replace, compare two texts, sort lines and remove duplicates. Everything works in your browser.",
  },
  {
    slug: "calculators",
    category: "calculators",
    name: "Calculators",
    title: "Free Online Calculators - EMI, GST, SIP | FixMyFile",
    description:
      "Free financial calculators for India: EMI calculator with loan affordability, GST calculator for 5/12/18/28% and SIP mutual fund returns. Instant, in your browser.",
    heading: "Calculators",
    intro:
      "Quick, accurate calculators for everyday money decisions in India. Work out loan EMIs and affordability, add or remove GST at 5%, 12%, 18% or 28%, and project mutual fund returns with the SIP calculator. All calculations run instantly in your browser.",
  },
  {
    slug: "developer-tools",
    category: "dev-tools",
    name: "Developer Tools",
    title: "Free Developer Tools Online - JSON, Base64, QR, Color | FixMyFile",
    description:
      "Free developer utilities: JSON formatter, Base64 encode/decode, URL encoder, color picker, QR code generator and scanner, regex tester and more. Browser-based, no upload.",
    heading: "Developer Tools",
    intro:
      "A handy set of utilities for developers and power users. Format and validate JSON, encode and decode Base64 and URLs, generate and scan QR codes, pick colors and build gradients, test regular expressions, generate hashes and passwords, and convert timestamps. All free and running in your browser.",
  },
];

export function getCategoryContent(slug: string) {
  return categoryContent.find((c) => c.slug === slug);
}
