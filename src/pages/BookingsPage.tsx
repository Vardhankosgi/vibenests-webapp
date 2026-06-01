import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, Download, Trash2 } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DateRangePicker } from "@/components/admin/DateRangePicker";

const allBookings = [
  { id: "#VN1042", guest: "Arjun Sharma", phone: "+91 98765 43210", suite: "Royal Celebration Suite", occasion: "Birthday", date: "12 Jun 2025", time: "6:00 PM", guests: 4, amount: "₹8,500", status: "Confirmed" },
  { id: "#VN1041", guest: "Priya Reddy", phone: "+91 91234 56789", suite: "Starlight Romance Suite", occasion: "Anniversary", date: "11 Jun 2025", time: "7:00 PM", guests: 2, amount: "₹6,200", status: "Pending" },
  { id: "#VN1040", guest: "Rahul Mehta", phone: "+91 99887 76655", suite: "Garden Bliss Suite", occasion: "Proposal", date: "10 Jun 2025", time: "8:00 PM", guests: 2, amount: "₹5,000", status: "Confirmed" },
  { id: "#VN1039", guest: "Sneha Patel", phone: "+91 93456 78901", suite: "Midnight Luxe Suite", occasion: "Birthday", date: "09 Jun 2025", time: "5:00 PM", guests: 6, amount: "₹7,800", status: "Cancelled" },
  { id: "#VN1038", guest: "Vikram Nair", phone: "+91 87654 32109", suite: "Royal Celebration Suite", occasion: "Anniversary", date: "08 Jun 2025", time: "7:30 PM", guests: 2, amount: "₹9,200", status: "Confirmed" },
  { id: "#VN1037", guest: "Divya Krishnan", phone: "+91 76543 21098", suite: "Starlight Romance Suite", occasion: "Surprise Party", date: "07 Jun 2025", time: "6:30 PM", guests: 8, amount: "₹11,000", status: "Confirmed" },
  { id: "#VN1036", guest: "Karan Malhotra", phone: "+91 65432 10987", suite: "Garden Bliss Suite", occasion: "Birthday", date: "06 Jun 2025", time: "5:30 PM", guests: 5, amount: "₹4,800", status: "Pending" },
  { id: "#VN1035", guest: "Ananya Singh", phone: "+91 54321 09876", suite: "Midnight Luxe Suite", occasion: "Proposal", date: "05 Jun 2025", time: "8:30 PM", guests: 2, amount: "₹6,500", status: "Confirmed" },
  { id: "#VN1034", guest: "Rohan Gupta", phone: "+91 43210 98765", suite: "Royal Celebration Suite", occasion: "Anniversary", date: "04 Jun 2025", time: "7:00 PM", guests: 2, amount: "₹8,000", status: "Cancelled" },
  { id: "#VN1033", guest: "Meera Iyer", phone: "+91 32109 87654", suite: "Starlight Romance Suite", occasion: "Birthday", date: "03 Jun 2025", time: "6:00 PM", guests: 4, amount: "₹7,200", status: "Confirmed" },
];

