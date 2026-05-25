"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";
import LogoWordmark from "@/components/LogoWordmark";

export default function DashboardGuard({ children }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  // Délai de grâce — Firebase peut prendre jusqu'à ~800ms pour restaurer la session
  const [grace, setGrace] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setGrace(false), 800);
    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    if (!loading && !grace && !user) {
      router.replace("/login");
    }
  }, [user, loading, grace, router]);

  if (loading || grace || !user) {
    return (
      <div className="min-h-screen bg-white dark:bg-zinc-950 flex flex-col items-center justify-center gap-4">
        <LogoWordmark className="text-xl sm:text-2xl" />
        <div className="flex items-center gap-2 text-gray-400 dark:text-zinc-500">
          <Loader2 className="w-4 h-4 animate-spin text-orange-500" />
          <span className="text-sm">Chargement…</span>
        </div>
      </div>
    );
  }

  return children;
}
