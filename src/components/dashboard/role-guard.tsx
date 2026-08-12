"use client";

import { useSession } from "next-auth/react";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { canAccessPage, type Role } from "@/lib/permissions";
import { Loader2, ShieldX } from "lucide-react";

export function RoleGuard({ children }: { children: React.ReactNode }) {
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const router = useRouter();

  const userRole = (session?.user as { role?: string })?.role as Role | undefined;

  useEffect(() => {
    if (status === "authenticated" && userRole && !canAccessPage(userRole, pathname)) {
      router.replace("/inbox");
    }
  }, [status, userRole, pathname, router]);

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center h-full min-h-[50vh]">
        <Loader2 className="w-6 h-6 animate-spin text-emerald-600" />
      </div>
    );
  }

  if (userRole && !canAccessPage(userRole, pathname)) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[50vh] gap-3">
        <ShieldX className="w-12 h-12 text-red-400" />
        <h2 className="text-lg font-semibold text-gray-700">Akses Ditolak</h2>
        <p className="text-sm text-gray-500">Kamu tidak punya izin untuk halaman ini.</p>
      </div>
    );
  }

  return <>{children}</>;
}
