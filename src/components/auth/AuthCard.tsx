import { useState } from "react";
import { motion } from "framer-motion";
import { GoogleIcon } from "./GoogleIcon";
import { EmailLoginForm } from "./EmailLoginForm";
import { MobileOtpForm } from "./MobileOtpForm";

type Tab = "email" | "otp";

export function AuthCard() {
  const [tab, setTab] = useState<Tab>("otp");

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay: 0.1 }}
      className="glass-card relative w-full max-w-md rounded-3xl p-7 sm:p-9 transition-transform duration-500 hover:-translate-y-0.5"
    >
      <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[var(--gold)]/15 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[var(--gold)]/10 blur-3xl" />

      <div className="relative">
        <div className="px-4 py-4 mb-5">
          <h2 className="font-display text-3xl sm:text-4xl font-medium text-foreground">
            Welcome <span className="text-gradient-gold italic">Back!</span>
          </h2>
          <p className="mt-2 text-sm text-muted-foreground">Login to continue your celebration journey</p>
        </div>

        <div className="px-4 py-4 mb-5">
          <button
            type="button"
            className="w-full flex items-center justify-center gap-3 rounded-lg border border-[var(--gold)]/30 bg-white/[0.03] py-3 text-sm font-medium text-foreground hover:bg-white/[0.07] hover:border-[var(--gold)]/60 transition-all"
          >
            <GoogleIcon className="h-5 w-5" />
            Continue with Google
          </button>
        </div>

        <div className="my-5 flex items-center gap-3 text-[11px] tracking-[0.3em] text-muted-foreground uppercase">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent to-[var(--gold)]/30" />
          <span>or</span>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent to-[var(--gold)]/30" />
        </div>

        <div className="px-4 py-4 mb-5">
          <div className="grid grid-cols-2 gap-2 p-1 rounded-xl bg-white/[0.04] border border-[var(--gold)]/15 mb-6">
            {(["otp", "email"] as Tab[]).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTab(t)}
                className={`relative rounded-lg py-2.5 text-xs sm:text-sm font-medium transition-all ${
                  tab === t
                    ? "bg-gradient-gold text-white shadow-[0_8px_24px_-8px_oklch(0.74_0.13_80/0.5)]"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                {t === "email" ? "Email Login" : "Mobile OTP Login"}
              </button>
            ))}
          </div>

          <motion.div key={tab} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }}>
            {tab === "email" ? <EmailLoginForm /> : <MobileOtpForm />}
          </motion.div>
        </div>

        <div className="px-4 py-3 text-center">
          <p className="text-sm text-muted-foreground">
            Don't have an account?{" "}
            <a href="#" className="text-gold font-medium hover:underline underline-offset-4">Sign up</a>
          </p>
        </div>
      </div>
    </motion.div>
  );
}
