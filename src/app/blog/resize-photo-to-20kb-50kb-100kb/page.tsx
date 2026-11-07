import Link from "next/link";
import GuideArticle from "@/components/GuideArticle";

const title = "How to Resize a Photo to 20KB, 50KB or 100KB for Online Form Upload";
const description =
  "Step-by-step guide to reducing a photo to an exact file size such as 20KB, 50KB or 100KB for exam, job and government form uploads, without making it blurry. Free, in your browser.";

export const metadata = {
  title: `${title} (2026) | FixMyFile`,
  description,
  alternates: { canonical: "/blog/resize-photo-to-20kb-50kb-100kb" },
};

export default function Post() {
  return (
    <GuideArticle
      slug="resize-photo-to-20kb-50kb-100kb"
      title={title}
      description={description}
      published="October 21, 2026"
      isoDate="2026-10-21"
      readTime="7 min read"
      related={[
        { href: "/tools/resize-to-kb", label: "Resize Image to KB" },
        { href: "/tools/image-resize", label: "Resize Image (exact pixels)" },
        { href: "/tools/image-crop", label: "Crop Image" },
        { href: "/tools/image-convert", label: "Convert Image Format" },
      ]}
    >
      <p className="text-lg text-[var(--muted-foreground)]">
        Open almost any exam, job or scholarship application in India and you meet the same wall: “Upload photo, size
        between 20 KB and 50 KB.” The photo on your phone is 3 MB, and the portal simply refuses it. This guide
        explains why that happens and shows how to get a small, clear photo that the portal accepts the first time.
      </p>

      <h2>Why portals ask for such small files</h2>
      <p>
        Application portals receive lakhs of photos and signatures in a short window. Capping each upload at a few
        tens of kilobytes keeps storage and bandwidth manageable, and it makes admit cards and ID printouts load
        quickly. The limit is a technical rule of the portal, not a judgement on photo quality, so the goal is simply
        to fit under it while staying recognisable.
      </p>

      <h2>The three things that decide file size</h2>
      <p>Understanding these makes the whole process predictable instead of trial and error.</p>
      <ul>
        <li>
          <strong>Pixel dimensions.</strong> A phone photo of 3000 × 4000 pixels holds 12 million pixels. A passport
          style photo at 413 × 531 pixels holds about 219,000, which is roughly 55 times fewer. Cutting the dimensions
          is the single biggest saving.
        </li>
        <li>
          <strong>Compression quality.</strong> JPEG discards fine detail the eye barely notices. Lower quality means
          a smaller file, but go too low and you see blocky patches, especially around the face and hair edges.
        </li>
        <li>
          <strong>Format.</strong> JPG is the safe choice for photographs and is what most portals expect. PNG is
          lossless, so it is far larger for the same picture. WebP is smaller still but many portals do not accept it.
        </li>
      </ul>

      <h2>Step-by-step: resize a photo to an exact size in KB</h2>
      <ol>
        <li>
          <strong>Read the notification first.</strong> Note the allowed format (usually JPG or JPEG), the minimum and
          maximum size in KB, any required pixel size such as 200 × 230, and the background colour. Everything below
          depends on these numbers.
        </li>
        <li>
          <strong>Crop to the right shape.</strong> Use the <Link href="/tools/image-crop">Crop Image tool</Link> so
          the face is centred with a little space above the head. Cropping before compressing means no bytes are
          wasted on parts of the picture you will not use.
        </li>
        <li>
          <strong>Set exact pixels only if the portal demands it.</strong> If the form specifies dimensions, use{" "}
          <Link href="/tools/image-resize">Resize Image</Link> to set them. If it only specifies KB, skip this step.
        </li>
        <li>
          <strong>Compress to the target size.</strong> Open{" "}
          <Link href="/tools/resize-to-kb">Resize Image to KB</Link>, upload the photo, and choose a preset such as 20,
          50 or 100 KB, or type your own value. Pick JPG for maximum compatibility. If the portal also fixes the
          pixel size, switch off “Reduce dimensions if needed” so the dimensions you set in step 3 stay unchanged.
        </li>
        <li>
          <strong>Check the result.</strong> The tool shows the final size, the dimensions and the quality it
          used. Zoom into the preview and check that the eyes and the outline of the face are still clean, then
          download the file.
        </li>
      </ol>
      <p>
        The tool searches for the highest quality that still fits under your limit, so the output tends to land
        close to the number you choose rather than far below it. That helps with portals that also have a minimum
        size.
      </p>

      <h2>Typical limits you will see</h2>
      <p>
        These are common patterns on Indian application portals, not rules for any particular exam. Notifications
        change from year to year, so always follow the latest one.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[var(--border)] text-sm">
          <thead>
            <tr className="bg-[var(--muted)]">
              <th className="border border-[var(--border)] p-2 text-left">Item</th>
              <th className="border border-[var(--border)] p-2 text-left">Commonly requested size</th>
              <th className="border border-[var(--border)] p-2 text-left">Tip</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[var(--border)] p-2">Passport-style photo</td>
              <td className="border border-[var(--border)] p-2">20–50 KB or 50–100 KB</td>
              <td className="border border-[var(--border)] p-2">Crop first, then compress</td>
            </tr>
            <tr>
              <td className="border border-[var(--border)] p-2">Signature</td>
              <td className="border border-[var(--border)] p-2">10–20 KB, sometimes up to 50 KB</td>
              <td className="border border-[var(--border)] p-2">Keep ink dark on a white background</td>
            </tr>
            <tr>
              <td className="border border-[var(--border)] p-2">Scanned documents</td>
              <td className="border border-[var(--border)] p-2">Often 100–500 KB as PDF</td>
              <td className="border border-[var(--border)] p-2">See our PDF guide linked below</td>
            </tr>
          </tbody>
        </table>
      </div>

      <h2>Common mistakes that cause rejections</h2>
      <ul>
        <li>
          <strong>Renaming instead of converting.</strong> Changing photo.png to photo.jpg does not change the
          format inside. Convert properly with the <Link href="/tools/image-convert">Convert Image tool</Link>.
        </li>
        <li>
          <strong>Taking a screenshot of the photo.</strong> It lowers the resolution and adds interface edges.
          Always start from the original file.
        </li>
        <li>
          <strong>Enlarging a tiny photo.</strong> Making a small picture bigger does not add detail. It only adds
          blur. Start from the best original you have.
        </li>
        <li>
          <strong>Going far below the minimum.</strong> Some portals reject files that are too small as well as too
          large. Aim just under the maximum rather than as low as possible.
        </li>
      </ul>

      <h2>If the photo is still too big or too blurry</h2>
      <p>
        If you cannot reach the target without the face looking soft, the original is probably the problem. Retake
        the picture in daylight against a plain wall, hold the phone steady and avoid digital zoom. A sharp,
        evenly lit original compresses far better than a dim, grainy one, because noise is exactly what uses up
        bytes. For a 10 or 20 KB target, a plain light background also helps a lot, since flat areas compress
        almost for free.
      </p>

      <h2>Keep your files private</h2>
      <p>
        Photos and signatures are identity documents. FixMyFile processes them inside your browser, so they are not
        sent to a server. When you use any other online tool, check whether it uploads your file before you
        submit something personal.
      </p>

      <p>
        Also read: <Link href="/blog/resize-signature-for-online-application-forms">how to resize a signature</Link>,{" "}
        <Link href="/blog/photo-signature-upload-errors-and-fixes">fixing upload errors</Link> and{" "}
        <Link href="/blog/compress-pdf-for-form-upload">compressing PDFs for form upload</Link>.
      </p>
    </GuideArticle>
  );
}
