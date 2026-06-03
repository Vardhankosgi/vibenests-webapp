import { createContext, useContext, useState, useMemo } from "react";

export type Booking = {
  id: string; guest: string; phone: string; suite: string;
  occasion: string; date: string; time: string; endTime: string;
  guests: number; amount: string; status: "Confirmed" | "Pending" | "Cancelled";
};

export type UserType = {
  id: string; name: string; email: string; phone: string;
  role: "Guest" | "Admin"; status: "Active" | "Blocked"; joined: string; bookings: number;
};

const initialBookings: Booking[] = [
  { id: "#VN1042", guest: "Arjun Sharma",   phone: "+91 98765 43210", suite: "Royal Celebration Suite",  occasion: "Birthday",       date: "12 Jun 2025", time: "6:00 PM",  endTime: "8:00 PM",  guests: 4, amount: "₹8,500",  status: "Confirmed" },
  { id: "#VN1041", guest: "Priya Reddy",    phone: "+91 91234 56789", suite: "Starlight Romance Suite",  occasion: "Anniversary",    date: "11 Jun 2025", time: "7:00 PM",  endTime: "9:00 PM",  guests: 2, amount: "₹6,200",  status: "Pending"   },
  { id: "#VN1040", guest: "Rahul Mehta",    phone: "+91 99887 76655", suite: "Garden Bliss Suite",       occasion: "Proposal",       date: "10 Jun 2025", time: "8:00 PM",  endTime: "10:00 PM", guests: 2, amount: "₹5,000",  status: "Confirmed" },
  { id: "#VN1039", guest: "Sneha Patel",    phone: "+91 93456 78901", suite: "Midnight Luxe Suite",      occasion: "Birthday",       date: "09 Jun 2025", time: "5:00 PM",  endTime: "7:30 PM",  guests: 6, amount: "₹7,800",  status: "Cancelled" },
  { id: "#VN1038", guest: "Vikram Nair",    phone: "+91 87654 32109", suite: "Royal Celebration Suite",  occasion: "Anniversary",    date: "08 Jun 2025", time: "7:30 PM",  endTime: "9:30 PM",  guests: 2, amount: "₹9,200",  status: "Confirmed" },
  { id: "#VN1037", guest: "Divya Krishnan", phone: "+91 76543 21098", suite: "Starlight Romance Suite",  occasion: "Surprise Party", date: "07 Jun 2025", time: "6:30 PM",  endTime: "9:00 PM",  guests: 8, amount: "₹11,000", status: "Confirmed" },
  { id: "#VN1036", guest: "Karan Malhotra", phone: "+91 65432 10987", suite: "Garden Bliss Suite",       occasion: "Birthday",       date: "06 Jun 2025", time: "5:30 PM",  endTime: "7:30 PM",  guests: 5, amount: "₹4,800",  status: "Pending"   },
  { id: "#VN1035", guest: "Ananya Singh",   phone: "+91 54321 09876", suite: "Midnight Luxe Suite",      occasion: "Proposal",       date: "05 Jun 2025", time: "8:30 PM",  endTime: "10:30 PM", guests: 2, amount: "₹6,500",  status: "Confirmed" },
  { id: "#VN1034", guest: "Rohan Gupta",    phone: "+91 43210 98765", suite: "Royal Celebration Suite",  occasion: "Anniversary",    date: "04 Jun 2025", time: "7:00 PM",  endTime: "9:00 PM",  guests: 2, amount: "₹8,000",  status: "Cancelled" },
  { id: "#VN1033", guest: "Meera Iyer",     phone: "+91 32109 87654", suite: "Starlight Romance Suite",  occasion: "Birthday",       date: "03 Jun 2025", time: "6:00 PM",  endTime: "8:00 PM",  guests: 4, amount: "₹7,200",  status: "Confirmed" },
];

const initialUsers: UserType[] = [
  { id: "U001", name: "Arjun Sharma",   email: "arjun@example.com",  phone: "+91 98765 43210", role: "Guest", status: "Active",  joined: "12 Jan 2025", bookings: 4 },
  { id: "U002", name: "Priya Reddy",    email: "priya@example.com",  phone: "+91 91234 56789", role: "Guest", status: "Active",  joined: "20 Feb 2025", bookings: 2 },
  { id: "U003", name: "Rahul Mehta",    email: "rahul@example.com",  phone: "+91 99887 76655", role: "Guest", status: "Blocked", joined: "05 Mar 2025", bookings: 1 },
  { id: "U004", name: "Sneha Patel",    email: "sneha@example.com",  phone: "+91 93456 78901", role: "Guest", status: "Active",  joined: "18 Mar 2025", bookings: 3 },
  { id: "U005", name: "Vikram Nair",    email: "vikram@example.com", phone: "+91 87654 32109", role: "Admin", status: "Active",  joined: "01 Jan 2025", bookings: 0 },
  { id: "U006", name: "Divya Krishnan", email: "divya@example.com",  phone: "+91 76543 21098", role: "Guest", status: "Active",  joined: "22 Apr 2025", bookings: 5 },
  { id: "U007", name: "Karan Malhotra", email: "karan@example.com",  phone: "+91 65432 10987", role: "Guest", status: "Active",  joined: "06 Jun 2025", bookings: 3 },
  { id: "U008", name: "Meera Iyer",     email: "meera@example.com",  phone: "+91 32109 87654", role: "Guest", status: "Active",  joined: "03 Jun 2025", bookings: 2 },
];

// helper: parse "₹8,500" → 8500
export function parseAmount(str: string): number {
  return parseInt(str.replace(/[₹,]/g, ""), 10) || 0;
}

type Stats = {
  totalRevenue: number;
  totalBookings: number;
  confirmedBookings: number;
  pendingBookings: number;
  cancelledBookings: number;
  totalCustomers: number;
  activeCustomers: number;
  blockedCustomers: number;
  avgBookingValue: number;
};

type AppDataContextType = {
  bookings: Booking[];
  setBookings: React.Dispatch<React.SetStateAction<Booking[]>>;
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  stats: Stats;
};

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>(initialBookings);
  const [users, setUsers] = useState<UserType[]>(initialUsers);

  const stats = useMemo<Stats>(() => {
    const confirmed = bookings.filter((b) => b.status === "Confirmed");
    const totalRevenue = confirmed.reduce((s, b) => s + parseAmount(b.amount), 0);
    return {
      totalRevenue,
      totalBookings: bookings.length,
      confirmedBookings: confirmed.length,
      pendingBookings: bookings.filter((b) => b.status === "Pending").length,
      cancelledBookings: bookings.filter((b) => b.status === "Cancelled").length,
      totalCustomers: users.length,
      activeCustomers: users.filter((u) => u.status === "Active").length,
      blockedCustomers: users.filter((u) => u.status === "Blocked").length,
      avgBookingValue: confirmed.length ? Math.round(totalRevenue / confirmed.length) : 0,
    };
  }, [bookings, users]);

  return (
    <AppDataContext.Provider value={{ bookings, setBookings, users, setUsers, stats }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
