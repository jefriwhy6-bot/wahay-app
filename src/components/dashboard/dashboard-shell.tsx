"use client";

import { useState } from "react";
import { Sidebar } from "./sidebar";
import { RoleGuard } from "./role-guard";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Menu } from "lucide-react";

export function DashboardShell({ children }: { children: React.ReactNode }) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <aside className="hidden lg:block shrink-0 bg-slate-900">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </aside>

      <Sheet open={mobileOpen} onOpenChange={setMobileOpen}>
        <SheetTrigger className="lg:hidden fixed top-3 left-3 z-50">
          <Button
            variant="ghost"
            size="icon"
            className="bg-white shadow-md border border-slate-200 rounded-full"
          >
            <Menu className="w-5 h-5" />
          </Button>
        </SheetTrigger>
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px] !border-r-0 !border-none shadow-2xl" showCloseButton={false}>
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onMobileClose={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto min-w-0 bg-slate-50">
        <div className="lg:hidden h-12" />
        <RoleGuard>{children}</RoleGuard>
      </main>
    </div>
  );
}
