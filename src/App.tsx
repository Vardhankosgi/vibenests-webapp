import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import AdminLayout from "@/pages/AdminLayout";
import DashboardPage from "@/pages/DashboardPage";
import BookingsPage from "@/pages/BookingsPage";
import SuitesPage from "@/pages/SuitesPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import AddonsPage from "@/pages/AddonsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import OffersPage from "@/pages/OffersPage";
import PackagesPage from "@/pages/PackagesPage";
import RevenuePage from "@/pages/RevenuePage";
import CustomersPage from "@/pages/CustomersPage";
import AvgBookingValuePage from "@/pages/AvgBookingValuePage";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/" element={<Navigate to="/login" replace />} />
      <Route element={<AdminLayout />}>
        <Route path="/dashboard" element={<DashboardPage />} />
        <Route path="/revenue" element={<RevenuePage />} />
        <Route path="/customers-overview" element={<CustomersPage />} />
        <Route path="/avg-booking-value" element={<AvgBookingValuePage />} />
        <Route path="/bookings" element={<BookingsPage />} />
        <Route path="/rooms" element={<SuitesPage />} />
        <Route path="/addons" element={<AddonsPage />} />
        <Route path="/packages" element={<PackagesPage />} />
        <Route path="/customers" element={<UsersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
