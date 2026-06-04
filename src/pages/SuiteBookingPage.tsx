import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AdminHeader } from "@/components/admin/AdminHeader";
import {
  CalendarDays,
  ChevronLeft,
  ChevronRight,
  Clock,
  CreditCard,
  Gift,
  MessageSquare,
  Star,
  Sparkles,
  Users,
  User,
  Plus,
  Minus,
} from "lucide-react";

const OCCASIONS = [
  {
    id: "birthday",
    label: "Birthday",
    description: "Elevate every milestone with regal decor and premium service.",
    icon: Gift,
    highlight: "bg-amber-500/10 text-amber-300",
  },
  {
    id: "anniversary",
    label: "Anniversary",
    description: "Curated romance with intimate touches and champagne delights.",
    icon: Sparkles,
    highlight: "bg-rose-500/10 text-rose-300",
  },
  {
    id: "proposal",
    label: "Proposal",
    description: "A private setting designed for unforgettable moments.",
    icon: Star,
    highlight: "bg-cyan-500/10 text-cyan-300",
  },
  {
    id: "baby-shower",
    label: "Baby Shower",
    description: "Gentle luxury with pastel styling and thoughtful details.",
    icon: User,
    highlight: "bg-violet-500/10 text-violet-300",
  },
  {
    id: "corporate",
    label: "Corporate Events",
    description: "Executive event spaces with premium AV and hospitality.",
    icon: Users,
    highlight: "bg-sky-500/10 text-sky-300",
  },
  {
    id: "other",
    label: "Other Celebrations",
    description: "Bespoke styling for any exclusive experience.",
    icon: MessageSquare,
    highlight: "bg-lime-500/10 text-lime-300",
  },
];

const TIME_SLOTS = [
  "10:00 AM",
  "12:30 PM",
  "03:00 PM",
  "05:30 PM",
  "08:00 PM",
  "10:30 PM",
];

const SUITES = [
  {
    id: "S01",
    name: "Royal Celebration Suite",
    image: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?w=900&h=600&fit=crop",
    capacity: 60,
    price: 14500,
    perks: ["Private lounge", "VIP check-in", "Ambient lighting"],
  },
  {
    id: "S02",
    name: "Golden Anniversary Chamber",
    image: "https://images.unsplash.com/photo-1505693416388-ac5ce068fe85?w=900&h=600&fit=crop",
    capacity: 24,
    price: 9800,
    perks: ["Romantic dinner", "Rose petal setup", "Suite upgrade"],
  },
  {
    id: "S03",
    name: "Grand Party Pavilion",
    image: "https://images.unsplash.com/photo-1534161304597-5d5f70b0a8ba?w=900&h=600&fit=crop",
    capacity: 120,
    price: 17500,
    perks: ["Live DJ stage", "Photo zone", "Bar service"],
  },
];

const ADDONS = [
  { id: "premium-catering", name: "Premium Catering", description: "Curated gourmet menu with premium drinks.", price: 4200 },
  { id: "flower-arrangement", name: "Floral Styling", description: "Bespoke floral installation and centerpiece design.", price: 2200 },
  { id: "live-music", name: "Live Music", description: "Piano, violin or acoustic ensemble for atmosphere.", price: 3200 },
];

const STEPS = [
  "Select Occasion",
  "Choose Date & Time",
  "Select Suite",
  "Add-ons & Customizations",
  "Booking Summary",
  "Payment",
];

