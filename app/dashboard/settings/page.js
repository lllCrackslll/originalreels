"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Settings, User, Save, Loader2 } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const [name, setName] = useState(user?.displayName || "");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    await new Promise((r) => setTimeout(r, 800));
    setSaving(false);
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <Settings className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">Paramètres</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">Mon compte</h1>
        <p className="text-gray-500 text-sm mt-1.5">Gérez vos informations personnelles.</p>
      </div>

      {/* Avatar */}
      <div className="flex items-center gap-4 mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100">
        {user?.photoURL ? (
          <img src={user.photoURL} alt="" className="w-14 h-14 rounded-full object-cover" />
        ) : (
          <div className="w-14 h-14 rounded-full bg-orange-100 flex items-center justify-center">
            <User className="w-7 h-7 text-orange-500" />
          </div>
        )}
        <div>
          <p className="text-sm font-semibold text-black">{user?.displayName || "Utilisateur"}</p>
          <p className="text-xs text-gray-400">{user?.email}</p>
          <p className="text-xs text-orange-500 mt-1">Plan Gratuit</p>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-5">
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">Nom complet</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full px-4 py-3 border border-gray-200 hover:border-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 rounded-xl text-sm text-black transition-all duration-200 bg-white"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-black mb-1.5">Adresse email</label>
          <input
            type="email"
            value={user?.email || ""}
            disabled
            className="w-full px-4 py-3 border border-gray-100 rounded-xl text-sm text-gray-400 bg-gray-50 cursor-not-allowed"
          />
          <p className="text-xs text-gray-400 mt-1.5">L&apos;email ne peut pas être modifié.</p>
        </div>

        <button
          type="submit"
          disabled={saving}
          className="btn-glow flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl transition-all duration-200"
        >
          {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
          {saving ? "Enregistrement…" : saved ? "✓ Sauvegardé !" : "Enregistrer"}
        </button>
      </form>
    </div>
  );
}
