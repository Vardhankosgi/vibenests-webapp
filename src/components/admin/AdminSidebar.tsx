import { useState } from "react";
import { createPortal } from "react-dom";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/components/auth/AuthContext";
import { authApi } from "@/lib/api";
import { LayoutDashboard, CalendarDays, BedDouble, BarChart2, Settings, LogOut, Menu, Tag, Package, Users, Gift, CreditCard, Star, RotateCcw, Share2 } from "lucide-react";
import { LogoPopover } from "@/components/shared/LogoPopover";
import { useTranslation } from "react-i18next";

const navItemKeys: { [key: string]: string } = {
  "Refunds": "refunds",
  "Transactions": "transactions",
  "Dashboard": "dashboard",
  "Bookings": "bookings",
  "Suite Booking": "suiteBooking",
  "Suites": "suites",
  "Add-on Management": "addonManagement",
  "Celebration Packages": "celebrationMembership",
  "User Management": "userManagement",
  "Referral Management": "referralManagement",
  "Analytics": "analytics",
  "Offers & Coupon Configurations": "offersRefund",
  "Ratings & Reviews": "ratingsReviews",
  "Settings": "settings",
};

const navItems = [
  { icon: LayoutDashboard, label: "Dashboard", to: "/dashboard" },
  { icon: CalendarDays, label: "Bookings", to: "/bookings" },
  { icon: CreditCard, label: "Transactions", to: "/transactions" },
  { icon: BarChart2, label: "Analytics", to: "/analytics" },
  { icon: RotateCcw, label: "Refunds", to: "/refunds" },
  { icon: Users, label: "User Management", to: "/customers" },
  { icon: BedDouble, label: "Suites", to: "/rooms" },
  { icon: Package, label: "Add-on Management", to: "/addons" },
  { icon: Gift, label: "Celebration Packages", to: "/celebration-memberships" },
  { icon: Share2, label: "Referral Management", to: "/referrals" },
  { icon: Tag, label: "Offers & Coupon Configurations", to: "/offers" },
  { icon: Star, label: "Ratings & Reviews", to: "/reviews" },
  { icon: Settings, label: "Settings", to: "/settings" },
];

interface AdminSidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

export function AdminSidebar({ collapsed, onToggle }: AdminSidebarProps) {
  const [showConfirm, setShowConfirm] = useState(false);
  const navigate = useNavigate();
  const { clearSession } = useAuth();
  const { t } = useTranslation();
  return (
    <>
      <aside
        className={`flex flex-col h-screen sticky top-0 bg-[oklch(0.11_0.025_260)] border-r border-[var(--gold)]/10 transition-all duration-300 ${collapsed ? "w-16" : "w-64"
          }`}
      >
        {/* Brand + Toggle */}
        <div className="flex items-center justify-between px-3 py-4 border-b border-[var(--gold)]/10 min-h-[64px]">
          {!collapsed && (
            <div className="flex items-center gap-3 overflow-hidden">
              <LogoPopover className="h-16 w-16 object-contain shrink-0" />
              <div className="leading-tight">
                <div className="font-display text-xs font-semibold tracking-[0.15em] text-gradient-gold">VIBENESTS</div>
                <div className="text-[9px] tracking-widest text-muted-foreground uppercase">{t("app.admin.adminPanel", "Admin Panel")}</div>
              </div>
            </div>
          )}
          <button
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className={`h-8 w-8 flex items-center justify-center rounded-lg hover:bg-white/[0.07] text-muted-foreground hover:text-gold transition shrink-0 cursor-pointer ${collapsed ? "mx-auto" : ""}`}
          >
            <Menu className="h-4 w-4" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto custom-scrollbar">
          {navItems.map(({ icon: Icon, label, to }) => {
            const transKey = navItemKeys[label];
            const translatedLabel = transKey ? t("app.admin." + transKey, label) : label;
            return (
              <NavLink
                key={to}
                to={to}
                title={collapsed ? translatedLabel : undefined}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm transition-all ${collapsed ? "justify-center" : ""
                  } ${isActive
                    ? "bg-[var(--gold)]/10 text-gold border border-[var(--gold)]/20"
                    : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                  }`
                }
              >
                <Icon className="h-4 w-4 shrink-0" />
                {!collapsed && <span>{translatedLabel}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* Logout */}
        <div className="px-2 py-4 border-t border-[var(--gold)]/10">
          <button
            onClick={() => setShowConfirm(true)}
            title={collapsed ? t("app.admin.logout", "Logout") : undefined}
            className={`flex items-center gap-3 px-2.5 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-all w-full ${collapsed ? "justify-center" : ""
              }`}
          >
            <LogOut className="h-4 w-4 shrink-0" />
            {!collapsed && <span>{t("app.admin.logout", "Logout")}</span>}
          </button>
        </div>
      </aside>

      {/* Confirm Dialog — rendered via portal to escape aside stacking context */}
      {showConfirm && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm mx-4 border border-[var(--gold)]/20">
            <h3 className="font-display text-xl text-foreground mb-2">{t("app.admin.confirmLogout", "Confirm Logout")}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t("app.admin.confirmLogoutText", "Are you sure you want to logout?")}</p>
            <div className="flex gap-3">
              <button
                onClick={async () => {
                  const rt = localStorage.getItem('refreshToken');
                  if (rt) await authApi.logout(rt).catch(() => { });
                  clearSession();
                  setShowConfirm(false);
                  navigate("/login");
                }}
                className="gold-btn flex-1 rounded-lg py-2.5 text-sm font-semibold"
              >
                {t("app.admin.yesLogout", "Yes, Logout")}
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="flex-1 rounded-lg py-2.5 text-sm font-medium border border-white/10 text-muted-foreground hover:text-foreground hover:border-white/20 transition"
              >
                {t("app.admin.cancel", "Cancel")}
              </button>
            </div>
          </div>
        </div>,
        document.body
      )}
    </>
  );
}
