// The signature visual: three source lines (Google/Meta/LinkedIn) converging
// into one amber "Signal" line with a live-looking value readout.
export function ConvergenceHero() {
  return (
    <div className="relative aspect-[5/4] w-full overflow-hidden rounded-xl border border-border bg-card p-4">
      <div className="absolute inset-0 opacity-[0.06]" aria-hidden style={{
        backgroundImage:
          "linear-gradient(var(--color-border) 1px, transparent 1px), linear-gradient(90deg, var(--color-border) 1px, transparent 1px)",
        backgroundSize: "24px 24px",
      }} />

      <div className="relative flex h-full flex-col">
        <div className="flex items-center justify-between text-xs font-mono uppercase tracking-widest text-muted-foreground">
          <span>signal · unified</span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[color:var(--positive)]" /> streaming
          </span>
        </div>

        <div className="relative mt-3 flex-1">
          <svg viewBox="0 0 500 280" className="h-full w-full" role="img" aria-label="Three ad platforms converging into one Signal line">
            <defs>
              <linearGradient id="amberGlow" x1="0" x2="1">
                <stop offset="0%" stopColor="var(--signal)" stopOpacity="0.1" />
                <stop offset="100%" stopColor="var(--signal)" stopOpacity="0.9" />
              </linearGradient>
            </defs>

            {/* three source lines */}
            <path d="M10,40 C120,40 200,120 260,140" fill="none" stroke="var(--info)" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M10,140 C120,140 200,140 260,140" fill="none" stroke="var(--signal)" strokeWidth="1.75" strokeLinecap="round" />
            <path d="M10,240 C120,240 200,160 260,140" fill="none" stroke="var(--positive)" strokeWidth="1.75" strokeLinecap="round" />

            {/* junction node */}
            <circle cx="260" cy="140" r="6" fill="var(--signal)" />
            <circle cx="260" cy="140" r="12" fill="none" stroke="var(--signal)" strokeOpacity="0.35" />

            {/* unified line */}
            <path d="M260,140 L490,140" fill="none" stroke="url(#amberGlow)" strokeWidth="2.5" strokeLinecap="round" />

            {/* labels */}
            <text x="14" y="30" fill="var(--info)" fontFamily="JetBrains Mono, monospace" fontSize="10">Google Ads</text>
            <text x="14" y="130" fill="var(--signal)" fontFamily="JetBrains Mono, monospace" fontSize="10">Meta Ads</text>
            <text x="14" y="260" fill="var(--positive)" fontFamily="JetBrains Mono, monospace" fontSize="10">LinkedIn Ads</text>

            <text x="490" y="130" textAnchor="end" fill="var(--muted-foreground)" fontFamily="JetBrains Mono, monospace" fontSize="10">ROAS · TODAY</text>
            <text x="490" y="164" textAnchor="end" fill="var(--foreground)" fontFamily="JetBrains Mono, monospace" fontSize="22" fontWeight="600">3.42×</text>
          </svg>
        </div>

        <div className="mt-3 grid grid-cols-3 gap-2 text-[10px] font-mono uppercase tracking-widest text-muted-foreground">
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[color:var(--info)]" /> Google</div>
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[color:var(--signal)]" /> Meta</div>
          <div className="flex items-center gap-1.5"><span className="h-1.5 w-1.5 rounded-full bg-[color:var(--positive)]" /> LinkedIn</div>
        </div>
      </div>
    </div>
  );
}
