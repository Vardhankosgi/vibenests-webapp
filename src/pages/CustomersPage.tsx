import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Users, UserCheck, UserX, TrendingUp, Download, Mail, Phone, User, Star } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useAppData } from "@/components/admin/AppDataContext";
import { useTranslation } from "react-i18next";
import {
  AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer, PieChart, Pie, Cell,
} from "recharts";

const monthlyGrowth = [
  { month: "Jan", customers: 120, new: 14 },
  { month: "Feb", customers: 134, new: 18 },
  { month: "Mar", customers: 149, new: 15 },
  { month: "Apr", customers: 158, new: 12 },
  { month: "May", customers: 167, new: 16 },
  { month: "Jun", customers: 176, new: 21 },
  { month: "Jul", customers: 183, new: 19 },
  { month: "Aug", customers: 190, new: 23 },
  { month: "Sep", customers: 196, new: 17 },
  { month: "Oct", customers: 207, new: 22 },
  { month: "Nov", customers: 216, new: 18 },
  { month: "Dec", customers: 228, new: 24 },
];

const bookingFreq = [
  { range: "1 Booking", count: 82 },
  { range: "2 Bookings", count: 54 },
  { range: "3 Bookings", count: 31 },
  { range: "4 Bookings", count: 18 },
  { range: "5+ Bookings", count: 11 },
];

const acquisitionData = [
  { name: "Direct", value: 38, color: "oklch(0.78 0.13 80)" },
  { name: "Referral", value: 27, color: "oklch(0.65 0.10 80)" },
  { name: "Social Media", value: 22, color: "oklch(0.55 0.09 75)" },
  { name: "Organic Search", value: 13, color: "oklch(0.42 0.07 70)" },
];

