import Uploader from "@/components/Uploader";
import { Sparkles } from "lucide-react";

export default function DashboardPage() {
  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <Sparkles className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">
            Traitement vidéo
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black dark:text-white tracking-tight">
          Générer une vidéo originale
        </h1>
        <p className="text-gray-500 dark:text-zinc-400 text-sm mt-1.5">
          Déposez votre Reel ou Short, choisissez le nombre de déclinaisons (1 à 10) et générez votre pack.
        </p>
      </div>

      {/* Quota */}
      <div className="flex items-center justify-between px-4 py-3 bg-orange-50 dark:bg-orange-950/40 border border-orange-100 dark:border-orange-900 rounded-2xl mb-8">
        <div>
          <p className="text-xs font-semibold text-orange-800">Plan Gratuit</p>
          <p className="text-xs text-orange-600 mt-0.5">0 / 2 vidéos utilisées ce mois-ci</p>
        </div>
        <a
          href="/dashboard/billing"
          className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors"
        >
          Passer au Pro
        </a>
      </div>

      {/* Zone de traitement */}
      <Uploader />
    </div>
  );
}
