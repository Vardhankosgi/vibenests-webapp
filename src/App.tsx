import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AdminRegisterPage from "@/pages/AdminRegisterPage";
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
import CelebrationPackagesPage from "@/pages/CelebrationPackagesPage";
import SuiteBookingPage from "@/pages/SuiteBookingPage";
import RevenuePage from "@/pages/RevenuePage";
import CustomersPage from "@/pages/CustomersPage";
import AvgBookingValuePage from "@/pages/AvgBookingValuePage";
import UserDashboardPage from "@/pages/UserDashboardPage";
import WriteReviewPage from "@/pages/WriteReviewPage";
import { SuitesProvider } from "@/components/admin/SuitesContext";

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/admin/register" element={<AdminRegisterPage />} />
      <Route path="/user/dashboard" element={<SuitesProvider><UserDashboardPage /></SuitesProvider>} />
      <Route path="/user/suite-booking" element={<SuitesProvider><SuiteBookingPage /></SuitesProvider>} />
      <Route path="/user/write-review" element={<WriteReviewPage />} />
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
        <Route path="/celebration-packages" element={<CelebrationPackagesPage />} />
        <Route path="/suite-booking" element={<SuiteBookingPage />} />
        <Route path="/customers" element={<UsersPage />} />
        <Route path="/analytics" element={<AnalyticsPage />} />
        <Route path="/offers" element={<OffersPage />} />
        <Route path="/settings" element={<SettingsPage />} />
      </Route>
    </Routes>
  );
}
