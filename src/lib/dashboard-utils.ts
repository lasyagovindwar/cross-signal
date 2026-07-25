import type { CampaignDay, Platform } from "./mock-data";
import { PLATFORM_LABELS } from "./mock-data";

export interface FilterState {
  platforms: Platform[];
  days: 7 | 30 | 90;
}

export function filterRows(rows: CampaignDay[], filters: FilterState): CampaignDay[] {
  const cutoff = new Date();
  cutoff.setUTCHours(0, 0, 0, 0);
  cutoff.setUTCDate(cutoff.getUTCDate() - (filters.days - 1));
  const cutoffISO = cutoff.toISOString().slice(0, 10);
  return rows.filter(
    (r) => filters.platforms.includes(r.platform) && r.date >= cutoffISO,
  );
}

export interface Kpis {
  spend: number;
  revenue: number;
  clicks: number;
  impressions: number;
  conversions: number;
  roas: number;
  cpc: number;
  ctr: number;
  cpa: number;
}

export function computeKpis(rows: CampaignDay[]): Kpis {
  const t = rows.reduce(
    (a, r) => {
      a.spend += r.spend;
      a.revenue += r.revenue;
      a.clicks += r.clicks;
      a.impressions += r.impressions;
      a.conversions += r.conversions;
      return a;
    },
    { spend: 0, revenue: 0, clicks: 0, impressions: 0, conversions: 0 },
  );
  return {
    ...t,
    roas: t.spend > 0 ? t.revenue / t.spend : 0,
    cpc: t.clicks > 0 ? t.spend / t.clicks : 0,
    ctr: t.impressions > 0 ? (t.clicks / t.impressions) * 100 : 0,
    cpa: t.conversions > 0 ? t.spend / t.conversions : 0,
  };
}

export function seriesByDate(rows: CampaignDay[]): { date: string; spend: number; revenue: number }[] {
  const map = new Map<string, { date: string; spend: number; revenue: number }>();
  for (const r of rows) {
    const cur = map.get(r.date) ?? { date: r.date, spend: 0, revenue: 0 };
    cur.spend += r.spend;
    cur.revenue += r.revenue;
    map.set(r.date, cur);
  }
  return [...map.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function roasByPlatform(rows: CampaignDay[]): { platform: Platform; label: string; roas: number }[] {
  const agg = new Map<Platform, { spend: number; revenue: number }>();
  for (const r of rows) {
    const cur = agg.get(r.platform) ?? { spend: 0, revenue: 0 };
    cur.spend += r.spend;
    cur.revenue += r.revenue;
    agg.set(r.platform, cur);
  }
  return [...agg.entries()].map(([platform, v]) => ({
    platform,
    label: PLATFORM_LABELS[platform],
    roas: v.spend > 0 ? +(v.revenue / v.spend).toFixed(2) : 0,
  }));
}

export interface AlertItem {
  id: string;
  campaign: string;
  platform: Platform;
  kind: "cpa_spike" | "spend_pace";
  message: string;
}

export function computeAlerts(rows: CampaignDay[]): AlertItem[] {
  const alerts: AlertItem[] = [];
  // group by campaign
  const byCampaign = new Map<string, CampaignDay[]>();
  for (const r of rows) {
    const key = `${r.platform}::${r.campaign_name}`;
    const arr = byCampaign.get(key) ?? [];
    arr.push(r);
    byCampaign.set(key, arr);
  }
  for (const [key, arr] of byCampaign) {
    arr.sort((a, b) => a.date.localeCompare(b.date));
    if (arr.length < 6) continue;
    const last3 = arr.slice(-3);
    const prev3 = arr.slice(-6, -3);

    const cpa3 = safeCpa(last3);
    const cpaPrev = safeCpa(prev3);
    if (cpaPrev > 0 && cpa3 > 0 && cpa3 / cpaPrev - 1 > 0.4) {
      const [platform, campaign] = key.split("::") as [Platform, string];
      alerts.push({
        id: `${key}:cpa`,
        campaign,
        platform,
        kind: "cpa_spike",
        message: `CPA rose ${Math.round(((cpa3 / cpaPrev) - 1) * 100)}% over the last 3 days ($${cpaPrev.toFixed(2)} → $${cpa3.toFixed(2)}).`,
      });
    }
    const spend3 = last3.reduce((a, r) => a + r.spend, 0);
    const spendPrev = prev3.reduce((a, r) => a + r.spend, 0);
    if (spendPrev > 0 && spend3 / spendPrev - 1 > 0.35) {
      const [platform, campaign] = key.split("::") as [Platform, string];
      alerts.push({
        id: `${key}:spend`,
        campaign,
        platform,
        kind: "spend_pace",
        message: `Spend pacing is ${Math.round(((spend3 / spendPrev) - 1) * 100)}% above the previous 3 days.`,
      });
    }
  }
  return alerts.slice(0, 8);
}

function safeCpa(arr: CampaignDay[]): number {
  const spend = arr.reduce((a, r) => a + r.spend, 0);
  const conv = arr.reduce((a, r) => a + r.conversions, 0);
  return conv > 0 ? spend / conv : 0;
}

export function ruleBasedSummary(rows: CampaignDay[]): string {
  const perPlatform = roasByPlatform(rows).sort((a, b) => b.roas - a.roas);
  if (perPlatform.length === 0) return "No campaign data in the selected range.";
  const best = perPlatform[0];
  const worst = perPlatform[perPlatform.length - 1];
  const kpis = computeKpis(rows);
  const bestLine = `${best.label} is the strongest channel at ${best.roas.toFixed(2)}x ROAS.`;
  const worstLine =
    perPlatform.length > 1 && worst.roas < best.roas
      ? `${worst.label} is underperforming at ${worst.roas.toFixed(2)}x ROAS.`
      : `Performance is consistent across selected platforms.`;
  const action =
    perPlatform.length > 1 && worst.roas < best.roas
      ? `Shift budget from ${worst.label} into ${best.label} for the next 7 days and re-evaluate.`
      : `Hold current allocation and monitor CPA on top-spending campaigns.`;
  void kpis;
  return `${bestLine} ${worstLine} ${action}`;
}

export function rowsToCsv(rows: CampaignDay[]): string {
  const cols: (keyof CampaignDay)[] = [
    "date","platform","campaign_name","status","spend","impressions","clicks","conversions","revenue","ctr","cpc","roas","cpa",
  ];
  const head = cols.join(",");
  const body = rows
    .map((r) =>
      cols
        .map((c) => {
          const v = r[c];
          if (typeof v === "string" && (v.includes(",") || v.includes('"'))) {
            return `"${v.replace(/"/g, '""')}"`;
          }
          return String(v);
        })
        .join(","),
    )
    .join("\n");
  return `${head}\n${body}`;
}

export function downloadCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function formatCurrency(n: number): string {
  return n.toLocaleString("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 });
}

export function formatNumber(n: number, digits = 2): string {
  return n.toLocaleString("en-US", { maximumFractionDigits: digits });
}
