import { useCallback, useEffect, useState } from "react";
import { Bookmark, Save } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import type { FilterState } from "@/lib/dashboard-utils";

interface SavedView {
  id: string;
  name: string;
  filters: FilterState;
}

export function SavedViews({
  filters,
  onLoad,
}: {
  filters: FilterState;
  onLoad: (f: FilterState) => void;
}) {
  const [views, setViews] = useState<SavedView[]>([]);
  const [saving, setSaving] = useState(false);

  const refresh = useCallback(async () => {
    const { data } = await supabase
      .from("saved_views")
      .select("id, name, filters")
      .order("created_at", { ascending: false });
    if (data) {
      setViews(
        data.map((v) => ({
          id: v.id as string,
          name: v.name as string,
          filters: v.filters as unknown as FilterState,
        })),
      );
    }
  }, []);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  async function handleSave() {
    const name = window.prompt("Name this view", `${filters.days}d · ${filters.platforms.length} platforms`);
    if (!name) return;
    setSaving(true);
    const { data: userData } = await supabase.auth.getUser();
    if (!userData.user) {
      setSaving(false);
      return;
    }
    await supabase.from("saved_views").insert({
      user_id: userData.user.id,
      name,
      filters: filters as unknown as Record<string, unknown>,
    });
    setSaving(false);
    await refresh();
  }

  return (
    <div className="flex items-center gap-2">
      {views.length > 0 && (
        <select
          onChange={(e) => {
            const v = views.find((x) => x.id === e.target.value);
            if (v) onLoad(v.filters);
          }}
          defaultValue=""
          className="rounded-md border border-border bg-background px-2 py-1.5 font-mono text-xs text-foreground outline-none focus:border-primary"
        >
          <option value="" disabled>
            Load saved view…
          </option>
          {views.map((v) => (
            <option key={v.id} value={v.id}>
              {v.name}
            </option>
          ))}
        </select>
      )}
      <button
        onClick={handleSave}
        disabled={saving}
        className="inline-flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs text-muted-foreground hover:bg-accent hover:text-foreground disabled:opacity-60"
      >
        {views.length > 0 ? <Save className="h-3.5 w-3.5" /> : <Bookmark className="h-3.5 w-3.5" />}
        Save view
      </button>
    </div>
  );
}
