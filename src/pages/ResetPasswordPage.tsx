import { useState, useEffect } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Eye, EyeOff, Lock, CheckCircle2, AlertTriangle, Loader2 } from "lucide-react";
import { useTranslation } from "react-i18next";
import { authApi } from "@/lib/api";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { BrandMark } from "@/components/auth/BrandMark";
import loginbg from "@/assets/loginbg.png";

export default function ResetPasswordPage() {
  const [params] = useSearchParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [showCf, setShowCf] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  // Token verification states
  const [verifying, setVerifying] = useState(true);
  const [tokenValid, setTokenValid] = useState(false);
  const [userEmail, setUserEmail] = useState("");

  useEffect(() => {
    async function checkToken() {
      if (!token) {
        setTokenValid(false);
        setVerifying(false);
        return;
      }
      try {
        const res = await authApi.verifyResetToken(token);
        setTokenValid(res.valid);
        if (res.email) {
          setUserEmail(res.email);
        }
      } catch (err) {
        setTokenValid(false);
      } finally {
        setVerifying(false);
      }
    }
    checkToken();
  }, [token]);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);

    if (password.length < 8) {
      setError(t("app.validation.passwordMin", "Password must be at least 8 characters."));
      return;
    }
    if (!/[A-Z]/.test(password)) {
      setError(t("app.validation.passwordUpper", "Password must contain at least one uppercase letter."));
      return;
    }
    if (!/[0-9]/.test(password)) {
      setError(t("app.validation.passwordNumber", "Password must contain at least one number."));
      return;
    }
    if (password !== confirm) {
      setError(t("app.validation.passwordMismatch", "Passwords do not match."));
      return;
    }
    if (!token) {
      setError(t("app.validation.invalidToken", "Invalid or missing reset token."));
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword(token, password);
      setDone(true);
      setTimeout(() => navigate("/login"), 2500);
    } catch (err: any) {
      setError(err.message || t("app.validation.resetFailed", "Failed to set password. The link may have expired."));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main
      className="min-h-screen flex items-center justify-center px-4 relative bg-scroll lg:bg-fixed"
      style={{ backgroundImage: `url(${loginbg})`, backgroundSize: "cover", backgroundPosition: "center" }}
    >
      <div className="absolute inset-0 bg-black/60 pointer-events-none" />

      {/* Top-right language switcher */}
      <div className="absolute top-5 right-5 z-20">
        <LanguageSelector />
      </div>

      <div className="relative z-10 glass-card rounded-2xl p-8 w-full max-w-md border border-[var(--gold)]/20">
        {/* Logo */}
        <div className="flex justify-center mb-6">
          <BrandMark />
        </div>
        {verifying ? (
          <div className="text-center py-12 space-y-4 flex flex-col items-center justify-center">
            <Loader2 className="h-10 w-10 text-gold animate-spin" />
            <p className="text-sm text-muted-foreground">{t("app.auth.verifyingToken", "Verifying your security link...")}</p>
          </div>
        ) : !tokenValid ? (
          <div className="text-center space-y-5 py-4 animate-in fade-in duration-500">
            <div className="mx-auto h-14 w-14 rounded-full bg-destructive/10 border border-destructive/20 flex items-center justify-center">
              <AlertTriangle className="h-7 w-7 text-destructive" />
            </div>
            <h2 className="font-display text-2xl text-destructive font-semibold">
              {t("app.auth.invalidResetTitle", "Invalid or Expired Link")}
            </h2>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {t("app.auth.invalidResetDesc", "This password reset link is invalid, has expired, or has already been used. Please request a new link.")}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={() => navigate("/forgot-password")}
                className="gold-btn w-full rounded-lg py-3.5 text-sm font-semibold"
              >
                {t("app.auth.requestNewLink", "Request New Link")}
              </button>
              <button
                onClick={() => navigate("/login")}
                className="w-full rounded-lg py-3.5 text-sm font-semibold border border-[var(--gold)]/30 text-muted-foreground hover:text-gold transition-colors bg-transparent"
              >
                {t("app.auth.backToLogin", "Back to Login")}
              </button>
            </div>
          </div>
        ) : done ? (
          <div className="text-center space-y-4 py-4 animate-in fade-in duration-500">
            <div className="mx-auto h-14 w-14 rounded-full bg-gradient-gold flex items-center justify-center">
              <CheckCircle2 className="h-7 w-7 text-[oklch(0.14_0.03_260)]" />
            </div>
            <h2 className="font-display text-2xl text-gradient-gold">{t("app.auth.resetSuccessTitle", "Password Set!")}</h2>
            <p className="text-sm text-muted-foreground">{t("app.auth.resetSuccessDesc", "Your password has been successfully updated. Redirecting to login...")}</p>
          </div>
        ) : (
          <>
            <div className="mb-6">
              <h2 className="font-display text-2xl text-foreground mb-1">{t("app.auth.resetTitle", "Set Your Password")}</h2>
              <p className="text-sm text-muted-foreground">
                {userEmail 
                  ? t("app.auth.resetDescWithEmail", "Choose a new password for {{email}}.", { email: userEmail })
                  : t("app.auth.resetDesc", "Create a secure password for your VibeNests account.")
                }
              </p>
            </div>

            <form onSubmit={submit} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground uppercase tracking-wide">{t("app.auth.newPassword", "New Password")}</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
                  <input
                    type={showPw ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder={t("app.auth.resetPasswordPlaceholder", "Min 8 chars, 1 uppercase, 1 number")}
                    className="luxury-input w-full rounded-lg pl-11 pr-11 py-3 text-sm"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition p-1">
                    {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-muted-foreground uppercase tracking-wide">{t("app.auth.confirmPassword", "Confirm Password")}</label>
                <div className="relative">
                  <Lock className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
                  <input
                    type={showCf ? "text" : "password"}
                    value={confirm}
                    onChange={(e) => setConfirm(e.target.value)}
                    placeholder={t("app.auth.confirmPlaceholder", "Re-enter your password")}
                    className="luxury-input w-full rounded-lg pl-11 pr-11 py-3 text-sm"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowCf((s) => !s)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-gold transition p-1">
                    {showCf ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </button>
                </div>
              </div>

              <ul className="text-[11px] text-muted-foreground space-y-0.5 pl-1">
                <li className={password.length >= 8 ? "text-emerald-400" : ""}>✓ {t("app.auth.reqLength", "At least 8 characters")}</li>
                <li className={/[A-Z]/.test(password) ? "text-emerald-400" : ""}>✓ {t("app.auth.reqUpper", "One uppercase letter")}</li>
                <li className={/[0-9]/.test(password) ? "text-emerald-400" : ""}>✓ {t("app.auth.reqNumber", "One number")}</li>
                <li className={confirm.length > 0 && password === confirm ? "text-emerald-400" : ""}>✓ {t("app.auth.reqMatch", "Passwords match")}</li>
              </ul>

              {error && (
                <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="gold-btn w-full rounded-lg py-3.5 text-sm font-semibold disabled:opacity-70 mt-1"
              >
                {loading ? t("app.auth.saving", "Saving...") : t("app.auth.setBtn", "Set Password")}
              </button>
            </form>
          </>
        )}
      </div>
    </main>
  );
}
