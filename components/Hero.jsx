"use client";

import Link from "next/link";
import { ArrowRight, Shield, Zap, Eye } from "lucide-react";

export default function Hero() {

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center pt-16 overflow-hidden">
      {/* Background Glow — gradient radial orange très diffus */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background:
            "radial-gradient(ellipse 80% 50% at 50% 40%, rgba(249,115,22,0.06) 0%, transparent 70%)",
        }}
      />

      {/* Décoration grille subtile — s'adapte au mode clair / sombre */}
      <div className="absolute inset-0 pointer-events-none bg-grid-pattern" />

      <div className="relative z-10 max-w-4xl mx-auto px-6 text-center">
        {/* Pill badge */}
        <div className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-orange-200 dark:border-orange-900 bg-orange-50 dark:bg-orange-950/50 text-orange-600 dark:text-orange-400 text-xs sm:text-sm font-medium mb-8">
          <Shield className="w-3 h-3 sm:w-3.5 sm:h-3.5 flex-shrink-0" />
          <span>Technologie Anti-Shadowban · Hachage pixel unique</span>
        </div>

        {/* Titre */}
        <h1 className="text-4xl sm:text-6xl lg:text-7xl font-bold text-black dark:text-white tracking-tight leading-[1.05] mb-5">
          Multipliez vos Reels.{" "}
          <span className="text-orange-500">Zéro Shadowban.</span>
        </h1>

        {/* Sous-titre */}
        <p className="text-base sm:text-xl text-gray-500 dark:text-zinc-400 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed">
          Modifiez instantanément l&apos;empreinte visuelle et les métadonnées de vos
          vidéos pour alimenter vos différents comptes sans être bloqué par
          l&apos;algorithme d&apos;Instagram.
        </p>

        {/* CTA buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 mb-12 sm:mb-16 w-full max-w-sm sm:max-w-none mx-auto">
          <Link
            href="/dashboard"
            className="btn-glow inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl text-base transition-all duration-200"
          >
            Commencer gratuitement
            <ArrowRight className="w-4 h-4" />
          </Link>
          <a
            href="#features"
            className="px-8 py-3.5 border border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white font-medium rounded-xl text-base transition-all duration-200 text-center"
          >
            Voir comment ça marche
          </a>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 sm:flex sm:flex-row items-center justify-center gap-4 sm:gap-12 text-center">
          {[
            { icon: Zap, value: "< 30s", label: "Traitement moyen" },
            { icon: Eye, value: "100%", label: "Imperceptible" },
            { icon: Shield, value: "4 couches", label: "De protection" },
          ].map(({ icon: Icon, value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <div className="flex items-center gap-1 sm:gap-1.5">
                <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-orange-500" />
                <span className="text-lg sm:text-2xl font-bold text-black dark:text-white">{value}</span>
              </div>
              <span className="text-xs sm:text-sm text-gray-400 dark:text-zinc-500">{label}</span>
            </div>
          ))}
        </div>
      </div>

    </section>
  );
}