export default function SuiteBookingPage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(0);
  const [selectedOccasion, setSelectedOccasion] = useState<string>("");
  const [bookingDate, setBookingDate] = useState("");
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedSuite, setSelectedSuite] = useState<string>("");
  const [addonQty, setAddonQty] = useState<Record<string, number>>({
    "premium-catering": 0,
    "flower-arrangement": 0,
    "live-music": 0,
  });
  const [specialRequests, setSpecialRequests] = useState("");
  const [paymentMethod, setPaymentMethod] = useState<"pay-now" | "pay-venue">("pay-now");
  const [showValidation, setShowValidation] = useState(false);

  const suite = SUITES.find((suite) => suite.id === selectedSuite);

  const addonsTotal = ADDONS.reduce(
    (sum, addon) => sum + addon.price * (addonQty[addon.id] || 0),
    0
  );

  const basePrice = suite?.price ?? 0;
  const subtotal = basePrice + addonsTotal;
  const savings = Math.round(subtotal * 0.08);
  const serviceFee = 650;
  const taxes = Math.round((subtotal - savings + serviceFee) * 0.12);
  const grandTotal = subtotal - savings + serviceFee + taxes;

  const isStepValid = useMemo(() => {
    if (step === 0) return !!selectedOccasion;
    if (step === 1) return !!bookingDate && !!selectedTime;
    if (step === 2) return !!selectedSuite;
    if (step === 5) return !!paymentMethod;
    return true;
  }, [step, selectedOccasion, bookingDate, selectedTime, selectedSuite, paymentMethod]);

  function handleNext() {
    if (!isStepValid) {
      setShowValidation(true);
      return;
    }
    setShowValidation(false);
    if (step < STEPS.length - 1) {
      setStep((value) => value + 1);
    } else {
      setConfirmed(true);
    }
  }

  function handleBack() {
    setShowValidation(false);
    if (step > 0) setStep((value) => value - 1);
  }

  function updateQty(id: string, delta: number) {
    setAddonQty((prev) => ({
      ...prev,
      [id]: Math.max(0, (prev[id] ?? 0) + delta),
    }));
  }

  const stepLabel = STEPS[step];

  return (
    <div className="flex-1 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(255,255,255,0.05),_transparent_35%),_linear-gradient(180deg,_#050505_0%,_#070707_100%)]">
      <AdminHeader title="Suite Booking" />
      <div className="p-6">
        <div className="glass-card rounded-[2rem] border border-[var(--gold)]/15 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.25)]">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center gap-4">
              <button
                onClick={() => navigate(-1)}
                className="flex items-center gap-2 px-4 py-2 rounded-2xl border border-white/10 bg-white/5 text-muted-foreground hover:text-foreground hover:border-gold/30 transition-all text-sm"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </button>
              <div>
                <p className="text-sm uppercase tracking-[0.35em] text-muted-foreground">Premium experience</p>
                <h2 className="font-display text-3xl lg:text-4xl text-foreground font-semibold mt-2">
                  Book a luxury suite in six effortless steps
                </h2>
              </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span className="inline-flex items-center gap-2 rounded-full border border-[var(--gold)]/20 bg-white/5 px-3 py-2">
                <CreditCard className="h-4 w-4 text-gold" /> Secure booking
              </span>
              <span className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-2">
                <Sparkles className="h-4 w-4 text-cyan-300" /> Luxe support
              </span>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-[1.75fr_1fr]">
          <div className="space-y-6">
            <div className="glass-card rounded-3xl border border-[var(--gold)]/15 p-4">
              <div className="flex flex-wrap items-center gap-3">
                {STEPS.map((label, index) => (
                  <button
                    key={label}
                    type="button"
                    onClick={() => setStep(index)}
                    className={`flex-1 min-w-[120px] rounded-2xl border px-4 py-3 text-left transition-all duration-300 ${
                      index === step
                        ? "border-gold bg-gold/10 text-gold shadow-[inset_0_0_0_1px_rgba(255,218,132,0.2)]"
                        : "border-white/10 bg-black/50 text-muted-foreground hover:border-gold/20 hover:text-foreground"
                    }`}
                  >
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] font-semibold">
                      <span className={`h-6 w-6 rounded-full border text-center text-[11px] leading-6 ${index === step ? "border-gold bg-gold/10 text-gold" : "border-white/10 text-muted-foreground"}`}>
                      {index + 1}
                    </span>
                    <span>{label}</span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            <div className="glass-card rounded-3xl border border-[var(--gold)]/15 p-6 space-y-6">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-muted-foreground">Step {step + 1}</p>
                  <h3 className="font-display text-2xl text-foreground font-semibold mt-2">{stepLabel}</h3>
                </div>
                <div className="rounded-2xl bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.25em] text-muted-foreground border border-white/10">
                  {step + 1} / {STEPS.length}
                </div>
              </div>

              {step === 0 && (
                <div className="grid gap-4 md:grid-cols-2">
                  {OCCASIONS.map((occasion) => {
                    const SelectedIcon = occasion.icon;
                    const active = occasion.id === selectedOccasion;
                    return (
                      <button
                        key={occasion.id}
                        type="button"
                        onClick={() => setSelectedOccasion(occasion.id)}
                        className={`group flex flex-col gap-4 rounded-[2rem] border p-5 text-left transition-all ${
                          active
                            ? "border-gold bg-gold/10 shadow-[0_20px_60px_rgba(255,190,90,0.12)]"
                            : "border-white/10 bg-white/5 hover:border-gold/20 hover:bg-white/10"
                        }`}
                      >
                        <span className={`inline-flex h-12 w-12 items-center justify-center rounded-3xl ${occasion.highlight}`}>
                          <SelectedIcon className="h-5 w-5" />
                        </span>
                        <div className="space-y-2">
                          <h4 className="font-display text-lg text-foreground">{occasion.label}</h4>
                          <p className="text-sm text-muted-foreground leading-relaxed">{occasion.description}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}

              {step === 1 && (
                <div className="grid gap-6 lg:grid-cols-[1fr_1fr]">
                  <div className="space-y-4">
                    <label className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Select Date</label>
                    <input
                      type="date"
                      value={bookingDate}
                      onChange={(e) => setBookingDate(e.target.value)}
                      className="luxury-input w-full rounded-3xl px-4 py-3 text-sm bg-black/40"
                    />
                  </div>
                  <div className="space-y-4">
                    <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Choose Time Slot</p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {TIME_SLOTS.map((slot) => (
                        <button
                          key={slot}
                          type="button"
                          onClick={() => setSelectedTime(slot)}
                          className={`rounded-3xl border px-4 py-3 text-left transition ${
                            selectedTime === slot
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-white/10 bg-white/5 text-muted-foreground hover:border-gold/20 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center gap-2 text-sm font-semibold">
                            <Clock className="h-4 w-4" />
                            <span>{slot}</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">Premium arrival and setup included.</p>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {step === 2 && (
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">Choose the suite that fits your celebration style and guest list.</p>
                  <div className="grid gap-4 sm:grid-cols-2">
                    {SUITES.map((suite) => {
                      const active = selectedSuite === suite.id;
                      return (
                        <button
                          key={suite.id}
                          type="button"
                          onClick={() => setSelectedSuite(suite.id)}
                          className={`group flex flex-col overflow-hidden rounded-[2rem] border transition-all text-left ${
                            active
                              ? "border-gold bg-gold/10 shadow-[0_25px_60px_rgba(255,190,90,0.12)]"
                              : "border-white/10 bg-white/5 hover:border-gold/20 hover:bg-white/10"
                          }`}
                        >
                          <div className="relative h-52 overflow-hidden">
                            <img src={suite.image} alt={suite.name} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />
                          </div>
                          <div className="p-5 flex flex-col gap-3">
                            <div className="flex items-start justify-between gap-3">
                              <div>
                                <h4 className="font-display text-lg text-foreground">{suite.name}</h4>
                                <p className="text-xs text-muted-foreground mt-1">Suite ID {suite.id}</p>
                              </div>
                              <div className="text-right">
                                <p className="text-sm text-muted-foreground">From</p>
                                <p className="font-semibold text-gold">₹{suite.price.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <Users className="h-4 w-4 text-gold/70" />
                              <span>Up to {suite.capacity} guests</span>
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {suite.perks.map((perk) => (
                                <span key={perk} className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[11px] text-muted-foreground">
                                  {perk}
                                </span>
                              ))}
                            </div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {step === 3 && (
                <div className="space-y-6">
                  <div className="space-y-4">
                    <p className="text-sm text-muted-foreground">Choose premium add-ons to personalize your event experience.</p>
                    <div className="grid gap-4">
                      {ADDONS.map((addon) => (
                        <div key={addon.id} className="glass-card rounded-3xl border border-white/10 p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div>
                              <h4 className="font-display text-lg text-foreground">{addon.name}</h4>
                              <p className="text-sm text-muted-foreground mt-1">{addon.description}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-gold">₹{addon.price.toLocaleString()}</p>
                            </div>
                          </div>
                          <div className="mt-4 flex items-center justify-between gap-3">
                            <div className="flex items-center gap-2 rounded-full border border-white/10 bg-black/40 px-3 py-2">
                              <button type="button" onClick={() => updateQty(addon.id, -1)} className="h-8 w-8 rounded-full border border-white/10 text-muted-foreground hover:text-foreground transition">
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="min-w-[32px] text-center font-semibold text-foreground">{addonQty[addon.id]}</span>
                              <button type="button" onClick={() => updateQty(addon.id, 1)} className="h-8 w-8 rounded-full border border-white/10 text-muted-foreground hover:text-foreground transition">
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-xs text-muted-foreground">Add multiple items for full customization.</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                  <div className="space-y-3">
                    <div className="flex items-center gap-2 text-xs uppercase tracking-[0.25em] text-muted-foreground font-semibold">
                      <MessageSquare className="h-4 w-4 text-gold" />
                      <span>Special Requests</span>
                    </div>
                    <textarea
                      value={specialRequests}
                      onChange={(e) => setSpecialRequests(e.target.value)}
                      rows={4}
                      placeholder="Add any special instructions or celebration details..."
                      className="luxury-input w-full rounded-3xl px-4 py-4 text-sm bg-black/40 resize-none"
                    />
                  </div>
                </div>
              )}

              {step === 4 && (
                <div className="space-y-6">
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="glass-card rounded-3xl border border-white/10 p-5">
                      <h4 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Your Celebration</h4>
                      <p className="mt-4 text-lg text-foreground font-semibold">{OCCASIONS.find((item) => item.id === selectedOccasion)?.label ?? "No occasion selected"}</p>
                      <p className="text-sm text-muted-foreground mt-2">{bookingDate ? `Date: ${new Date(bookingDate).toLocaleDateString()}` : "No date"}</p>
                      <p className="text-sm text-muted-foreground">{selectedTime ? `Time: ${selectedTime}` : "No time slot"}</p>
                    </div>
                    <div className="glass-card rounded-3xl border border-white/10 p-5">
                      <h4 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Suite</h4>
                      {suite ? (
                        <div className="mt-4 space-y-2">
                          <p className="text-lg text-foreground font-semibold">{suite.name}</p>
                          <p className="text-sm text-muted-foreground">Capacity: {suite.capacity} guests</p>
                          <p className="text-sm text-muted-foreground">Price: ₹{suite.price.toLocaleString()}</p>
                        </div>
                      ) : (
                        <p className="text-sm text-muted-foreground mt-4">No suite selected yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl border border-white/10 p-5">
                    <h4 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Selected Add-ons</h4>
                    <div className="mt-4 space-y-3">
                      {ADDONS.filter((addon) => (addonQty[addon.id] ?? 0) > 0).map((addon) => (
                        <div key={addon.id} className="flex items-center justify-between gap-4 rounded-3xl border border-white/10 bg-black/40 p-4">
                          <div>
                            <p className="text-foreground font-medium">{addon.name}</p>
                            <p className="text-xs text-muted-foreground">Qty: {addonQty[addon.id]}</p>
                          </div>
                          <p className="text-sm text-gold">₹{(addon.price * (addonQty[addon.id] ?? 0)).toLocaleString()}</p>
                        </div>
                      ))}
                      {Object.values(addonQty).every((qty) => qty === 0) && (
                        <p className="text-sm text-muted-foreground">No add-ons selected yet.</p>
                      )}
                    </div>
                  </div>

                  <div className="glass-card rounded-3xl border border-white/10 p-5">
                    <h4 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Special Requests</h4>
                    <p className="mt-4 text-sm text-muted-foreground min-h-[84px]">{specialRequests || "No special requests added."}</p>
                  </div>
                </div>
              )}

              {step === 5 && (
                <div className="space-y-6">
                  <div className="glass-card rounded-3xl border border-white/10 p-5">
                    <h4 className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Payment Options</h4>
                    <div className="mt-5 grid gap-3">
                      {[
                        { id: "pay-now", label: "Pay Now", description: "Secure your booking instantly with card payment." },
                        { id: "pay-venue", label: "Pay at Venue", description: "Reserve now and complete payment at the venue." },
                      ].map((option) => (
                        <button
                          key={option.id}
                          type="button"
                          onClick={() => setPaymentMethod(option.id as "pay-now" | "pay-venue")}
                          className={`rounded-3xl border p-4 text-left transition ${
                            paymentMethod === option.id
                              ? "border-gold bg-gold/10 text-gold"
                              : "border-white/10 bg-black/40 text-muted-foreground hover:border-gold/20 hover:text-foreground"
                          }`}
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div>
                              <p className="font-display text-lg">{option.label}</p>
                              <p className="text-sm mt-1 text-muted-foreground">{option.description}</p>
                            </div>
                            <div className={`h-6 w-6 rounded-full border ${paymentMethod === option.id ? "border-gold bg-gold/15" : "border-white/10"}`}></div>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="rounded-[2rem] bg-gradient-to-r from-gold/15 via-black/0 to-gold/10 p-5 border border-gold/10">
                    <div className="flex items-center justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.25em] text-muted-foreground">Savings</p>
                        <p className="mt-2 text-lg text-foreground font-semibold">Get ₹{savings.toLocaleString()} in exclusive venue savings</p>
                      </div>
                      <div className="rounded-3xl bg-black/60 px-4 py-3 text-sm font-semibold text-gold">Luxury Discount Applied</div>
                    </div>
                  </div>
                </div>
              )}

              {showValidation && !isStepValid && (
                <p className="text-sm text-rose-400">Please complete the required selection before continuing.</p>
              )}

              <div className="flex flex-col gap-3 sm:flex-row items-stretch sm:items-center justify-between">
                <button
                  type="button"
                  onClick={handleBack}
                  disabled={step === 0}
                  className="rounded-3xl border border-white/10 px-5 py-3 text-sm text-muted-foreground hover:text-foreground transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="inline-block h-4 w-4 mr-2" /> Back
                </button>
                <button
                  type="button"
                  onClick={handleNext}
                  className="gold-btn rounded-3xl px-6 py-3 text-sm font-semibold flex items-center justify-center gap-2"
                >
                  {step === STEPS.length - 1 ? "Confirm Booking" : "Proceed to Payment"}
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="glass-card sticky top-6 rounded-3xl border border-[var(--gold)]/15 p-6 shadow-[0_30px_80px_rgba(0,0,0,0.15)]">
              <div className="flex items-center justify-between gap-3 mb-5">
                <div>
                  <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Booking Summary</p>
                  <h3 className="font-display text-2xl text-foreground mt-2">Your luxury event</h3>
                </div>
                <div className="rounded-full border border-white/10 bg-black/30 px-3 py-2 text-xs text-muted-foreground">Review</div>
              </div>

              <div className="space-y-4">
                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <CalendarDays className="h-4 w-4 text-gold" />
                    <span>{bookingDate ? new Date(bookingDate).toLocaleDateString() : "No date selected"}</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-muted-foreground mt-3">
                    <Clock className="h-4 w-4 text-gold" />
                    <span>{selectedTime || "No time slot chosen"}</span>
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Occasion</p>
                      <p className="mt-2 text-base text-foreground font-semibold">{OCCASIONS.find((item) => item.id === selectedOccasion)?.label ?? "Select an occasion"}</p>
                    </div>
                    <span className="rounded-full bg-white/10 px-3 py-1 text-xs text-muted-foreground">{stepLabel}</span>
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <div className="flex items-center justify-between gap-3">
                    <div>
                      <p className="text-xs uppercase tracking-[0.25em] text-muted-foreground">Suite</p>
                      <p className="mt-2 text-base text-foreground font-semibold">{suite?.name ?? "No suite selected"}</p>
                    </div>
                    <span className="text-gold font-semibold">₹{basePrice.toLocaleString()}</span>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs text-muted-foreground">
                    {suite?.perks.map((perk) => (
                      <span key={perk} className="rounded-full border border-white/10 bg-black/40 px-3 py-1">{perk}</span>
                    ))}
                  </div>
                </div>

                <div className="rounded-3xl bg-white/5 p-4 border border-white/10">
                  <div className="flex items-center justify-between text-sm text-muted-foreground">
                    <span>Package subtotal</span>
                    <span>₹{subtotal.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                    <span>Luxury savings</span>
                    <span className="text-emerald-400">-₹{savings.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                    <span>Service fee</span>
                    <span>₹{serviceFee.toLocaleString()}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm text-muted-foreground mt-2">
                    <span>Taxes & fees</span>
                    <span>₹{taxes.toLocaleString()}</span>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[2rem] bg-gradient-to-r from-gold/10 via-black/0 to-gold/10 p-5 border border-gold/20">
                <div className="flex items-center justify-between text-sm uppercase tracking-[0.25em] text-muted-foreground">
                  <span>Total</span>
                  <span className="font-semibold text-gold">₹{grandTotal.toLocaleString()}</span>
                </div>
                <p className="mt-3 text-xs text-muted-foreground">Pay at venue or secure your slot now with the preferred payment option.</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
