import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Download, TrendingUp, TrendingDown, IndianRupee, BarChart2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, Cell, PieChart, Pie,
} from "recharts";

const monthlyAvg = [
  { month: "Jan", avg: 3200, bookings: 18 },
  { month: "Feb", avg: 3540, bookings: 22 },
  { month: "Mar", avg: 3280, bookings: 21 },
  { month: "Apr", avg: 3890, bookings: 26 },
  { month: "May", avg: 3710, bookings: 24 },
  { month: "Jun", avg: 4100, bookings: 29 },
  { month: "Jul", avg: 4020, bookings: 28 },
  { month: "Aug", avg: 4450, bookings: 31 },
  { month: "Sep", avg: 4230, bookings: 27 },
  { month: "Oct", avg: 4580, bookings: 32 },
  { month: "Nov", avg: 4820, bookings: 33 },
  { month: "Dec", avg: 5100, bookings: 36 },
];

const suiteAvg = [
  { suite: "Royal Celebration", avg: 8210, color: "oklch(0.78 0.13 80)" },
  { suite: "Starlight Romance", avg: 5900, color: "oklch(0.70 0.11 80)" },
  { suite: "Midnight Luxe", avg: 6320, color: "oklch(0.62 0.13 75)" },
  { suite: "Garden Bliss", avg: 4470, color: "oklch(0.55 0.10 75)" },
  { suite: "Pearl Terrace", avg: 4710, color: "oklch(0.48 0.08 75)" },
];

const occasionAvg = [
  { occasion: "Anniversary", avg: 7400, color: "oklch(0.78 0.13 80)" },
  { occasion: "Proposal", avg: 6800, color: "oklch(0.70 0.11 80)" },
  { occasion: "Birthday", avg: 5200, color: "oklch(0.62 0.12 75)" },
  { occasion: "Surprise Party", avg: 4600, color: "oklch(0.55 0.09 75)" },
  { occasion: "Date Night", avg: 3900, color: "oklch(0.48 0.08 75)" },
];

const valueRanges = [
  { range: "< ₹3k", count: 28 },
  { range: "₹3k–5k", count: 76 },
  { range: "₹5k–7k", count: 89 },
  { range: "₹7k–10k", count: 54 },
  { range: "> ₹10k", count: 37 },
];

const recentBookings = [
  { id: "#VN1042", guest: "Arjun Sharma", suite: "Royal Celebration Suite", occasion: "Birthday", date: "12 Jun 2025", amount: 8500, addons: 1200 },
  { id: "#VN1041", guest: "Priya Reddy", suite: "Starlight Romance Suite", occasion: "Anniversary", date: "11 Jun 2025", amount: 6200, addons: 800 },
  { id: "#VN1040", guest: "Rahul Mehta", suite: "Garden Bliss Suite", occasion: "Proposal", date: "10 Jun 2025", amount: 5000, addons: 500 },
  { id: "#VN1038", guest: "Vikram Nair", suite: "Royal Celebration Suite", occasion: "Anniversary", date: "08 Jun 2025", amount: 9200, addons: 1500 },
  { id: "#VN1037", guest: "Divya Krishnan", suite: "Starlight Romance Suite", occasion: "Surprise Party", date: "07 Jun 2025", amount: 11000, addons: 2200 },
  { id: "#VN1035", guest: "Ananya Singh", suite: "Midnight Luxe Suite", occasion: "Proposal", date: "05 Jun 2025", amount: 6500, addons: 900 },
  { id: "#VN1033", guest: "Meera Iyer", suite: "Starlight Romance Suite", occasion: "Birthday", date: "03 Jun 2025", amount: 7200, addons: 1100 },
];

const overallAvg = Math.round(monthlyAvg.reduce((s, m) => s + m.avg, 0) / monthlyAvg.length);
const highestMonth = monthlyAvg.reduce((a, b) => (b.avg > a.avg ? b : a));
const lowestMonth = monthlyAvg.reduce((a, b) => (b.avg < a.avg ? b : a));
const growth = Math.round(((monthlyAvg[11].avg - monthlyAvg[0].avg) / monthlyAvg[0].avg) * 100);

