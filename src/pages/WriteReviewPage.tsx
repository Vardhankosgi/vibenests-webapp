import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Star, ChevronRight, CheckCircle2, CalendarDays, Clock,
  Users, MapPin, MessageSquare, Sparkles, ThumbsUp,
  LayoutDashboard, BedDouble, Wallet, Tag, UserCircle,
  HelpCircle, LogOut, Package, History, Bell,
} from "lucide-react";

/* ─── Types ──────────────────────────────────────────── */
type CategoryKey = "ambience" | "cleanliness" | "service" | "decoration" | "value";

const CATEGORIES: { key: CategoryKey; label: string }[] = [
  { key: "ambience",    label: "Ambience"        },
  { key: "cleanliness", label: "Cleanliness"     },
  { key: "service",     label: "Service"         },
  { key: "decoration",  label: "Decoration"      },
  { key: "value",       label: "Value for Money" },
];

const OVERALL_LABELS: Record<number, string> = {
  1: "Poor", 2: "Average", 3: "Good", 4: "Very Good", 5: "Excellent",
};
const OVERALL_COLORS: Record<number, string> = {
  1: "text-rose-400", 2: "text-amber-400", 3: "text-yellow-400",
  4: "text-emerald-400", 5: "text-gold",
};

const NAV_ITEMS = [
  { id: "dashboard",    label: "Dashboard",                    icon: LayoutDashboard },
  { id: "suites",       label: "Browse Suites",                icon: BedDouble },
  { id: "my-bookings",  label: "My Bookings",                  icon: CalendarDays },
  { id: "upcoming",     label: "Upcoming Bookings",            icon: Clock },
  { id: "past",         label: "Past Bookings",                icon: History },
  { id: "wallet",       label: "Wallet & Payments",            icon: Wallet },
  { id: "packages",     label: "Celebration Packages",         icon: Package },
  { id: "offers",       label: "Special Offers & Referrals",   icon: Tag },
  { id: "profile",      label: "Profile Settings",             icon: UserCircle },
  { id: "help",         label: "Help & Support",               icon: HelpCircle },
  { id: "write-review", label: "Write a Review",               icon: Star },
];

/* ─── Star Rating ────────────────────────────────────── */
function StarRating({ value, onChange, size = "md" }: {
  value: number; onChange: (v: number) => void; size?: "sm" | "md" | "lg";
}) {
  const [hovered, setHovered] = useState(0);
  const sz = size === "lg" ? "h-8 w-8" : size === "sm" ? "h-4 w-4" : "h-6 w-6";
  const active = hovered || value;
  return (
    <div className="flex items-center gap-1">
      {[1, 2, 3, 4, 5].map((star) => (
        <button key={star} type="button" onClick={() => onChange(star)}
          onMouseEnter={() => setHovered(star)} onMouseLeave={() => setHovered(0)}
          className="transition-transform hover:scale-110 active:scale-95">
          <Star className={`${sz} transition-colors duration-150 ${star <= active ? "fill-gold text-gold" : "fill-transparent text-white/20"}`} />
        </button>
      ))}
    </div>
  );
}

