"use client";

import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import {
  auth,
  EmailAuthProvider,
  reauthenticateWithCredential,
  updatePassword,
  sendPasswordResetEmail,
} from "@/lib/firebase";
import {
  Settings,
  Lock,
  Loader2,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

function getPasswordErrorMessage(code) {
  switch (code) {
    case "auth/wrong-password":
    case "auth/invalid-credential":
      return "Mot de passe actuel incorrect.";
    case "auth/weak-password":
      return "Le nouveau mot de passe doit contenir au moins 6 caractères.";
    case "auth/requires-recent-login":
      return "Reconnectez-vous, puis réessayez de changer votre mot de passe.";
    case "auth/too-many-requests":
      return "Trop de tentatives. Réessayez dans quelques minutes.";
    default:
      return "Impossible de modifier le mot de passe. Réessayez.";
  }
}

export default function SettingsPage() {
  const { user } = useAuth();
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [resetSent, setResetSent] = useState(false);

  const usesEmailPassword = user?.providerData?.some(
    (p) => p.providerId === "password"
  );
  const usesGoogleOnly =
    user?.providerData?.length > 0 &&
    user.providerData.every((p) => p.providerId === "google.com");

  const handleChangePassword = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);

    if (newPassword.length < 6) {
      setError("Le nouveau mot de passe doit contenir au moins 6 caractères.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Les deux mots de passe ne correspondent pas.");
      return;
    }

    setSaving(true);
    try {
      const credential = EmailAuthProvider.credential(
        user.email,
        currentPassword
      );
      await reauthenticateWithCredential(auth.currentUser, credential);
      await updatePassword(auth.currentUser, newPassword);

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Mot de passe mis à jour avec succès.");
      setTimeout(() => setSuccess(null), 5000);
    } catch (err) {
      setError(getPasswordErrorMessage(err?.code));
    } finally {
      setSaving(false);
    }
  };

  const handleResetEmail = async () => {
    if (!user?.email) return;
    setError(null);
    setSuccess(null);
    setSaving(true);
    try {
      await sendPasswordResetEmail(auth, user.email);
      setResetSent(true);
      setSuccess("Un lien de réinitialisation a été envoyé à votre adresse email.");
      setTimeout(() => setSuccess(null), 8000);
    } catch {
      setError("Impossible d'envoyer l'email de réinitialisation.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="px-4 sm:px-8 py-8 max-w-xl mx-auto">
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-1.5">
          <Settings className="w-4 h-4 text-orange-500" />
          <span className="text-xs font-semibold text-orange-500 uppercase tracking-widest">
            Paramètres
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-black tracking-tight">
          Mon compte
        </h1>
        <p className="text-gray-500 text-sm mt-1.5">
          Gérez la sécurité de votre compte.
        </p>
      </div>

      {/* Infos compte */}
      <div className="mb-8 p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Adresse email
          </label>
          <p className="text-sm font-medium text-black">{user?.email}</p>
          <p className="text-xs text-gray-400 mt-1">
            L&apos;email ne peut pas être modifié ici.
          </p>
        </div>
        <div>
          <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5">
            Abonnement
          </label>
          <p className="text-sm font-medium text-orange-600">Plan Gratuit</p>
        </div>
      </div>

      {/* Mot de passe */}
      <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-1">
          <Lock className="w-4 h-4 text-orange-500" />
          <h2 className="text-sm font-semibold text-black">Mot de passe</h2>
        </div>

        {usesGoogleOnly ? (
          <div className="mt-4 space-y-4">
            <p className="text-sm text-gray-500">
              Vous vous connectez avec Google. Votre mot de passe est géré par
              votre compte Google.
            </p>
            {user?.email && (
              <button
                type="button"
                onClick={handleResetEmail}
                disabled={saving || resetSent}
                className="text-sm font-medium text-orange-500 hover:text-orange-600 disabled:text-gray-400 transition-colors"
              >
                {resetSent
                  ? "Email envoyé"
                  : "Définir un mot de passe par email"}
              </button>
            )}
          </div>
        ) : usesEmailPassword ? (
          <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
            <div>
              <label
                htmlFor="current-password"
                className="block text-sm font-medium text-black mb-1.5"
              >
                Mot de passe actuel
              </label>
              <input
                id="current-password"
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-200 hover:border-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 rounded-xl text-sm text-black transition-all duration-200 bg-white disabled:opacity-60"
              />
            </div>
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-black mb-1.5"
              >
                Nouveau mot de passe
              </label>
              <input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-200 hover:border-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 rounded-xl text-sm text-black transition-all duration-200 bg-white disabled:opacity-60"
              />
            </div>
            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-black mb-1.5"
              >
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirm-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                minLength={6}
                disabled={saving}
                className="w-full px-4 py-3 border border-gray-200 hover:border-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 rounded-xl text-sm text-black transition-all duration-200 bg-white disabled:opacity-60"
              />
            </div>

            <button
              type="submit"
              disabled={saving}
              className="btn-glow flex items-center gap-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white text-sm font-semibold rounded-xl transition-all duration-200"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Lock className="w-4 h-4" />
              )}
              {saving ? "Mise à jour…" : "Changer le mot de passe"}
            </button>
          </form>
        ) : (
          <p className="text-sm text-gray-500 mt-4">
            Aucune méthode de connexion par mot de passe associée à ce compte.
          </p>
        )}
      </div>

      {error && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-red-50 border border-red-100 rounded-xl">
          <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-red-600">{error}</p>
        </div>
      )}

      {success && (
        <div className="mt-4 flex items-start gap-3 p-4 bg-green-50 border border-green-100 rounded-xl">
          <CheckCircle2 className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-green-700">{success}</p>
        </div>
      )}
    </div>
  );
}