export default function AvgBookingValuePage() {
  const navigate = useNavigate();
  const [sortBy, setSortBy] = useState<"amount" | "addons">("amount");

  const sorted = [...recentBookings].sort((a, b) => b[sortBy] - a[sortBy]);

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Avg. Booking Value" />
      <div className="p-6 space-y-6">

        {/* Back + Export */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition">
            <ArrowLeft className="h-4 w-4" /> Back to Dashboard
          </button>
          <button className="flex items-center gap-2 text-xs gold-btn px-4 py-2 rounded-lg font-medium">
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: "Avg. Booking Value", value: `₹${overallAvg.toLocaleString()}`, sub: `+${growth}% YoY growth`, up: true, icon: IndianRupee, accent: "border-[var(--gold)]/30" },
            { label: "Highest Month", value: `₹${highestMonth.avg.toLocaleString()}`, sub: highestMonth.month + " 2025", up: true, icon: TrendingUp, accent: "border-emerald-500/30" },
            { label: "Lowest Month", value: `₹${lowestMonth.avg.toLocaleString()}`, sub: lowestMonth.month + " 2025", up: false, icon: TrendingDown, accent: "border-amber-500/30" },
            { label: "Avg. Add-on Value", value: "₹1,080", sub: "+14% vs last month", up: true, icon: BarChart2, accent: "border-[var(--gold)]/20" },
          ].map((c) => (
            <div key={c.label} className={`glass-card rounded-2xl p-5 border ${c.accent} flex items-start justify-between gap-4`}>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
                <p className="font-display text-3xl font-semibold text-foreground mt-1">{c.value}</p>
                <p className={`text-xs mt-2 ${c.up ? "text-emerald-400" : "text-amber-400"}`}>{c.sub}</p>
              </div>
              <div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center">
                <c.icon className="h-5 w-5 text-gold" />
              </div>
            </div>
          ))}
        </div>

        {/* Monthly Avg Trend + Value Range */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium mb-4">Monthly Avg. Booking Value Trend</h3>
            <ResponsiveContainer width="100%" height={260}>
              <LineChart data={monthlyAvg}>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="month" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px" }}
                  formatter={(v: number, name: string) => [name === "avg" ? `₹${v.toLocaleString()}` : v, name === "avg" ? "Avg Value" : "Bookings"]}
                />
                <Line type="monotone" dataKey="avg" stroke="oklch(0.78 0.13 80)" strokeWidth={2.5} dot={{ fill: "oklch(0.78 0.13 80)", r: 4 }} activeDot={{ r: 6 }} />
                <Line type="monotone" dataKey="bookings" stroke="oklch(0.55 0.18 230)" strokeWidth={1.5} strokeDasharray="4 3" dot={false} />
              </LineChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-end">
              {[{ color: "oklch(0.78 0.13 80)", label: "Avg Value" }, { color: "oklch(0.55 0.18 230)", label: "Bookings" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-4 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium mb-4">Value Range Distribution</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={valueRanges} cx="50%" cy="50%" innerRadius={50} outerRadius={78} paddingAngle={3} dataKey="count" nameKey="range">
                  {valueRanges.map((_, i) => (
                    <Cell key={i} fill={`oklch(${0.78 - i * 0.07} ${0.13 - i * 0.01} 80)`} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px" }}
                  formatter={(v: number, _: string, p) => [v + " bookings", p.payload.range]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {valueRanges.map((r, i) => (
                <div key={r.range} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: `oklch(${0.78 - i * 0.07} ${0.13 - i * 0.01} 80)` }} />
                    <span className="text-muted-foreground">{r.range}</span>
                  </div>
                  <span className="text-foreground font-medium">{r.count} bookings</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Suite Avg + Occasion Avg */}
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium mb-4">Avg. Value by Suite</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={suiteAvg} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis type="category" dataKey="suite" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 11 }} axisLine={false} tickLine={false} width={115} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px" }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, "Avg Value"]}
                />
                <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                  {suiteAvg.map((s, i) => <Cell key={i} fill={s.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium mb-4">Avg. Value by Occasion</h3>
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={occasionAvg} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" horizontal={false} />
                <XAxis type="number" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `₹${v / 1000}k`} />
                <YAxis type="category" dataKey="occasion" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 11 }} axisLine={false} tickLine={false} width={100} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px" }}
                  formatter={(v: number) => [`₹${v.toLocaleString()}`, "Avg Value"]}
                />
                <Bar dataKey="avg" radius={[0, 6, 6, 0]}>
                  {occasionAvg.map((o, i) => <Cell key={i} fill={o.color} />)}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Booking Value Breakdown Table */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-medium">Booking Value Breakdown</h3>
            <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              {(["amount", "addons"] as const).map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium transition ${sortBy === s ? "bg-[var(--gold)]/20 text-gold border border-[var(--gold)]/30" : "text-muted-foreground hover:text-foreground"}`}>
                  {s === "amount" ? "By Total" : "By Add-ons"}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="pb-3 pr-4">Booking ID</th>
                  <th className="pb-3 pr-4">Guest</th>
                  <th className="pb-3 pr-4">Suite</th>
                  <th className="pb-3 pr-4">Occasion</th>
                  <th className="pb-3 pr-4">Date</th>
                  <th className="pb-3 pr-4">Base + Add-ons</th>
                  <th className="pb-3">Total</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sorted.map((b) => (
                  <tr key={b.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 pr-4 text-gold font-medium">{b.id}</td>
                    <td className="py-3 pr-4 text-foreground">{b.guest}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{b.suite}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{b.occasion}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{b.date}</td>
                    <td className="py-3 pr-4 text-xs">
                      <span className="text-muted-foreground">₹{(b.amount - b.addons).toLocaleString()}</span>
                      <span className="text-muted-foreground mx-1">+</span>
                      <span className="text-[var(--gold-soft)]">₹{b.addons.toLocaleString()}</span>
                    </td>
                    <td className="py-3 text-foreground font-semibold">₹{b.amount.toLocaleString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
}
