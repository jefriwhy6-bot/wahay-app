"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut, useSession } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MessageSquare,
  Users,
  ShoppingBag,
  ClipboardList,
  BookOpen,
  HelpCircle,
  Zap,
  UserPlus,
  Clock,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  Menu,
  Bot,
  Bell,
  TrendingUp,
} from "lucide-react";
import { type Role, hasAccess } from "@/lib/permissions";
import { LanguageSwitcher } from "@/components/language-switcher";
import { useI18n } from "@/lib/i18n";

const navItemsDef = [
  { href: "/inbox", tKey: "inbox" as const, icon: MessageSquare, minRole: "AGENT" as Role },
  { href: "/contacts", tKey: "contacts" as const, icon: Users, minRole: "AGENT" as Role },
  { href: "/catalog", tKey: "catalog" as const, icon: ShoppingBag, minRole: "ADMIN" as Role },
  { href: "/orders", tKey: "orders" as const, icon: ClipboardList, minRole: "ADMIN" as Role },
  { href: "/knowledge", tKey: "knowledge" as const, icon: BookOpen, minRole: "ADMIN" as Role },
  { href: "/faq", tKey: "faq" as const, icon: HelpCircle, minRole: "ADMIN" as Role },
  { href: "/quick-replies", tKey: "quickReplies" as const, icon: Zap, minRole: "ADMIN" as Role },
  { href: "/broadcast", tKey: "team" as const, icon: UserPlus, minRole: "ADMIN" as Role },
  { href: "/greeting", tKey: "greeting" as const, icon: Bell, minRole: "ADMIN" as Role },
  { href: "/follow-up", tKey: "followUp" as const, icon: Clock, minRole: "ADMIN" as Role },
  { href: "/agent-performance", tKey: "agentPerformance" as const, icon: TrendingUp, minRole: "ADMIN" as Role },
  { href: "/analytics", tKey: "analytics" as const, icon: BarChart3, minRole: "ADMIN" as Role },
  { href: "/settings", tKey: "settings" as const, icon: Settings, minRole: "ADMIN" as Role },
];

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
  onMobileClose?: () => void;
}

export function Sidebar({ collapsed, onToggle, onMobileClose }: SidebarProps) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { t } = useI18n();

  const initials = session?.user?.name
    ? session.user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "U";

  return (
    <div
      className={cn(
        "relative flex flex-col h-full bg-gradient-to-b from-slate-900 to-slate-800 transition-all duration-300",
        collapsed ? "w-[68px]" : "w-[260px]"
      )}
    >
      <div className={cn(
        "flex items-center h-16 border-b border-white/10 transition-all duration-300",
        collapsed ? "justify-center px-2" : "justify-between px-4"
      )}>
        <Link href="/inbox" className={cn("flex items-center overflow-hidden", collapsed ? "justify-center" : "gap-2.5")} onClick={onMobileClose}>
          <div className={cn(
            "bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shrink-0 shadow-lg shadow-green-500/20 transition-all duration-300",
            collapsed ? "w-8 h-8" : "w-9 h-9"
          )}>
            <Bot className={cn("text-white transition-all duration-300", collapsed ? "w-4 h-4" : "w-5 h-5")} />
          </div>
          <div className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", collapsed ? "w-0 opacity-0" : "w-auto opacity-100 ml-2.5")}>
            <span className="font-bold text-base text-white tracking-tight">WA Chatbot</span>
            <p className="text-[10px] text-green-400/80 -mt-0.5">AI Assistant</p>
          </div>
        </Link>
        {!collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex h-7 w-7 text-white/50 hover:text-white hover:bg-white/10 shrink-0"
          >
            <ChevronLeft className="w-4 h-4" />
          </Button>
        )}
        {collapsed && (
          <Button
            variant="ghost"
            size="icon"
            onClick={onToggle}
            className="hidden lg:flex absolute top-[18px] -right-3 h-6 w-6 rounded-full bg-slate-700 border border-slate-600 text-white/70 hover:text-white hover:bg-slate-600 shadow-md"
          >
            <Menu className="w-3 h-3" />
          </Button>
        )}
      </div>

      <ScrollArea className="flex-1 py-3">
        <nav className={cn("space-y-0.5", collapsed ? "px-1.5" : "px-2")}>
          {navItemsDef.filter((item) => {
            const userRole = (session?.user as { role?: string })?.role as Role | undefined;
            if (!userRole) return true;
            return hasAccess(userRole, item.minRole);
          }).map((item) => {
            const isActive = pathname.startsWith(item.href);
            const Icon = item.icon;

            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={onMobileClose}
                title={collapsed ? t.nav[item.tKey] : undefined}
                className={cn(
                  "flex items-center rounded-lg text-sm font-medium transition-all duration-200",
                  collapsed ? "justify-center px-0 py-2.5 mx-auto w-10 h-10" : "gap-3 px-3 py-2.5",
                  isActive
                    ? "bg-green-500/20 text-green-400 shadow-sm"
                    : "text-slate-400 hover:bg-white/5 hover:text-white"
                )}
              >
                <Icon
                  className={cn(
                    "shrink-0",
                    collapsed ? "w-[20px] h-[20px]" : "w-[18px] h-[18px]",
                    isActive ? "text-green-400" : "text-slate-500"
                  )}
                />
                <span className={cn("transition-all duration-300 overflow-hidden whitespace-nowrap", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>{t.nav[item.tKey]}</span>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>

      <div className={cn("border-t border-white/10 flex justify-center", collapsed ? "p-1.5" : "p-2")}>
        <LanguageSwitcher compact={collapsed} />
      </div>

      <div className={cn("border-t border-white/10", collapsed ? "p-1.5" : "p-3")}>
        <DropdownMenu>
          <DropdownMenuTrigger
            className={cn(
              "flex items-center w-full rounded-lg hover:bg-white/5 transition-colors outline-none",
              collapsed ? "justify-center p-1.5" : "gap-3 px-2 py-2"
            )}
          >
            <Avatar className={cn(collapsed ? "h-7 w-7" : "h-8 w-8")}>
              <AvatarFallback className="bg-gradient-to-br from-green-400 to-emerald-600 text-white text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className={cn("flex-1 text-left transition-all duration-300 overflow-hidden", collapsed ? "w-0 opacity-0 hidden" : "w-auto opacity-100")}>
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || "User"}
              </p>
              <p className="text-xs text-slate-500 truncate">
                {session?.user?.email}
              </p>
            </div>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            <div className="px-2 py-1.5">
              <p className="text-sm font-medium">{session?.user?.name}</p>
              <p className="text-xs text-gray-500">{session?.user?.email}</p>
              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                {(session?.user as { role?: string })?.role || ""}
              </p>
            </div>
            <DropdownMenuSeparator />
            {hasAccess(((session?.user as { role?: string })?.role || "AGENT") as Role, "ADMIN") && (
              <DropdownMenuItem onClick={() => window.location.href = "/settings"}>
                <Settings className="w-4 h-4 mr-2" />
                Settings
              </DropdownMenuItem>
            )}
            <DropdownMenuSeparator />
            <DropdownMenuItem
              onClick={() => signOut({ callbackUrl: "/login" })}
              className="text-red-600"
            >
              <LogOut className="w-4 h-4 mr-2" />
              {t.common.logout}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
