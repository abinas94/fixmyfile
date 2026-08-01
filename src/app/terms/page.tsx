import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Terms of Service | FixMyFile",
  description: "FixMyFile terms of service. Free online file tools provided as-is. No warranty. Use responsibly.",
};

export default function TermsOfService() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Terms of Service</h1>
      <p className="text-[var(--muted-foreground)] mb-8">Last updated: July 22, 2026</p>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-[var(--foreground)] text-sm leading-relaxed">
        <p>By using FixMyFile (&quot;the Service&quot;), you agree to these terms. If you do not agree, please do not use the site.</p>

        <h2 className="text-xl font-bold mt-8">1. Service Description</h2>
        <p>FixMyFile provides free online tools for processing files including PDFs, images, documents, and text. Most tools run entirely in your browser (client-side). Some tools use secure server processing for operations that require it.</p>

        <h2 className="text-xl font-bold mt-8">2. Acceptable Use</h2>
        <p>You agree to use FixMyFile only for lawful purposes. You must not:</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li>Process files that contain illegal content</li>
          <li>Attempt to overload or disrupt the service</li>
          <li>Use automated scripts to abuse the service</li>
          <li>Reverse-engineer or copy the service for commercial use</li>
          <li>Upload files you do not have the right to process</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">3. Intellectual Property</h2>
        <p>You retain full ownership of all files you process using FixMyFile. We claim no rights over your content. The FixMyFile brand, design, and code are our intellectual property.</p>

        <h2 className="text-xl font-bold mt-8">4. No Warranty</h2>
        <p>The Service is provided &quot;as is&quot; without any warranties, express or implied. We do not guarantee:</p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li>Uninterrupted availability of the service</li>
          <li>Accuracy or quality of file conversions</li>
          <li>Compatibility with all file types or browsers</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">5. Limitation of Liability</h2>
        <p>FixMyFile shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use the Service. This includes but is not limited to data loss, file corruption, or business interruption.</p>

        <h2 className="text-xl font-bold mt-8">6. File Processing</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Client-side tools:</strong> Files are processed in your browser and never transmitted to our servers.</li>
          <li><strong>Server-enhanced tools:</strong> Files are uploaded, processed, and immediately deleted. We do not retain copies.</li>
          <li>Always keep backup copies of important files before processing.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">7. Availability</h2>
        <p>We strive to keep the Service available 24/7 but do not guarantee uptime. We may modify, suspend, or discontinue any part of the Service without notice.</p>

        <h2 className="text-xl font-bold mt-8">8. Changes to Terms</h2>
        <p>We may update these terms at any time. Continued use of the Service after changes constitutes acceptance of the new terms.</p>

        <h2 className="text-xl font-bold mt-8">9. Contact</h2>
        <p>Questions about these terms? <Link href="/contact" className="text-[var(--primary)] underline">Contact us</Link>.</p>
      </div>
    </article>
  );
}
