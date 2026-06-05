import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ScrollText, ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/auth/BrandMark";
import loginbg from "@/assets/loginbg.png";

const sections = [
  {
    title: "1. Acceptance",
    content: `By accessing or using Vibenests, you agree to these Terms of Use. If you do not agree, please discontinue use immediately.`,
  },
  {
    title: "2. Services",
    content: `Vibenests provides:\n• Private Suite Bookings\n• Celebration Packages\n• Event Add-ons\n• Live Celebration Sharing\n• Promotional Offers`,
  },
  {
    title: "3. User Responsibilities",
    content: `Users agree to:\n• Provide accurate information\n• Use services lawfully\n• Respect venue rules\n• Do not damage property\n• Do not engage in illegal activities`,
  },
  {
    title: "4. Booking Rules",
    content: `Bookings are confirmed only after:\n• Successful payment\n• Booking confirmation issued by Vibenests\n\nAvailability is subject to change until confirmation.`,
  },
  {
    title: "5. Guest Conduct",
    content: `Users are responsible for:\n• Their guests\n• Property damage caused by guests\n• Compliance with local laws\n\nVibenests reserves the right to terminate bookings for misconduct.`,
  },
  {
    title: "6. Live Celebration Sharing",
    content: `Users may share meeting links with relatives and friends. Users are solely responsible for:\n• Recipients of the shared links\n• Content shared during livestreams\n• Obtaining consent from attendees\n\nVibenests is not responsible for the actions of third-party streaming providers.`,
  },
  {
    title: "7. Pricing",
    content: `Prices may include:\n• Suite charges\n• Add-on charges\n• Taxes\n• Service fees\n\nApplicable taxes shall be displayed before checkout.`,
  },
  {
    title: "8. Offers & Discounts",
    content: `Offers:\n• Cannot be combined unless specified\n• Are subject to validity periods\n• May be modified or withdrawn`,
  },
  {
    title: "9. Intellectual Property",
    content: `All content, including Logos, Images, Designs, Text, and Software, belongs to Vibenests and may not be copied without authorization.`,
  },
  {
    title: "10. Limitation of Liability",
    content: `Vibenests shall not be liable for:\n• Internet interruptions\n• Third-party service failures\n• Force majeure events\n• Losses caused by user negligence`,
  },
  {
    title: "11. Suspension & Termination",
    content: `We may suspend or terminate accounts for:\n• Fraud\n• Abuse\n• Illegal activities\n• Violation of these Terms`,
  },
  {
    title: "12. Governing Law",
    content: `These Terms shall be governed by the laws of India. Any disputes shall be subject to the jurisdiction of courts located in Hyderabad, Telangana.`,
  },
];

export default function TermsOfUsePage() {
  const navigate = useNavigate();

  function handleBack() {
    if (window.history.length > 1) navigate(-1);
    else window.close();
  }

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
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <ArrowLeft className="h-4 w-4" /> Back
          </button>
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
                <span className="text-[11px] font-bold tracking-widest text-gold uppercase">Terms of Use</span>
              </div>
              <h1 className="font-display text-4xl font-medium text-foreground">
                Our <span className="text-gradient-gold italic">Terms & Conditions</span>
              </h1>
              <p className="text-sm text-muted-foreground">Effective Date: 01/06/2026</p>
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
              <a href="/privacy-policy" className="hover:text-gold transition-colors">Privacy Policy</a>
              <span className="text-white/15">|</span>
              <a href="/contact" className="hover:text-gold transition-colors">Contact Us</a>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
