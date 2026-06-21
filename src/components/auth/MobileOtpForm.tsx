import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, CheckCircle2, ArrowRight } from "lucide-react";
import { authApi } from "@/lib/api";
import { useAuth } from "./AuthContext";
import { useTranslation } from "react-i18next";

const COUNTRY_CODES = ["+91", "+1", "+44", "+61", "+971", "+65"];

export function MobileOtpForm() {
  const navigate = useNavigate();
  const { saveSession } = useAuth();
  const { t } = useTranslation();
  const [code, setCode] = useState("+91");
  const [mobile, setMobile] = useState("");
  const [stage, setStage] = useState<"input" | "otp" | "success">("input");
  const [otp, setOtp] = useState<string[]>(Array(6).fill(""));
  const [timer, setTimer] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const inputsRef = useRef<Array<HTMLInputElement | null>>([]);

  useEffect(() => {
    if (timer <= 0) return;
    const t = setInterval(() => setTimer((v) => v - 1), 1000);
    return () => clearInterval(t);
  }, [timer]);

  async function sendOtp(e?: React.FormEvent) {
    e?.preventDefault();
    setError(null);
    if (!/^\d{7,15}$/.test(mobile)) {
      setError("Please enter a valid mobile number.");
      return;
    }
    setLoading(true);
    try {
      await authApi.sendOtp(`${code}${mobile}`);
      setOtp(Array(6).fill(""));
      setStage("otp");
      setTimer(30);
      setTimeout(() => inputsRef.current[0]?.focus(), 50);
    } catch (err: any) {
      setError(err.message || "Failed to send OTP.");
    } finally {
      setLoading(false);
    }
  }

  function handleOtpChange(i: number, v: string) {
    const d = v.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[i] = d;
    setOtp(next);
    if (d && i < 5) inputsRef.current[i + 1]?.focus();
  }

  function handleKey(i: number, e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Backspace" && !otp[i] && i > 0) inputsRef.current[i - 1]?.focus();
  }

  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (otp.join("").length !== 6) {
      setError("Please enter the full 6-digit code.");
      return;
    }
    setLoading(true);
    try {
      const data = await authApi.verifyOtp(`${code}${mobile}`, otp.join(""));
      saveSession(data.accessToken, data.refreshToken, data.user as any);
      setStage("success");
      const dest = (data.user as any).role === 'admin' ? '/dashboard' : '/user/dashboard';
      setTimeout(() => navigate(dest), 1200);
    } catch (err: any) {
      setError(err.message || "OTP verification failed.");
    } finally {
      setLoading(false);
    }
  }

  if (stage === "success") {
    return (
      <div className="text-center py-8 space-y-3 animate-in fade-in duration-500">
        <div className="mx-auto h-14 w-14 rounded-full bg-gradient-gold flex items-center justify-center">
          <CheckCircle2 className="h-7 w-7 text-[oklch(0.14_0.03_260)]" />
        </div>
        <h3 className="font-display text-2xl text-gradient-gold">{t("app.auth.verified")}</h3>
        <p className="text-sm text-muted-foreground">{t("app.auth.welcomeBackRedirect")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={stage === "input" ? sendOtp : verify} className="space-y-5">
      <div className="space-y-2">
        <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("app.auth.mobileLabel")}</label>
        <div className="flex gap-2">
          <select
            value={code}
            onChange={(e) => setCode(e.target.value)}
            disabled={stage !== "input"}
            className="luxury-input rounded-lg px-3 py-3 text-sm text-white bg-[oklch(0.18_0.035_260)]"
          >
            {COUNTRY_CODES.map((c) => (
              <option key={c} value={c} className="bg-[oklch(0.18_0.035_260)] text-white">{c}</option>
            ))}
          </select>
          <div className="relative flex-1">
            <Phone className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-gold/70" />
            <input
              type="tel"
              value={mobile}
              onChange={(e) => setMobile(e.target.value.replace(/\D/g, ""))}
              disabled={stage !== "input"}
              placeholder={t("app.auth.phonePlaceholder", "Enter your phone number")}
              className="luxury-input w-full rounded-lg pl-11 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 disabled:opacity-70"
            />
          </div>
        </div>
      </div>

      {stage === "otp" && (
        <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-500">
          <label className="text-xs font-medium tracking-wide text-muted-foreground uppercase">{t("app.auth.otpLabel")}</label>
          <div className="flex justify-between gap-2">
            {otp.map((d, i) => (
              <input
                key={i}
                ref={(el) => { inputsRef.current[i] = el; }}
                value={d}
                onChange={(e) => handleOtpChange(i, e.target.value)}
                onKeyDown={(e) => handleKey(i, e)}
                inputMode="numeric"
                maxLength={1}
                className="luxury-input h-12 w-full rounded-lg text-center text-lg font-display font-semibold text-foreground"
              />
            ))}
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {t("app.auth.otpSent")} <span className="text-foreground">Your email id</span>
            </span>
            {timer > 0 ? (
              <span className="text-muted-foreground">{t("app.auth.resendIn", { timer })}</span>
            ) : (
              <button type="button" onClick={() => sendOtp()} className="text-gold hover:underline underline-offset-4">
                {t("app.auth.resendOtp")}
              </button>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="text-xs text-destructive bg-destructive/10 border border-destructive/30 rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="gold-btn group w-full rounded-lg py-3.5 text-sm font-semibold flex items-center justify-center gap-2 disabled:opacity-70"
      >
        {loading 
          ? (stage === "input" ? t("app.auth.sending") : t("app.auth.verifying")) 
          : (stage === "input" ? t("app.auth.sendOtp") : t("app.auth.verifyOtp"))}
        {!loading && <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />}
      </button>
    </form>
  );
}
