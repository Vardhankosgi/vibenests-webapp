import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { Search, Plus, Pencil, Trash2, X, User, Phone, Mail, Shield, ShieldOff } from "lucide-react";

type UserType = {
  id: string; name: string; email: string; phone: string;
  role: "Guest" | "Admin"; status: "Active" | "Blocked"; joined: string; bookings: number;
};

const initialUsers: UserType[] = [
  { id: "U001", name: "Arjun Sharma", email: "arjun@example.com", phone: "+91 98765 43210", role: "Guest", status: "Active", joined: "12 Jan 2025", bookings: 4 },
  { id: "U002", name: "Priya Reddy", email: "priya@example.com", phone: "+91 91234 56789", role: "Guest", status: "Active", joined: "20 Feb 2025", bookings: 2 },
  { id: "U003", name: "Rahul Mehta", email: "rahul@example.com", phone: "+91 99887 76655", role: "Guest", status: "Blocked", joined: "05 Mar 2025", bookings: 1 },
  { id: "U004", name: "Sneha Patel", email: "sneha@example.com", phone: "+91 93456 78901", role: "Guest", status: "Active", joined: "18 Mar 2025", bookings: 3 },
  { id: "U005", name: "Vikram Nair", email: "vikram@example.com", phone: "+91 87654 32109", role: "Admin", status: "Active", joined: "01 Jan 2025", bookings: 0 },
  { id: "U006", name: "Divya Krishnan", email: "divya@example.com", phone: "+91 76543 21098", role: "Guest", status: "Active", joined: "22 Apr 2025", bookings: 5 },
];

const emptyForm: Omit<UserType, "id" | "joined" | "bookings"> = { name: "", email: "", phone: "", role: "Guest", status: "Active" };

const statusStyle: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Blocked: "bg-destructive/10 text-destructive border-destructive/20",
};

const roleStyle: Record<string, string> = {
  Guest: "bg-white/5 text-muted-foreground border-white/10",
  Admin: "bg-[var(--gold)]/10 text-gold border-[var(--gold)]/20",
};

