import { createFileRoute, Link } from "@tanstack/react-router";
import { ConvergenceHero } from "@/components/landing/ConvergenceHero";
import { BarChart3, Bell, Sparkles, Bookmark, Users, FileDown } from "lucide-react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Signal — One clear view of every ad platform" },
      { name: "description", content: "Signal unifies Google Ads, Meta Ads, and LinkedIn Ads into a single data-dense control room." },
      { property: "og:title", content: "Signal — One clear view of every ad platform" },
      { property: "og:description", content: "Signal unifies Google Ads, Meta Ads, and LinkedIn Ads into a single data-dense control room." },
    ],
  }),
  component: Landing,
});

const features = [
  { icon: BarChart3, title: "Unified metrics", body: "Spend, ROAS, CPC, CTR normalized across every platform, on one canvas." },
  { icon: Bell, title: "Pacing alerts", body: "Rule-based flags when CPA spikes or spend runs hot in the last 3 days." },
  { icon: Sparkles, title: "AI readouts", body: "Plain-English summaries of what's working and one concrete next action." },
  { icon: Bookmark, title: "Saved views", body: "Pin platform + date-range combinations and reopen them in one click." },
  { icon: Users, title: "Roles", body: "Admin / viewer roles so teammates see the right slice of the data." },
  { icon: FileDown, title: "CSV export", body: "Any filtered view exports to CSV instantly — bring your own tools." },
];

function Landing() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" aria-hidden />
            <span className="font-display text-lg font-semibold tracking-tight">Signal</span>
          </div>
          <Link
            to="/login"
            className="rounded-md border border-border px-3 py-1.5 text-sm text-foreground transition-colors hover:bg-accent"
          >
            Sign in
          </Link>
        </div>
      </header>

      <main>
        <section className="mx-auto max-w-6xl px-6 pt-16 pb-8 md:pt-24">
          <div className="grid gap-12 md:grid-cols-2 md:items-center">
            <div>
              <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1 text-xs font-mono text-muted-foreground">
                <span className="h-1.5 w-1.5 rounded-full bg-[color:var(--positive)]" /> LIVE · MVP
              </p>
              <h1 className="font-display text-4xl font-semibold leading-[1.05] tracking-tight md:text-6xl">
                Three ad platforms.
                <br />
                <span className="text-primary">One signal.</span>
              </h1>
              <p className="mt-6 max-w-md text-base text-muted-foreground md:text-lg">
                Signal pulls Google Ads, Meta Ads, and LinkedIn Ads into one control room —
                spend, ROAS, CPC, CTR, and campaign health, side by side.
              </p>
              <div className="mt-8 flex flex-wrap gap-3">
                <Link
                  to="/login"
                  className="rounded-md bg-primary px-5 py-2.5 text-sm font-medium text-primary-foreground transition-colors hover:bg-primary/90"
                >
                  Get started free
                </Link>
                <a
                  href="#features"
                  className="rounded-md border border-border px-5 py-2.5 text-sm text-foreground transition-colors hover:bg-accent"
                >
                  See what's inside
                </a>
              </div>
            </div>
            <ConvergenceHero />
          </div>
        </section>

        <section id="features" className="mx-auto max-w-6xl px-6 py-20">
          <h2 className="font-display text-2xl font-semibold tracking-tight md:text-3xl">
            Built for daily use, not a demo
          </h2>
          <p className="mt-2 max-w-xl text-sm text-muted-foreground">
            No dashboards to configure, no chart libraries to wrangle. Just the numbers you check every morning.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {features.map((f) => (
              <div key={f.title} className="rounded-lg border border-border bg-card p-5 transition-colors hover:border-primary/40">
                <f.icon className="h-5 w-5 text-primary" />
                <h3 className="mt-3 font-display text-base font-semibold">{f.title}</h3>
                <p className="mt-1.5 text-sm text-muted-foreground">{f.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <footer className="border-t border-border">
        <div className="mx-auto flex max-w-6xl flex-col items-start justify-between gap-3 px-6 py-8 text-sm text-muted-foreground md:flex-row md:items-center">
          <div className="flex items-center gap-2">
            <div className="h-1.5 w-1.5 rounded-full bg-primary" aria-hidden />
            <span className="font-display font-medium text-foreground">Signal</span>
            <span className="font-mono text-xs">v0.1 · MVP</span>
          </div>
          <Link to="/login" className="hover:text-foreground">Sign in →</Link>
        </div>
      </footer>
    </div>
  );
}
