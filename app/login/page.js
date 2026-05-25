"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  auth,
  googleProvider,
  signInWithPopup,
  signInWithEmailAndPassword,
  sendPasswordResetEmail,
} from "@/lib/firebase";
import { Eye, EyeOff, ArrowRight, Loader2, AlertCircle } from "lucide-react";
import LogoWordmark from "@/components/LogoWordmark";
import ThemeToggle from "@/components/ThemeToggle";

const FIREBASE_ERRORS = {
  "auth/user-not-found": "Aucun compte trouvé avec cet email.",
  "auth/wrong-password": "Mot de passe incorrect.",
  "auth/invalid-credential": "Email ou mot de passe incorrect.",
  "auth/invalid-email": "Adresse email invalide.",
  "auth/too-many-requests": "Trop de tentatives. Réessayez dans quelques minutes.",
  "auth/user-disabled": "Ce compte a été désactivé.",
};

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");
  const [resetSent, setResetSent] = useState(false);

  const handleGoogleSignIn = async () => {
    setLoadingGoogle(true);
    setError("");
    try {
      await signInWithPopup(auth, googleProvider);
      router.push("/dashboard");
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || "Erreur Google. Réessayez.");
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await signInWithEmailAndPassword(auth, email, password);
      router.push("/dashboard");
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const handlePasswordReset = async () => {
    if (!email) {
      setError("Entrez votre email ci-dessus pour recevoir le lien de réinitialisation.");
      return;
    }
    try {
      await sendPasswordResetEmail(auth, email);
      setResetSent(true);
      setError("");
    } catch {
      setError("Impossible d'envoyer l'email. Vérifiez l'adresse saisie.");
    }
  };

  return (
    <div className="relative min-h-screen bg-white dark:bg-zinc-950 flex flex-col transition-colors duration-200">
      <div className="fixed inset-0 pointer-events-none bg-grid-pattern hidden dark:block" aria-hidden />
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background: "radial-gradient(ellipse 60% 40% at 50% 20%, rgba(249,115,22,0.05) 0%, transparent 70%)",
        }}
      />

      <header className="relative z-10 flex items-center justify-between px-4 sm:px-6 py-4 sm:py-5 max-w-6xl mx-auto w-full">
        <Link href="/">
          <LogoWordmark className="text-lg" />
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <p className="text-sm text-gray-400">
            Pas encore de compte ?{" "}
            <Link href="/signup" className="text-orange-500 font-medium hover:underline underline-offset-2">
              S&apos;inscrire
            </Link>
          </p>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-black tracking-tight mb-2">Bon retour 👋</h1>
            <p className="text-gray-500 text-base">Connectez-vous pour accéder à vos vidéos traitées.</p>
          </div>

          {/* Google */}
          <button
            onClick={handleGoogleSignIn}
            disabled={loadingGoogle}
            className="w-full flex items-center justify-center gap-3 px-4 py-3 border border-gray-200 hover:border-gray-400 rounded-xl text-sm font-medium text-gray-700 hover:text-black disabled:opacity-60 disabled:cursor-not-allowed transition-all duration-200 mb-5"
          >
            {loadingGoogle ? (
              <Loader2 className="w-4 h-4 animate-spin text-gray-400" />
            ) : (
              <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
            )}
            {loadingGoogle ? "Connexion…" : "Continuer avec Google"}
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-100" />
            <span className="text-xs text-gray-400 font-medium">ou avec email</span>
            <div className="flex-1 h-px bg-gray-100" />
          </div>

          {/* Message d'erreur */}
          {error && (
            <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-4">
              <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}

          {/* Email envoyé */}
          {resetSent && (
            <div className="p-3.5 bg-green-50 border border-green-100 rounded-xl mb-4">
              <p className="text-sm text-green-700">
                ✓ Email de réinitialisation envoyé à <strong>{email}</strong>
              </p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1.5">Adresse email</label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="vous@exemple.com"
                required
                className="w-full px-4 py-3 border border-gray-200 hover:border-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 rounded-xl text-sm text-black placeholder-gray-300 transition-all duration-200 bg-white"
              />
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-sm font-medium text-black">Mot de passe</label>
                <button
                  type="button"
                  onClick={handlePasswordReset}
                  className="text-xs text-orange-500 hover:underline underline-offset-2"
                >
                  Mot de passe oublié ?
                </button>
              </div>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full px-4 py-3 pr-11 border border-gray-200 hover:border-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 rounded-xl text-sm text-black placeholder-gray-300 transition-all duration-200 bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-300 hover:text-gray-500 transition-colors"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-glow w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-200 mt-2"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                <>Se connecter <ArrowRight className="w-4 h-4" /></>
              )}
            </button>
          </form>

          <p className="text-center text-xs text-gray-400 mt-6">
            En vous connectant, vous acceptez nos{" "}
            <button className="text-gray-500 hover:text-black underline underline-offset-2">CGU</button>{" "}
            et notre{" "}
            <button className="text-gray-500 hover:text-black underline underline-offset-2">Politique de confidentialité</button>.
          </p>
        </div>
      </main>
    </div>
  );
}
