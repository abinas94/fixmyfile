import Link from "next/link";
import GuideArticle from "@/components/GuideArticle";

const title = "How to Compress a PDF to Under 100KB, 200KB or 500KB for Form Uploads";
const description =
  "Practical ways to shrink scanned certificates and documents to the PDF size an online form allows: scan settings, compression, splitting and merging, and how to avoid unreadable results.";

export const metadata = {
  title: `${title} (2026) | FixMyFile`,
  description,
  alternates: { canonical: "/blog/compress-pdf-for-form-upload" },
};

export default function Post() {
  return (
    <GuideArticle
      slug="compress-pdf-for-form-upload"
      title={title}
      description={description}
      published="October 21, 2026"
      isoDate="2026-10-21"
      readTime="8 min read"
      related={[
        { href: "/tools/compress", label: "Compress PDF" },
        { href: "/tools/image-to-pdf", label: "Image to PDF" },
        { href: "/tools/merge", label: "Merge PDF" },
        { href: "/tools/split", label: "Split PDF" },
        { href: "/tools/extract-pages", label: "Extract Pages" },
        { href: "/tools/scan-to-pdf", label: "Scan to PDF" },
      ]}
    >
      <p className="text-lg text-[var(--muted-foreground)]">
        Certificates, mark sheets, ID proofs and experience letters often have to be uploaded as a single PDF under a
        tight limit, commonly somewhere between 100 KB and 1 MB. A scan from a phone or office scanner is usually many
        times larger. The right approach depends on what is making the file big, so start with that.
      </p>

      <h2>What makes a PDF large?</h2>
      <ul>
        <li>
          <strong>Scanned pages are pictures.</strong> A page scanned at high resolution in colour can be several
          megabytes on its own. This is by far the most common cause for form uploads.
        </li>
        <li>
          <strong>Embedded fonts and images.</strong> Documents exported from Word or design programs may carry large
          images or complete font files.
        </li>
        <li>
          <strong>Page count.</strong> Ten pages cost roughly ten times what one does. If the form needs only certain
          pages, removing the rest is the cleanest saving.
        </li>
      </ul>

      <h2>Method 1: scan or photograph it smartly</h2>
      <p>
        Prevention beats repair. If you are about to scan documents, set up the scan so it is small from the start.
      </p>
      <ul>
        <li>
          Choose around <strong>150 DPI</strong>. It is plenty for reading text on screen, and much lighter than 300 or
          600 DPI.
        </li>
        <li>Use <strong>greyscale or black and white</strong> for text-only pages. Keep colour only if the colour is part of the proof.</li>
        <li>Photograph pages flat, in daylight, from directly above, so the app does not need to stretch or sharpen them.</li>
        <li>
          Turn photos into a PDF with <Link href="/tools/image-to-pdf">Image to PDF</Link> or{" "}
          <Link href="/tools/scan-to-pdf">Scan to PDF</Link>.
        </li>
      </ul>

      <h2>Method 2: compress the PDF</h2>
      <ol>
        <li>
          Open <Link href="/tools/compress">Compress PDF</Link> and upload your file.
        </li>
        <li>
          Pick a compression level. Start with the balanced option and check the result. Choose the strongest option
          only if you still exceed the limit.
        </li>
        <li>Compress, download, and note the new size shown.</li>
        <li>
          Open the compressed file and read the smallest text on it. Signatures, stamps and dates must remain legible.
        </li>
      </ol>
      <p>
        Strong compression lowers the resolution of the images inside the file, so keep your original and compare. On
        some files it can also turn pages into images, which means the text may no longer be selectable. That is
        fine for most uploads, but if the form requires searchable text, test the result.
      </p>

      <h2>Method 3: send fewer pages</h2>
      <p>
        If the portal asks for specific documents, do not upload the whole bundle. Use{" "}
        <Link href="/tools/extract-pages">Extract Pages</Link> to keep only the pages needed, or{" "}
        <Link href="/tools/split">Split PDF</Link> to separate one big file into separate documents when the portal has
        separate upload boxes for each certificate.
      </p>

      <h2>Method 4: merge in the right order</h2>
      <p>
        When a portal allows only one PDF, combine your documents with <Link href="/tools/merge">Merge PDF</Link>.
        Arrange them in the order the form lists them. Compress each file first, then merge, so you do not have to
        recompress the combined document.
      </p>

      <h2>Which target should you aim for?</h2>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[var(--border)] text-sm">
          <thead>
            <tr className="bg-[var(--muted)]">
              <th className="border border-[var(--border)] p-2 text-left">Limit</th>
              <th className="border border-[var(--border)] p-2 text-left">What usually works</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[var(--border)] p-2">Under 100 KB</td>
              <td className="border border-[var(--border)] p-2">
                One to two pages, greyscale scan at about 150 DPI, then strong compression
              </td>
            </tr>
            <tr>
              <td className="border border-[var(--border)] p-2">Under 200–300 KB</td>
              <td className="border border-[var(--border)] p-2">
                A few pages, greyscale or light colour, balanced compression
              </td>
            </tr>
            <tr>
              <td className="border border-[var(--border)] p-2">Under 500 KB–1 MB</td>
              <td className="border border-[var(--border)] p-2">
                Several pages, colour where needed, light to balanced compression
              </td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        These are rough guides, since results depend heavily on the content. A page of plain text compresses far more
        than one full of photographs.
      </p>

      <h2>Common problems and fixes</h2>
      <ul>
        <li>
          <strong>The file barely shrinks.</strong> It is probably already optimised, or mostly text. Try rescanning at a
          lower DPI, or reduce the number of pages.
        </li>
        <li>
          <strong>Text is unreadable after compression.</strong> Go back to the original and use a lighter setting, or
          split the document and compress each part separately.
        </li>
        <li>
          <strong>The portal rejects a password-protected PDF.</strong> Remove the password first with{" "}
          <Link href="/tools/unlock-pdf">Unlock PDF</Link> if you own the file, then upload it.
        </li>
        <li>
          <strong>The file is above the limit by a small amount.</strong> Remove a blank or cover page, or crop empty
          margins.
        </li>
      </ul>

      <h2>A note on privacy</h2>
      <p>
        Educational certificates and ID proofs are sensitive. Merging, splitting, image-to-PDF and page extraction run
        in your browser. Some compression runs may use a secure server for better results, in which case the file is
        deleted after processing. If a document is highly sensitive, keep that in mind and prefer the local tools.
      </p>

      <p>
        Related guides: <Link href="/blog/resize-photo-to-20kb-50kb-100kb">resize a photo to a target KB size</Link> and{" "}
        <Link href="/blog/photo-signature-upload-errors-and-fixes">fix common upload errors</Link>.
      </p>
    </GuideArticle>
  );
}
