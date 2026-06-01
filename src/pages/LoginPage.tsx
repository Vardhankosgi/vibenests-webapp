import { useNavigate } from "react-router-dom";
import { Shield } from "lucide-react";
import { AuthCard } from "@/components/auth/AuthCard";
import { HeroPanel } from "@/components/auth/HeroPanel";
import loginbg from "@/assets/loginbg.png";

export default function LoginPage() {
  const navigate = useNavigate();

  return (
    <main
      className="min-h-screen grid lg:grid-cols-2 relative"
      style={{ backgroundImage: `url(${loginbg})`, backgroundSize: "cover", backgroundPosition: "center", backgroundAttachment: "fixed" }}
    >
      <div className="absolute inset-0 bg-black/55 pointer-events-none" />

      {/* Admin button — top right corner */}
      <div className="absolute top-5 right-5 z-20">
        <button
          onClick={() => navigate("/dashboard")}
          className="flex items-center gap-2 px-4 py-2 rounded-xl border border-[var(--gold)]/40 bg-black/40 backdrop-blur-sm text-gold text-sm font-semibold hover:bg-[var(--gold)]/15 hover:border-[var(--gold)]/70 transition-all"
        >
          <Shield className="h-4 w-4" />
          Admin
        </button>
      </div>

      {/* Left - Hero Panel */}
      <div className="hidden lg:flex items-center relative z-10">
        <HeroPanel onSignUp={() => {}} />
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