export default function UsersPage() {
  const [users, setUsers] = useState(initialUsers);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [selected, setSelected] = useState<string[]>([]);

  const filtered = users.filter((u) => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()) || u.phone.includes(search) || u.id.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "All" || u.role === roleFilter;
    const matchStatus = statusFilter === "All" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  function openAdd() { setEditId(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(u: UserType) { setEditId(u.id); setForm({ name: u.name, email: u.email, phone: u.phone, role: u.role, status: u.status }); setShowModal(true); }

  function handleSave() {
    if (!form.name.trim()) return;
    if (editId) {
      setUsers((prev) => prev.map((u) => u.id === editId ? { ...u, ...form } : u));
    } else {
      const newId = `U${String(users.length + 1).padStart(3, "0")}`;
      const today = new Date().toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
      setUsers((prev) => [...prev, { id: newId, ...form, joined: today, bookings: 0 }]);
    }
    setShowModal(false);
  }

  function handleDelete(id: string) { setUsers((prev) => prev.filter((u) => u.id !== id)); setSelected((prev) => prev.filter((x) => x !== id)); }
  function toggleBlock(id: string) { setUsers((prev) => prev.map((u) => u.id === id ? { ...u, status: u.status === "Active" ? "Blocked" : "Active" } : u)); }
  function toggleSelect(id: string) { setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]); }
  function toggleAll() { setSelected((s) => s.length === filtered.length ? [] : filtered.map((u) => u.id)); }
  function deleteSelected() { setUsers((prev) => prev.filter((u) => !selected.includes(u.id))); setSelected([]); }

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Customer Management" />
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {[
              { label: "Total Users", count: users.length, color: "border-[var(--gold)]/30 text-gold" },
              { label: "Active", count: users.filter(u => u.status === "Active").length, color: "border-emerald-500/30 text-emerald-400" },
              { label: "Blocked", count: users.filter(u => u.status === "Blocked").length, color: "border-destructive/30 text-destructive" },
              { label: "Admins", count: users.filter(u => u.role === "Admin").length, color: "border-[var(--gold)]/30 text-gold" },
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
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search by name, email, phone or ID..." value={search} onChange={(e) => setSearch(e.target.value)} className="luxury-input w-full rounded-lg pl-9 pr-4 py-2 text-xs" />
          </div>
          <select value={roleFilter} onChange={(e) => setRoleFilter(e.target.value)} className="luxury-input rounded-lg px-3 py-2 text-xs text-foreground bg-transparent cursor-pointer">
            {["All", "Guest", "Admin"].map((r) => <option key={r} value={r} className="bg-[oklch(0.13_0.025_260)]">{r === "All" ? "All Roles" : r}</option>)}
          </select>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="luxury-input rounded-lg px-3 py-2 text-xs text-foreground bg-transparent cursor-pointer">
            {["All", "Active", "Blocked"].map((s) => <option key={s} value={s} className="bg-[oklch(0.13_0.025_260)]">{s === "All" ? "All Statuses" : s}</option>)}
          </select>
          <button onClick={() => { setSearch(""); setRoleFilter("All"); setStatusFilter("All"); }} className="text-xs text-muted-foreground hover:text-gold transition px-3 py-2 rounded-lg border border-white/10 hover:border-[var(--gold)]/30">Clear</button>
          <button onClick={openAdd} className="flex items-center gap-2 gold-btn px-4 py-2 rounded-lg text-xs font-semibold ml-auto">
            <Plus className="h-3.5 w-3.5" /> Add User
          </button>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-medium text-foreground">All Customers</h3>
            <div className="flex items-center gap-3">
              {selected.length > 0 && (
                <button onClick={deleteSelected} className="flex items-center gap-1.5 text-xs text-destructive border border-destructive/30 hover:bg-destructive/10 px-3 py-1.5 rounded-lg transition">
                  <Trash2 className="h-3.5 w-3.5" /> Delete Selected ({selected.length})
                </button>
              )}
              <span className="text-xs text-muted-foreground">{filtered.length} of {users.length} users</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="pb-3 pr-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="h-3.5 w-3.5 accent-[var(--gold)] cursor-pointer" /></th>
                  <th className="pb-3 pr-4">User</th>
                  <th className="pb-3 pr-4">Contact</th>
                  <th className="pb-3 pr-4">Role</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3 pr-4">Joined</th>
                  <th className="pb-3 pr-4">Bookings</th>
                  <th className="pb-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={8} className="py-10 text-center text-sm text-muted-foreground">No users found</td></tr>
                ) : filtered.map((u) => (
                  <tr key={u.id} className={`hover:bg-white/[0.02] transition ${selected.includes(u.id) ? "bg-[var(--gold)]/5" : ""}`}>
                    <td className="py-3 pr-3"><input type="checkbox" checked={selected.includes(u.id)} onChange={() => toggleSelect(u.id)} className="h-3.5 w-3.5 accent-[var(--gold)] cursor-pointer" /></td>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="h-8 w-8 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center shrink-0">
                          <User className="h-4 w-4 text-gold" />
                        </div>
                        <div>
                          <p className="text-foreground font-medium text-sm">{u.name}</p>
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
                    <td className="py-3 pr-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${roleStyle[u.role]}`}>{u.role}</span></td>
                    <td className="py-3 pr-4"><span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyle[u.status]}`}>{u.status}</span></td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground">{u.joined}</td>
                    <td className="py-3 pr-4 text-xs text-muted-foreground text-center">{u.bookings}</td>
                    <td className="py-3">
                      <div className="flex items-center gap-1.5">
                        <button onClick={() => openEdit(u)} className="p-1.5 rounded-lg text-muted-foreground hover:text-gold hover:bg-[var(--gold)]/10 transition" title="Edit"><Pencil className="h-3.5 w-3.5" /></button>
                        <button onClick={() => toggleBlock(u.id)} className={`p-1.5 rounded-lg transition ${u.status === "Active" ? "text-muted-foreground hover:text-amber-400 hover:bg-amber-400/10" : "text-amber-400 hover:bg-amber-400/10"}`} title={u.status === "Active" ? "Block" : "Unblock"}>
                          {u.status === "Active" ? <ShieldOff className="h-3.5 w-3.5" /> : <Shield className="h-3.5 w-3.5" />}
                        </button>
                        <button onClick={() => handleDelete(u.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition" title="Delete"><Trash2 className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card rounded-2xl p-5 w-full max-w-md border border-[var(--gold)]/20">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-display text-lg text-foreground">{editId ? "Edit User" : "Add New User"}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-3">
              {[
                { label: "Full Name", key: "name", placeholder: "e.g. Arjun Sharma" },
                { label: "Email", key: "email", placeholder: "e.g. user@example.com" },
                { label: "Phone", key: "phone", placeholder: "e.g. +91 98765 43210" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</label>
                  <input type="text" placeholder={placeholder} value={form[key as keyof typeof form]} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="luxury-input w-full rounded-lg px-3 py-2 text-sm mt-0.5" />
                </div>
              ))}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wide">Role</label>
                  <select value={form.role} onChange={(e) => setForm((f) => ({ ...f, role: e.target.value as UserType["role"] }))} className="luxury-input w-full rounded-lg px-3 py-2 text-sm mt-0.5 bg-transparent cursor-pointer">
                    <option value="Guest" className="bg-[oklch(0.13_0.025_260)]">Guest</option>
                    <option value="Admin" className="bg-[oklch(0.13_0.025_260)]">Admin</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wide">Status</label>
                  <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as UserType["status"] }))} className="luxury-input w-full rounded-lg px-3 py-2 text-sm mt-0.5 bg-transparent cursor-pointer">
                    <option value="Active" className="bg-[oklch(0.13_0.025_260)]">Active</option>
                    <option value="Blocked" className="bg-[oklch(0.13_0.025_260)]">Blocked</option>
                  </select>
                </div>
              </div>
            </div>
            <div className="flex gap-3 mt-5">
              <button onClick={handleSave} className="gold-btn flex-1 rounded-lg py-2.5 text-sm font-semibold">{editId ? "Save Changes" : "Add User"}</button>
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg py-2.5 text-sm border border-white/10 text-muted-foreground hover:text-foreground transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
