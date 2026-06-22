import { useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useTranslation } from "react-i18next";
import {
  Eye, EyeOff, User, Mail, Phone, Lock, MapPin,
  ShieldCheck, Star, Headphones, ChevronDown, Check,
  AlertCircle, ArrowLeft, Calendar, Heart,
} from "lucide-react";
import { BrandMark } from "@/components/auth/BrandMark";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { authApi } from "@/lib/api";
import loginbg from "@/assets/loginbg.png";

/* ── Cities ─────────────────────────────────────────── */
const CITIES = [
  "Mumbai", "Delhi", "Bangalore", "Hyderabad", "Chennai",
  "Kolkata", "Pune", "Ahmedabad", "Jaipur", "Goa",
  "Udaipur", "Surat", "Chandigarh", "Kochi", "Indore",
];

/* ── Trust badges ───────────────────────────────────── */
const TRUST_BADGES = [
  { icon: ShieldCheck, key: "securePrivate", label: "Secure & Private", href: "/privacy-policy" },
  { icon: Star,        key: "exclusiveAccess", label: "Exclusive Access", href: "/privacy-policy" },
  { icon: Headphones,  key: "support247", label: "24/7 Support",     href: "/contact"        },
];

/* ── Validation helpers ─────────────────────────────── */
function validateEmail(v: string, t: any) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? "" : t("app.validation.validEmail", "Enter a valid email address");
}
function validatePhone(v: string, t: any) {
  return /^[6-9]\d{9}$/.test(v.replace(/\s/g, "")) ? "" : t("app.validation.validPhone", "Enter a valid 10-digit Indian mobile number");
}
function validatePassword(v: string, t: any) {
  if (v.length < 8) return t("app.validation.passwordMin", "Password must be at least 8 characters");
  if (!/[A-Z]/.test(v)) return t("app.validation.passwordUpper", "Include at least one uppercase letter");
  if (!/\d/.test(v)) return t("app.validation.passwordNumber", "Include at least one number");
  return "";
}

