import Link from "next/link";
import { Monitor, Zap } from "lucide-react";

export default function DashboardMobileNotice() {
  return (
    <div className="md:hidden flex flex-col items-center justify-center min-h-screen w-full px-6 py-12 bg-gray-50 dark:bg-zinc-950 text-center transition-colors duration-200">
      <div className="w-14 h-14 bg-orange-100 rounded-2xl flex items-center justify-center mb-6">
        <Monitor className="w-7 h-7 text-orange-500" />
      </div>
      <h1 className="text-xl font-bold text-black dark:text-white tracking-tight mb-2">
        Dashboard disponible sur ordinateur
      </h1>
      <p className="text-sm text-gray-500 max-w-sm leading-relaxed">
        Le traitement vidéo (FFmpeg) nécessite un navigateur de bureau.
        Ouvrez OriginalReels sur Chrome ou Edge depuis un PC ou Mac pour
        générer vos déclinaisons.
      </p>
      <Link
        href="/"
        className="mt-8 inline-flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-xl transition-colors"
      >
        <Zap className="w-4 h-4" />
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
