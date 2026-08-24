export default function Loading() {
  return (
    <div className="relative min-h-[70vh] flex flex-col items-center justify-center px-4">
      {/* Sleek top progress glow bar */}
      <div className="fixed top-0 inset-x-0 h-1 bg-gradient-to-r from-teal-500 via-primary to-emerald-400 animate-[shimmer_1.2s_infinite] z-[9999]" />

      {/* Modern Center Loading Indicator */}
      <div className="flex flex-col items-center gap-4">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-primary/20 border-t-primary animate-spin" />
          <div className="absolute inset-2 rounded-full border-2 border-teal-500/20 border-b-teal-400 animate-spin" style={{ animationDirection: "reverse", animationDuration: "1s" }} />
        </div>
        <p className="text-xs font-semibold text-text-muted animate-pulse tracking-wider uppercase">
          Loading page...
        </p>
      </div>
    </div>
  );
}
