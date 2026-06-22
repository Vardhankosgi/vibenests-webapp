import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ScrollText, ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/auth/BrandMark";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { useTranslation } from "react-i18next";
import loginbg from "@/assets/loginbg.png";

export default function TermsOfUsePage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else window.close();
  }

  const sections = [
    {
      title: t("legal.terms.acceptance.title"),
      content: t("legal.terms.acceptance.p1"),
    },
    {
      title: t("legal.terms.services.title"),
      content: `${t("legal.terms.services.p1")}\n• ${t("legal.terms.services.li1")}\n• ${t("legal.terms.services.li2")}\n• ${t("legal.terms.services.li3")}\n• ${t("legal.terms.services.li4")}\n• ${t("legal.terms.services.li5")}`,
    },
    {
      title: t("legal.terms.responsibilities.title"),
      content: `${t("legal.terms.responsibilities.p1")}\n• ${t("legal.terms.responsibilities.li1")}\n• ${t("legal.terms.responsibilities.li2")}\n• ${t("legal.terms.responsibilities.li3")}\n• ${t("legal.terms.responsibilities.li4")}\n• ${t("legal.terms.responsibilities.li5")}`,
    },
    {
      title: t("legal.terms.booking.title"),
      content: `${t("legal.terms.booking.p1")}\n• ${t("legal.terms.booking.li1")}\n• ${t("legal.terms.booking.li2")}\n\n${t("legal.terms.booking.p2")}`,
    },
    {
      title: t("legal.terms.conduct.title"),
      content: `${t("legal.terms.conduct.p1")}\n• ${t("legal.terms.conduct.li1")}\n• ${t("legal.terms.conduct.li2")}\n• ${t("legal.terms.conduct.li3")}\n\n${t("legal.terms.conduct.p2")}`,
    },
    {
      title: t("legal.terms.live.title"),
      content: `${t("legal.terms.live.p1")}\n• ${t("legal.terms.live.li1")}\n• ${t("legal.terms.live.li2")}\n• ${t("legal.terms.live.li3")}\n\n${t("legal.terms.live.p2")}`,
    },
    {
      title: t("legal.terms.pricing.title"),
      content: `${t("legal.terms.pricing.p1")}\n• ${t("legal.terms.pricing.li1")}\n• ${t("legal.terms.pricing.li2")}\n• ${t("legal.terms.pricing.li3")}\n• ${t("legal.terms.pricing.li4")}\n\n${t("legal.terms.pricing.p2")}`,
    },
    {
      title: t("legal.terms.offers.title"),
      content: `${t("legal.terms.offers.p1")}\n• ${t("legal.terms.offers.li1")}\n• ${t("legal.terms.offers.li2")}\n• ${t("legal.terms.offers.li3")}`,
    },
    {
      title: t("legal.terms.ip.title"),
      content: `${t("legal.terms.ip.p1")}\n• ${t("legal.terms.ip.li1")}\n• ${t("legal.terms.ip.li2")}\n• ${t("legal.terms.ip.li3")}\n• ${t("legal.terms.ip.li4")}\n• ${t("legal.terms.ip.li5")}\n\n${t("legal.terms.ip.p2")}`,
    },
    {
      title: t("legal.terms.liability.title"),
      content: `${t("legal.terms.liability.p1")}\n• ${t("legal.terms.liability.li1")}\n• ${t("legal.terms.liability.li2")}\n• ${t("legal.terms.liability.li3")}\n• ${t("legal.terms.liability.li4")}`,
    },
    {
      title: t("legal.terms.termination.title"),
      content: `${t("legal.terms.termination.p1")}\n• ${t("legal.terms.termination.li1")}\n• ${t("legal.terms.termination.li2")}\n• ${t("legal.terms.termination.li3")}\n• ${t("legal.terms.termination.li4")}`,
    },
    {
      title: t("legal.terms.law.title"),
      content: t("legal.terms.law.p1"),
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col bg-scroll lg:bg-fixed"
      style={{
        backgroundImage: `url(${loginbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundColor: "oklch(0.08 0.015 260)",
      }}
    >
      <div className="fixed inset-0 pointer-events-none" style={{ background: "rgba(4,6,20,0.88)" }} />

      <div className="relative z-10 flex flex-col min-h-screen">
        {/* Header */}
        <header className="flex items-center justify-between px-6 py-5 border-b border-white/8">
          <BrandMark />
          <div className="flex items-center gap-4">
            <LanguageSelector />
            <button
              onClick={handleBack}
              className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
            >
              <ArrowLeft className="h-4 w-4" /> {t("common.back", "Back")}
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-3xl mx-auto w-full px-6 py-12">
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="space-y-8"
          >
            {/* Hero */}
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full border border-gold/30 bg-gold/10">
                <ScrollText className="h-3.5 w-3.5 text-gold" />
                <span className="text-[11px] font-bold tracking-widest text-gold uppercase">{t("legal.terms.title").replace(/^\d+\.\s/, "")}</span>
              </div>
              <h1 className="font-display text-4xl font-medium text-foreground">
                {t("seo.termsTitle").split(" - ")[0]}
              </h1>
              <p className="text-sm text-muted-foreground">{t("legal.effectiveDate", { date: "01/06/2026" })}</p>
            </div>

            {/* Sections */}
            <div className="space-y-6">
              {sections.map((s, i) => (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.08 * i, duration: 0.45 }}
                  className="glass rounded-2xl p-6 space-y-3"
                >
                  <h2 className="text-sm font-semibold text-foreground">{s.title}</h2>
                  <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">{s.content}</p>
                </motion.div>
              ))}
            </div>

            {/* Footer links */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.55 }}
              className="flex flex-wrap gap-4 text-xs text-muted-foreground pt-2"
            >
              <a href="/privacy-policy" className="hover:text-gold transition-colors">{t("footer.privacy")}</a>
              <span className="text-white/15">|</span>
              <a href="/contact" className="hover:text-gold transition-colors">{t("footer.contact")}</a>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
