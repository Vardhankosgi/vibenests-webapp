import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";

const data = [
  { name: "Suite Bookings", value: 62 },
  { name: "Add-ons", value: 21 },
  { name: "Decorations", value: 11 },
  { name: "Other", value: 6 },
];

const COLORS = [
  "#D4A03C",  // gold — Suite Bookings
  "#60A5FA",  // blue — Add-ons
  "#34D399",  // emerald — Decorations
  "#A78BFA",  // purple — Other
];

export function RevenuePieChart() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-lg font-medium text-foreground mb-4">Revenue Breakdown</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value">
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px", color: "#D4A03C" }}
            itemStyle={{ color: "#D4A03C" }}
            labelStyle={{ color: "#D4A03C" }}
            formatter={(value: number, name: string) => [`${value}%`, name]}
          />
          <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "12px", color: "oklch(0.72 0.02 90)" }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
