import { AdminHeader } from "@/components/admin/AdminHeader";
import { useSuitesContext } from "@/components/admin/SuitesContext";
import { TrendingUp, TrendingDown, IndianRupee, CalendarDays, Users, Star } from "lucide-react";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import {
  AreaChart, Area, BarChart, Bar, LineChart, Line,
  PieChart, Pie, Cell, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, XAxis, YAxis, CartesianGrid, Tooltip,
  Legend, ResponsiveContainer,
} from "recharts";

const GOLD = "#D4A03C";
const BLUE = "#60A5FA";
const GREEN = "#34D399";
const PURPLE = "#A78BFA";
const RED = "#F87171";

const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];

const revenueData = [
  { month: "Jan", revenue: 42000, target: 50000 },
  { month: "Feb", revenue: 58000, target: 55000 },
  { month: "Mar", revenue: 51000, target: 55000 },
  { month: "Apr", revenue: 73000, target: 65000 },
  { month: "May", revenue: 91000, target: 75000 },
  { month: "Jun", revenue: 87000, target: 80000 },
  { month: "Jul", revenue: 105000, target: 90000 },
  { month: "Aug", revenue: 98000, target: 95000 },
  { month: "Sep", revenue: 112000, target: 100000 },
  { month: "Oct", revenue: 124000, target: 110000 },
  { month: "Nov", revenue: 138000, target: 120000 },
  { month: "Dec", revenue: 152000, target: 130000 },
];

const BASE_BOOKING_TREND = [
  { month: "Jan", confirmed: 28, pending: 6, cancelled: 3 },
  { month: "Feb", confirmed: 34, pending: 8, cancelled: 2 },
  { month: "Mar", confirmed: 30, pending: 5, cancelled: 4 },
  { month: "Apr", confirmed: 42, pending: 9, cancelled: 3 },
  { month: "May", confirmed: 55, pending: 11, cancelled: 5 },
  { month: "Jun", confirmed: 50, pending: 8, cancelled: 4 },
  { month: "Jul", confirmed: 62, pending: 13, cancelled: 6 },
  { month: "Aug", confirmed: 58, pending: 10, cancelled: 5 },
  { month: "Sep", confirmed: 68, pending: 14, cancelled: 4 },
  { month: "Oct", confirmed: 74, pending: 12, cancelled: 7 },
  { month: "Nov", confirmed: 82, pending: 15, cancelled: 6 },
  { month: "Dec", confirmed: 91, pending: 18, cancelled: 8 },
];

const BASE_OCCASIONS = [
  { name: "Birthday", value: 38 },
  { name: "Anniversary", value: 27 },
  { name: "Proposal", value: 18 },
  { name: "Surprise Party", value: 12 },
  { name: "Other", value: 5 },
];
const OCCASION_COLORS = [GOLD, BLUE, GREEN, PURPLE, RED];

