// Deterministic realistic mock data for Signal.
// Numbers are internally consistent: spend = clicks * cpc, revenue = conversions * aov.

export type Platform = "google_ads" | "meta_ads" | "linkedin_ads";

export interface CampaignDay {
  date: string; // YYYY-MM-DD
  platform: Platform;
  campaign_name: string;
  spend: number;
  impressions: number;
  clicks: number;
  conversions: number;
  revenue: number;
  ctr: number;
  cpc: number;
  roas: number;
  cpa: number;
  status: "active" | "paused";
}

const PLATFORM_RANGES: Record<
  Platform,
  { ctr: [number, number]; cpc: [number, number]; cvr: [number, number]; aov: [number, number] }
> = {
  google_ads:   { ctr: [0.02, 0.06],  cpc: [0.8, 3.5], cvr: [0.02, 0.06],  aov: [40, 150] },
  meta_ads:     { ctr: [0.008, 0.025],cpc: [0.4, 1.8], cvr: [0.01, 0.035], aov: [25, 90] },
  linkedin_ads: { ctr: [0.004, 0.012],cpc: [3.5, 9.0], cvr: [0.01, 0.03],  aov: [200, 600] },
};

const CAMPAIGNS: Record<Platform, string[]> = {
  google_ads: ["Search - Brand", "Search - Non-Brand", "PMax - Q3 Growth", "Display - Retargeting"],
  meta_ads: ["IG Reels - Awareness", "Advantage+ Shopping", "FB Feed - Retargeting"],
  linkedin_ads: ["Sponsored Content - ABM", "Lead Gen Forms - SMB", "Message Ads - Enterprise"],
};

// Mulberry32 PRNG for deterministic pseudo-randomness.
function mulberry32(seed: number) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6D2B79F5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function hashString(s: string): number {
  let h = 2166136261;
  for (let i = 0; i < s.length; i++) {
    h ^= s.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

function pickInRange(rand: () => number, [lo, hi]: [number, number]): number {
  return lo + rand() * (hi - lo);
}

function isoDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

export function generateMockCampaigns(days = 90): CampaignDay[] {
  const rows: CampaignDay[] = [];
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  for (const platform of Object.keys(CAMPAIGNS) as Platform[]) {
    for (const campaign of CAMPAIGNS[platform]) {
      const seed = hashString(`${platform}:${campaign}`);
      const rand = mulberry32(seed);
      const baseCtr = pickInRange(rand, PLATFORM_RANGES[platform].ctr);
      const baseCpc = pickInRange(rand, PLATFORM_RANGES[platform].cpc);
      const baseCvr = pickInRange(rand, PLATFORM_RANGES[platform].cvr);
      const baseAov = pickInRange(rand, PLATFORM_RANGES[platform].aov);
      const baseImpressions = 2000 + Math.floor(rand() * 40000);
      const status: "active" | "paused" = rand() > 0.1 ? "active" : "paused";

      for (let i = days - 1; i >= 0; i--) {
        const day = new Date(today);
        day.setUTCDate(day.getUTCDate() - i);
        // Weekly seasonality + small noise
        const dow = day.getUTCDay();
        const weekly = 1 + 0.15 * Math.sin((dow / 7) * Math.PI * 2);
        const jitter = 0.8 + rand() * 0.4;

        // Occasional anomaly spike on last 3 days for realism
        const anomaly = i < 3 && rand() > 0.7 ? 1.5 + rand() * 0.6 : 1;

        const impressions = Math.round(baseImpressions * weekly * jitter);
        const ctr = Math.max(0.001, baseCtr * (0.9 + rand() * 0.2));
        const clicks = Math.round(impressions * ctr);
        const cpc = Math.max(0.05, baseCpc * (0.9 + rand() * 0.2) * anomaly);
        const spend = +(clicks * cpc).toFixed(2);
        const cvr = Math.max(0.002, baseCvr * (0.85 + rand() * 0.3));
        const conversions = Math.round(clicks * cvr);
        const aov = baseAov * (0.9 + rand() * 0.2);
        const revenue = +(conversions * aov).toFixed(2);
        const roas = spend > 0 ? +(revenue / spend).toFixed(2) : 0;
        const cpa = conversions > 0 ? +(spend / conversions).toFixed(2) : 0;

        rows.push({
          date: isoDate(day),
          platform,
          campaign_name: campaign,
          spend,
          impressions,
          clicks,
          conversions,
          revenue,
          ctr: +(ctr * 100).toFixed(2), // percent
          cpc: +cpc.toFixed(2),
          roas,
          cpa,
          status,
        });
      }
    }
  }
  return rows;
}

export const PLATFORM_LABELS: Record<Platform, string> = {
  google_ads: "Google Ads",
  meta_ads: "Meta Ads",
  linkedin_ads: "LinkedIn Ads",
};

export const PLATFORM_COLOR_VAR: Record<Platform, string> = {
  google_ads: "var(--info)",
  meta_ads: "var(--signal)",
  linkedin_ads: "var(--positive)",
};
