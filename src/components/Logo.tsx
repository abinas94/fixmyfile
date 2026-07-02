export default function Logo({ size = "default" }: { size?: "small" | "default" | "large" }) {
  const dimensions = {
    small: { svg: 30, text: "text-lg" },
    default: { svg: 36, text: "text-xl" },
    large: { svg: 52, text: "text-3xl" },
  }[size];

  return (
    <div className="flex items-center gap-2.5">
      <svg
        width={dimensions.svg}
        height={dimensions.svg}
        viewBox="0 0 52 52"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="flex-shrink-0"
      >
        {/* Rounded square background with warm gradient */}
        <rect width="52" height="52" rx="14" fill="url(#fixmy-bg)" />
        
        {/* Magic wand / sparkle shape */}
        {/* Main wand body */}
        <path d="M16 36L32 20" stroke="white" strokeWidth="3" strokeLinecap="round" />
        <path d="M32 20L36 16" stroke="white" strokeWidth="2.5" strokeLinecap="round" opacity="0.9" />
        
        {/* Sparkle star top-right */}
        <path d="M38 14L38 10" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        <path d="M36 12L40 12" stroke="white" strokeWidth="2" strokeLinecap="round" opacity="0.9" />
        
        {/* Small sparkles */}
        <circle cx="28" cy="14" r="1.5" fill="white" opacity="0.7" />
        <circle cx="42" cy="20" r="1.2" fill="white" opacity="0.6" />
        <circle cx="22" cy="22" r="1" fill="white" opacity="0.5" />
        
        {/* File/page shape at bottom */}
        <rect x="12" y="28" width="14" height="16" rx="2" fill="white" opacity="0.25" />
        <path d="M15 33H23" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.6" />
        <path d="M15 36H21" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.5" />
        <path d="M15 39H22" stroke="white" strokeWidth="1.2" strokeLinecap="round" opacity="0.4" />
        
        {/* Checkmark badge */}
        <circle cx="38" cy="36" r="7" fill="white" opacity="0.95" />
        <path d="M35 36L37.5 38.5L41.5 33.5" stroke="url(#fixmy-bg)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />

        <defs>
          <linearGradient id="fixmy-bg" x1="0" y1="0" x2="52" y2="52" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f97316" />
            <stop offset="0.5" stopColor="#ef4444" />
            <stop offset="1" stopColor="#ec4899" />
          </linearGradient>
        </defs>
      </svg>
      <span className={`${dimensions.text} font-bold tracking-tight`}>
        <span className="text-[var(--foreground)]">FixMy</span>
        <span style={{ background: "linear-gradient(135deg, #f97316, #ef4444, #ec4899)", WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent", backgroundClip: "text" }}>File</span>
      </span>
    </div>
  );
}
