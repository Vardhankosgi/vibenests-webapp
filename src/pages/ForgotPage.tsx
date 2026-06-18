import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion } from "framer-motion";
import { Mail, ArrowLeft, CheckCircle, AlertCircle } from "lucide-react";
import { authApi } from "@/lib/api";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import loginbg from "@/assets/loginbg.png";

export default function ForgotPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    const emailTrimmed = email.trim();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailTrimmed)) {
      setError(t("app.validation.emailRequired", "Please enter a valid email address."));
      return;
    }

    setLoading(true);
    try {
      await authApi.forgotPassword(emailTrimmed);
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || t("app.auth.forgotPasswordFailed", "Failed to send password reset email. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center relative px-4 py-16"
      style={{ backgroundImage: `url(${loginbg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
    >
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />

      {/* Top-right buttons */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <LanguageSelector />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.1 }}
        className="glass-card relative w-full max-w-md rounded-3xl p-7 sm:p-9 transition-transform duration-500 hover:-translate-y-0.5 z-10"
      >
        <div className="pointer-events-none absolute -top-24 -right-24 h-56 w-56 rounded-full bg-[var(--gold)]/15 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-24 h-56 w-56 rounded-full bg-[var(--gold)]/10 blur-3xl" />

        <div className="relative">
          {/* Back button */}
          <button
            onClick={() => navigate("/login")}
            className="flex items-center gap-2 mb-6 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-gold transition-colors"
          >
            <ArrowLeft className="h-4 w-4" />
            {t("app.auth.backToLogin", "Back to Login")}
          </button>

          {!success ? (
            <>
              <div className="mb-6">
                <h2 className="font-display text-3xl font-medium text-foreground">
                  {t("app.auth.forgotPasswordTitle", "Reset Password")}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {t("app.auth.forgotPasswordDesc", "Enter your email address and we will send you a secure link to reset your password.")}
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="space-y-2">
                  <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">
                    {t("app.auth.emailLabel", "Email Address")}
                  </label>
                  <div className="relative">
                    <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder={t("forms.emailPlaceholder", "yourname@example.com")}
                      className="luxury-input w-full rounded-lg pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 bg-transparent"
                      autoComplete="email"
                      required
                    />
                  </div>
                </div>

                {error && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2 flex items-start gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 text-destructive" />
                    <span>{error}</span>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="gold-btn w-full rounded-lg py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
                >
                  {loading ? t("app.auth.sending", "Sending...") : t("app.auth.sendResetLink", "Send Reset Link")}
                </button>
              </form>
            </>
          ) : (
            <div className="text-center py-4 space-y-4">
              <div className="mx-auto h-16 w-16 rounded-full bg-[var(--gold)]/10 border border-[var(--gold)]/20 flex items-center justify-center">
                <CheckCircle className="h-8 w-8 text-gold" />
              </div>
              <h3 className="font-display text-2xl font-semibold text-foreground">
                {t("app.auth.checkEmailTitle", "Check Your Email")}
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                {t(
                  "app.auth.checkEmailDesc",
                  "If the email address exists, a secure password reset link has been sent to it. Please check your inbox and spam folder."
                )}
              </p>
              <button
                onClick={() => navigate("/login")}
                className="gold-btn w-full rounded-lg py-3.5 text-sm font-semibold mt-4"
              >
                {t("app.auth.backToLogin", "Back to Login")}
              </button>
            </div>
          )}
        </div>
      </motion.div>
    </main>
  );
}
