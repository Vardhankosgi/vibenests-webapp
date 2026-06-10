import { useMemo, useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  CalendarDays, ChevronLeft, ChevronRight, Clock, CreditCard,
  Gift, MessageSquare, Star, Sparkles, Users, User, Plus, Minus,
  LayoutDashboard, BedDouble, History, Wallet, Tag, UserCircle,
  HelpCircle, LogOut, Package, Bell, ChevronDown, CheckCircle2,
  Building,
} from "lucide-react";
import { useSuitesContext } from "@/components/admin/SuitesContext";
import { bookingsApi, paymentsApi } from "@/lib/api";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { useTranslation } from "react-i18next";

/* ── Dashboard nav items ── */
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

const OCCASIONS = [
  { id: "birthday",    label: "Birthday",           description: "Elevate every milestone with regal decor and premium service.",    icon: Gift,         highlight: "bg-amber-500/10 text-amber-300" },
  { id: "anniversary", label: "Anniversary",        description: "Curated romance with intimate touches and champagne delights.",     icon: Sparkles,     highlight: "bg-rose-500/10 text-rose-300" },
  { id: "proposal",    label: "Proposal",           description: "A private setting designed for unforgettable moments.",             icon: Star,         highlight: "bg-cyan-500/10 text-cyan-300" },
  { id: "baby-shower", label: "Baby Shower",        description: "Gentle luxury with pastel styling and thoughtful details.",         icon: User,         highlight: "bg-violet-500/10 text-violet-300" },
  { id: "corporate",   label: "Corporate Events",   description: "Executive event spaces with premium AV and hospitality.",           icon: Users,        highlight: "bg-sky-500/10 text-sky-300" },
  { id: "other",       label: "Other Celebrations", description: "Bespoke styling for any exclusive experience.",                    icon: MessageSquare, highlight: "bg-lime-500/10 text-lime-300" },
];

const TIME_SLOTS = [
  "09:00 AM", "12:00 PM", "03:00 PM", "06:00 PM", "09:00 PM",
];

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

const ADDONS = [
  { id: "premium-catering",   name: "Premium Catering", description: "Curated gourmet menu with premium drinks.",                   price: 4200 },
  { id: "flower-arrangement", name: "Floral Styling",   description: "Bespoke floral installation and centerpiece design.",          price: 2200 },
  { id: "live-music",         name: "Live Music",        description: "Piano, violin or acoustic ensemble for atmosphere.",           price: 3200 },
];

const STEPS = [
  "Select Occasion", "Choose Date & Time",
  "Add-ons & Customizations", "Booking Summary", "Payment",
];

