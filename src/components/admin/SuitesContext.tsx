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

export function SuitesProvider({ children }: { children: React.ReactNode }) {
  const [suites, setSuites] = useState<Suite[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    suitesApi.getAll()
      .then((list) => setSuites(list.map(mapApiSuite)))
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
    if (editId) {
      const updated = await suitesApi.update(Number(editId), payload);
      setSuites((prev) => prev.map((s) => s.id === editId ? mapApiSuite(updated) : s));
    } else {
      const created = await suitesApi.create(payload);
      setSuites((prev) => [...prev, mapApiSuite(created)]);
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
