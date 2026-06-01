import { createContext, useContext, useState } from "react";

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

const initialSuites: Suite[] = [
  { id: "S001", name: "Royal Celebration Suite", capacity: 10, price: "₹8,500", occasions: "Birthday, Anniversary", status: "Active", description: "Luxurious suite with royal decor, perfect for grand celebrations.", images: [], amenities: ["WiFi", "Smart TV", "AC", "Music System", "Decoration", "Cake"] },
  { id: "S002", name: "Starlight Romance Suite", capacity: 4, price: "₹6,200", occasions: "Anniversary, Proposal", status: "Active", description: "Intimate suite with starlight ambience for romantic occasions.", images: [], amenities: ["WiFi", "AC", "Music System", "Welcome Drinks", "Decoration"] },
  { id: "S003", name: "Garden Bliss Suite", capacity: 12, price: "₹5,000", occasions: "Birthday, Surprise Party", status: "Active", description: "Garden-themed suite with natural decor and open feel.", images: [], amenities: ["WiFi", "Smart TV", "AC", "Photography", "Cake", "Decoration"] },
  { id: "S004", name: "Midnight Luxe Suite", capacity: 6, price: "₹7,800", occasions: "Proposal, Anniversary", status: "Inactive", description: "Elegant midnight-themed suite with premium lighting.", images: [], amenities: ["WiFi", "Smart TV", "AC", "Music System", "Welcome Drinks", "Photography", "Decoration"] },
];

type SuitesContextType = {
  suites: Suite[];
  setSuites: React.Dispatch<React.SetStateAction<Suite[]>>;
};

const SuitesContext = createContext<SuitesContextType | null>(null);

export function SuitesProvider({ children }: { children: React.ReactNode }) {
  const [suites, setSuites] = useState<Suite[]>(initialSuites);
  return (
    <SuitesContext.Provider value={{ suites, setSuites }}>
      {children}
    </SuitesContext.Provider>
  );
}

export function useSuitesContext() {
  const ctx = useContext(SuitesContext);
  if (!ctx) throw new Error("useSuitesContext must be used within SuitesProvider");
  return ctx;
}
