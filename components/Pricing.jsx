"use client";

import { Check, Zap } from "lucide-react";

const PLANS = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    description: "Parfait pour tester OriginalReels sans engagement.",
    features: [
      "2 vidéos / mois",
      "Nettoyage métadonnées",
      "Inversion miroir",
      "Traitement local (WASM)",
      "Export MP4 HD",
    ],
    cta: "Commencer gratuitement",
    highlighted: false,
  },
  {
    name: "Pro",
    price: "19€",
    period: "/ mois",
    description: "Pour les créateurs sérieux qui postent en volume.",
    features: [
      "Vidéos illimitées",
      "Toutes les transformations",
      "Retiming avancé",
      "Ajustement colorimétrique",
      "Traitement prioritaire",
      "Export jusqu'à 4K",
      "Support email 24h",
    ],
    cta: "Commencer avec Pro",
    highlighted: true,
  },
  {
    name: "Agence",
    price: "49€",
    period: "/ mois",
    description: "Conçu pour les agences gérant plusieurs clients.",
    features: [
      "Tout le plan Pro",
      "Jusqu'à 10 membres d'équipe",
      "Traitement par lot (batch)",
      "API REST (beta)",
      "Tableau de bord analytics",
      "Intégration Zapier",
      "Support dédié SLA 4h",
    ],
    cta: "Contacter les ventes",
    highlighted: false,
  },
];

export default function Pricing() {
  return (
    <section id="pricing" className="py-14 sm:py-24 px-4 sm:px-6 bg-white dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-10 sm:mb-16">
          <span className="inline-block px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/50 border border-orange-200 dark:border-orange-900 text-orange-600 dark:text-orange-400 text-xs font-medium mb-4">
            Tarifs
          </span>
          <h2 className="text-3xl sm:text-4xl font-bold text-black dark:text-white tracking-tight mb-4">
            Simple, transparent, sans surprise
          </h2>
          <p className="text-gray-500 dark:text-zinc-400 max-w-md mx-auto text-base">
            Commencez gratuitement. Passez au niveau supérieur quand vous en avez besoin.
          </p>
        </div>

        <div className="flex md:grid md:grid-cols-3 gap-5 overflow-x-auto pb-4 md:pb-0 -mx-4 px-4 md:mx-0 md:px-0 snap-x snap-mandatory md:snap-none [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {PLANS.map((plan) => (
            <div
              key={plan.name}
              className={`relative rounded-2xl p-6 sm:p-7 border transition-all duration-300 flex-shrink-0 w-[80vw] sm:w-[60vw] md:w-auto snap-start ${
                plan.highlighted
                  ? "border-orange-300 dark:border-orange-700 bg-white dark:bg-zinc-900 shadow-[0_0_40px_rgba(249,115,22,0.12)] dark:shadow-[0_0_40px_rgba(249,115,22,0.08)]"
                  : "border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 hover:border-gray-300 dark:hover:border-zinc-600 hover:shadow-sm"
              }`}
            >
              {plan.highlighted && (
                <div className="flex justify-center mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-500 text-white text-xs font-bold rounded-full whitespace-nowrap shadow-sm">
                    <Zap className="w-3 h-3" />
                    Le plus populaire
                  </span>
                </div>
              )}

              <div className="mb-6">
                <p className="text-sm font-semibold text-gray-400 uppercase tracking-widest mb-2">
                  {plan.name}
                </p>
                <div className="flex items-end gap-1.5 mb-2">
                  <span className="text-4xl font-bold text-black dark:text-white tracking-tight">
                    {plan.price}
                  </span>
                  <span className="text-gray-400 text-sm mb-1.5">{plan.period}</span>
                </div>
                <p className="text-sm text-gray-500 dark:text-zinc-400 leading-relaxed">{plan.description}</p>
              </div>

              <button
                className={`w-full py-3 rounded-xl text-sm font-semibold mb-6 transition-all duration-200 ${
                  plan.highlighted
                    ? "btn-glow bg-orange-500 hover:bg-orange-600 text-white"
                    : "border border-gray-200 dark:border-zinc-700 hover:border-gray-400 dark:hover:border-zinc-500 text-gray-700 dark:text-zinc-300 hover:text-black dark:hover:text-white"
                }`}
              >
                {plan.cta}
              </button>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2.5">
                    <div
                      className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${
                        plan.highlighted ? "bg-orange-100 dark:bg-orange-950" : "bg-gray-100 dark:bg-zinc-800"
                      }`}
                    >
                      <Check
                        className={`w-2.5 h-2.5 ${
                          plan.highlighted ? "text-orange-500" : "text-gray-500"
                        }`}
                        strokeWidth={3}
                      />
                    </div>
                    <span className="text-sm text-gray-600 dark:text-zinc-400">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        <p className="text-center text-xs text-gray-400 mt-8">
          Tous les plans incluent un traitement 100% local dans votre navigateur.
          Aucune vidéo ne transite par nos serveurs.
        </p>
      </div>
    </section>
  );
}
