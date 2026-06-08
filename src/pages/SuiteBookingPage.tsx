import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, CreditCard,
  Gift, MessageSquare, Star, Sparkles, Users, User, Plus, Minus,
  LayoutDashboard, BedDouble, History, Wallet, Tag, UserCircle,
  HelpCircle, LogOut, Package, Bell, ChevronDown,
} from "lucide-react";

/* ── Dashboard nav items (mirrors UserDashboardPage) ── */
const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",               icon: LayoutDashboard, path: "/user/dashboard" },
  { id: "suites",       label: "Browse Suites",            icon: BedDouble,       path: "/user/dashboard" },
  { id: "my-bookings",  label: "My Bookings",              icon: CalendarDays,    path: "/user/dashboard" },
  { id: "upcoming",     label: "Upcoming Bookings",        icon: Clock,           path: "/user/dashboard" },
  { id: "past",         label: "Past Bookings",            icon: History,         path: "/user/dashboard" },
  { id: "wallet",       label: "Wallet & Payments",        icon: Wallet,          path: "/user/dashboard" },
  { id: "packages",     label: "Celebration Packages",     icon: Package,         path: "/user/dashboard" },
  { id: "offers",       label: "Special Offers & Referrals", icon: Tag,           path: "/user/dashboard" },
  { id: "profile",      label: "Profile Settings",         icon: UserCircle,      path: "/user/dashboard" },
  { id: "help",         label: "Help & Support",           icon: HelpCircle,      path: "/user/dashboard" },
  { id: "write-review", label: "Write a Review",           icon: Star,            path: "/user/write-review" },
];

/* ── Booking data ── */
const OCCASIONS = [
  { id: "birthday",    label: "Birthday",           description: "Elevate every milestone with regal decor and premium service.",    icon: Gift,         highlight: "bg-amber-500/10 text-amber-300" },
  { id: "anniversary", label: "Anniversary",        description: "Curated romance with intimate touches and champagne delights.",     icon: Sparkles,     highlight: "bg-rose-500/10 text-rose-300" },
  { id: "proposal",    label: "Proposal",           description: "A private setting designed for unforgettable moments.",             icon: Star,         highlight: "bg-cyan-500/10 text-cyan-300" },
  { id: "baby-shower", label: "Baby Shower",        description: "Gentle luxury with pastel styling and thoughtful details.",         icon: User,         highlight: "bg-violet-500/10 text-violet-300" },
  { id: "corporate",   label: "Corporate Events",   description: "Executive event spaces with premium AV and hospitality.",           icon: Users,        highlight: "bg-sky-500/10 text-sky-300" },
  { id: "other",       label: "Other Celebrations", description: "Bespoke styling for any exclusive experience.",                    icon: MessageSquare, highlight: "bg-lime-500/10 text-lime-300" },
];

const TIME_SLOTS = [
  "09:00 AM", "11:30 AM", "02:00 PM", "04:30 PM", "07:00 PM", "09:30 PM",
];

// Each slot is 2h 30m — auto-calculate end time
function getEndTime(start: string): string {
  const [time, period] = start.split(" ");
  const [h, m] = time.split(":").map(Number);
  let totalMin = ((period === "PM" && h !== 12 ? h + 12 : period === "AM" && h === 12 ? 0 : h) * 60) + m + 150;
  const endH = Math.floor(totalMin / 60) % 24;
  const endM = totalMin % 60;
  const endPeriod = endH >= 12 ? "PM" : "AM";
  const displayH = endH > 12 ? endH - 12 : endH === 0 ? 12 : endH;
  return `${String(displayH).padStart(2, "0")}:${String(endM).padStart(2, "0")} ${endPeriod}`;
}

