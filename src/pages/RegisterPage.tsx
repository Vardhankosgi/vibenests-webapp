import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye, EyeOff, User, Mail, Phone, Lock, MapPin,
  ShieldCheck, Star, Headphones, ChevronDown, Check,
  AlertCircle, ArrowLeft,
} from "lucide-react";
import { BrandMark } from "@/components/auth/BrandMark";
import { GoogleIcon } from "@/components/auth/GoogleIcon";
import loginbg from "@/assets/loginbg.png";

/* ── Cities ─────────────────────────────────────────── */
const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Goa",
  "Udaipur", "Surat", "Chandigarh", "Kochi", "Indore",
];

/* ── Trust badges ───────────────────────────────────── */
const TRUST_BADGES = [
  { icon: ShieldCheck, label: "Secure & Private", href: "/privacy-policy" },
  { icon: Star,        label: "Exclusive Access", href: "/privacy-policy" },
  { icon: Headphones,  label: "24/7 Support",     href: "/contact"        },
];

/* ── Validation helpers ─────────────────────────────── */
function validateEmail(v: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : "Enter a valid email address";
}
function validatePhone(v: string) {
  return /^[6-9]\d{9}$/.test(v.replace(/\s/g, "")) ? "" : "Enter a valid 10-digit Indian mobile number";
}
function validatePassword(v: string) {
  if (v.length < 8) return "Password must be at least 8 characters";
  if (!/[A-Z]/.test(v)) return "Include at least one uppercase letter";
  if (!/\d/.test(v)) return "Include at least one number";
  return "";
}

/* ── Password strength ──────────────────────────────── */
function passwordStrength(v: string): { score: number; label: string; color: string } {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  if (score <= 1) return { score, label: "Weak",   color: "bg-rose-500"   };
  if (score === 2) return { score, label: "Fair",   color: "bg-amber-400"  };
  if (score === 3) return { score, label: "Good",   color: "bg-sky-400"    };
  return               { score, label: "Strong", color: "bg-emerald-400" };
}

/* ── Field wrapper ──────────────────────────────────── */
function Field({
  label, icon: Icon, error, children,
}: {
  label: string;
  icon: React.ElementType;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5">
        <Icon className="h-3 w-3 text-gold/70" />
        {label}
      </label>
      {children}
      <AnimatePresence>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
            className="flex items-center gap-1 text-[11px] text-rose-400"
          >
            <AlertCircle className="h-3 w-3 shrink-0" />{error}
          </motion.p>
        )}
      </AnimatePresence>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────── */
