import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect, useMemo, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { generateMockCampaigns, PLATFORM_LABELS, type Platform } from "@/lib/mock-data";
import {
  computeAlerts,
  computeKpis,
  downloadCsv,
  filterRows,
  formatCurrency,
  formatNumber,
  roasByPlatform,
  rowsToCsv,
  seriesByDate,
  type FilterState,
} from "@/lib/dashboard-utils";
import { FilterBar } from "@/components/dashboard/FilterBar";
import { KpiCard } from "@/components/dashboard/KpiCard";
import { SpendRevenueChart } from "@/components/dashboard/SpendRevenueChart";
import { RoasChart } from "@/components/dashboard/RoasChart";
import { AlertsPanel } from "@/components/dashboard/AlertsPanel";
import { AiReadoutPanel } from "@/components/dashboard/AiReadoutPanel";
import { SavedViews } from "@/components/dashboard/SavedViews";
import { LogOut, Download } from "lucide-react";

export const Route = createFileRoute("/_authenticated/dashboard")({
  head: () => ({
    meta: [
      { title: "Dashboard · Signal" },
      { name: "description", content: "Your unified ad performance dashboard." },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: Dashboard,
});

const ALL_PLATFORMS: Platform[] = ["google_ads", "meta_ads", "linkedin_ads"];

function Dashboard() {
  const navigate = useNavigate();
  const [email, setEmail] = useState<string>("");
  const [filters, setFilters] = useState<FilterState>({
    platforms: ALL_PLATFORMS,
    days: 30,
  });

  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? ""));
  }, []);

  // Mock data generated once on the client.
  const rows = useMemo(() => generateMockCampaigns(90), []);
  const filtered = useMemo(() => filterRows(rows, filters), [rows, filters]);
  const kpis = useMemo(() => computeKpis(filtered), [filtered]);
  const series = useMemo(() => seriesByDate(filtered), [filtered]);
  const roas = useMemo(() => roasByPlatform(filtered), [filtered]);
  const alerts = useMemo(() => computeAlerts(filtered), [filtered]);

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate({ to: "/login", replace: true });
  }

  function handleExport() {
    const csv = rowsToCsv(filtered);
    downloadCsv(`signal-export-${new Date().toISOString().slice(0, 10)}.csv`, csv);
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border">
        <div className="mx-auto flex h-14 max-w-[1400px] items-center justify-between px-6">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-full bg-primary" />
            <span className="font-display text-base font-semibold tracking-tight">Signal</span>
          </div>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden font-mono text-xs text-muted-foreground sm:inline">{email}</span>
            <button
              onClick={handleSignOut}
              className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground"
            >
              <LogOut className="h-3.5 w-3.5" /> Sign out
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1400px] space-y-5 px-6 py-6">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-2xl font-semibold tracking-tight">Campaign performance</h1>
            <p className="mt-1 text-xs font-mono uppercase tracking-widest text-muted-foreground">
              {filters.platforms.length} of 3 platforms · last {filters.days} days
            </p>
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 rounded-md bg-primary px-3 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
          >
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3">
          <FilterBar filters={filters} onChange={setFilters} />
          <SavedViews filters={filters} onLoad={setFilters} />
        </div>

        <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
          <KpiCard label="Spend" value={formatCurrency(kpis.spend)} sub={`${formatNumber(kpis.conversions, 0)} conversions`} />
          <KpiCard label="ROAS" value={`${kpis.roas.toFixed(2)}×`} sub={formatCurrency(kpis.revenue) + " revenue"} accent />
          <KpiCard label="CPC" value={`$${kpis.cpc.toFixed(2)}`} sub={`${formatNumber(kpis.clicks, 0)} clicks`} />
          <KpiCard label="CTR" value={`${kpis.ctr.toFixed(2)}%`} sub={`${formatNumber(kpis.impressions, 0)} impressions`} />
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Spend vs revenue">
            <SpendRevenueChart data={series} />
          </Panel>
          <Panel title="ROAS by platform">
            <RoasChart data={roas} />
          </Panel>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          <Panel title="Alerts">
            <AlertsPanel alerts={alerts} />
          </Panel>
          <Panel title="AI performance readout">
            <AiReadoutPanel filtered={filtered} windowDays={filters.days} />
          </Panel>
        </div>

        <footer className="pt-6 pb-2 text-center font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
          Signal · MVP · Mock data — real API adapters swap in behind the same interface
        </footer>
      </main>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg border border-border bg-card">
      <div className="flex h-11 items-center justify-between border-b border-border px-4">
        <h2 className="font-display text-sm font-semibold tracking-tight">{title}</h2>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}

// Silence unused imports when platforms map is not directly consumed here.
void PLATFORM_LABELS;
