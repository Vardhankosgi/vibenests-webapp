import { createContext, useContext, useState, useEffect } from "react";
import { suitesApi } from "@/lib/api";

export type Suite = {
  id: string;
  name: string;
  capacity: number;
  price: string;
  occasions: string;
  status: "Active" | "Inactive";
  description: string;
  images: string[];
  amenities: string[];
};

function parseImages(val: any): string[] {
  if (Array.isArray(val)) return val;
  try { return JSON.parse(val); } catch { return []; }
}

function mapApiSuite(s: any): Suite {
  return {
    id: String(s.id),
    name: s.name ?? "",
    capacity: s.capacity ?? 0,
    price: s.price ? `₹${Number(s.price).toLocaleString()}` : "₹0",
    occasions: s.themeType ?? "",
    status: s.status === "available" ? "Active" : "Inactive",
    description: s.description ?? "",
    images: parseImages(s.images),
    amenities: Array.isArray(s.amenities) ? s.amenities : [],
  };
}

type SuitesContextType = {
  suites: Suite[];
  setSuites: React.Dispatch<React.SetStateAction<Suite[]>>;
  saveSuite: (form: Omit<Suite, "id">, editId: string | null) => Promise<void>;
  deleteSuite: (id: string) => Promise<void>;
  loading: boolean;
};

const SuitesContext = createContext<SuitesContextType | null>(null);

const FALLBACK_SUITES: Suite[] = [
  {
    id: "demo-1",
    name: "Royal Celebration Suite",
    capacity: 8,
    price: "₹12,500",
    occasions: "Birthday, Anniversary",
    status: "Active",
    description: "A grand celebration suite with premium floral decor, ambient lighting, and a private dining setup for your most special moments.",
    images: ["https://images.unsplash.com/photo-1631049307264-da0ec9d70304?w=600&q=80"],
    amenities: ["WiFi", "Smart TV", "AC", "Music System", "Photography"],
  },
  {
    id: "demo-2",
    name: "Romantic Couple Suite",
    capacity: 2,
    price: "₹8,999",
    occasions: "Anniversary, Proposal",
    status: "Active",
    description: "Intimate candlelit suite adorned with rose petals, champagne setup, and a private balcony view — perfect for two.",
    images: ["https://images.unsplash.com/photo-1522673607200-164d1b6ce486?w=600&q=80"],
    amenities: ["WiFi", "AC", "Music System", "Welcome Drinks"],
  },
  {
    id: "demo-3",
    name: "Luxury Penthouse Suite",
    capacity: 15,
    price: "₹28,000",
    occasions: "Birthday, Corporate Events",
    status: "Active",
    description: "Sky-high penthouse with panoramic city views, a premium bar setup, DJ corner, and full event management for large celebrations.",
    images: ["https://images.unsplash.com/photo-1582719478250-c89cae4dc85b?w=600&q=80"],
    amenities: ["WiFi", "Smart TV", "AC", "Music System", "Photography", "Welcome Drinks"],
  },
  {
    id: "demo-4",
    name: "Garden Villa Suite",
    capacity: 20,
    price: "₹18,500",
    occasions: "Wedding, Baby Shower",
    status: "Active",
    description: "A lush garden villa with open-air seating, floral mandap, and a warm rustic ambience ideal for intimate weddings and family celebrations.",
    images: ["https://images.unsplash.com/photo-1618773928121-c32242e63f39?w=600&q=80"],
    amenities: ["WiFi", "AC", "Cake", "Decoration", "Photography"],
  },
  {
    id: "demo-5",
    name: "Sky Loft Studio",
    capacity: 4,
    price: "₹6,500",
    occasions: "Proposal, Date Night",
    status: "Active",
    description: "A sleek rooftop loft with mood lighting, telescope stargazing setup, and a curated surprise experience for the perfect proposal.",
    images: ["https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=600&q=80"],
    amenities: ["WiFi", "AC", "Music System", "Welcome Drinks"],
  },
  {
    id: "demo-6",
    name: "Heritage Pool Suite",
    capacity: 10,
    price: "₹22,000",
    occasions: "Birthday, Anniversary",
    status: "Inactive",
    description: "Coming soon — a heritage-style private pool suite with poolside dining, cabana decor, and a dedicated event host.",
    images: ["https://images.unsplash.com/photo-1590490360182-c33d57733427?w=600&q=80"],
    amenities: ["WiFi", "Smart TV", "AC", "Music System", "Photography", "Cake"],
  },
];

export function SuitesProvider({ children }: { children: React.ReactNode }) {
  const [suites, setSuites] = useState<Suite[]>(FALLBACK_SUITES);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    suitesApi.getAll()
      .then((list) => { if (Array.isArray(list) && list.length > 0) setSuites(list.map(mapApiSuite)); })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const saveSuite = async (form: Omit<Suite, "id">, editId: string | null) => {
    const payload = {
      name: form.name,
      capacity: form.capacity,
      price: parseFloat(String(form.price).replace(/[₹,]/g, "")) || 0,
      themeType: form.occasions,
      status: form.status === "Active" ? "available" : "maintenance",
      description: form.description,
      images: form.images,
      amenities: form.amenities,
    };
    try {
      if (editId) {
        const updated = await suitesApi.update(Number(editId), payload);
        setSuites((prev) => prev.map((s) => s.id === editId ? mapApiSuite(updated) : s));
      } else {
        const created = await suitesApi.create(payload);
        setSuites((prev) => [...prev, mapApiSuite(created)]);
      }
    } catch {
      // backend offline — update locally
      if (editId) {
        setSuites((prev) => prev.map((s) => s.id === editId ? { ...form, id: editId } : s));
      } else {
        const localId = `local-${Date.now()}`;
        setSuites((prev) => [...prev, { ...form, id: localId }]);
      }
    }
  };

  const deleteSuite = async (id: string) => {
    try { await suitesApi.remove(Number(id)); } catch { /* offline — remove locally */ }
    setSuites((prev) => prev.filter((s) => s.id !== id));
  };

  return (
    <SuitesContext.Provider value={{ suites, setSuites, saveSuite, deleteSuite, loading }}>
      {children}
    </SuitesContext.Provider>
  );
}

export function useSuitesContext() {
  const ctx = useContext(SuitesContext);
  if (!ctx) throw new Error("useSuitesContext must be used within SuitesProvider");
  return ctx;
}
