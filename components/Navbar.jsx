"use client";

import { useState, useRef, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { Zap, Menu, X, LogOut, User, ChevronDown, LayoutDashboard } from "lucide-react";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const { user, loading, logout } = useAuth();
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleLogout = async () => {
    await logout();
    setDropdownOpen(false);
    setMenuOpen(false);
  };

  const firstName = user?.displayName?.split(" ")[0] || user?.email?.split("@")[0] || "Mon compte";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-md border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 flex-shrink-0" onClick={() => setMenuOpen(false)}>
          <div className="w-8 h-8 bg-orange-500 rounded-lg flex items-center justify-center">
            <Zap className="w-4 h-4 text-white" strokeWidth={2.5} />
          </div>
          <span className="text-[17px] font-semibold text-black tracking-tight">OriginalReels</span>
        </Link>

        {/* Desktop */}
        <div className="hidden sm:flex items-center gap-3">
          {loading ? (
            <div className="w-28 h-9 bg-gray-100 rounded-lg animate-pulse" />
          ) : user ? (
            <div className="flex items-center gap-3">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg btn-glow transition-all duration-200"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(!dropdownOpen)}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl border border-gray-200 hover:border-gray-400 transition-all duration-200"
              >
                {user.photoURL ? (
                  <img src={user.photoURL} alt={user.displayName} className="w-7 h-7 rounded-full object-cover" />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-orange-100 flex items-center justify-center">
                    <User className="w-4 h-4 text-orange-500" />
                  </div>
                )}
                <span className="text-sm font-medium text-black max-w-[120px] truncate">{firstName}</span>
                <ChevronDown className={`w-3.5 h-3.5 text-gray-400 transition-transform duration-200 ${dropdownOpen ? "rotate-180" : ""}`} />
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white border border-gray-100 rounded-2xl shadow-lg shadow-black/5 overflow-hidden z-50">
                  <div className="px-4 py-3 border-b border-gray-50">
                    <p className="text-xs font-medium text-black truncate">{user.displayName || "Utilisateur"}</p>
                    <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
                  </div>
                  <div className="p-1.5">
                    <button
                      onClick={handleLogout}
                      className="w-full flex items-center gap-2.5 px-3 py-2.5 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors duration-150"
                    >
                      <LogOut className="w-4 h-4" />
                      Se déconnecter
                    </button>
                  </div>
                </div>
              )}
            </div>
            </div>
          ) : (
            <>
              <Link href="/login" className="px-4 py-2 text-sm font-medium text-gray-700 hover:text-black border border-gray-200 hover:border-gray-400 rounded-lg transition-all duration-200">
                Se connecter
              </Link>
              <Link href="/signup" className="btn-glow px-4 py-2 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200">
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile */}
        <div className="flex sm:hidden items-center gap-2">
          {user?.photoURL && (
            <img src={user.photoURL} alt="" className="w-8 h-8 rounded-full border border-gray-200 object-cover" />
          )}
          {!user && !loading && (
            <Link href="/signup" className="btn-glow px-3 py-1.5 text-xs font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-all duration-200">
              S&apos;inscrire
            </Link>
          )}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="w-9 h-9 flex items-center justify-center rounded-lg border border-gray-200 text-gray-600 hover:text-black hover:border-gray-400 transition-all duration-200"
            aria-label="Menu"
          >
            {menuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Menu mobile */}
      {menuOpen && (
        <div className="sm:hidden bg-white border-t border-gray-100 px-4 py-4 space-y-2">
          {user ? (
            <>
              <div className="px-4 py-3 bg-gray-50 rounded-xl mb-2">
                <p className="text-xs font-medium text-black truncate">{user.displayName || "Utilisateur"}</p>
                <p className="text-xs text-gray-400 truncate mt-0.5">{user.email}</p>
              </div>
              <Link
                href="/dashboard"
                onClick={() => setMenuOpen(false)}
                className="flex items-center gap-2.5 w-full px-4 py-3 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-colors"
              >
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Link>
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-2.5 px-4 py-3 text-sm text-red-500 hover:bg-red-50 rounded-xl transition-colors"
              >
                <LogOut className="w-4 h-4" />
                Se déconnecter
              </button>
            </>
          ) : (
            <>
              <Link href="/login" onClick={() => setMenuOpen(false)} className="flex items-center w-full px-4 py-3 text-sm font-medium text-gray-700 hover:text-black hover:bg-gray-50 rounded-xl transition-all duration-200">
                Se connecter
              </Link>
              <Link href="/signup" onClick={() => setMenuOpen(false)} className="flex items-center justify-center w-full px-4 py-3 text-sm font-semibold bg-orange-500 hover:bg-orange-600 text-white rounded-xl transition-all duration-200">
                S&apos;inscrire gratuitement
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
