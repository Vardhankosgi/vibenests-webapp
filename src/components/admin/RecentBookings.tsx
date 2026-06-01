import { useRef, useEffect } from "react";

const bookings = [
  { id: "#VN1042", guest: "Arjun Sharma", suite: "Royal Celebration Suite", date: "12 Jun 2025", amount: "₹8,500", status: "Confirmed" },
  { id: "#VN1041", guest: "Priya Reddy", suite: "Starlight Romance Suite", date: "11 Jun 2025", amount: "₹6,200", status: "Pending" },
  { id: "#VN1040", guest: "Rahul Mehta", suite: "Garden Bliss Suite", date: "10 Jun 2025", amount: "₹5,000", status: "Confirmed" },
  { id: "#VN1039", guest: "Sneha Patel", suite: "Midnight Luxe Suite", date: "09 Jun 2025", amount: "₹7,800", status: "Cancelled" },
  { id: "#VN1038", guest: "Vikram Nair", suite: "Royal Celebration Suite", date: "08 Jun 2025", amount: "₹9,200", status: "Confirmed" },
];

const statusStyle: Record<string, string> = {
  Confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

function fmtDate(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

interface RecentBookingsProps {
  filterDate?: Date | null;
  onClear?: () => void;
}

export function RecentBookings({ filterDate, onClear }: RecentBookingsProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (filterDate) {
      ref.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [filterDate]);

  const filtered = filterDate
    ? bookings.filter((b) => b.date === fmtDate(filterDate))
    : bookings;

  return (
    <div ref={ref} className="glass-card rounded-2xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-lg font-medium text-foreground">
            {filterDate ? `Bookings for ${fmtDate(filterDate)}` : "Recent Bookings"}
          </h3>
          {filterDate && (
            <button
              onClick={onClear}
              className="text-[11px] px-2.5 py-1 rounded-full border border-[var(--gold)]/30 text-gold hover:bg-[var(--gold)]/10 transition"
            >
              Clear filter ✕
            </button>
          )}
        </div>
        <a href="/admin/bookings" className="text-xs text-gold hover:underline underline-offset-4 transition">View All →</a>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide border-b border-white/[0.06]">
              <th className="pb-3 pr-4">ID</th>
              <th className="pb-3 pr-4">Guest</th>
              <th className="pb-3 pr-4">Suite</th>
              <th className="pb-3 pr-4">Date</th>
              <th className="pb-3 pr-4">Amount</th>
              <th className="pb-3">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/[0.04]">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="py-8 text-center text-muted-foreground text-sm">
                  No bookings found for {filterDate ? fmtDate(filterDate) : "this period"}.
                </td>
              </tr>
            ) : (
              filtered.map((b) => (
                <tr key={b.id} className="hover:bg-white/[0.02] transition">
                  <td className="py-3 pr-4 text-gold font-medium">{b.id}</td>
                  <td className="py-3 pr-4 text-foreground">{b.guest}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{b.suite}</td>
                  <td className="py-3 pr-4 text-muted-foreground">{b.date}</td>
                  <td className="py-3 pr-4 text-foreground font-medium">{b.amount}</td>
                  <td className="py-3">
                    <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyle[b.status]}`}>
                      {b.status}
                    </span>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