export default function RegisterPage() {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "", city: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showPass, setShowPass]   = useState(false);
  const [showConf, setShowConf]   = useState(false);
  const [cityOpen, setCityOpen]   = useState(false);
  const [agreed, setAgreed]       = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [success, setSuccess]     = useState(false);

  const strength = passwordStrength(form.password);

  function set(key: string, val: string) {
    setForm((p) => ({ ...p, [key]: val }));
    if (submitted) validate({ ...form, [key]: val });
  }

  function validate(f = form) {
    const e: Record<string, string> = {};
    if (!f.name.trim())       e.name     = "Full name is required";
    const em = validateEmail(f.email);   if (em) e.email = em;
    const ph = validatePhone(f.phone);   if (ph) e.phone = ph;
    const pw = validatePassword(f.password); if (pw) e.password = pw;
    if (f.confirm !== f.password)        e.confirm  = "Passwords do not match";
    if (!f.city)                         e.city     = "Please select your city";
    if (!agreed)                         e.terms    = "You must accept the terms to continue";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    if (validate()) setSuccess(true);
  }

  return (
    <main
      className="min-h-screen grid lg:grid-cols-2 relative"
      style={{ backgroundImage: `url(${loginbg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* ── Left hero panel ── */}
      <div className="hidden lg:flex flex-col justify-between relative z-10 p-12">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <BrandMark />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8, delay: 0.15 }}
          className="space-y-6"
        >
          <h1 className="font-display text-5xl xl:text-6xl font-medium text-foreground leading-[1.1]">
            Begin Your<br />
            <span className="text-gradient-gold italic">Luxury Journey</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            Join thousands of guests who celebrate life's most precious moments in our handpicked private suites.
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              "Exclusive access to premium suites",
              "Personalised celebration packages",
              "Priority 24/7 concierge support",
              "Members-only offers & loyalty rewards",
            ].map((item, i) => (
              <motion.div
                key={item}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span className="h-5 w-5 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-gold" />
                </span>
                <span className="text-sm text-foreground/80">{item}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex gap-3"
        >
          {TRUST_BADGES.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-2xl px-4 py-3 flex items-center gap-2.5 flex-1 hover:border-gold/40 hover:bg-gold/5 transition-colors"
            >
              <div className="h-8 w-8 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                <Icon className="h-4 w-4 text-gold" />
              </div>
              <span className="text-xs font-medium text-foreground/80 leading-tight">{label}</span>
            </a>
          ))}
        </motion.div>
      </div>

      {/* ── Right form panel ── */}
      <div className="flex items-center justify-center px-4 py-10 relative z-10">
        <AnimatePresence mode="wait">
          {success ? (
            /* Success state */
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-3xl p-10 max-w-md w-full text-center space-y-5"
            >
              <div className="h-16 w-16 rounded-full bg-emerald-400/15 border border-emerald-400/30 flex items-center justify-center mx-auto">
                <Check className="h-8 w-8 text-emerald-400" />
              </div>
              <h2 className="font-display text-3xl text-foreground">Account Created!</h2>
              <p className="text-sm text-muted-foreground">
                Welcome to VibeNests, <span className="text-gold font-medium">{form.name}</span>. Your luxury journey begins now.
              </p>
              <button
                onClick={() => navigate("/login")}
                className="gold-btn w-full rounded-xl py-3 text-sm font-semibold"
              >
                Continue to Login
              </button>
            </motion.div>
          ) : (
            /* Registration form */
            <motion.div
              key="form"
              initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.1 }}
              className="glass-card relative w-full max-w-md rounded-3xl p-7 sm:p-9"
            >
              {/* Glow blobs */}
              <div className="pointer-events-none absolute -top-20 -right-20 h-48 w-48 rounded-full bg-gold/15 blur-3xl" />
              <div className="pointer-events-none absolute -bottom-20 -left-20 h-48 w-48 rounded-full bg-gold/10 blur-3xl" />

              <div className="relative space-y-6">
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground">
                      Create <span className="text-gradient-gold italic">Account</span>
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">Join VibeNests and start your celebration journey</p>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> Back
                  </button>
                </div>

                {/* Social login */}
                <button
                  type="button"
                  className="w-full flex items-center justify-center gap-3 rounded-xl border border-white/12 bg-white/[0.03] py-2.5 text-sm font-medium text-muted-foreground hover:bg-white/[0.07] hover:border-gold/30 hover:text-foreground transition-all"
                >
                  <GoogleIcon className="h-4 w-4" />
                  Continue with Google
                </button>

                {/* Divider */}
                <div className="flex items-center gap-3 text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent to-gold/30" />
                  <span>or register with email</span>
                  <div className="h-px flex-1 bg-gradient-to-l from-transparent to-gold/30" />
                </div>

                {/* Form fields */}
                <form onSubmit={handleSubmit} noValidate className="space-y-4">
                  {/* Full Name */}
                  <Field label="Full Name" icon={User} error={errors.name}>
                    <input
                      type="text"
                      placeholder="Adithya Reddy"
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={`luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.name ? "border-rose-500/50" : ""}`}
                    />
                  </Field>

                  {/* Email */}
                  <Field label="Email Address" icon={Mail} error={errors.email}>
                    <input
                      type="email"
                      placeholder="you@example.com"
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={`luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.email ? "border-rose-500/50" : ""}`}
                    />
                  </Field>

                  {/* Phone */}
                  <Field label="Phone Number" icon={Phone} error={errors.phone}>
                    <div className="flex gap-2">
                      <span className="luxury-input rounded-xl px-3 py-2.5 text-sm text-muted-foreground shrink-0 flex items-center">🇮🇳 +91</span>
                      <input
                        type="tel"
                        placeholder="98765 43210"
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className={`luxury-input flex-1 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.phone ? "border-rose-500/50" : ""}`}
                      />
                    </div>
                  </Field>

                  {/* Password */}
                  <Field label="Password" icon={Lock} error={errors.password}>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder="Min 8 chars, uppercase & number"
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        className={`luxury-input w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.password ? "border-rose-500/50" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPass((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                      >
                        {showPass ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                    {/* Strength bar */}
                    {form.password && (
                      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-1 pt-1">
                        <div className="flex gap-1">
                          {[1, 2, 3, 4].map((n) => (
                            <div
                              key={n}
                              className={`h-1 flex-1 rounded-full transition-all duration-300 ${n <= strength.score ? strength.color : "bg-white/10"}`}
                            />
                          ))}
                        </div>
                        <p className={`text-[10px] font-medium ${strength.score <= 1 ? "text-rose-400" : strength.score === 2 ? "text-amber-400" : strength.score === 3 ? "text-sky-400" : "text-emerald-400"}`}>
                          {strength.label} password
                        </p>
                      </motion.div>
                    )}
                  </Field>

                  {/* Confirm Password */}
                  <Field label="Confirm Password" icon={Lock} error={errors.confirm}>
                    <div className="relative">
                      <input
                        type={showConf ? "text" : "password"}
                        placeholder="Re-enter your password"
                        value={form.confirm}
                        onChange={(e) => set("confirm", e.target.value)}
                        className={`luxury-input w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.confirm ? "border-rose-500/50" : ""}`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowConf((v) => !v)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors"
                      >
                        {showConf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                      </button>
                    </div>
                  </Field>

                  {/* City Dropdown */}
                  <Field label="City" icon={MapPin} error={errors.city}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCityOpen((o) => !o)}
                        className={`luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between ${errors.city ? "border-rose-500/50" : ""} ${form.city ? "text-foreground" : "text-muted-foreground/50"}`}
                      >
                        {form.city || "Select your city"}
                        <ChevronDown className={`h-4 w-4 text-gold/60 transition-transform duration-200 ${cityOpen ? "rotate-180" : ""}`} />
                      </button>
                      <AnimatePresence>
                        {cityOpen && (
                          <>
                            <div className="fixed inset-0 z-10" onClick={() => setCityOpen(false)} />
                            <motion.ul
                              initial={{ opacity: 0, y: -6, scale: 0.98 }}
                              animate={{ opacity: 1, y: 0, scale: 1 }}
                              exit={{ opacity: 0, y: -6, scale: 0.98 }}
                              transition={{ duration: 0.15 }}
                              className="absolute z-20 mt-1.5 w-full glass-card rounded-xl border border-gold/20 py-1 max-h-44 overflow-y-auto scrollbar-none shadow-xl"
                            >
                              {CITIES.map((city) => (
                                <li key={city}>
                                  <button
                                    type="button"
                                    onClick={() => { set("city", city); setCityOpen(false); }}
                                    className={`w-full text-left px-4 py-2 text-sm transition-colors hover:bg-gold/10 hover:text-gold ${form.city === city ? "text-gold bg-gold/8" : "text-muted-foreground"}`}
                                  >
                                    {city}
                                  </button>
                                </li>
                              ))}
                            </motion.ul>
                          </>
                        )}
                      </AnimatePresence>
                    </div>
                  </Field>

                  {/* Terms */}
                  <div className="space-y-1">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        type="button"
                        onClick={() => { setAgreed((v) => !v); if (submitted) setErrors((p) => ({ ...p, terms: agreed ? "You must accept the terms to continue" : "" })); }}
                        className={`mt-0.5 h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-all ${agreed ? "bg-gold border-gold" : "border-white/25 bg-white/5 group-hover:border-gold/50"}`}
                      >
                        {agreed && <Check className="h-2.5 w-2.5 text-[oklch(0.12_0.02_260)]" />}
                      </button>
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        I agree to the{" "}
                        <a href="/terms-of-use" target="_blank" className="text-gold hover:underline underline-offset-2">Terms of Service</a>
                        {" "}and{" "}
                        <a href="/privacy-policy" target="_blank" className="text-gold hover:underline underline-offset-2">Privacy Policy</a>
                      </span>
                    </label>
                    <AnimatePresence>
                      {errors.terms && (
                        <motion.p
                          initial={{ opacity: 0, y: -4 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -4 }}
                          className="flex items-center gap-1 text-[11px] text-rose-400 pl-7"
                        >
                          <AlertCircle className="h-3 w-3 shrink-0" />{errors.terms}
                        </motion.p>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    className="gold-btn w-full rounded-xl py-3 text-sm font-semibold tracking-wide mt-2"
                  >
                    Create My Account
                  </button>
                </form>

                {/* Login link */}
                <p className="text-center text-sm text-muted-foreground">
                  Already have an account?{" "}
                  <button onClick={() => navigate("/login")} className="text-gold font-medium hover:underline underline-offset-4">
                    Sign In
                  </button>
                </p>

                {/* Mobile trust badges */}
                <div className="flex gap-2 lg:hidden pt-1">
                  {TRUST_BADGES.map(({ icon: Icon, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass rounded-xl px-3 py-2 flex items-center gap-1.5 flex-1 hover:border-gold/40 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 text-gold shrink-0" />
                      <span className="text-[10px] text-muted-foreground leading-tight">{label}</span>
                    </a>
                  ))}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </main>
  );
}
