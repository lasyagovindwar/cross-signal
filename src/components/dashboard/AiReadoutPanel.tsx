import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { Sparkles } from "lucide-react";
import { generateInsight } from "@/lib/ai-insights.functions";
import { computeKpis, roasByPlatform, ruleBasedSummary } from "@/lib/dashboard-utils";
import type { CampaignDay } from "@/lib/mock-data";

export function AiReadoutPanel({ filtered, windowDays }: { filtered: CampaignDay[]; windowDays: number }) {
  const fn = useServerFn(generateInsight);
  const [state, setState] = useState<
    { status: "idle" } | { status: "loading" } | { status: "done"; text: string; source: "ai" | "fallback" }
  >({ status: "idle" });

  async function handleGenerate() {
    setState({ status: "loading" });
    const kpis = computeKpis(filtered);
    const perPlatform = roasByPlatform(filtered).map((p) => {
      const spend = filtered.filter((r) => r.platform === p.platform).reduce((a, r) => a + r.spend, 0);
      const revenue = filtered.filter((r) => r.platform === p.platform).reduce((a, r) => a + r.revenue, 0);
      return { platform: p.platform, label: p.label, spend, revenue, roas: p.roas };
    });
    const fallback = ruleBasedSummary(filtered);
    try {
      const res = await fn({
        data: {
          windowDays,
          totals: {
            spend: kpis.spend,
            revenue: kpis.revenue,
            roas: kpis.roas,
            cpc: kpis.cpc,
            ctr: kpis.ctr,
            cpa: kpis.cpa,
            conversions: kpis.conversions,
          },
          perPlatform,
          fallback,
        },
      });
      setState({ status: "done", text: res.summary, source: res.source });
    } catch {
      setState({ status: "done", text: fallback, source: "fallback" });
    }
  }

  return (
    <div className="flex min-h-56 flex-col">
      {state.status === "idle" && (
        <div className="flex flex-1 flex-col items-center justify-center text-center">
          <div className="rounded-full border border-primary/30 bg-primary/5 p-2">
            <Sparkles className="h-4 w-4 text-primary" />
          </div>
          <p className="mt-3 text-sm text-foreground">Generate a plain-English readout</p>
          <p className="mt-1 max-w-xs text-xs text-muted-foreground">
            Three sentences: what's working, what's underperforming, one concrete next action.
          </p>
          <button
            onClick={handleGenerate}
            className="mt-4 inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Sparkles className="h-4 w-4" /> Generate
          </button>
        </div>
      )}
      {state.status === "loading" && (
        <div className="flex flex-1 items-center justify-center">
          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">Analyzing…</span>
        </div>
      )}
      {state.status === "done" && (
        <>
          <p className="text-sm leading-relaxed text-foreground whitespace-pre-line">{state.text}</p>
          <div className="mt-4 flex items-center justify-between">
            <span className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
              source · {state.source === "ai" ? "ai" : "rule-based fallback"}
            </span>
            <button
              onClick={handleGenerate}
              className="text-xs text-muted-foreground hover:text-foreground"
            >
              Regenerate
            </button>
          </div>
        </>
      )}
    </div>
  );
}
