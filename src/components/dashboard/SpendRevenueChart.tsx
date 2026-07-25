import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer, Legend } from "recharts";

export function SpendRevenueChart({ data }: { data: { date: string; spend: number; revenue: number }[] }) {
  return (
    <div className="h-64 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="var(--color-border)" strokeDasharray="2 4" vertical={false} />
          <XAxis dataKey="date" tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "JetBrains Mono" }} tickFormatter={(d) => d.slice(5)} minTickGap={20} axisLine={{ stroke: "var(--color-border)" }} tickLine={false} />
          <YAxis tick={{ fill: "var(--color-muted-foreground)", fontSize: 10, fontFamily: "JetBrains Mono" }} axisLine={false} tickLine={false} width={44} />
          <Tooltip contentStyle={{ background: "var(--color-popover)", border: "1px solid var(--color-border)", borderRadius: 8, fontSize: 12 }} labelStyle={{ color: "var(--color-muted-foreground)", fontFamily: "JetBrains Mono" }} formatter={(v: number, name) => [`$${Math.round(v).toLocaleString()}`, name]} />
          <Legend wrapperStyle={{ fontSize: 11, fontFamily: "JetBrains Mono", color: "var(--color-muted-foreground)" }} />
          <Line type="monotone" dataKey="spend" stroke="var(--signal)" strokeWidth={1.75} dot={false} name="Spend" />
          <Line type="monotone" dataKey="revenue" stroke="var(--positive)" strokeWidth={1.75} dot={false} name="Revenue" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