/* ─── Main Page ──────────────────────────────────────── */
export default function WriteReviewPage() {
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [ratings, setRatings] = useState<Record<CategoryKey, number>>({
    ambience: 0, cleanliness: 0, service: 0, decoration: 0, value: 0,
  });
  const [overall, setOverall]     = useState(0);
  const [review, setReview]       = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [showError, setShowError] = useState(false);
  const MAX_CHARS = 1000;

  function handleSubmit() {
    if (!overall) { setShowError(true); return; }
    setShowError(false);
    setSubmitted(true);
  }

  function handleNav(id: string) {
    setSidebarOpen(false);
    if (id === "write-review") return;
    navigate("/user/dashboard");
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--background)]">

      {/* ── Top bar ── */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 glass backdrop-blur-xl">
        <div className="flex items-center gap-4">
          <button onClick={() => setSidebarOpen((o) => !o)}
            className="flex lg:hidden flex-col justify-center items-center gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors group"
            aria-label="Toggle menu">
            <span className={`block h-0.5 bg-muted-foreground group-hover:bg-gold transition-all duration-300 ${sidebarOpen ? "w-5 translate-y-[7px] rotate-45" : "w-5"}`} />
            <span className={`block h-0.5 bg-muted-foreground group-hover:bg-gold transition-all duration-300 ${sidebarOpen ? "w-0 opacity-0" : "w-5"}`} />
            <span className={`block h-0.5 bg-muted-foreground group-hover:bg-gold transition-all duration-300 ${sidebarOpen ? "w-5 -translate-y-[7px] -rotate-45" : "w-5"}`} />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="VibeNests" className="h-full w-full object-contain" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold tracking-[0.15em] text-gradient-gold">VIBENESTS</p>
              <p className="text-[9px] tracking-[0.25em] text-muted-foreground uppercase">Private Luxury Suites</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <button className="relative h-9 w-9 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
          </button>
          <div className="h-9 w-9 rounded-xl bg-gradient-gold flex items-center justify-center font-bold text-[oklch(0.12_0.02_260)] text-sm">A</div>
        </div>
      </header>

      {/* ── Body ── */}
      <div className="flex flex-1 relative min-h-0">

        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        {/* ── Sidebar ── */}
        <aside className={`absolute lg:relative top-0 left-0 h-full w-64 z-40 flex flex-col shrink-0 glass-card border-r border-white/5 rounded-none transition-transform duration-300 ease-in-out ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}`}>
          <div className="flex items-center justify-between px-4 py-4 border-b border-white/5">
            <div>
              <p className="text-xs text-muted-foreground">Welcome back</p>
              <p className="text-sm font-medium text-foreground font-display">Adithya Reddy</p>
            </div>
            <button onClick={() => setSidebarOpen(false)}
              className="flex flex-col justify-center items-center gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors group">
              <span className="block w-5 h-0.5 bg-muted-foreground group-hover:bg-gold transition-colors" />
              <span className="block w-5 h-0.5 bg-muted-foreground group-hover:bg-gold transition-colors" />
              <span className="block w-5 h-0.5 bg-muted-foreground group-hover:bg-gold transition-colors" />
            </button>
          </div>

          <div className="px-4 py-4 border-b border-white/5">
            <div className="flex items-center gap-3 p-3 rounded-xl glass-gold">
              <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center font-bold text-[oklch(0.12_0.02_260)] text-sm shrink-0">A</div>
              <div className="min-w-0">
                <p className="text-sm font-medium text-foreground truncate">Adithya Reddy</p>
                <p className="text-[11px] text-gold">Gold Member</p>
              </div>
            </div>
          </div>

          <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto scrollbar-none">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = id === "write-review";
              return (
                <button key={id} onClick={() => handleNav(id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all ${active ? "bg-gold/15 border border-gold/25 text-gold font-medium" : "text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-gold" : ""}`} />
                  {label}
                </button>
              );
            })}
          </nav>

          <div className="px-3 pb-6 pt-2 border-t border-white/5">
            <button onClick={() => navigate("/login")}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all">
              <LogOut className="h-4 w-4 shrink-0" />
              Logout
            </button>
          </div>
        </aside>

        {/* ── Main content ── */}
        <main className="flex-1 overflow-y-auto min-h-0">
          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
              className="flex flex-col items-center justify-center min-h-full text-center gap-6 px-4 py-16">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }}
                transition={{ type: "spring", damping: 14, stiffness: 200, delay: 0.1 }}
                className="h-20 w-20 rounded-full bg-gold/15 border-2 border-gold/40 flex items-center justify-center">
                <ThumbsUp className="h-9 w-9 text-gold" />
              </motion.div>
              <div className="space-y-2">
                <h2 className="font-display text-3xl text-foreground">Thank You!</h2>
                <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
                  Your review has been submitted. It helps us craft better experiences for every guest.
                </p>
              </div>
              <button onClick={() => navigate("/user/dashboard")}
                className="gold-btn rounded-xl px-6 py-2.5 text-sm font-semibold flex items-center gap-2">
                Back to Dashboard <ChevronRight className="h-4 w-4" />
              </button>
            </motion.div>
          ) : (
            <div className="max-w-5xl mx-auto px-6 py-8 space-y-6">

              {/* Breadcrumb */}
              <motion.nav initial={{ opacity: 0, y: -6 }} animate={{ opacity: 1, y: 0 }}
                className="flex items-center gap-2 text-xs text-muted-foreground">
                <button onClick={() => navigate("/user/dashboard")} className="hover:text-gold transition-colors">Home</button>
                <ChevronRight className="h-3 w-3" />
                <button onClick={() => navigate("/user/dashboard")} className="hover:text-gold transition-colors">My Bookings</button>
                <ChevronRight className="h-3 w-3" />
                <span className="text-gold font-medium">Write a Review</span>
              </motion.nav>

              {/* Header Banner */}
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
                className="relative rounded-3xl overflow-hidden min-h-[160px] flex items-center"
                style={{ background: "linear-gradient(135deg, oklch(0.12 0.04 30), oklch(0.10 0.03 265))" }}>
                <div className="relative z-10 p-8 space-y-2">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase border border-gold/40 text-gold bg-gold/10">
                    Share Your Experience
                  </span>
                  <h1 className="font-display text-3xl font-semibold text-foreground mt-2">
                    Write a <span className="text-gradient-gold italic">Review</span>
                  </h1>
                  <p className="text-sm text-muted-foreground max-w-md">
                    Your honest feedback helps us deliver exceptional luxury experiences for every guest.
                  </p>
                </div>
                <div className="hidden md:flex absolute right-8 top-1/2 -translate-y-1/2 items-center justify-center h-24 w-24 rounded-full bg-gold/10 border border-gold/20">
                  <Star className="h-10 w-10 text-gold/60 fill-gold/20" />
                </div>
                {[
                  { sz: "h-4 w-4", pos: "top-5 right-44", d: 0.2 },
                  { sz: "h-3 w-3", pos: "bottom-5 right-36", d: 0.35 },
                  { sz: "h-5 w-5", pos: "top-6 right-64", d: 0.5 },
                ].map((s, i) => (
                  <motion.div key={i} initial={{ opacity: 0, scale: 0 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: s.d, type: "spring" }}
                    className={`absolute ${s.pos} hidden md:block`}>
                    <Star className={`${s.sz} fill-gold/30 text-gold/30`} />
                  </motion.div>
                ))}
              </motion.div>

              {/* Two-column layout */}
              <div className="grid lg:grid-cols-[1fr_300px] gap-6 items-start">
                <div className="space-y-5">

                  {/* Booking Details */}
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                    className="glass-card rounded-2xl overflow-hidden">
                    <div className="flex flex-col sm:flex-row">
                      <div className="relative sm:w-40 h-36 sm:h-auto shrink-0">
                        <img src="https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80"
                          alt="Suite" className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent to-black/30 sm:bg-gradient-to-b" />
                      </div>
                      <div className="flex-1 p-5 space-y-3">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-[10px] font-mono text-muted-foreground tracking-widest">VN-2841</p>
                            <h3 className="font-display text-lg text-foreground mt-0.5">Royal Penthouse Suite</h3>
                            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
                              <MapPin className="h-3 w-3 text-gold/60" /> Mumbai, India
                            </p>
                          </div>
                          <span className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border bg-sky-400/10 border-sky-400/25 text-sky-400 text-[11px] font-semibold shrink-0">
                            <CheckCircle2 className="h-3 w-3" /> Completed
                          </span>
                        </div>
                        <div className="grid grid-cols-3 gap-2">
                          {[
                            { label: "Date", icon: CalendarDays, value: "Jan 28, 2025" },
                            { label: "Time", icon: Clock,        value: "2:00 PM"      },
                            { label: "Guests", icon: Users,      value: "4 Guests"     },
                          ].map(({ label, icon: Icon, value }) => (
                            <div key={label} className="bg-white/[0.03] rounded-xl px-3 py-2">
                              <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</p>
                              <div className="flex items-center gap-1 mt-0.5">
                                <Icon className="h-3 w-3 text-gold/60 shrink-0" />
                                <span className="text-xs text-foreground font-medium truncate">{value}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </motion.div>

                  {/* Category Ratings */}
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
                    className="glass-card rounded-2xl p-6 space-y-4">
                    <div>
                      <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Rate Your Stay</p>
                      <h3 className="font-display text-xl text-foreground">Category Ratings</h3>
                    </div>
                    <div className="space-y-1">
                      {CATEGORIES.map(({ key, label }, i) => (
                        <motion.div key={key}
                          initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: 0.2 + i * 0.05 }}
                          className="flex items-center justify-between py-3 border-b border-white/5 last:border-0">
                          <span className="text-sm text-foreground font-medium w-36 shrink-0">{label}</span>
                          <div className="flex items-center gap-4">
                            <StarRating value={ratings[key]}
                              onChange={(v) => setRatings((prev) => ({ ...prev, [key]: v }))}
                              size="sm" />
                            <span className={`text-xs w-16 text-right transition-colors ${ratings[key] ? "text-gold" : "text-muted-foreground"}`}>
                              {ratings[key] ? OVERALL_LABELS[ratings[key]] : "—"}
                            </span>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Overall Experience */}
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}
                    className={`glass-card rounded-2xl p-6 space-y-4 ${showError && !overall ? "border-rose-500/40" : ""}`}>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-xs uppercase tracking-widest text-muted-foreground mb-0.5">Required</p>
                        <h3 className="font-display text-xl text-foreground">Overall Experience</h3>
                      </div>
                      <AnimatePresence mode="wait">
                        {overall > 0 && (
                          <motion.span key={overall}
                            initial={{ opacity: 0, scale: 0.8, y: -4 }} animate={{ opacity: 1, scale: 1, y: 0 }} exit={{ opacity: 0, scale: 0.8 }}
                            className={`px-3 py-1 rounded-full border border-white/10 bg-white/5 text-sm font-semibold ${OVERALL_COLORS[overall]}`}>
                            {OVERALL_LABELS[overall]}
                          </motion.span>
                        )}
                      </AnimatePresence>
                    </div>
                    <StarRating value={overall} onChange={(v) => { setOverall(v); setShowError(false); }} size="lg" />
                    {showError && !overall && (
                      <motion.p initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }}
                        className="text-xs text-rose-400 flex items-center gap-1.5">
                        <span className="h-1.5 w-1.5 rounded-full bg-rose-400 shrink-0" />
                        Please rate your overall experience before submitting.
                      </motion.p>
                    )}
                  </motion.div>

                  {/* Review Text */}
                  <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
                    className="glass-card rounded-2xl p-6 space-y-4">
                    <div className="flex items-center gap-2">
                      <MessageSquare className="h-4 w-4 text-gold" />
                      <h3 className="font-display text-xl text-foreground">Your Review</h3>
                    </div>
                    <textarea value={review}
                      onChange={(e) => setReview(e.target.value.slice(0, MAX_CHARS))}
                      rows={5}
                      placeholder="Share details about your experience — the ambience, service, what stood out, and anything that could be improved..."
                      className="luxury-input w-full rounded-xl px-4 py-4 text-sm text-foreground bg-black/40 resize-none leading-relaxed" />
                    <div className="flex items-center justify-between">
                      <p className="text-[11px] text-muted-foreground">Be specific and honest — your feedback matters.</p>
                      <span className={`text-[11px] font-mono ${review.length >= MAX_CHARS ? "text-rose-400" : review.length > 800 ? "text-amber-400" : "text-muted-foreground"}`}>
                        {review.length} / {MAX_CHARS}
                      </span>
                    </div>
                  </motion.div>

                  {/* Buttons */}
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
                    className="flex gap-3 pb-8">
                    <button onClick={() => navigate("/user/dashboard")}
                      className="flex-1 glass rounded-xl py-3 text-sm text-muted-foreground border border-white/10 hover:text-foreground hover:border-white/20 transition-all">
                      Cancel
                    </button>
                    <button onClick={handleSubmit}
                      className="flex-1 gold-btn rounded-xl py-3 text-sm font-semibold flex items-center justify-center gap-2">
                      <Sparkles className="h-4 w-4" /> Submit Review
                    </button>
                  </motion.div>
                </div>

                {/* Sidebar info card */}
                <motion.div initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 }}
                  className="glass-card rounded-2xl p-6 space-y-5 sticky top-6">
                  <div className="flex items-center gap-3">
                    <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                      <MessageSquare className="h-5 w-5 text-gold" />
                    </div>
                    <div>
                      <h4 className="font-display text-base text-foreground">Why Your Review Matters</h4>
                      <p className="text-[11px] text-muted-foreground">Help us serve better</p>
                    </div>
                  </div>
                  <div className="space-y-3">
                    {[
                      { icon: Star,         text: "Helps future guests choose the perfect suite" },
                      { icon: Sparkles,     text: "Motivates our team to maintain luxury standards" },
                      { icon: ThumbsUp,     text: "Your insights directly shape service improvements" },
                      { icon: CheckCircle2, text: "Verified reviews build trust in our community" },
                    ].map(({ icon: Icon, text }, i) => (
                      <motion.div key={i} initial={{ opacity: 0, x: 8 }} animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.3 + i * 0.07 }}
                        className="flex items-start gap-3">
                        <div className="h-7 w-7 rounded-lg bg-gold/8 border border-gold/15 flex items-center justify-center shrink-0 mt-0.5">
                          <Icon className="h-3.5 w-3.5 text-gold/80" />
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
                      </motion.div>
                    ))}
                  </div>
                  <div className="border-t border-white/5 pt-4">
                    <p className="text-[11px] text-muted-foreground leading-relaxed">
                      Reviews are moderated for quality. Only your first name is shown publicly.
                    </p>
                  </div>
                  {overall > 0 && (
                    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                      className="rounded-xl bg-gold/8 border border-gold/20 p-4 space-y-2">
                      <p className="text-[10px] uppercase tracking-widest text-muted-foreground">Rating Preview</p>
                      <div className="flex items-center gap-2">
                        <div className="flex gap-0.5">
                          {[1,2,3,4,5].map((s) => (
                            <Star key={s} className={`h-4 w-4 ${s <= overall ? "fill-gold text-gold" : "fill-transparent text-white/15"}`} />
                          ))}
                        </div>
                        <span className={`text-sm font-semibold ${OVERALL_COLORS[overall]}`}>{OVERALL_LABELS[overall]}</span>
                      </div>
                      <p className="text-xs text-muted-foreground line-clamp-2">{review || "No written review yet..."}</p>
                    </motion.div>
                  )}
                </motion.div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
