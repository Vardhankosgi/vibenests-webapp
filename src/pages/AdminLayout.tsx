import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SuitesProvider } from "@/components/admin/SuitesContext";
import { SidebarProvider } from "@/components/admin/SidebarContext";

export default function AdminLayout() {
  return (
    <SidebarProvider>
      <SuitesProvider>
        <AdminLayoutContent />
      </SuitesProvider>
    </SidebarProvider>
  );
}

function AdminLayoutContent() {
  return (
    <div className="flex min-h-screen bg-[oklch(0.09_0.02_260)]">
      <AdminSidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Outlet />
      </div>
    </div>
  );
}

