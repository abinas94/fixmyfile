import Link from "next/link";
import GuideArticle from "@/components/GuideArticle";

const title = "Passport Size Photo Requirements in India: Sizes, Pixels and How to Print at Home";
const description =
  "Common passport and form photo sizes in India (3.5 x 4.5 cm, 3 x 4 cm, 2.5 x 3.5 cm, 2 x 2 inch) with pixel dimensions, background and face rules, and how to print photos at home at the correct size.";

export const metadata = {
  title: `${title} (2026) | FixMyFile`,
  description,
  alternates: { canonical: "/blog/passport-size-photo-requirements-india" },
};

export default function Post() {
  return (
    <GuideArticle
      slug="passport-size-photo-requirements-india"
      title={title}
      description={description}
      published="October 21, 2026"
      isoDate="2026-10-21"
      readTime="8 min read"
      related={[
        { href: "/tools/passport-photo", label: "Indian Passport Size Photo Maker" },
        { href: "/tools/bg-remover", label: "Background Remover" },
        { href: "/tools/resize-to-kb", label: "Resize Image to KB" },
        { href: "/tools/image-crop", label: "Crop Image" },
      ]}
    >
      <p className="text-lg text-[var(--muted-foreground)]">
        “Passport size photo” sounds like one standard, but in practice different forms ask for different sizes. A
        studio will happily print the wrong one for you. Knowing the common sizes, their pixel equivalents and the basic
        rules lets you make the right photo at home in a few minutes.
      </p>

      <h2>Common photo sizes and their pixel dimensions</h2>
      <p>
        Pixel sizes below assume 300 DPI, the usual print resolution. The conversion is simple: centimetres ÷ 2.54 ×
        300.
      </p>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse border border-[var(--border)] text-sm">
          <thead>
            <tr className="bg-[var(--muted)]">
              <th className="border border-[var(--border)] p-2 text-left">Size</th>
              <th className="border border-[var(--border)] p-2 text-left">Millimetres</th>
              <th className="border border-[var(--border)] p-2 text-left">Pixels at 300 DPI</th>
              <th className="border border-[var(--border)] p-2 text-left">Commonly used for</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td className="border border-[var(--border)] p-2">3.5 × 4.5 cm</td>
              <td className="border border-[var(--border)] p-2">35 × 45 mm</td>
              <td className="border border-[var(--border)] p-2">413 × 531</td>
              <td className="border border-[var(--border)] p-2">Passport style photos, many ID applications</td>
            </tr>
            <tr>
              <td className="border border-[var(--border)] p-2">3 × 4 cm</td>
              <td className="border border-[var(--border)] p-2">30 × 40 mm</td>
              <td className="border border-[var(--border)] p-2">354 × 472</td>
              <td className="border border-[var(--border)] p-2">Many exam and recruitment forms</td>
            </tr>
            <tr>
              <td className="border border-[var(--border)] p-2">2.5 × 3.5 cm</td>
              <td className="border border-[var(--border)] p-2">25 × 35 mm</td>
              <td className="border border-[var(--border)] p-2">295 × 413</td>
              <td className="border border-[var(--border)] p-2">Smaller “mini” or postal size photos</td>
            </tr>
            <tr>
              <td className="border border-[var(--border)] p-2">2 × 2 inch</td>
              <td className="border border-[var(--border)] p-2">51 × 51 mm</td>
              <td className="border border-[var(--border)] p-2">600 × 600</td>
              <td className="border border-[var(--border)] p-2">Square visa-style photos</td>
            </tr>
          </tbody>
        </table>
      </div>
      <p>
        These are general patterns. If a form states a different size, follow the form, because the instructions on
        that specific application are the only rule that counts.
      </p>

      <h2>Basic rules most photo requirements share</h2>
      <ul>
        <li>
          <strong>Plain, light background.</strong> White or very light, with no pattern, shadow or wall edge visible
          behind you.
        </li>
        <li>
          <strong>Face centred and facing the camera.</strong> Both ears and the full face visible, head straight, not
          tilted.
        </li>
        <li>
          <strong>Head fills most of the frame.</strong> Requirements typically ask for the head from chin to the top of
          the hair to take up the large majority of the photo height. Too much empty space above the head is a
          common reason for rejection.
        </li>
        <li>
          <strong>Neutral expression, eyes open.</strong> No big smile, no closed eyes.
        </li>
        <li>
          <strong>Even lighting.</strong> No harsh shadow on one side of the face and no glare on spectacles. If
          you wear glasses, check whether the form allows them.
        </li>
        <li>
          <strong>Recent and unedited.</strong> No beauty filters, heavy retouching or old photos. Many forms ask for
          a photo taken within the last few months.
        </li>
      </ul>

      <h2>How to take a good source photo with a phone</h2>
      <ol>
        <li>Stand about an arm’s length in front of a plain light wall, facing a window so light falls on your face.</li>
        <li>Ask someone to take the picture at eye level, with the phone held steady and in portrait mode.</li>
        <li>Avoid the front camera’s wide-angle look by using the rear camera if possible.</li>
        <li>Take several shots and keep the sharpest one. Do not use zoom; crop afterwards instead.</li>
      </ol>
      <p>
        If the background is not clean, the <Link href="/tools/bg-remover">Background Remover</Link> can cut it out so
        you can place the subject on white.
      </p>

      <h2>Make and print the photos at home</h2>
      <ol>
        <li>
          Open the <Link href="/tools/passport-photo">Indian Passport Size Photo Maker</Link> and upload your photo.
        </li>
        <li>
          Choose the size your form needs: 3.5 × 4.5 cm, 3 × 4 cm, mini or postal size, or 2 × 2 inch.
        </li>
        <li>Pick the paper you will print on: A4, A5, 4 × 6 inch, 5 × 7 inch or Letter.</li>
        <li>Turn on the thin black border if you want clear guide lines for cutting.</li>
        <li>Generate the sheet, check the preview, and download it.</li>
      </ol>
      <h3>Printing correctly</h3>
      <ul>
        <li>
          Print at <strong>100% or “actual size”</strong>. Choosing “fit to page” rescales the sheet and makes every
          photo the wrong size.
        </li>
        <li>Use glossy or good-quality photo paper for best results, and set the printer to its photo quality mode.</li>
        <li>
          Measure one printed photo with a ruler. If it is not the size you chose, the print dialog is scaling the
          page.
        </li>
        <li>Cut along the border with a ruler and a sharp blade or paper trimmer rather than scissors for straight edges.</li>
      </ul>

      <h2>If you only need a digital upload</h2>
      <p>
        For online forms you usually do not need a printed sheet at all. You need a single cropped photo with a size
        limit in KB. Crop it to the right ratio, then use{" "}
        <Link href="/tools/resize-to-kb">Resize Image to KB</Link>. Our guide to{" "}
        <Link href="/blog/resize-photo-to-20kb-50kb-100kb">resizing a photo to 20KB, 50KB or 100KB</Link> walks through
        that in detail.
      </p>

      <h2>A note on privacy</h2>
      <p>
        A face photo is sensitive. The photo maker runs entirely in your browser: the picture is cropped and laid out
        on your own device and is not uploaded.
      </p>
    </GuideArticle>
  );
}
