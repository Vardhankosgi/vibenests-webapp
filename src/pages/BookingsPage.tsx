import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Search, Filter, Download, Plus, X, Check, ChevronRight, ChevronLeft, Eye } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { DateRangePicker } from "@/components/admin/DateRangePicker";
import { useAppData } from "@/components/admin/AppDataContext";
import { suitesApi, addonsApi, bookingsApi } from "@/lib/api";
import { useTranslation } from "react-i18next";

const statusStyle: Record<string, string> = {
  Confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Pending:   "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
  Completed: "bg-blue-500/10 text-blue-400 border-blue-500/20",
};

const statuses  = ["All", "Confirmed", "Pending", "Cancelled", "Completed"];
const occasions = ["All", "Birthday", "Anniversary", "Proposal", "Surprise Party", "Corporate", "Other"];

const TIME_SLOTS = [
  "08:00", "09:00", "10:00", "11:00", "12:00", "13:00",
  "14:00", "15:00", "16:00", "17:00", "18:00", "19:00",
  "20:00", "21:00", "22:00",
];

type ApiSuite = { id: number; name: string; price: number; capacity: number; themeType: string };
type ApiAddon = { id: number; name: string; price: number; category: string };

const emptyGuest = { firstName: "", lastName: "", email: "", phone: "" };

function StepIndicator({ step, stepLabels }: { step: number; stepLabels: string[] }) {
  return (
    <div className="flex items-center gap-1 mb-5">
      {stepLabels.map((label, i) => (
        <div key={i} className="flex items-center gap-1 flex-1">
          <div className={`flex items-center justify-center h-6 w-6 rounded-full text-[11px] font-semibold shrink-0 border transition-all
            ${i < step ? "bg-[var(--gold)] border-[var(--gold)] text-black" :
              i === step ? "border-[var(--gold)] text-gold" :
              "border-white/20 text-muted-foreground"}`}>
            {i < step ? <Check className="h-3 w-3" /> : i + 1}
          </div>
          <span className={`text-[11px] hidden sm:block ${i === step ? "text-gold" : "text-muted-foreground"}`}>{label}</span>
          {i < stepLabels.length - 1 && <div className={`h-px flex-1 ${i < step ? "bg-[var(--gold)]/50" : "bg-white/10"}`} />}
        </div>
      ))}
    </div>
  );
}

