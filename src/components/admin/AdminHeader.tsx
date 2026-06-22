import { useState } from "react";
import { Bell, Search, ChevronDown, User, Settings, LogOut, Menu } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { createPortal } from "react-dom";
import { NotificationPanel, type Notification } from "./NotificationPanel";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { useTranslation } from "react-i18next";
import { useSidebar } from "@/components/admin/SidebarContext";

const titleKeys: { [key: string]: string } = {
  "Transactions": "transactions",
  "Dashboard": "dashboard",
  "Bookings": "bookings",
  "Suites": "suites",
  "Settings": "settings",
  "Revenue": "revenue",
  "Packages": "packages",
  "Offers & Coupon Configurations": "offersRefund",
  "Customers": "userManagement",
  "Celebration Memberships": "celebrationMembership",
  "Avg. Booking Value": "avgBookingValue",
  "Analytics": "analytics",
  "Add-on Management": "addonManagement",
  "Suite Booking": "suiteBooking",
};

interface AdminHeaderProps {
  title: string;
}

export function AdminHeader({ title }: AdminHeaderProps) {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showLogout, setShowLogout] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifications, setNotifications] = useState<Notification[] | undefined>(undefined);
  const navigate = useNavigate();
  const { t } = useTranslation();

  function handleMarkAllRead() {
    // TODO: call API then update state
    setNotifications((prev) =>
      (prev ?? []).map((n) => ({ ...n, read: true }))
    );
  }

  function handleMarkRead(id: string) {
    // TODO: call API then update state
    setNotifications((prev) =>
      (prev ?? []).map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }

  // Derive unread count from controlled state (falls back to mock count = 3)
  const unreadCount = notifications ? notifications.filter((n) => !n.read).length : 3;

  const { setMobileOpen } = useSidebar();

  const transKey = titleKeys[title];
  const translatedTitle = transKey ? t("app.admin." + transKey, title) : title;

  return (
    <>
      <header className="flex items-center justify-between px-4 sm:px-6 py-4 border-b border-[var(--gold)]/10 bg-[oklch(0.11_0.025_260)]">
        {/* Left: Page Title & Mobile Drawer toggle */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(true)}
            className="lg:hidden h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--gold)]/20 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/50 transition cursor-pointer"
            aria-label="Open menu"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="font-display text-2xl font-medium text-foreground">{translatedTitle}</h1>
        </div>

        <div className="flex items-center gap-3">
          {/* Search */}
          <div className="relative hidden sm:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
            <input
              type="text"
              placeholder={t("app.admin.search", "Search...")}
              className="luxury-input rounded-lg pl-9 pr-4 py-2 text-sm w-52"
            />
          </div>

          {/* Language Switcher */}
          <LanguageSelector />

          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setNotifOpen((o) => !o)}
              className="relative h-9 w-9 flex items-center justify-center rounded-lg border border-[var(--gold)]/20 hover:border-[var(--gold)]/50 transition"
            >
              <Bell className="h-4 w-4 text-muted-foreground" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 h-4 w-4 rounded-full bg-gold text-[9px] font-bold text-[oklch(0.12_0.02_260)] flex items-center justify-center">
                  {unreadCount > 9 ? "9+" : unreadCount}
                </span>
              )}
            </button>
            <NotificationPanel
              open={notifOpen}
              onClose={() => setNotifOpen(false)}
              notifications={notifications}
              onMarkAllRead={handleMarkAllRead}
              onMarkRead={handleMarkRead}
            />
          </div>

          {/* User dropdown */}
          <div className="relative">
            <button
              onClick={() => setDropdownOpen((o) => !o)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg border border-[var(--gold)]/20 hover:border-[var(--gold)]/50 transition"
            >
              <div className="h-7 w-7 rounded-full bg-gradient-to-br from-[var(--gold)] to-[var(--gold-deep)] flex items-center justify-center text-xs font-bold text-[oklch(0.12_0.02_260)]">
                A
              </div>
              <span className="text-sm text-foreground hidden sm:block">Admin</span>
              <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${dropdownOpen ? "rotate-180" : ""}`} />
            </button>

            {dropdownOpen && (
              <div className="absolute right-0 mt-2 w-44 glass-card rounded-xl border border-[var(--gold)]/15 py-1 z-50">
                <div className="px-4 py-2 border-b border-white/[0.06]">
                  <p className="text-xs font-medium text-foreground">{t("app.admin.adminUser", "Admin User")}</p>
                  <p className="text-[11px] text-muted-foreground">admin@vibenests.com</p>
                </div>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition">
                  <User className="h-3.5 w-3.5" /> {t("app.admin.profile", "Profile")}
                </button>
                <button className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-foreground hover:bg-white/[0.04] transition">
                  <Settings className="h-3.5 w-3.5" /> {t("app.admin.settings", "Settings")}
                </button>
                <div className="h-px bg-white/[0.06] my-1" />
                <button
                  onClick={() => { setDropdownOpen(false); setShowLogout(true); }}
                  className="flex items-center gap-2 w-full px-4 py-2 text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"
                >
                  <LogOut className="h-3.5 w-3.5" /> {t("app.admin.logout", "Logout")}
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* Logout confirm portal */}
      {showLogout && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="glass-card rounded-2xl p-6 w-full max-w-sm mx-4 border border-[var(--gold)]/20">
            <h3 className="font-display text-xl text-foreground mb-2">{t("app.admin.confirmLogout", "Confirm Logout")}</h3>
            <p className="text-sm text-muted-foreground mb-6">{t("app.admin.confirmLogoutText", "Are you sure you want to logout?")}</p>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowLogout(false); navigate("/login"); }}
                className="gold-btn flex-1 rounded-lg py-2.5 text-sm font-semibold"
              >
                {t("app.admin.yesLogout", "Yes, Logout")}
              </button>
              <button
                onClick={() => setShowLogout(false)}
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
