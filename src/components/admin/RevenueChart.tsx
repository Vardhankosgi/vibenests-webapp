import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { useAppData, parseAmount } from "@/components/admin/AppDataContext";

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function getMonthIndex(dateStr: string): number {
  if (!dateStr) return -1;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) {
    return d.getMonth(); // 0-11
  }
  for (let i = 0; i < MONTHS.length; i++) {
    if (dateStr.toLowerCase().includes(MONTHS[i].toLowerCase())) {
      return i;
    }
  }
  return -1;
}

export function RevenueChart() {
  const { t } = useTranslation();
  const { filteredBookings } = useAppData();

  const data = MONTHS.map((month, index) => {
    const revenue = filteredBookings
      .filter((b) => b.status === "Confirmed" && getMonthIndex(b.date) === index)
      .reduce((s, b) => s + parseAmount(b.amount), 0);
    return { month, revenue };
  });

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-lg font-medium text-foreground mb-4">{t("app.admin.revenueOverview", "Revenue Overview")}</h3>
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
            formatter={(v: number) => [`₹${v.toLocaleString("en-IN")}`, t("app.admin.revenue", "Revenue")]}
          />
          <Area type="monotone" dataKey="revenue" stroke="oklch(0.78 0.13 80)" strokeWidth={2} fill="url(#goldGrad)" />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
