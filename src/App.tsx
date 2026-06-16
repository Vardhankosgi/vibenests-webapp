import { Routes, Route, Navigate } from "react-router-dom";
import LoginPage from "@/pages/LoginPage";
import RegisterPage from "@/pages/RegisterPage";
import AdminRegisterPage from "@/pages/AdminRegisterPage";
import AdminLayout from "@/pages/AdminLayout";
import DashboardPage from "@/pages/DashboardPage";
import { AdminProtectedRoute } from "@/components/auth/AdminProtectedRoute";

import BookingsPage from "@/pages/BookingsPage";
import SuitesPage from "@/pages/SuitesPage";
import BookingDetailsPage from "@/pages/BookingDetailsPage";
import UsersPage from "@/pages/UsersPage";
import SettingsPage from "@/pages/SettingsPage";
import AddonsPage from "@/pages/AddonsPage";
import AnalyticsPage from "@/pages/AnalyticsPage";
import OffersPage from "@/pages/OffersPage";
import PackagesPage from "@/pages/PackagesPage";
import CelebrationMembershipsPage from "@/pages/CelebrationMembershipsPage";
import SuiteBookingPage from "@/pages/SuiteBookingPage";
import RevenuePage from "@/pages/RevenuePage";
import CustomersPage from "@/pages/CustomersPage";
import AvgBookingValuePage from "@/pages/AvgBookingValuePage";
import UserDashboardPage from "@/pages/UserDashboardPage";
import ResetPasswordPage from "@/pages/ResetPasswordPage";
import WriteReviewPage from "@/pages/WriteReviewPage";
import ReviewsPage from "@/pages/ReviewsPage";
import PrivacyPolicyPage from "@/pages/PrivacyPolicyPage";
import TermsOfUsePage from "@/pages/TermsOfUsePage";
import ContactUsPage from "@/pages/ContactUsPage";
import TransactionsPage from "@/pages/TransactionsPage";
import { SuitesProvider } from "@/components/admin/SuitesContext";
import RazorpayProvider from "@/components/shared/RazorpayProvider";
import { AppDataProvider } from "@/components/admin/AppDataContext";
import FloatingWhatsAppBot from "@/components/shared/FloatingWhatsAppBot";

export default function App() {
  return (
    <AppDataProvider>
      <RazorpayProvider>
        <FloatingWhatsAppBot />
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/reset-password" element={<ResetPasswordPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route path="/admin/register" element={<AdminRegisterPage />} />
          <Route path="/user/dashboard" element={<SuitesProvider><UserDashboardPage /></SuitesProvider>} />
          <Route path="/user/suite-booking" element={<SuitesProvider><SuiteBookingPage /></SuitesProvider>} />
          <Route path="/user/write-review" element={<WriteReviewPage />} />
          <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
          <Route path="/terms-of-use" element={<TermsOfUsePage />} />
          <Route path="/contact" element={<ContactUsPage />} />
          <Route path="/" element={<Navigate to="/login" replace />} />
          <Route element={<AdminProtectedRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/dashboard" element={<DashboardPage />} />
              <Route path="/revenue" element={<RevenuePage />} />
              <Route path="/customers-overview" element={<CustomersPage />} />
              <Route path="/avg-booking-value" element={<AvgBookingValuePage />} />
              <Route path="/bookings" element={<BookingsPage />} />
              <Route path="/bookings/:id" element={<BookingDetailsPage />} />

              <Route path="/rooms" element={<SuitesPage />} />
              <Route path="/addons" element={<AddonsPage />} />
              <Route path="/packages" element={<PackagesPage />} />
              <Route path="/celebration-memberships" element={<CelebrationMembershipsPage />} />
              <Route path="/suite-booking" element={<SuiteBookingPage />} />
              <Route path="/customers" element={<UsersPage />} />
              <Route path="/analytics" element={<AnalyticsPage />} />
              <Route path="/offers" element={<OffersPage />} />
              <Route path="/transactions" element={<TransactionsPage />} />
              <Route path="/reviews" element={<ReviewsPage />} />
              <Route path="/settings" element={<SettingsPage />} />
            </Route>
          </Route>

        </Routes>
      </RazorpayProvider>
    </AppDataProvider>
  );
}

