"use client";

import { useState, useEffect } from "react";
import { Sidebar } from "./sidebar";
import { RoleGuard } from "./role-guard";
import { Menu } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <div className="flex h-screen overflow-hidden">
      {/* Desktop sidebar */}
      <aside className="hidden lg:block shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>

      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="lg:hidden fixed top-3 left-3 z-40 w-10 h-10 flex items-center justify-center bg-white shadow-md border border-slate-200 rounded-full"
      >
        <Menu className="w-5 h-5 text-slate-700" />
      </button>

      {/* Mobile sidebar overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div className="w-[260px] shrink-0 h-full">
            <Sidebar
              collapsed={false}
              onToggle={() => setMobileOpen(false)}
              onMobileClose={() => setMobileOpen(false)}
            />
          </div>
          <div
            className="flex-1 bg-black/40"
            onClick={() => setMobileOpen(false)}
          />
        </div>
      )}

      {/* Main content */}
      <main className="flex-1 overflow-auto min-w-0 bg-slate-50">
        <div className="lg:hidden h-12" />
        <RoleGuard>{children}</RoleGuard>
      </main>
    </div>
  );
}
