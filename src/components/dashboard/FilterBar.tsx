import { PLATFORM_LABELS, type Platform } from "@/lib/mock-data";
import type { FilterState } from "@/lib/dashboard-utils";

const PLATFORMS: Platform[] = ["google_ads", "meta_ads", "linkedin_ads"];
const DAYS: FilterState["days"][] = [7, 30, 90];

const PLATFORM_TINT: Record<Platform, string> = {
  google_ads: "var(--info)",
  meta_ads: "var(--signal)",
  linkedin_ads: "var(--positive)",
};

export function FilterBar({
  filters,
  onChange,
}: {
  filters: FilterState;
  onChange: (f: FilterState) => void;
}) {
  function togglePlatform(p: Platform) {
    const set = new Set(filters.platforms);
    if (set.has(p)) {
      if (set.size === 1) return; // keep at least one
      set.delete(p);
    } else set.add(p);
    onChange({ ...filters, platforms: PLATFORMS.filter((x) => set.has(x)) });
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <div className="flex flex-wrap gap-1.5">
        {PLATFORMS.map((p) => {
          const active = filters.platforms.includes(p);
          return (
            <button
              key={p}
              onClick={() => togglePlatform(p)}
              aria-pressed={active}
              className="inline-flex items-center gap-2 rounded-full border px-3 py-1.5 text-xs transition-colors"
              style={{
                borderColor: active ? PLATFORM_TINT[p] : "var(--color-border)",
                backgroundColor: active ? `color-mix(in oklab, ${PLATFORM_TINT[p]} 12%, transparent)` : "transparent",
                color: active ? "var(--color-foreground)" : "var(--color-muted-foreground)",
              }}
            >
              <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: PLATFORM_TINT[p] }} />
              {PLATFORM_LABELS[p]}
            </button>
          );
        })}
      </div>
      <div className="ml-2 flex overflow-hidden rounded-md border border-border">
        {DAYS.map((d) => (
          <button
            key={d}
            onClick={() => onChange({ ...filters, days: d })}
            className={`px-3 py-1.5 font-mono text-xs transition-colors ${
              filters.days === d
                ? "bg-primary text-primary-foreground"
                : "bg-transparent text-muted-foreground hover:bg-accent"
            }`}
          >
            {d}d
          </button>
        ))}
      </div>
    </div>
  );
}
