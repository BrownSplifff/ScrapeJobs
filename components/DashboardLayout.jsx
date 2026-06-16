"use client";

import { useState } from "react";
import Sidebar from "./Sidebar";

export default function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex min-h-screen bg-slate-50">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <main className="flex-1 overflow-y-auto">{children}</main>
    </div>
  );
}
