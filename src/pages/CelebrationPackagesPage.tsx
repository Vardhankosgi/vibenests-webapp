import { useState, useMemo } from "react";
import { Search, Heart, ChevronRight, Sliders, X, Star, Users, Gift, Sparkles, MoreHorizontal, Check } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useTranslation } from "react-i18next";

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
}

const mockPackages: Package[] = [
  { id: "CP001", name: "Royal Celebration Suite", occasion: "Birthday", price: 8500, priceRange: [8000, 10000], capacity: 50, description: "Elegant celebration space with decorative setup and catering options", image: "https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?w=600&h=400&fit=crop", badge: "Most Popular", amenities: ["Decoration", "Catering", "DJ Setup", "Lighting", "Sound System"], reviews: 248, rating: 4.8, booked: 1203 },
  { id: "CP002", name: "Romantic Getaway Package", occasion: "Anniversary", price: 12500, priceRange: [10000, 15000], capacity: 4, description: "Intimate luxury suite with champagne and rose petals included", image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=600&h=400&fit=crop", badge: "Best for Couples", amenities: ["Champagne", "Roses", "Spa Access", "Private Dinner", "Jacuzzi"], reviews: 156, rating: 4.9, booked: 842 },
  { id: "CP003", name: "Intimate Proposal Setup", occasion: "Proposal", price: 6500, priceRange: [5000, 8000], capacity: 2, description: "Candlelit room with personalized decorations and champagne service", image: "https://images.unsplash.com/photo-1519225421-452d196e6235?w=600&h=400&fit=crop", badge: "Perfect Surprise", amenities: ["Candles", "Flowers", "Champagne", "Music", "Photography"], reviews: 189, rating: 4.9, booked: 567 },
  { id: "CP004", name: "Grand Party Paradise", occasion: "Birthday", price: 15000, priceRange: [12000, 18000], capacity: 100, description: "Full entertainment package with dance floor and professional DJ", image: "https://images.unsplash.com/photo-1516534775068-bb57c960fbb1?w=600&h=400&fit=crop", badge: "Great for Parties", amenities: ["DJ", "Dance Floor", "Bar Service", "Catering", "Entertainment"], reviews: 312, rating: 4.7, booked: 2156 },
  { id: "CP005", name: "Baby Shower Bliss", occasion: "Baby Shower", price: 5500, priceRange: [4500, 7000], capacity: 40, description: "Pastel-themed space with games, catering, and special decor", image: "https://images.unsplash.com/photo-1526047932273-b5b99c4476d4?w=600&h=400&fit=crop", badge: "Most Popular", amenities: ["Themed Decor", "Games", "Catering", "Photography", "Setup"], reviews: 94, rating: 4.8, booked: 423 },
  { id: "CP006", name: "Corporate Elegance", occasion: "Corporate Events", price: 18000, priceRange: [15000, 25000], capacity: 150, description: "Professional venue with AV setup, conference facilities, and catering", image: "https://images.unsplash.com/photo-1519167758481-83f19106049c?w=600&h=400&fit=crop", badge: "Most Popular", amenities: ["AV Setup", "Conference Tech", "Catering", "WiFi", "Parking"], reviews: 267, rating: 4.8, booked: 1834 },
  { id: "CP007", name: "Enchanted Garden Celebration", occasion: "Other Celebrations", price: 7500, priceRange: [6000, 9000], capacity: 60, description: "Outdoor-inspired setup with floral arrangements and ambient lighting", image: "https://images.unsplash.com/photo-1511632765486-a01980e01a18?w=600&h=400&fit=crop", badge: "Perfect Surprise", amenities: ["Floral Setup", "Ambient Lighting", "Outdoor Space", "Catering", "Setup"], reviews: 143, rating: 4.6, booked: 612 },
  { id: "CP008", name: "Luxe Celebration Premium", occasion: "Anniversary", price: 9500, priceRange: [8000, 12000], capacity: 20, description: "Private villa setting with gourmet dining and personalized service", image: "https://images.unsplash.com/photo-1520763185298-1b434c919eba?w=600&h=400&fit=crop", badge: "Best for Couples", amenities: ["Gourmet Dining", "Private Villa", "Concierge", "Wine Selection", "Spa"], reviews: 201, rating: 4.9, booked: 745 },
];

const OCCASIONS = ["Birthday", "Anniversary", "Proposal", "Baby Shower", "Corporate Events", "Other Celebrations"];

export default function CelebrationPackagesPage() {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [selectedOccasions, setSelectedOccasions] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 30000]);
  const [sortBy, setSortBy] = useState("popularity");
  const [currentPage, setCurrentPage] = useState(1);
  const [showFilters, setShowFilters] = useState(true);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());
  const [compareMode, setCompareMode] = useState(false);
  const [compareItems, setCompareItems] = useState<Set<string>>(new Set());

  const itemsPerPage = 6;

  const filtered = useMemo(() => {
    return mockPackages.filter((pkg) => {
      const matchSearch = pkg.name.toLowerCase().includes(search.toLowerCase()) || pkg.description.toLowerCase().includes(search.toLowerCase());
      const matchOccasion = selectedOccasions.length === 0 || selectedOccasions.includes(pkg.occasion);
      const matchPrice = pkg.price >= priceRange[0] && pkg.price <= priceRange[1];
      return matchSearch && matchOccasion && matchPrice;
    });
  }, [search, selectedOccasions, priceRange]);

  const sorted = useMemo(() => {
    const copy = [...filtered];
    switch (sortBy) {
      case "popularity": return copy.sort((a, b) => b.booked - a.booked);
      case "price-low": return copy.sort((a, b) => a.price - b.price);
      case "price-high": return copy.sort((a, b) => b.price - a.price);
      case "booked": return copy.sort((a, b) => b.booked - a.booked);
      default: return copy;
    }
  }, [filtered, sortBy]);

  const totalPages = Math.ceil(sorted.length / itemsPerPage);
  const paginatedPackages = sorted.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

  function toggleOccasion(occasion: string) {
    setSelectedOccasions((prev) => prev.includes(occasion) ? prev.filter((o) => o !== occasion) : [...prev, occasion]);
    setCurrentPage(1);
  }

  function clearFilters() { setSearch(""); setSelectedOccasions([]); setPriceRange([0, 30000]); setCurrentPage(1); }

  function toggleFavorite(id: string) {
    setFavorites((prev) => { const u = new Set(prev); u.has(id) ? u.delete(id) : u.add(id); return u; });
  }

  function toggleCompare(id: string) {
    setCompareItems((prev) => { const u = new Set(prev); if (u.has(id)) { u.delete(id); } else if (u.size < 3) { u.add(id); } return u; });
  }

  const badgeStyles: Record<string, string> = {
    "Most Popular": "bg-amber-500/10 text-amber-400 border-amber-500/20",
    "Best for Couples": "bg-rose-500/10 text-rose-400 border-rose-500/20",
    "Great for Parties": "bg-purple-500/10 text-purple-400 border-purple-500/20",
    "Perfect Surprise": "bg-cyan-500/10 text-cyan-400 border-cyan-500/20",
  };

  return (
    <div className="flex-1 overflow-y-auto bg-gradient-to-b from-black via-[oklch(0.08_0.025_260)] to-black">
      <AdminHeader title="Celebration Packages" />
      <div className="p-6">
        <div className="space-y-4 mb-6">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
              <input type="text" placeholder={t("app.admin.searchPackages", "Search packages by name or occasion...")} value={search} onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }} className="luxury-input w-full rounded-lg pl-9 pr-4 py-2.5 text-sm" />
            </div>
            <select value={sortBy} onChange={(e) => { setSortBy(e.target.value); setCurrentPage(1); }} className="luxury-input rounded-lg px-3 py-2.5 text-sm text-foreground bg-transparent cursor-pointer border border-white/10 hover:border-[var(--gold)]/30 transition">
              <option value="popularity" className="bg-[oklch(0.13_0.025_260)]">{t("app.userDashboard.sort_popularity", "Popularity")}</option>
              <option value="price-low" className="bg-[oklch(0.13_0.025_260)]">{t("app.userDashboard.sort_price_low_to_high", "Price: Low to High")}</option>
              <option value="price-high" className="bg-[oklch(0.13_0.025_260)]">{t("app.userDashboard.sort_price_high_to_low", "Price: High to Low")}</option>
              <option value="booked" className="bg-[oklch(0.13_0.025_260)]">{t("app.userDashboard.sort_most_booked", "Most Booked")}</option>
            </select>
            <button onClick={() => setShowFilters(!showFilters)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 transition">
              <Sliders className="h-4 w-4" />
              <span className="text-sm hidden sm:inline">{t("app.userDashboard.clearFilters", "Filters")}</span>
            </button>
            {compareItems.size > 0 && (
              <button onClick={() => setCompareMode(!compareMode)} className="flex items-center gap-2 px-4 py-2.5 rounded-lg border border-[var(--gold)]/30 text-gold hover:bg-[var(--gold)]/10 transition font-medium text-sm">
                <Sparkles className="h-4 w-4" />
                {t("app.userDashboard.comparingCount", "Comparing ({{count}}/3)", { count: compareItems.size })}
              </button>
            )}
          </div>
        </div>

        <div className="flex gap-6">
          {showFilters && (
            <div className="w-full sm:w-64 flex-shrink-0">
              <div className="glass-card rounded-2xl p-4 border border-[var(--gold)]/10 space-y-4 sticky top-6">
                <div className="flex items-center justify-between">
                  <h3 className="font-display text-sm font-semibold text-foreground">{t("app.userDashboard.clearFilters", "Filters")}</h3>
                  {(selectedOccasions.length > 0 || priceRange[0] > 0 || priceRange[1] < 30000) && (
                    <button onClick={clearFilters} className="text-xs text-gold hover:text-gold/80 transition font-medium">{t("app.userDashboard.clearAll", "Clear All")}</button>
                  )}
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-3">{t("app.admin.occasion", "Occasions")}</label>
                  <div className="space-y-2">
                    {OCCASIONS.map((occasion) => (
                      <label key={occasion} className="flex items-center gap-2 cursor-pointer group">
                        <input type="checkbox" checked={selectedOccasions.includes(occasion)} onChange={() => toggleOccasion(occasion)} className="w-4 h-4 rounded border border-white/20 bg-white/5 accent-gold cursor-pointer" />
                        <span className="text-sm text-muted-foreground group-hover:text-foreground transition">{occasion}</span>
                        <span className="text-xs text-muted-foreground/60 ml-auto">({mockPackages.filter((p) => p.occasion === occasion).length})</span>
                      </label>
                    ))}
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <label className="text-xs text-muted-foreground uppercase tracking-wide font-medium block mb-3">{t("app.userDashboard.maxPrice", "Price Range")}</label>
                  <div className="space-y-3">
                    <input type="range" min="0" max="30000" step="500" value={priceRange[0]} onChange={(e) => { setPriceRange([Math.min(Number(e.target.value), priceRange[1]), priceRange[1]]); setCurrentPage(1); }} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold" />
                    <input type="range" min="0" max="30000" step="500" value={priceRange[1]} onChange={(e) => { setPriceRange([priceRange[0], Math.max(Number(e.target.value), priceRange[0])]); setCurrentPage(1); }} className="w-full h-1 bg-white/10 rounded-lg appearance-none cursor-pointer accent-gold" />
                    <div className="flex items-center justify-between text-xs text-foreground bg-white/5 rounded-lg px-3 py-2">
                      <span>₹{priceRange[0].toLocaleString()}</span><span>-</span><span>₹{priceRange[1].toLocaleString()}</span>
                    </div>
                  </div>
                </div>
                <div className="border-t border-white/10 pt-4">
                  <p className="text-xs text-muted-foreground"><span className="text-foreground font-medium">{sorted.length}</span> {t("app.admin.packages", "packages found")}</p>
                </div>
              </div>
            </div>
          )}

          <div className="flex-1">
            {paginatedPackages.length === 0 ? (
              <div className="py-16 text-center">
                <Gift className="h-12 w-12 text-muted-foreground/40 mx-auto mb-3" />
                <p className="text-muted-foreground">{t("app.userDashboard.noPackagesMatch", "No packages match your filters.")}</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {paginatedPackages.map((pkg) => (
                    <div key={pkg.id} className="group glass-card rounded-2xl overflow-hidden border border-[var(--gold)]/10 hover:border-[var(--gold)]/30 transition-all duration-300 flex flex-col">
                      <div className="relative h-48 overflow-hidden bg-white/5">
                        <img src={pkg.image} alt={pkg.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                        <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-[11px] font-medium border ${badgeStyles[pkg.badge]} backdrop-blur-sm`}>{pkg.badge}</div>
                        <button onClick={() => toggleFavorite(pkg.id)} className="absolute top-3 left-3 h-8 w-8 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center hover:bg-black/60 transition border border-white/10">
                          <Heart className={`h-4 w-4 transition ${favorites.has(pkg.id) ? "fill-red-500 text-red-500" : "text-white/60 hover:text-white"}`} />
                        </button>
                      </div>
                      <div className="p-4 flex flex-col gap-3 flex-1">
                        <div>
                          <h3 className="font-display text-sm font-semibold text-foreground leading-tight">{pkg.name}</h3>
                          <div className="flex items-center gap-1 mt-1">
                            <div className="flex items-center gap-0.5">
                              {[...Array(5)].map((_, i) => (<Star key={i} className={`h-3 w-3 ${i < Math.floor(pkg.rating) ? "fill-gold text-gold" : "text-muted-foreground/40"}`} />))}
                            </div>
                            <span className="text-xs text-muted-foreground">({pkg.reviews})</span>
                          </div>
                        </div>
                        <p className="text-xs text-muted-foreground line-clamp-2">{pkg.description}</p>
                        <div className="flex items-center gap-2 text-xs">
                          <Users className="h-3.5 w-3.5 text-gold/60" />
                          <span className="text-muted-foreground">{t("app.userDashboard.guestsCount", "Up to {{count}} guests", { count: pkg.capacity })}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {pkg.amenities.slice(0, 3).map((amenity, i) => (<span key={i} className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded border border-white/10">{amenity}</span>))}
                          {pkg.amenities.length > 3 && (<span className="text-xs bg-white/5 text-muted-foreground px-2 py-1 rounded border border-white/10">+{pkg.amenities.length - 3}</span>)}
                        </div>
                        <div className="flex items-center justify-between pt-2 border-t border-white/10">
                          <div>
                            <p className="text-xs text-muted-foreground">{t("app.admin.packages", "Starting from")}</p>
                            <p className="text-lg font-semibold text-gold">₹{pkg.price.toLocaleString()}</p>
                          </div>
                          <div className="flex gap-2">
                            {compareMode && (
                              <button onClick={() => toggleCompare(pkg.id)} className={`h-8 w-8 rounded border transition flex items-center justify-center ${compareItems.has(pkg.id) ? "bg-gold/10 border-gold text-gold" : "border-white/10 text-muted-foreground hover:border-[var(--gold)]/30"}`}>
                                <Check className="h-4 w-4" />
                              </button>
                            )}
                            <button className="gold-btn px-3 py-2 rounded-lg text-xs font-semibold flex items-center gap-1 hover:gap-2 transition">
                              {t("app.userDashboard.viewDetails", "Details")}<ChevronRight className="h-3 w-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-8">
                    <button onClick={() => setCurrentPage(Math.max(1, currentPage - 1))} disabled={currentPage === 1} className="px-3 py-2 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm">
                      {t("common.prev", "Previous")}
                    </button>
                    {[...Array(totalPages)].map((_, i) => {
                      const page = i + 1;
                      if (Math.abs(page - currentPage) > 1 && page !== 1 && page !== totalPages) return null;
                      return (
                        <button key={page} onClick={() => setCurrentPage(page)} className={`h-8 w-8 rounded-lg text-sm font-medium transition ${currentPage === page ? "bg-gold/10 border border-gold text-gold" : "border border-white/10 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30"}`}>{page}</button>
                      );
                    })}
                    <button onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))} disabled={currentPage === totalPages} className="px-3 py-2 rounded-lg border border-white/10 text-muted-foreground hover:text-foreground hover:border-[var(--gold)]/30 disabled:opacity-50 disabled:cursor-not-allowed transition text-sm">
                      {t("common.next", "Next")}
                    </button>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
