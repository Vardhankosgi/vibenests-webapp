import { createContext, useContext, useState, useMemo, useEffect } from "react";
import { bookingsApi, usersApi } from "@/lib/api";

export type Booking = {
  rawId?: string;
  id: string; guest: string; phone: string; suite: string;
  occasion: string; date: string; time: string; endTime: string;
  guests: number; amount: string; status: "Confirmed" | "Pending" | "Cancelled";
};

export type UserType = {
  id: string; name: string; email: string; phone: string;
  role: "Guest" | "Admin"; status: "Active" | "Blocked"; joined: string; bookings: number;
};

// helper: parse "₹8,500" or number → number
export function parseAmount(val: string | number): number {
  if (typeof val === "number") return val;
  return parseInt(String(val).replace(/[₹,]/g, ""), 10) || 0;
}

function mapApiBooking(b: any): Booking {
  const guestName = b.guestFirstName
    ? `${b.guestFirstName} ${b.guestLastName ?? ''}`.trim()
    : (b.user?.fullName ?? 'Guest');
  return {
    id: `#VN${b.id}`,
    rawId: String(b.id),
    guest: guestName,
    phone: b.guestPhone ?? b.user?.phone ?? '',
    suite: b.suite?.name ?? `Suite ${b.suiteId}`,
    occasion: b.eventType ?? '',
    date: b.date ?? '',
    time: b.timeSlot ?? '',
    endTime: b.endTimeSlot ?? '',
    guests: 0,
    amount: b.totalAmount && Number(b.totalAmount) > 0
      ? `₹${Number(b.totalAmount).toLocaleString()}`
      : (b.payment?.amount ? `₹${Number(b.payment.amount).toLocaleString()}` : '₹0'),
    status: (b.status?.charAt(0).toUpperCase() + b.status?.slice(1)) as Booking['status'],
  };
}

function mapApiUser(u: any): UserType {
  return {
    id: String(u.id),
    name: u.fullName ?? "",
    email: u.email ?? "",
    phone: u.phone ?? "",
    role: u.role === "admin" || u.role === "superadmin" ? "Admin" : "Guest",
    status: u.isActive ? "Active" : "Blocked",
    joined: u.createdAt ? new Date(u.createdAt).toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" }) : "",
    bookings: u.bookingCount ?? 0,
  };
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
  addBooking: (b: any) => void;
  users: UserType[];
  setUsers: React.Dispatch<React.SetStateAction<UserType[]>>;
  stats: Stats;
  loading: boolean;
  refresh: () => void;
};

const AppDataContext = createContext<AppDataContextType | null>(null);

export function AppDataProvider({ children }: { children: React.ReactNode }) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [users, setUsers] = useState<UserType[]>([]);
  const [loading, setLoading] = useState(false);

  const refresh = () => {
    setLoading(true);
    Promise.all([
      bookingsApi.getAll()
        .then((list) => setBookings(Array.isArray(list) ? list.map(mapApiBooking) : []))
        .catch(() => setBookings([])),
      usersApi.getAll()
        .then((list) => setUsers(Array.isArray(list) ? list.map(mapApiUser) : []))
        .catch(() => setUsers([])),
    ]).finally(() => setLoading(false));
  };

  useEffect(() => { refresh(); }, []);

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

  const addBooking = (b: any) => setBookings((prev) => [mapApiBooking(b), ...prev]);

  return (
    <AppDataContext.Provider value={{ bookings, setBookings, addBooking, users, setUsers, stats, loading, refresh }}>
      {children}
    </AppDataContext.Provider>
  );
}

export function useAppData() {
  const ctx = useContext(AppDataContext);
  if (!ctx) throw new Error("useAppData must be used within AppDataProvider");
  return ctx;
}
