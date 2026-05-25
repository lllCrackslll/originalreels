"use client";

import { Hash, Eye, Database, Shuffle, Clock, Lock } from "lucide-react";

const FEATURES = [
  {
    icon: Hash,
    title: "Empreinte visuelle unique",
    description:
      "Chaque vidéo traitée reçoit une signature numérique entièrement différente de l'originale, invisible à l'œil mais détectée comme un contenu nouveau par les algorithmes.",
    tag: "Algorithme",
  },
  {
    icon: Eye,
    title: "Transformation imperceptible",
    description:
      "Nos modifications sont 100% invisibles pour vos abonnés. La qualité visuelle et sonore est préservée intégralement — seule la machine voit la différence.",
    tag: "Qualité",
  },
  {
    icon: Database,
    title: "Nettoyage des marqueurs cachés",
    description:
      "Chaque fichier vidéo contient des informations cachées qui peuvent le trahir. OriginalReels les efface automatiquement avant que vous ne postiez.",
    tag: "Confidentialité",
  },
  {
    icon: Clock,
    title: "Traitement en moins de 30 secondes",
    description:
      "Notre moteur de traitement optimisé transforme votre vidéo en quelques secondes directement dans votre navigateur, sans attendre de file d'attente.",
    tag: "Rapidité",
  },
  {
    icon: Shuffle,
    title: "Multi-couches de protection",
    description:
      "OriginalReels applique plusieurs niveaux de transformation simultanément pour maximiser la protection contre tous les systèmes de détection de contenu dupliqué.",
    tag: "Protection",
  },
  {
    icon: Lock,
    title: "Vos vidéos restent chez vous",
    description:
      "Le traitement s'effectue entièrement dans votre navigateur. Vos vidéos ne transitent jamais par nos serveurs — zéro risque de fuite ou d'interception.",
    tag: "Sécurité",
  },
];

export default function Features() {
  return (
    <section id="features" className="py-14 sm:py-24 px-4 sm:px-6 bg-gray-50/50 border-y border-gray-100">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium mb-4">
            Comprendre la technologie
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-black tracking-tight mb-4">
            Pourquoi ça fonctionne vraiment
          </h2>
          <p className="text-gray-500 max-w-xl mx-auto text-base leading-relaxed">
            OriginalReels agit au niveau des fréquences spatiales et temporelles — là où
            les algorithmes de détection d&apos;Instagram opèrent réellement.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map(({ icon: Icon, title, description, tag }) => (
            <div
              key={title}
              className="group bg-white rounded-2xl p-6 border border-gray-100 hover:border-orange-200 hover:shadow-sm transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="w-10 h-10 rounded-xl bg-orange-50 group-hover:bg-orange-100 flex items-center justify-center transition-colors duration-300">
                  <Icon className="w-5 h-5 text-orange-500" />
                </div>
                <span className="text-xs font-medium text-gray-400 bg-gray-50 px-2.5 py-1 rounded-full">
                  {tag}
                </span>
              </div>
              <h3 className="text-sm font-semibold text-black mb-2 leading-snug">
                {title}
              </h3>
              <p className="text-sm text-gray-500 leading-relaxed">{description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
