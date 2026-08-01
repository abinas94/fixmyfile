import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy | FixMyFile",
  description: "FixMyFile privacy policy. Learn how we handle your data — most tools process files locally in your browser with no server uploads.",
};

export default function PrivacyPolicy() {
  return (
    <article className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      <h1 className="text-3xl sm:text-4xl font-bold mb-2">Privacy Policy</h1>
      <p className="text-[var(--muted-foreground)] mb-8">Last updated: July 22, 2026</p>

      <div className="prose prose-lg dark:prose-invert max-w-none space-y-6 text-[var(--foreground)] text-sm leading-relaxed">
        <p>At FixMyFile, we take your privacy seriously. This policy explains what data we collect, how we use it, and your rights.</p>

        <h2 className="text-xl font-bold mt-8">1. How Our Tools Work</h2>
        <p>FixMyFile offers two types of tools:</p>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Client-side tools (majority)</strong> — Files are processed entirely in your browser using JavaScript. Your files never leave your device. We cannot see, access, or store them.</li>
          <li><strong>Server-enhanced tools</strong> — A few tools (PDF compression, file conversion, password protection/removal) require server processing for best quality. For these tools, files are uploaded to our secure server, processed, and <strong>immediately deleted</strong> after you download the result. We do not store, read, or share your files.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">2. Data We Collect</h2>
        <h3 className="text-lg font-semibold mt-4">Analytics</h3>
        <p>We use Vercel Analytics to understand how visitors use our site. This collects:</p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li>Page views and navigation patterns</li>
          <li>Device type and browser (anonymized)</li>
          <li>Country-level geographic data</li>
          <li>Referral source</li>
        </ul>
        <p>No personally identifiable information (PII) is collected through analytics.</p>

        <h3 className="text-lg font-semibold mt-4">Advertising</h3>
        <p>We use Google AdSense to display advertisements. Google may use cookies to serve ads based on your prior visits to this or other websites. You can opt out of personalized advertising by visiting <a href="https://www.google.com/settings/ads" className="text-[var(--primary)] underline" target="_blank" rel="noopener noreferrer">Google Ads Settings</a>.</p>

        <h3 className="text-lg font-semibold mt-4">Contact Form</h3>
        <p>If you use our contact form, we receive your name, email address, and message. We use this only to respond to your inquiry and do not add you to marketing lists.</p>

        <h2 className="text-xl font-bold mt-8">3. Cookies</h2>
        <p>We use minimal cookies:</p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li><strong>Theme preference</strong> — stores your dark/light mode choice (local storage)</li>
          <li><strong>Google AdSense cookies</strong> — used for ad personalization (third-party)</li>
          <li><strong>Vercel Analytics</strong> — anonymous usage tracking</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">4. Data Retention</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Client-side tools:</strong> No data is stored — everything stays in your browser and is gone when you close the tab.</li>
          <li><strong>Server-enhanced tools:</strong> Files are deleted immediately after processing. No copies are retained.</li>
          <li><strong>Analytics:</strong> Aggregated, anonymous data is retained for up to 12 months.</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">5. Third-Party Services</h2>
        <ul className="list-disc list-inside space-y-2 pl-4">
          <li><strong>Vercel</strong> — Hosting and analytics (<a href="https://vercel.com/legal/privacy-policy" className="text-[var(--primary)] underline" target="_blank" rel="noopener noreferrer">Vercel Privacy Policy</a>)</li>
          <li><strong>Google AdSense</strong> — Advertising (<a href="https://policies.google.com/privacy" className="text-[var(--primary)] underline" target="_blank" rel="noopener noreferrer">Google Privacy Policy</a>)</li>
          <li><strong>CloudConvert</strong> — Server-side file processing (<a href="https://cloudconvert.com/privacy" className="text-[var(--primary)] underline" target="_blank" rel="noopener noreferrer">CloudConvert Privacy Policy</a>)</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">6. Your Rights</h2>
        <p>You have the right to:</p>
        <ul className="list-disc list-inside space-y-1 pl-4">
          <li>Know what data we collect (outlined above)</li>
          <li>Request deletion of any personal data we hold</li>
          <li>Opt out of personalized advertising</li>
          <li>Use our client-side tools with zero data collection</li>
        </ul>

        <h2 className="text-xl font-bold mt-8">7. Children</h2>
        <p>FixMyFile is not directed at children under 13. We do not knowingly collect personal data from children.</p>

        <h2 className="text-xl font-bold mt-8">8. Changes to This Policy</h2>
        <p>We may update this policy from time to time. Changes will be posted on this page with an updated date.</p>

        <h2 className="text-xl font-bold mt-8">9. Contact</h2>
        <p>If you have questions about this privacy policy, <Link href="/contact" className="text-[var(--primary)] underline">contact us</Link>.</p>
      </div>
    </article>
  );
}
