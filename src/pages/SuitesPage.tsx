import { useState, useRef } from "react";
import { Plus, Search, Pencil, Trash2, X, BedDouble, ImagePlus, Check, ChevronLeft, ChevronRight } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { useSuitesContext, type Suite } from "@/components/admin/SuitesContext";

const emptyForm: Omit<Suite, "id"> = { name: "", minCapacity: 1, capacity: 2, price: "", ratePerExtraPerson: 199, baseDiscount: 0, occasions: "", status: "Active", description: "", images: [], amenities: [] };

const statusStyle: Record<string, string> = {
  Active: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20",
  Inactive: "bg-amber-500/10 text-amber-400 border-amber-500/20",
};

function AmenitiesEditor({ amenities, onChange }: { amenities: string[]; onChange: (a: string[]) => void }) {
  const [newVal, setNewVal] = useState("");
  const [editIdx, setEditIdx] = useState<number | null>(null);
  const [editVal, setEditVal] = useState("");

  function addAmenity() {
    const trimmed = newVal.trim();
    if (!trimmed || amenities.includes(trimmed)) return;
    onChange([...amenities, trimmed]);
    setNewVal("");
  }

  function saveEdit(idx: number) {
    const trimmed = editVal.trim();
    if (!trimmed) return;
    onChange(amenities.map((a, i) => (i === idx ? trimmed : a)));
    setEditIdx(null);
  }

  return (
    <div>
      <label className="text-xs text-muted-foreground uppercase tracking-wide">Amenities</label>
      <div className="mt-1.5 space-y-1.5">
        {amenities.map((a, i) => (
          <div key={i} className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/[0.03]">
            {editIdx === i ? (
              <>
                <input autoFocus value={editVal} onChange={(e) => setEditVal(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") saveEdit(i); if (e.key === "Escape") setEditIdx(null); }}
                  className="luxury-input flex-1 rounded-md px-2 py-0.5 text-xs" />
                <button type="button" onClick={() => saveEdit(i)} className="p-1 rounded text-emerald-400 hover:bg-emerald-400/10 transition"><Check className="h-3 w-3" /></button>
                <button type="button" onClick={() => setEditIdx(null)} className="p-1 rounded text-muted-foreground hover:text-foreground transition"><X className="h-3 w-3" /></button>
              </>
            ) : (
              <>
                <span className="flex-1 text-xs text-foreground">{a}</span>
                <button type="button" onClick={() => { setEditIdx(i); setEditVal(a); }}
                  className="p-1 rounded text-gold/60 hover:text-gold hover:bg-[var(--gold)]/10 transition"><Pencil className="h-3 w-3" /></button>
                <button type="button" onClick={() => onChange(amenities.filter((_, idx) => idx !== i))}
                  className="p-1 rounded text-destructive/60 hover:text-destructive hover:bg-destructive/10 transition"><Trash2 className="h-3 w-3" /></button>
              </>
            )}
          </div>
        ))}
        <div className="flex gap-2">
          <input value={newVal} onChange={(e) => setNewVal(e.target.value)}
            onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addAmenity(); } }}
            placeholder="Add amenity (e.g. WiFi)" className="luxury-input flex-1 rounded-lg px-3 py-1.5 text-xs" />
          <button type="button" onClick={addAmenity}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs border border-[var(--gold)]/30 text-gold hover:bg-[var(--gold)]/10 transition">
            <Plus className="h-3 w-3" /> Add
          </button>
        </div>
      </div>
    </div>
  );
}

