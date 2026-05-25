"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  Zap, Video, History, CreditCard, Settings,
  LogOut, User, Menu, X, ChevronRight,
} from "lucide-react";

const NAV_ITEMS = [
  { href: "/dashboard", icon: Video, label: "Traitement vidéo" },
  { href: "/dashboard/history", icon: History, label: "Historique" },
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
      <div className="px-5 py-5 border-b border-gray-100">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center flex-shrink-0">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[16px] font-semibold text-black tracking-tight">OriginalReels</span>
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
                  ? "bg-orange-50 text-orange-600"
                  : "text-gray-500 hover:text-black hover:bg-gray-100"
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
          {user?.photoURL ? (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full object-cover flex-shrink-0" />
          ) : (
            <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
              <User className="w-4 h-4 text-orange-500" />
            </div>
          )}
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
      <aside className="hidden lg:flex flex-col w-60 bg-white border-r border-gray-100 h-screen sticky top-0 flex-shrink-0">
        <SidebarContent />
      </aside>

      {/* Topbar mobile */}
      <div className="lg:hidden fixed top-0 left-0 right-0 z-40 bg-white border-b border-gray-100 h-14 flex items-center justify-between px-4">
        <Link href="/" className="flex items-center gap-2">
          <div className="w-7 h-7 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-3.5 h-3.5 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-sm font-semibold text-black">OriginalReels</span>
        </Link>
        <button
          onClick={() => setMobileOpen(!mobileOpen)}
          className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600"
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
          <aside className="lg:hidden fixed top-0 left-0 bottom-0 z-40 w-64 bg-white shadow-xl">
            <SidebarContent />
          </aside>
        </>
      )}

      {/* Spacer mobile pour le topbar fixe */}
      <div className="lg:hidden h-14 w-full" />
    </>
  );
}
