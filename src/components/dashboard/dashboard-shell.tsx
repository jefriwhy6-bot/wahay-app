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
    <div className="flex h-screen overflow-hidden bg-slate-50">
      <div className="hidden lg:flex shrink-0">
        <Sidebar
          collapsed={collapsed}
          onToggle={() => setCollapsed(!collapsed)}
        />
      </div>

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
        <SheetContent side="left" className="p-0 w-[280px] sm:w-[300px] border-none" showCloseButton={false}>
          <Sidebar
            collapsed={false}
            onToggle={() => setMobileOpen(false)}
            onMobileClose={() => setMobileOpen(false)}
          />
        </SheetContent>
      </Sheet>

      <main className="flex-1 overflow-auto w-full min-w-0">
        <div className="lg:hidden h-12" />
        <RoleGuard>{children}</RoleGuard>
      </main>
    </div>
  );
}