const tooltipStyle = {
  contentStyle: { background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px", color: "#D4A03C", fontSize: "12px" },
  itemStyle: { color: "#D4A03C" },
  labelStyle: { color: "#D4A03C" },
};

const kpis = [
  { label: "Total Revenue", value: "₹13.1L", change: "+22%", up: true, icon: IndianRupee },
  { label: "Total Bookings", value: "677", change: "+18%", up: true, icon: CalendarDays },
  { label: "Avg. Rating", value: "4.7 ★", change: "+0.3", up: true, icon: Star },
  { label: "New Customers", value: "312", change: "+14%", up: true, icon: Users },
  { label: "Cancellation Rate", value: "6.2%", change: "-1.1%", up: false, icon: TrendingDown },
  { label: "Avg. Booking Value", value: "₹5,820", change: "+8%", up: true, icon: TrendingUp },
];

const RADAR_BASE = [92, 85, 95, 88, 72];
const RADAR_METRICS = ["Bookings", "Revenue", "Rating", "Occupancy", "Repeat"];

function seedOffset(id: string, metric: number) {
  const n = id.split("").reduce((a, c) => a + c.charCodeAt(0), 0);
  return ((n * (metric + 1) * 7) % 30) - 15;
}

export default function AnalyticsPage() {
  const { suites } = useSuitesContext();
  const axisStyle = { fill: "oklch(0.72 0.02 90)", fontSize: 11 };

  const activeSuites = suites.filter((s) => s.status === "Active").length || 1;
  const scale = activeSuites / 4;

  const bookingTrend = BASE_BOOKING_TREND.map((row) => ({
    month: row.month,
    confirmed: Math.round(row.confirmed * scale),
    pending: Math.round(row.pending * scale),
    cancelled: Math.round(row.cancelled * scale),
  }));

  const occasionData = BASE_OCCASIONS.map((o) => ({ name: o.name, value: Math.round(o.value * scale) }));

  const customerGrowth = months.map((month, i) => ({
    month,
    new: Math.floor((18 + i * 4) * scale),
    returning: Math.floor((10 + i * 2) * scale),
  }));

  const suitePerformance = RADAR_METRICS.map((metric, mi) => {
    const row: Record<string, string | number> = { metric };
    suites.forEach((s) => { row[s.id] = Math.min(100, Math.max(40, RADAR_BASE[mi] + seedOffset(s.id, mi))); });
    return row;
  });

  const hassuites = suites.length > 0;

  // Static fallback radar data used when no suites are loaded from API
  const FALLBACK_RADAR = RADAR_METRICS.map((metric, mi) => ({
    metric,
    "Suite A": RADAR_BASE[mi],
    "Suite B": Math.min(100, Math.max(40, RADAR_BASE[mi] + 8)),
  }));
  const radarData    = hassuites ? suitePerformance : FALLBACK_RADAR;
  const radarSeries  = hassuites
    ? suites.map((s, i) => ({ id: s.id,   name: s.name,  color: [GOLD, BLUE, GREEN, PURPLE, RED][i % 5], opacity: i === 0 ? 0.15 : 0.1 }))
    : [{ id: "Suite A", name: "Suite A", color: GOLD,  opacity: 0.15 },
       { id: "Suite B", name: "Suite B", color: BLUE,  opacity: 0.1  }];

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Analytics" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Performance overview</p>
          <DateRangePicker />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3">
          {kpis.map(({ label, value, change, up, icon: Icon }) => (
            <div key={label} className="glass-card rounded-2xl p-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-[10px] text-muted-foreground uppercase tracking-wide leading-tight">{label}</p>
                <Icon className="h-3.5 w-3.5 text-gold shrink-0" />
              </div>
              <p className="font-display text-xl font-semibold text-foreground">{value}</p>
              <p className={`text-[11px] mt-1 ${up ? "text-emerald-400" : "text-red-400"}`}>{change} vs last period</p>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-display text-lg font-medium text-foreground mb-4">Revenue vs Target</h3>
          <ResponsiveContainer width="100%" height={260}>
            <AreaChart data={revenueData}>
              <defs>
                <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={GOLD} stopOpacity={0.3} />
                  <stop offset="95%" stopColor={GOLD} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="tgtGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor={BLUE} stopOpacity={0.2} />
                  <stop offset="95%" stopColor={BLUE} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
              <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
              <YAxis tick={axisStyle} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
              <Tooltip {...tooltipStyle} formatter={(v: number) => [`₹${v.toLocaleString()}`, ""]} />
              <Legend wrapperStyle={{ fontSize: "12px" }} />
              <Area type="monotone" dataKey="revenue" name="Revenue" stroke={GOLD} strokeWidth={2} fill="url(#revGrad)" />
              <Area type="monotone" dataKey="target" name="Target" stroke={BLUE} strokeWidth={2} strokeDasharray="5 5" fill="url(#tgtGrad)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium text-foreground mb-4">Booking Trends</h3>
            <ResponsiveContainer width="100%" height={240}>
              <BarChart data={bookingTrend} barSize={14}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" vertical={false} />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} cursor={{ fill: "oklch(1 0 0 / 0.04)" }} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Bar dataKey="confirmed" name="Confirmed" fill={GREEN} radius={[4, 4, 0, 0]} />
                <Bar dataKey="pending" name="Pending" fill={GOLD} radius={[4, 4, 0, 0]} />
                <Bar dataKey="cancelled" name="Cancelled" fill={RED} radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium text-foreground mb-4">Bookings by Occasion</h3>
            <ResponsiveContainer width="100%" height={240}>
              <PieChart>
                <Pie data={occasionData} cx="50%" cy="50%" innerRadius={55} outerRadius={85} paddingAngle={3} dataKey="value">
                  {occasionData.map((_, i) => <Cell key={i} fill={OCCASION_COLORS[i]} />)}
                </Pie>
                <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [`${value}%`, name]} />
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "oklch(0.72 0.02 90)" }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium text-foreground mb-1">Suite Performance Radar</h3>
            <p className="text-xs text-muted-foreground mb-4">Score out of 100 across key metrics — {suites.length} suite{suites.length !== 1 ? "s" : ""}</p>
            <ResponsiveContainer width="100%" height={280}>
              <RadarChart data={radarData} cx="50%" cy="50%" outerRadius={90}>
                <PolarGrid stroke="oklch(1 0 0 / 0.08)" />
                <PolarAngleAxis dataKey="metric" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 11 }} />
                {radarSeries.map((s) => (
                  <Radar key={s.id} name={s.name} dataKey={s.id} stroke={s.color} fill={s.color} fillOpacity={s.opacity} strokeWidth={2} />
                ))}
                <Legend iconType="circle" iconSize={8} wrapperStyle={{ fontSize: "11px", color: "oklch(0.72 0.02 90)" }} />
                <Tooltip {...tooltipStyle} formatter={(value: number, name: string) => [`${value}/100`, name]} />
              </RadarChart>
            </ResponsiveContainer>
          </div>
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium text-foreground mb-4">Customer Growth</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={customerGrowth}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="month" tick={axisStyle} axisLine={false} tickLine={false} />
                <YAxis tick={axisStyle} axisLine={false} tickLine={false} />
                <Tooltip {...tooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
                <Line type="monotone" dataKey="new" name="New Customers" stroke={GOLD} strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="returning" name="Returning" stroke={PURPLE} strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
