import { useState, useEffect, useMemo } from "react";
import { useNavigate, useParams, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { useTranslation } from "react-i18next";
import { Clock, CalendarDays, ArrowLeft, BedDouble } from "lucide-react";
import { bookingsApi, suitesApi } from "@/lib/api";

function generateSlots(startTime: string, endTime: string, durationMins: number, gapMins: number = 30): string[] {
  const slots: string[] = [];
  
  // Extract only numbers from the string to handle formats like "09:00 AM" or "09:00:00"
  const parseTime = (t: string) => {
    const parts = t.replace(/[^0-9:]/g, "").split(":");
    return [Number(parts[0] || 0), Number(parts[1] || 0)];
  };

  const [sh, sm] = parseTime(startTime);
  const [eh, em] = parseTime(endTime);
  
  if (isNaN(sh) || isNaN(sm) || isNaN(eh) || isNaN(em)) return [];

  let cur = sh * 60 + sm;
  let end = eh * 60 + em;
  
  if (end < cur) {
    end += 24 * 60;
  }
  
  const step = durationMins + gapMins;
  // Prevent infinite loop if step is 0 or negative
  if (step <= 0) return [];
  
  // Failsafe to prevent more than 100 slots in case of weird data
  let count = 0;
  
  while (cur + durationMins <= end && count++ < 100) {
    const hh = Math.floor(cur / 60) % 24;
    const mm = cur % 60;
    const period = hh >= 12 ? "PM" : "AM";
    const dh = hh > 12 ? hh - 12 : hh === 0 ? 12 : hh;
    slots.push(`${String(dh).padStart(2, "0")}:${String(mm).padStart(2, "0")} ${period}`);
    cur += step;
  }
  return slots;
}

export default function ReschedulePage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { id } = useParams();
  const location = useLocation();

  // Booking details passed from previous page
  const booking = location.state?.booking;

  const [date, setDate] = useState<string>(booking?.date || booking?.checkIn || "");
  const [timeSlot, setTimeSlot] = useState<string>(booking?.timeSlot || booking?.checkInTime || "");
  const initialDate = booking?.date || booking?.checkIn || "";
  const initialTimeSlot = booking?.timeSlot || booking?.checkInTime || "";

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  const [fullSuite, setFullSuite] = useState<any>(booking?.suite || null);
  const [blockedSlots, setBlockedSlots] = useState<string[]>([]);
  
  const suiteId = booking?.suite?.id ?? booking?.suiteId ?? booking?.suite_id ?? null;

  useEffect(() => {
    if (suiteId && (!fullSuite?.slotDurationMins || !fullSuite?.slotStartTime)) {
      suitesApi.getById(suiteId).then(data => {
        if (data) setFullSuite(data);
      }).catch(console.error);
    }
  }, [suiteId, fullSuite]);

  const slotDurationMins: number = Number(fullSuite?.slotDurationMins ?? fullSuite?.slotDuration ?? 150);
  const gapMins: number = Number(fullSuite?.gapBetweenSlotsMins ?? fullSuite?.gapBetweenSlots ?? 30);

  const timeSlots: string[] = useMemo(() => {
    if (!fullSuite) return [];
    const start = fullSuite.slotStartTime ?? fullSuite.slot_start_time ?? '09:00 AM';
    const end = fullSuite.slotEndTime ?? fullSuite.slot_end_time ?? '21:00 PM';
    return generateSlots(String(start), String(end), slotDurationMins, gapMins);
  }, [fullSuite, slotDurationMins, gapMins]);

  useEffect(() => {
    if (!suiteId || !date) return;

    (async () => {
      try {
        const anyBookingsApi: any = bookingsApi as any;
        const getBlockedSlots = anyBookingsApi?.getBlockedSlots;
        if (typeof getBlockedSlots !== "function") return;
        const slots: unknown = await getBlockedSlots(suiteId, date);
        setBlockedSlots(Array.isArray(slots) ? (slots as string[]) : []);
      } catch {
        setBlockedSlots([]);
      }
    })();
  }, [suiteId, date]);

  useEffect(() => {
    const isCurrent = timeSlot === initialTimeSlot && date === initialDate;
    if (blockedSlots.includes(timeSlot) && !isCurrent) {
      setTimeSlot("");
    }
  }, [blockedSlots, timeSlot, initialTimeSlot, date, initialDate]);

  const submitEnabled = Boolean(date) && Boolean(timeSlot) && (!blockedSlots.includes(timeSlot) || (date === initialDate && timeSlot === initialTimeSlot)) && !loading;

  async function handleSubmit() {
    if (!id) return;
    setLoading(true);
    setError("");
    try {
      if (date === initialDate && timeSlot === initialTimeSlot) {
        navigate("/user/dashboard");
        return;
      }
      if (blockedSlots.includes(timeSlot)) {
        throw new Error(t("app.userDashboard.rescheduleSlotBlocked", "Selected slot is unavailable.") as string);
      }
      await bookingsApi.reschedule(Number(id), { date, timeSlot });
      navigate("/user/dashboard");
    } catch (e: any) {
      setError(e?.message || "Unable to reschedule booking");
    } finally {
      setLoading(false);
    }
  }

  if (!booking || (booking.rescheduleCount || 0) >= 1) {
    return (
      <div className="min-h-screen bg-[oklch(0.08_0.015_260)] flex flex-col items-center justify-center text-white">
        <p className="text-muted-foreground mb-4">{!booking ? "No booking data found." : "This booking has already been rescheduled once."}</p>
        <button onClick={() => navigate("/user/dashboard")} className="text-gold border border-gold/30 px-4 py-2 rounded-xl">Back to Dashboard</button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[oklch(0.08_0.015_260)] pb-20 sm:pb-8 pt-6 px-4">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <button onClick={() => navigate("/user/dashboard")} className="h-10 w-10 flex items-center justify-center rounded-2xl border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:bg-white/10 transition-colors">
            <ArrowLeft className="h-4 w-4" />
          </button>
          <div>
            <h1 className="font-display text-2xl font-semibold text-foreground">{t("app.userDashboard.rescheduleBooking", "Reschedule Booking")}</h1>
            <p className="text-sm text-muted-foreground mt-0.5">{t("app.userDashboard.rescheduleHint", "Change only the date and time slot. Payment remains the same.")}</p>
          </div>
        </div>

        {/* Current Booking Info */}
        <div className="glass-card rounded-3xl border border-white/10 p-5 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-2xl bg-gold/10 flex items-center justify-center">
              <BedDouble className="h-5 w-5 text-gold" />
            </div>
            <div>
              <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-0.5">Current Booking</p>
              <h3 className="font-display text-lg text-foreground">{fullSuite?.name || "Suite"}</h3>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2 border-t border-white/5">
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Date</p>
              <p className="text-sm font-medium text-foreground">{initialDate}</p>
            </div>
            <div>
              <p className="text-[10px] uppercase tracking-widest text-muted-foreground mb-1">Time Slot</p>
              <p className="text-sm font-medium text-foreground">{initialTimeSlot}</p>
            </div>
          </div>
        </div>

        {/* Selection Area */}
        <motion.div
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
          className="glass-card rounded-3xl p-6 space-y-6 border border-gold/20"
        >
          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
              <CalendarDays className="h-3.5 w-3.5 text-gold" />
              {t("app.userDashboard.chooseDate", "Choose Date")}
            </label>
            <input
              type="date"
              value={date}
              min={new Date().toISOString().split('T')[0]}
              onChange={(e) => setDate(e.target.value)}
              className="luxury-input w-full rounded-2xl px-5 py-3.5 text-sm bg-black/40"
              style={{ colorScheme: 'dark' }}
            />
          </div>

          <div className="space-y-3">
            <label className="text-[11px] uppercase tracking-widest text-muted-foreground font-semibold flex items-center gap-2">
              <Clock className="h-3.5 w-3.5 text-gold" />
              {t("app.userDashboard.chooseTimeSlot", "Choose Time Slot")}
            </label>
            {timeSlots.length === 0 ? (
              <div className="text-sm text-muted-foreground border border-dashed border-white/10 rounded-2xl px-4 py-8 text-center">
                {t("app.userDashboard.noTimeSlots", "No slots available for this suite")}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {timeSlots.map((s) => {
                  const isCurrent = s === initialTimeSlot && date === initialDate;
                  const isBooked = blockedSlots.includes(s);
                  let isPast = false;
                  if (date) {
                    const now = new Date();
                    const sel = new Date(date);
                    if (!isNaN(sel.getTime()) && now.toDateString() === sel.toDateString()) {
                      const parts = s.trim().split(/\s+/);
                      if (parts.length >= 2) {
                        const [hStr, mStr] = parts[0].split(':');
                        const period = String(parts[1]).toUpperCase();
                        let startHours24 = (Number(hStr) % 12) + (period === 'PM' ? 12 : 0);
                        const slotEnd = new Date(sel);
                        slotEnd.setHours(startHours24, Number(mStr), 0, 0);
                        slotEnd.setMinutes(slotEnd.getMinutes() + slotDurationMins);
                        if (now.getTime() > slotEnd.getTime()) isPast = true;
                      }
                    }
                  }
                  const isBlocked = (isBooked && !isCurrent) || isPast;
                  const active = timeSlot === s;
                  return (
                    <button
                      key={s}
                      type="button"
                      disabled={isBlocked}
                      onClick={() => setTimeSlot(s)}
                      className={`px-4 py-3.5 rounded-2xl border text-sm transition-all flex justify-between items-center text-left ${isBlocked
                          ? 'border-white/5 bg-white/[0.01] text-muted-foreground/45 opacity-45 cursor-not-allowed'
                          : active
                            ? 'border-gold bg-gold/15 text-gold shadow-[0_0_16px_rgba(212,160,60,0.2)]'
                            : 'border-white/10 bg-white/5 text-muted-foreground hover:border-gold/40 hover:text-foreground hover:bg-white/10'
                        }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <Clock className={`h-4 w-4 shrink-0 ${active ? 'text-gold' : isBlocked ? 'text-muted-foreground/35' : 'text-gold/40'}`} />
                        <span className="truncate font-medium">{s}</span>
                      </div>
                      <span className={`text-[10px] px-2 py-0.5 rounded-full border transition-colors whitespace-nowrap ml-2 font-semibold ${
                        isCurrent 
                          ? "border-blue-400/40 bg-blue-500/10 text-blue-400"
                          : isBlocked
                          ? "border-rose-500/20 bg-rose-500/10 text-rose-400"
                          : active
                          ? "border-gold/40 bg-gold/10 text-gold"
                          : "border-emerald-500/20 bg-emerald-500/10 text-emerald-400"
                      }`}>
                        {isCurrent ? "Current" : isBlocked ? "Booked" : "Available"}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-rose-400 font-medium bg-rose-500/10 border border-rose-500/20 p-3 rounded-xl">{error}</p>}

          <div className="pt-4 border-t border-white/5">
            <button
              type="button"
              onClick={handleSubmit}
              disabled={!submitEnabled}
              className="w-full flex items-center justify-center gap-2 rounded-2xl border border-gold bg-gold text-black font-semibold hover:bg-gold/90 transition-all px-4 py-3.5 text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="h-5 w-5 animate-spin rounded-full border-2 border-black border-t-transparent" />
              ) : (
                <>
                  <CalendarDays className="h-4 w-4" />
                  {t("app.userDashboard.confirmReschedule", "Confirm Reschedule")}
                </>
              )}
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
