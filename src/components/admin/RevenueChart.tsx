import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { month: "Jan", revenue: 42000 },
  { month: "Feb", revenue: 58000 },
  { month: "Mar", revenue: 51000 },
  { month: "Apr", revenue: 73000 },
  { month: "May", revenue: 68000 },
  { month: "Jun", revenue: 91000 },
  { month: "Jul", revenue: 87000 },
  { month: "Aug", revenue: 105000 },
  { month: "Sep", revenue: 98000 },
  { month: "Oct", revenue: 112000 },
  { month: "Nov", revenue: 124000 },
  { month: "Dec", revenue: 138000 },
];

export function RevenueChart() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-lg font-medium text-foreground mb-4">Revenue Overview</h3>
      <ResponsiveContainer width="100%" height={260}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="goldGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="oklch(0.78 0.13 80)" stopOpacity={0.3} />
              <stop offset="95%" stopColor="oklch(0.78 0.13 80)" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
          <XAxis dataKey="month" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
          <Tooltip
            contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px", color: "#D4A03C" }}
            formatter={(v: number) => [`₹${v.toLocaleString()}`, "Revenue"]}
          />
          <Area type="monotone" dataKey="revenue" stroke="oklch(0.78 0.13 80)" strokeWidth={2} fill="url(#goldGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
