import { AlertTriangle, TrendingUp, Check } from "lucide-react";
import { PLATFORM_LABELS } from "@/lib/mock-data";
import type { AlertItem } from "@/lib/dashboard-utils";

export function AlertsPanel({ alerts }: { alerts: AlertItem[] }) {
  if (alerts.length === 0) {
    return (
      <div className="flex h-56 flex-col items-center justify-center text-center">
        <div className="rounded-full border border-border p-2">
          <Check className="h-4 w-4 text-[color:var(--positive)]" />
        </div>
        <p className="mt-3 text-sm text-foreground">No anomalies</p>
        <p className="mt-1 text-xs text-muted-foreground">All campaigns pacing normally in the selected window.</p>
      </div>
    );
  }
  return (
    <ul className="max-h-72 divide-y divide-border overflow-y-auto pr-1">
      {alerts.map((a) => {
        const Icon = a.kind === "cpa_spike" ? AlertTriangle : TrendingUp;
        const tint = a.kind === "cpa_spike" ? "var(--negative)" : "var(--signal)";
        return (
          <li key={a.id} className="flex gap-3 py-3">
            <div className="mt-0.5">
              <Icon className="h-4 w-4" style={{ color: tint }} />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 text-xs">
                <span className="font-medium text-foreground">{a.campaign}</span>
                <span className="font-mono uppercase tracking-widest text-muted-foreground">
                  {PLATFORM_LABELS[a.platform]}
                </span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{a.message}</p>
            </div>
          </li>
        );
      })}
    </ul>
  );
}