function ImageSlider({ images, name }: { images: string[]; name: string }) {
  const [idx, setIdx] = useState(0);
  if (images.length === 0) {
    return (
      <div className="h-44 bg-white/[0.03] flex items-center justify-center border-b border-white/[0.05]">
        <BedDouble className="h-10 w-10 text-[var(--gold)]/30" />
      </div>
    );
  }
  return (
    <div className="relative h-44 overflow-hidden group">
      <img src={images[idx]} alt={name} className="w-full h-full object-cover transition-opacity duration-300" />
      {images.length > 1 && (
        <>
          <button onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/70">
            <ChevronLeft className="h-3.5 w-3.5 text-white" />
          </button>
          <button onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 h-6 w-6 rounded-full bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/70">
            <ChevronRight className="h-3.5 w-3.5 text-white" />
          </button>
          <div className="absolute bottom-1.5 left-1/2 -translate-x-1/2 flex gap-1">
            {images.map((_, i) => (
              <button key={i} onClick={() => setIdx(i)}
                className={`h-1.5 rounded-full transition-all ${i === idx ? "w-4 bg-white" : "w-1.5 bg-white/50"}`} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

export default function SuitesPage() {
  const { suites, setSuites, saveSuite, deleteSuite: apiDelete, loading } = useSuitesContext();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const fileRef = useRef<HTMLInputElement>(null);

  const filtered = suites.filter((s) => {
    const matchSearch = s.name.toLowerCase().includes(search.toLowerCase()) || s.id.toLowerCase().includes(search.toLowerCase());
    const matchStatus = statusFilter === "All" || s.status === statusFilter;
    return matchSearch && matchStatus;
  });

  function openAdd() { setEditId(null); setForm(emptyForm); setShowModal(true); }
  function openEdit(s: Suite) { setEditId(s.id); setForm({ name: s.name, minCapacity: s.minCapacity, capacity: s.capacity, price: s.price, ratePerExtraPerson: s.ratePerExtraPerson, baseDiscount: s.baseDiscount, occasions: s.occasions, status: s.status, description: s.description, images: s.images, amenities: s.amenities }); setShowModal(true); }

  async function handleSave() {
    if (!form.name.trim()) return;
    try {
      await saveSuite(form, editId);
      setShowModal(false);
    } catch (err: any) {
      alert(err.message || 'Failed to save suite');
    }
  }

  async function handleDelete(id: string) {
    try { await apiDelete(id); } catch (err: any) { alert(err.message || 'Failed to delete suite'); }
  }

  function handleImageUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (ev) => setForm((f) => ({ ...f, images: [...f.images, ev.target?.result as string] }));
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Rooms" />
      <div className="p-6 space-y-5">
        <div className="flex flex-wrap gap-3">
          {[
            { label: "Total Suites", count: suites.length, color: "border-[var(--gold)]/30 text-gold" },
            { label: "Active", count: suites.filter(s => s.status === "Active").length, color: "border-emerald-500/30 text-emerald-400" },
            { label: "Inactive", count: suites.filter(s => s.status === "Inactive").length, color: "border-amber-500/30 text-amber-400" },
          ].map((s) => (
            <div key={s.label} className={`glass-card rounded-xl px-4 py-2.5 border ${s.color} flex items-center gap-2`}>
              <span className="text-xl font-display font-semibold">{s.count}</span>
              <span className="text-xs text-muted-foreground">{s.label}</span>
            </div>
          ))}
        </div>

        <div className="glass-card rounded-2xl p-4 flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-48">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground pointer-events-none" />
            <input type="text" placeholder="Search suites..." value={search} onChange={(e) => setSearch(e.target.value)} className="luxury-input w-full rounded-lg pl-9 pr-4 py-2 text-xs" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="luxury-input rounded-lg px-3 py-2 text-xs text-foreground bg-transparent cursor-pointer">
            {["All", "Active", "Inactive"].map((s) => <option key={s} value={s} className="bg-[oklch(0.13_0.025_260)]">{s === "All" ? "All Statuses" : s}</option>)}
          </select>
          <button onClick={openAdd} className="flex items-center gap-2 gold-btn px-4 py-2 rounded-lg text-xs font-semibold ml-auto">
            <Plus className="h-3.5 w-3.5" /> Add Suite
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
          {loading ? (
            <div className="col-span-3 py-16 text-center text-sm text-muted-foreground">Loading suites...</div>
          ) : filtered.length === 0 ? (
            <div className="col-span-3 py-16 text-center text-sm text-muted-foreground">No suites found</div>
          ) : filtered.map((s) => (
            <div key={s.id} className="glass-card rounded-2xl overflow-hidden flex flex-col border border-[var(--gold)]/10">
              <ImageSlider images={s.images} name={s.name} />
              <div className="p-4 flex flex-col gap-3">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <p className="font-display text-base font-medium text-foreground leading-tight">{s.name}</p>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{s.id}</p>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-medium border shrink-0 ${statusStyle[s.status]}`}>{s.status}</span>
                </div>
                <p className="text-xs text-muted-foreground leading-relaxed">{s.description}</p>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                    <p className="text-muted-foreground">Min Capacity</p>
                    <p className="text-foreground font-medium mt-0.5">{s.minCapacity} guests</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                    <p className="text-muted-foreground">Max Capacity</p>
                    <p className="text-foreground font-medium mt-0.5">{s.capacity} guests</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                    <p className="text-muted-foreground">Base Rate</p>
                    <p className="text-gold font-medium mt-0.5">{s.price}</p>
                  </div>
                  <div className="bg-white/[0.03] rounded-lg px-3 py-2">
                    <p className="text-muted-foreground">Extra/Person</p>
                    <p className="text-foreground font-medium mt-0.5">₹{s.ratePerExtraPerson}</p>
                  </div>
                  {s.baseDiscount > 0 && (
                    <div className="col-span-2 bg-emerald-500/5 rounded-lg px-3 py-2">
                      <p className="text-muted-foreground">Discount</p>
                      <p className="text-emerald-400 font-medium mt-0.5">{s.baseDiscount}% off base rate</p>
                    </div>
                  )}
                </div>
                <div className="flex gap-2">
                  <button onClick={() => openEdit(s)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-[var(--gold)]/20 text-gold hover:bg-[var(--gold)]/10 transition">
                    <Pencil className="h-3.5 w-3.5" /> Edit
                  </button>
                  <button onClick={() => handleDelete(s.id)} className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs border border-destructive/20 text-destructive hover:bg-destructive/10 transition">
                    <Trash2 className="h-3.5 w-3.5" /> Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
          <div className="glass-card rounded-2xl p-4 w-full max-w-md border border-[var(--gold)]/20 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-display text-lg text-foreground">{editId ? "Edit Suite" : "Add New Suite"}</h3>
              <button onClick={() => setShowModal(false)} className="text-muted-foreground hover:text-foreground transition"><X className="h-5 w-5" /></button>
            </div>
            <div className="space-y-2">
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Images</label>
                <div className="mt-1 flex flex-wrap gap-2">
                  {form.images.map((img, i) => (
                    <div key={i} className="relative h-16 w-16 rounded-lg overflow-hidden border border-[var(--gold)]/20">
                      <img src={img} alt="" className="h-full w-full object-cover" />
                      <button onClick={() => setForm((f) => ({ ...f, images: f.images.filter((_, idx) => idx !== i) }))} className="absolute top-0.5 right-0.5 h-4 w-4 bg-black/70 rounded-full flex items-center justify-center text-white hover:bg-destructive transition">
                        <X className="h-2.5 w-2.5" />
                      </button>
                    </div>
                  ))}
                  <button type="button" onClick={() => fileRef.current?.click()} className="h-16 w-16 rounded-lg border border-dashed border-[var(--gold)]/30 flex flex-col items-center justify-center gap-1 hover:border-[var(--gold)]/60 hover:bg-[var(--gold)]/5 transition">
                    <ImagePlus className="h-5 w-5 text-gold/60" />
                    <span className="text-[9px] text-muted-foreground">Add</span>
                  </button>
                  <input ref={fileRef} type="file" accept="image/*" multiple className="hidden" onChange={handleImageUpload} />
                </div>
              </div>
              {[
                { label: "Suite Name", key: "name", placeholder: "e.g. Royal Celebration Suite" },
                { label: "Price", key: "price", placeholder: "e.g. ₹8,500" },
                { label: "Occasions", key: "occasions", placeholder: "e.g. Birthday, Anniversary" },
              ].map(({ label, key, placeholder }) => (
                <div key={key}>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">{label}</label>
                  <input type="text" placeholder={placeholder} value={form[key as keyof typeof form] as string} onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))} className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5" />
                </div>
              ))}
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Min Capacity (guests)</label>
                <input type="number" min={1} value={form.minCapacity} onChange={(e) => setForm((f) => ({ ...f, minCapacity: Number(e.target.value) }))} className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5" />
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Max Capacity (guests)</label>
                <input type="number" min={form.minCapacity} value={form.capacity} onChange={(e) => setForm((f) => ({ ...f, capacity: Number(e.target.value) }))} className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5" />
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Rate / Extra Person (₹)</label>
                  <input type="number" min={0} value={form.ratePerExtraPerson} onChange={(e) => setForm((f) => ({ ...f, ratePerExtraPerson: Number(e.target.value) }))} className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5" />
                </div>
                <div>
                  <label className="text-xs text-muted-foreground uppercase tracking-wide">Discount on Base (%)</label>
                  <input type="number" min={0} max={100} value={form.baseDiscount} onChange={(e) => setForm((f) => ({ ...f, baseDiscount: Number(e.target.value) }))} className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5" />
                </div>
              </div>
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Description</label>
                <textarea rows={2} placeholder="Brief description..." value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5 resize-none" />
              </div>
              <AmenitiesEditor amenities={form.amenities} onChange={(a) => setForm((f) => ({ ...f, amenities: a }))} />
              <div>
                <label className="text-xs text-muted-foreground uppercase tracking-wide">Status</label>
                <select value={form.status} onChange={(e) => setForm((f) => ({ ...f, status: e.target.value as Suite["status"] }))} className="luxury-input w-full rounded-lg px-3 py-1.5 text-sm mt-0.5 bg-transparent cursor-pointer">
                  <option value="Active" className="bg-[oklch(0.13_0.025_260)]">Active</option>
                  <option value="Inactive" className="bg-[oklch(0.13_0.025_260)]">Inactive</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-4">
              <button onClick={handleSave} className="gold-btn flex-1 rounded-lg py-2 text-sm font-semibold">{editId ? "Save Changes" : "Add Suite"}</button>
              <button onClick={() => setShowModal(false)} className="flex-1 rounded-lg py-2 text-sm border border-white/10 text-muted-foreground hover:text-foreground transition">Cancel</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
