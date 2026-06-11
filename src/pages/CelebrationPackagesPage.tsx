import { useState, useMemo, useRef, useEffect } from "react";
import {
  Search, Heart, ChevronRight, Sliders, X, Star, Users, Gift,
  Sparkles, Check, Plus, Pencil, Trash2, ImagePlus,
} from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useTranslation } from "react-i18next";
import { celebrationPackagesApi } from "@/lib/api";

interface Package {
  id: string;
  name: string;
  occasion: string;
  price: number;
  priceRange: [number, number];
  capacity: number;
  description: string;
  image: string;
  badge: "Most Popular" | "Best for Couples" | "Great for Parties" | "Perfect Surprise";
  amenities: string[];
  reviews: number;
  rating: number;
  booked: number;
  status: "Active" | "Inactive";
}

const OCCASIONS = ["Birthday", "Anniversary", "Proposal", "Baby Shower", "Corporate Events", "Other Celebrations"];
const BADGES = ["Most Popular", "Best for Couples", "Great for Parties", "Perfect Surprise"] as const;

const emptyForm = (): Omit<Package, "id" | "reviews" | "rating" | "booked"> => ({
  name: "", occasion: "Birthday", price: 0, priceRange: [0, 0],
  capacity: 2, description: "", image: "", badge: "Most Popular",
  amenities: [], status: "Active",
});

