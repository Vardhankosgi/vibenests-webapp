import { createContext, useContext, useState, useEffect } from "react";
import { suitesApi } from "@/lib/api";

export type Suite = {
  id: string;
  name: string;
  minCapacity: number;
  capacity: number;
  price: string;
  ratePerExtraPerson: number;
  baseDiscount: number;
  slotStartTime: string;
  slotEndTime: string;
  slotDurationMins: number;
  gapBetweenSlotsMins: number;
  occasions: string;
  status: "Active" | "Inactive";
  description: string;
  images: string[];
  amenities: string[];
};

function parseImages(val: any): string[] {
  if (Array.isArray(val)) return val;
  if (!val || val === '[]' || val === '') return [];
  try { return JSON.parse(val); } catch { return []; }
}

function parseSimpleArray(val: any): string[] {
  if (Array.isArray(val)) return val.filter(Boolean);
  if (!val || val === '') return [];
  return String(val).split(',').map((s) => s.trim()).filter(Boolean);
}

function mapApiSuite(s: any): Suite {
  return {
    id: String(s.id),
    name: s.name ?? "",
    minCapacity: s.minCapacity ?? 1,
    capacity: s.capacity ?? 0,
    price: s.price ? `₹${Number(s.price).toLocaleString()}` : "₹0",
    ratePerExtraPerson: Number(s.ratePerExtraPerson ?? 0),
    baseDiscount: Number(s.baseDiscount ?? 0),
    slotStartTime: s.slotStartTime ?? "09:00",
    slotEndTime: s.slotEndTime ?? "21:00",
    slotDurationMins: Number(s.slotDurationMins ?? 150),
    gapBetweenSlotsMins: Number(s.gapBetweenSlotsMins ?? 30),
    occasions: s.themeType ?? "",
    status: s.status === "available" ? "Active" : "Inactive",
    description: s.description ?? "",
    images: parseImages(s.images),
    amenities: parseSimpleArray(s.amenities),
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

export function SuitesProvider({ children }: { children: React.ReactNode }) {
  const [suites, setSuites] = useState<Suite[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    suitesApi.getAll()
      .then((list) => { setSuites(Array.isArray(list) ? list.map(mapApiSuite) : []); })
      .catch(() => { setSuites([]); })
      .finally(() => setLoading(false));
  }, []);

  const saveSuite = async (form: Omit<Suite, "id">, editId: string | null) => {
    const payload = {
      name: form.name,
      minCapacity: form.minCapacity,
      capacity: form.capacity,
      price: parseFloat(String(form.price).replace(/[₹,]/g, "")) || 0,
      ratePerExtraPerson: form.ratePerExtraPerson,
      baseDiscount: form.baseDiscount,
      slotStartTime: form.slotStartTime,
      slotEndTime: form.slotEndTime,
      slotDurationMins: form.slotDurationMins,
      gapBetweenSlotsMins: form.gapBetweenSlotsMins,
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
    } catch (err: any) {
      throw err;
    }
  };

  const deleteSuite = async (id: string) => {
    await suitesApi.remove(Number(id));
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
