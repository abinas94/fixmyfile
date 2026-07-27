"use client";

import { useState } from "react";
import { Send, MessageSquare, Bug, Lightbulb, HelpCircle, CheckCircle } from "lucide-react";

type IssueType = "bug" | "feature" | "question" | "other";

const issueTypes: { id: IssueType; label: string; icon: React.ReactNode }[] = [
  { id: "bug", label: "Bug / Issue", icon: <Bug className="w-4 h-4" /> },
  { id: "feature", label: "Feature Request", icon: <Lightbulb className="w-4 h-4" /> },
  { id: "question", label: "Question", icon: <HelpCircle className="w-4 h-4" /> },
  { id: "other", label: "Other", icon: <MessageSquare className="w-4 h-4" /> },
];

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [issueType, setIssueType] = useState<IssueType>("bug");
  const [message, setMessage] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [sending, setSending] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);

    // Build mailto link as a simple zero-backend solution
    const subject = encodeURIComponent(`[FixMyFile ${issueType}] from ${name}`);
    const body = encodeURIComponent(
      `Name: ${name}\nEmail: ${email}\nType: ${issueType}\n\nMessage:\n${message}`
    );
    window.open(`mailto:fixmyfile.contact@gmail.com?subject=${subject}&body=${body}`, "_blank");

    // Show success state
    setTimeout(() => {
      setSending(false);
      setSubmitted(true);
    }, 500);
  };

  if (submitted) {
    return (
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-20 text-center">
        <div className="w-16 h-16 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-3">Message Ready!</h1>
        <p className="text-[var(--muted-foreground)] mb-6">
          Your email client should have opened with the message. If it didn&apos;t, you can directly email us at{" "}
          <a href="mailto:fixmyfile.contact@gmail.com" className="text-[var(--primary)] hover:underline font-medium">
            fixmyfile.contact@gmail.com
          </a>
        </p>
        <button
          onClick={() => {
            setSubmitted(false);
            setName("");
            setEmail("");
            setMessage("");
            setIssueType("bug");
          }}
          className="px-6 py-3 rounded-xl bg-[var(--primary)] text-white font-semibold hover:opacity-90 transition-opacity"
        >
          Send Another Message
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16">
      {/* Header */}
      <div className="text-center mb-10">
        <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
          <MessageSquare className="w-7 h-7 text-white" />
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold mb-2">Contact Us</h1>
        <p className="text-[var(--muted-foreground)]">
          Found a bug? Have a suggestion? We&apos;d love to hear from you.
        </p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Name & Email row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1.5">
              Name
            </label>
            <input
              id="name"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Your name"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all"
            />
          </div>
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1.5">
              Email
            </label>
            <input
              id="email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all"
            />
          </div>
        </div>

        {/* Issue Type */}
        <div>
          <label className="block text-sm font-medium mb-2">What&apos;s this about?</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {issueTypes.map((type) => (
              <button
                key={type.id}
                type="button"
                onClick={() => setIssueType(type.id)}
                className={`flex items-center justify-center gap-2 px-3 py-2.5 rounded-xl text-sm font-medium border transition-all ${
                  issueType === type.id
                    ? "border-[var(--primary)] bg-[var(--primary)]/10 text-[var(--primary)] shadow-sm"
                    : "border-[var(--border)] bg-[var(--card)] text-[var(--muted-foreground)] hover:border-[var(--primary)]/50"
                }`}
              >
                {type.icon}
                <span className="hidden sm:inline">{type.label}</span>
                <span className="sm:hidden">{type.label.split(" ")[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Message */}
        <div>
          <label htmlFor="message" className="block text-sm font-medium mb-1.5">
            Message
          </label>
          <textarea
            id="message"
            required
            rows={5}
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Describe the issue or share your feedback..."
            className="w-full px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--ring)] focus:border-[var(--primary)] transition-all resize-none"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={sending}
          className="w-full flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-gradient-to-r from-indigo-500 to-purple-600 text-white font-semibold shadow-lg hover:shadow-indigo-500/30 hover:scale-[1.02] active:scale-[0.98] transition-all disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {sending ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Sending...
            </>
          ) : (
            <>
              <Send className="w-4 h-4" />
              Send Message
            </>
          )}
        </button>
      </form>

      {/* Direct email note */}
      <p className="text-center text-xs text-[var(--muted-foreground)] mt-6">
        Or email us directly at{" "}
        <a href="mailto:fixmyfile.contact@gmail.com" className="text-[var(--primary)] hover:underline">
          fixmyfile.contact@gmail.com
        </a>
      </p>
    </div>
  );
}