const statusStyle: Record<string, string> = {
  Confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

const statuses = ["All", "Confirmed", "Pending", "Cancelled"];
const occasions = ["All", "Birthday", "Anniversary", "Proposal", "Surprise Party"];
const suites = ["All", "Royal Celebration Suite", "Starlight Romance Suite", "Garden Bliss Suite", "Midnight Luxe Suite"];

export default function BookingsPage() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date") ?? "";
  const navigate = useNavigate();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [occasionFilter, setOccasionFilter] = useState("All");
  const [suiteFilter, setSuiteFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState(dateParam);
  const [selected, setSelected] = useState<string[]>([]);
  const [bookings, setBookings] = useState(allBookings);

  useEffect(() => { if (dateParam) setDateFilter(dateParam); }, [dateParam]);

  function toggleSelect(id: string) { setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]); }
  function toggleAll() { setSelected((s) => s.length === filtered.length ? [] : filtered.map((b) => b.id)); }
  function deleteSelected() { setBookings((b) => b.filter((x) => !selected.includes(x.id))); setSelected([]); }
  function deleteOne(id: string) { setBookings((b) => b.filter((x) => x.id !== id)); setSelected((s) => s.filter((x) => x !== id)); }

  const filtered = bookings.filter((b) => {
    const matchSearch = b.guest.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.phone.includes(search);
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    const matchOccasion = occasionFilter === "All" || b.occasion === occasionFilter;
    const matchSuite = suiteFilter === "All" || b.suite === suiteFilter;
    const matchDate = !dateFilter || b.date === dateFilter;
    return matchSearch && matchStatus && matchOccasion && matchSuite && matchDate;
  });

  const selectClass = "luxury-input rounded-lg px-3 py-2 text-xs text-foreground bg-transparent cursor-pointer";

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Bookings" />
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Total", count: allBookings.length, color: "border-[var(--gold)]/30 text-gold" },
              { label: "Confirmed", count: allBookings.filter(b => b.status === "Confirmed").length, color: "border-emerald-500/30 text-emerald-400" },
              { label: "Pending", count: allBookings.filter(b => b.status === "Pending").length, color: "border-amber-500/30 text-amber-400" },
              { label: "Cancelled", count: allBookings.filter(b => b.status === "Cancelled").length, color: "border-destructive/30 text-destructive" },
            ].map((s) => (
              <div key={s.label} className={`glass-card rounded-xl px-4 py-2.5 border ${s.color} flex items-center gap-2`}>
                <span className="text-xl font-display font-semibold">{s.count}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
          <DateRangePicker />
        </div>

        <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-gold shrink-0" />
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search by name, ID or phone..." value={search} onChange={(e) => setSearch(e.target.value)} className="luxury-input w-full rounded-lg pl-9 pr-4 py-2 text-xs" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            {statuses.map((s) => <option key={s} value={s} className="bg-[oklch(0.13_0.025_260)]">{s === "All" ? "All Statuses" : s}</option>)}
          </select>
          <select value={occasionFilter} onChange={(e) => setOccasionFilter(e.target.value)} className={selectClass}>
            {occasions.map((o) => <option key={o} value={o} className="bg-[oklch(0.13_0.025_260)]">{o === "All" ? "All Occasions" : o}</option>)}
          </select>
          <select value={suiteFilter} onChange={(e) => setSuiteFilter(e.target.value)} className={selectClass}>
            {suites.map((s) => <option key={s} value={s} className="bg-[oklch(0.13_0.025_260)]">{s === "All" ? "All Suites" : s}</option>)}
          </select>
          {dateFilter && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/5 text-xs text-gold">
              📅 {dateFilter}
              <button onClick={() => setDateFilter("")} className="hover:text-white transition">✕</button>
            </div>
          )}
          <button onClick={() => { setSearch(""); setStatusFilter("All"); setOccasionFilter("All"); setSuiteFilter("All"); setDateFilter(""); }} className="text-xs text-muted-foreground hover:text-gold transition px-3 py-2 rounded-lg border border-white/10 hover:border-[var(--gold)]/30">Clear</button>
          <button className="flex items-center gap-2 text-xs gold-btn px-3 py-2 rounded-lg font-medium ml-auto">
            <Download className="h-3.5 w-3.5" /> Export
          </button>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-medium text-foreground">All Bookings</h3>
            <div className="flex items-center gap-3">
              {selected.length > 0 && (
                <button onClick={deleteSelected} className="flex items-center gap-1.5 text-xs text-destructive border border-destructive/30 hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition">
                  <Trash2 className="h-3.5 w-3.5" /> Delete Selected ({selected.length})
                </button>
              )}
              <span className="text-xs text-muted-foreground">{filtered.length} of {bookings.length} bookings</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="pb-3 pr-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="h-3.5 w-3.5 accent-[var(--gold)] cursor-pointer" /></th>
                  <th className="pb-3 pr-4">ID</th>
                  <th className="pb-3 pr-4">Guest</th>
                  <th className="pb-3 pr-4">Suite</th>
                  <th className="pb-3 pr-4">Occasion</th>
                  <th className="pb-3 pr-4">Date & Time</th>
                  <th className="pb-3 pr-4">Amount</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={9} className="py-10 text-center text-sm text-muted-foreground">No bookings found</td></tr>
                ) : filtered.map((b) => (
                  <tr key={b.id} className={`hover:bg-white/[0.02] transition ${selected.includes(b.id) ? "bg-[var(--gold)]/5" : ""}`}>
                    <td className="py-3 pr-3"><input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggleSelect(b.id)} className="h-3.5 w-3.5 accent-[var(--gold)] cursor-pointer" /></td>
                    <td className="py-3 pr-4 text-gold font-medium">{b.id}</td>
                    <td className="py-3 pr-4 text-foreground font-medium">{b.guest}</td>
                    <td className="py-3 pr-4 text-xs">
                      <button onClick={() => navigate("/rooms")} className="text-gold hover:underline underline-offset-2 text-left transition">{b.suite}</button>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{b.occasion}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{b.date}<br />{b.time}</td>
                    <td className="py-3 pr-4 text-foreground font-medium">{b.amount}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyle[b.status]}`}>{b.status}</span>
                    </td>
                    <td className="py-3">
                      <button onClick={() => deleteOne(b.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition">
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </td>
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