const SUITES = [
  { id: "S01", name: "Royal Celebration Suite",    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=600&fit=crop", capacity: 60,  price: 14500, perks: ["Private lounge","VIP check-in","Ambient lighting"] },
  { id: "S02", name: "Golden Anniversary Chamber", image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=600&fit=crop", capacity: 24,  price: 9800,  perks: ["Romantic dinner","Rose petal setup","Suite upgrade"] },
  { id: "S03", name: "Grand Party Pavilion",       image: "https://images.unsplash.com/photo-1534161304597-5d5f70b0a8ba?w=900&h=600&fit=crop", capacity: 120, price: 17500, perks: ["Live DJ stage","Photo zone","Bar service"] },
];

const ADDONS = [
  { id: "premium-catering",   name: "Premium Catering", description: "Curated gourmet menu with premium drinks.",                   price: 4200 },
  { id: "flower-arrangement", name: "Floral Styling",   description: "Bespoke floral installation and centerpiece design.",          price: 2200 },
  { id: "live-music",         name: "Live Music",        description: "Piano, violin or acoustic ensemble for atmosphere.",           price: 3200 },
];

const STEPS = [
  "Select Occasion", "Choose Date & Time", "Select Suite",
  "Add-ons & Customizations", "Booking Summary", "Payment",
];

export default function SuiteBookingPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const [step, setStep] = useState(0);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [selectedSuite, setSelectedSuite] = useState("");
  const [addonQty, setAddonQty] = useState<Record<string, number>>({
    "premium-catering": 0, "flower-arrangement": 0, "live-music": 0,
  });
  const [persons, setPersons] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pay-now" | "pay-venue">("pay-now");
  const [showValidation, setShowValidation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);

  const suite      = SUITES.find((s) => s.id === selectedSuite);
  const personsTotal = persons * 299;
  const addonsTotal = ADDONS.reduce((sum, a) => sum + a.price * (addonQty[a.id] || 0), 0) + personsTotal;
  const basePrice  = suite?.price ?? 0;
  const subtotal   = basePrice + addonsTotal;
  const savings    = Math.round(subtotal * 0.08);
  const serviceFee = 650;
  const taxes      = Math.round((subtotal - savings + serviceFee) * 0.12);
  const grandTotal = subtotal - savings + serviceFee + taxes;

  const isStepValid = useMemo(() => {
    if (step === 0) return !!selectedOccasion;
    if (step === 1) return !!bookingDate && !!startTime;
    if (step === 2) return !!selectedSuite;
    if (step === 5) return !!paymentMethod;
    return true;
  }, [step, selectedOccasion, bookingDate, startTime, selectedSuite, paymentMethod]);

  function handleNext() {
    if (!isStepValid) { setShowValidation(true); return; }
    setShowValidation(false);
    step < STEPS.length - 1 ? setStep((v) => v + 1) : setConfirmed(true);
  }
  function handleBack() { setShowValidation(false); if (step > 0) setStep((v) => v - 1); }
  function updateQty(id: string, delta: number) {
    setAddonQty((p) => ({ ...p, [id]: Math.max(0, (p[id] ?? 0) + delta) }));
  }

  /* ── Shared sidebar JSX ── */
  const Sidebar = (
    <aside className="flex flex-col h-full w-64 bg-[oklch(0.11_0.025_260)] border-r border-gold/10">
      {/* Brand */}
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gold/10">
        <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0">
          <img src="/logo.png" alt="VibeNests" className="h-full w-full object-contain" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-xs font-semibold tracking-[0.15em] text-gradient-gold">VIBENESTS</p>
          <p className="text-[9px] tracking-[0.25em] text-muted-foreground uppercase">Private Luxury Suites</p>
        </div>
      </div>

      {/* User card */}
      <div className="px-4 py-3 border-b border-gold/10">
        <div className="flex items-center gap-3 p-2.5 rounded-xl glass-gold">
          <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center font-bold text-[oklch(0.12_0.02_260)] text-xs shrink-0">A</div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">Adithya Reddy</p>
            <p className="text-[10px] text-gold">Gold Member</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const active = id === "suites";
          return (
            <button
              key={id}
              onClick={() => { navigate(path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                active
                  ? "bg-gold/15 border border-gold/25 text-gold font-medium"
                  : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}
            >
              <Icon className={`h-4 w-4 shrink-0 ${active ? "text-gold" : ""}`} />
              {label}
            </button>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 pb-5 pt-2 border-t border-gold/10">
        <button
          onClick={() => navigate("/login")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all"
        >
          <LogOut className="h-4 w-4 shrink-0" /> Logout
        </button>
      </div>
    </aside>
  );

  /* ── Confirmed screen ── */
  if (confirmed) {
    return (
      <div className="h-screen flex overflow-hidden bg-[oklch(0.08_0.015_260)]">
        <div className="hidden lg:flex shrink-0">{Sidebar}</div>
        <div className="flex-1 flex items-center justify-center p-6 overflow-y-auto">
          <div className="glass-card rounded-3xl border border-gold/20 p-10 text-center max-w-md w-full space-y-5">
            <div className="h-16 w-16 rounded-full bg-gold/15 border border-gold/30 flex items-center justify-center mx-auto">
              <Sparkles className="h-7 w-7 text-gold" />
            </div>
            <h2 className="font-display text-3xl text-foreground">Booking Confirmed!</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">Your luxury suite has been reserved. A confirmation will be sent to you shortly.</p>
            <div className="glass rounded-2xl p-4 text-left space-y-2 border border-white/10">
              <p className="text-xs text-muted-foreground">{OCCASIONS.find(o => o.id === selectedOccasion)?.label}</p>
              <p className="text-sm text-foreground font-medium">{suite?.name}</p>
              <p className="text-xs text-muted-foreground">{bookingDate} · {startTime}{startTime ? ` – ${getEndTime(startTime)}` : ""}</p>
              <p className="text-gold font-semibold">₹{grandTotal.toLocaleString()}</p>
            </div>
            <button onClick={() => navigate("/user/dashboard")} className="gold-btn w-full rounded-2xl py-3 text-sm font-semibold">
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[oklch(0.08_0.015_260)]">

      {/* ── Desktop sidebar ── */}
      <div className="hidden lg:flex shrink-0">{Sidebar}</div>

      {/* ── Mobile sidebar overlay ── */}
      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full z-40 lg:hidden">{Sidebar}</div>
        </>
      )}

      {/* ── Main area ── */}
      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">

        {/* Top header */}
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 border-b border-white/5 glass backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setSidebarOpen((o) => !o)}
              className="flex lg:hidden flex-col justify-center items-center gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors"
            >
              <span className="block w-5 h-0.5 bg-muted-foreground" />
              <span className="block w-5 h-0.5 bg-muted-foreground" />
              <span className="block w-5 h-0.5 bg-muted-foreground" />
            </button>
            <button
              onClick={() => navigate("/user/dashboard")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors"
            >
              <ChevronLeft className="h-4 w-4" /> Dashboard
            </button>
            <span className="text-white/20">/</span>
            <span className="text-sm text-foreground font-medium">Suite Booking</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 text-gold" /> Secure booking
            </span>
            <button className="relative h-9 w-9 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
            </button>
            <div className="relative">
              <button
                onClick={() => setProfileOpen((o) => !o)}
                className="h-9 w-9 rounded-xl bg-gradient-gold flex items-center justify-center font-bold text-[oklch(0.12_0.02_260)] text-sm hover:opacity-80 transition-opacity"
              >
                A
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-44 glass-card rounded-xl border border-white/10 py-1 shadow-xl">
                    <button
                      onClick={() => { navigate("/login"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="h-4 w-4 shrink-0" /> Logout
                    </button>
                    <button
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors"
                    >
                      <ChevronDown className="h-4 w-4 shrink-0" /> Cancel
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        {/* Scrollable content */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">

            {/* Page title */}
            <div className="glass-card rounded-2xl border border-gold/15 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">Premium experience</p>
              <h2 className="font-display text-2xl lg:text-3xl text-foreground font-semibold mt-1">
                Book a luxury suite in six effortless steps
              </h2>
            </div>

            {/* 2-col grid: step sidebar | form */}
            <div className="grid gap-5 lg:grid-cols-[200px_1fr]">

              {/* ── Left step sidebar ── */}
              <aside className="hidden lg:block">
                <div className="glass-card sticky top-5 rounded-2xl border border-gold/15 p-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold px-2 mb-3">Your Journey</p>
                  {STEPS.map((label, index) => {
                    const done   = index < step;
                    const active = index === step;
                    return (
                      <button
                        key={label}
                        type="button"
                        onClick={() => !active && index < step && setStep(index)}
                        disabled={index > step}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all ${
                          active ? "bg-gold/15 border border-gold/30 text-gold font-semibold"
                          : done  ? "bg-white/5 border border-white/8 text-foreground/70 hover:bg-gold/8 hover:text-gold"
                          : "text-muted-foreground/40 cursor-not-allowed"
                        }`}
                      >
                        <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0 ${
                          done   ? "border-gold bg-gold text-[oklch(0.12_0.02_260)]"
                          : active ? "border-gold bg-gold/15 text-gold"
                          : "border-white/15 bg-white/5 text-muted-foreground/40"
                        }`}>
                          {done ? "✓" : index + 1}
                        </span>
                        <span className="text-left leading-tight">{label}</span>
                      </button>
                    );
                  })}

                  {/* Progress */}
                  <div className="mt-4 px-2 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Progress</span>
                      <span>{Math.round((step / (STEPS.length - 1)) * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-500"
                        style={{ width: `${Math.round((step / (STEPS.length - 1)) * 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </aside>

              {/* ── Main form ── */}
              <div className="space-y-4">
                {/* Mobile step pills */}
                <div className="flex lg:hidden items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {STEPS.map((label, index) => (
                    <div key={label} className="flex items-center shrink-0">
                      <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                        index === step ? "border-gold bg-gold/15 text-gold"
                        : index < step ? "border-gold/30 bg-gold/8 text-gold/70"
                        : "border-white/10 bg-white/5 text-muted-foreground"
                      }`}>
                        <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${
                          index < step ? "border-gold bg-gold text-[oklch(0.12_0.02_260)]" : "border-current"
                        }`}>{index < step ? "✓" : index + 1}</span>
                        {index === step && <span>{label}</span>}
                      </div>
                      {index < STEPS.length - 1 && (
                        <div className={`w-3 h-px mx-0.5 shrink-0 ${index < step ? "bg-gold/50" : "bg-white/10"}`} />
                      )}
                    </div>
                  ))}
                </div>

                <div className="glass-card rounded-2xl border border-gold/15 p-5 space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">Step {step + 1}</p>
                      <h3 className="font-display text-xl text-foreground font-semibold mt-1">{STEPS[step]}</h3>
                    </div>
                    <div className="rounded-xl bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground border border-white/10">
                      {step + 1} / {STEPS.length}
                    </div>
                  </div>

                  {/* Step 0 */}
                  {step === 0 && (
                    <div className="grid gap-3 md:grid-cols-2">
                      {OCCASIONS.map((o) => {
                        const Icon = o.icon;
                        const active = o.id === selectedOccasion;
                        return (
                          <button key={o.id} type="button" onClick={() => setSelectedOccasion(o.id)}
                            className={`flex flex-col gap-3 rounded-2xl border p-4 text-left transition-all ${
                              active ? "border-gold bg-gold/10 shadow-[0_16px_40px_rgba(255,190,90,0.1)]"
                              : "border-white/10 bg-white/5 hover:border-gold/20 hover:bg-white/10"
                            }`}>
                            <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${o.highlight}`}>
                              <Icon className="h-5 w-5" />
                            </span>
                            <div>
                              <h4 className="font-display text-base text-foreground">{o.label}</h4>
                              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{o.description}</p>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Step 1 */}
                  {step === 1 && (
                    <div className="space-y-6">
                      {/* Date */}
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Select Date</label>
                        <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                          className="luxury-input w-full rounded-2xl px-4 py-3 text-sm bg-black/40" />
                      </div>

                      {/* Time slot boxes */}
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Select Time Slot</p>
                          <span className="px-2 py-0.5 rounded-full bg-gold/10 border border-gold/25 text-[10px] text-gold font-semibold">2h 30m per slot</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {TIME_SLOTS.map((t) => {
                            const end = getEndTime(t);
                            const active = startTime === t;
                            return (
                              <button
                                key={t}
                                type="button"
                                onClick={() => setStartTime(t)}
                                className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all ${
                                  active
                                    ? "border-gold bg-gold/15 text-gold shadow-[0_0_16px_rgba(212,160,60,0.2)]"
                                    : "border-white/10 bg-white/5 text-muted-foreground hover:border-gold/40 hover:text-foreground hover:bg-white/10"
                                }`}
                              >
                                <div className="flex items-center gap-2.5">
                                  <Clock className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "text-gold/40"}`} />
                                  <span>{t} – {end}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  active ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 bg-white/5 text-muted-foreground"
                                }`}>2h 30m</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>

                      {/* Selected slot badge */}
                      {startTime && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-gold/25 bg-gold/8">
                          <Clock className="h-4 w-4 text-gold shrink-0" />
                          <p className="text-sm text-foreground">
                            Selected:{" "}
                            <span className="text-gold font-semibold">{startTime} – {getEndTime(startTime)}</span>
                            <span className="text-muted-foreground ml-2 text-xs">· 2 hrs 30 mins</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2 */}
                  {step === 2 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {SUITES.map((s) => {
                        const active = selectedSuite === s.id;
                        return (
                          <button key={s.id} type="button" onClick={() => setSelectedSuite(s.id)}
                            className={`flex flex-col overflow-hidden rounded-2xl border transition-all text-left ${
                              active ? "border-gold bg-gold/10 shadow-[0_20px_50px_rgba(255,190,90,0.1)]"
                              : "border-white/10 bg-white/5 hover:border-gold/20"
                            }`}>
                            <div className="h-44 overflow-hidden">
                              <img src={s.image} alt={s.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                            </div>
                            <div className="p-4 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-display text-base text-foreground">{s.name}</h4>
                                  <p className="text-xs text-muted-foreground">Suite ID {s.id}</p>
                                </div>
                                <p className="font-semibold text-gold text-sm shrink-0">₹{s.price.toLocaleString()}</p>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5 text-gold/70" /> Up to {s.capacity} guests
                              </div>
                              <div className="flex flex-wrap gap-1.5">
                                {s.perks.map((p) => (
                                  <span key={p} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-muted-foreground">{p}</span>
                                ))}
                              </div>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="space-y-5">
                      <div className="glass-card rounded-2xl border border-white/10 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-display text-base text-foreground">Number of Persons</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">₹299 per person</p>
                          </div>
                          <p className="font-semibold text-gold shrink-0">₹{(persons * 299).toLocaleString()}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                            <button type="button" onClick={() => setPersons((p) => Math.max(1, p - 1))} className="h-7 w-7 rounded-full border border-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[28px] text-center font-semibold text-foreground text-sm">{persons}</span>
                            <button type="button" onClick={() => setPersons((p) => p + 1)} className="h-7 w-7 rounded-full border border-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {ADDONS.map((addon) => (
                          <div key={addon.id} className="glass-card rounded-2xl border border-white/10 p-4">
                            <div className="flex items-center justify-between gap-4">
                              <div>
                                <h4 className="font-display text-base text-foreground">{addon.name}</h4>
                                <p className="text-xs text-muted-foreground mt-0.5">{addon.description}</p>
                              </div>
                              <p className="font-semibold text-gold shrink-0">₹{addon.price.toLocaleString()}</p>
                            </div>
                            <div className="mt-3 flex items-center gap-3">
                              <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                                <button type="button" onClick={() => updateQty(addon.id, -1)} className="h-7 w-7 rounded-full border border-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition">
                                  <Minus className="h-3.5 w-3.5" />
                                </button>
                                <span className="min-w-[28px] text-center font-semibold text-foreground text-sm">{addonQty[addon.id]}</span>
                                <button type="button" onClick={() => updateQty(addon.id, 1)} className="h-7 w-7 rounded-full border border-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition">
                                  <Plus className="h-3.5 w-3.5" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold">
                          <MessageSquare className="h-4 w-4 text-gold" /> Special Requests
                        </div>
                        <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={4}
                          placeholder="Add any special instructions..."
                          className="luxury-input w-full rounded-2xl px-4 py-3 text-sm bg-black/40 resize-none" />
                      </div>
                    </div>
                  )}

                  {/* Step 4 */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="glass-card rounded-2xl border border-white/10 p-4">
                          <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Your Celebration</h4>
                          <p className="mt-3 text-base text-foreground font-semibold">{OCCASIONS.find((o) => o.id === selectedOccasion)?.label ?? "No occasion"}</p>
                          <p className="text-xs text-muted-foreground mt-1">{bookingDate ? new Date(bookingDate).toLocaleDateString() : "No date"}</p>
                          <p className="text-xs text-muted-foreground">{startTime ? `${startTime} – ${getEndTime(startTime)}` : "No time"}</p>
                        </div>
                        <div className="glass-card rounded-2xl border border-white/10 p-4">
                          <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Suite</h4>
                          {suite ? (
                            <div className="mt-3 space-y-1">
                              <p className="text-base text-foreground font-semibold">{suite.name}</p>
                              <p className="text-xs text-muted-foreground">Capacity: {suite.capacity} guests</p>
                              <p className="text-xs text-gold">₹{suite.price.toLocaleString()}</p>
                            </div>
                          ) : <p className="text-xs text-muted-foreground mt-3">No suite selected.</p>}
                        </div>
                      </div>
                      <div className="glass-card rounded-2xl border border-white/10 p-4">
                        <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">Add-ons</h4>
                        <div className="flex justify-between text-sm py-1">
                          <span className="text-muted-foreground">Persons × {persons}</span>
                          <span className="text-gold">₹{personsTotal.toLocaleString()}</span>
                        </div>
                        {ADDONS.filter((a) => (addonQty[a.id] ?? 0) > 0).map((a) => (
                          <div key={a.id} className="flex justify-between text-sm py-1">
                            <span className="text-muted-foreground">{a.name} × {addonQty[a.id]}</span>
                            <span className="text-gold">₹{(a.price * addonQty[a.id]).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      {specialRequests && (
                        <div className="glass-card rounded-2xl border border-white/10 p-4">
                          <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">Special Requests</h4>
                          <p className="text-xs text-muted-foreground">{specialRequests}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5 */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="glass-card rounded-2xl border border-white/10 p-4">
                        <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">Payment Options</h4>
                        <div className="space-y-3">
                          {[
                            { id: "pay-now",   label: "Pay Now",      description: "Secure your booking instantly with card payment." },
                            { id: "pay-venue", label: "Pay at Venue", description: "Reserve now and complete payment at the venue." },
                          ].map((opt) => (
                            <button key={opt.id} type="button" onClick={() => setPaymentMethod(opt.id as any)}
                              className={`w-full rounded-2xl border p-4 text-left transition ${
                                paymentMethod === opt.id ? "border-gold bg-gold/10" : "border-white/10 bg-black/40 hover:border-gold/20"
                              }`}>
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className={`font-display text-base ${paymentMethod === opt.id ? "text-gold" : "text-foreground"}`}>{opt.label}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5">{opt.description}</p>
                                </div>
                                <div className={`h-5 w-5 rounded-full border-2 shrink-0 ${paymentMethod === opt.id ? "border-gold bg-gold/20" : "border-white/20"}`} />
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>
                      <div className="rounded-2xl bg-gradient-to-r from-gold/15 to-gold/5 p-4 border border-gold/15">
                        <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Savings</p>
                        <p className="mt-1 text-base text-foreground font-semibold">₹{savings.toLocaleString()} luxury discount applied</p>
                      </div>
                    </div>
                  )}

                  {showValidation && !isStepValid && (
                    <p className="text-sm text-rose-400">Please complete the required selection before continuing.</p>
                  )}

                  <div className="flex gap-3 pt-1">
                    <button type="button" onClick={handleBack} disabled={step === 0}
                      className="flex-1 rounded-2xl border border-white/10 px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-40">
                      <ChevronLeft className="inline-block h-4 w-4 mr-1" /> Back
                    </button>
                    <button type="button" onClick={handleNext}
                      className="flex-1 gold-btn rounded-2xl px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                      {step === STEPS.length - 1 ? "Confirm Booking" : "Continue"}
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              </div>


            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