function NewBookingModal({ onClose, onCreated }: { onClose: () => void; onCreated: (b: any) => void }) {
  const { t } = useTranslation();
  const { users } = useAppData();
  const stepLabels = [
    t("app.admin.scheduleAndSuite", "Schedule & Suite"),
    t("app.admin.guestDetails", "Guest Details"),
    t("app.admin.reviewAndConfirm", "Review & Confirm"),
  ];
  const [step, setStep] = useState(0);
  const [userSearch, setUserSearch] = useState("");
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const [suites, setSuites] = useState<ApiSuite[]>([]);
  const [addons, setAddons] = useState<ApiAddon[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Step 0 state
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [selectedSuite, setSelectedSuite] = useState<ApiSuite | null>(null);
  const [selectedAddons, setSelectedAddons] = useState<ApiAddon[]>([]);
  const [occasion, setOccasion] = useState("Birthday");

  // Step 1 state
  const [guest, setGuest] = useState(emptyGuest);

  useEffect(() => {
    suitesApi.getAll().then((list) => setSuites(list as ApiSuite[])).catch(() => {});
    addonsApi.getAll().then((list) => setAddons(list as ApiAddon[])).catch(() => {});
  }, []);

  function toggleAddon(a: ApiAddon) {
    setSelectedAddons((prev) =>
      prev.find((x) => x.id === a.id) ? prev.filter((x) => x.id !== a.id) : [...prev, a]
    );
  }

  const suitePrice = selectedSuite ? Number(selectedSuite.price) : 0;
  const addonsTotal = selectedAddons.reduce((s, a) => s + Number(a.price), 0);
  const totalAmount = suitePrice + addonsTotal;

  function validateStep0() {
    if (!date) return t("app.admin.selectDate", "Please select a date.");
    if (!startTime) return t("app.admin.startTime", "Please select a start time.");
    if (!endTime) return t("app.admin.endTime", "Please select an end time.");
    if (startTime >= endTime) return t("app.admin.endAfterStart", "End time must be after start time.");
    if (!selectedSuite) return t("app.admin.selectSuite", "Please select a suite.");
    return "";
  }

  function validateStep1() {
    if (!guest.firstName.trim()) return t("app.admin.firstName", "First name is required.");
    if (!guest.lastName.trim()) return t("app.admin.lastName", "Last name is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(guest.email)) return t("app.admin.email", "Valid email is required.");
    if (guest.phone.length < 6) return t("app.admin.phone", "Valid phone number is required.");
    return "";
  }

  function handleNext() {
    const err = step === 0 ? validateStep0() : validateStep1();
    if (err) { setError(err); return; }
    setError("");
    setStep((s) => s + 1);
  }

  async function handleConfirm() {
    setLoading(true);
    setError("");
    try {
      const booking = await bookingsApi.adminCreate({
        suiteId: selectedSuite!.id,
        eventType: occasion,
        addOns: selectedAddons.map((a) => a.id),
        date,
        timeSlot: startTime,
        endTimeSlot: endTime,
        guestFirstName: guest.firstName,
        guestLastName: guest.lastName,
        guestEmail: guest.email,
        guestPhone: guest.phone,
        totalAmount,
      });
      onCreated(booking);
      onClose();
    } catch (e: any) {
      setError(e.message || "Failed to create booking.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
      <div className="glass-card rounded-2xl p-5 w-full max-w-lg border border-[var(--gold)]/20 max-h-[92vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg text-foreground">{t("app.admin.newBooking", "New Booking")}</h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
        </div>

        <StepIndicator step={step} stepLabels={stepLabels} />

        {error && (
          <div className="mb-3 text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-lg px-3 py-2">{error}</div>
        )}

        {/* ── Step 0: Schedule & Suite ── */}
        {step === 0 && (
          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-3">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.admin.selectDate", "Date")}</label>
                <input type="date" value={date} onChange={(e) => setDate(e.target.value)}
                  min={new Date().toISOString().split("T")[0]}
                  className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.admin.startTime", "Start Time")}</label>
                <select value={startTime} onChange={(e) => setStartTime(e.target.value)}
                  className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5 bg-transparent cursor-pointer">
                  <option value="" className="bg-[oklch(0.13_0.025_260)]">--</option>
                  {TIME_SLOTS.map((ts) => <option key={ts} value={ts} className="bg-[oklch(0.13_0.025_260)]">{ts}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.admin.endTime", "End Time")}</label>
                <select value={endTime} onChange={(e) => setEndTime(e.target.value)}
                  className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5 bg-transparent cursor-pointer">
                  <option value="" className="bg-[oklch(0.13_0.025_260)]">--</option>
                  {TIME_SLOTS.filter((ts) => !startTime || ts > startTime).map((ts) => (
                    <option key={ts} value={ts} className="bg-[oklch(0.13_0.025_260)]">{ts}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.admin.occasion", "Occasion")}</label>
                <select value={occasion} onChange={(e) => setOccasion(e.target.value)}
                  className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5 bg-transparent cursor-pointer">
                  {occasions.filter((o) => o !== "All").map((o) => (
                    <option key={o} value={o} className="bg-[oklch(0.13_0.025_260)]">{o}</option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.admin.selectSuite", "Select Suite")}</label>
              <div className="mt-1.5 space-y-2">
                {suites.map((s) => (
                  <div key={s.id}
                    onClick={() => setSelectedSuite(s)}
                    className={`flex items-center justify-between px-3 py-2.5 rounded-xl border cursor-pointer transition
                      ${selectedSuite?.id === s.id
                        ? "border-[var(--gold)] bg-[var(--gold)]/10"
                        : "border-white/10 hover:border-[var(--gold)]/40 bg-white/[0.02]"}`}>
                    <div>
                      <p className="text-sm text-foreground font-medium">{s.name}</p>
                      <p className="text-[11px] text-muted-foreground">{s.themeType} · {s.capacity} guests</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gold font-semibold">₹{Number(s.price).toLocaleString()}</p>
                      {selectedSuite?.id === s.id && <Check className="h-3.5 w-3.5 text-gold ml-auto mt-0.5" />}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {addons.length > 0 && (
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.admin.addonsOptional", "Add-ons (optional)")}</label>
                <div className="mt-1.5 grid grid-cols-2 gap-2">
                  {addons.map((a) => {
                    const sel = !!selectedAddons.find((x) => x.id === a.id);
                    return (
                      <div key={a.id} onClick={() => toggleAddon(a)}
                        className={`flex items-center justify-between px-3 py-2 rounded-xl border cursor-pointer transition
                          ${sel ? "border-[var(--gold)] bg-[var(--gold)]/10" : "border-white/10 hover:border-[var(--gold)]/40 bg-white/[0.02]"}`}>
                        <div>
                          <p className="text-xs text-foreground font-medium">{a.name}</p>
                          <p className="text-[11px] text-gold">₹{Number(a.price).toLocaleString()}</p>
                        </div>
                        {sel && <Check className="h-3.5 w-3.5 text-gold shrink-0" />}
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Step 1: Guest Details ── */}
        {step === 1 && (
          <div className="space-y-3">
            <div className="relative">
              <label className="text-xs text-gold uppercase tracking-wide font-medium">{t("app.admin.selectRegisteredUser", "Select Registered User (Optional)")}</label>
              <div className="relative mt-0.5">
                <input
                  type="text"
                  placeholder={t("app.admin.searchRegisteredUser", "Type to search user by name or email...")}
                  value={userSearch}
                  onChange={(e) => {
                    setUserSearch(e.target.value);
                    setShowUserDropdown(true);
                  }}
                  onFocus={() => setShowUserDropdown(true)}
                  onBlur={() => setTimeout(() => setShowUserDropdown(false), 200)}
                  className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm"
                />
                {userSearch && (
                  <button
                    type="button"
                    onClick={() => {
                      setUserSearch("");
                      setShowUserDropdown(false);
                      setGuest(emptyGuest);
                    }}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground text-xs"
                  >
                    ✕
                  </button>
                )}
              </div>
              {showUserDropdown && (
                <div className="absolute z-[10000] w-full mt-1 bg-[oklch(0.15_0.02_260)] border border-[var(--gold)]/20 rounded-lg shadow-xl max-h-48 overflow-y-auto divide-y divide-white/[0.04]">
                  {users
                    .filter((u) => u.role !== "Admin")
                    .filter(
                      (u) =>
                        u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                        u.email.toLowerCase().includes(userSearch.toLowerCase())
                    )
                    .map((u) => (
                      <div
                        key={u.id}
                        onClick={() => {
                          const [first, ...rest] = u.name.split(" ");
                          setGuest({
                            firstName: first || "",
                            lastName: rest.join(" ") || "",
                            email: u.email,
                            phone: u.phone || "",
                          });
                          setUserSearch(`${u.name} (${u.email})`);
                          setShowUserDropdown(false);
                        }}
                        className="px-3 py-2 text-xs hover:bg-[var(--gold)]/10 text-foreground cursor-pointer transition flex flex-col"
                      >
                        <span className="font-medium">{u.name}</span>
                        <span className="text-muted-foreground text-[10px]">{u.email}</span>
                      </div>
                    ))}
                  {users.filter((u) => u.role !== "Admin").filter(
                    (u) =>
                      u.name.toLowerCase().includes(userSearch.toLowerCase()) ||
                      u.email.toLowerCase().includes(userSearch.toLowerCase())
                  ).length === 0 && (
                    <div className="px-3 py-2 text-xs text-muted-foreground">{t("app.admin.noUsersFound", "No users found")}</div>
                  )}
                </div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3">
              {[
                { label: t("app.admin.firstName", "First Name"), key: "firstName", placeholder: "John" },
                { label: t("app.admin.lastName", "Last Name"),  key: "lastName",  placeholder: "Doe" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</label>
                  <input type="text" placeholder={placeholder}
                    value={guest[key as keyof typeof guest]}
                    onChange={(e) => setGuest((g) => ({ ...g, [key]: e.target.value }))}
                    className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5" />
                </div>
              ))}
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.admin.email", "Email")}</label>
              <input type="email" placeholder="guest@example.com"
                value={guest.email} onChange={(e) => setGuest((g) => ({ ...g, email: e.target.value }))}
                className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.admin.phone", "Phone")}</label>
              <input type="tel" placeholder="+91 98765 43210"
                value={guest.phone} onChange={(e) => setGuest((g) => ({ ...g, phone: e.target.value }))}
                className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5" />
            </div>
          </div>
        )}

        {/* ── Step 2: Review & Confirm ── */}
        {step === 2 && (
          <div className="space-y-4">
            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 space-y-2 text-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-3">{t("app.admin.bookingSummary", "Booking Summary")}</p>
              {[
                [t("app.admin.guest", "Guest"),   `${guest.firstName} ${guest.lastName}`],
                [t("app.admin.email", "Email"),   guest.email],
                [t("app.admin.phone", "Phone"),   guest.phone],
                [t("app.admin.date", "Date"),    date],
                [t("app.admin.time", "Time"),    `${startTime} – ${endTime}`],
                [t("app.admin.occasion", "Occasion"), occasion],
                [t("app.admin.suite", "Suite"),   selectedSuite?.name ?? ""],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{k}</span>
                  <span className="text-foreground text-right">{v}</span>
                </div>
              ))}
              {selectedAddons.length > 0 && (
                <div className="flex justify-between gap-4">
                  <span className="text-muted-foreground">{t("app.admin.addonsOptional", "Add-ons")}</span>
                  <span className="text-foreground text-right">{selectedAddons.map((a) => a.name).join(", ")}</span>
                </div>
              )}
            </div>

            <div className="rounded-xl border border-[var(--gold)]/20 bg-[var(--gold)]/5 p-4 space-y-1.5 text-sm">
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">{t("app.admin.paymentBreakdown", "Payment Breakdown")}</p>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Suite ({selectedSuite?.name})</span>
                <span>₹{suitePrice.toLocaleString()}</span>
              </div>
              {selectedAddons.map((a) => (
                <div key={a.id} className="flex justify-between">
                  <span className="text-muted-foreground">{a.name}</span>
                  <span>₹{Number(a.price).toLocaleString()}</span>
                </div>
              ))}
              <div className="border-t border-[var(--gold)]/20 pt-2 flex justify-between font-semibold text-gold">
                <span>{t("app.admin.total", "Total")}</span>
                <span>₹{totalAmount.toLocaleString()}</span>
              </div>
            </div>
          </div>
        )}

        {/* ── Footer Buttons ── */}
        <div className="flex gap-3 mt-5">
          {step > 0 && (
            <button onClick={() => { setStep((s) => s - 1); setError(""); }}
              className="flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm border border-white/10 text-muted-foreground hover:text-foreground transition">
              <ChevronLeft className="h-4 w-4" /> {t("app.admin.back", "Back")}
            </button>
          )}
          {step < 2 ? (
            <button onClick={handleNext}
              className="gold-btn flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold">
              {t("app.admin.next", "Next")} <ChevronRight className="h-4 w-4" />
            </button>
          ) : (
            <button onClick={handleConfirm} disabled={loading}
              className="gold-btn flex-1 flex items-center justify-center gap-1.5 rounded-lg py-2 text-sm font-semibold disabled:opacity-70">
              {loading ? t("app.admin.confirming", "Confirming...") : <><Check className="h-4 w-4" /> {t("app.admin.confirmBooking", "Confirm Booking")}</>}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function BookingsPage() {
  const [searchParams] = useSearchParams();
  const dateParam = searchParams.get("date") ?? "";
  const navigate = useNavigate();
  const { bookings, setBookings, addBooking, stats } = useAppData();

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [occasionFilter, setOccasionFilter] = useState("All");
  const [suiteFilter, setSuiteFilter] = useState("All");
  const [dateFilter, setDateFilter] = useState(dateParam);
  const [dateRange, setDateRange] = useState<{ from: Date; to: Date } | null>(null);
  const [selected, setSelected] = useState<string[]>([]);
  const [showNewBooking, setShowNewBooking] = useState(false);

  useEffect(() => { if (dateParam) setDateFilter(dateParam); }, [dateParam]);

  function toggleSelect(id: string) { setSelected((s) => s.includes(id) ? s.filter((x) => x !== id) : [...s, id]); }
  function toggleAll() { setSelected((s) => s.length === filtered.length ? [] : filtered.map((b) => b.id)); }
  function deleteSelected() { /* delete removed */ }
  function deleteOne(id: string) { /* delete removed */ }

  const suiteNames = ["All", ...Array.from(new Set(bookings.map((b) => b.suite)))];

  const filtered = bookings.filter((b) => {
    const matchSearch = b.guest.toLowerCase().includes(search.toLowerCase()) || b.id.toLowerCase().includes(search.toLowerCase()) || b.phone.includes(search);
    const matchStatus = statusFilter === "All" || b.status === statusFilter;
    const matchOccasion = occasionFilter === "All" || b.occasion === occasionFilter;
    const matchSuite = suiteFilter === "All" || b.suite === suiteFilter;
    const matchDate = !dateFilter || b.date === dateFilter;
    const matchDateRange = !dateRange || (() => {
      const d = new Date(b.date);
      const from = new Date(dateRange.from); from.setHours(0,0,0,0);
      const to = new Date(dateRange.to); to.setHours(23,59,59,999);
      return d >= from && d <= to;
    })();
    return matchSearch && matchStatus && matchOccasion && matchSuite && matchDate && matchDateRange;

  });

  const selectClass = "luxury-input rounded-lg px-3 py-2 text-xs text-foreground bg-transparent cursor-pointer";

  const { t } = useTranslation();

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Bookings" />
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap gap-3">
            {[
              { label: t("app.admin.total", "Total"),     count: bookings.length,        color: "border-[var(--gold)]/30 text-gold" },
              { label: t("app.admin.confirmed", "Confirmed"), count: stats.confirmedBookings, color: "border-emerald-500/30 text-emerald-400" },
              { label: t("app.admin.pending", "Pending"),   count: stats.pendingBookings,   color: "border-amber-500/30 text-amber-400" },
              { label: t("app.admin.cancelled", "Cancelled"), count: stats.cancelledBookings, color: "border-destructive/30 text-destructive" },
            ].map((s) => (
              <div key={s.label} className={`glass-card rounded-xl px-4 py-2.5 border ${s.color} flex items-center gap-2`}>
                <span className="text-xl font-display font-semibold">{s.count}</span>
                <span className="text-xs text-muted-foreground">{s.label}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-3">
            <DateRangePicker value={dateRange} onChange={setDateRange} />
            <button onClick={() => setShowNewBooking(true)}
              className="flex items-center gap-2 gold-btn px-4 py-2 rounded-lg text-xs font-semibold">
              <Plus className="h-3.5 w-3.5" /> {t("app.admin.newBooking", "New Booking")}
            </button>
          </div>
        </div>

        <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <Filter className="h-4 w-4 text-gold shrink-0" />
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder={t("app.admin.searchBookings", "Search by name, ID or phone...")} value={search} onChange={(e) => setSearch(e.target.value)} className="luxury-input w-full rounded-lg pl-9 pr-4 py-2 text-xs" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className={selectClass}>
            {statuses.map((s) => <option key={s} value={s} className="bg-[oklch(0.13_0.025_260)]">{s === "All" ? t("app.admin.allStatuses", "All Statuses") : s}</option>)}
          </select>
          <select value={occasionFilter} onChange={(e) => setOccasionFilter(e.target.value)} className={selectClass}>
            {occasions.map((o) => <option key={o} value={o} className="bg-[oklch(0.13_0.025_260)]">{o === "All" ? t("app.admin.allOccasions", "All Occasions") : o}</option>)}
          </select>
          <select value={suiteFilter} onChange={(e) => setSuiteFilter(e.target.value)} className={selectClass}>
            {suiteNames.map((s) => <option key={s} value={s} className="bg-[oklch(0.13_0.025_260)]">{s === "All" ? t("app.admin.allSuites", "All Suites") : s}</option>)}
          </select>
          {dateFilter && (
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-[var(--gold)]/30 bg-[var(--gold)]/5 text-xs text-gold">
              📅 {dateFilter}
              <button onClick={() => setDateFilter("")} className="hover:text-white transition">✕</button>
            </div>
          )}
          <button onClick={() => { setSearch(""); setStatusFilter("All"); setOccasionFilter("All"); setSuiteFilter("All"); setDateFilter(""); }}
            className="text-xs text-muted-foreground hover:text-gold transition px-3 py-2 rounded-lg border border-white/10 hover:border-[var(--gold)]/30">{t("app.admin.clear", "Clear")}</button>
          <button className="flex items-center gap-2 text-xs gold-btn px-3 py-2 rounded-lg font-medium ml-auto">
            <Download className="h-3.5 w-3.5" /> {t("app.admin.export", "Export")}
          </button>
        </div>

        <div className="glass-card rounded-2xl p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-lg font-medium text-foreground">{t("app.admin.allBookings", "All Bookings")}</h3>
            <div className="flex items-center gap-3">

              <span className="text-xs text-muted-foreground">{filtered.length} of {bookings.length} bookings</span>
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide border-b border-white/[0.06]">
                  <th className="pb-3 pr-3"><input type="checkbox" checked={selected.length === filtered.length && filtered.length > 0} onChange={toggleAll} className="h-3.5 w-3.5 accent-[var(--gold)] cursor-pointer" /></th>
                  <th className="pb-3 pr-4">{t("app.admin.id", "ID")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.guest", "Guest")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.suite", "Suite")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.occasion", "Occasion")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.date", "Date")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.time", "Time")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.amount", "Amount")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.status", "Status")}</th>
                  <th className="pb-3 pr-4">{t("app.admin.fullPaymentsReceived", "Full Payment Received")}</th>
                  <th className="pb-3">{t("app.admin.action", "Action")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/[0.04]">
                {filtered.length === 0 ? (
                  <tr><td colSpan={10} className="py-10 text-center text-sm text-muted-foreground">{t("app.admin.noBookingsFound", "No bookings found")}</td></tr>
                ) : filtered.map((b) => (
                  <tr key={b.id} className={`hover:bg-white/[0.02] transition ${selected.includes(b.id) ? "bg-[var(--gold)]/5" : ""}`}>
                    <td className="py-3 pr-3"><input type="checkbox" checked={selected.includes(b.id)} onChange={() => toggleSelect(b.id)} className="h-3.5 w-3.5 accent-[var(--gold)] cursor-pointer" /></td>
                    <td className="py-3 pr-4 text-gold font-medium">{b.id}</td>
                    <td className="py-3 pr-4">
                      <div className="flex flex-col">
                        <span className="text-foreground font-medium">{b.guest}</span>
                        {b.email && <span className="text-[11px] text-muted-foreground">{b.email}</span>}
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs">
                      <button onClick={() => navigate("/rooms")} className="text-gold hover:underline underline-offset-2 text-left transition">{b.suite}</button>
                    </td>
                    <td className="py-3 pr-4 text-muted-foreground">{b.occasion}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{b.date}</td>
                    <td className="py-3 pr-4 text-muted-foreground text-xs">{b.time}{b.endTime ? ` – ${b.endTime}` : ""}</td>
                    <td className="py-3 pr-4 text-foreground font-medium">{b.amount}</td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyle[b.status]}`}>
                        {b.status === "Confirmed" ? t("app.admin.confirmed", "Confirmed") : b.status === "Pending" ? t("app.admin.pending", "Pending") : b.status === "Completed" ? t("app.admin.completed", "Completed") : t("app.admin.cancelled", "Cancelled")}
                      </span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                        (b.fullPaymentReceived || b.paymentMode === 'package_credit')
                          ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                          : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      }`}>
                        {(b.fullPaymentReceived || b.paymentMode === 'package_credit') ? t("app.admin.yes", "Yes") : t("app.admin.no", "No")}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() =>
                          navigate(
                            `/bookings/${String((b as any).rawId ?? b.id).replace(/^#VN/, "")}`
                          )
                        }
                        className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs text-gold border border-gold/25 bg-gold/5 hover:bg-gold/10 hover:border-gold/40 transition"
                      >
                        <Eye className="h-3.5 w-3.5" /> {t("app.admin.viewDetails", "View Details")}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {showNewBooking && (
        <NewBookingModal
          onClose={() => setShowNewBooking(false)}
          onCreated={(b) => addBooking(b)}
        />
      )}
    </div>
  );
}
