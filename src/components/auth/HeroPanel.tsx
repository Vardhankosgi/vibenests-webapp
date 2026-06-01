import { motion } from "framer-motion";
import { Sparkles, Gem, ShieldCheck, Headphones, Gift } from "lucide-react";
import { BrandMark } from "./BrandMark";

const features = [
  { icon: Sparkles, label: "Perfect for Every Occasion" },
  { icon: Gem, label: "Luxury Ambience & Amenities" },
  { icon: ShieldCheck, label: "100% Private & Secure" },
  { icon: Headphones, label: "24/7 Support & Assistance" },
];

export function HeroPanel({ onSignUp }: { onSignUp: () => void }) {
  return (
    <div className="relative isolate flex h-full min-h-[640px] flex-col justify-between overflow-hidden p-8 lg:p-12">
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
          Make Every<br />
          <span className="text-gradient-gold italic">Moment Special</span>
        </h1>
        <p className="mt-5 max-w-md text-sm sm:text-base text-muted-foreground leading-relaxed">
          Beautifully decorated private suites for birthdays, anniversaries, proposals, and unforgettable celebrations.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-4 max-w-md">
          {features.map((f, i) => (
            <motion.div
              key={f.label}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 + i * 0.08 }}
              className="flex items-center gap-3"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--gold)]/40 bg-[var(--gold)]/10">
                <f.icon className="h-4 w-4 text-gold" />
              </div>
              <span className="text-xs sm:text-sm text-foreground/85 leading-tight">{f.label}</span>
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
          <h3 className="font-display text-lg font-semibold text-foreground">New Here?</h3>
          <p className="text-xs sm:text-sm text-muted-foreground mt-0.5">
            Create an account and start booking the perfect suite for your special moments.
          </p>
        </div>
        <button onClick={onSignUp} className="gold-btn shrink-0 rounded-lg px-5 py-2.5 text-sm font-semibold">
          Sign Up
        </button>
      </motion.div>
    </div>
  );
}
