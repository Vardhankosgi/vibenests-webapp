import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ShieldCheck, ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/auth/BrandMark";
import loginbg from "@/assets/loginbg.png";

const sections = [
  {
    title: "1. Introduction",
    content: `Vibenests Private Luxury Suites ("Vibenests", "we", "our", or "us") is committed to protecting your privacy and personal data. This Privacy Policy explains how we collect, use, store, process, and protect your personal information when you use our website, mobile application, and services.\n\nThis policy complies with:\n• Digital Personal Data Protection Act, 2023 (India)\n• Information Technology Act, 2000\n• Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011`,
  },
  {
    title: "2. Information We Collect",
    content: `Personal Information — We may collect: Full Name, Mobile Number, Email Address, Date of Birth (optional), Billing Information, Address Information, Government-issued ID where legally required.\n\nBooking Information — Occasion selected, Suite booked, Date and time of booking, Guest count, Add-ons selected, Special requests.\n\nPayment Information — Payments are processed through authorized payment gateways. Vibenests does not store: Card Numbers, CVV, Banking Passwords, UPI PINs.`,
  },
  {
    title: "3. Live Celebration Feature",
    content: `When users opt for Live Celebration Sharing:\n• Meeting links may be generated through approved platforms.\n• Guests joining through shared links are responsible for their own conduct.\n• Users must obtain consent before sharing personal images or videos of others.\n• Vibenests does not monitor private conversations conducted through third-party meeting platforms.`,
  },
  {
    title: "4. Purpose of Data Processing",
    content: `We process personal data to:\n• Create and manage bookings\n• Provide customer support\n• Process payments\n• Share booking updates\n• Enable live celebration links\n• Improve service quality\n• Prevent fraud and abuse\n• Meet legal obligations`,
  },
  {
    title: "5. Consent",
    content: `By using our services, you consent to the collection and processing of your personal data for the purposes described in this policy. You may withdraw consent at any time by contacting us. Withdrawal of consent may affect service availability.`,
  },
  {
    title: "6. Data Retention",
    content: `We retain data only as long as necessary for: Booking management, Tax compliance, Legal obligations, Fraud prevention, and Dispute resolution. Thereafter, data will be securely deleted or anonymized.`,
  },
  {
    title: "7. Your Rights Under DPDP Act",
    content: `You have the right to:\n• Access your personal data\n• Correct inaccurate information\n• Request deletion of data\n• Withdraw consent\n• Nominate another individual to exercise rights on your behalf\n• File a grievance`,
  },
  {
    title: "8. Security Measures",
    content: `We implement: SSL encryption, Access controls, Secure cloud infrastructure, Role-based access management, Audit logs, and Regular security reviews.`,
  },
  {
    title: "9. Third-Party Services",
    content: `We may use: Payment Gateways, SMS Providers, Email Service Providers, Video Meeting Platforms, and Analytics Services. Such providers process data according to their own privacy policies.`,
  },
  {
    title: "10. Children's Privacy",
    content: `Our services are intended for individuals aged 18 years and above. We do not knowingly collect data from minors.`,
  },
  {
    title: "11. Grievance Officer",
    content: `For privacy-related concerns, data access requests, correction requests, deletion requests, or DPDP Act grievances, please contact:\n\nEmail: vibenestsmeetingpoint@gmail.com\nSupport Number: +91 9000201020\n\nResponse Timeline: We aim to acknowledge complaints within 7 business days and resolve them within 30 business days.`,
  },
  {
    title: "12. Policy Updates",
    content: `We may update this Privacy Policy periodically. Continued use of our services constitutes acceptance of the revised policy.`,
  },
];

export default function PrivacyPolicyPage() {
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
                <ShieldCheck className="h-3.5 w-3.5 text-gold" />
                <span className="text-[11px] font-bold tracking-widest text-gold uppercase">Privacy Policy</span>
              </div>
              <h1 className="font-display text-4xl font-medium text-foreground">
                Your Privacy, <span className="text-gradient-gold italic">Protected</span>
              </h1>
              <p className="text-sm text-muted-foreground">Effective Date: 30/05/2026</p>
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
              <a href="/terms-of-use" className="hover:text-gold transition-colors">Terms of Use</a>
              <span className="text-white/15">|</span>
              <a href="/contact" className="hover:text-gold transition-colors">Contact Us</a>
            </motion.div>
          </motion.div>
        </main>
      </div>
    </div>
  );
}
