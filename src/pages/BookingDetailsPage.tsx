import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Eye, ArrowLeft, CheckCircle2, XCircle, CalendarDays, Wallet, User, Phone, Mail, Ticket } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { bookingsApi } from "@/lib/api";


const statusStyle: Record<string, string> = {
  Confirmed: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Pending: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  Cancelled: "bg-destructive/10 text-destructive border-destructive/20",
};

export default function BookingDetailsPage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const bookingId = useMemo(() => (id ? Number(String(id).replace(/^#VN/, "")) : NaN), [id]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [booking, setBooking] = useState<any>(null);
  const [resolvedGuest, setResolvedGuest] = useState<{ fullName?: string; email?: string; phone?: string } | null>(null);
  const [resolvedAddOns, setResolvedAddOns] = useState<Array<{ name: string; price?: number; quantity?: number }> | null>(null);

  const [actionLoading, setActionLoading] = useState(false);
  const [actionError, setActionError] = useState("");






  useEffect(() => {
    if (!id) return;

    (async () => {
      try {
        setLoading(true);
        setError("");

        // backend: GET /bookings/:id
        const res = await bookingsApi.getById(id);
        setBooking(res);

        // Resolve guest details:
        // - If admin-created booking has guestFirstName/guestLastName/email/phone, use them.
        // - Otherwise, fall back to linked user data (booking.user).
        const fullNameFromGuest = [res?.guestFirstName, res?.guestLastName].filter(Boolean).join(" ");
        const guestHasAny = Boolean(
          res?.guestFirstName || res?.guestLastName || res?.guestEmail || res?.guestPhone
        );

        const resolvedGuestObj = {
          fullName: guestHasAny ? fullNameFromGuest : res?.user?.fullName,
          email: guestHasAny ? res?.guestEmail : res?.user?.email,
          phone: guestHasAny ? res?.guestPhone : res?.user?.phone,
        };
        setResolvedGuest(resolvedGuestObj);

        // Resolve add-ons (name + quantity if backend provides it)
        // Current backend Booking entity stores `addOns` as string[] of IDs.
        // If backend also returns `addOnsDetails` (name/quantity), prefer it.
        const addOnsDetails = Array.isArray(res?.addOnsDetails) ? res.addOnsDetails : null;
        if (addOnsDetails) {
          setResolvedAddOns(addOnsDetails);
        } else {
          // Backend should provide addOnsDetails (name + price + quantity).
          // If not available, fall back to displaying IDs as names with unknown pricing.
          const ids = Array.isArray(res?.addOns) ? res.addOns : [];
          setResolvedAddOns(ids.map((x: any) => ({ name: String(x), quantity: 1 })));
        }
      } catch (e: any) {
        setError(e?.message || "Failed to load booking details");
      } finally {
        setLoading(false);
      }
    })();
  }, [id]);


  function formatMoney(v: any) {
    const n = typeof v === "number" ? v : parseFloat(String(v || 0));
    if (Number.isNaN(n)) return "₹0";
    return `₹${n.toLocaleString("en-IN")}`;
  }

  const status = booking?.status
    ? String(booking.status).charAt(0).toUpperCase() + String(booking.status).slice(1)
    : "";

  const normalizedBookingStatus = booking?.status ? String(booking.status).toLowerCase() : "";


  const advancePaid = booking?.paymentMode === "pay_at_venue" ? Number(booking?.advanceAmount ?? 0) : 0;
  const totalPaid = booking?.paymentMode === "pay_now" ? Number(booking?.totalAmount ?? 0) : advancePaid;
  const pendingAmount = Math.max(Number(booking?.totalAmount ?? 0) - totalPaid, 0);

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Booking Details" />

      <div className="p-6 space-y-4">
        <button
          onClick={() => navigate("/bookings")}
          className="flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition border border-white/10 hover:border-[var(--gold)]/30 px-3 py-2 rounded-lg"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to Bookings
        </button>

        {loading && (
          <div className="glass-card rounded-2xl p-6 text-sm text-muted-foreground flex items-center gap-2">
            <Eye className="h-4 w-4" /> Loading...
          </div>
        )}

        {!loading && error && (
          <div className="glass-card rounded-2xl p-6 text-sm text-destructive border border-destructive/30 bg-destructive/10">
            {error}
          </div>
        )}

        {!loading && !error && booking && (
          <div className="glass-card rounded-2xl p-6 space-y-5">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2">
                  <Ticket className="h-4 w-4 text-gold" />
                  <h2 className="font-display text-lg">Booking {booking.id ? `#${booking.id}` : bookingId ? `#${bookingId}` : ""}</h2>
                </div>
                <p className="text-xs text-muted-foreground mt-1">View all details for this booking</p>
              </div>

              <div className="flex items-center gap-2">
                {status && (
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${statusStyle[status] || "bg-white/5 border-white/10 text-muted-foreground"}`}>
                    {status}
                  </span>
                )}
                {booking.paymentStatus && (
                  <span
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium border ${
                      booking.paymentStatus === "success" || booking.paymentStatus === "paid"
                        ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                        : "bg-amber-500/10 text-amber-400 border-amber-500/20"
                    }`}
                  >
                    {String(booking.paymentStatus).toUpperCase()}
                  </span>
                )}
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground flex items-center gap-2"><CalendarDays className="h-4 w-4" /> Date</span>
                  <span className="text-foreground">{booking.date || ""}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground flex items-center gap-2"><Ticket className="h-4 w-4" /> Time</span>
                  <span className="text-foreground">{booking.timeSlot || ""}{booking.endTimeSlot ? ` – ${booking.endTimeSlot}` : ""}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground flex items-center gap-2"><Ticket className="h-4 w-4" /> Occasion</span>
                  <span className="text-foreground">{booking.eventType || ""}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Suite</span>
                  <span className="text-foreground">{booking.suite?.name || booking.suiteName || booking.suiteId || ""}</span>
                </div>
              </div>

              <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm space-y-3">
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground flex items-center gap-2"><Wallet className="h-4 w-4" /> Total Amount</span>
                  <span className="text-foreground font-medium">{formatMoney(booking.totalAmount)}</span>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-2">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Total Paid</span>
                    <span className="text-foreground">{formatMoney(totalPaid)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Advance Paid</span>
                    <span className="text-foreground">{formatMoney(advancePaid)}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Pending Amount</span>
                    <span className="text-foreground">{formatMoney(pendingAmount)}</span>
                  </div>
                </div>

                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Base Price</span>
                  <span className="text-foreground">{formatMoney(booking.basePrice)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Add-ons Total</span>
                  <span className="text-foreground">{formatMoney(booking.addonsTotal)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Service Fee</span>
                  <span className="text-foreground">{formatMoney(booking.serviceFee)}</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <span className="text-muted-foreground">Taxes</span>
                  <span className="text-foreground">{formatMoney(booking.taxes)}</span>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Guest Details</p>
                <div className="grid md:grid-cols-2 gap-3">
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground flex items-center gap-2"><User className="h-4 w-4" /> Name</span>
                    <span className="text-foreground">{resolvedGuest?.fullName || ""}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground flex items-center gap-2"><Mail className="h-4 w-4" /> Email</span>
                    <span className="text-foreground">{resolvedGuest?.email || ""}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground flex items-center gap-2"><Phone className="h-4 w-4" /> Phone</span>
                    <span className="text-foreground">{resolvedGuest?.phone || ""}</span>
                  </div>
                  <div className="flex items-center justify-between gap-4">
                    <span className="text-muted-foreground">Persons</span>
                    <span className="text-foreground">{booking.persons ?? ""}</span>
                  </div>
                </div>

            </div>

            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Add-ons</p>
              <div className="text-foreground">
                {Array.isArray(resolvedAddOns) && resolvedAddOns.length > 0
                  ? resolvedAddOns
                      .map((a) => {
                        const qty = typeof a.quantity === "number" ? a.quantity : 1;
                        const hasPrice = typeof a.price === "number";
                        return hasPrice
                          ? `${a.name} (₹${(a.price as number).toLocaleString("en-IN")}) x${qty}`
                          : `${a.name} x${qty}`;

                      })
                      .join(", ")
                  : Array.isArray(booking.addOnsNames) && booking.addOnsNames.length > 0
                    ? booking.addOnsNames.join(", ")
                    : "No add-ons"}

              </div>
            </div>


            <div className="rounded-xl border border-white/10 bg-white/[0.02] p-4 text-sm space-y-3">
              <p className="text-xs text-muted-foreground uppercase tracking-wide">Status</p>

              <div className="flex flex-wrap items-center gap-3">
                {normalizedBookingStatus === "confirmed" ? (
                  <div className="flex items-center gap-2 text-emerald-400"><CheckCircle2 className="h-4 w-4" /> Confirmed</div>
                ) : (
                  <div className="flex items-center gap-2 text-amber-400"><XCircle className="h-4 w-4" /> {status || booking.status || ""}</div>
                )}
              </div>

              {/* Admin actions based on booking status */}
              {normalizedBookingStatus === "pending" && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    disabled={actionLoading}
                    onClick={async () => {
                      try {
                        setActionLoading(true);
                        setActionError("");
                        const resp = await bookingsApi.cancel(booking.id);
                        setBooking(resp);
                      } catch (e: any) {
                        setActionError(e?.message || "Failed to cancel booking");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm border border-white/10 text-muted-foreground hover:text-foreground transition disabled:opacity-50"
                  >
                    <XCircle className="h-4 w-4" /> Cancel
                  </button>

                  <button
                    disabled={actionLoading}
                    onClick={async () => {
                      try {
                        setActionLoading(true);
                        setActionError("");
                        const resp = await bookingsApi.updateStatus(booking.id, "confirmed");
                        setBooking(resp);
                      } catch (e: any) {
                        setActionError(e?.message || "Failed to confirm booking");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="flex items-center gap-2 gold-btn px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Confirm
                  </button>
                </div>
              )}

              {normalizedBookingStatus === "confirmed" && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    disabled={actionLoading}
                    onClick={async () => {
                      try {
                        setActionLoading(true);
                        setActionError("");

                        // confirmed -> check-out (completed in backend)
                        const resp = await bookingsApi.updateStatus(booking.id, "completed");
                        setBooking(resp);
                      } catch (e: any) {
                        setActionError(e?.message || "Failed to check-out booking");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="flex items-center gap-2 gold-btn px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Check-in
                  </button>
                </div>
              )}

              {normalizedBookingStatus === "check-in" && (
                <div className="flex flex-wrap items-center gap-3 pt-2">
                  <button
                    disabled={actionLoading}
                    onClick={async () => {
                      try {
                        setActionLoading(true);
                        setActionError("");

                        await bookingsApi.updateStatus(booking.id, "completed");
                        const resp = await bookingsApi.getById(booking.id);
                        setBooking(resp);
                      } catch (e: any) {
                        setActionError(e?.message || "Failed to check-out booking");
                      } finally {
                        setActionLoading(false);
                      }
                    }}
                    className="flex items-center gap-2 gold-btn px-4 py-2 rounded-lg text-sm font-semibold disabled:opacity-50"
                  >
                    <CheckCircle2 className="h-4 w-4" /> Check-out
                  </button>
                </div>
              )}

              {actionError && (
                <div className="text-sm text-destructive pt-2">{actionError}</div>
              )}
            </div>

          </div>
        )}
      </div>
    </div>
  );
}

