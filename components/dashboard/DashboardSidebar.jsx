"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Video, CreditCard, Settings,
  LogOut, Menu, X, ChevronRight,
} from "lucide-react";
import LogoWordmark from "@/components/LogoWordmark";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Video, label: "Traitement vidéo" },
  { href: "/dashboard/billing", icon: CreditCard, label: "Abonnement" },
  { href: "/dashboard/settings", icon: Settings, label: "Paramètres" },
];

export default function DashboardSidebar() {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Utilisateur";
  const planLabel = "Gratuit · 2 vidéos";

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
      {/* Logo */}
      <div className="px-5 py-5 border-b border-gray-100 dark:border-zinc-800">
        <Link href="/">
          <LogoWordmark className="text-base" />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {NAV_ITEMS.map(({ href, icon: Icon, label }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 group ${
                active
                  ? "bg-orange-50 dark:bg-orange-950/50 text-orange-600"
                  : "text-gray-500 dark:text-zinc-400 hover:text-black dark:hover:text-white hover:bg-gray-100 dark:hover:bg-zinc-800"
              }`}
            >
              <Icon className={`w-4 h-4 flex-shrink-0 ${active ? "text-orange-500" : "text-gray-400 group-hover:text-gray-600"}`} />
              {label}
              {active && <ChevronRight className="w-3.5 h-3.5 ml-auto text-orange-400" />}
            </Link>
          );
        })}
      </nav>

      {/* Plan badge */}
      <div className="px-3 pb-3">
        <div className="px-3 py-2.5 bg-orange-50 border border-orange-100 rounded-xl">
          <p className="text-xs font-medium text-orange-700">{planLabel}</p>
          <Link
            href="/dashboard/billing"
            className="text-xs text-orange-500 hover:underline underline-offset-2 font-medium"
          >
            Passer au Pro →
          </Link>
        </div>
      </div>

      {/* User */}
      <div className="px-3 pb-4 border-t border-gray-100 pt-3">
        <div className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 transition-colors cursor-default">
          <div className="min-w-0 flex-1">
            <p className="text-xs font-semibold text-black truncate">{firstName}</p>
            <p className="text-xs text-gray-400 truncate">{user?.email}</p>
          </div>
          <button
            onClick={logout}
            className="flex-shrink-0 p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors"
            title="Se déconnecter"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Sidebar desktop */}
      <aside className="hidden lg:flex flex-col w-60 bg-white dark:bg-zinc-900 border-r border-gray-100 dark:border-zinc-800 min-h-screen flex-shrink-0 self-stretch transition-colors duration-200">
        <SidebarContent />
      </aside>

      {/* Topbar mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white dark:bg-zinc-900 border-b border-gray-100 dark:border-zinc-800 h-14 flex items-center justify-between px-4">
        <Link href="/">
          <LogoWordmark className="text-sm" />
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 dark:border-zinc-700 text-gray-600 dark:text-zinc-300"
        >
          {mobileOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>
      </div>

      {/* Drawer mobile */}
      {mobileOpen && (
        <>
          <div
            className="lg:hidden fixed inset-0 z-30 bg-black/20 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 z-40 w-64 bg-white dark:bg-zinc-900 shadow-xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Spacer mobile pour le topbar fixe */}
      <div className="lg:hidden h-14 w-full" />
    </>
  );
}
