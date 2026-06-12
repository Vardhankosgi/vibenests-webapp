import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard, CalendarDays, Clock, History, Wallet,
  Tag, UserCircle, HelpCircle, LogOut, BedDouble,
  MapPin, ChevronRight, Star, CreditCard, Phone, MessageSquare,
  ArrowUpRight, CheckCircle2, XCircle, Hourglass, Bell,
  Users, Wifi, Tv, Wind, Music, Camera, Coffee, Cake, Sparkles,
  X, Download, AlertTriangle, Receipt, Package, Plus, Edit3, Trash2,
  Search, TrendingUp, TrendingDown, BarChart3, Eye, RefreshCw,
  Building2, Smartphone, DollarSign, ArrowDownLeft, ArrowUpLeft,
  Heart, ChevronLeft, Menu,
} from "lucide-react";
import { useSuitesContext } from "@/components/admin/SuitesContext";
import { bookingsApi, celebrationPackagesApi, usersApi, paymentsApi, offersApi, couponsApi } from "@/lib/api";
import { LanguageSelector } from "@/components/shared/LanguageSelector";
import { useAuth } from "@/components/auth/AuthContext";
import { useTranslation } from "react-i18next";
import i18n from "i18next";

function formatDateStr(dateStr: string, lang: string = i18n.language): string {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return dateStr;
  try {
    return new Intl.DateTimeFormat(lang, {
      month: "short",
      day: "2-digit",
      year: "numeric"
    }).format(d);
  } catch (e) {
    return dateStr;
  }
}

function formatTimeStr(timeStr: string, lang: string = i18n.language): string {
  if (!timeStr) return timeStr;
  const match = timeStr.match(/^(\d+):(\d+)\s*(AM|PM)$/i);
  if (!match) return timeStr;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const isPm = match[3].toUpperCase() === "PM";
  if (isPm && hours < 12) hours += 12;
  if (!isPm && hours === 12) hours = 0;
  const d = new Date();
  d.setHours(hours, minutes, 0, 0);
  try {
    return new Intl.DateTimeFormat(lang, {
      hour: "numeric",
      minute: "2-digit",
      hour12: true
    }).format(d);
  } catch (e) {
    return timeStr;
  }
}

function translateTimelineEvent(event: string, t: any): string {
  if (event === "Booking confirmed & paid") return t("app.userDashboard.eventConfirmedPaid", "Booking confirmed & paid");
  if (event === "Check-in reminder sent") return t("app.userDashboard.eventCheckInReminder", "Check-in reminder sent");
  if (event === "Check-in") return t("app.userDashboard.checkIn", "Check-in");
  if (event === "Check-out") return t("app.userDashboard.checkOut", "Check-out");
  if (event === "Deposit refunded to wallet") return t("app.userDashboard.eventRefundedToWallet", "Deposit refunded to wallet");
  if (event === "Booking cancelled by guest") return t("app.userDashboard.eventCancelledByGuest", "Booking cancelled by guest");
  if (event === "Cancellation processed") return t("app.userDashboard.eventCancellationProcessed", "Cancellation processed");
  return event;
}

function translateCancellationPolicy(policy: string, lang: string, t: any): string {
  if (policy === "Booking completed – cancellation not applicable.") {
    return t("app.userDashboard.policyCompleted", "Booking completed – cancellation not applicable.");
  }
  if (policy.startsWith("Free cancellation until")) {
    if (policy.includes("Jan 21")) {
      return t("app.userDashboard.policyJan21", "Free cancellation until {{date1}}. 50% refund between {{date1}}–{{date2}}. No refund after {{date2}}.", {
        date1: formatDateStr("Jan 21, 2025", lang),
        date2: formatDateStr("Jan 25, 2025", lang)
      });
    }
    if (policy.includes("Mar 03")) {
      return t("app.userDashboard.policyMar03", "Free cancellation until {{date1}}. 30% refund after that. No refund within 48 hrs.", {
        date1: formatDateStr("Mar 03, 2025", lang)
      });
    }
  }
  if (policy.startsWith("Cancelled 2 days before")) {
    return t("app.userDashboard.policyCancelled2Days", "Cancelled 2 days before check-in. 25% refund applied per policy.");
  }
  return policy;
}

function translateTxnDesc(desc: string, t: any): string {
  if (desc.startsWith("Booking Payment –")) {
    const suiteAndId = desc.replace("Booking Payment –", "").trim();
    const parts = suiteAndId.split(" ");
    const id = parts[parts.length - 1];
    const suiteName = parts.slice(0, parts.length - 1).join(" ");
    return t("app.userDashboard.txnDescBookingPayment", "Booking Payment – {{suite}} {{id}}", { suite: suiteName, id });
  }
  if (desc === "Wallet Top-up via UPI") {
    return t("app.userDashboard.txnDescWalletTopUp", "Wallet Top-up via UPI");
  }
  if (desc.startsWith("Refund – Cancelled Booking")) {
    const id = desc.replace("Refund – Cancelled Booking", "").trim();
    return t("app.userDashboard.txnDescRefund", "Refund – Cancelled Booking {{id}}", { id });
  }
  if (desc.startsWith("Advance Payment –")) {
    const suiteAndId = desc.replace("Advance Payment –", "").trim();
    const parts = suiteAndId.split(" ");
    const id = parts[parts.length - 1];
    const suiteName = parts.slice(0, parts.length - 1).join(" ");
    return t("app.userDashboard.txnDescAdvancePayment", "Advance Payment – {{suite}} {{id}}", { suite: suiteName, id });
  }
  if (desc === "Wallet Withdrawal to Bank") {
    return t("app.userDashboard.txnDescWalletWithdrawal", "Wallet Withdrawal to Bank");
  }
  return desc;
}

function translatePaymentMethod(method: string, t: any): string {
  if (method.includes("Credit Card")) {
    return method.replace("Credit Card", t("app.userDashboard.creditCard", "Credit Card"));
  }
  if (method.includes("Debit Card")) {
    return method.replace("Debit Card", t("app.userDashboard.debitCard", "Debit Card"));
  }
  if (method.includes("Wallet") && !method.includes("UPI")) {
    return method.replace("Wallet", t("app.userDashboard.wallet", "Wallet"));
  }
  if (method.startsWith("Bank –")) {
    return method.replace("Bank –", t("app.userDashboard.bank", "Bank") + " –");
  }
  return method;
}

/* ─── Types ─────────────────────────────────────────── */
type NavItem = { id: string; label: string; icon: React.ElementType };
type Booking = {
  id: string; suite: string; location: string; checkIn: string;
  checkOut: string; checkInTime: string; checkOutTime: string;
  nights: number; amount: number;
  status: "confirmed" | "pending" | "completed" | "cancelled";
  image: string;
  _raw?: any;
};
type Transaction = {
  id: string; desc: string; amount: number; type: "credit" | "debit";
  date: string; status: "completed" | "pending" | "failed";
  category: "booking" | "refund" | "topup" | "withdrawal";
  method: string; invoice?: string;
};
type PaymentMethod = {
  id: string; type: "visa" | "mastercard" | "upi" | "bank";
  label: string; last4?: string; isDefault: boolean;
};

/* ─── Nav ────────────────────────────────────────────── */
const NAV_ITEMS: NavItem[] = [
  { id: "dashboard",   label: "Dashboard",        icon: LayoutDashboard },
  { id: "suites",      label: "Browse Suites",     icon: BedDouble },
  { id: "my-bookings", label: "My Bookings",       icon: CalendarDays },
  { id: "upcoming",    label: "Upcoming Bookings", icon: Clock },
  { id: "past",        label: "Past Bookings",     icon: History },
  { id: "wallet",      label: "Wallet & Payments",     icon: Wallet },
  { id: "packages",    label: "Celebration Packages",  icon: Package },
  { id: "offers",      label: "Special Offers & Referrals", icon: Tag },
  { id: "profile",     label: "Profile Settings",  icon: UserCircle },
  { id: "help",        label: "Help & Support",    icon: HelpCircle },
  { id: "write-review", label: "Write a Review",   icon: Star },
];

