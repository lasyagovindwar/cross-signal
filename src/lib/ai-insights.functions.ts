import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

const PayloadSchema = z.object({
  windowDays: z.number(),
  totals: z.object({
    spend: z.number(),
    revenue: z.number(),
    roas: z.number(),
    cpc: z.number(),
    ctr: z.number(),
    cpa: z.number(),
    conversions: z.number(),
  }),
  perPlatform: z.array(
    z.object({
      platform: z.string(),
      label: z.string(),
      spend: z.number(),
      revenue: z.number(),
      roas: z.number(),
    }),
  ),
  fallback: z.string(),
});

export type InsightInput = z.infer<typeof PayloadSchema>;

export const generateInsight = createServerFn({ method: "POST" })
  .inputValidator((v: unknown) => PayloadSchema.parse(v))
  .handler(async ({ data }) => {
    const apiKey = process.env.LOVABLE_API_KEY;
    if (!apiKey) {
      return { summary: data.fallback, source: "fallback" as const };
    }
    try {
      const platformLines = data.perPlatform
        .map((p) => `- ${p.label}: spend $${p.spend.toFixed(0)}, revenue $${p.revenue.toFixed(0)}, ROAS ${p.roas.toFixed(2)}x`)
        .join("\n");
      const prompt = `You are an ad performance analyst. Given this ${data.windowDays}-day summary across paid platforms, write EXACTLY 3 short sentences: (1) what's working, (2) what's underperforming, (3) one concrete next action. Be specific, use platform names, avoid fluff. Do not use markdown.

Totals: spend $${data.totals.spend.toFixed(0)}, revenue $${data.totals.revenue.toFixed(0)}, ROAS ${data.totals.roas.toFixed(2)}x, CPC $${data.totals.cpc.toFixed(2)}, CTR ${data.totals.ctr.toFixed(2)}%, CPA $${data.totals.cpa.toFixed(2)}, conversions ${data.totals.conversions}.

By platform:
${platformLines}`;

      const res = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Lovable-API-Key": apiKey,
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash",
          messages: [
            { role: "system", content: "You are a concise ad performance analyst." },
            { role: "user", content: prompt },
          ],
        }),
      });
      if (!res.ok) {
        return { summary: data.fallback, source: "fallback" as const };
      }
      const json = await res.json() as { choices?: { message?: { content?: string } }[] };
      const text = json.choices?.[0]?.message?.content?.trim();
      if (!text) return { summary: data.fallback, source: "fallback" as const };
      return { summary: text, source: "ai" as const };
    } catch {
      return { summary: data.fallback, source: "fallback" as const };
    }
  });
