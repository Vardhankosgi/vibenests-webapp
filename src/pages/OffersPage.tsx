import { useState } from "react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { AlertTriangle, Save, X, Plus, Tag, Settings2, Trash2, Ticket } from "lucide-react";
import { useTranslation } from "react-i18next";

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!checked)}
      className={`relative inline-flex h-5 w-9 shrink-0 rounded-full border-2 border-transparent transition-colors duration-200 cursor-pointer ${checked ? "bg-[var(--gold)]" : "bg-white/20"}`}>
      <span className={`pointer-events-none inline-block h-4 w-4 rounded-full bg-white shadow transform transition-transform duration-200 ${checked ? "translate-x-4" : "translate-x-0"}`} />
    </button>
  );
}
function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return <div className="flex flex-col gap-1"><label className="text-[11px] text-muted-foreground uppercase tracking-wide">{label}</label>{children}</div>;
}
function Input({ value, onChange, type = "text", placeholder = "" }: { value: string | number; onChange: (v: string) => void; type?: string; placeholder?: string }) {
  return <input type={type} value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="luxury-input rounded-lg px-3 py-2 text-sm w-full" />;
}
function Select({ value, onChange, options }: { value: string; onChange: (v: string) => void; options: string[] }) {
  return <select value={value} onChange={(e) => onChange(e.target.value)} className="luxury-input rounded-lg px-3 py-2 text-sm w-full bg-transparent cursor-pointer">{options.map((o) => <option key={o} value={o} className="bg-[oklch(0.13_0.025_260)]">{o}</option>)}</select>;
}
function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return <div className="glass-card rounded-2xl p-5 border border-[var(--gold)]/10"><h3 className="font-display text-base font-semibold text-foreground mb-4 pb-3 border-b border-white/[0.06]">{title}</h3>{children}</div>;
}
function ToggleRow({ label, checked, onChange }: { label: string; checked: boolean; onChange: (v: boolean) => void }) {
  return <div className="flex items-center justify-between py-1"><span className="text-sm text-foreground/80">{label}</span><Toggle checked={checked} onChange={onChange} /></div>;
}

