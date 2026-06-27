import { motion } from "framer-motion";
import { Sparkles, Gem, ShieldCheck, Headphones, Gift } from "lucide-react";
import { BrandMark } from "./BrandMark";
import { useTranslation } from "react-i18next";

const FEATURE_KEYS = [
  { icon: Sparkles, key: "feat_perfectOccasion" },
  { icon: Gem,      key: "feat_luxuryAmbience"  },
  { icon: ShieldCheck, key: "feat_privateSecure" },
  { icon: Headphones, key: "feat_support247"    },
];

export function HeroPanel({ onSignUp }: { onSignUp: () => void }) {
  const { t } = useTranslation();

  return (
    <div className="relative isolate flex h-full min-h-[50vh] sm:min-h-[640px] flex-col justify-between overflow-hidden p-8 lg:p-12">
      <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
        <BrandMark />
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="my-10 max-w-xl"
      >
        <h1 className="font-display text-4xl leading-[1.1] sm:text-5xl lg:text-6xl font-medium text-foreground">
          {t("app.hero.makeEvery", "Make Every")}<br />
          <span className="text-gradient-gold italic">{t("app.hero.momentSpecial", "Moment Special")}</span>
        </h1>
        <p className="mt-5 max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
          {t("app.hero.heroDesc", "Beautifully decorated private suites for birthdays, anniversaries, proposals, and unforgettable celebrations.")}
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
          {FEATURE_KEYS.map((f, i) => (
            <motion.div
              key={f.key}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10">
                <f.icon className="h-4 w-4 text-gold" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/85 leading-tight">{t("app.hero." + f.key)}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.5 }}
        className="glass-card rounded-2xl p-5 sm:p-6 flex items-center gap-4 max-w-xl"
      >
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-gold">
          <Gift className="h-5 w-5 text-[oklch(0.14_0.03_260)]" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground">{t("app.hero.newHere", "New Here?")}</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            {t("app.hero.newHereDesc", "Create an account and start booking the perfect suite for your special moments.")}
          </p>
        </div>
        <button onClick={onSignUp} className="gold-btn shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold">
          {t("app.hero.signUp", "Sign Up")}
        </button>
      </motion.div>
    </div>
  );
}