/* ── Package Form Modal ──────────────────────────────── */
function PackageModal({
  pkg, onSave, onClose,
}: {
  pkg: Package | null;
  onSave: (data: Omit<Package, "id" | "reviews" | "rating" | "booked">) => void;
  onClose: () => void;
}) {
  const { t } = useTranslation();
  const fileRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<Omit<Package, "id" | "reviews" | "rating" | "booked">>(
    pkg
      ? { name: pkg.name, occasion: pkg.occasion, price: pkg.price, priceRange: pkg.priceRange, capacity: pkg.capacity, description: pkg.description, image: pkg.image, badge: pkg.badge, amenities: [...pkg.amenities], status: pkg.status }
      : emptyForm()
  );
  const [amenityInput, setAmenityInput] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});

  function set<K extends keyof typeof form>(key: K, val: (typeof form)[K]) {
    setForm((p) => ({ ...p, [key]: val }));
    setErrors((e) => ({ ...e, [key]: "" }));
  }

  function addAmenity() {
    const v = amenityInput.trim();
    if (!v || form.amenities.includes(v)) return;
    set("amenities", [...form.amenities, v]);
    setAmenityInput("");
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => set("image", ev.target?.result as string);
    reader.readAsDataURL(file);
    e.target.value = "";
  }

  function validate() {
    const e: Record<string, string> = {};
    if (!form.name.trim())        e.name        = "Package name is required";
    if (form.price <= 0)          e.price       = "Price must be greater than 0";
    if (form.capacity <= 0)       e.capacity    = "Capacity must be at least 1";
    if (!form.description.trim()) e.description = "Description is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!validate()) return;
    onSave(form);
  }

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
      <div className="glass-card rounded-2xl w-full max-w-xl border border-[var(--gold)]/20 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 z-10 flex items-center justify-between px-5 py-4 border-b border-white/10 bg-[oklch(0.13_0.025_260)] backdrop-blur">
          <h3 className="font-display text-lg text-foreground">
            {pkg ? t("app.admin.editPackage", "Edit Package") : t("app.admin.addNewPackage", "Add New Package")}
          </h3>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition">
            <X className="h-5 w-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">

          {/* Image */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
              {t("app.admin.packageImage", "Package Image")}
            </label>
            <div className="flex items-center gap-3">
              {form.image ? (
                <div className="relative h-20 w-32 rounded-xl overflow-hidden border border-[var(--gold)]/20 shrink-0">
                  <img src={form.image} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => set("image", "")}
                    className="absolute top-1 right-1 h-5 w-5 rounded-full bg-black/70 flex items-center justify-center text-white hover:bg-rose-500 transition">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <button type="button" onClick={() => fileRef.current?.click()}
                  className="h-20 w-32 rounded-xl border border-dashed border-[var(--gold)]/30 flex flex-col items-center justify-center gap-1 hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/5 transition shrink-0">
                  <ImagePlus className="h-5 w-5 text-gold/60" />
                  <span className="text-[10px] text-muted-foreground">Upload</span>
                </button>
              )}
              <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
              <div className="flex-1 space-y-1">
                <label className="text-[10px] text-muted-foreground">Or paste image URL</label>
                <input type="text" value={form.image.startsWith("data:") ? "" : form.image}
                  onChange={(e) => set("image", e.target.value)}
                  placeholder="https://..."
                  className="luxury-input w-full rounded-lg px-3 py-1.5 text-xs" />
              </div>
            </div>
          </div>

          {/* Name */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
              {t("app.admin.packageName", "Package Name")} <span className="text-rose-400">*</span>
            </label>
            <input type="text" value={form.name} onChange={(e) => set("name", e.target.value)}
              placeholder="e.g. Royal Birthday Bash"
              className={`luxury-input w-full rounded-lg px-3 py-2 text-sm ${errors.name ? "border-rose-500/50" : ""}`} />
            {errors.name && <p className="text-xs text-rose-400 mt-1">{errors.name}</p>}
          </div>

          {/* Occasion + Badge */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                {t("app.admin.occasionApplicable", "Occasion")}
              </label>
              <select value={form.occasion} onChange={(e) => set("occasion", e.target.value)}
                className="luxury-input w-full rounded-lg px-3 py-2 text-sm bg-transparent cursor-pointer">
                {OCCASIONS.map((o) => (
                  <option key={o} value={o} className="bg-[oklch(0.13_0.025_260)]">{o}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                {t("app.admin.packageTier", "Badge")}
              </label>
              <select value={form.badge} onChange={(e) => set("badge", e.target.value as Package["badge"])}
                className="luxury-input w-full rounded-lg px-3 py-2 text-sm bg-transparent cursor-pointer">
                {BADGES.map((b) => (
                  <option key={b} value={b} className="bg-[oklch(0.13_0.025_260)]">{b}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Price + Capacity */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                {t("app.admin.amountLabel", "Price (₹)")} <span className="text-rose-400">*</span>
              </label>
              <input type="number" min={0} value={form.price || ""}
                onChange={(e) => set("price", Number(e.target.value))}
                placeholder="e.g. 8500"
                className={`luxury-input w-full rounded-lg px-3 py-2 text-sm ${errors.price ? "border-rose-500/50" : ""}`} />
              {errors.price && <p className="text-xs text-rose-400 mt-1">{errors.price}</p>}
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                {t("app.admin.maxParties", "Max Capacity")} <span className="text-rose-400">*</span>
              </label>
              <input type="number" min={1} value={form.capacity || ""}
                onChange={(e) => set("capacity", Number(e.target.value))}
                placeholder="e.g. 50"
                className={`luxury-input w-full rounded-lg px-3 py-2 text-sm ${errors.capacity ? "border-rose-500/50" : ""}`} />
              {errors.capacity && <p className="text-xs text-rose-400 mt-1">{errors.capacity}</p>}
            </div>
          </div>

          {/* Price Range */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                {t("app.admin.minParties", "Price Range Min (₹)")}
              </label>
              <input type="number" min={0} value={form.priceRange[0] || ""}
                onChange={(e) => set("priceRange", [Number(e.target.value), form.priceRange[1]])}
                placeholder="e.g. 8000"
                className="luxury-input w-full rounded-lg px-3 py-2 text-sm" />
            </div>
            <div>
              <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
                {t("app.admin.minParties", "Price Range Max (₹)")}
              </label>
              <input type="number" min={0} value={form.priceRange[1] || ""}
                onChange={(e) => set("priceRange", [form.priceRange[0], Number(e.target.value)])}
                placeholder="e.g. 10000"
                className="luxury-input w-full rounded-lg px-3 py-2 text-sm" />
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
              {t("app.admin.shortDescription", "Description")} <span className="text-rose-400">*</span>
            </label>
            <textarea rows={3} value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of the package..."
              className={`luxury-input w-full rounded-lg px-3 py-2 text-sm resize-none ${errors.description ? "border-rose-500/50" : ""}`} />
            {errors.description && <p className="text-xs text-rose-400 mt-1">{errors.description}</p>}
          </div>

          {/* Amenities */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
              {t("app.admin.includedItems", "Included Items")}
            </label>
            <div className="flex flex-wrap gap-1.5 mb-2">
              {form.amenities.map((a) => (
                <span key={a} className="flex items-center gap-1 px-2 py-1 rounded-full bg-gold/10 border border-gold/20 text-xs text-gold">
                  {a}
                  <button type="button" onClick={() => set("amenities", form.amenities.filter((x) => x !== a))}
                    className="hover:text-rose-400 transition ml-0.5">
                    <X className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex gap-2">
              <input value={amenityInput} onChange={(e) => setAmenityInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }}
                placeholder="e.g. Floral Decoration"
                className="luxury-input flex-1 rounded-lg px-3 py-1.5 text-xs" />
              <button type="button" onClick={addAmenity}
                className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-[var(--gold)]/30 text-gold hover:bg-[var(--gold)]/10 transition">
                <Plus className="h-3 w-3" /> {t("app.admin.addAmenity", "Add")}
              </button>
            </div>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-muted-foreground uppercase tracking-wide block mb-1.5">
              {t("app.admin.statusLabel", "Status")}
            </label>
            <select value={form.status} onChange={(e) => set("status", e.target.value as "Active" | "Inactive")}
              className="luxury-input w-full rounded-lg px-3 py-2 text-sm bg-transparent cursor-pointer">
              <option value="Active" className="bg-[oklch(0.13_0.025_260)]">{t("app.admin.active", "Active")}</option>
              <option value="Inactive" className="bg-[oklch(0.13_0.025_260)]">{t("app.admin.inactive", "Inactive")}</option>
            </select>
          </div>

          {/* Footer buttons */}
          <div className="flex gap-3 pt-1">
            <button type="submit" className="gold-btn flex-1 rounded-lg py-2.5 text-sm font-semibold">
              {pkg ? t("app.admin.savePackage", "Save Changes") : t("app.admin.savePackage", "Add Package")}
            </button>
            <button type="button" onClick={onClose}
              className="flex-1 rounded-lg py-2.5 text-sm border border-white/10 text-muted-foreground hover:text-foreground transition">
              {t("app.admin.cancelBtn", "Cancel")}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* ── Delete Confirm ──────────────────────────────────── */
function DeleteConfirm({ name, onConfirm, onClose }: { name: string; onConfirm: () => void; onClose: () => void }) {
  const { t } = useTranslation();
  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/65 backdrop-blur-sm px-4">
      <div className="glass-card rounded-2xl p-6 w-full max-w-sm border border-rose-500/20">
        <h3 className="font-display text-lg text-foreground mb-2">Delete Package</h3>
        <p className="text-sm text-muted-foreground mb-6">
          Are you sure you want to delete <span className="text-foreground font-medium">"{name}"</span>? This cannot be undone.
        </p>
        <div className="flex gap-3">
          <button onClick={onConfirm}
            className="flex-1 rounded-lg py-2.5 text-sm font-semibold bg-rose-500/15 border border-rose-500/30 text-rose-400 hover:bg-rose-500/25 transition">
            Delete
          </button>
          <button onClick={onClose}
            className="flex-1 rounded-lg py-2.5 text-sm border border-white/10 text-muted-foreground hover:text-foreground transition">
            {t("app.admin.cancel", "Cancel")}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ───────────────────────────────────────── */
export default function CelebrationPackagesPage() {
  const { t } = useTranslation();
  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);

  function toPackage(p: any): Package {
    return {
      ...p,
      id: String(p.id),
      price: Number(p.price),
      priceRange: [Number(p.priceRangeMin), Number(p.priceRangeMax)] as [number, number],
      rating: Number(p.rating),
    };
  }

  useEffect(() => {
    celebrationPackagesApi.getAll()
      .then((data) => setPackages(data.map(toPackage)))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);
  const [search, setSearch] = useState("");
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareItems, setCompareItems] = useState<Set<string>>(new Set());
  const [modalPkg, setModalPkg] = useState<Package | null | "new">(null);
  const [deletePkg, setDeletePkg] = useState<Package | null>(null);

  const itemsPerPage = 6;

  const filtered = useMemo(() => {
    return packages.filter((pkg) => {
      const matchSearch = pkg.name.toLowerCase().includes(search.toLowerCase()) || pkg.description.toLowerCase().includes(search.toLowerCase());
      const matchOccasion = selectedOccasions.length === 0 || selectedOccasions.includes(pkg.occasion);
      const matchPrice = pkg.price >= priceRange[0] && pkg.price <= priceRange[1];
      return matchSearch && matchOccasion && matchPrice;
    });
  }, [packages, search, selectedOccasions, priceRange]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sortBy) {
      case "popularity": return copy.sort((a, b) => b.booked - a.booked);
      case "price-low":  return copy.sort((a, b) => a.price - b.price);
      case "price-high": return copy.sort((a, b) => b.price - a.price);
      case "booked":     return copy.sort((a, b) => b.booked - a.booked);
      default:           return copy;
    }
  }, [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginated  = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function toggleOccasion(o: string) {
    setSelectedOccasions((p) => p.includes(o) ? p.filter((x) => x !== o) : [...p, o]);
    setCurrentPage(1);
  }
  function clearFilters() { setSearch(""); setSelectedOccasions([]); setPriceRange([0, 30000]); setCurrentPage(1); }
  function toggleFavorite(id: string) { setFavorites((p) => { const u = new Set(p); u.has(id) ? u.delete(id) : u.add(id); return u; }); }
  function toggleCompare(id: string)  { setCompareItems((p) => { const u = new Set(p); if (u.has(id)) { u.delete(id); } else if (u.size < 3) { u.add(id); } return u; }); }

  async function handleSave(data: Omit<Package, "id" | "reviews" | "rating" | "booked">) {
    const payload = { ...data, priceRangeMin: data.priceRange[0], priceRangeMax: data.priceRange[1] };
    try {
      if (modalPkg === "new") {
        const created = await celebrationPackagesApi.create(payload);
        setPackages((p) => [toPackage(created), ...p]);
      } else if (modalPkg) {
        const updated = await celebrationPackagesApi.update(Number(modalPkg.id), payload);
        setPackages((p) => p.map((x) => x.id === modalPkg.id ? toPackage(updated) : x));
      }
    } catch (err: any) {
      alert(err.message);
    }
    setModalPkg(null);
  }

  async function handleDelete(id: string) {
    try {
      await celebrationPackagesApi.remove(Number(id));
      setPackages((p) => p.filter((x) => x.id !== id));
    } catch (err: any) {
      alert(err.message);
    }
    setDeletePkg(null);
  }

  const badgeStyles: Record<string, string> = {
    "Most Popular":    "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Best for Couples":"bg-rose-500/10 text-rose-400 border-rose-500/20",
    "Great for Parties":"bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Perfect Surprise":"bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  const statusStyle: Record<string, string> = {
    Active:   "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
    Inactive: "bg-amber-500/10 text-amber-400 border-amber-500/20",
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-black via-[oklch(0.08_0.025_260)] to-black">
      <AdminHeader title="Celebration Packages" />
      {loading ? (
        <div className="py-16 text-center text-muted-foreground text-sm">Loading packages...</div>
      ) : (
      <div className="p-6">

        {/* ── Stats row ── */}
        <div className="flex flex-wrap gap-3 mb-5">
          {[
            { label: t("app.admin.totalPackages", "Total Packages"),   count: packages.length,                              color: "border-[var(--gold)]/30 text-gold" },
            { label: t("app.admin.activePackages", "Active"),           count: packages.filter(p => p.status === "Active").length,   color: "border-emerald-500/30 text-emerald-400" },
            { label: t("app.admin.bookingsThisMonth", "Most Booked"),   count: packages.reduce((s, p) => s + p.booked, 0),  color: "border-sky-500/30 text-sky-400" },
          ].map((s) => (
            <div key={s.label} className={`glass-card rounded-xl px-4 py-2.5 border ${s.color} flex items-center gap-2`}>
              <span className="text-xl font-display font-semibold">{s.count.toLocaleString()}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Toolbar ── */}
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input type="text" placeholder={t("app.admin.searchPackages", "Search packages...")}
                value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
                className="luxury-input w-full rounded-lg pl-9 pr-4 py-2.5 text-sm" />
            </div>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }}
              className="luxury-input rounded-lg px-3 py-2.5 text-sm text-foreground bg-transparent cursor-pointer border border-white/10 hover:border-[var(--gold)]/30 transition">
              <option value="popularity" className="bg-[oklch(0.13_0.025_260)]">{t("app.userDashboard.sort_popularity", "Popularity")}</option>
              <option value="price-low"  className="bg-[oklch(0.13_0.025_260)]">{t("app.userDashboard.sort_price_low_to_high", "Price: Low to High")}</option>
              <option value="price-high" className="bg-[oklch(0.13_0.025_260)]">{t("app.userDashboard.sort_price_high_to_low", "Price: High to Low")}</option>
              <option value="booked"     className="bg-[oklch(0.13_0.025_260)]">{t("app.userDashboard.sort_most_booked", "Most Booked")}</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 transition">
              <Sliders className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">Filters</span>
            </button>
            {compareItems.size > 0 && (
              <button className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--gold)]/30 text-gold hover:bg-[var(--gold)]/10 transition font-medium text-sm">
                <Sparkles className="h-4 w-4" />
                {t("app.userDashboard.comparingCount", "Comparing ({{count}}/3)", { count: compareItems.size })}
              </button>
            )}
            {/* ── ADD PACKAGE BUTTON ── */}
            <button onClick={() => setModalPkg("new")}
              className="flex items-center gap-2 gold-btn px-4 py-2.5 rounded-lg text-sm font-semibold shrink-0">
              <Plus className="h-4 w-4" /> {t("app.admin.addNewPackage", "Add Package")}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* ── Sidebar filters ── */}
          {showFilters && (
            <div className="w-full sm:w-64 flex-shrink-0">
              <div className="glass-card rounded-2xl p-4 border border-[var(--gold)]/10 space-y-4 sticky top-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-foreground">Filters</h3>
                  {(selectedOccasions.length > 0 || priceRange[0] > 0 || priceRange[1] < 30000) && (
                    <button onClick={clearFilters} className="text-xs text-gold hover:text-gold/80 transition font-medium">{t("app.userDashboard.clearAll", "Clear All")}</button>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-3">{t("app.admin.occasion", "Occasions")}</label>
                  <div className="space-y-2">
                    {OCCASIONS.map((occasion) => (
                      <label key={occasion} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={selectedOccasions.includes(occasion)} onChange={() => toggleOccasion(occasion)}
                          className="w-4 h-4 rounded border border-white/20 bg-white/5 accent-gold cursor-pointer" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition">{occasion}</span>
                        <span className="text-xs text-muted-foreground/60 ml-auto">({packages.filter((p) => p.occasion === occasion).length})</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-3">Price Range</label>
                  <div className="space-y-3">
                    <input type="range" min="0" max="30000" step="500" value={priceRange[0]}
                      onChange={(e) => { setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]]); setCurrentPage(1); }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold" />
                    <input type="range" min="0" max="30000" step="500" value={priceRange[1]}
                      onChange={(e) => { setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])]); setCurrentPage(1); }}
                      className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold" />
                    <div className="flex items-center justify-between text-xs text-foreground bg-white/5 rounded-lg px-3 py-2">
                      <span>₹{priceRange[0].toLocaleString()}</span><span>-</span><span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">{sorted.length}</span> packages found</p>
                </div>
              </div>
            </div>
          )}

          {/* ── Cards grid ── */}
          <div className="flex-1">
            {paginated.length === 0 ? (
              <div className="py-16 text-center">
                <Gift className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground mb-4">{t("app.userDashboard.noPackagesMatch", "No packages match your filters.")}</p>
                <button onClick={() => setModalPkg("new")}
                  className="gold-btn px-5 py-2.5 rounded-lg text-sm font-semibold inline-flex items-center gap-2">
                  <Plus className="h-4 w-4" /> Add Package
                </button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginated.map((pkg) => (
                    <div key={pkg.id} className="group glass-card rounded-2xl overflow-hidden border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all duration-300 flex flex-col">
                      {/* Image */}
                      <div className="relative h-48 overflow-hidden bg-white/5">
                        {pkg.image ? (
                          <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <Gift className="h-12 w-12 text-gold/20" />
                          </div>
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-medium border ${badgeStyles[pkg.badge]} backdrop-blur-sm`}>{pkg.badge}</div>
                        <button onClick={() => toggleFavorite(pkg.id)} className="absolute top-3 left-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition border border-white/10">
                          <Heart className={`h-4 w-4 transition ${favorites.has(pkg.id) ? "fill-red-500 text-red-500" : "text-white/60 hover:text-white"}`} />
                        </button>
                        {/* Status badge */}
                        <span className={`absolute bottom-3 left-3 px-2 py-0.5 rounded-full text-[10px] font-semibold border ${statusStyle[pkg.status]}`}>
                          {pkg.status}
                        </span>
                      </div>

                      {/* Body */}
                      <div className="p-4 flex flex-col gap-3 flex-1">
                        <div>
                          <p className="text-[10px] font-mono text-muted-foreground tracking-wider">{pkg.id}</p>
                          <h3 className="font-display text-sm font-semibold text-foreground leading-tight mt-0.5">{pkg.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (
                                <Star key={i} className={`h-3 w-3 ${i < Math.floor(pkg.rating) ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />
                              ))}
                            </div>
                            <span className="text-xs text-muted-foreground">({pkg.reviews})</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{pkg.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="h-3.5 w-3.5 text-gold/60" />
                          <span className="text-muted-foreground">Up to {pkg.capacity} guests</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pkg.amenities.slice(0, 3).map((a, i) => (
                            <span key={i} className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded border border-white/10">{a}</span>
                          ))}
                          {pkg.amenities.length > 3 && (
                            <span className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded border border-white/10">+{pkg.amenities.length - 3}</span>
                          )}
                        </div>

                        {/* Footer */}
                        <div className="flex items-center justify-between pt-2 border-t border-white/10 mt-auto">
                          <div>
                            <p className="text-xs text-muted-foreground">Starting from</p>
                            <p className="text-lg font-semibold text-gold">₹{pkg.price.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            <button onClick={() => toggleCompare(pkg.id)}
                              className={`h-8 w-8 rounded border transition flex items-center justify-center ${compareItems.has(pkg.id) ? "bg-gold/10 border-gold text-gold" : "border-white/10 text-muted-foreground hover:border-[var(--gold)]/30"}`}>
                              <Check className="h-4 w-4" />
                            </button>
                            {/* Edit */}
                            <button onClick={() => setModalPkg(pkg)}
                              className="h-8 w-8 rounded border border-white/10 text-muted-foreground hover:text-gold hover:border-[var(--gold)]/30 flex items-center justify-center transition">
                              <Pencil className="h-3.5 w-3.5" />
                            </button>
                            {/* Delete */}
                            <button onClick={() => setDeletePkg(pkg)}
                              className="h-8 w-8 rounded border border-white/10 text-muted-foreground hover:text-rose-400 hover:border-rose-400/30 flex items-center justify-center transition">
                              <Trash2 className="h-3.5 w-3.5" />
                            </button>
                            <button className="gold-btn px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 hover:gap-2 transition">
                              {t("app.userDashboard.viewDetails", "Details")}<ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1}
                      className="px-3 py-2 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm">
                      {t("common.prev", "Previous")}
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) return null;
                      return (
                        <button key={page} onClick={() => setCurrentPage(page)}
                          className={`h-8 w-8 rounded-lg text-sm font-medium transition ${currentPage === page ? "bg-gold/10 border border-gold text-gold" : "border border-white/10 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30"}`}>
                          {page}
                        </button>
                      );
                    })}
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages}
                      className="px-3 py-2 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm">
                      {t("common.next", "Next")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
      )} {/* end loading */}

      {/* Add/Edit modal */}
      {modalPkg !== null && (
        <PackageModal
          pkg={modalPkg === "new" ? null : modalPkg}
          onSave={handleSave}
          onClose={() => setModalPkg(null)}
        />
      )}

      {/* Delete confirm */}
      {deletePkg && (
        <DeleteConfirm
          name={deletePkg.name}
          onConfirm={() => handleDelete(deletePkg.id)}
          onClose={() => setDeletePkg(null)}
        />
      )}
    </div>
  );
}
