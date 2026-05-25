"use client";

import LogoWordmark from "@/components/LogoWordmark";

export default function Footer() {
  return (
    <footer className="border-t border-gray-100 dark:border-zinc-800 py-8 sm:py-10 px-4 sm:px-6 bg-white dark:bg-zinc-950 transition-colors duration-200">
      <div className="max-w-6xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4 text-center sm:text-left">
        <LogoWordmark className="text-base sm:text-lg" />

        <p className="text-xs text-gray-400 text-center">
          © 2026 OriginalReels · Traitement vidéo 100% local · Anti-shadowban
        </p>

        <div className="flex items-center gap-5">
          {["Confidentialité", "CGU", "Contact"].map((item) => (
            <button
              key={item}
              className="text-xs text-gray-400 hover:text-black dark:hover:text-white transition-colors duration-200"
            >
              {item}
            </button>
          ))}
        </div>
      </div>
    </footer>
  );
}
