import { useState } from "react";
import { Outlet } from "react-router-dom";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SuitesProvider } from "@/components/admin/SuitesContext";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);

  return (
    <SuitesProvider>
      <div className="flex min-h-screen bg-[oklch(0.09_0.02_260)]">
        <AdminSidebar collapsed={collapsed} onToggle={() => setCollapsed((c) => !c)} />
        <div className="flex-1 flex flex-col overflow-hidden">
          <Outlet />
        </div>
      </div>
    </SuitesProvider>
  );
}
