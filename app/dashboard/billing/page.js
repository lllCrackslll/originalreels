import { CreditCard, Check, Zap } from "lucide-react";

const PLANS = [
  {
    name: "Gratuit",
    price: "0€",
    period: "pour toujours",
    features: ["2 vidéos / mois", "Toutes les transformations", "Traitement local"],
    cta: "Plan actuel",
    current: true,
    highlighted: false,
  },
  {
    name: "Pro",
    price: "19€",
    period: "/ mois",
    features: ["Vidéos illimitées", "Toutes les transformations", "Export 4K", "Support email 24h"],
    cta: "Passer au Pro",
    current: false,
    highlighted: true,
  },
  {
    name: "Agence",
    price: "49€",
    period: "/ mois",
    features: ["Tout le plan Pro", "10 membres d'équipe", "API REST", "Support dédié SLA 4h"],
    cta: "Contacter les ventes",
    current: false,
    highlighted: false,
  },
];

export default function BillingPage() {
  return (
    <div className="px-4 sm:px-8 py-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <CreditCard className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Abonnement</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Gérer mon plan</h1>
        <p className="text-gray-500 text-sm mt-1.5">Vous êtes actuellement sur le plan <strong>Gratuit</strong>.</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {PLANS.map((plan) => (
          <div
            key={plan.name}
            className={`relative rounded-2xl p-6 border transition-all duration-300 ${
              plan.highlighted
                ? "border-orange-300 shadow-[0_0_30px_rgba(249,115,22,0.1)]"
                : plan.current
                ? "border-gray-300 bg-gray-50"
                : "border-gray-200"
            } bg-white`}
          >
            {plan.highlighted && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-full">
                  <Zap className="w-3 h-3" /> Recommandé
                </span>
              </div>
            )}
            <p className="text-xs font-semibold text-gray-400 uppercase tracking-widest mb-1">{plan.name}</p>
            <div className="flex items-end gap-1 mb-4">
              <span className="text-3xl font-bold text-black">{plan.price}</span>
              <span className="text-gray-400 text-sm mb-1">{plan.period}</span>
            </div>
            <div className="space-y-2 mb-6">
              {plan.features.map((f) => (
                <div key={f} className="flex items-center gap-2">
                  <div className={`w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 ${plan.highlighted ? "bg-orange-100" : "bg-gray-100"}`}>
                    <Check className={`w-2.5 h-2.5 ${plan.highlighted ? "text-orange-500" : "text-gray-500"}`} strokeWidth={3} />
                  </div>
                  <span className="text-xs text-gray-600">{f}</span>
                </div>
              ))}
            </div>
            <button
              disabled={plan.current}
              className={`w-full py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 ${
                plan.current
                  ? "bg-gray-100 text-gray-400 cursor-default"
                  : plan.highlighted
                  ? "btn-glow bg-orange-500 hover:bg-orange-600 text-white"
                  : "border border-gray-200 hover:border-gray-400 text-gray-700"
              }`}
            >
              {plan.cta}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
