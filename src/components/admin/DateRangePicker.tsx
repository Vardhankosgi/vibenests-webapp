import { useState, useRef, useEffect } from "react";
import { Calendar, ChevronDown, ChevronLeft, ChevronRight } from "lucide-react";
import { createPortal } from "react-dom";
import { useTranslation } from "react-i18next";

const presets = [
  { label: "Today", getDates: () => { const d = new Date(); return { from: d, to: d }; } },
  { label: "Last 7 Days", getDates: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 6); return { from, to }; } },
  { label: "Last 30 Days", getDates: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 29); return { from, to }; } },
  { label: "This Month", getDates: () => { const now = new Date(); return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0) }; } },
  { label: "Last Month", getDates: () => { const now = new Date(); return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0) }; } },
];

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];
const DAYS = ["Su","Mo","Tu","We","Th","Fr","Sa"];

function fmt(d: Date) {
  return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
}

function sameDay(a: Date, b: Date) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

interface DateRangePickerProps {
  value?: { from: Date; to: Date } | null;
  onChange?: (range: { from: Date; to: Date }) => void;
}

export function DateRangePicker({ value, onChange }: DateRangePickerProps = {}) {
  const { t } = useTranslation();
  const presets = [
    { labelKey: "today", label: "Today", getDates: () => { const d = new Date(); return { from: d, to: d }; } },
    { labelKey: "last7Days", label: "Last 7 Days", getDates: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 6); return { from, to }; } },
    { labelKey: "last30Days", label: "Last 30 Days", getDates: () => { const to = new Date(); const from = new Date(); from.setDate(from.getDate() - 29); return { from, to }; } },
    { labelKey: "thisMonth", label: "This Month", getDates: () => { const now = new Date(); return { from: new Date(now.getFullYear(), now.getMonth(), 1), to: new Date(now.getFullYear(), now.getMonth() + 1, 0) }; } },
    { labelKey: "lastMonth", label: "Last Month", getDates: () => { const now = new Date(); return { from: new Date(now.getFullYear(), now.getMonth() - 1, 1), to: new Date(now.getFullYear(), now.getMonth(), 0) }; } },
  ];
  const MONTHS_T = [
    t("app.admin.monthJan", "January"), t("app.admin.monthFeb", "February"), t("app.admin.monthMar", "March"),
    t("app.admin.monthApr", "April"), t("app.admin.monthMay", "May"), t("app.admin.monthJun", "June"),
    t("app.admin.monthJul", "July"), t("app.admin.monthAug", "August"), t("app.admin.monthSep", "September"),
    t("app.admin.monthOct", "October"), t("app.admin.monthNov", "November"), t("app.admin.monthDec", "December"),
  ];
  const DAYS_T = [
    t("app.admin.daySu", "Su"), t("app.admin.dayMo", "Mo"), t("app.admin.dayTu", "Tu"),
    t("app.admin.dayWe", "We"), t("app.admin.dayTh", "Th"), t("app.admin.dayFr", "Fr"), t("app.admin.daySa", "Sa"),
  ];
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [from, setFrom] = useState<Date>(new Date(today.getFullYear(), today.getMonth(), 1));
  const [to, setTo] = useState<Date>(today);

  const displayFrom = value ? value.from : from;
  const displayTo = value ? value.to : to;
  const [hovered, setHovered] = useState<Date | null>(null);
  const [selecting, setSelecting] = useState<"from" | "to" | null>(null);
  const [viewYear, setViewYear] = useState(today.getFullYear());
  const [viewMonth, setViewMonth] = useState(today.getMonth());
  const [activePreset, setActivePreset] = useState("This Month");
  const btnRef = useRef<HTMLButtonElement>(null);
  const [pos, setPos] = useState({ top: 0, right: 0 });

  useEffect(() => {
    if (open && btnRef.current) {
      const r = btnRef.current.getBoundingClientRect();
      setPos({ top: r.bottom + 8, right: window.innerWidth - r.right });
    }
  }, [open]);

  function applyPreset(p: typeof presets[0]) {
    const { from: f, to: t2 } = p.getDates();
    setFrom(f); setTo(t2);
    setActivePreset(p.label);
    setSelecting(null);
  }

  function getDaysInMonth(y: number, m: number) {
    return new Date(y, m + 1, 0).getDate();
  }

  function getFirstDay(y: number, m: number) {
    return new Date(y, m, 1).getDay();
  }

  function handleDayClick(d: Date) {
    if (!selecting || selecting === "from") {
      setFrom(d); setTo(d); setSelecting("to"); setActivePreset("");
    } else {
      if (d < from) { setFrom(d); setTo(from); } else { setTo(d); }
      setSelecting(null);
    }
  }

  function isInRange(d: Date) {
    const end = selecting === "to" && hovered ? hovered : displayTo;
    const start = displayFrom;
    return d > (start < end ? start : end) && d < (start < end ? end : start);
  }

  const daysInMonth = getDaysInMonth(viewYear, viewMonth);
  const firstDay = getFirstDay(viewYear, viewMonth);

  return (
    <>
      <button
        ref={btnRef}
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 px-3 py-2 rounded-xl border border-[var(--gold)]/25 bg-white/[0.03] hover:border-[var(--gold)]/50 hover:bg-white/[0.06] transition-all text-sm text-foreground"
      >
        <Calendar className="h-4 w-4 text-gold shrink-0" />
        <span className="hidden sm:block text-xs">
          {fmt(displayFrom)} — {fmt(displayTo)}
        </span>
        <ChevronDown className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${open ? "rotate-180" : ""}`} />
      </button>

      {open && createPortal(
        <>
          <div className="fixed inset-0 z-[9998]" onClick={() => setOpen(false)} />
          <div
            className="fixed z-[9999] glass-card rounded-2xl border border-[var(--gold)]/20 shadow-2xl flex overflow-hidden"
            style={{ top: pos.top, right: pos.right, width: 560 }}
          >
            {/* Presets */}
            <div className="w-40 border-r border-[var(--gold)]/10 p-3 flex flex-col gap-1">
              <p className="text-[10px] tracking-widest text-muted-foreground uppercase px-2 mb-2">{t("app.admin.quickSelect", "Quick Select")}</p>
              {presets.map((p) => (
                <button
                  key={p.label}
                  onClick={() => applyPreset(p)}
                  className={`text-left px-3 py-2 rounded-lg text-xs transition-all ${
                    activePreset === p.label
                      ? "bg-[var(--gold)]/15 text-gold border border-[var(--gold)]/25"
                      : "text-muted-foreground hover:text-foreground hover:bg-white/[0.05]"
                  }`}
                >
                  {t("app.admin.preset_" + p.labelKey, p.label)}
                </button>
              ))}
            </div>

            {/* Calendar */}
            <div className="flex-1 p-4">
              {/* Month nav */}
              <div className="flex items-center justify-between mb-4">
                <button
                  onClick={() => { if (viewMonth === 0) { setViewMonth(11); setViewYear(y => y - 1); } else setViewMonth(m => m - 1); }}
                  className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/[0.07] text-muted-foreground hover:text-gold transition"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <span className="font-display text-sm font-medium text-foreground">
                  {MONTHS_T[viewMonth]} {viewYear}
                </span>
                <button
                  onClick={() => { if (viewMonth === 11) { setViewMonth(0); setViewYear(y => y + 1); } else setViewMonth(m => m + 1); }}
                  className="h-7 w-7 flex items-center justify-center rounded-lg hover:bg-white/[0.07] text-muted-foreground hover:text-gold transition"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              {/* Day headers */}
              <div className="grid grid-cols-7 mb-1">
                {DAYS_T.map((d) => (
                  <div key={d} className="text-center text-[10px] text-muted-foreground py-1">{d}</div>
                ))}
              </div>

              {/* Days grid */}
              <div className="grid grid-cols-7 gap-y-1">
                {Array.from({ length: firstDay }).map((_, i) => <div key={`e${i}`} />)}
                {Array.from({ length: daysInMonth }).map((_, i) => {
                  const d = new Date(viewYear, viewMonth, i + 1);
                  const isFrom = sameDay(d, displayFrom);
                  const isTo = sameDay(d, displayTo);
                  const inRange = isInRange(d);
                  const isToday = sameDay(d, today);
                  return (
                    <button
                      key={i}
                      onClick={() => handleDayClick(d)}
                      onMouseEnter={() => selecting === "to" && setHovered(d)}
                      onMouseLeave={() => setHovered(null)}
                      className={`relative h-8 w-full text-xs rounded-lg transition-all
                        ${isFrom || isTo ? "bg-[var(--gold)] text-[oklch(0.12_0.02_260)] font-semibold" : ""}
                        ${inRange ? "bg-[var(--gold)]/15 text-gold rounded-none" : ""}
                        ${!isFrom && !isTo && !inRange ? "text-foreground/80 hover:bg-white/[0.07]" : ""}
                        ${isToday && !isFrom && !isTo ? "ring-1 ring-[var(--gold)]/40" : ""}
                      `}
                    >
                      {i + 1}
                    </button>
                  );
                })}
              </div>

              {/* Footer */}
              <div className="mt-4 pt-3 border-t border-[var(--gold)]/10 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {fmt(displayFrom)} — {fmt(displayTo)}
                </span>
                <button
                  onClick={() => { onChange?.({ from, to }); setOpen(false); }}
                  className="gold-btn px-4 py-1.5 rounded-lg text-xs font-semibold"
                >
                  {t("app.admin.apply", "Apply")}
                </button>
              </div>
            </div>
          </div>
        </>,
        document.body
      )}
    </>
  );
}