export default function CustomersPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { users, stats } = useAppData();
  const [sortBy, setSortBy] = useState<"bookings" | "spent">("spent");

  const totalCustomers = stats.totalCustomers;
  const activeCustomers = stats.activeCustomers;
  const blockedCustomers = stats.blockedCustomers;
  const newThisMonth = users.filter(u => u.joined.includes("Jun 2025")).length;

  // Build top customers from real users
  const topCustomers = users
    .filter(u => u.role === "Guest")
    .map(u => ({
      ...u,
      spent: u.bookings * 7200,
    }));

  const sorted = [...topCustomers].sort((a, b) => b[sortBy] - a[sortBy]);
  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Customers" />
      <div className="p-6 space-y-6">

        {/* Back + actions */}
        <div className="flex items-center justify-between">
          <button onClick={() => navigate("/dashboard")} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition">
            <ArrowLeft className="h-4 w-4" /> {t("app.admin.backToDashboard", "Back to Dashboard")}
          </button>
          <button className="flex items-center gap-2 text-xs gold-btn px-4 py-2 rounded-lg font-medium">
            <Download className="h-3.5 w-3.5" /> {t("app.admin.exportReport", "Export Report")}
          </button>
        </div>

        {/* KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {[
            { label: t("app.admin.totalCustomersLabel", "Total Customers"), value: totalCustomers, sub: "+9% vs last month", up: true, icon: Users, accent: "border-[var(--gold)]/30", onClick: () => navigate("/customers") },
            { label: t("app.admin.activeCustomers", "Active Customers"), value: activeCustomers, sub: `${Math.round((activeCustomers / totalCustomers) * 100)}% of total`, up: true, icon: UserCheck, accent: "border-emerald-500/30" },
            { label: t("app.admin.blocked", "Blocked"), value: blockedCustomers, sub: `${Math.round((blockedCustomers / totalCustomers) * 100)}% of total`, up: false, icon: UserX, accent: "border-destructive/30" },
            { label: t("app.admin.newThisMonth", "New This Month"), value: newThisMonth, sub: "+33% vs last month", up: true, icon: TrendingUp, accent: "border-[var(--gold)]/20" },
          ].map((c) => (
            <div key={c.label} onClick={c.onClick}
              className={`glass-card rounded-2xl p-5 border ${c.accent} flex items-start justify-between gap-4 ${c.onClick ? "cursor-pointer hover:border-[var(--gold)]/50 transition" : ""}`}>
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-wide">{c.label}</p>
                <p className="font-display text-3xl font-semibold text-foreground mt-1">{c.value}</p>
                <p className={`text-xs mt-2 ${c.up ? "text-emerald-400" : "text-destructive"}`}>{c.sub}</p>
              </div>
              <div className="h-11 w-11 shrink-0 rounded-xl bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center">
                <c.icon className="h-5 w-5 text-gold" />
              </div>
            </div>
          ))}
        </div>

        {/* Growth Chart + Acquisition Pie */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2 glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium mb-4">{t("app.admin.customerGrowthTitle", "Customer Growth")}</h3>
            <ResponsiveContainer width="100%" height={260}>
              <AreaChart data={monthlyGrowth}>
                <defs>
                  <linearGradient id="custGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.78 0.13 80)" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="oklch(0.78 0.13 80)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="newGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="oklch(0.55 0.18 230)" stopOpacity={0.25} />
                    <stop offset="95%" stopColor="oklch(0.55 0.18 230)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" />
                <XAxis dataKey="month" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} />
                <Tooltip
                  contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px" }}
                  formatter={(v: number, name: string) => [v, name === "customers" ? "Total Customers" : "New Customers"]}
                />
                <Area type="monotone" dataKey="customers" stroke="oklch(0.78 0.13 80)" strokeWidth={2} fill="url(#custGrad)" />
                <Area type="monotone" dataKey="new" stroke="oklch(0.55 0.18 230)" strokeWidth={2} fill="url(#newGrad)" />
              </AreaChart>
            </ResponsiveContainer>
            <div className="flex gap-4 mt-2 justify-end">
              {[{ color: "oklch(0.78 0.13 80)", label: "Total" }, { color: "oklch(0.55 0.18 230)", label: "New" }].map((l) => (
                <div key={l.label} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span className="h-2 w-4 rounded-full" style={{ background: l.color }} />
                  {l.label}
                </div>
              ))}
            </div>
          </div>

          <div className="glass-card rounded-2xl p-5">
            <h3 className="font-display text-lg font-medium mb-4">{t("app.admin.acquisition", "Acquisition")}</h3>
            <ResponsiveContainer width="100%" height={190}>
              <PieChart>
                <Pie data={acquisitionData} cx="50%" cy="50%" innerRadius={50} outerRadius={75} paddingAngle={3} dataKey="value">
                  {acquisitionData.map((p, i) => <Cell key={i} fill={p.color} />)}
                </Pie>
                <Tooltip
                  contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px" }}
                  formatter={(v: number) => [`${v}%`, ""]}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="space-y-2 mt-1">
              {acquisitionData.map((p) => (
                <div key={p.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: p.color }} />
                    <span className="text-muted-foreground">{p.name}</span>
                  </div>
                  <span className="text-foreground font-medium">{p.value}%</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Booking Frequency */}
        <div className="glass-card rounded-2xl p-5">
          <h3 className="font-display text-lg font-medium mb-4">{t("app.admin.bookingFreqDist", "Booking Frequency Distribution")}</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={bookingFreq}>
              <CartesianGrid strokeDasharray="3 3" stroke="oklch(1 0 0 / 0.06)" vertical={false} />
              <XAxis dataKey="range" tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fill: "oklch(0.72 0.02 90)", fontSize: 12 }} axisLine={false} tickLine={false} />
              <Tooltip
                contentStyle={{ background: "oklch(0.13 0.025 260)", border: "1px solid oklch(0.78 0.13 80 / 0.2)", borderRadius: "8px" }}
                formatter={(v: number) => [v, "Customers"]}
              />
              <Bar dataKey="count" fill="oklch(0.78 0.13 80)" radius={[6, 6, 0, 0]}>
                {bookingFreq.map((_, i) => (
                  <Cell key={i} fill={`oklch(${0.78 - i * 0.07} ${0.13 - i * 0.01} 80)`} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Top Customers Table */}
        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-medium flex items-center gap-2">
              <Star className="h-4 w-4 text-gold" /> {t("app.admin.topCustomers", "Top Customers")}
            </h3>
            <div className="flex gap-1 p-1 rounded-lg bg-white/[0.04] border border-white/[0.06]">
              {(["spent", "bookings"] as const).map((s) => (
                <button key={s} onClick={() => setSortBy(s)}
                  className={`px-3 py-1 rounded-md text-xs font-medium capitalize transition ${sortBy === s ? "bg-[var(--gold)]/20 text-gold border border-[var(--gold)]/30" : "text-muted-foreground hover:text-foreground"}`}>
                  {s === "spent" ? t("app.admin.bySpend", "By Spend") : t("app.admin.byBookings", "By Bookings")}
                </button>
              ))}
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="pb-3 pr-4">{t("app.admin.rank", "Rank")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.customer", "Customer")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.contact", "Contact")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.joined", "Joined")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.bookings", "Bookings")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.totalSpent", "Total Spent")}</th>
                  <th className="pb-3">{t("app.admin.status", "Status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {sorted.map((u, i) => (
                  <tr key={u.id} className="hover:bg-white/[0.02] transition">
                    <td className="py-3 pr-4">
                      <span className={`h-6 w-6 rounded-full flex items-center justify-center text-xs font-bold ${i === 0 ? "bg-[var(--gold)]/20 text-gold" : i === 1 ? "bg-white/10 text-muted-foreground" : i === 2 ? "bg-amber-700/20 text-amber-600" : "text-muted-foreground"}`}>
                        {i + 1}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-gold" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium">{u.name}</p>
                          <p className="text-[11px] text-muted-foreground">{u.id}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col gap-0.5">
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Mail className="h-3 w-3" />{u.email}</span>
                        <span className="flex items-center gap-1.5 text-xs text-muted-foreground"><Phone className="h-3 w-3" />{u.phone}</span>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{u.joined}</td>
                    <td className="py-3 pr-4 text-foreground font-medium">{u.bookings}</td>
                    <td className="py-3 pr-4 text-gold font-medium">₹{u.spent.toLocaleString()}</td>
                    <td className="py-3">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${u.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : "bg-destructive/10 text-destructive border-destructive/20"}`}>
                        {u.status === "Active" ? t("app.admin.active", "Active") : t("app.admin.blocked", "Blocked")}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <button onClick={() => navigate("/customers")} className="mt-4 w-full py-2.5 rounded-xl text-xs text-gold border border-[var(--gold)]/20 hover:bg-[var(--gold)]/5 transition">
            {t("app.admin.viewAllCustomers", "View All Customers →")}
          </button>
        </div>

      </div>
    </div>
  );
}
