export default function BrandMark() {
  return (
    <div className="relative flex size-10 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-river-900 text-primary-foreground shadow-glow ring-1 ring-white/10">
      <svg className="size-5" viewBox="0 0 32 32" fill="none" aria-hidden="true">
        <circle cx="16" cy="16" r="14" stroke="currentColor" strokeWidth="1.5" strokeOpacity="0.35" />
        <path
          d="M6,18 C9,13 11,21 14,16 C17,11 19,19 22,14 C24,11 25,15 26,13"
          stroke="currentColor"
          strokeWidth="2.25"
          fill="none"
          strokeLinecap="round"
        />
      </svg>
    </div>
  );
}
