import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft, Mail, Phone, Clock, MessageCircle,
  ShieldCheck, ScrollText, ExternalLink,
} from "lucide-react";
import { BrandMark } from "@/components/auth/BrandMark";
import loginbg from "@/assets/loginbg.png";

const contacts = [
  {
    icon: Mail,
    label: "Email",
    value: "vibenestsmeetingpoint@gmail.com",
    href: "mailto:vibenestsmeetingpoint@gmail.com",
    sub: "We respond within 1–2 business days",
  },
  {
    icon: Phone,
    label: "Support Number",
    value: "+91 9000201011",
    href: "tel:+919000201011",
    sub: "Call or WhatsApp during support hours",
  },
  {
    icon: Clock,
    label: "Support Hours",
    value: "9:00 AM – 9:00 PM IST",
    href: null,
    sub: "Monday to Sunday, incl. public holidays",
  },
];

const topics = [
  "Booking queries & confirmations",
  "Celebration package customisation",
  "Payment & refund requests",
  "Live celebration sharing support",
  "Complaints & escalations",
  "Legal & privacy matters",
];

const quickLinks = [
  { icon: ShieldCheck, label: "Privacy Policy", href: "/privacy-policy" },
  { icon: ScrollText,  label: "Terms of Use",   href: "/terms-of-use"   },
];

export default function ContactUsPage() {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else window.close();
  }

  return (
    <div
      className="min-h-screen flex"
      style={{
        backgroundImage: `url(${loginbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
        backgroundColor: "oklch(0.08 0.015 260)",
      }}
    >
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(4,6,20,0.87)" }} />

      {/* ── Left hero panel (desktop) ── */}
      <div className="hidden lg:flex lg:w-[40%] xl:w-[36%] flex-col justify-between relative z-10 p-12 shrink-0">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <BrandMark />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.15 }}
          className="space-y-5"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10">
            <MessageCircle className="h-3.5 w-3.5 text-gold" />
            <span className="text-[11px] font-bold tracking-widest text-gold uppercase">Contact Us</span>
          </div>

          <h1 className="font-display text-5xl xl:text-6xl font-medium text-foreground leading-[1.1]">
            We're Here<br />
            <span className="text-gradient-gold italic">to Help</span>
          </h1>

          <p className="text-sm text-muted-foreground max-w-xs leading-relaxed">
            Reach out for bookings, services, complaints, or any legal matters. Our team is available every day.
          </p>

          {/* Topics list */}
          <div className="space-y-2.5 pt-1">
            {topics.map((t, i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: -14 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.4 + i * 0.07 }}
                className="flex items-center gap-3"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-gold/60 shrink-0" />
                <span className="text-sm text-foreground/75">{t}</span>
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Quick links */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.75 }}
          className="flex gap-2"
        >
          {quickLinks.map(({ icon: Icon, label, href }) => (
            <a
              key={label}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="glass-card rounded-2xl px-3 py-3 flex items-center gap-2 flex-1 hover:border-gold/40 hover:bg-gold/5 transition-colors"
            >
              <div className="h-7 w-7 rounded-lg bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                <Icon className="h-3.5 w-3.5 text-gold" />
              </div>
              <span className="text-[10px] font-medium text-foreground/80 leading-tight">{label}</span>
            </a>
          ))}
        </motion.div>
      </div>

      {/* ── Right content panel ── */}
      <div className="flex-1 flex items-center justify-center relative z-10 overflow-y-auto py-10 px-4">
        <motion.div
          initial={{ opacity: 0, y: 24 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.65, delay: 0.1 }}
          className="glass-card relative w-full max-w-lg rounded-3xl p-7 sm:p-9"
        >
          {/* Glow blobs */}
          <div className="pointer-events-none absolute -top-20 -right-20 h-52 w-52 rounded-full bg-gold/10 blur-3xl" />
          <div className="pointer-events-none absolute -bottom-20 -left-20 h-52 w-52 rounded-full bg-gold/8 blur-3xl" />

          <div className="relative space-y-7">

            {/* Mobile header */}
            <div className="flex items-center justify-between lg:hidden">
              <BrandMark />
              <button
                onClick={handleBack}
                className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                <ArrowLeft className="h-3.5 w-3.5" /> Back
              </button>
            </div>

            {/* Card header */}
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="h-8 w-8 rounded-lg bg-gold/15 border border-gold/30 flex items-center justify-center shrink-0">
                    <MessageCircle className="h-4 w-4 text-gold" />
                  </div>
                  <span className="text-[11px] font-bold tracking-[0.2em] text-gold uppercase">Get in Touch</span>
                </div>
                <button
                  onClick={handleBack}
                  className="hidden lg:flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  <ArrowLeft className="h-3.5 w-3.5" /> Back
                </button>
              </div>
              <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground leading-tight pt-1">
                Vibenests <span className="text-gradient-gold italic">Support</span>
              </h2>
              <p className="text-sm text-muted-foreground">
                Private Luxury Suites — available every day, 9 AM to 9 PM IST
              </p>
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

            {/* Contact cards */}
            <div className="space-y-3">
              {contacts.map((c, i) => {
                const Icon = c.icon;
                const cls = "flex items-start gap-4 glass rounded-2xl p-4 transition-colors";
                const inner = (
                  <>
                    <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0 mt-0.5">
                      <Icon className="h-4.5 w-4.5 text-gold" />
                    </div>
                    <div className="flex-1 min-w-0 space-y-0.5">
                      <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{c.label}</p>
                      <p className="text-sm font-medium text-foreground break-all">{c.value}</p>
                      <p className="text-[11px] text-muted-foreground">{c.sub}</p>
                    </div>
                    {c.href && <ExternalLink className="h-3.5 w-3.5 text-gold/40 shrink-0 mt-1" />}
                  </>
                );
                return (
                  <motion.div
                    key={c.label}
                    initial={{ opacity: 0, x: 10 }} animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.25 + i * 0.08, duration: 0.4 }}
                  >
                    {c.href
                      ? <a href={c.href} className={`${cls} hover:border-gold/40 hover:bg-gold/5`}>{inner}</a>
                      : <div className={cls}>{inner}</div>
                    }
                  </motion.div>
                );
              })}
            </div>

            <div className="h-px bg-gradient-to-r from-transparent via-gold/25 to-transparent" />

            {/* Topics — mobile only (desktop shows in left panel) */}
            <motion.div
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.55, duration: 0.4 }}
              className="lg:hidden space-y-3"
            >
              <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">We Can Help With</p>
              <ul className="grid grid-cols-2 gap-x-4 gap-y-2">
                {topics.map((t) => (
                  <li key={t} className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold/60 shrink-0" />
                    {t}
                  </li>
                ))}
              </ul>
            </motion.div>

            {/* Footer links */}
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }}
              transition={{ delay: 0.65 }}
              className="flex flex-wrap items-center gap-4 text-xs text-muted-foreground pt-1"
            >
              <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Privacy Policy
              </a>
              <span className="text-white/15">|</span>
              <a href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors flex items-center gap-1">
                <ScrollText className="h-3 w-3" /> Terms of Use
              </a>
            </motion.div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
