interface ToolContentProps {
  title: string;
  description: string;
  howTo: string[];
  features: string[];
  faqs: { q: string; a: string }[];
}

export default function ToolContent({ title, description, howTo, features, faqs }: ToolContentProps) {
  return (
    <section className="mt-16 max-w-3xl mx-auto space-y-10 text-left">
      {/* About */}
      <div>
        <h2 className="text-xl font-bold mb-3">About {title}</h2>
        <p className="text-sm text-[var(--muted-foreground)] leading-relaxed">{description}</p>
      </div>

      {/* How to use */}
      <div>
        <h2 className="text-xl font-bold mb-3">How to Use</h2>
        <ol className="space-y-2">
          {howTo.map((step, idx) => (
            <li key={idx} className="text-sm text-[var(--muted-foreground)] flex gap-2">
              <span className="font-bold text-[var(--primary)] flex-shrink-0">{idx + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>

      {/* Features */}
      <div>
        <h2 className="text-xl font-bold mb-3">Features</h2>
        <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {features.map((feature, idx) => (
            <li key={idx} className="text-sm text-[var(--muted-foreground)] flex items-start gap-2">
              <span className="text-green-500 mt-0.5">✓</span>
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>

      {/* FAQs */}
      <div>
        <h2 className="text-xl font-bold mb-3">Frequently Asked Questions</h2>
        <div className="space-y-4">
          {faqs.map((faq, idx) => (
            <div key={idx}>
              <h3 className="text-sm font-semibold mb-1">{faq.q}</h3>
              <p className="text-sm text-[var(--muted-foreground)]">{faq.a}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust signals */}
      <div className="p-4 rounded-xl bg-[var(--muted)] border border-[var(--border)]">
        <div className="grid grid-cols-3 gap-4 text-center">
          <div>
            <p className="text-lg font-bold text-[var(--primary)]">Free</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">No hidden costs</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--primary)]">Private</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">Files stay local</p>
          </div>
          <div>
            <p className="text-lg font-bold text-[var(--primary)]">Unlimited</p>
            <p className="text-[10px] text-[var(--muted-foreground)]">No daily limits</p>
          </div>
        </div>
      </div>
    </section>
  );
}
