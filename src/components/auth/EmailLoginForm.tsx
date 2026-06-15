import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye, EyeOff, Mail, Lock, ArrowRight } from "lucide-react";

import { authApi } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { useTranslation } from "react-i18next";

export function EmailLoginForm() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const { t } = useTranslation();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [forgotError, setForgotError] = useState<string | null>(null);
  const [forgotLoading, setForgotLoading] = useState(false);
  const [forgotDone, setForgotDone] = useState(false);

  function openForgot(e: React.MouseEvent) {
    e.preventDefault();
    setForgotError(null);
    setForgotDone(false);
    setForgotEmail("");
    setForgotOpen(true);
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();

    setError(null);
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError(t("app.validation.emailRequired", "Please enter a valid email address."));
      return;
    }
    if (password.length < 6) {
      setError(t("app.validation.passwordLength", "Password must be at least 6 characters."));
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.login(email, password);
      saveSession(data.accessToken, data.refreshToken, data.user);
      navigate(data.user.role === 'admin' ? '/dashboard' : '/user/dashboard');
    } catch (err: any) {
      setError(err.message || t("app.auth.loginFailed", "Login failed. Please try again."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("app.auth.emailLabel")}</label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={t("forms.emailPlaceholder")}
            className="luxury-input w-full rounded-lg pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60"
            autoComplete="email"
          />
        </div>
      </div>

      <div className="space-y-2">
        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("app.auth.passwordLabel")}</label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
          <input
            type={show ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={t("app.auth.passwordPlaceholder", "Enter your password")}
            className="luxury-input w-full rounded-lg pl-11 pr-11 py-3 text-sm text-foreground placeholder:text-muted-foreground/60"
            autoComplete="current-password"
          />
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition-colors p-1"
          >
            {show ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs">
      

        <label className="flex items-center gap-2 cursor-pointer select-none">
          <input
            type="checkbox"
            checked={remember}
            onChange={(e) => setRemember(e.target.checked)}
            className="h-4 w-4 rounded border-[var(--gold)]/40 bg-transparent accent-[var(--gold)]"
          />
          <span className="text-muted-foreground">{t("app.auth.rememberMe")}</span>
        </label>
        <a href="#" onClick={openForgot} className="text-gold hover:underline underline-offset-4">{t("app.auth.forgotPassword")}</a>
      </div>

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      {/* Forgot Password Modal */}
      {forgotOpen && (
        <div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 p-4"
          role="dialog"
          aria-modal="true"
        >
          <div className="glass-card relative w-full max-w-md rounded-2xl border border-[var(--gold)]/20 p-6">
            <button
              type="button"
              className="absolute right-4 top-4 text-muted-foreground hover:text-gold"
              onClick={() => setForgotOpen(false)}
              aria-label="Close"
            >
              ✕
            </button>

            <div className="space-y-2">
              <h2 className="text-lg font-display text-foreground">{t("app.auth.forgotPasswordTitle", "Reset your password")}</h2>
              <p className="text-sm text-muted-foreground">
                {t("app.auth.forgotPasswordDesc", "Enter your email and we’ll send a reset link.")}
              </p>
            </div>

            {!forgotDone ? (
              <form
                onSubmit={async (e) => {
                  e.preventDefault();
                  setForgotError(null);
                  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(forgotEmail.trim())) {
                    setForgotError(t("app.validation.emailRequired", "Please enter a valid email address."));
                    return;
                  }

                  setForgotLoading(true);
                  try {
                    await authApi.forgotPassword(forgotEmail.trim());
                    setForgotDone(true);
                  } catch (err: any) {
                    setForgotError(err.message || "Failed to send reset email");
                  } finally {
                    setForgotLoading(false);
                  }
                }}
                className="mt-5 space-y-3"
              >
                <div className="space-y-1">
                  <label className="text-[11px] text-muted-foreground uppercase tracking-wide">{t("app.auth.emailLabel", "Email")}</label>
                  <input
                    type="email"
                    value={forgotEmail}
                    onChange={(e) => setForgotEmail(e.target.value)}
                    className="luxury-input w-full rounded-lg py-3 px-4 text-sm"
                    placeholder={t("forms.emailPlaceholder")}
                    autoComplete="email"
                  />
                </div>

                {forgotError && (
                  <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                    {forgotError}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={forgotLoading}
                  className="gold-btn w-full rounded-lg py-3.5 text-sm font-semibold disabled:opacity-70"
                >
                  {forgotLoading
                    ? t("app.auth.sending", "Sending...")
                    : t("app.auth.confirm", "Confirm")}
                </button>

                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="w-full rounded-lg py-3.5 text-sm font-semibold border border-[var(--gold)]/30 text-muted-foreground hover:text-gold transition"
                >
                  {t("app.auth.cancel", "Cancel")}
                </button>
              </form>
            ) : (
              <div className="mt-5 space-y-3 text-center">
                <div className="mx-auto h-12 w-12 rounded-full bg-gradient-gold/20 flex items-center justify-center">
                  <span className="text-[var(--gold)] text-2xl">✓</span>
                </div>
                <h3 className="font-display text-foreground text-xl">{t("app.auth.resetEmailSent", "Check your email")}</h3>
                <p className="text-sm text-muted-foreground">
                  {t(
                    "app.auth.resetEmailSentDesc",
                    "If the email exists, you’ll receive a link to reset your password."
                  )}
                </p>
                <button
                  type="button"
                  onClick={() => setForgotOpen(false)}
                  className="gold-btn w-full rounded-lg py-3.5 text-sm font-semibold"
                >
                  {t("app.auth.done", "Done")}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="gold-btn group w-full rounded-lg py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading ? t("app.auth.signingIn") : t("app.auth.signIn")}
        {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      </button>

      <p className="text-[11px] text-center text-muted-foreground leading-relaxed">
        {t("app.auth.termsAndPrivacy")}
      </p>
    </form>
  );
}