/* Load Razorpay checkout script */
function loadRazorpay(): Promise<boolean> {
  return new Promise((resolve) => {
    if ((window as any).Razorpay) { resolve(true); return; }
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
}

export default function SuiteBookingPage() {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();
  const { suites } = useSuitesContext();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  const stepKeys = useMemo(() => [
    "app.userDashboard.selectOccasion",
    "app.userDashboard.chooseDateTime",
    "app.userDashboard.addonsCustomizations",
    "app.userDashboard.bookingSummary",
    "app.userDashboard.payment",
  ], []);

  const localizedOccasions = useMemo(() => OCCASIONS.map(o => {
    const keyPart = o.id.replace("-", "_");
    const labelKey = keyPart === "baby_shower" ? "baby_shower" : keyPart === "corporate" ? "corporate_events" : keyPart === "other" ? "other_celebrations" : keyPart;
    return {
      ...o,
      label: t("app.userDashboard.occasion_" + labelKey, o.label),
      description: t("app.userDashboard.occasion_" + keyPart + "_desc", o.description),
    };
  }), [t]);

  const localizedAddons = useMemo(() => ADDONS.map(a => {
    const keyPart = a.id.replace("-", "_");
    return {
      ...a,
      name: t("app.userDashboard.addon_" + keyPart, a.name),
      description: t("app.userDashboard.addon_" + keyPart + "_desc", a.description),
    };
  }), [t]);

  const [step, setStep] = useState(0);
  const [selectedOccasion, setSelectedOccasion] = useState("");
  const [bookingDate, setBookingDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [selectedSuiteId, setSelectedSuiteId] = useState<number | null>(null);
  const [addonQty, setAddonQty] = useState<Record<string, number>>({
    "premium-catering": 0, "flower-arrangement": 0, "live-music": 0,
  });
  const [persons, setPersons] = useState(1);
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMode, setPaymentMode] = useState<"pay_now" | "pay_at_venue">("pay_now");
  const [showValidation, setShowValidation] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [confirmedBookingId, setConfirmedBookingId] = useState<number | null>(null);
  const [processing, setProcessing] = useState(false);
  const [payError, setPayError] = useState("");

  const suite = suites.find((s) => s.id === String(selectedSuiteId));
  const suiteMinCap = suite?.minCapacity ?? 1;
  const suiteMaxCap = suite?.capacity ?? 99;
  const suiteBasePrice = suite ? parseFloat(String(suite.price).replace(/[₹,]/g, "")) : 0;
  const rateExtra = suite?.ratePerExtraPerson ?? 0;
  const extraPersons = Math.max(0, persons - suiteMinCap);
  const personsTotal = extraPersons * rateExtra;
  const addonsTotal = ADDONS.reduce((sum, a) => sum + a.price * (addonQty[a.id] || 0), 0) + personsTotal;
  const basePrice = suiteBasePrice;
  const subtotal   = basePrice + addonsTotal;
  const savings    = Math.round(subtotal * 0.08);
  const serviceFee = 650;
  const taxes = Math.round((subtotal - savings + serviceFee) * 0.12);
  const grandTotal = subtotal - savings + serviceFee + taxes;
  const advanceAmount = Math.round(grandTotal * 0.2);
  const payableNow = paymentMode === "pay_now" ? grandTotal : advanceAmount;

  const isStepValid = useMemo(() => {
    if (step === 0) return !!selectedOccasion;
    if (step === 1) return !!bookingDate && !!startTime;
    if (step === 2) return !!selectedSuiteId;
    if (step === 5) return !!paymentMode;
    return true;
  }, [step, selectedOccasion, bookingDate, startTime, selectedSuiteId, paymentMode]);

  function handleNext() {
    if (!isStepValid) { setShowValidation(true); return; }
    setShowValidation(false);
    if (step < STEPS.length - 1) setStep((v) => v + 1);
  }
  function handleBack() { setShowValidation(false); if (step > 0) setStep((v) => v - 1); }

  // Pre-select suite from Book Now navigation
  useEffect(() => {
    const passedId = (location.state as any)?.suiteId;
    if (passedId && suites.length > 0) {
      const found = suites.find((s) => s.id === String(passedId));
      if (found) { setSelectedSuiteId(Number(found.id)); setPersons(found.minCapacity); }
    }
  }, [suites, location.state]);

  function updateQty(id: string, delta: number) {
    setAddonQty((p) => ({ ...p, [id]: Math.max(0, (p[id] ?? 0) + delta) }));
  }

  async function handleProceedToPay() {
    if (!suite) return;
    setPayError("");
    setProcessing(true);

    try {
      // 1. Create booking
      const userRaw = localStorage.getItem("authUser");
      const user = userRaw ? JSON.parse(userRaw) : null;

      const booking = await bookingsApi.adminCreate({
        suiteId: suite.id,
        suiteName: suite.name,
        eventType: OCCASIONS.find(o => o.id === selectedOccasion)?.label || selectedOccasion,
        addOns: ADDONS.filter(a => (addonQty[a.id] || 0) > 0).map(a => a.name),
        date: bookingDate,
        timeSlot: startTime,
        endTimeSlot: getEndTime(startTime),
        persons,
        basePrice,
        addonsTotal,
        savings,
        serviceFee,
        taxes,
        totalAmount: grandTotal,
        paymentMode,
        advanceAmount,
      });

      // 2. Create Razorpay order
      const order = { keyId: "", orderId: "", paymentId: 0 }; // TODO: wire up paymentsApi

      // 3. Load Razorpay & open checkout
      const loaded = await loadRazorpay();
      if (!loaded) throw new Error("Razorpay SDK failed to load");

      const options = {
        key: order.keyId,
        amount: Math.round(payableNow * 100),
        currency: "INR",
        name: "VibeNests",
        description: `${paymentMode === "pay_now" ? "Full Payment" : "Advance (20%)"} – #VN${booking.id}`,
        order_id: order.orderId,
        prefill: {
          name: user?.fullName || "",
          email: user?.email || "",
        },
        theme: { color: "#d4a93c" },
        handler: async (response: any) => {
          try {
            await paymentsApi.verifyPayment(
              order.paymentId,
              response.razorpay_order_id,
              response.razorpay_payment_id,
              response.razorpay_signature,
            );
            setConfirmedBookingId(booking.id);
            setConfirmed(true);
          } catch (err: any) {
            setPayError(err.message || "Payment verification failed");
            setProcessing(false);
          }
        },
        modal: {
          ondismiss: () => setProcessing(false),
        },
      };

      const rzp = new (window as any).Razorpay(options);
      rzp.open();
    } catch (err: any) {
      setPayError(err.message || "Something went wrong. Please try again.");
      setProcessing(false);
    }
  }

  /* ── Sidebar ── */
  const Sidebar = (
    <aside className="flex flex-col h-full w-64 bg-[oklch(0.11_0.025_260)] border-r border-gold/10">
      <div className="flex items-center gap-3 px-4 py-4 border-b border-gold/10">
        <div className="h-9 w-9 rounded-lg overflow-hidden shrink-0">
          <img src="/logo.png" alt="VibeNests" className="h-full w-full object-contain" />
        </div>
        <div className="leading-tight">
          <p className="font-display text-xs font-semibold tracking-[0.15em] text-gradient-gold">VIBENESTS</p>
          <p className="text-[9px] tracking-[0.25em] text-muted-foreground uppercase">Private Luxury Suites</p>
        </div>
      </div>
      <div className="px-4 py-3 border-b border-gold/10">
        <div className="flex items-center gap-3 p-2.5 rounded-xl glass-gold">
          <div className="h-8 w-8 rounded-full bg-gradient-gold flex items-center justify-center font-bold text-[oklch(0.12_0.02_260)] text-xs shrink-0">A</div>
          <div className="min-w-0">
            <p className="text-xs font-medium text-foreground truncate">Adithya Reddy</p>
            <p className="text-[10px] text-gold">{t("app.userDashboard.goldMember", "Gold Member")}</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 px-3 py-3 space-y-0.5 overflow-y-auto scrollbar-none">
        {NAV_ITEMS.map(({ id, label, icon: Icon, path }) => {
          const translatedLabel =
            id === "dashboard" ? t("app.userDashboard.dashboard", "Dashboard") :
            id === "suites" ? t("app.userDashboard.browseSuites", "Browse Suites") :
            id === "my-bookings" ? t("app.userDashboard.myBookings", "My Bookings") :
            id === "upcoming" ? t("app.userDashboard.upcomingBookings", "Upcoming Bookings") :
            id === "past" ? t("app.userDashboard.pastBookings", "Past Bookings") :
            id === "wallet" ? t("app.userDashboard.walletPayments", "Wallet & Payments") :
            id === "packages" ? t("app.userDashboard.celebrationPackages", "Celebration Packages") :
            id === "offers" ? t("app.userDashboard.specialOffersReferrals", "Special Offers & Referrals") :
            id === "profile" ? t("app.userDashboard.profileSettings", "Profile Settings") :
            id === "help" ? t("app.userDashboard.helpSupport", "Help & Support") :
            id === "write-review" ? t("app.userDashboard.writeReview", "Write a Review") :
            label;
          return (
            <button key={id} onClick={() => { navigate(path); setSidebarOpen(false); }}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${
                id === "suites" ? "bg-gold/15 border border-gold/25 text-gold font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
              }`}>
              <Icon className={`h-4 w-4 shrink-0 ${id === "suites" ? "text-gold" : ""}`} />
              {translatedLabel}
            </button>
          );
        })}
      </nav>
      <div className="px-3 pb-5 pt-2 border-t border-gold/10">
        <button onClick={() => navigate("/login")}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all">
          <LogOut className="h-4 w-4 shrink-0" /> {t("app.userDashboard.logout", "Logout")}
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
            <div className="flex-1 max-h-[160px] flex items-center justify-center">
              <div className="h-16 w-16 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mx-auto">
                <CheckCircle2 className="h-7 w-7 text-emerald-400" />
              </div>
            </div>
            <h2 className="font-display text-3xl text-foreground">{t("app.userDashboard.bookingConfirmed", "Booking Confirmed!")}</h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("app.userDashboard.bookingConfirmedDesc", "Your luxury suite has been reserved and payment received. A confirmation email has been sent to you.")}
            </p>
            {confirmedBookingId && (
              <div className="glass rounded-2xl p-4 text-left space-y-2 border border-white/10">
                <p className="text-xs text-muted-foreground font-mono">{t("app.userDashboard.bookingId", "Booking ID: #VN{{id}}", { id: confirmedBookingId })}</p>
                <p className="text-sm text-foreground font-medium">{suite?.name}</p>
                <p className="text-xs text-muted-foreground">
                  {localizedOccasions.find(o => o.id === selectedOccasion)?.label} · {bookingDate} · {startTime} – {getEndTime(startTime)}
                </p>
                <div className="pt-1 border-t border-white/10 flex justify-between text-sm">
                  <span className="text-muted-foreground">{paymentMode === "pay_now" ? t("app.userDashboard.paidInFull", "Paid in Full") : t("app.userDashboard.advancePaid", "Advance Paid (20%)")}</span>
                  <span className="text-gold font-semibold">₹{payableNow.toLocaleString()}</span>
                </div>
                {paymentMode === "pay_at_venue" && (
                  <p className="text-xs text-amber-400">{t("app.userDashboard.balancePayableAtVenue", "Balance ₹{{amount}} payable at venue", { amount: (grandTotal - advanceAmount).toLocaleString() })}</p>
                )}
              </div>
            )}
            <button onClick={() => navigate("/user/dashboard")} className="gold-btn w-full rounded-2xl py-3 text-sm font-semibold">
              {t("app.userDashboard.viewMyBookings", "View My Bookings")}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden bg-[oklch(0.08_0.015_260)]">
      <div className="hidden lg:flex shrink-0">{Sidebar}</div>

      {sidebarOpen && (
        <>
          <div className="fixed inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          <div className="fixed top-0 left-0 h-full z-40 lg:hidden">{Sidebar}</div>
        </>
      )}

      <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
        <header className="sticky top-0 z-20 flex items-center justify-between px-5 py-3.5 border-b border-white/5 glass backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-3">
            <button onClick={() => setSidebarOpen((o) => !o)}
              className="flex lg:hidden flex-col justify-center items-center gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors">
              <span className="block w-5 h-0.5 bg-muted-foreground" />
              <span className="block w-5 h-0.5 bg-muted-foreground" />
              <span className="block w-5 h-0.5 bg-muted-foreground" />
            </button>
            <button onClick={() => navigate("/user/dashboard")}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-gold transition-colors">
              <ChevronLeft className="h-4 w-4" /> {t("app.userDashboard.dashboard", "Dashboard")}
            </button>
            <span className="text-white/20">/</span>
            <span className="text-sm text-foreground font-medium">{t("app.userDashboard.suiteBooking", "Suite Booking")}</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSelector />
            <span className="hidden sm:inline-flex items-center gap-2 rounded-full border border-gold/20 bg-white/5 px-3 py-1.5 text-xs text-muted-foreground">
              <CreditCard className="h-3.5 w-3.5 text-gold" /> {t("app.userDashboard.secureBooking", "Secure booking")}
            </span>
            <button className="relative h-9 w-9 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
              <Bell className="h-4 w-4" />
              <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
            </button>
            <div className="relative">
              <button onClick={() => setProfileOpen((o) => !o)}
                className="h-9 w-9 rounded-xl bg-gradient-gold flex items-center justify-center font-bold text-[oklch(0.12_0.02_260)] text-sm hover:opacity-80 transition-opacity">
                A
              </button>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <div className="absolute right-0 top-11 z-50 w-44 glass-card rounded-xl border border-white/10 py-1 shadow-xl">
                    <button onClick={() => { navigate("/login"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <LogOut className="h-4 w-4 shrink-0" /> {t("app.userDashboard.logout", "Logout")}
                    </button>
                    <button onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                      <ChevronDown className="h-4 w-4 shrink-0" /> {t("app.userDashboard.cancel", "Cancel")}
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-5">
            <div className="glass-card rounded-2xl border border-gold/15 px-6 py-5">
              <p className="text-xs uppercase tracking-[0.35em] text-muted-foreground">{t("app.userDashboard.premiumExperience", "Premium experience")}</p>
              <h2 className="font-display text-2xl lg:text-3xl text-foreground font-semibold mt-1">
                {suite ? suite.name : t("app.userDashboard.bookLuxurySuiteSteps", "Book a luxury suite in six effortless steps")}
              </h2>
              {suite && (
                <p className="text-xs text-muted-foreground mt-1">{t("app.userDashboard.guestsBaseRate", "{{minCap}}–{{maxCap}} guests · {{price}} base rate", { minCap: suiteMinCap, maxCap: suiteMaxCap, price: suite.price })}</p>
              )}
            </div>

            <div className="grid gap-5 lg:grid-cols-[200px_1fr]">
              <aside className="hidden lg:block">
                <div className="glass-card sticky top-5 rounded-2xl border border-gold/15 p-4 space-y-1">
                  <p className="text-[10px] uppercase tracking-[0.3em] text-muted-foreground font-semibold px-2 mb-3">{t("app.userDashboard.yourJourney", "Your Journey")}</p>
                  {STEPS.map((label, index) => {
                    const done   = index < step;
                    const active = index === step;
                    const translatedLabel = t(stepKeys[index], label);
                    return (
                      <button key={label} type="button"
                        onClick={() => !active && index < step && setStep(index)}
                        disabled={index > step}
                        className={`w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl text-xs transition-all ${
                          active ? "bg-gold/15 border border-gold/30 text-gold font-semibold"
                          : done  ? "bg-white/5 border border-white/8 text-foreground/70 hover:bg-gold/8 hover:text-gold"
                          : "text-muted-foreground/40 cursor-not-allowed"
                        }`}>
                        <span className={`h-5 w-5 rounded-full border-2 flex items-center justify-center text-[9px] font-bold shrink-0 ${
                          done   ? "border-gold bg-gold text-[oklch(0.12_0.02_260)]"
                          : active ? "border-gold bg-gold/15 text-gold"
                          : "border-white/15 bg-white/5 text-muted-foreground/40"
                        }`}>
                          {done ? "✓" : index + 1}
                        </span>
                        <span className="text-left leading-tight">{translatedLabel}</span>
                      </button>
                    );
                  })}
                  <div className="mt-4 px-2 space-y-1.5">
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>{t("app.userDashboard.progress", "Progress")}</span>
                      <span>{Math.round((step / (STEPS.length - 1)) * 100)}%</span>
                    </div>
                    <div className="h-1.5 rounded-full bg-white/10 overflow-hidden">
                      <div className="h-full rounded-full bg-gradient-to-r from-gold/80 to-gold transition-all duration-500"
                        style={{ width: `${Math.round((step / (STEPS.length - 1)) * 100)}%` }} />
                    </div>
                  </div>
                </div>
              </aside>

              <div className="space-y-4">
                {/* Mobile step pills */}
                <div className="flex lg:hidden items-center gap-1 overflow-x-auto pb-1 scrollbar-none">
                  {STEPS.map((label, index) => {
                    const translatedLabel = t(stepKeys[index], label);
                    return (
                      <div key={label} className="flex items-center shrink-0">
                        <div className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-full text-[11px] font-medium border transition-all ${
                          index === step ? "border-gold bg-gold/15 text-gold"
                          : index < step ? "border-gold/30 bg-gold/8 text-gold/70"
                          : "border-white/10 bg-white/5 text-muted-foreground"
                        }`}>
                          <span className={`h-4 w-4 rounded-full border flex items-center justify-center text-[9px] font-bold shrink-0 ${
                            index < step ? "border-gold bg-gold text-[oklch(0.12_0.02_260)]" : "border-current"
                          }`}>{index < step ? "✓" : index + 1}</span>
                          {index === step && <span>{translatedLabel}</span>}
                        </div>
                        {index < STEPS.length - 1 && (
                          <div className={`w-3 h-px mx-0.5 shrink-0 ${index < step ? "bg-gold/50" : "bg-white/10"}`} />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="glass-card rounded-2xl border border-gold/15 p-5 space-y-5">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.3em] text-muted-foreground">{t("app.userDashboard.stepText", "Step {{step}}", { step: step + 1 })}</p>
                      <h3 className="font-display text-xl text-foreground font-semibold mt-1">{t(stepKeys[step], STEPS[step])}</h3>
                    </div>
                    <div className="rounded-xl bg-white/5 px-3 py-1.5 text-xs uppercase tracking-[0.25em] text-muted-foreground border border-white/10">
                      {step + 1} / {STEPS.length}
                    </div>
                  </div>

                  {/* Step 0 – Occasion */}
                  {step === 0 && (
                    <div className="grid gap-3 md:grid-cols-2">
                      {localizedOccasions.map((o) => {
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

                  {/* Step 1 – Date & Time */}
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("app.userDashboard.selectDate", "Select Date")}</label>
                        <input type="date" value={bookingDate} onChange={(e) => setBookingDate(e.target.value)}
                          className="luxury-input w-full rounded-2xl px-4 py-3 text-sm bg-black/40" style={{ colorScheme: "dark" }} />
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("app.userDashboard.selectTimeSlot", "Select Time Slot")}</p>
                          <span className="px-2 py-0.5 rounded-full bg-gold/10 border border-gold/25 text-[10px] text-gold font-semibold">{t("app.userDashboard.slotDuration", "2h 30m per slot")}</span>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                          {TIME_SLOTS.map((slot) => {
                            const end = getEndTime(slot);
                            const active = startTime === slot;
                            return (
                              <button key={slot} type="button" onClick={() => setStartTime(slot)}
                                className={`flex items-center justify-between gap-3 px-4 py-3.5 rounded-2xl border text-sm font-medium transition-all ${
                                  active ? "border-gold bg-gold/15 text-gold shadow-[0_0_16px_rgba(212,160,60,0.2)]"
                                  : "border-white/10 bg-white/5 text-muted-foreground hover:border-gold/40 hover:text-foreground hover:bg-white/10"
                                }`}>
                                <div className="flex items-center gap-2.5">
                                  <Clock className={`h-4 w-4 shrink-0 ${active ? "text-gold" : "text-gold/40"}`} />
                                  <span>{slot} – {end}</span>
                                </div>
                                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                                  active ? "border-gold/40 bg-gold/10 text-gold" : "border-white/10 bg-white/5 text-muted-foreground"
                                }`}>{t("app.userDashboard.slotDurationShort", "2h 30m")}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                      {startTime && (
                        <div className="flex items-center gap-2.5 px-4 py-3 rounded-2xl border border-gold/25 bg-gold/8">
                          <Clock className="h-4 w-4 text-gold shrink-0" />
                          <p className="text-sm text-foreground">
                            {t("app.userDashboard.selectedSlot", "Selected: {{start}} – {{end}}", { start: startTime, end: getEndTime(startTime) })}
                            <span className="text-muted-foreground ml-2 text-xs">{t("app.userDashboard.durationShort", "· 2 hrs 30 mins")}</span>
                          </p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 2 – Suite */}
                  {step === 2 && (
                    <div className="grid gap-4 sm:grid-cols-2">
                      {suites.map((s) => {
                        const active = selectedSuiteId === Number(s.id);
                        return (
                          <button key={s.id} type="button" onClick={() => { setSelectedSuiteId(Number(s.id)); setPersons(s.minCapacity); }}
                            className={`flex flex-col overflow-hidden rounded-2xl border transition-all text-left ${
                              active ? "border-gold bg-gold/10 shadow-[0_20px_50px_rgba(255,190,90,0.1)]"
                              : "border-white/10 bg-white/5 hover:border-gold/20"
                            }`}>
                            {s.images.length > 0 ? (
                              <div className="h-44 overflow-hidden">
                                <img src={s.images[0]} alt={s.name} className="h-full w-full object-cover transition-transform duration-500 hover:scale-105" />
                              </div>
                            ) : (
                              <div className="h-44 bg-white/[0.03] flex items-center justify-center border-b border-white/5">
                                <BedDouble className="h-10 w-10 text-gold/20" />
                              </div>
                            )}
                            <div className="p-4 space-y-2">
                              <div className="flex items-start justify-between gap-2">
                                <div>
                                  <h4 className="font-display text-base text-foreground">{s.name}</h4>
                                  <p className="text-xs text-muted-foreground">{s.occasions}</p>
                                </div>
                                <p className="font-semibold text-gold text-sm shrink-0">{s.price}</p>
                              </div>
                              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                                <Users className="h-3.5 w-3.5 text-gold/70" /> {s.minCapacity}–{s.capacity} {t("app.userDashboard.guests", "guests")}
                              </div>
                              {s.amenities.length > 0 && (
                                <div className="flex flex-wrap gap-1.5">
                                  {s.amenities.slice(0, 3).map((a) => (
                                    <span key={a} className="rounded-full border border-white/10 bg-white/5 px-2.5 py-0.5 text-[10px] text-muted-foreground">{a}</span>
                                  ))}
                                </div>
                              )}
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Step 3 */}
                  {step === 3 && (
                    <div className="space-y-5">
                      {suite && (
                        <div className="flex items-center gap-3 px-4 py-3 rounded-2xl border border-gold/25 bg-gold/8">
                          <BedDouble className="h-4 w-4 text-gold shrink-0" />
                          <p className="text-sm text-foreground">
                            <span className="text-gold font-semibold">{suite.name}</span>
                            <span className="text-muted-foreground ml-2 text-xs">· {suiteMinCap}–{suiteMaxCap} {t("app.userDashboard.guests", "guests")} · {suite.price} {t("app.userDashboard.priceBase", "base")}</span>
                          </p>
                        </div>
                      )}
                      <div className="glass-card rounded-2xl border border-white/10 p-4">
                        <div className="flex items-center justify-between gap-4">
                          <div>
                            <h4 className="font-display text-base text-foreground">{t("app.userDashboard.numberOfPersons", "Number of Persons")}</h4>
                            <p className="text-xs text-muted-foreground mt-0.5">
                              {suite
                                ? rateExtra > 0
                                  ? t("app.userDashboard.personsLimitDesc", "Min {{min}} · Max {{max}} · ₹{{rate}}/extra person above min", { min: suiteMinCap, max: suiteMaxCap, rate: rateExtra })
                                  : t("app.userDashboard.personsLimitDescNoExtra", "Min {{min}} · Max {{max}}", { min: suiteMinCap, max: suiteMaxCap })
                                : t("app.userDashboard.selectSuiteFirst", "Select a suite first")}
                            </p>
                          </div>
                          <p className="font-semibold text-gold shrink-0">₹{personsTotal.toLocaleString()}</p>
                        </div>
                        <div className="mt-3 flex items-center gap-3">
                          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-1.5">
                            <button type="button" onClick={() => setPersons((p) => Math.max(suiteMinCap, p - 1))} className="h-7 w-7 rounded-full border border-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition">
                              <Minus className="h-3.5 w-3.5" />
                            </button>
                            <span className="min-w-[28px] text-center font-semibold text-foreground text-sm">{persons}</span>
                            <button type="button" onClick={() => setPersons((p) => Math.min(suiteMaxCap, p + 1))} className="h-7 w-7 rounded-full border border-white/10 text-muted-foreground hover:text-foreground flex items-center justify-center transition">
                              <Plus className="h-3.5 w-3.5" />
                            </button>
                          </div>
                          <span className="text-xs text-muted-foreground">{t("app.userDashboard.guestsLimitText", "{{count}} / {{max}} guests", { count: persons, max: suiteMaxCap })}</span>
                        </div>
                      </div>
                      <div className="space-y-3">
                        {localizedAddons.map((addon) => (
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
                          <MessageSquare className="h-4 w-4 text-gold" /> {t("app.userDashboard.specialRequests", "Special Requests")}
                        </div>
                        <textarea value={specialRequests} onChange={(e) => setSpecialRequests(e.target.value)} rows={4}
                          placeholder={t("app.userDashboard.specialRequestsPlaceholder", "Add any special instructions...")}
                          className="luxury-input w-full rounded-2xl px-4 py-3 text-sm bg-black/40 resize-none" />
                      </div>
                    </div>
                  )}

                  {/* Step 4 */}
                  {step === 4 && (
                    <div className="space-y-4">
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="glass-card rounded-2xl border border-white/10 p-4">
                          <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("app.userDashboard.yourCelebration", "Your Celebration")}</h4>
                          <p className="mt-3 text-base text-foreground font-semibold">{localizedOccasions.find((o) => o.id === selectedOccasion)?.label ?? t("app.userDashboard.noOccasion", "No occasion")}</p>
                          <p className="text-xs text-muted-foreground mt-1">{bookingDate ? new Date(bookingDate).toLocaleDateString() : t("app.userDashboard.noDate", "No date")}</p>
                          <p className="text-xs text-muted-foreground">{startTime ? `${startTime} – ${getEndTime(startTime)}` : t("app.userDashboard.noTime", "No time")}</p>
                        </div>
                        <div className="glass-card rounded-2xl border border-white/10 p-4">
                          <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground">{t("app.userDashboard.suite", "Suite")}</h4>
                          {suite ? (
                            <div className="mt-3 space-y-1">
                              <p className="text-base text-foreground font-semibold">{suite.name}</p>
                              <p className="text-xs text-muted-foreground">{t("app.userDashboard.capacityGuests", "Capacity: {{min}}–{{max}} guests", { min: suiteMinCap, max: suiteMaxCap })}</p>
                              <p className="text-xs text-gold">{suite.price}</p>
                            </div>
                          ) : <p className="text-xs text-muted-foreground mt-3">{t("app.userDashboard.noSuiteSelected", "No suite selected.")}</p>}
                        </div>
                      </div>
                      <div className="glass-card rounded-2xl border border-white/10 p-4">
                        <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-3">{t("app.userDashboard.addons", "Add-ons")}</h4>
                        <div className="flex justify-between text-sm py-1">
                          <span className="text-muted-foreground">
                            {extraPersons > 0
                              ? t("app.userDashboard.personsExtraRate", "{{count}} persons ({{extra}} extra × ₹{{rate}})", { count: persons, extra: extraPersons, rate: rateExtra })
                              : t("app.userDashboard.guestsCount", "{{count}} guests", { count: persons })}
                          </span>
                          <span className="text-gold">₹{personsTotal.toLocaleString()}</span>
                        </div>
                        {localizedAddons.filter((a) => (addonQty[a.id] ?? 0) > 0).map((a) => (
                          <div key={a.id} className="flex justify-between text-sm py-1">
                            <span className="text-muted-foreground">{a.name} × {addonQty[a.id]}</span>
                            <span className="text-gold">₹{(a.price * addonQty[a.id]).toLocaleString()}</span>
                          </div>
                        ))}
                      </div>
                      {specialRequests && (
                        <div className="glass-card rounded-2xl border border-white/10 p-4">
                          <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-2">{t("app.userDashboard.specialRequests", "Special Requests")}</h4>
                          <p className="text-xs text-muted-foreground">{specialRequests}</p>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Step 5 */}
                  {step === 5 && (
                    <div className="space-y-4">
                      <div className="glass-card rounded-2xl border border-white/10 p-4">
                        <h4 className="text-xs uppercase tracking-[0.25em] text-muted-foreground mb-4">{t("app.userDashboard.paymentOptions", "Payment Options")}</h4>
                        <div className="space-y-3">
                          {[
                            { id: "pay_now" as const,   label: t("app.userDashboard.payNow", "Pay Now"),        description: t("app.userDashboard.payNowDesc", "Pay the full amount ₹{{total}} and confirm instantly.", { total: grandTotal.toLocaleString() }) },
                            { id: "pay_at_venue" as const, label: t("app.userDashboard.payAtVenue", "Pay at Venue"), description: t("app.userDashboard.payAtVenueDesc", "Pay 20% advance ₹{{advance}} now. Balance ₹{{balance}} at venue.", { advance: advanceAmount.toLocaleString(), balance: (grandTotal - advanceAmount).toLocaleString() }) },
                          ].map((opt) => (
                            <button key={opt.id} type="button" onClick={() => setPaymentMode(opt.id)}
                              className={`w-full rounded-2xl border p-4 text-left transition ${
                                paymentMode === opt.id ? "border-gold bg-gold/10" : "border-white/10 bg-black/40 hover:border-gold/20"
                              }`}>
                              <div className="flex items-center justify-between gap-3">
                                <div>
                                  <p className={`font-display text-base ${paymentMode === opt.id ? "text-gold" : "text-foreground"}`}>{opt.label}</p>
                                  <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">{opt.description}</p>
                                </div>
                                <div className={`h-5 w-5 rounded-full border-2 shrink-0 flex items-center justify-center ${paymentMode === opt.id ? "border-gold bg-gold/20" : "border-white/20"}`}>
                                  {paymentMode === opt.id && <div className="h-2.5 w-2.5 rounded-full bg-gold" />}
                                </div>
                              </div>
                            </button>
                          ))}
                        </div>
                      </div>

                      {/* Payable summary */}
                      <div className="rounded-2xl border border-gold/25 bg-gradient-to-r from-gold/15 to-gold/5 p-5">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-xs text-muted-foreground uppercase tracking-[0.25em]">
                              {paymentMode === "pay_now" ? t("app.userDashboard.amountToPayNow", "Amount to Pay Now") : t("app.userDashboard.advanceToPayNow", "Advance to Pay Now (20%)")}
                            </p>
                            <p className="font-display text-3xl text-gold mt-1">₹{payableNow.toLocaleString()}</p>
                            {paymentMode === "pay_at_venue" && (
                              <p className="text-xs text-muted-foreground mt-1">{t("app.userDashboard.balancePayableAtVenue", "Balance ₹{{amount}} payable at venue", { amount: (grandTotal - advanceAmount).toLocaleString() })}</p>
                            )}
                          </div>
                          <div className="flex flex-col items-end gap-1">
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <CreditCard className="h-3.5 w-3.5 text-gold" /> {t("app.userDashboard.cardsUpiNetBanking", "Cards / UPI / Net Banking")}
                            </div>
                            <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                              <Building className="h-3.5 w-3.5 text-gold" /> {t("app.userDashboard.securedByRazorpay", "Secured by Razorpay")}
                            </div>
                          </div>
                        </div>
                      </div>

                      {payError && (
                        <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 px-4 py-3 text-sm text-rose-400">
                          {payError}
                        </div>
                      )}

                      {/* Proceed to Pay button */}
                      <button type="button" onClick={handleProceedToPay} disabled={processing}
                        className="w-full gold-btn rounded-2xl py-4 text-base font-semibold flex items-center justify-center gap-3 disabled:opacity-60">
                        {processing ? (
                          <>
                            <div className="h-5 w-5 rounded-full border-2 border-current border-t-transparent animate-spin" />
                            {t("app.userDashboard.processing", "Processing...")}
                          </>
                        ) : (
                          <>
                            <CreditCard className="h-5 w-5" />
                            {t("app.userDashboard.proceedToPay", "Proceed to Pay ₹{{amount}}", { amount: payableNow.toLocaleString() })}
                          </>
                        )}
                      </button>

                      <p className="text-center text-xs text-muted-foreground">
                        {t("app.userDashboard.razorpayEncryption", "Powered by Razorpay · 256-bit SSL encryption")}
                      </p>
                    </div>
                  )}

                  {showValidation && !isStepValid && (
                    <p className="text-sm text-rose-400">{t("app.userDashboard.validationError", "Please complete the required selection before continuing.")}</p>
                  )}

                  {/* Nav buttons — hide on payment step (has its own CTA) */}
                  {step !== 5 && (
                    <div className="flex gap-3 pt-1">
                      <button type="button" onClick={handleBack} disabled={step === 0}
                        className="flex-1 rounded-2xl border border-white/10 px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-40">
                        <ChevronLeft className="inline-block h-4 w-4 mr-1" /> {t("app.userDashboard.back", "Back")}
                      </button>
                      <button type="button" onClick={handleNext}
                        className="flex-1 gold-btn rounded-2xl px-5 py-3 text-sm font-semibold flex items-center justify-center gap-2">
                        {t("app.userDashboard.continue", "Continue")} <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  )}
                  {step === 5 && (
                    <button type="button" onClick={handleBack}
                      className="w-full rounded-2xl border border-white/10 px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition">
                      <ChevronLeft className="inline-block h-4 w-4 mr-1" /> {t("app.userDashboard.backToSummary", "Back to Summary")}
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
