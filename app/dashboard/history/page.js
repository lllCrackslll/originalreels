import { History, VideoOff } from "lucide-react";

export default function HistoryPage() {
  return (
    <div className="px-4 sm:px-8 py-8 max-w-3xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <History className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Historique</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Vos vidéos traitées</h1>
        <p className="text-gray-500 text-sm mt-1.5">Retrouvez et re-téléchargez toutes vos vidéos générées.</p>
      </div>

      <div className="flex flex-col items-center justify-center py-24 text-center border-2 border-dashed border-gray-200 rounded-2xl">
        <div className="w-14 h-14 bg-gray-100 rounded-2xl flex items-center justify-center mb-4">
          <VideoOff className="w-6 h-6 text-gray-400" />
        </div>
        <p className="text-sm font-medium text-black mb-1">Aucune vidéo traitée pour l&apos;instant</p>
        <p className="text-xs text-gray-400">Traitez votre première vidéo depuis l&apos;onglet Traitement.</p>
        <a href="/dashboard" className="mt-5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-xs font-semibold rounded-lg transition-colors">
          Traiter une vidéo
        </a>
      </div>
    </div>
  );
}
