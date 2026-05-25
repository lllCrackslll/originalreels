"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import {
  auth,
  googleProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  updateProfile,
  sendEmailVerification,
} from "@/lib/firebase";
import { Eye, EyeOff, ArrowRight, Loader2, Check, AlertCircle } from "lucide-react";
import LogoWordmark from "@/components/LogoWordmark";
import ThemeToggle from "@/components/ThemeToggle";

const PERKS = [
  "2 vidéos gratuites dès l'inscription",
  "Traitement 100% local — vos vidéos restent chez vous",
  "Aucune carte bancaire requise",
];

const FIREBASE_ERRORS = {
  "auth/email-already-in-use": "Un compte existe déjà avec cet email.",
  "auth/weak-password": "Le mot de passe doit contenir au moins 6 caractères.",
  "auth/invalid-email": "Adresse email invalide.",
};

export default function SignupPage() {
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e) =>
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));

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
    if (!form.name.trim()) { setError("Veuillez entrer votre nom."); return; }
    setLoading(true);
    setError("");
    try {
      const { user } = await createUserWithEmailAndPassword(auth, form.email, form.password);
      await updateProfile(user, { displayName: form.name.trim() });
      await sendEmailVerification(user);
      router.push("/dashboard");
    } catch (err) {
      setError(FIREBASE_ERRORS[err.code] || "Une erreur est survenue.");
    } finally {
      setLoading(false);
    }
  };

  const passwordStrength = () => {
    const p = form.password;
    if (p.length === 0) return null;
    if (p.length < 6) return { label: "Trop court", color: "bg-red-400", width: "w-1/4" };
    if (p.length < 10) return { label: "Moyen", color: "bg-orange-400", width: "w-2/4" };
    if (!/[A-Z]/.test(p) || !/[0-9]/.test(p)) return { label: "Bien", color: "bg-yellow-400", width: "w-3/4" };
    return { label: "Excellent", color: "bg-green-400", width: "w-full" };
  };

  const strength = passwordStrength();

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
            Déjà un compte ?{" "}
            <Link href="/login" className="text-orange-500 font-medium hover:underline underline-offset-2">
              Se connecter
            </Link>
          </p>
        </div>
      </header>

      <main className="relative z-10 flex-1 flex items-center justify-center px-4 sm:px-6 py-8 sm:py-12">
        <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16 items-center">

          {/* Pitch — desktop */}
          <div className="hidden lg:block">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-orange-600 text-xs font-medium mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse" />
              Gratuit pour commencer
            </div>
            <h2 className="text-4xl font-bold text-black tracking-tight leading-tight mb-4">
              Postez plus.<br />Soyez vus partout.
            </h2>
            <p className="text-gray-500 text-base leading-relaxed mb-8">
              Rejoignez les créateurs qui utilisent OriginalReels pour multiplier leur portée sur Instagram sans risquer le shadowban.
            </p>
            <div className="space-y-3">
              {PERKS.map((perk) => (
                <div key={perk} className="flex items-center gap-3">
                  <div className="w-5 h-5 rounded-full bg-orange-100 flex items-center justify-center flex-shrink-0">
                    <Check className="w-3 h-3 text-orange-500" strokeWidth={3} />
                  </div>
                  <span className="text-sm text-gray-600">{perk}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Formulaire */}
          <div>
            <div className="mb-7">
              <h1 className="text-3xl font-bold text-black tracking-tight mb-2">Créer un compte</h1>
              <p className="text-gray-500 text-base">Prêt en moins de 30 secondes.</p>
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

            {error && (
              <div className="flex items-start gap-2.5 p-3.5 bg-red-50 border border-red-100 rounded-xl mb-4">
                <AlertCircle className="w-4 h-4 text-red-500 mt-0.5 flex-shrink-0" />
                <p className="text-sm text-red-600">{error}</p>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Nom complet</label>
                <input
                  type="text"
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jean Dupont"
                  required
                  className="w-full px-4 py-3 border border-gray-200 hover:border-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 rounded-xl text-sm text-black placeholder-gray-300 transition-all duration-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Adresse email</label>
                <input
                  type="email"
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="vous@exemple.com"
                  required
                  className="w-full px-4 py-3 border border-gray-200 hover:border-gray-400 focus:border-orange-400 focus:outline-none focus:ring-2 focus:ring-orange-100 rounded-xl text-sm text-black placeholder-gray-300 transition-all duration-200 bg-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-black mb-1.5">Mot de passe</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    placeholder="Minimum 6 caractères"
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
                {strength && (
                  <div className="mt-2 space-y-1">
                    <div className="h-1 bg-gray-100 rounded-full overflow-hidden">
                      <div className={`h-full rounded-full transition-all duration-300 ${strength.color} ${strength.width}`} />
                    </div>
                    <p className="text-xs text-gray-400">{strength.label}</p>
                  </div>
                )}
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn-glow w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 disabled:cursor-not-allowed text-white font-semibold text-sm rounded-xl flex items-center justify-center gap-2 transition-all duration-200 mt-1"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                  <>Créer mon compte gratuit <ArrowRight className="w-4 h-4" /></>
                )}
              </button>
            </form>

            <p className="text-center text-xs text-gray-400 mt-5">
              En vous inscrivant, vous acceptez nos{" "}
              <button className="text-gray-500 hover:text-black underline underline-offset-2">CGU</button>{" "}
              et notre{" "}
              <button className="text-gray-500 hover:text-black underline underline-offset-2">Politique de confidentialité</button>.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
