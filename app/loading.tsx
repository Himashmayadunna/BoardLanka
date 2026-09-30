export default function Loading() {
  return (
    <div className="relative min-h-[75vh] flex flex-col items-center justify-center px-4 select-none">
      {/* Top ambient hairline progress line */}
      <div className="fixed top-0 inset-x-0 h-[1px] bg-[var(--border-hairline)] overflow-hidden z-[9999]">
        <div className="h-full w-1/3 bg-[var(--accent-earth)] animate-[shimmer_1.6s_infinite]" />
      </div>

      {/* Editorial Card Indicator */}
      <div className="flex flex-col items-center gap-6 p-8 border border-[var(--border-hairline)] bg-[var(--surface)]/90 backdrop-blur-sm shadow-none max-w-xs w-full text-center">
        {/* Subtle rotating hairline monogram */}
        <div className="relative flex items-center justify-center w-12 h-12">
          <div className="absolute inset-0 border border-[var(--border-hairline)]" />
          <div className="absolute inset-0 border-t border-[var(--accent-earth)] animate-spin" />
          <span className="font-serif text-sm font-semibold tracking-wider text-[var(--foreground)]">
            BL
          </span>
        </div>

        {/* Text & Status */}
        <div className="flex flex-col items-center gap-1.5">
          <span className="font-serif text-base tracking-tight text-[var(--foreground)]">
            Board<span className="italic text-[var(--accent-earth)]">Lanka</span>
          </span>
          <p className="text-[10px] uppercase tracking-[0.2em] font-semibold text-[var(--text-muted)]">
            Curating Residences
          </p>
        </div>

        {/* Micro hairline progress */}
        <div className="w-24 h-[1px] bg-[var(--border-hairline)] overflow-hidden">
          <div className="h-full bg-[var(--accent-earth)] animate-[shimmer_1.4s_ease-in-out_infinite]" />
        </div>
      </div>
    </div>
  );
}