/* ── Password strength ──────────────────────────────── */
function passwordStrength(v: string): { score: number; key: string; label: string; color: string } {
  let score = 0;
  if (v.length >= 8) score++;
  if (/[A-Z]/.test(v)) score++;
  if (/\d/.test(v)) score++;
  if (/[^A-Za-z0-9]/.test(v)) score++;
  if (score <= 1) return { score, key: "weak", label: "Weak",   color: "bg-rose-500"   };
  if (score === 2) return { score, key: "fair", label: "Fair",   color: "bg-amber-400"  };
  if (score === 3) return { score, key: "good", label: "Good",   color: "bg-sky-400"    };
  return               { score, key: "strong", label: "Strong", color: "bg-emerald-400" };
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
      <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest flex items-center gap-1.5 whitespace-nowrap">
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
  const { t } = useTranslation();

  const [searchParams] = useSearchParams();
  const refCodeFromUrl = searchParams.get("ref") || "";

  const [form, setForm] = useState({
    name: "", email: "", phone: "", password: "", confirm: "", city: "", dateOfBirth: "", marriageDate: "", referralCode: refCodeFromUrl,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [errorMsg, setErrorMsg] = useState("");
  const [loading, setLoading] = useState(false);
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
    if (!f.name.trim())       e.name     = t("app.validation.nameRequired", "Full name is required");
    const em = validateEmail(f.email, t);   if (em) e.email = em;
    const ph = validatePhone(f.phone, t);   if (ph) e.phone = ph;
    const pw = validatePassword(f.password, t); if (pw) e.password = pw;
    if (f.confirm !== f.password)        e.confirm  = t("app.validation.passwordMismatch", "Passwords do not match");
    if (!f.dateOfBirth)                  e.dateOfBirth = t("app.validation.dobRequired", "Date of birth is required");
    if (!f.city)                         e.city     = t("app.validation.cityRequired", "Please select your city");
    if (!agreed)                         e.terms    = t("app.validation.termsRequired", "You must accept the terms to continue");
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitted(true);
    setErrorMsg("");
    if (!validate()) return;

    try {
      setLoading(true);
      await authApi.register({
        fullName: form.name,
        email: form.email,
        phone: form.phone,
        password: form.password,
        dateOfBirth: form.dateOfBirth,
        marriageDate: form.marriageDate || null,
        city: form.city,
        referralCode: form.referralCode || undefined,
      });
      setSuccess(true);
    } catch (err: any) {
      setErrorMsg(err.message || "Failed to create account. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen grid lg:grid-cols-2 relative bg-scroll lg:bg-fixed"
      style={{ backgroundImage: `url(${loginbg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      {/* Dark overlay */}
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Top-right language switcher */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageSelector />
      </div>

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
            {t("app.auth.beginJourneyPrefix", "Begin Your")}<br />
            <span className="text-gradient-gold italic">{t("app.auth.beginJourneySuffix", "Luxury Journey")}</span>
          </h1>
          <p className="text-sm text-muted-foreground max-w-sm leading-relaxed">
            {t("app.auth.registerHeroDesc", "Join thousands of guests who celebrate life's most precious moments in our handpicked private suites.")}
          </p>

          {/* Feature list */}
          <div className="space-y-3 pt-2">
            {[
              { key: "featPremiumSuites", def: "Exclusive access to premium suites" },
              { key: "featPackages", def: "Personalised celebration packages" },
              { key: "featConcierge", def: "Priority 24/7 concierge support" },
              { key: "featLoyalty", def: "Members-only offers & loyalty rewards" }
            ].map((item, i) => (
              <motion.div
                key={item.key}
                initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.08 }}
                className="flex items-center gap-3"
              >
                <span className="h-5 w-5 rounded-full bg-gold/20 border border-gold/40 flex items-center justify-center shrink-0">
                  <Check className="h-3 w-3 text-gold" />
                </span>
                <span className="text-sm text-foreground/80">{t("app.auth." + item.key, item.def)}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Trust badges */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.7 }}
          className="flex gap-3"
        >
          {TRUST_BADGES.map(({ icon: Icon, key, label, href }) => (
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
              <span className="text-xs font-medium text-foreground/80 leading-tight">{t("app.auth." + key, label)}</span>
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
              <h2 className="font-display text-3xl text-foreground">{t("app.auth.successTitle", "Account Created!")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("app.auth.successDesc", "Welcome to VibeNests, {{name}}. Your luxury journey begins now.", { name: form.name })}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="gold-btn w-full rounded-xl py-3 text-sm font-semibold"
              >
                {t("app.auth.continueLogin", "Continue to Login")}
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
                {/* Logo on mobile/tablet */}
                <div className="flex lg:hidden justify-center">
                  <BrandMark />
                </div>
                {/* Header */}
                <div className="flex items-start justify-between">
                  <div>
                    <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground">
                      {t("app.auth.registerTitlePrefix", "Create")} <span className="text-gradient-gold italic">{t("app.auth.registerTitleSuffix", "Account")}</span>
                    </h2>
                    <p className="mt-1.5 text-sm text-muted-foreground">{t("app.auth.registerDesc", "Join VibeNests and start your celebration journey")}</p>
                  </div>
                  <button
                    onClick={() => navigate("/login")}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors shrink-0 mt-1"
                  >
                    <ArrowLeft className="h-3.5 w-3.5" /> {t("app.auth.back", "Back")}
                  </button>
                </div>

                {errorMsg && (
                  <div className="bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs px-4 py-2.5 rounded-xl">
                    ✕ {errorMsg}
                  </div>
                )}

                {/* Form fields */}
                <form onSubmit={handleSubmit} noValidate className="space-y-4" autoComplete="off">
                  {/* Full Name */}
                  <Field label={t("app.auth.fullName", "Full Name")} icon={User} error={errors.name}>
                    <input
                      type="text"
                      placeholder={t("app.auth.fullNamePlaceholder", "Enter your full name")}
                      value={form.name}
                      onChange={(e) => set("name", e.target.value)}
                      className={`luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.name ? "border-rose-500/50" : ""}`}
                      autoComplete="new-name"
                    />
                  </Field>

                  {/* Email */}
                  <Field label={t("app.auth.emailLabel", "Email Address")} icon={Mail} error={errors.email}>
                    <input
                      type="email"
                      placeholder={t("app.auth.emailPlaceholder", "Enter your email address")}
                      value={form.email}
                      onChange={(e) => set("email", e.target.value)}
                      className={`luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.email ? "border-rose-500/50" : ""}`}
                      autoComplete="new-email"
                    />
                  </Field>

                  {/* Phone */}
                  <Field label={t("app.auth.phoneNumber", "Phone Number")} icon={Phone} error={errors.phone}>
                    <div className="flex gap-2">
                      <span className="luxury-input rounded-xl px-3 py-2.5 text-sm text-muted-foreground shrink-0 flex items-center">🇮🇳 +91</span>
                      <input
                        type="tel"
                        placeholder={t("app.auth.phonePlaceholder", "enter your phone number")}
                        value={form.phone}
                        onChange={(e) => set("phone", e.target.value.replace(/\D/g, "").slice(0, 10))}
                        className={`luxury-input flex-1 rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.phone ? "border-rose-500/50" : ""}`}
                        autoComplete="new-phone"
                      />
                    </div>
                  </Field>

                  {/* Password */}
                  <Field label={t("app.auth.passwordLabel", "Password")} icon={Lock} error={errors.password}>
                    <div className="relative">
                      <input
                        type={showPass ? "text" : "password"}
                        placeholder={t("app.auth.passwordPlaceholder", "Min 8 chars, uppercase & number")}
                        value={form.password}
                        onChange={(e) => set("password", e.target.value)}
                        className={`luxury-input w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.password ? "border-rose-500/50" : ""}`}
                        autoComplete="new-password"
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
                          {t("app.auth." + strength.key, strength.label)} {t("app.auth.passwordSuffix", "password")}
                        </p>
                      </motion.div>
                    )}
                  </Field>

                  {/* Confirm Password */}
                  <Field label={t("app.auth.confirmPassword", "Confirm Password")} icon={Lock} error={errors.confirm}>
                    <div className="relative">
                      <input
                        type={showConf ? "text" : "password"}
                        placeholder={t("app.auth.confirmPlaceholder", "Re-enter your password")}
                        value={form.confirm}
                        onChange={(e) => set("confirm", e.target.value)}
                        className={`luxury-input w-full rounded-xl px-4 py-2.5 pr-11 text-sm text-foreground placeholder:text-muted-foreground/50 ${errors.confirm ? "border-rose-500/50" : ""}`}
                        autoComplete="new-password"
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

                  {/* DOB and Marriage Date */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <Field label={t("app.auth.dateOfBirth", "Date of Birth")} icon={Calendar} error={errors.dateOfBirth}>
                      <input
                        type="date"
                        value={form.dateOfBirth}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => set("dateOfBirth", e.target.value)}
                        className={`luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground ${
                          errors.dateOfBirth ? "border-rose-500/50" : ""
                        }`}
                        style={{ colorScheme: "dark" }}
                      />
                    </Field>

                    <Field label={t("app.auth.marriageDate", "Marriage Date (Optional)")} icon={Heart} error={errors.marriageDate}>
                      <input
                        type="date"
                        value={form.marriageDate}
                        max={new Date().toISOString().split("T")[0]}
                        onChange={(e) => set("marriageDate", e.target.value)}
                        className={`luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground ${
                          errors.marriageDate ? "border-rose-500/50" : ""
                        }`}
                        style={{ colorScheme: "dark" }}
                      />
                    </Field>
                  </div>

                  {/* City Dropdown */}
                  <Field label={t("app.auth.city", "City")} icon={MapPin} error={errors.city}>
                    <div className="relative">
                      <button
                        type="button"
                        onClick={() => setCityOpen((o) => !o)}
                        className={`luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-left flex items-center justify-between ${errors.city ? "border-rose-500/50" : ""} ${form.city ? "text-foreground" : "text-muted-foreground/50"}`}
                      >
                        {form.city || t("app.auth.selectCity", "Select your city")}
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

                  {/* Referral Code (Optional) */}
                  <Field label={t("app.auth.referralCode", "Referral Code (Optional)")} icon={Star} error={errors.referralCode}>
                    <input
                      type="text"
                      placeholder={t("app.auth.referralCodePlaceholder", "Enter a referral code if you have one")}
                      value={form.referralCode}
                      onChange={(e) => set("referralCode", e.target.value.toUpperCase())}
                      disabled={!!refCodeFromUrl}
                      className={`luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground placeholder:text-muted-foreground/50 ${
                        refCodeFromUrl ? "opacity-60 bg-white/[0.02] border-gold/30 text-gold font-semibold cursor-not-allowed select-none" : ""
                      }`}
                    />
                  </Field>

                  {/* Terms */}
                  <div className="space-y-1">
                    <label className="flex items-start gap-3 cursor-pointer group">
                      <button
                        type="button"
                        onClick={() => { setAgreed((v) => !v); if (submitted) setErrors((p) => ({ ...p, terms: agreed ? t("app.validation.termsRequired", "You must accept the terms to continue") : "" })); }}
                        className={`mt-0.5 h-4 w-4 rounded border shrink-0 flex items-center justify-center transition-all ${agreed ? "bg-gold border-gold" : "border-white/25 bg-white/5 group-hover:border-gold/50"}`}
                      >
                        {agreed && <Check className="h-2.5 w-2.5 text-[oklch(0.12_0.02_260)]" />}
                      </button>
                      <span className="text-xs text-muted-foreground leading-relaxed">
                        {t("app.auth.agreePrefix", "I agree to the")}{" "}
                        <a href="/terms-of-use" target="_blank" className="text-gold hover:underline underline-offset-2">{t("app.auth.termsOfService", "Terms of Service")}</a>
                        {" "}{t("app.auth.and", "and")}{" "}
                        <a href="/privacy-policy" target="_blank" className="text-gold hover:underline underline-offset-2">{t("app.auth.privacyPolicy", "Privacy Policy")}</a>
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
                    disabled={loading}
                    className="gold-btn w-full rounded-xl py-3 text-sm font-semibold tracking-wide mt-2 disabled:opacity-50"
                  >
                    {loading ? t("app.auth.creatingAccount", "Creating Account...") : t("app.auth.createAccount", "Create My Account")}
                  </button>
                </form>

                {/* Login link */}
                <p className="text-center text-sm text-muted-foreground">
                  {t("app.auth.haveAccount", "Already have an account?")}{" "}
                  <button onClick={() => navigate("/login")} className="text-gold font-medium hover:underline underline-offset-4">
                    {t("app.auth.signInLink", "Sign In")}
                  </button>
                </p>

                {/* Mobile trust badges */}
                <div className="flex gap-2 lg:hidden pt-1">
                  {TRUST_BADGES.map(({ icon: Icon, key, label, href }) => (
                    <a
                      key={label}
                      href={href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="glass rounded-xl px-3 py-2 flex items-center gap-1.5 flex-1 hover:border-gold/40 transition-colors"
                    >
                      <Icon className="h-3.5 w-3.5 text-gold shrink-0" />
                      <span className="text-[10px] text-muted-foreground leading-tight">{t("app.auth." + key, label)}</span>
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
