import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from "recharts";
import { useTranslation } from "react-i18next";
import { useAppData } from "@/components/admin/AppDataContext";

const COLORS = [
  "#D4A03C",  // gold — Suite Bookings
  "#60A5FA",  // blue — Add-ons & Extras
];

export function RevenuePieChart() {
  const { t } = useTranslation();
  const { filteredBookings } = useAppData();

  const confirmedBookings = filteredBookings.filter((b) => b.status === "Confirmed");
  const suiteRev = confirmedBookings.reduce((sum, b) => sum + (b.basePrice || 0), 0);
  const addonsRev = confirmedBookings.reduce((sum, b) => sum + (b.addonsTotal || 0), 0);

  const total = suiteRev + addonsRev || 1;

  const data = [
    { name: t("app.admin.suiteBookings", "Suite Bookings"), value: Math.round((suiteRev / total) * 100) },
    { name: t("app.admin.addons", "Add-ons & Extras"), value: Math.round((addonsRev / total) * 100) },
  ].filter(item => item.value > 0 || confirmedBookings.length === 0);

  // If no bookings or zero values, show a default split so the chart has visual state
  const displayData = data.length > 0 ? data : [
    { name: t("app.admin.suiteBookings", "Suite Bookings"), value: 100 },
  ];

  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-lg font-medium text-foreground mb-4">{t("app.admin.revenueBreakdown", "Revenue Breakdown")}</h3>
      <ResponsiveContainer width="100%" height={260}>
        <PieChart>
          <Pie data={displayData} cx="50%" cy="50%" innerRadius={65} outerRadius={95} paddingAngle={3} dataKey="value">
            {displayData.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
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
