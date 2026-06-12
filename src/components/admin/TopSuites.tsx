import { useState } from "react";
import { useTranslation } from "react-i18next";
import { useAppData, parseAmount } from "@/components/admin/AppDataContext";

const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

export function TopSuites() {
  const currentMonth = months[new Date().getMonth()];
  const [selected, setSelected] = useState(currentMonth);
  const { bookings } = useAppData();
  const { t } = useTranslation();

  // Filter confirmed bookings that match the selected month
  const monthBookings = bookings.filter((b) => b.status === "Confirmed" && b.date.includes(selected));

  // Group bookings and sum revenue by suite name
  const suiteStats: Record<string, { bookingsCount: number; revenue: number }> = {};
  monthBookings.forEach((b) => {
    const name = b.suite;
    if (!suiteStats[name]) {
      suiteStats[name] = { bookingsCount: 0, revenue: 0 };
    }
    suiteStats[name].bookingsCount += 1;
    suiteStats[name].revenue += parseAmount(b.amount);
  });

  const maxBookings = Math.max(...Object.values(suiteStats).map(s => s.bookingsCount), 1);

  const sortedSuites = Object.entries(suiteStats)
    .map(([name, stats]) => ({
      name,
      bookings: stats.bookingsCount,
      revenue: `₹${stats.revenue.toLocaleString()}`,
      occupancy: Math.round((stats.bookingsCount / maxBookings) * 100),
    }))
    .sort((a, b) => b.bookings - a.bookings)
    .slice(0, 4);

  return (
    <div className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <h3 className="font-display text-lg font-medium text-foreground">{t("app.admin.topPerformingSuites", "Top Performing Suites")}</h3>
        <select
          value={selected}
          onChange={(e) => setSelected(e.target.value)}
          className="luxury-input rounded-lg px-3 py-1.5 text-xs text-foreground bg-transparent cursor-pointer"
        >
          {months.map((m) => (
            <option key={m} value={m} className="bg-[oklch(0.13_0.025_260)]">{m}</option>
          ))}
        </select>
      </div>

      <div className="space-y-4">
        {sortedSuites.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground text-sm">
            {t("app.admin.noBookingsFor", "No bookings found for")} {selected}
          </div>
        ) : (
          sortedSuites.map((suite, i) => (
            <div key={suite.name} className="flex items-center gap-4">
              <span className="text-xs font-bold text-muted-foreground w-4">{i + 1}</span>
              <div className="flex-1 min-w-0">
                <p className="text-sm text-foreground truncate">{suite.name}</p>
                <div className="mt-1.5 h-1.5 w-full rounded-full bg-white/[0.06]">
                  <div
                    className="h-1.5 rounded-full bg-gradient-to-r from-[var(--gold-deep)] to-[var(--gold)]"
                    style={{ width: `${suite.occupancy}%` }}
                  />
                </div>
              </div>
              <div className="text-right shrink-0">
                <p className="text-xs text-gold font-medium">{suite.revenue}</p>
                <p className="text-[11px] text-muted-foreground">{suite.bookings} {t("app.admin.bookings", "bookings")}</p>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