export default function OffersPage() {
  const { t } = useTranslation();
  const [tab, setTab] = useState<"config" | "add" | "coupon">("config");
  const [saved, setSaved] = useState(false);

  const [coupons, setCoupons] = useState([
    { id: 1, code: "VIBE10", type: "Percentage", value: "10", minOrder: "1000", maxUses: "100", used: 23, expiry: "2025-12-31", status: "Active" },
    { id: 2, code: "FLAT500", type: "Flat Amount", value: "500", minOrder: "3000", maxUses: "50", used: 12, expiry: "2025-09-30", status: "Active" },
    { id: 3, code: "NEWUSER20", type: "Percentage", value: "20", minOrder: "500", maxUses: "200", used: 87, expiry: "2025-08-31", status: "Inactive" },
  ]);
  const [newCoupon, setNewCoupon] = useState({ code: "", type: "Percentage", value: "", minOrder: "", maxUses: "", expiry: "", status: "Active" });
  const [couponSaved, setCouponSaved] = useState(false);
  function handleAddCoupon() {
    if (!newCoupon.code.trim() || !newCoupon.value.trim()) return;
    setCoupons((prev) => [...prev, { id: Date.now(), ...newCoupon, used: 0 }]);
    setNewCoupon({ code: "", type: "Percentage", value: "", minOrder: "", maxUses: "", expiry: "", status: "Active" });
    setCouponSaved(true); setTimeout(() => setCouponSaved(false), 3000);
  }
  function handleDeleteCoupon(id: number) { setCoupons((prev) => prev.filter((c) => c.id !== id)); }

  const [enableOffers, setEnableOffers] = useState(true);
  const [offerName, setOfferName] = useState("Summer Special");
  const [offerType, setOfferType] = useState("Percentage");
  const [discountValue, setDiscountValue] = useState("15");
  const [categories, setCategories] = useState("Birthday, Anniversary");
  const [bookingWindow, setBookingWindow] = useState("7");
  const [validFrom, setValidFrom] = useState("2025-06-01");
  const [validUntil, setValidUntil] = useState("2025-08-31");
  const [offerStatus, setOfferStatus] = useState("Active");
  const [enableRefunds, setEnableRefunds] = useState(true);
  const [refundPct, setRefundPct] = useState("80");
  const [refundWindow, setRefundWindow] = useState("48");
  const [minBooking, setMinBooking] = useState("2000");
  const [maxRefunds, setMaxRefunds] = useState("10");
  const [cancelBefore, setCancelBefore] = useState("24");
  const [policyRefundPct, setPolicyRefundPct] = useState("75");
  const [latePenalty, setLatePenalty] = useState("10");
  const [dynamicRecovery, setDynamicRecovery] = useState(false);
  const [autoRebook, setAutoRebook] = useState(false);
  const [refundMethod, setRefundMethod] = useState("Original Payment Method");
  const [processingDays, setProcessingDays] = useState("5");
  const [addons, setAddons] = useState([
    { name: "Decoration", refundable: true, hours: "24" },
    { name: "Photography", refundable: true, hours: "48" },
    { name: "DJ", refundable: false, hours: "72" },
    { name: "Live Streaming", refundable: true, hours: "24" },
    { name: "Balloon Decor", refundable: false, hours: "12" },
  ]);
  const [enableLive, setEnableLive] = useState(true);
  const [enableRecording, setEnableRecording] = useState(false);
  const [duration, setDuration] = useState("120");
  const [notifTime, setNotifTime] = useState("30");
  const [autoGen, setAutoGen] = useState(true);
  const [allowEdits, setAllowEdits] = useState(true);
  const [maxViewers, setMaxViewers] = useState("50");
  const [gst, setGst] = useState("18");
  const [platformFee, setPlatformFee] = useState("5");
  const [convFee, setConvFee] = useState("2");
  const [dynamicPricing, setDynamicPricing] = useState(false);
  const [serviceCharge, setServiceCharge] = useState("3");
  const [pricingMultiplier, setPricingMultiplier] = useState("1.5");
  const [minBookingRule, setMinBookingRule] = useState("1500");
  const [advanceRestriction, setAdvanceRestriction] = useState("2");
  const [allowModification, setAllowModification] = useState(true);
  const [allowCancellation, setAllowCancellation] = useState(true);
  const [maxRefundDays, setMaxRefundDays] = useState("30");
  const [maxNotifications, setMaxNotifications] = useState("5");
  function handleSave() { setSaved(true); setTimeout(() => setSaved(false), 3000); }

  const [offers, setOffers] = useState([
    { id: 1, name: "Summer Special", type: "Percentage", value: "15", categories: "Birthday, Anniversary", from: "2025-06-01", until: "2025-08-31", status: "Active" },
    { id: 2, name: "Monsoon Deal", type: "Flat Amount", value: "500", categories: "All", from: "2025-07-01", until: "2025-09-30", status: "Scheduled" },
  ]);
  const [newOffer, setNewOffer] = useState({ name: "", type: "Percentage", value: "", categories: "", from: "", until: "", status: "Active" });
  const [offerSaved, setOfferSaved] = useState(false);
  function handleAddOffer() {
    if (!newOffer.name.trim() || !newOffer.value.trim()) return;
    setOffers((prev) => [...prev, { id: Date.now(), ...newOffer }]);
    setNewOffer({ name: "", type: "Percentage", value: "", categories: "", from: "", until: "", status: "Active" });
    setOfferSaved(true); setTimeout(() => setOfferSaved(false), 3000);
  }
  function handleDeleteOffer(id: number) { setOffers((prev) => prev.filter((o) => o.id !== id)); }

  const tabBtn = (active: boolean) =>
    `flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${active ? "bg-gradient-to-r from-[oklch(0.86_0.11_85)] to-[oklch(0.7_0.14_70)] text-[oklch(0.12_0.02_260)] shadow" : "text-muted-foreground hover:text-foreground"}`;

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Offers & Refund Configuration" />
      <div className="p-6 space-y-6">

        <div className="flex gap-1 p-1 rounded-xl bg-white/[0.04] border border-[var(--gold)]/15 w-fit">
          <button onClick={() => setTab("config")} className={tabBtn(tab === "config")}><Settings2 className="h-4 w-4" /> {t("app.admin.offersConfig", "Offers & Configuration")}</button>
          <button onClick={() => setTab("add")} className={tabBtn(tab === "add")}><Plus className="h-4 w-4" /> {t("app.admin.addNewOffer", "Add New Offer")}</button>
          <button onClick={() => setTab("coupon")} className={tabBtn(tab === "coupon")}><Ticket className="h-4 w-4" /> {t("app.admin.addCoupon", "Add Coupon")}</button>
        </div>

        {tab === "coupon" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card title={t("app.admin.createNewCoupon", "Create New Coupon")}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("app.admin.couponCode", "Coupon Code")}>
                    <input type="text" value={newCoupon.code} onChange={(e) => setNewCoupon((f) => ({ ...f, code: e.target.value.toUpperCase() }))} placeholder="e.g. VIBE20" className="luxury-input rounded-lg px-3 py-2 text-sm w-full font-mono tracking-widest" />
                  </Field>
                  <Field label={t("app.admin.discountType", "Discount Type")}><Select value={newCoupon.type} onChange={(v) => setNewCoupon((f) => ({ ...f, type: v }))} options={["Percentage", "Flat Amount"]} /></Field>
                  <Field label={t("app.admin.discountValue", "Discount Value")}><Input value={newCoupon.value} onChange={(v) => setNewCoupon((f) => ({ ...f, value: v }))} type="number" placeholder="e.g. 15" /></Field>
                  <Field label={t("app.admin.minOrderAmount", "Min Order Amount (₹)")}><Input value={newCoupon.minOrder} onChange={(v) => setNewCoupon((f) => ({ ...f, minOrder: v }))} type="number" placeholder="e.g. 1000" /></Field>
                  <Field label={t("app.admin.maxUses", "Max Uses")}><Input value={newCoupon.maxUses} onChange={(v) => setNewCoupon((f) => ({ ...f, maxUses: v }))} type="number" placeholder="e.g. 100" /></Field>
                  <Field label={t("app.admin.expiryDate", "Expiry Date")}><Input value={newCoupon.expiry} onChange={(v) => setNewCoupon((f) => ({ ...f, expiry: v }))} type="date" /></Field>
                </div>
                <Field label={t("app.admin.couponStatus", "Status")}><Select value={newCoupon.status} onChange={(v) => setNewCoupon((f) => ({ ...f, status: v }))} options={["Active", "Inactive", "Scheduled"]} /></Field>
                <button onClick={handleAddCoupon} className="gold-btn w-full rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-1">
                  <Ticket className="h-4 w-4" /> {couponSaved ? t("app.admin.couponAddedMsg", "Coupon Added!") : t("app.admin.addCouponBtn", "Add Coupon")}
                </button>
              </div>
            </Card>
            <Card title={t("app.admin.allCouponsTitle", "All Coupons")}>
              <div className="space-y-2">
                {coupons.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">{t("app.admin.noCouponsYet", "No coupons yet")}</p>}
                {coupons.map((c) => (
                  <div key={c.id} className="flex items-center justify-between gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Ticket className="h-4 w-4 text-gold shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-mono font-semibold text-gold tracking-widest">{c.code}</p>
                        <p className="text-[11px] text-muted-foreground">{c.type} · {c.value}{c.type === "Percentage" ? "%" : "₹"} · Min ₹{c.minOrder} · {c.used}/{c.maxUses} used · Exp: {c.expiry}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${c.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : c.status === "Scheduled" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/5 text-muted-foreground border-white/10"}`}>{c.status}</span>
                      <button onClick={() => handleDeleteCoupon(c.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "add" && (
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">
            <Card title={t("app.admin.newOfferDetails", "New Offer Details")}>
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <Field label={t("app.admin.offerName", "Offer Name")}><Input value={newOffer.name} onChange={(v) => setNewOffer((f) => ({ ...f, name: v }))} placeholder="e.g. Diwali Special" /></Field>
                  <Field label={t("app.admin.offerType", "Offer Type")}><Select value={newOffer.type} onChange={(v) => setNewOffer((f) => ({ ...f, type: v }))} options={["Percentage", "Flat Amount", "Buy 1 Get 1"]} /></Field>
                  <Field label={t("app.admin.discountValue", "Discount Value")}><Input value={newOffer.value} onChange={(v) => setNewOffer((f) => ({ ...f, value: v }))} type="number" placeholder="e.g. 20" /></Field>
                  <Field label={t("app.admin.offerStatus", "Status")}><Select value={newOffer.status} onChange={(v) => setNewOffer((f) => ({ ...f, status: v }))} options={["Active", "Inactive", "Scheduled"]} /></Field>
                  <Field label={t("app.admin.validFrom", "Valid From")}><Input value={newOffer.from} onChange={(v) => setNewOffer((f) => ({ ...f, from: v }))} type="date" /></Field>
                  <Field label={t("app.admin.validUntil", "Valid Until")}><Input value={newOffer.until} onChange={(v) => setNewOffer((f) => ({ ...f, until: v }))} type="date" /></Field>
                </div>
                <Field label={t("app.admin.applicableCategories", "Applicable Categories")}><Input value={newOffer.categories} onChange={(v) => setNewOffer((f) => ({ ...f, categories: v }))} placeholder="e.g. Birthday, Anniversary, All" /></Field>
                <button onClick={handleAddOffer} className="gold-btn w-full rounded-lg py-2.5 text-sm font-semibold flex items-center justify-center gap-2 mt-1">
                  <Plus className="h-4 w-4" /> {offerSaved ? t("app.admin.offerAddedMsg", "Offer Added!") : t("app.admin.addOfferBtn", "Add Offer")}
                </button>
              </div>
            </Card>
            <Card title={t("app.admin.existingOffers", "Existing Offers")}>
              <div className="space-y-2">
                {offers.length === 0 && <p className="text-xs text-muted-foreground text-center py-4">{t("app.admin.noOffersYet", "No offers yet")}</p>}
                {offers.map((o) => (
                  <div key={o.id} className="flex items-center justify-between gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Tag className="h-4 w-4 text-gold shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-medium text-foreground truncate">{o.name}</p>
                        <p className="text-[11px] text-muted-foreground">{o.type} · {o.value}{o.type === "Percentage" ? "%" : "₹"} · {o.from} – {o.until}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`text-[11px] px-2 py-0.5 rounded-full border font-medium ${o.status === "Active" ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" : o.status === "Scheduled" ? "bg-amber-500/10 text-amber-400 border-amber-500/20" : "bg-white/5 text-muted-foreground border-white/10"}`}>{o.status}</span>
                      <button onClick={() => handleDeleteOffer(o.id)} className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition"><Trash2 className="h-3.5 w-3.5" /></button>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {tab === "config" && (
          <>
            <div className="glass-card rounded-2xl p-4 border border-[var(--gold)]/30 bg-[var(--gold)]/5 flex gap-3">
              <AlertTriangle className="h-5 w-5 text-gold shrink-0 mt-0.5" />
              <div>
                <p className="text-sm font-medium text-gold">{t("app.admin.importantNotice", "Important Notice")}</p>
                <p className="text-xs text-muted-foreground mt-1">{t("app.admin.configNoticeText", "Configuration changes take effect immediately and will impact all active bookings, refund processing, and customer-facing policies. Please review carefully before saving.")}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-5">

              <Card title={t("app.admin.discountSettings", "Discount Settings")}>
                <div className="space-y-3">
                  <ToggleRow label={t("app.admin.enableOffers", "Enable Offers")} checked={enableOffers} onChange={setEnableOffers} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("app.admin.offerName", "Offer Name")}>
                      <Select value={offerName} onChange={(v) => { setOfferName(v); const sel = offers.find((o) => o.name === v); if (sel) { setOfferType(sel.type); setDiscountValue(sel.value); setValidFrom(sel.from); setValidUntil(sel.until); setCategories(sel.categories); setOfferStatus(sel.status); } }}
                        options={offers.filter((o) => o.status === "Active").length > 0 ? offers.filter((o) => o.status === "Active").map((o) => o.name) : ["No active offers"]} />
                    </Field>
                    <Field label={t("app.admin.offerType", "Offer Type")}><Select value={offerType} onChange={setOfferType} options={["Percentage", "Flat Amount", "Buy 1 Get 1"]} /></Field>
                    <Field label={t("app.admin.discountValue", "Discount Value")}><Input value={discountValue} onChange={setDiscountValue} type="number" placeholder="e.g. 15" /></Field>
                    <Field label={t("app.admin.bookingWindow", "Booking Window (Days)")}><Input value={bookingWindow} onChange={setBookingWindow} type="number" /></Field>
                    <Field label={t("app.admin.validFrom", "Valid From")}><Input value={validFrom} onChange={setValidFrom} type="date" /></Field>
                    <Field label={t("app.admin.validUntil", "Valid Until")}><Input value={validUntil} onChange={setValidUntil} type="date" /></Field>
                  </div>
                  <Field label={t("app.admin.applicableCategories", "Applicable Categories")}><Input value={categories} onChange={setCategories} placeholder="e.g. Birthday, Anniversary" /></Field>
                  <Field label={t("app.admin.offerStatus", "Status")}><Select value={offerStatus} onChange={setOfferStatus} options={["Active", "Inactive", "Scheduled"]} /></Field>
                </div>
              </Card>

              <Card title={t("app.admin.refundSettings", "Refund / Partial Refund Settings")}>
                <div className="space-y-3">
                  <ToggleRow label={t("app.admin.enableRefunds", "Enable Refunds")} checked={enableRefunds} onChange={setEnableRefunds} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("app.admin.refundPercentage", "Refund Percentage (%)")}><Input value={refundPct} onChange={setRefundPct} type="number" /></Field>
                    <Field label={t("app.admin.refundWindow", "Refund Window (Hours)")}><Input value={refundWindow} onChange={setRefundWindow} type="number" /></Field>
                    <Field label={t("app.admin.minBookingAmount", "Minimum Booking Amount (₹)")}><Input value={minBooking} onChange={setMinBooking} type="number" /></Field>
                    <Field label={t("app.admin.maxRefundsPerMonth", "Maximum Refunds Per Month")}><Input value={maxRefunds} onChange={setMaxRefunds} type="number" /></Field>
                  </div>
                </div>
              </Card>

              <Card title={t("app.admin.refundPolicyConfig", "Refund Policy Configuration")}>
                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("app.admin.cancelBeforeEvent", "Cancellation Before Event (Hours)")}><Input value={cancelBefore} onChange={setCancelBefore} type="number" /></Field>
                    <Field label={t("app.admin.refundPercentage", "Refund Percentage (%)")}><Input value={policyRefundPct} onChange={setPolicyRefundPct} type="number" /></Field>
                    <Field label={t("app.admin.latePenalty", "Late Refund Penalty (%)")}><Input value={latePenalty} onChange={setLatePenalty} type="number" /></Field>
                    <Field label={t("app.admin.processingDays", "Refund Processing Days")}><Input value={processingDays} onChange={setProcessingDays} type="number" /></Field>
                  </div>
                  <Field label={t("app.admin.refundMethod", "Refund Method")}><Select value={refundMethod} onChange={setRefundMethod} options={["Original Payment Method", "Wallet Credit", "Bank Transfer", "UPI"]} /></Field>
                  <ToggleRow label={t("app.admin.dynamicRecovery", "Enable Dynamic Recovery Charges")} checked={dynamicRecovery} onChange={setDynamicRecovery} />
                  <ToggleRow label={t("app.admin.autoRebook", "Auto Offer Rebook Instead of Refund")} checked={autoRebook} onChange={setAutoRebook} />
                </div>
              </Card>

              <Card title={t("app.admin.addonRefundRules", "Add-on Refund Rules")}>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-xs text-muted-foreground uppercase tracking-wide border-b border-white/[0.06]">
                        <th className="pb-3 pr-4">{t("app.admin.addonCol", "Add-on")}</th>
                        <th className="pb-3 pr-4 text-center">{t("app.admin.refundableCol", "Refundable")}</th>
                        <th className="pb-3">{t("app.admin.refundBeforeHrs", "Refund Before (Hrs)")}</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/[0.04]">
                      {addons.map((a, i) => (
                        <tr key={a.name}>
                          <td className="py-2.5 pr-4 text-foreground/80 text-sm">{a.name}</td>
                          <td className="py-2.5 pr-4 text-center"><Toggle checked={a.refundable} onChange={(v) => setAddons((prev) => prev.map((x, j) => j === i ? { ...x, refundable: v } : x))} /></td>
                          <td className="py-2.5"><input type="number" value={a.hours} onChange={(e) => setAddons((prev) => prev.map((x, j) => j === i ? { ...x, hours: e.target.value } : x))} className="luxury-input rounded-lg px-3 py-1.5 text-sm w-24" /></td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </Card>

              <Card title={t("app.admin.liveCelebrationSettings", "Live Celebration Settings")}>
                <div className="space-y-3">
                  <ToggleRow label={t("app.admin.enableLive", "Enable Live Celebration Feature")} checked={enableLive} onChange={setEnableLive} />
                  <ToggleRow label={t("app.admin.enableRecording", "Enable Recording")} checked={enableRecording} onChange={setEnableRecording} />
                  <ToggleRow label={t("app.admin.autoLinkGen", "Auto Link Generation")} checked={autoGen} onChange={setAutoGen} />
                  <ToggleRow label={t("app.admin.allowUserEdits", "Allow User Edits")} checked={allowEdits} onChange={setAllowEdits} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("app.admin.durationMinutes", "Duration (Minutes)")}><Input value={duration} onChange={setDuration} type="number" /></Field>
                    <Field label={t("app.admin.notifTime", "Notification Time (Minutes)")}><Input value={notifTime} onChange={setNotifTime} type="number" /></Field>
                    <Field label={t("app.admin.maxViewers", "Maximum Viewer Count")}><Input value={maxViewers} onChange={setMaxViewers} type="number" /></Field>
                  </div>
                </div>
              </Card>

              <Card title={t("app.admin.taxCharges", "Tax & Charges")}>
                <div className="space-y-3">
                  <ToggleRow label={t("app.admin.dynamicPricing", "Dynamic Pricing")} checked={dynamicPricing} onChange={setDynamicPricing} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("app.admin.gst", "GST (%)")}><Input value={gst} onChange={setGst} type="number" /></Field>
                    <Field label={t("app.admin.platformFee", "Platform Fee (%)")}><Input value={platformFee} onChange={setPlatformFee} type="number" /></Field>
                    <Field label={t("app.admin.convFee", "Convenience Fee (%)")}><Input value={convFee} onChange={setConvFee} type="number" /></Field>
                    <Field label={t("app.admin.serviceCharge", "Service Charge (%)")}><Input value={serviceCharge} onChange={setServiceCharge} type="number" /></Field>
                    <Field label={t("app.admin.dynamicMultiplier", "Dynamic Pricing Multiplier")}><Input value={pricingMultiplier} onChange={setPricingMultiplier} type="number" /></Field>
                  </div>
                </div>
              </Card>

              <Card title={t("app.admin.bookingRules", "Booking Rules")}>
                <div className="space-y-3">
                  <ToggleRow label={t("app.admin.allowModification", "Allow Booking Modification")} checked={allowModification} onChange={setAllowModification} />
                  <ToggleRow label={t("app.admin.allowCancellation", "Allow Cancellation")} checked={allowCancellation} onChange={setAllowCancellation} />
                  <div className="grid grid-cols-2 gap-3">
                    <Field label={t("app.admin.minBookingRule", "Minimum Booking Amount (₹)")}><Input value={minBookingRule} onChange={setMinBookingRule} type="number" /></Field>
                    <Field label={t("app.admin.advanceRestriction", "Advance Booking Restriction (Days)")}><Input value={advanceRestriction} onChange={setAdvanceRestriction} type="number" /></Field>
                    <Field label={t("app.admin.maxRefundDays", "Maximum Allowed Refund Days")}><Input value={maxRefundDays} onChange={setMaxRefundDays} type="number" /></Field>
                    <Field label={t("app.admin.maxNotifications", "Max Notifications Allowed")}><Input value={maxNotifications} onChange={setMaxNotifications} type="number" /></Field>
                  </div>
                </div>
              </Card>

              <Card title={t("app.admin.activeCoupons", "Active Coupons")}>
                <div className="space-y-2">
                  {coupons.filter((c) => c.status === "Active").length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4">{t("app.admin.noActiveCoupons", "No active coupons.")} <button onClick={() => setTab("coupon")} className="text-gold hover:underline">{t("app.admin.addCouponBtn", "Add one")}</button></p>
                  )}
                  {coupons.filter((c) => c.status === "Active").map((c) => (
                    <div key={c.id} className="flex items-center justify-between gap-3 bg-white/[0.03] rounded-xl px-3 py-2.5">
                      <div className="flex items-center gap-2.5 min-w-0">
                        <Ticket className="h-4 w-4 text-gold shrink-0" />
                        <div>
                          <p className="text-sm font-mono font-semibold text-gold tracking-widest">{c.code}</p>
                          <p className="text-[11px] text-muted-foreground">{c.value}{c.type === "Percentage" ? "%" : "₹"} off · {c.used}/{c.maxUses} used · Exp: {c.expiry}</p>
                        </div>
                      </div>
                      <span className="text-[11px] px-2 py-0.5 rounded-full border bg-emerald-500/10 text-emerald-400 border-emerald-500/20">{t("app.admin.active", "Active")}</span>
                    </div>
                  ))}
                  <button onClick={() => setTab("coupon")} className="w-full mt-1 text-xs text-gold border border-[var(--gold)]/20 rounded-lg py-2 hover:bg-[var(--gold)]/5 transition flex items-center justify-center gap-1.5">
                    <Ticket className="h-3.5 w-3.5" /> {t("app.admin.manageAllCoupons", "Manage All Coupons")}
                  </button>
                </div>
              </Card>

            </div>

            <div className="flex justify-end gap-3 pb-4">
              <button className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm border border-white/10 text-muted-foreground hover:text-foreground transition">
                <X className="h-4 w-4" /> {t("app.admin.cancelBtn", "Cancel")}
              </button>
              <button onClick={handleSave} className="flex items-center gap-2 gold-btn px-5 py-2.5 rounded-lg text-sm font-semibold">
                <Save className="h-4 w-4" /> {saved ? t("app.admin.saved", "Saved!") : t("app.admin.saveChanges", "Save Changes")}
              </button>
            </div>
          </>
        )}

      </div>
    </div>
  );
}
