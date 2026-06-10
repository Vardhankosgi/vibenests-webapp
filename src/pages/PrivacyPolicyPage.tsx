import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/auth/BrandMark";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { useTranslation } from "react-i18next";
import loginbg from "@/assets/loginbg.png";

export default function PrivacyPolicyPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else window.close();
  }

  const sections = [
    {
      title: t("legal.privacy.intro.title"),
      content: `${t("legal.privacy.intro.p1")}\n\n${t("legal.privacy.intro.p2")}\n\n${t("legal.privacy.intro.p3")}\n• ${t("legal.privacy.intro.li1")}\n• ${t("legal.privacy.intro.li2")}\n• ${t("legal.privacy.intro.li3")}`,
    },
    {
      title: t("legal.privacy.collect.title"),
      content: `${t("legal.privacy.collect.p1")}\n• ${t("legal.privacy.collect.li1")}\n• ${t("legal.privacy.collect.li2")}\n• ${t("legal.privacy.collect.li3")}\n• ${t("legal.privacy.collect.li4")}\n• ${t("legal.privacy.collect.li5")}\n• ${t("legal.privacy.collect.li6")}\n• ${t("legal.privacy.collect.li7")}\n\n${t("legal.privacy.collect.p2")}\n• ${t("legal.privacy.collect.li8")}\n• ${t("legal.privacy.collect.li9")}\n• ${t("legal.privacy.collect.li10")}\n• ${t("legal.privacy.collect.li11")}\n• ${t("legal.privacy.collect.li12")}\n• ${t("legal.privacy.collect.li13")}\n\n${t("legal.privacy.collect.p3")}\n${t("legal.privacy.collect.p4")}\n• ${t("legal.privacy.collect.li14")}\n• ${t("legal.privacy.collect.li15")}\n• ${t("legal.privacy.collect.li16")}\n• ${t("legal.privacy.collect.li17")}`,
    },
    {
      title: t("legal.privacy.live.title"),
      content: `When users opt for Live Celebration Sharing:\n• ${t("legal.privacy.live.li1")}\n• ${t("legal.privacy.live.li2")}\n• ${t("legal.privacy.live.li3")}\n• ${t("legal.privacy.live.li4")}`,
    },
    {
      title: t("legal.privacy.purpose.title"),
      content: `${t("legal.privacy.purpose.p1")}\n• ${t("legal.privacy.purpose.li1")}\n• ${t("legal.privacy.purpose.li2")}\n• ${t("legal.privacy.purpose.li3")}\n• ${t("legal.privacy.purpose.li4")}\n• ${t("legal.privacy.purpose.li5")}\n• ${t("legal.privacy.purpose.li6")}\n• ${t("legal.privacy.purpose.li7")}\n• ${t("legal.privacy.purpose.li8")}`,
    },
    {
      title: t("legal.privacy.consent.title"),
      content: `${t("legal.privacy.consent.li1")} ${t("legal.privacy.consent.li2")} ${t("legal.privacy.consent.li3")}`,
    },
    {
      title: t("legal.privacy.retention.title"),
      content: `${t("legal.privacy.retention.p1")}\n• ${t("legal.privacy.retention.li1")}\n• ${t("legal.privacy.retention.li2")}\n• ${t("legal.privacy.retention.li3")}\n• ${t("legal.privacy.retention.li4")}\n• ${t("legal.privacy.retention.li5")}\n\n${t("legal.privacy.retention.p2")}`,
    },
    {
      title: t("legal.privacy.rights.title"),
      content: `${t("legal.privacy.rights.p1")}\n• ${t("legal.privacy.rights.li1")}\n• ${t("legal.privacy.rights.li2")}\n• ${t("legal.privacy.rights.li3")}\n• ${t("legal.privacy.rights.li4")}\n• ${t("legal.privacy.rights.li5")}\n• ${t("legal.privacy.rights.li6")}`,
    },
    {
      title: t("legal.privacy.security.title"),
      content: `${t("legal.privacy.security.p1")}\n• ${t("legal.privacy.security.li1")}\n• ${t("legal.privacy.security.li2")}\n• ${t("legal.privacy.security.li3")}\n• ${t("legal.privacy.security.li4")}\n• ${t("legal.privacy.security.li5")}\n• ${t("legal.privacy.security.li6")}`,
    },
    {
      title: t("legal.privacy.thirdParty.title"),
      content: `${t("legal.privacy.thirdParty.p1")}\n• ${t("legal.privacy.thirdParty.li1")}\n• ${t("legal.privacy.thirdParty.li2")}\n• ${t("legal.privacy.thirdParty.li3")}\n• ${t("legal.privacy.thirdParty.li4")}\n• ${t("legal.privacy.thirdParty.li5")}\n\n${t("legal.privacy.thirdParty.p2")}`,
    },
    {
      title: t("legal.privacy.children.title"),
      content: `• ${t("legal.privacy.children.li1")}\n• ${t("legal.privacy.children.li2")}`,
    },
    {
      title: t("legal.privacy.grievance.title"),
      content: `${t("legal.privacy.grievance.p1")}\n\n${t("contact.cards.email")}: vibenestsmeetingpoint@gmail.com\n${t("contact.cards.phone")}: +91 9000201020\n\n${t("legal.privacy.grievance.timeline")}`,
    },
    {
      title: t("legal.privacy.updates.title"),
      content: `• ${t("legal.privacy.updates.li1")}\n• ${t("legal.privacy.updates.li2")}`,
    },
  ];

  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        backgroundImage: `url(${loginbg})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundAttachment: "fixed",
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
                <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                <span className="text-[11px] font-bold tracking-widest text-gold uppercase">{t("legal.privacy.title").replace(/^\d+\.\s/, "")}</span>
              </div>
              <h1 className="font-display text-4xl font-medium text-foreground">
                {t("seo.privacyTitle").split(" - ")[0]}
              </h1>
              <p className="text-sm text-muted-foreground">{t("legal.effectiveDate", { date: "30/05/2026" })}</p>
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
              <a href="/terms-of-use" className="hover:text-gold transition-colors">{t("footer.terms")}</a>
              <span className="text-white/15">|</span>
              <a href="/contact" className="hover:text-gold transition-colors">{t("footer.contact")}</a>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
