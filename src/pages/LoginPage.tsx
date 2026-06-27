import { Shield, User, UserPlus } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { AuthCard } from "@/components/auth/AuthCard";
import { HeroPanel } from "@/components/auth/HeroPanel";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import loginbg from "@/assets/loginbg.png";

export default function LoginPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();

  return (
    <main
      className="h-screen w-full grid lg:grid-cols-2 relative overflow-auto bg-cover bg-center auth-scrollbar-none"
      style={{ backgroundImage: `url(${loginbg})` }}
    >
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />

      {/* Top-right buttons */}
      <div className="absolute top-5 right-5 z-20 flex items-center gap-2">
        <LanguageSelector />
        {/* <button
          onClick={() => navigate("/user/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-white/20 bg-black/40 backdrop-blur-sm text-white text-sm font-semibold hover:bg-white/10 hover:border-white/40 transition-all"
        >
          <User className="h-4 w-4" />
          {t("app.auth.userDashboardLink", "User Dashboard")}
        </button> */}
        {/* <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--gold)]/40 bg-black/40 backdrop-blur-sm text-gold text-sm font-semibold hover:bg-[var(--gold)]/15 hover:border-[var(--gold)]/70 transition-all"
        >
          <Shield className="h-4 w-4" />
          {t("app.auth.adminLink", "Admin")}
        </button> */}
        {/* <button
          onClick={() => navigate("/admin/register")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--gold)]/40 bg-black/40 backdrop-blur-sm text-gold text-sm font-semibold hover:bg-[var(--gold)]/15 hover:border-[var(--gold)]/70 transition-all"
        >
          <UserPlus className="h-4 w-4" />
          {t("app.auth.adminRegisterLink", "Admin Register")}
        </button> */}
      </div>

      {/* Left - Hero Panel */}
      <div className="flex items-center relative z-10 py-8 lg:py-0">
        <HeroPanel onSignUp={() => navigate("/register")} />
      </div>

      {/* Right - Auth Card */}
      <div className="flex items-center justify-center px-4 py-16 relative z-10">
        <div className="w-full max-w-md">
          <AuthCard />
        </div>
      </div>
    </main>
  );
}

