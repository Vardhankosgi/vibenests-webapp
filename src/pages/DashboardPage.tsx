import { useNavigate } from "react-router-dom";
import { IndianRupee, CalendarDays, Users, TrendingUp } from "lucide-react";
import { AdminHeader } from "@/components/admin/AdminHeader";
import { StatsCard } from "@/components/admin/StatsCard";
import { RevenueChart } from "@/components/admin/RevenueChart";
import { RevenuePieChart } from "@/components/admin/RevenuePieChart";
import { BookingChart } from "@/components/admin/BookingChart";
import { TopSuites } from "@/components/admin/TopSuites";
import { RecentBookings } from "@/components/admin/RecentBookings";
import { DateRangePicker } from "@/components/admin/DateRangePicker";

export default function DashboardPage() {
  const navigate = useNavigate();

  function fmtDate(d: Date) {
    return d.toLocaleDateString("en-IN", { day: "2-digit", month: "short", year: "numeric" });
  }

  const stats = [
    { title: "Total Revenue", value: "₹12.4L", change: "+18%", positive: true, icon: IndianRupee },
    { title: "Total Bookings", value: "284", change: "+12%", positive: true, icon: CalendarDays, onClick: () => navigate("/bookings") },
    { title: "Total Customers", value: "196", change: "+9%", positive: true, icon: Users },
    { title: "Avg. Booking Value", value: "₹4,366", change: "+5%", positive: true, icon: TrendingUp },
  ];

  return (
    <div className="flex-1 overflow-y-auto">
      <AdminHeader title="Dashboard" />
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <p className="text-sm text-muted-foreground">Overview for selected period</p>
          <DateRangePicker />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
          {stats.map((s) => <StatsCard key={s.title} {...s} />)}
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-4">
          <div className="xl:col-span-2"><RevenueChart /></div>
          <RevenuePieChart />
        </div>
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          <BookingChart />
          <TopSuites />
        </div>
        <RecentBookings />
      </div>
    </div>
  );
}
