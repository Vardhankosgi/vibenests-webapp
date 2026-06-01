import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";

const data = [
  { day: "Mon", bookings: 4 },
  { day: "Tue", bookings: 7 },
  { day: "Wed", bookings: 5 },
  { day: "Thu", bookings: 9 },
  { day: "Fri", bookings: 13 },
  { day: "Sat", bookings: 18 },
  { day: "Sun", bookings: 15 },
];

export function BookingChart() {
  return (
    <div className="glass-card rounded-2xl p-5">
      <h3 className="font-display text-lg font-medium text-foreground mb-4">Weekly Bookings</h3>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barSize={28}>
          <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" vertical={false} />
          <XAxis dataKey="day" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} />
          <Tooltip
            contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px", color: "#D4A03C" }}
            formatter={(v: number) => [v, "Bookings"]}
            cursor={{ fill: "oklch(1 0 0 / 0.04)" }}
          />
          <Bar dataKey="bookings" fill="oklch(0.78 0.13 80)" radius={[6, 6, 0, 0]} activeBar={{ fill: "oklch(0.78 0.13 80)", stroke: "none" }} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