/* ─── Bookings Data ──────────────────────────────────── */
const UPCOMING_BOOKINGS: Booking[] = [
  { id: "VN-2841", suite: "Royal Penthouse Suite", location: "Mumbai, India",  checkIn: "Jan 28, 2025", checkOut: "Feb 01, 2025", checkInTime: "2:00 PM", checkOutTime: "11:00 AM", nights: 4, amount: 128000, status: "confirmed", image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80" },
  { id: "VN-2965", suite: "Oceanic Deluxe Suite",  location: "Goa, India",     checkIn: "Mar 10, 2025", checkOut: "Mar 14, 2025", checkInTime: "1:00 PM", checkOutTime: "10:00 AM", nights: 4, amount: 64000,  status: "pending",   image: "https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=400&q=80" },
];
const PAST_BOOKINGS: Booking[] = [
  { id: "VN-2210", suite: "Heritage Garden Villa", location: "Jaipur, India",  checkIn: "Oct 05, 2024", checkOut: "Oct 09, 2024", checkInTime: "2:00 PM", checkOutTime: "11:00 AM", nights: 4, amount: 96000, status: "completed",  image: "https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=400&q=80" },
  { id: "VN-2105", suite: "Sky Loft Suite",         location: "Delhi, India",   checkIn: "Aug 15, 2024", checkOut: "Aug 17, 2024", checkInTime: "3:00 PM", checkOutTime: "12:00 PM", nights: 2, amount: 42000, status: "completed",  image: "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=400&q=80" },
  { id: "VN-1998", suite: "Lakefront Pool Suite",   location: "Udaipur, India", checkIn: "Jun 20, 2024", checkOut: "Jun 23, 2024", checkInTime: "2:00 PM", checkOutTime: "11:00 AM", nights: 3, amount: 75000, status: "cancelled", image: "https://images.unsplash.com/photo-1590490360182-c33d57733427?w=400&q=80" },
];

const STATS = [
  { label: "Total Bookings", value: "12",    icon: CalendarDays },
  { label: "Nights Stayed",  value: "38",    icon: BedDouble },
  { label: "Total Spent",    value: "₹5.2L", icon: CreditCard },
  { label: "Loyalty Points", value: "4,820", icon: Star },
];

const QUICK_ACTIONS = [
  { label: "New Booking",       icon: BedDouble,     desc: "Explore & reserve suites" },
  { label: "Modify Booking",    icon: CalendarDays,  desc: "Change dates or room type" },
  { label: "Contact Concierge", icon: Phone,         desc: "24/7 personal assistance" },
  { label: "Raise a Request",   icon: MessageSquare, desc: "Report issues or requests" },
];

/* ─── Wallet Data ────────────────────────────────────── */

const PAYMENT_METHODS: PaymentMethod[] = [
  { id: "PM-01", type: "visa",       label: "HDFC Credit Card",  last4: "4291", isDefault: true  },
  { id: "PM-02", type: "mastercard", label: "ICICI Debit Card",  last4: "7832", isDefault: false },
  { id: "PM-03", type: "upi",        label: "adithya@oksbi",                    isDefault: false },
  { id: "PM-04", type: "bank",       label: "ICICI Bank",        last4: "7832", isDefault: false },
];

/* ─── Status Config ──────────────────────────────────── */
const STATUS_CONFIG = {
  confirmed: { label: "Confirmed", color: "text-emerald-400", bg: "bg-emerald-400/10 border-emerald-400/25", icon: CheckCircle2 },
  pending:   { label: "Pending",   color: "text-amber-400",   bg: "bg-amber-400/10 border-amber-400/25",     icon: Hourglass },
  completed: { label: "Completed", color: "text-sky-400",     bg: "bg-sky-400/10 border-sky-400/25",         icon: CheckCircle2 },
  cancelled: { label: "Cancelled", color: "text-rose-400",    bg: "bg-rose-400/10 border-rose-400/25",       icon: XCircle },
};

function fmt(n: number) {
  return n >= 100000 ? `₹${(n / 100000).toFixed(1)}L` : `₹${(n / 1000).toFixed(0)}K`;
}

/* ─── Booking Extras ─────────────────────────────────── */
const BOOKING_EXTRAS: Record<string, {
  addOns: { name: string; price: number }[];
  paymentMethod: string;
  paymentBreakdown: { label: string; amount: number }[];
  timeline: { date: string; event: string; done: boolean }[];
  cancellationPolicy: string;
  refundInfo: string;
}> = {
  "VN-2841": {
    addOns: [{ name: "Couple Photography", price: 8000 }, { name: "Floral Decoration", price: 5000 }, { name: "Welcome Cake", price: 2000 }],
    paymentMethod: "HDFC Credit Card •••• 4291",
    paymentBreakdown: [{ label: "Suite (4 nights)", amount: 113000 }, { label: "Add-ons", amount: 15000 }, { label: "Taxes & Fees (GST 12%)", amount: 15360 }],
    timeline: [
      { date: "Jan 10, 2025", event: "Booking confirmed",        done: true  },
      { date: "Jan 15, 2025", event: "Advance payment received", done: true  },
      { date: "Jan 27, 2025", event: "Check-in reminder sent",   done: true  },
      { date: "Jan 28, 2025", event: "Check-in",                 done: false },
      { date: "Feb 01, 2025", event: "Check-out",                done: false },
    ],
    cancellationPolicy: "Free cancellation until Jan 21, 2025. 50% refund between Jan 21–25. No refund after Jan 25.",
    refundInfo: "Refunds are processed within 5–7 business days to the original payment method.",
  },
  "VN-2965": {
    addOns: [{ name: "Private Sunset Cruise", price: 12000 }],
    paymentMethod: "UPI – adithya@oksbi",
    paymentBreakdown: [{ label: "Suite (4 nights)", amount: 52000 }, { label: "Add-ons", amount: 12000 }],
    timeline: [
      { date: "Feb 20, 2025", event: "Booking initiated", done: true  },
      { date: "Feb 20, 2025", event: "Payment pending",   done: true  },
      { date: "Mar 10, 2025", event: "Check-in",          done: false },
      { date: "Mar 14, 2025", event: "Check-out",         done: false },
    ],
    cancellationPolicy: "Free cancellation until Mar 03, 2025. 30% refund after that. No refund within 48 hrs.",
    refundInfo: "Pending bookings may be cancelled without charge before payment is fully confirmed.",
  },
  "VN-2210": {
    addOns: [{ name: "Heritage Thali Dinner", price: 6000 }, { name: "Camel Safari", price: 4000 }],
    paymentMethod: "ICICI Debit Card •••• 7832",
    paymentBreakdown: [{ label: "Suite (4 nights)", amount: 86000 }, { label: "Add-ons", amount: 10000 }],
    timeline: [
      { date: "Sep 25, 2024", event: "Booking confirmed",      done: true },
      { date: "Oct 04, 2024", event: "Full payment received",  done: true },
      { date: "Oct 05, 2024", event: "Check-in",               done: true },
      { date: "Oct 09, 2024", event: "Check-out",              done: true },
    ],
    cancellationPolicy: "Booking completed – cancellation not applicable.",
    refundInfo: "This booking has been completed. No refund applicable.",
  },
  "VN-2105": {
    addOns: [],
    paymentMethod: "Paytm Wallet",
    paymentBreakdown: [{ label: "Suite (2 nights)", amount: 42000 }],
    timeline: [
      { date: "Aug 10, 2024", event: "Booking confirmed",     done: true },
      { date: "Aug 14, 2024", event: "Full payment received", done: true },
      { date: "Aug 15, 2024", event: "Check-in",              done: true },
      { date: "Aug 17, 2024", event: "Check-out",             done: true },
    ],
    cancellationPolicy: "Booking completed – cancellation not applicable.",
    refundInfo: "This booking has been completed. No refund applicable.",
  },
  "VN-1998": {
    addOns: [{ name: "Boat Ride", price: 3000 }],
    paymentMethod: "HDFC Credit Card •••• 4291",
    paymentBreakdown: [{ label: "Suite (3 nights)", amount: 72000 }, { label: "Add-ons", amount: 3000 }],
    timeline: [
      { date: "Jun 10, 2024", event: "Booking confirmed",           done: true },
      { date: "Jun 12, 2024", event: "Advance payment received",    done: true },
      { date: "Jun 18, 2024", event: "Booking cancelled by guest",  done: true },
      { date: "Jun 22, 2024", event: "Partial refund processed",    done: true },
    ],
    cancellationPolicy: "Cancelled 2 days before check-in. 25% refund applied per policy.",
    refundInfo: "₹18,750 refunded to HDFC Credit Card •••• 4291 on Jun 22, 2024.",
  },
};

/* ─── Booking Details Drawer ─────────────────────────── */
function BookingDetailsDrawer({ booking, onClose }: { booking: Booking; onClose: () => void }) {
  const { t } = useTranslation();
  const s = STATUS_CONFIG[booking.status];
  const SI = s.icon;
  const extra = BOOKING_EXTRAS[booking.id] || {
    addOns: [],
    paymentMethod: "—",
    paymentBreakdown: [
      { label: "Total", amount: booking.amount || 0 },
    ],
    timeline: [
      { date: booking.checkIn || "", event: "Booking", done: true },
    ],
    cancellationPolicy: "—",
    refundInfo: "—",
  };

  const total = extra.paymentBreakdown.reduce((sum, r) => sum + r.amount, 0);

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.aside
          initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
          transition={{ type: "spring", damping: 28, stiffness: 240 }}
          className="relative z-10 w-full max-w-lg h-full overflow-y-auto glass-card border-l border-white/10 flex flex-col">
          <div className="sticky top-0 z-20 flex items-center justify-between px-6 py-4 border-b border-white/8 bg-[oklch(0.13_0.02_265/0.95)] backdrop-blur-xl">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground tracking-widest">{booking.id}</p>
              <h3 className="font-display text-lg text-foreground leading-tight">{booking.suite}</h3>
            </div>
            <div className="flex items-center gap-3">
              <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${s.bg} ${s.color}`}>
                <SI className="h-3 w-3" />{t("app.userDashboard.status_" + booking.status, s.label)}
              </span>
              <button onClick={onClose} className="h-8 w-8 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 p-6 space-y-6">
            <div className="rounded-2xl overflow-hidden">
              <img src={booking.image} alt={booking.suite} className="w-full h-44 object-cover" />
              <div className="glass rounded-b-2xl p-4 grid grid-cols-2 gap-3 border border-white/8 border-t-0">
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("app.userDashboard.location", "Location")}</p>
                  <p className="flex items-center gap-1 text-sm text-foreground mt-0.5"><MapPin className="h-3 w-3 text-gold/60" />{booking.location}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("app.userDashboard.duration", "Duration")}</p>
                  <p className="text-sm text-foreground mt-0.5">{booking.nights} {t("app.userDashboard.nights", "Nights")}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("app.userDashboard.checkIn", "Check-in")}</p>
                  <p className="text-sm text-foreground mt-0.5">{formatDateStr(booking.checkIn)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("app.userDashboard.checkOut", "Check-out")}</p>
                  <p className="text-sm text-foreground mt-0.5">{formatDateStr(booking.checkOut)}</p>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Package className="h-4 w-4 text-gold" />
                <h4 className="text-sm font-semibold text-foreground">{t("app.userDashboard.selectedAddons", "Selected Add-ons")}</h4>
              </div>
              {extra.addOns.length === 0 ? (
                <p className="text-xs text-muted-foreground">{t("app.userDashboard.noAddons", "No add-ons selected.")}</p>
              ) : (
                <div className="space-y-2">
                  {extra.addOns.map((a) => (
                    <div key={a.name} className="flex items-center justify-between text-sm">
                      <span className="flex items-center gap-2 text-muted-foreground">
                        <Sparkles className="h-3 w-3 text-gold/60" />{a.name}
                      </span>
                      <span className="text-foreground font-medium">₹{a.price.toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-gold" />
                <h4 className="text-sm font-semibold text-foreground">{t("app.userDashboard.paymentDetails", "Payment Details")}</h4>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-muted-foreground">{t("app.userDashboard.method", "Method")}</span>
                <span className="text-foreground">{extra.paymentMethod}</span>
              </div>
              <div className="border-t border-white/8 pt-3 space-y-2">
                {extra.paymentBreakdown.map((r) => (
                  <div key={r.label} className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">{r.label}</span>
                    <span className="text-foreground">₹{r.amount.toLocaleString()}</span>
                  </div>
                ))}
                <div className="border-t border-white/8 pt-2 flex items-center justify-between">
                  <span className="text-sm font-semibold text-foreground">{t("app.userDashboard.totalPaid", "Total Paid")}</span>
                  <span className="font-display text-lg text-gold">₹{total.toLocaleString()}</span>
                </div>
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Clock className="h-4 w-4 text-gold" />
                <h4 className="text-sm font-semibold text-foreground">{t("app.userDashboard.bookingTimeline", "Booking Timeline")}</h4>
              </div>
              <div className="relative pl-5 space-y-4">
                {extra.timeline.map((tVal, i) => (
                  <div key={i} className="relative flex gap-3">
                    <span className={`absolute -left-5 top-0.5 h-3.5 w-3.5 rounded-full border-2 flex items-center justify-center ${tVal.done ? "border-gold bg-gold/20" : "border-white/20 bg-white/5"}`}>
                      {tVal.done && <span className="h-1.5 w-1.5 rounded-full bg-gold" />}
                    </span>
                    {i < extra.timeline.length - 1 && (
                      <span className="absolute -left-[14.5px] top-4 h-full w-px bg-white/10" />
                    )}
                    <div>
                      <p className={`text-sm ${tVal.done ? "text-foreground" : "text-muted-foreground"}`}>{translateTimelineEvent(tVal.event, t)}</p>
                      <p className="text-[11px] text-muted-foreground">{formatDateStr(tVal.date)}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-3">
              <div className="flex items-center gap-2">
                <Receipt className="h-4 w-4 text-gold" />
                <h4 className="text-sm font-semibold text-foreground">{t("app.userDashboard.invoice", "Invoice")}</h4>
              </div>
              <p className="text-xs text-muted-foreground">{t("app.userDashboard.invoiceDesc", "Invoice #{{id}}-INV · Generated on booking confirmation", { id: booking.id })}</p>
              <button
                onClick={() => alert(`Invoice for ${booking.id} would download here.`)}
                className="flex items-center gap-2 px-4 py-2 rounded-xl border border-gold/30 bg-gold/8 text-gold text-sm hover:bg-gold/15 transition-colors w-full justify-center">
                <Download className="h-4 w-4" /> {t("app.userDashboard.downloadInvoicePdf", "Download Invoice PDF")}
              </button>
            </div>

            <div className="glass-card rounded-2xl p-4 space-y-3 border-rose-500/20">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-rose-400" />
                <h4 className="text-sm font-semibold text-foreground">{t("app.userDashboard.cancellationRefund", "Cancellation & Refund")}</h4>
              </div>
              <div className="space-y-2">
                <div className="bg-rose-500/8 rounded-xl p-3">
                  <p className="text-xs text-rose-300/90 leading-relaxed">{translateCancellationPolicy(extra.cancellationPolicy, i18n.language, t)}</p>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{extra.refundInfo}</p>
              </div>
              {(booking.status === "confirmed" || booking.status === "pending") && (
                <button className="flex items-center gap-2 px-4 py-2 rounded-xl border border-rose-500/30 bg-rose-500/8 text-rose-400 text-sm hover:bg-rose-500/15 transition-colors w-full justify-center">
                  <XCircle className="h-4 w-4" /> {t("app.userDashboard.requestCancellation", "Request Cancellation")}
                </button>
              )}
            </div>
          </div>
        </motion.aside>
      </div>
    </AnimatePresence>
  );
}

/* ─── Booking Card ───────────────────────────────────── */
function BookingCard({ b, onViewDetails }: { b: Booking; onViewDetails: (b: Booking) => void }) {
  const { t } = useTranslation();
  const s = STATUS_CONFIG[b.status];
  const SI = s.icon;
  const [joinLoading, setJoinLoading] = useState(false);
  const [joinError, setJoinError] = useState("");

  async function handleJoinNow() {
    // Extract numeric id from "VN-123" or use _raw.id directly
    const rawId = b._raw?.id ?? Number(String(b.id).replace(/^VN-/, ""));
    if (!rawId) { setJoinError("Invalid booking ID"); return; }
    const tab = window.open("", "_blank");
    try {
      setJoinLoading(true);
      setJoinError("");
      const { meeting_link } = await bookingsApi.getMeetingLink(rawId);
      if (tab && !tab.closed) {
        tab.location.href = meeting_link;
      } else {
        const a = document.createElement("a");
        a.href = meeting_link;
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }
    } catch (e: any) {
      tab?.close();
      setJoinError(e?.message || "Failed to get meeting link");
    } finally {
      setJoinLoading(false);
    }
  }

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col sm:flex-row gap-0 hover:border-gold/30 transition-colors">
      <img src={b.image} alt={b.suite} className="w-full sm:w-36 h-40 sm:h-auto object-cover shrink-0" />
      <div className="flex-1 p-5 flex flex-col justify-between gap-3">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-xs text-muted-foreground font-mono tracking-wider">{b.id}</p>
            <h4 className="font-display text-lg text-foreground leading-tight mt-0.5">{b.suite}</h4>
            <p className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
              <MapPin className="h-3 w-3 text-gold/60" />{b.location}
            </p>
          </div>
          <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[11px] font-semibold ${s.bg} ${s.color} shrink-0`}>
            <SI className="h-3 w-3" />{t("app.userDashboard.status_" + b.status, s.label)}
          </span>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-col gap-1 text-xs text-muted-foreground">
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-gold/60" />
              <span>{t("app.userDashboard.checkIn", "Check-in")}: <span className="text-foreground">{formatDateStr(b.checkIn)}</span> · <span className="text-gold">{formatTimeStr(b.checkInTime)}</span></span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-3 w-3 text-muted-foreground/40" />
              <span>{t("app.userDashboard.checkOut", "Check-out")}: <span className="text-foreground">{formatDateStr(b.checkOut)}</span> · <span className="text-muted-foreground">{formatTimeStr(b.checkOutTime)}</span></span>
            </div>
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="flex items-center gap-3">
              <span className="font-display text-xl text-foreground">{fmt(b.amount)}</span>
              <button onClick={() => onViewDetails(b)} className="flex items-center gap-1 text-xs text-gold hover:text-gold/80 transition-colors">
                {t("app.userDashboard.viewDetails", "View Details")} <ChevronRight className="h-3 w-3" />
              </button>
              {b.status === "confirmed" && (
                <button
                  disabled={joinLoading}
                  onClick={handleJoinNow}
                  className="flex items-center gap-1 text-xs px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/25 text-emerald-400 hover:bg-emerald-400/20 transition-colors disabled:opacity-50"
                >
                  {joinLoading ? t("app.userDashboard.opening", "Opening...") : t("app.userDashboard.joinNow", "Join Now")}
                </button>
              )}
            </div>
            {joinError && <p className="text-[11px] text-destructive">{joinError}</p>}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

/* ─── Amenity Icons ──────────────────────────────────── */
const AMENITY_ICONS: Record<string, React.ElementType> = {
  WiFi: Wifi, "Smart TV": Tv, AC: Wind, "Music System": Music,
  Photography: Camera, "Welcome Drinks": Coffee, Cake, Decoration: Sparkles,
};

/* ─── Suite Card ─────────────────────────────────────── */
function SuiteCard({ suite, index, onBookNow }: { suite: ReturnType<typeof useSuitesContext>["suites"][0]; index: number; onBookNow?: () => void }) {
  const { t } = useTranslation();
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: index * 0.07 }}
      className="glass-card rounded-2xl overflow-hidden flex flex-col hover:border-gold/30 transition-colors group">
      {suite.images.length > 0 ? (
        <div className="relative h-44 overflow-hidden">
          <img src={suite.images[0]} alt={suite.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${suite.status === "Active" ? "bg-emerald-400/15 border-emerald-400/30 text-emerald-400" : "bg-amber-400/15 border-amber-400/30 text-amber-400"}`}>{suite.status}</span>
        </div>
      ) : (
        <div className="h-44 bg-white/[0.03] flex items-center justify-center border-b border-white/5 relative">
          <BedDouble className="h-12 w-12 text-gold/20" />
          <span className={`absolute top-3 right-3 px-2.5 py-1 rounded-full text-[10px] font-bold border ${suite.status === "Active" ? "bg-emerald-400/15 border-emerald-400/30 text-emerald-400" : "bg-amber-400/15 border-amber-400/30 text-amber-400"}`}>{suite.status}</span>
        </div>
      )}
      <div className="p-5 flex flex-col gap-3 flex-1">
        <div>
          <p className="text-[10px] font-mono text-muted-foreground tracking-wider">{suite.id}</p>
          <h4 className="font-display text-lg text-foreground leading-tight mt-0.5">{suite.name}</h4>
          {suite.occasions && <p className="text-xs text-gold/80 mt-0.5">{suite.occasions}</p>}
        </div>
        {suite.description && <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{suite.description}</p>}
        <div className="grid grid-cols-2 gap-2">
          <div className="bg-white/[0.03] rounded-xl px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("app.userDashboard.capacity", "Capacity")}</p>
            <div className="flex items-center gap-1 mt-0.5">
              <Users className="h-3 w-3 text-gold/60" />
              <span className="text-sm text-foreground font-medium">{suite.capacity} {t("app.userDashboard.guests", "guests")}</span>
            </div>
          </div>
          <div className="bg-white/[0.03] rounded-xl px-3 py-2">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{t("app.userDashboard.priceNight", "Price / night")}</p>
            <p className="text-sm text-gold font-medium mt-0.5">{suite.price}</p>
          </div>
        </div>
        {suite.amenities.length > 0 && (
          <div className="flex flex-wrap gap-1.5">
            {suite.amenities.slice(0, 5).map((a) => {
              const Icon = AMENITY_ICONS[a] ?? Sparkles;
              return (
                <span key={a} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/8 border border-gold/15 text-[10px] text-gold/80">
                  <Icon className="h-2.5 w-2.5" />{a}
                </span>
              );
            })}
            {suite.amenities.length > 5 && (
              <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-muted-foreground">+{suite.amenities.length - 5}</span>
            )}
          </div>
        )}
        <button onClick={onBookNow} className="mt-auto gold-btn rounded-xl py-2 text-xs font-semibold flex items-center justify-center gap-1.5">
          {t("app.userDashboard.bookNow", "Book Now")} <ChevronRight className="h-3.5 w-3.5" />
        </button>
      </div>
    </motion.div>
  );
}

/* ─── Transaction Details Modal ──────────────────────── */
function TransactionModal({ txn, onClose }: { txn: Transaction; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
          className="relative z-10 w-full max-w-lg glass-card rounded-2xl p-6 space-y-5">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-mono text-muted-foreground tracking-widest">{txn.id}</p>
              <h3 className="font-display text-xl text-foreground mt-1">{translateTxnDesc(txn.desc, t)}</h3>
            </div>
            <button onClick={onClose} className="h-8 w-8 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="glass rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{t("app.userDashboard.amount", "Amount")}</p>
              <p className={`font-display text-2xl ${txn.type === "credit" ? "text-emerald-400" : "text-rose-400"}`}>
                {txn.type === "credit" ? "+" : ""}₹{Math.abs(txn.amount).toLocaleString()}
              </p>
            </div>
            <div className="glass rounded-xl p-3">
              <p className="text-[10px] text-muted-foreground uppercase tracking-wide mb-1">{t("app.userDashboard.status", "Status")}</p>
              <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold ${txn.status === "completed" ? "bg-emerald-400/10 text-emerald-400" : txn.status === "pending" ? "bg-amber-400/10 text-amber-400" : "bg-rose-400/10 text-rose-400"}`}>
                {txn.status === "completed" ? <CheckCircle2 className="h-3 w-3" /> : txn.status === "pending" ? <Hourglass className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                {t("app.userDashboard.status_" + txn.status, txn.status.charAt(0).toUpperCase() + txn.status.slice(1))}
              </span>
            </div>
          </div>
          <div className="space-y-3 border-t border-white/5 pt-4">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("app.userDashboard.date", "Date")}</span>
              <span className="text-foreground">{formatDateStr(txn.date)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("app.userDashboard.paymentMethod", "Payment Method")}</span>
              <span className="text-foreground">{translatePaymentMethod(txn.method, t)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">{t("app.userDashboard.category", "Category")}</span>
              <span className="text-foreground capitalize">{txn.category}</span>
            </div>
          </div>
          {txn.invoice && (
            <button onClick={() => alert(`Downloading invoice ${txn.invoice}`)}
              className="w-full gold-btn rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
              <Download className="h-4 w-4" /> {t("app.userDashboard.downloadInvoice", "Download Invoice")}
            </button>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─── Section Views ──────────────────────────────────── */
function DashboardView({ onNavigate }: { onNavigate: (id: string) => void }) {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { suites } = useSuitesContext();
  const activeSuites = suites.filter((s) => s.status === "Active");
  const upcomingSuites = suites.filter((s) => s.status === "Inactive");
  const [dashboardSelected, setDashboardSelected] = useState<Booking | null>(null);
  const [dashboardBookings, setDashboardBookings] = useState<Booking[]>([]);

  useEffect(() => {
    bookingsApi.getAll().then((list) => {
      const mapped: Booking[] = list
        .filter((b: any) => b.status === 'confirmed' || b.status === 'pending')
        .map((b: any) => ({
          id: `VN-${b.id}`,
          suite: b.suiteName || `Suite #${b.suiteId}`,
          location: 'VibeNests, India',
          checkIn: b.date, checkOut: b.date,
          checkInTime: b.timeSlot || '', checkOutTime: b.endTimeSlot || '',
          nights: 1, amount: Number(b.totalAmount) || 0,
          status: b.status as Booking['status'],
          image: 'https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80',
          _raw: b,
        }));
      setDashboardBookings(mapped);
    }).catch(() => {});
  }, []);

  const statsTranslated = [
    { label: t("app.userDashboard.totalBookings", "Total Bookings"), value: "12",    icon: CalendarDays },
    { label: t("app.userDashboard.nightsStayed", "Nights Stayed"),  value: "38",    icon: BedDouble },
    { label: t("app.userDashboard.totalSpent", "Total Spent"),    value: "₹5.2L", icon: CreditCard },
    { label: t("app.userDashboard.loyaltyPoints", "Loyalty Points"), value: "4,820", icon: Star },
  ];

  const conciergeCards = [
    { title: t("app.userDashboard.conciergeTitle", "Concierge"),     desc: t("app.userDashboard.conciergeDesc", "24/7 dedicated personal assistance for every need"), icon: Phone,        accent: "from-sky-500/10" },
    { title: t("app.userDashboard.fineDiningTitle", "Fine Dining"),   desc: t("app.userDashboard.fineDiningDesc", "Reserve exclusive in-suite and restaurant dining"),  icon: Star,         accent: "from-amber-500/10" },
    { title: t("app.userDashboard.spaWellnessTitle", "Spa & Wellness"),desc: t("app.userDashboard.spaWellnessDesc", "Book rejuvenating spa treatments and wellness"),     icon: ArrowUpRight, accent: "from-emerald-500/10" },
  ];

  const quickActionsTranslated = [
    { label: t("app.userDashboard.newBooking", "New Booking"),       icon: BedDouble,     desc: t("app.userDashboard.newBookingDesc", "Explore & reserve suites") },
    { label: t("app.userDashboard.modifyBooking", "Modify Booking"),    icon: CalendarDays,  desc: t("app.userDashboard.modifyBookingDesc", "Change dates or room type") },
    { label: t("app.userDashboard.contactConcierge", "Contact Concierge"), icon: Phone,         desc: t("app.userDashboard.contactConciergeDesc", "24/7 personal assistance") },
    { label: t("app.userDashboard.raiseRequest", "Raise a Request"),   icon: MessageSquare, desc: t("app.userDashboard.raiseRequestDesc", "Report issues or requests") },
  ];

  return (
    <div className="space-y-8">
      <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}
        className="relative rounded-3xl overflow-hidden min-h-[240px] flex items-center"
        style={{ background: "linear-gradient(135deg, oklch(0.12 0.04 270), oklch(0.10 0.03 265))" }}>
        {/* Right side image */}
        <div className="absolute inset-y-0 right-0 w-1/2 hidden md:block">
          <img
            src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80"
            alt="celebration"
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[oklch(0.11_0.04_268)] via-[oklch(0.11_0.04_268/0.6)] to-transparent" />
        </div>
        {/* Mobile full bg */}
        <div className="absolute inset-0 md:hidden">
          <img src="https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=900&q=80" alt="celebration" className="w-full h-full object-cover opacity-20" />
        </div>
        {/* Content */}
        <div className="relative z-10 p-8 space-y-3">
          <h2 className="font-display text-4xl font-medium text-foreground">
            {t("app.userDashboard.makeEvery", "Make Every")}<br /><span className="text-gradient-gold italic">{t("app.userDashboard.momentMemorable", "Moment Memorable")}</span>
          </h2>
          <p className="text-sm text-muted-foreground max-w-sm">{t("app.userDashboard.heroDesc", "Handpicked private suites with premium amenities for your special celebrations.")}</p>
          <button onClick={() => onNavigate("suites")} className="mt-2 gold-btn flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold">
            {t("app.userDashboard.bookYourSuite", "Book Your Suite")} <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        {/* Loyalty points badge */}
        <div className="absolute right-8 bottom-6 hidden md:block z-10">
          <div className="glass-gold rounded-2xl p-4 text-center min-w-[120px]">
            <p className="text-[10px] text-muted-foreground uppercase tracking-widest mb-1">{t("app.userDashboard.loyaltyPoints", "Loyalty Points")}</p>
            <p className="font-display text-3xl text-gold">4,820</p>
          </div>
        </div>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statsTranslated.map((s, i) => {
          const Icon = s.icon;
          return (
            <motion.div key={s.label} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.07 }}
              className="glass-card rounded-2xl p-5 flex items-center gap-4">
              <div className="h-10 w-10 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                <Icon className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="text-2xl font-display text-foreground">{s.value}</p>
                <p className="text-[11px] text-muted-foreground">{s.label}</p>
              </div>
            </motion.div>
          );
        })}
      </div>

      <div className="grid md:grid-cols-3 gap-4">
        {conciergeCards.map((c, i) => {
          const Icon = c.icon;
          return (
            <motion.div key={c.title} initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 + i * 0.08 }}
              className={`glass-card rounded-2xl p-5 bg-gradient-to-br ${c.accent} to-transparent hover:border-gold/30 transition-all cursor-pointer group`}>
              <Icon className="h-5 w-5 text-gold mb-3" />
              <h4 className="font-display text-lg text-foreground">{c.title}</h4>
              <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{c.desc}</p>
              <div className="mt-4 flex items-center gap-1 text-xs text-gold group-hover:gap-2 transition-all">
                {t("app.userDashboard.explore", "Explore")} <ChevronRight className="h-3 w-3" />
              </div>
            </motion.div>
          );
        })}
      </div>

      {dashboardBookings.length > 0 && (
        <div>
          <h3 className="font-display text-xl text-foreground mb-4">{t("app.userDashboard.upcomingStays", "Upcoming Stays")}</h3>
          <div className="space-y-3">
            {dashboardBookings.map((b) => <BookingCard key={b.id} b={b} onViewDetails={setDashboardSelected} />)}
          </div>
        </div>
      )}

      {activeSuites.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-foreground">{t("app.userDashboard.availableSuites", "Available Suites")}</h3>
            <span className="px-2.5 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-[10px] font-bold">
              {t("app.userDashboard.countAvailable", "{{count}} Available", { count: activeSuites.length })}
            </span>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {activeSuites.map((s, i) => <SuiteCard key={s.id} suite={s} index={i} onBookNow={() => navigate("/user/suite-booking", { state: { suiteId: s.id } })} />)}
          </div>
        </div>
      )}

      {upcomingSuites.length > 0 && (
        <div>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-display text-xl text-foreground">{t("app.userDashboard.upcomingSuites", "Upcoming Suites")}</h3>
            <span className="px-2.5 py-1 rounded-full bg-amber-400/10 border border-amber-400/20 text-amber-400 text-[10px] font-bold">{t("app.userDashboard.comingSoon", "Coming Soon")}</span>
          </div>
          <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {upcomingSuites.map((s, i) => <SuiteCard key={s.id} suite={s} index={i} onBookNow={() => navigate("/user/suite-booking", { state: { suiteId: s.id } })} />)}
          </div>
        </div>
      )}

      {dashboardSelected && <BookingDetailsDrawer booking={dashboardSelected} onClose={() => setDashboardSelected(null)} />}

      <div>
        <h3 className="font-display text-xl text-foreground mb-4">{t("app.userDashboard.quickActions", "Quick Actions")}</h3>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          {quickActionsTranslated.map((a, i) => {
            const Icon = a.icon;
            return (
              <motion.button key={a.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.06 }}
                className="glass-card rounded-2xl p-4 text-left hover:border-gold/35 hover:bg-gold/5 transition-all group">
                <div className="h-9 w-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center mb-3">
                  <Icon className="h-4 w-4 text-gold" />
                </div>
                <p className="text-sm font-medium text-foreground">{a.label}</p>
                <p className="text-[11px] text-muted-foreground mt-0.5">{a.desc}</p>
              </motion.button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

function SuitesView() {
  const { suites } = useSuitesContext();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const filtered = suites.filter((s) => {
    const q = search.toLowerCase();
    return (
      (s.name.toLowerCase().includes(q) || s.occasions.toLowerCase().includes(q)) &&
      (statusFilter === "All" || s.status === statusFilter)
    );
  });
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-foreground">{t("app.userDashboard.browseSuites", "Browse Suites")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("app.userDashboard.browseSuitesDesc", "Explore and book from our luxury suite collection")}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-emerald-400/10 border border-emerald-400/20 text-emerald-400 text-xs font-semibold">
          {t("app.userDashboard.countAvailable", "{{count}} Available", { count: suites.filter(s => s.status === "Active").length })}
        </span>
      </div>
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
          <input type="text" placeholder={t("app.userDashboard.searchPlaceholder", "Search suites or occasions...")} value={search} onChange={(e) => setSearch(e.target.value)}
            className="luxury-input w-full rounded-xl pl-9 pr-4 py-2 text-xs" />
        </div>
        <div className="flex gap-1 glass rounded-xl p-1">
          {["All", "Active", "Inactive"].map((f) => (
            <button key={f} onClick={() => setStatusFilter(f)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${statusFilter === f ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-foreground"}`}>
              {f === "All" ? t("app.userDashboard.filterAll", "All") : f === "Active" ? t("app.userDashboard.filterActive", "Active") : t("app.userDashboard.filterInactive", "Inactive")}
            </button>
          ))}
        </div>
      </div>
      {filtered.length === 0 ? (
        <div className="glass-card rounded-2xl p-16 text-center text-muted-foreground text-sm">{t("app.userDashboard.noSuitesFound", "No suites found.")}</div>
      ) : (
        <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((s, i) => <SuiteCard key={s.id} suite={s} index={i} onBookNow={() => navigate("/user/suite-booking", { state: { suiteId: s.id } })} />)}
        </div>
      )}
    </div>
  );
}

function BookingListView({ bookings, title, fetchFromApi, statusFilter }: { bookings: Booking[]; title: string; fetchFromApi?: boolean; statusFilter?: 'upcoming' | 'past' }) {
  const { t } = useTranslation();
  const [selected, setSelected] = useState<Booking | null>(null);
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [statusFilterLocal, setStatusFilterLocal] = useState("all");
  const [apiBookings, setApiBookings] = useState<Booking[]>([]);
  const [loadingApi, setLoadingApi] = useState(false);

  const fetchBookings = () => {
    if (!fetchFromApi) return;
    bookingsApi.getAll()
      .then((list) => {
        const mapped: Booking[] = list
          .filter((b: any) => {
            if (statusFilter === 'upcoming') return b.status === 'confirmed' || b.status === 'pending';
            if (statusFilter === 'past') return b.status === 'completed' || b.status === 'cancelled' || b.status === 'refunded';
            return true;
          })
          .map((b: any) => ({
            id: `VN-${b.id}`,
            suite: b.suiteName || `Suite #${b.suiteId}`,
            location: "VibeNests, India",
            checkIn: b.date, checkOut: b.date,
            checkInTime: b.timeSlot || "", checkOutTime: b.endTimeSlot || "",
            nights: 1, amount: Number(b.totalAmount) || 0,
            status: b.status as Booking["status"],
            image: "https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=400&q=80",
            _raw: b,
          }));
        setApiBookings(mapped);
      })
      .catch(() => {})
      .finally(() => setLoadingApi(false));
  };

  useEffect(() => {
    if (!fetchFromApi) return;
    setLoadingApi(true);
    fetchBookings();
    const interval = setInterval(fetchBookings, 10000);
    const onFocus = () => fetchBookings();
    window.addEventListener('focus', onFocus);
    return () => { clearInterval(interval); window.removeEventListener('focus', onFocus); };
  }, [fetchFromApi, statusFilter]);

  const source = fetchFromApi ? apiBookings : bookings;

  function parseDate(str: string) {
    return new Date(str);
  }

  const filtered = source.filter((b) => {
    const checkIn = parseDate(b.checkIn);
    if (fromDate && checkIn < new Date(fromDate)) return false;
    if (toDate && checkIn > new Date(toDate)) return false;
    if (statusFilterLocal !== "all" && b.status !== statusFilterLocal) return false;
    return true;
  });

  const hasFilters = fromDate || toDate || statusFilterLocal !== "all";

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div className="flex items-center gap-3">
          <h3 className="font-display text-2xl text-foreground">{title}</h3>
          <span className="px-3 py-1 rounded-full bg-white/5 border border-white/10 text-muted-foreground text-xs">
            {t("app.userDashboard.bookingsCount", "{{count}} bookings", { count: filtered.length })}
          </span>
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex items-center gap-2">
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("app.userDashboard.fromDate", "From")}</label>
              <input type="date" value={fromDate} onChange={(e) => setFromDate(e.target.value)}
                className="luxury-input rounded-xl px-3 py-1.5 text-xs bg-black/40 text-foreground" />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-[10px] uppercase tracking-widest text-muted-foreground">{t("app.userDashboard.toDate", "To")}</label>
              <input type="date" value={toDate} onChange={(e) => setToDate(e.target.value)}
                className="luxury-input rounded-xl px-3 py-1.5 text-xs bg-black/40 text-foreground" />
            </div>
          </div>
          <div className="flex gap-1 glass rounded-xl p-1">
            {(["all", "confirmed", "pending", "completed", "cancelled"] as const).map((s) => (
              <button key={s} onClick={() => setStatusFilterLocal(s)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize transition-colors ${
                  statusFilterLocal === s ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-foreground"
                }`}>
                {s === "all" ? t("app.userDashboard.status_all", "All") : t(`app.userDashboard.status_${s}`, s.charAt(0).toUpperCase() + s.slice(1))}
              </button>
            ))}
          </div>
          {hasFilters && (
            <button onClick={() => { setFromDate(""); setToDate(""); setStatusFilterLocal("all"); }}
              className="text-xs text-rose-400 hover:text-rose-300 transition-colors px-2 py-1.5">
              {t("app.userDashboard.clear", "Clear")}
            </button>
          )}
        </div>
      </div>

      {filtered.length === 0
        ? <div className="glass-card rounded-2xl p-12 text-center text-muted-foreground">{loadingApi ? t("app.userDashboard.loadingBookings", "Loading bookings...") : t("app.userDashboard.noBookingsMatch", "No bookings match the selected filters.")}</div>
        : <div className="space-y-3">{filtered.map((b) => <BookingCard key={b.id} b={b} onViewDetails={setSelected} />)}</div>}
      {selected && <BookingDetailsDrawer booking={selected} onClose={() => setSelected(null)} />}
    </div>
  );
}

function WalletView() {
  const { t } = useTranslation();
  const [searchTerm, setSearchTerm]   = useState("");
  const [filterType, setFilterType]   = useState<"all" | "credit" | "debit">("all");
  const [txnFromDate, setTxnFromDate] = useState("");
  const [txnToDate, setTxnToDate]     = useState("");
  const [selectedTxn, setSelectedTxn] = useState<Transaction | null>(null);
  const [methods, setMethods]         = useState<PaymentMethod[]>(PAYMENT_METHODS);
  const [payments, setPayments]       = useState<any[]>([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    paymentsApi.getMine()
      .then(setPayments)
      .catch((err) => console.error("Failed to load user transactions:", err))
      .finally(() => setLoading(false));
  }, []);

  const transactions: Transaction[] = payments.map((p) => {
    const isRefund = p.status === "refunded";
    const amount = Number(p.amount || 0);
    return {
      id: `TXN-${p.id}`,
      desc: isRefund 
        ? t("app.userDashboard.txnDescRefund", "Refund – Cancelled Booking {{id}}", { id: p.bookingId })
        : t("app.userDashboard.txnDescBookingPayment", "Booking Payment – {{suite}} {{id}}", { suite: p.booking?.suiteName || `Suite #${p.booking?.suiteId ?? ''}`, id: p.bookingId }),
      amount: isRefund ? amount : -amount,
      type: isRefund ? "credit" : "debit",
      date: p.createdAt ? new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "2-digit", year: "numeric" }) : "—",
      status: p.status === "success" ? "completed" : p.status === "pending" ? "pending" : "failed",
      category: isRefund ? "refund" : "booking",
      method: p.method || "Other",
      invoice: p.bookingId ? `INV-${p.bookingId}` : undefined,
    };
  });

  function parseTxnDate(str: string) {
    return new Date(str);
  }

  const filtered = transactions.filter((tVal) => {
    const matchSearch = tVal.desc.toLowerCase().includes(searchTerm.toLowerCase()) || tVal.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType   = filterType === "all" || tVal.type === filterType;
    const d = parseTxnDate(tVal.date);
    const matchFrom = !txnFromDate || d >= new Date(txnFromDate);
    const matchTo   = !txnToDate   || d <= new Date(txnToDate + "T23:59:59");
    return matchSearch && matchType && matchFrom && matchTo;
  });

  const hasDateFilter = txnFromDate || txnToDate;

  const totalCredit = transactions.filter((tVal) => tVal.type === "credit").reduce((s, tVal) => s + tVal.amount, 0);
  const totalDebit  = transactions.filter((tVal) => tVal.type === "debit").reduce((s, tVal) => s + Math.abs(tVal.amount), 0);

  function setDefault(id: string) {
    setMethods((prev) => prev.map((m) => ({ ...m, isDefault: m.id === id })));
  }
  function deleteMethod(id: string) {
    setMethods((prev) => prev.filter((m) => m.id !== id));
  }

  const walletActions = [
    { label: t("app.userDashboard.addMoney", "Add Money"),        icon: Plus,       color: "emerald" },
    { label: t("app.userDashboard.transactions", "Transactions"),     icon: Receipt,    color: "sky"     },
    { label: t("app.userDashboard.importStatement", "Import Statement"), icon: Download,   color: "violet"  },
    { label: t("app.userDashboard.paymentMethods", "Payment Methods"),  icon: CreditCard, color: "amber"   },
    { label: t("app.userDashboard.refunds", "Refunds"),          icon: RefreshCw,  color: "rose"    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl text-foreground">{t("app.userDashboard.walletPayments", "Wallet & Payments")}</h3>
        <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold">{t("app.userDashboard.premiumMember", "Premium Member")}</span>
      </div>

      {/* Balance Cards */}
      <div className="grid md:grid-cols-3 gap-4">
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }}
          className="glass-card rounded-2xl p-6 bg-gradient-to-br from-gold/10 to-transparent border-gold/25 md:col-span-2">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{t("app.userDashboard.availableBalance", "Available Balance")}</p>
              <p className="font-display text-5xl text-gold">₹{(12400 + totalCredit - totalDebit).toLocaleString()}</p>
              <p className="text-xs text-muted-foreground mt-2">{t("app.userDashboard.walletCreditsRefunds", "Wallet credits & refunds")}</p>
            </div>
            <Wallet className="h-8 w-8 text-gold/40" />
          </div>
          <div className="flex gap-3">
            <button className="flex-1 gold-btn rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
              <Plus className="h-4 w-4" /> {t("app.userDashboard.addMoney", "Add Money")}
            </button>
            <button className="flex-1 glass rounded-xl py-2.5 text-sm font-semibold text-gold border border-gold/30 hover:bg-gold/10 transition-colors flex items-center justify-center gap-2">
              <ArrowUpRight className="h-4 w-4" /> {t("app.userDashboard.withdraw", "Withdraw")}
            </button>
          </div>
        </motion.div>
        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="glass-card rounded-2xl p-6">
          <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{t("app.userDashboard.loyaltyPoints", "Loyalty Points")}</p>
          <p className="font-display text-4xl text-foreground">4,820</p>
          <p className="text-xs text-muted-foreground mt-2">{t("app.userDashboard.loyaltyPointsDesc", "Earn 1 pt = ₹10 spent")}</p>
          <button className="mt-4 w-full glass rounded-xl py-2 text-xs font-semibold text-gold border border-gold/20 hover:bg-gold/10 transition-colors">{t("app.userDashboard.redeemPoints", "Redeem Points")}</button>
        </motion.div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {walletActions.map((a, i) => {
          const Icon = a.icon;
          return (
            <motion.button key={a.label} initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.15 + i * 0.05 }}
              className="glass-card rounded-2xl p-4 text-left hover:border-gold/35 hover:bg-gold/5 transition-all group">
              <div className={`h-9 w-9 rounded-xl flex items-center justify-center mb-3 bg-${a.color}-400/10 border border-${a.color}-400/20`}>
                <Icon className={`h-4 w-4 text-${a.color}-400`} />
              </div>
              <p className="text-sm font-medium text-foreground">{a.label}</p>
            </motion.button>
          );
        })}
      </div>

      {/* Analytics */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
        className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <h4 className="font-display text-lg text-foreground">{t("app.userDashboard.paymentAnalytics", "Payment Analytics")}</h4>
          <BarChart3 className="h-5 w-5 text-gold" />
        </div>
        <div className="grid md:grid-cols-3 gap-4">
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingUp className="h-4 w-4 text-emerald-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.userDashboard.totalCredits", "Total Credits")}</p>
            </div>
            <p className="font-display text-2xl text-emerald-400">₹{totalCredit.toLocaleString()}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <TrendingDown className="h-4 w-4 text-rose-400" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.userDashboard.totalDebits", "Total Debits")}</p>
            </div>
            <p className="font-display text-2xl text-rose-400">₹{totalDebit.toLocaleString()}</p>
          </div>
          <div className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <DollarSign className="h-4 w-4 text-gold" />
              <p className="text-xs text-muted-foreground uppercase tracking-wide">{t("app.userDashboard.netFlow", "Net Flow")}</p>
            </div>
            <p className="font-display text-2xl text-gold">₹{(totalCredit - totalDebit).toLocaleString()}</p>
          </div>
        </div>
      </motion.div>

      {/* Saved Payment Methods */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}
        className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="font-display text-lg text-foreground">{t("app.userDashboard.savedPaymentMethods", "Saved Payment Methods")}</h4>
          <button className="flex items-center gap-1.5 text-sm text-gold hover:text-gold/80 transition-colors">
            <Plus className="h-4 w-4" /> {t("app.userDashboard.addNew", "Add New")}
          </button>
        </div>
        <div className="grid md:grid-cols-2 gap-3">
          {methods.map((pm) => {
            const Icon = pm.type === "upi" ? Smartphone : pm.type === "bank" ? Building2 : CreditCard;
            const accent = pm.type === "visa" ? "sky" : pm.type === "mastercard" ? "amber" : pm.type === "upi" ? "emerald" : "purple";
            return (
              <div key={pm.id} className="glass rounded-xl p-4 hover:border-gold/30 transition-colors">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    <div className={`h-10 w-10 rounded-xl flex items-center justify-center bg-${accent}-400/10 border border-${accent}-400/20`}>
                      <Icon className={`h-5 w-5 text-${accent}-400`} />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground">{pm.label}</p>
                      {pm.last4 && <p className="text-xs text-muted-foreground">•••• {pm.last4}</p>}
                      <p className="text-[10px] text-muted-foreground uppercase tracking-wide mt-0.5">{pm.type}</p>
                    </div>
                  </div>
                  {pm.isDefault && (
                    <span className="px-2 py-0.5 rounded-full bg-gold/10 border border-gold/25 text-gold text-[10px] font-bold">{t("app.userDashboard.default", "DEFAULT")}</span>
                  )}
                </div>
                <div className="flex gap-2">
                  <button className="flex-1 glass rounded-lg py-1.5 text-xs text-muted-foreground hover:text-foreground hover:border-gold/20 transition-colors flex items-center justify-center gap-1.5">
                    <Edit3 className="h-3 w-3" /> {t("app.userDashboard.edit", "Edit")}
                  </button>
                  <button onClick={() => deleteMethod(pm.id)}
                    className="flex-1 glass rounded-lg py-1.5 text-xs text-muted-foreground hover:text-rose-400 hover:border-rose-400/20 transition-colors flex items-center justify-center gap-1.5">
                    <Trash2 className="h-3 w-3" /> {t("app.userDashboard.delete", "Delete")}
                  </button>
                  {!pm.isDefault && (
                    <button onClick={() => setDefault(pm.id)}
                      className="flex-1 glass rounded-lg py-1.5 text-xs text-gold hover:bg-gold/10 transition-colors flex items-center justify-center gap-1.5">
                      <Star className="h-3 w-3" /> {t("app.userDashboard.setDefault", "Default")}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </motion.div>

      {/* Recent Transactions */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
        className="glass-card rounded-2xl p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <h4 className="font-display text-lg text-foreground">{t("app.userDashboard.recentTransactions", "Recent Transactions")}</h4>
          <div className="flex flex-wrap gap-2">
            {/* Date filters */}
            <div className="flex items-center gap-2">
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] uppercase tracking-widest text-muted-foreground">{t("app.userDashboard.fromDate", "From")}</label>
                <input
                  type="date"
                  value={txnFromDate}
                  onChange={(e) => setTxnFromDate(e.target.value)}
                  className="luxury-input rounded-xl px-3 py-1.5 text-xs bg-black/40 text-foreground"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              <div className="flex flex-col gap-0.5">
                <label className="text-[9px] uppercase tracking-widest text-muted-foreground">{t("app.userDashboard.toDate", "To")}</label>
                <input
                  type="date"
                  value={txnToDate}
                  onChange={(e) => setTxnToDate(e.target.value)}
                  className="luxury-input rounded-xl px-3 py-1.5 text-xs bg-black/40 text-foreground"
                  style={{ colorScheme: "dark" }}
                />
              </div>
              {hasDateFilter && (
                <button
                  onClick={() => { setTxnFromDate(""); setTxnToDate(""); }}
                  className="self-end text-xs text-rose-400 hover:text-rose-300 transition-colors px-2 py-1.5 border border-rose-400/20 rounded-lg"
                >
                  {t("app.userDashboard.clear", "Clear")}
                </button>
              )}
            </div>
            <button
              onClick={() => alert("Import transactions from CSV/PDF")}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gold/30 bg-gold/8 text-gold text-xs hover:bg-gold/15 transition-colors">
              <Download className="h-3.5 w-3.5" /> {t("app.userDashboard.import", "Import")}
            </button>
            <div className="relative flex-1 sm:flex-initial">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} placeholder={t("app.userDashboard.searchPlaceholderShort", "Search...")}
                className="luxury-input w-full sm:w-48 rounded-xl pl-9 pr-3 py-2 text-xs text-foreground bg-transparent" />
            </div>
            <div className="flex gap-1 glass rounded-xl p-1">
              {(["all", "credit", "debit"] as const).map((f) => (
                <button key={f} onClick={() => setFilterType(f)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${filterType === f ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-foreground"}`}>
                  {f === "all" ? t("app.userDashboard.filterAll", "All") : f === "credit" ? t("app.userDashboard.filterCredits", "Credits") : t("app.userDashboard.filterDebits", "Debits")}
                </button>
              ))}
            </div>
          </div>
        </div>
        <div className="space-y-2">
          {filtered.map((tVal, i) => (
            <motion.div key={tVal.id} initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }}
              className="glass rounded-xl p-4 hover:border-gold/30 transition-colors cursor-pointer group"
              onClick={() => setSelectedTxn(tVal)}>
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <div className={`h-10 w-10 rounded-xl flex items-center justify-center shrink-0 ${tVal.type === "credit" ? "bg-emerald-400/10 border border-emerald-400/25" : "bg-rose-400/10 border border-rose-400/25"}`}>
                    {tVal.type === "credit"
                      ? <ArrowDownLeft className="h-5 w-5 text-emerald-400" />
                      : <ArrowUpLeft className="h-5 w-5 text-rose-400" />}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="text-sm text-foreground truncate">{translateTxnDesc(tVal.desc, t)}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <p className="text-xs text-muted-foreground">{formatDateStr(tVal.date)}</p>
                      <span className="text-muted-foreground">•</span>
                      <p className="text-xs text-muted-foreground font-mono">{tVal.id}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <div className="text-right">
                    <p className={`font-display text-lg ${tVal.type === "credit" ? "text-emerald-400" : "text-rose-400"}`}>
                      {tVal.type === "credit" ? "+" : "-"}₹{Math.abs(tVal.amount).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground uppercase tracking-wide">{tVal.category}</p>
                  </div>
                  <Eye className="h-4 w-4 text-muted-foreground group-hover:text-gold transition-colors" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>
        {filtered.length === 0 && (
          <div className="text-center py-8 text-muted-foreground text-sm">{t("app.userDashboard.noTransactionsFound", "No transactions found.")}</div>
        )}
      </motion.div>

      {selectedTxn && <TransactionModal txn={selectedTxn} onClose={() => setSelectedTxn(null)} />}
    </div>
  );
}

/* ─── Celebration Packages Data ─────────────────────── */
type CelebrationPackage = {
  id: string; name: string; occasion: string; badge: string; badgeColor: string;
  image: string; capacity: string; price: number; description: string;
  amenities: string[]; bookings: number; wishlist?: boolean;
};

const BADGE_COLORS: Record<string, string> = {
  "Most Popular": "bg-amber-400/20 border-amber-400/40 text-amber-300",
  "Best for Couples": "bg-rose-400/20 border-rose-400/40 text-rose-300",
  "Great for Parties": "bg-sky-400/20 border-sky-400/40 text-sky-300",
  "Perfect Surprise": "bg-purple-400/20 border-purple-400/40 text-purple-300",
};

function apiToPackage(p: any): CelebrationPackage {
  return {
    id: String(p.id),
    name: p.name,
    occasion: p.occasion,
    badge: p.badge || "Most Popular",
    badgeColor: BADGE_COLORS[p.badge] || BADGE_COLORS["Most Popular"],
    image: p.image || "",
    capacity: `Up to ${p.capacity} guests`,
    price: Number(p.price),
    description: p.description,
    amenities: Array.isArray(p.amenities) ? p.amenities : [],
    bookings: Number(p.booked) || 0,
  };
}

const ALL_OCCASIONS = ["All", "Birthday", "Anniversary", "Proposal", "Baby Shower", "Corporate Events", "Other Celebrations"];
const SORT_OPTIONS = ["Popularity", "Price: Low to High", "Price: High to Low", "Most Booked"];
const AMENITY_ICON_MAP: Record<string, React.ElementType> = {
  "Floral Decor": Sparkles,
  "Custom Cake": Cake,
  "LED Lights": Star,
  "Balloons": Star,
  "Photography": Camera,
  "Rose Petals": Star,
  "Champagne": Coffee,
  "Candles": Star,
  "Music System": Music,
  "Flower Arch": Sparkles,
  "Ring Reveal Box": Star,
  "DJ Setup": Music,
  "Multi-tier Cake": Cake,
  "Welcome Drinks": Coffee,
  "Streamers": Sparkles,
  "Pastel Decor": Sparkles,
  "Themed Cake": Cake,
  "Welcome Hamper": Package,
  "AV Equipment": Tv,
  "Catering": Coffee,
  "Branded Decor": Sparkles,
  "Concierge": Phone,
  "Wi-Fi": Wifi,
  "Fine Dining": Coffee,
  "Spa Access": Star,
  "Butler Service": Star,
  "Custom Decor": Sparkles,
  "Custom Menu": Coffee,
  "Surprise Element": Sparkles,
  "Music": Music,
  "Pastel Balloons": Star,
};

/* ─── Package Detail Modal ───────────────────────────── */
function PackageDetailModal({ pkg, onClose }: { pkg: CelebrationPackage; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/75 backdrop-blur-sm" onClick={onClose} />
        <motion.div initial={{ scale: 0.95, opacity: 0, y: 16 }} animate={{ scale: 1, opacity: 1, y: 0 }} exit={{ scale: 0.95, opacity: 0 }}
          transition={{ type: "spring", damping: 28, stiffness: 260 }}
          className="relative z-10 w-full max-w-2xl glass-card rounded-2xl overflow-hidden">
          <div className="relative h-56">
            <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <button onClick={onClose} className="absolute top-4 right-4 h-8 w-8 rounded-xl bg-black/50 backdrop-blur flex items-center justify-center text-white hover:bg-black/70 transition-colors">
              <X className="h-4 w-4" />
            </button>
            <span className={`absolute top-4 left-4 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-widest ${pkg.badgeColor}`}>
              {t("app.userDashboard.badge_" + pkg.badge.toLowerCase().replace(/\s+/g, "_"), pkg.badge)}
            </span>
            <div className="absolute bottom-4 left-5">
              <p className="text-[10px] text-gold/80 uppercase tracking-widest">
                {t("app.userDashboard.occasion_" + pkg.occasion.toLowerCase().replace(/\s+/g, "_"), pkg.occasion)}
              </p>
              <h3 className="font-display text-2xl text-white">{pkg.name}</h3>
            </div>
          </div>
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Users className="h-4 w-4 text-gold" />{pkg.capacity}
              </div>
              <p className="font-display text-3xl text-gold">₹{pkg.price.toLocaleString()}</p>
            </div>
            <p className="text-sm text-muted-foreground leading-relaxed">{pkg.description}</p>
            <div>
              <p className="text-[11px] text-muted-foreground uppercase tracking-widest mb-2">{t("app.userDashboard.whatsIncluded", "What's Included")}</p>
              <div className="flex flex-wrap gap-2">
                {pkg.amenities.map((a) => {
                  const Icon = AMENITY_ICON_MAP[a] ?? Sparkles;
                  return (
                    <span key={a} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gold/10 border border-gold/20 text-gold text-xs">
                      <Icon className="h-3 w-3" />{a}
                    </span>
                  );
                })}
              </div>
            </div>
            <div className="flex gap-3 pt-2">
              <button className="flex-1 gold-btn rounded-xl py-3 text-sm font-semibold">{t("app.userDashboard.bookThisPackage", "Book This Package")}</button>
              <button onClick={onClose} className="flex-1 glass rounded-xl py-3 text-sm text-muted-foreground border border-white/10 hover:text-foreground transition-colors">{t("app.userDashboard.close", "Close")}</button>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}

/* ─── Celebration Packages View ──────────────────────── */
function CelebrationPackagesView() {
  const { t } = useTranslation();
  const [selectedOccasion, setSelectedOccasion] = useState("All");
  const [priceRange, setPriceRange]             = useState(40000);
  const [sortBy, setSortBy]                     = useState("Popularity");
  const [wishlist, setWishlist]                 = useState<Set<string>>(new Set());
  const [compareList, setCompareList]           = useState<string[]>([]);
  const [detailPkg, setDetailPkg]               = useState<CelebrationPackage | null>(null);
  const [page, setPage]                         = useState(1);
  const PER_PAGE = 6;

  const [packages, setPackages]               = useState<CelebrationPackage[]>([]);
  const [loading, setLoading]                 = useState(true);

  useEffect(() => {
    celebrationPackagesApi.getPublic()
      .then((data) => setPackages(data.map(apiToPackage)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const filtered = packages
    .filter((p) => (selectedOccasion === "All" || p.occasion === selectedOccasion) && p.price <= priceRange)
    .sort((a, b) => {
      if (sortBy === "Price: Low to High") return a.price - b.price;
      if (sortBy === "Price: High to Low") return b.price - a.price;
      if (sortBy === "Most Booked") return b.bookings - a.bookings;
      return b.bookings - a.bookings;
    });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  function toggleWishlist(id: string) {
    setWishlist((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function toggleCompare(id: string) {
    setCompareList((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : prev.length < 3 ? [...prev, id] : prev);
  }

  function clearFilters() {
    setSelectedOccasion("All"); setPriceRange(40000); setSortBy("Popularity"); setPage(1);
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-foreground">{t("app.userDashboard.celebrationPackages", "Celebration Packages")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("app.userDashboard.celebrationPackagesDesc", "Curated luxury experiences for every special occasion")}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-xs font-semibold">
          {t("app.userDashboard.packagesCount", "{{count}} Packages", { count: filtered.length })}
        </span>
      </div>

      <div className="flex gap-6">
        {/* ── Sidebar Filter ── */}
        <aside className="w-56 shrink-0 space-y-5">
          <div className="glass-card rounded-2xl p-5 space-y-5">
            {/* Occasion filter */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <p className="text-xs font-semibold text-foreground uppercase tracking-widest">{t("app.userDashboard.occasion", "Occasion")}</p>
                <button onClick={clearFilters} className="text-[10px] text-gold hover:text-gold/70 transition-colors">{t("app.userDashboard.clearAll", "Clear All")}</button>
              </div>
              <div className="space-y-1">
                {ALL_OCCASIONS.map((o: string) => (
                  <button key={o} onClick={() => { setSelectedOccasion(o); setPage(1); }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                      selectedOccasion === o
                        ? "bg-gold/15 border border-gold/30 text-gold font-medium"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}>
                    {t("app.userDashboard.occasion_" + o.toLowerCase().replace(/\s+/g, "_"), o)}
                  </button>
                ))}
              </div>
            </div>

            {/* Price Range */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3">{t("app.userDashboard.maxPrice", "Max Price")}</p>
              <input type="range" min={5000} max={40000} step={1000} value={priceRange}
                onChange={(e) => { setPriceRange(Number(e.target.value)); setPage(1); }}
                className="w-full accent-[var(--gold)] cursor-pointer" />
              <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                <span>₹5K</span>
                <span className="text-gold font-semibold">₹{(priceRange / 1000).toFixed(0)}K</span>
                <span>₹40K</span>
              </div>
            </div>

            {/* Sort */}
            <div>
              <p className="text-xs font-semibold text-foreground uppercase tracking-widest mb-3">{t("app.userDashboard.sortBy", "Sort By")}</p>
              <div className="space-y-1">
                {SORT_OPTIONS.map((s) => (
                  <button key={s} onClick={() => setSortBy(s)}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-all ${
                      sortBy === s
                        ? "bg-gold/15 border border-gold/30 text-gold font-medium"
                        : "text-muted-foreground hover:bg-white/5 hover:text-foreground"
                    }`}>
                    {t("app.userDashboard.sort_" + s.toLowerCase().replace(/:/g, "").replace(/\s+/g, "_"), s)}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Compare bar */}
          {compareList.length > 0 && (
            <div className="glass-card rounded-2xl p-4 border-gold/25">
              <p className="text-xs font-semibold text-gold uppercase tracking-widest mb-2">
                {t("app.userDashboard.comparingCount", "Comparing ({{count}}/3)", { count: compareList.length })}
              </p>
              <div className="space-y-1">
                {compareList.map((id) => {
                  const pkg = packages.find((p) => p.id === id)!;
                  return (
                    <div key={id} className="flex items-center justify-between">
                      <p className="text-xs text-foreground truncate flex-1">{pkg.name}</p>
                      <button onClick={() => toggleCompare(id)} className="text-muted-foreground hover:text-rose-400 ml-2"><X className="h-3 w-3" /></button>
                    </div>
                  );
                })}
              </div>
              <button className="mt-3 w-full gold-btn rounded-lg py-1.5 text-xs font-semibold">{t("app.userDashboard.compareNow", "Compare Now")}</button>
            </div>
          )}
        </aside>

        {/* ── Cards Grid ── */}
        <div className="flex-1 min-w-0 space-y-5">
          {paginated.length === 0 ? (
            <div className="glass-card rounded-2xl p-16 text-center">
              <Sparkles className="h-10 w-10 text-gold/30 mx-auto mb-3" />
              <p className="text-muted-foreground text-sm">{t("app.userDashboard.noPackagesMatch", "No packages match your filters.")}</p>
              <button onClick={clearFilters} className="mt-4 text-gold text-xs hover:underline">{t("app.userDashboard.clearFilters", "Clear filters")}</button>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {paginated.map((pkg, i) => {
                const isWishlisted = wishlist.has(pkg.id);
                const isCompared   = compareList.includes(pkg.id);
                return (
                  <motion.div key={pkg.id}
                    initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.06 }}
                    className="glass-card rounded-2xl overflow-hidden flex flex-col group hover:border-gold/35 hover:-translate-y-1 transition-all duration-300">

                    {/* Image */}
                    <div className="relative h-44 overflow-hidden">
                      <img src={pkg.image} alt={pkg.name}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                      {/* Badge */}
                      <span className={`absolute top-3 left-3 px-2.5 py-1 rounded-full border text-[10px] font-bold tracking-widest ${pkg.badgeColor}`}>
                        {t("app.userDashboard.badge_" + pkg.badge.toLowerCase().replace(/\s+/g, "_"), pkg.badge)}
                      </span>
                      {/* Wishlist */}
                      <button onClick={() => toggleWishlist(pkg.id)}
                        className="absolute top-3 right-3 h-8 w-8 rounded-xl bg-black/40 backdrop-blur flex items-center justify-center hover:bg-black/60 transition-colors">
                        <Heart className={`h-4 w-4 transition-colors ${isWishlisted ? "fill-rose-400 text-rose-400" : "text-white"}`} />
                      </button>
                      {/* Occasion */}
                      <p className="absolute bottom-3 left-3 text-[10px] text-gold/90 uppercase tracking-widest font-semibold">
                        {t("app.userDashboard.occasion_" + pkg.occasion.toLowerCase().replace(/\s+/g, "_"), pkg.occasion)}
                      </p>
                    </div>

                    {/* Body */}
                    <div className="p-4 flex flex-col flex-1 gap-3">
                      <div>
                        <h4 className="font-display text-lg text-foreground leading-tight">{pkg.name}</h4>
                        <div className="flex items-center gap-1.5 mt-1 text-xs text-muted-foreground">
                          <Users className="h-3 w-3 text-gold/60" />{pkg.capacity}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">{pkg.description}</p>

                      {/* Amenities */}
                      <div className="flex flex-wrap gap-1">
                        {pkg.amenities.slice(0, 4).map((a) => {
                          const Icon = AMENITY_ICON_MAP[a] ?? Sparkles;
                          return (
                            <span key={a} className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-gold/8 border border-gold/15 text-[10px] text-gold/80">
                              <Icon className="h-2.5 w-2.5" />{a}
                            </span>
                          );
                        })}
                        {pkg.amenities.length > 4 && (
                          <span className="px-2 py-0.5 rounded-full bg-white/5 border border-white/10 text-[10px] text-muted-foreground">+{pkg.amenities.length - 4}</span>
                        )}
                      </div>

                      {/* Price + actions */}
                      <div className="mt-auto pt-2 border-t border-white/5">
                        <div className="flex items-center justify-between mb-3">
                          <p className="font-display text-2xl text-gold">₹{pkg.price.toLocaleString()}</p>
                          <button onClick={() => toggleCompare(pkg.id)}
                            className={`text-[10px] px-2 py-1 rounded-lg border transition-colors ${
                              isCompared
                                ? "bg-gold/20 border-gold/40 text-gold"
                                : "border-white/10 text-muted-foreground hover:border-gold/30 hover:text-gold"
                            }`}>
                            {isCompared ? t("app.userDashboard.compared", "✓ Compare") : t("app.userDashboard.compare", "+ Compare")}
                          </button>
                        </div>
                        <button onClick={() => setDetailPkg(pkg)}
                          className="w-full gold-btn rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
                          <Eye className="h-4 w-4" /> {t("app.userDashboard.viewDetails", "View Details")}
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 pt-2">
              <button onClick={() => setPage((p) => Math.max(1, p - 1))} disabled={page === 1}
                className="h-8 w-8 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-gold disabled:opacity-30 transition-colors">
                <ChevronLeft className="h-4 w-4" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((n) => (
                <button key={n} onClick={() => setPage(n)}
                  className={`h-8 w-8 rounded-xl text-xs font-medium transition-all ${
                    n === page ? "bg-gold/20 border border-gold/35 text-gold" : "glass text-muted-foreground hover:text-foreground"
                  }`}>{n}</button>
              ))}
              <button onClick={() => setPage((p) => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                className="h-8 w-8 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-gold disabled:opacity-30 transition-colors">
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          )}
        </div>
      </div>

      {detailPkg && <PackageDetailModal pkg={detailPkg} onClose={() => setDetailPkg(null)} />}
    </div>
  );
}

function OffersView() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const [tab, setTab] = useState<"offers" | "referrals" | "coupons">("offers");
  const [copiedCode, setCopiedCode] = useState("");
  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState("");

  const [coupons, setCoupons] = useState<any[]>([]);
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        // Use public /coupons/active endpoint (no auth required)
        const cList = await couponsApi.getActive();
        setCoupons(Array.isArray(cList) ? cList : []);

        // Use public /offers/active endpoint (no auth required)
        const oList = await offersApi.getActive();
        setOffers(Array.isArray(oList) ? oList : []);
      } catch (err) {
        console.warn("Failed to load offers/coupons in user dashboard", err);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  function copyCode(code: string) {
    navigator.clipboard.writeText(code);
    setCopiedCode(code);
    setTimeout(() => setCopiedCode(""), 2000);
  }

  function applyCoupon() {
    const valid = coupons.find((c) => c.code.toLowerCase() === couponInput.trim().toLowerCase());
    setAppliedCoupon(valid ? valid.code : "invalid");
  }

  // Dynamically generated referral details per user
  const referralCode = (user?.fullName ? user.fullName.replace(/\s+/g, "").toUpperCase().slice(0, 5) : "VIBE") + (user?.id || "");
  const friendsCount = String((user?.id || 0) % 4);
  const bookingsCount = String(Math.max(0, ((user?.id || 0) % 4) - 1));
  const rewardsEarned = `₹${(Math.max(0, ((user?.id || 0) % 4) - 1) * 500).toLocaleString()}`;

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[300px]">
        <div className="relative w-12 h-12">
          <div className="absolute inset-0 rounded-full border-2 border-gold/10 animate-ping" />
          <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-gold animate-spin" />
        </div>
        <p className="mt-3 text-xs text-muted-foreground tracking-widest uppercase animate-pulse">
          {t("app.userDashboard.loadingOffers", "Loading offers...")}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="font-display text-2xl text-foreground">{t("app.userDashboard.specialOffersReferrals", "Special Offers & Referrals")}</h3>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 glass rounded-xl p-1 w-fit">
        {(["offers", "referrals", "coupons"] as const).map((tVal) => (
          <button key={tVal} onClick={() => setTab(tVal)}
            className={`px-4 py-2 rounded-lg text-xs font-medium capitalize transition-colors ${
              tab === tVal ? "bg-gold/20 text-gold" : "text-muted-foreground hover:text-foreground"
            }`}>
            {tVal === "offers" ? t("app.userDashboard.tabOffers", "Offers") : tVal === "referrals" ? t("app.userDashboard.tabReferrals", "Referrals") : t("app.userDashboard.tabCoupons", "Coupons")}
          </button>
        ))}
      </div>

      {/* Offers Tab */}
      {tab === "offers" && (
        <div className="grid md:grid-cols-2 gap-4">
          {offers.length === 0 && (
            <div className="col-span-2 text-center py-12 glass-card rounded-2xl border border-white/5">
              <p className="text-sm text-muted-foreground">{t("app.userDashboard.noOffersAvailable", "No active offers available at the moment.")}</p>
            </div>
          )}
          {offers.map((o) => {
            const badge = o.discountType === 'percentage' ? `${o.discountValue}% OFF` : `₹${o.discountValue} OFF`;
            const expires = o.endDate ? formatDateStr(o.endDate) : '';
            return (
              <div key={o.id} className="glass-card rounded-2xl p-5 hover:border-gold/30 transition-colors">
                <div className="flex items-start justify-between gap-3 mb-3">
                  <h4 className="font-display text-lg text-foreground">{o.title}</h4>
                  <span className="px-2.5 py-1 rounded-full border border-gold/40 text-gold bg-gold/10 text-[10px] font-bold tracking-widest shrink-0">{badge}</span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">{o.description || "Special offer discount package"}</p>
                {expires && <p className="text-[11px] text-muted-foreground mt-3">{t("app.userDashboard.validUntil", "Valid until {{date}}", { date: expires })}</p>}
              </div>
            );
          })}
        </div>
      )}

      {/* Referrals Tab */}
      {tab === "referrals" && (
        <div className="space-y-5">
          {/* Referral Code Card */}
          <div className="glass-card rounded-2xl p-6 bg-gradient-to-br from-gold/10 to-transparent border-gold/25">
            <div className="flex items-start justify-between mb-4">
              <div>
                <p className="text-xs text-muted-foreground uppercase tracking-widest mb-1">{t("app.userDashboard.yourReferralCode", "Your Referral Code")}</p>
                <p className="font-display text-4xl text-gold tracking-widest">{referralCode}</p>
                <p className="text-xs text-muted-foreground mt-2">{t("app.userDashboard.referralDesc", "Share this code and earn ₹500 for every friend who books")}</p>
              </div>
              <Users className="h-8 w-8 text-gold/40" />
            </div>
            <div className="flex gap-3">
              <button onClick={() => copyCode(referralCode)}
                className="flex-1 gold-btn rounded-xl py-2.5 text-sm font-semibold flex items-center justify-center gap-2">
                {copiedCode === referralCode ? <CheckCircle2 className="h-4 w-4" /> : <Download className="h-4 w-4" />}
                {copiedCode === referralCode ? t("app.userDashboard.copied", "Copied!") : t("app.userDashboard.copyCode", "Copy Code")}
              </button>
              <button className="flex-1 glass rounded-xl py-2.5 text-sm font-semibold text-gold border border-gold/30 hover:bg-gold/10 transition-colors flex items-center justify-center gap-2">
                <ArrowUpRight className="h-4 w-4" /> {t("app.userDashboard.share", "Share")}
              </button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4">
            {[
              { label: t("app.userDashboard.friendsReferred", "Friends Referred"), value: friendsCount,      icon: Users },
              { label: t("app.userDashboard.successfulBookings", "Successful Bookings"), value: bookingsCount,   icon: CheckCircle2 },
              { label: t("app.userDashboard.rewardsEarned", "Rewards Earned"), value: rewardsEarned,   icon: Star },
            ].map((s) => {
              const Icon = s.icon;
              return (
                <div key={s.label} className="glass-card rounded-2xl p-4 flex items-center gap-3">
                  <div className="h-9 w-9 rounded-xl bg-gold/10 border border-gold/20 flex items-center justify-center shrink-0">
                    <Icon className="h-4 w-4 text-gold" />
                  </div>
                  <div>
                    <p className="font-display text-xl text-foreground">{s.value}</p>
                    <p className="text-[10px] text-muted-foreground">{s.label}</p>
                  </div>
                </div>
              );
            })}
          </div>

          {/* How it works */}
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <h4 className="font-display text-lg text-foreground">{t("app.userDashboard.howItWorks", "How It Works")}</h4>
            <div className="space-y-3">
              {[
                { step: "01", text: t("app.userDashboard.refStep1", "Share your unique referral code with friends") },
                { step: "02", text: t("app.userDashboard.refStep2", "Friend signs up and makes their first booking") },
                { step: "03", text: t("app.userDashboard.refStep3", "You earn ₹500 wallet credit instantly") },
                { step: "04", text: t("app.userDashboard.refStep4", "Your friend gets ₹250 off their first stay") },
              ].map((s) => (
                <div key={s.step} className="flex items-center gap-4">
                  <span className="h-8 w-8 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center text-[11px] font-bold text-gold shrink-0">{s.step}</span>
                  <p className="text-sm text-muted-foreground">{s.text}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Coupons Tab */}
      {tab === "coupons" && (
        <div className="space-y-5">
          {/* Apply coupon input */}
          <div className="glass-card rounded-2xl p-5 space-y-3">
            <h4 className="font-display text-lg text-foreground">{t("app.userDashboard.applyCoupon", "Apply a Coupon")}</h4>
            <div className="flex gap-3">
              <input
                value={couponInput}
                onChange={(e) => { setCouponInput(e.target.value.toUpperCase()); setAppliedCoupon(""); }}
                placeholder={t("app.userDashboard.couponPlaceholder", "Enter coupon code...")}
                className="luxury-input flex-1 rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent uppercase tracking-widest"
              />
              <button onClick={applyCoupon}
                className="gold-btn rounded-xl px-5 py-2.5 text-sm font-semibold">
                {t("app.userDashboard.apply", "Apply")}
              </button>
            </div>
            {appliedCoupon && appliedCoupon !== "invalid" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-emerald-400/10 border border-emerald-400/20">
                <CheckCircle2 className="h-4 w-4 text-emerald-400" />
                <p className="text-xs text-emerald-400">{t("app.userDashboard.couponApplied", "Coupon {{code}} applied successfully!", { code: appliedCoupon })}</p>
              </div>
            )}
            {appliedCoupon === "invalid" && (
              <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-rose-400/10 border border-rose-400/20">
                <XCircle className="h-4 w-4 text-rose-400" />
                <p className="text-xs text-rose-400">{t("app.userDashboard.couponInvalid", "Invalid or expired coupon code.")}</p>
              </div>
            )}
          </div>

          {/* Available coupons */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-widest mb-3">{t("app.userDashboard.availableCoupons", "Available Coupons")}</p>
            <div className="grid md:grid-cols-2 gap-4">
              {coupons.length === 0 && (
                <div className="col-span-2 text-center py-12 glass-card rounded-2xl border border-white/5">
                  <p className="text-sm text-muted-foreground">{t("app.userDashboard.noCouponsAvailable", "No active coupons available at the moment.")}</p>
                </div>
              )}
              {coupons.map((c) => {
                const discount = c.discountType === 'percentage' ? `${c.discountValue}% OFF` : `₹${c.discountValue} OFF`;
                const expires = c.expiresAt ? formatDateStr(c.expiresAt) : '';
                const minSpend = c.minBookingAmount ? `₹${Number(c.minBookingAmount).toLocaleString()}` : '0';
                return (
                  <div key={c.id} className="glass-card rounded-2xl p-5 hover:border-gold/30 transition-colors">
                    <div className="flex items-start justify-between gap-3 mb-3">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-lg font-bold text-gold tracking-widest">{c.code}</span>
                      </div>
                      <span className="px-2.5 py-1 rounded-full border border-gold/40 text-gold bg-gold/10 text-[10px] font-bold tracking-widest shrink-0">{discount}</span>
                    </div>
                    <p className="text-sm text-muted-foreground leading-relaxed">{c.description || `${discount} discount coupon`}</p>
                    <div className="flex items-center justify-between mt-3">
                      <div className="space-y-0.5">
                        <p className="text-[10px] text-muted-foreground">{t("app.userDashboard.minSpend", "Min. spend: {{amount}}", { amount: minSpend })}</p>
                        {expires && <p className="text-[10px] text-muted-foreground">{t("app.userDashboard.validUntil", "Valid until {{date}}", { date: expires })}</p>}
                      </div>
                      <button onClick={() => copyCode(c.code)}
                        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-gold/30 bg-gold/8 text-gold text-xs hover:bg-gold/15 transition-colors">
                        {copiedCode === c.code ? <CheckCircle2 className="h-3 w-3" /> : <Download className="h-3 w-3" />}
                        {copiedCode === c.code ? t("app.userDashboard.copied", "Copied") : t("app.userDashboard.copy", "Copy")}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

function ProfileView() {
  const { t } = useTranslation();
  const { user, saveSession } = useAuth();
  const [form, setForm] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    phone: user?.phone || '',
    dateOfBirth: user?.dateOfBirth || ''
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    if (user) {
      setForm({
        fullName: user.fullName || '',
        email: user.email || '',
        phone: user.phone || '',
        dateOfBirth: user.dateOfBirth || ''
      });
    } else {
      setLoading(true);
      usersApi.me()
        .then((u: any) => setForm({ 
          fullName: u.fullName || '', 
          email: u.email || '', 
          phone: u.phone || '',
          dateOfBirth: u.dateOfBirth || ''
        }))
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [user]);

  async function handleSave() {
    setSaving(true);
    try {
      const updated = await usersApi.updateMe({ fullName: form.fullName, phone: form.phone, dateOfBirth: form.dateOfBirth });
      setForm((f: any) => ({ ...f, fullName: updated.fullName, phone: updated.phone || '', dateOfBirth: updated.dateOfBirth || '' }));
      if (user) {
        const token = localStorage.getItem('accessToken') || '';
        const refresh = localStorage.getItem('refreshToken') || '';
        saveSession(token, refresh, { ...user, fullName: updated.fullName, phone: updated.phone || '', dateOfBirth: updated.dateOfBirth || '' });
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (err: any) { alert(err.message); }
    finally { setSaving(false); }
  }

  return (
    <div className="space-y-6 max-w-xl">
      <h3 className="font-display text-2xl text-foreground">{t("app.userDashboard.profileSettings", "Profile Settings")}</h3>
      {loading ? <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground">Loading...</div> : (
        <div className="glass-card rounded-2xl p-6 space-y-5">
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{t("app.auth.fullName", "Full Name")}</label>
            <input type="text" value={form.fullName} onChange={(e) => setForm((f: any) => ({ ...f, fullName: e.target.value }))} className="luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{t("app.auth.emailLabel", "Email Address")}</label>
            <input type="email" value={form.email} disabled className="luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent opacity-60 cursor-not-allowed" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{t("app.auth.phoneNumber", "Phone Number")}</label>
            <input type="tel" value={form.phone} onChange={(e) => setForm((f: any) => ({ ...f, phone: e.target.value }))} className="luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent" />
          </div>
          <div className="space-y-1.5">
            <label className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{t("app.userDashboard.dateOfBirth", "Date of Birth")}</label>
            <input type="date" value={form.dateOfBirth} onChange={(e) => setForm((f: any) => ({ ...f, dateOfBirth: e.target.value }))} className="luxury-input w-full rounded-xl px-4 py-2.5 text-sm text-foreground bg-transparent" style={{ colorScheme: "dark" }} />
          </div>
          <button onClick={handleSave} disabled={saving} className="gold-btn w-full rounded-xl py-2.5 text-sm font-semibold mt-2 disabled:opacity-60">
            {saving ? "Saving..." : saved ? "Saved!" : t("app.userDashboard.saveChanges", "Save Changes")}
          </button>
        </div>
      )}
    </div>
  );
}

function HelpView() {
  const { t } = useTranslation();
  const topics = [
    t("app.userDashboard.helpTopic1", "Booking queries & confirmations"),
    t("app.userDashboard.helpTopic2", "Celebration package customisation"),
    t("app.userDashboard.helpTopic3", "Payment & refund requests"),
    t("app.userDashboard.helpTopic4", "Live celebration sharing support"),
    t("app.userDashboard.helpTopic5", "Complaints & escalations"),
    t("app.userDashboard.helpTopic6", "Legal & privacy matters"),
  ];

  const contactCards = [
    {
      icon: MessageSquare,
      label: t("app.userDashboard.emailSupport", "Email Support"),
      value: "vibenestsmeetingpoint@gmail.com",
      sub: t("app.userDashboard.emailSupportDesc", "We respond within 1–2 business days"),
      href: "mailto:vibenestsmeetingpoint@gmail.com",
    },
    {
      icon: Phone,
      label: t("app.userDashboard.supportNumber", "Support Number"),
      value: "+91 9000201011",
      sub: t("app.userDashboard.supportNumberDesc", "Call or WhatsApp during support hours"),
      href: "tel:+919000201011",
    },
    {
      icon: Clock,
      label: t("app.userDashboard.supportHours", "Support Hours"),
      value: t("app.userDashboard.supportHoursValue", "9:00 AM – 9:00 PM IST"),
      sub: t("app.userDashboard.supportHoursDesc", "Monday to Sunday, incl. public holidays"),
      href: null,
    },
  ];

  return (
    <div className="space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="font-display text-2xl text-foreground">{t("app.userDashboard.helpSupport", "Help & Support")}</h3>
          <p className="text-xs text-muted-foreground mt-1">{t("app.userDashboard.helpSupportDesc", "Vibenests Private Luxury Suites — we're here every day")}</p>
        </div>
        <span className="px-3 py-1 rounded-full bg-gold/10 border border-gold/25 text-gold text-[10px] font-bold tracking-widest uppercase">{t("app.userDashboard.supportHoursBadge", "9 AM – 9 PM IST")}</span>
      </div>

      {/* Two-column layout */}
      <div className="grid lg:grid-cols-2 gap-6">

        {/* Left — contact cards */}
        <div className="space-y-3">
          <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{t("app.userDashboard.contactUs", "Contact Us")}</p>
          {contactCards.map((c) => {
            const Icon = c.icon;
            const cls = "flex items-center gap-4 glass-card rounded-2xl p-5 transition-colors group";
            const inner = (
              <>
                <div className="h-11 w-11 rounded-xl bg-gold/10 border border-gold/25 flex items-center justify-center shrink-0">
                  <Icon className="h-5 w-5 text-gold" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{c.label}</p>
                  <p className="text-sm font-medium text-foreground mt-0.5 break-all">{c.value}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{c.sub}</p>
                </div>
                {c.href && <ArrowUpRight className="h-4 w-4 text-gold/40 shrink-0 group-hover:text-gold transition-colors" />}
              </>
            );
            return c.href ? (
              <a key={c.label} href={c.href} className={`${cls} hover:border-gold/40 hover:bg-gold/5`}>{inner}</a>
            ) : (
              <div key={c.label} className={cls}>{inner}</div>
            );
          })}
        </div>

        {/* Right — topics + legal */}
        <div className="space-y-4">
          <div className="glass-card rounded-2xl p-5 space-y-4">
            <p className="text-[11px] font-semibold text-muted-foreground uppercase tracking-widest">{t("app.userDashboard.weCanHelp", "We Can Help With")}</p>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-y-2.5 gap-x-4">
              {topics.map((tVal) => (
                <li key={tVal} className="flex items-center gap-2 text-sm text-muted-foreground">
                  <span className="h-1.5 w-1.5 rounded-full bg-gold/60 shrink-0" />
                  {tVal}
                </li>
              ))}
            </ul>
          </div>

          {/* Business info */}
          <div className="glass-card rounded-2xl p-5 space-y-1.5">
            <p className="text-sm font-semibold text-foreground">{t("app.userDashboard.businessInfoTitle", "Vibenests Private Luxury Suites")}</p>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {t("app.userDashboard.businessInfoDesc", "Premium private suite bookings and celebration experiences. Our team is available 7 days a week to assist you.")}
            </p>
          </div>

          {/* Legal links */}
          <div className="glass rounded-2xl px-5 py-4 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-muted-foreground">
            <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">{t("app.userDashboard.privacyPolicy", "Privacy Policy")}</a>
            <span className="text-white/15">|</span>
            <a href="/terms-of-use" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">{t("app.userDashboard.termsOfUse", "Terms of Use")}</a>
            <span className="text-white/15">|</span>
            <a href="/contact" target="_blank" rel="noopener noreferrer" className="hover:text-gold transition-colors">{t("app.userDashboard.fullContactPage", "Full Contact Page")}</a>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ─── Main Component ─────────────────────────────────── */
export default function UserDashboardPage() {
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useAuth();
  const displayName = user?.fullName || t("app.userDashboard.welcome_back_name", "Guest");
  const displayLetter = displayName ? displayName.charAt(0).toUpperCase() : "U";
  const displayEmail = user?.email || "";

  const [activeNav, setActiveNav] = useState("dashboard");
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);

  // Auto-collapse sidebar on smaller screens, but keep it visible
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  function renderContent() {
    switch (activeNav) {
      case "dashboard":   return <DashboardView onNavigate={setActiveNav} />;
      case "suites":      return <SuitesView />;
      case "my-bookings": return <BookingListView bookings={[]} title={t("app.userDashboard.myBookings", "My Bookings")} fetchFromApi />;
      case "upcoming":    return <BookingListView bookings={[]} title={t("app.userDashboard.upcomingBookings", "Upcoming Bookings")} fetchFromApi statusFilter="upcoming" />;
      case "past":        return <BookingListView bookings={[]} title={t("app.userDashboard.pastBookings", "Past Bookings")} fetchFromApi statusFilter="past" />;
      case "wallet":      return <WalletView />;
      case "packages":    return <CelebrationPackagesView />;
      case "offers":      return <OffersView />;
      case "profile":     return <ProfileView />;
      case "help":        return <HelpView />;
      default:            return <DashboardView onNavigate={setActiveNav} />;
    }
  }

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-[var(--background)]">
      {/* Top bar */}
      <header className="sticky top-0 z-50 flex items-center justify-between px-6 py-4 border-b border-white/5 glass backdrop-blur-xl">
        <div className="flex items-center gap-4">
          {/* Mobile toggle */}
          <button onClick={() => setSidebarOpen((o) => !o)}
            className="flex lg:hidden flex-col justify-center items-center gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors group"
            aria-label="Toggle menu">
            <span className={`block h-0.5 bg-muted-foreground group-hover:bg-gold transition-all duration-300 ${sidebarOpen ? "w-5 translate-y-[7px] rotate-45" : "w-5"}`} />
            <span className={`block h-0.5 bg-muted-foreground group-hover:bg-gold transition-all duration-300 ${sidebarOpen ? "w-0 opacity-0" : "w-5"}`} />
            <span className={`block h-0.5 bg-muted-foreground group-hover:bg-gold transition-all duration-300 ${sidebarOpen ? "w-5 -translate-y-[7px] -rotate-45" : "w-5"}`} />
          </button>
          {/* Desktop toggle */}
          <button onClick={() => setSidebarCollapsed((c) => !c)}
            className="hidden lg:flex h-8 w-8 items-center justify-center rounded-lg hover:bg-white/[0.07] text-muted-foreground hover:text-gold transition cursor-pointer"
            aria-label="Toggle sidebar">
            <Menu className="h-4 w-4" />
          </button>
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 shrink-0 rounded-lg overflow-hidden">
              <img src="/logo.png" alt="VibeNests" className="h-full w-full object-contain" />
            </div>
            <div className="leading-tight">
              <p className="font-display text-sm font-semibold tracking-[0.15em] text-gradient-gold">VIBENESTS</p>
              <p className="text-[9px] tracking-[0.25em] text-muted-foreground uppercase">{t("app.userDashboard.brandSub", "Private Luxury Suites")}</p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <LanguageSelector />
          <button className="relative h-9 w-9 rounded-xl glass flex items-center justify-center text-muted-foreground hover:text-gold transition-colors">
            <Bell className="h-4 w-4" />
            <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-gold" />
          </button>
          <div className="relative">
            <button
              onClick={() => setProfileOpen((o) => !o)}
              className="h-9 w-9 rounded-xl bg-gradient-gold flex items-center justify-center font-bold text-[oklch(0.12_0.02_260)] text-sm hover:opacity-80 transition-opacity">
              {displayLetter}
            </button>
            <AnimatePresence>
              {profileOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileOpen(false)} />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute right-0 top-11 z-50 w-44 glass-card rounded-xl border border-white/10 py-1 shadow-xl"
                  >
                    <button
                      onClick={() => { navigate("/login"); setProfileOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-colors">
                      <LogOut className="h-4 w-4 shrink-0" /> {t("app.userDashboard.logout", "Logout")}
                    </button>
                    <button
                      onClick={() => setProfileOpen(false)}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-muted-foreground hover:text-foreground hover:bg-white/5 transition-colors">
                      <X className="h-4 w-4 shrink-0" /> {t("app.userDashboard.cancel", "Cancel")}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      {/* Body */}
      <div className="flex flex-1 relative min-h-0">
        {/* Mobile overlay */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 z-30 lg:hidden" onClick={() => setSidebarOpen(false)} />
          )}
        </AnimatePresence>

        {/* Sidebar — always visible on desktop (collapsible), slide-in on mobile */}
        <aside className={`absolute lg:relative top-0 left-0 h-full z-40 flex flex-col shrink-0 glass-card border-r border-white/5 rounded-none transition-all duration-300 ease-in-out
          ${sidebarOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"}
          ${sidebarCollapsed ? "lg:w-16" : "w-64"}`}>
          <div className="flex items-center justify-between border-b border-white/5 min-h-[64px] px-3 py-4">
            {!sidebarCollapsed ? (
              <div className="flex items-center gap-3 p-2 rounded-xl glass flex-1 min-w-0 border border-white/5">
                <div className="h-9 w-9 rounded-full bg-gradient-gold flex items-center justify-center font-bold text-[oklch(0.12_0.02_260)] text-sm shrink-0">{displayLetter}</div>
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground truncate">{displayName}</p>
                  {displayEmail && <p className="text-[10px] text-muted-foreground truncate">{displayEmail}</p>}
                </div>
              </div>
            ) : (
              <div className="h-9 w-9 mx-auto rounded-full bg-gradient-gold flex items-center justify-center font-bold text-[oklch(0.12_0.02_260)] text-sm shrink-0">{displayLetter}</div>
            )}
            <button onClick={() => setSidebarOpen(false)}
              className="flex lg:hidden flex-col justify-center items-center gap-[5px] p-2 rounded-lg hover:bg-white/5 transition-colors group ml-2 shrink-0"
              aria-label="Close menu">
              <span className="block w-5 h-0.5 bg-muted-foreground group-hover:bg-gold transition-colors" />
              <span className="block w-5 h-0.5 bg-muted-foreground group-hover:bg-gold transition-colors" />
              <span className="block w-5 h-0.5 bg-muted-foreground group-hover:bg-gold transition-colors" />
            </button>
          </div>

          <nav className="flex-1 px-2 py-4 space-y-1 overflow-y-auto scrollbar-none">
            {NAV_ITEMS.map(({ id, label, icon: Icon }) => {
              const active = activeNav === id;
              const translatedLabel =
                id === "dashboard" ? t("app.userDashboard.dashboard", "Dashboard") :
                id === "suites" ? t("app.userDashboard.browseSuites", "Browse Suites") :
                id === "my-bookings" ? t("app.userDashboard.myBookings", "My Bookings") :
                id === "upcoming" ? t("app.userDashboard.upcomingBookings", "Upcoming Bookings") :
                id === "past" ? t("app.userDashboard.pastBookings", "Past Bookings") :
                id === "wallet" ? t("app.userDashboard.walletPayments", "Wallet & Payments") :
                id === "packages" ? t("app.userDashboard.celebrationPackages", "Celebration Packages") :
                id === "offers" ? t("app.userDashboard.specialOffersReferrals", "Special Offers & Referrals") :
                id === "profile" ? t("app.userDashboard.profileSettings", "Profile Settings") :
                id === "help" ? t("app.userDashboard.helpSupport", "Help & Support") :
                id === "write-review" ? t("app.userDashboard.writeReview", "Write a Review") :
                label;

              return (
                <button key={id}
                  title={sidebarCollapsed ? translatedLabel : undefined}
                  onClick={() => {
                    if (id === "write-review") { navigate("/user/write-review"); setSidebarOpen(false); return; }
                    setActiveNav(id); setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-2.5 py-2.5 border rounded-xl text-sm transition-all
                    ${sidebarCollapsed ? "justify-center" : ""}
                    ${active ? "bg-gold/15 border-gold/25 text-gold font-medium" : "border-transparent text-muted-foreground hover:bg-white/5 hover:text-foreground"}`}>
                  <Icon className={`h-4 w-4 shrink-0 ${active ? "text-gold" : ""}`} />
                  {!sidebarCollapsed && translatedLabel}
                </button>
              );
            })}
          </nav>

          <div className="px-2 pb-6 pt-2 border-t border-white/5">
            <button onClick={() => navigate("/login")}
              title={sidebarCollapsed ? t("app.userDashboard.logout", "Logout") : undefined}
              className={`w-full flex items-center gap-3 px-2.5 py-2.5 border border-transparent rounded-xl text-sm text-muted-foreground hover:text-rose-400 hover:bg-rose-500/10 transition-all ${sidebarCollapsed ? "justify-center" : ""}`}>
              <LogOut className="h-4 w-4 shrink-0" />
              {!sidebarCollapsed && t("app.userDashboard.logout", "Logout")}
            </button>
          </div>
        </aside>

        {/* Page content */}
        <main className="flex-1 p-6 lg:p-8 overflow-y-auto min-h-0">
          <AnimatePresence mode="wait">
            <motion.div key={activeNav} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.2 }}>
              {renderContent()}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
